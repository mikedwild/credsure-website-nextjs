"""
AI cache — instrumented interface, **disabled by default**.

Phase 0 deliberately does not change behaviour. But every LLM call site
asks this module "would you have served this from cache?" and we record
the answer in telemetry as `cache_hit: "would_have_hit"` whenever there
was a previous identical call. That gives us a real cache-hit-rate
projection BEFORE we turn caching on in Phase 1.

When `AI_CACHE_ENABLED=1` we serve from MongoDB `ai_cache` and skip the
LLM entirely on hit.

Key formula: sha256(intent + model + provider + canonical_inputs).
"""
from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Any

from .feature_flags import cache_enabled

logger = logging.getLogger(__name__)

# Per-intent TTL (days). See /app/ai/cache/README.md for rationale.
_TTL_DAYS = {
    "translate.title":            30,
    "translate.excerpt":          30,
    "translate.html_body":        30,
    "translate.tags":             30,
    "translate.seo_title":        30,
    "translate.seo_description":  30,
    "blog.recommend":              1,
    "blog.generate":             None,   # never cache
}


def _canonical(inputs: dict) -> str:
    return json.dumps(inputs, sort_keys=True, ensure_ascii=False)


def make_key(intent: str, provider: str, model: str, inputs: dict) -> str:
    """Deterministic content hash usable as the MongoDB _id."""
    blob = f"{intent}|{provider}|{model}|{_canonical(inputs)}"
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


async def lookup(db, *, intent: str, provider: str, model: str, inputs: dict) -> tuple[str, Any | None]:
    """
    Returns (status, value):
      - ("hit", value)               — cache enabled AND key was found (serve this, skip LLM)
      - ("miss", None)               — cache enabled AND key not found
      - ("would_have_hit", None)     — cache disabled AND key WAS found (telemetry only)
      - ("disabled", None)           — cache disabled AND key not found

    `value` is the original `value` argument from a previous `store()` call.

    Never raises — cache failures fall back to "disabled".
    """
    if db is None:
        return ("disabled", None)
    ttl_days = _TTL_DAYS.get(intent)
    if ttl_days is None and intent.startswith("blog.generate"):
        # Generation is never cached; don't even look.
        return ("disabled", None)

    key = make_key(intent, provider, model, inputs)
    try:
        doc = await db.ai_cache.find_one({"_id": key}, {"value": 1, "created_at": 1})
    except Exception as e:
        logger.warning(f"Cache lookup failed (non-fatal): {e}")
        return ("disabled", None)

    if not doc:
        return ("miss", None) if cache_enabled() else ("disabled", None)

    # Check TTL on read
    if ttl_days is not None:
        try:
            created = datetime.fromisoformat(doc["created_at"])
            if datetime.now(timezone.utc) - created > timedelta(days=ttl_days):
                return ("miss", None) if cache_enabled() else ("disabled", None)
        except Exception:
            pass

    if cache_enabled():
        return ("hit", doc.get("value"))
    return ("would_have_hit", None)


async def store(db, *, intent: str, provider: str, model: str, inputs: dict, value: Any) -> None:
    """Always writes — even when cache is 'disabled' — so that
    `would_have_hit` telemetry remains accurate across deploys. The
    write is fire-and-forget; failures are logged but not raised."""
    if db is None:
        return
    if intent.startswith("blog.generate"):
        return  # generation outputs are never cached
    key = make_key(intent, provider, model, inputs)
    try:
        await db.ai_cache.update_one(
            {"_id": key},
            {"$set": {
                "_id": key,
                "intent": intent,
                "provider": provider,
                "model": model,
                "value": value,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True,
        )
    except Exception as e:
        logger.warning(f"Cache store failed (non-fatal): {e}")
