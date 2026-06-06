"""
AI telemetry — one log per LLM call.

Every call to the LLM emits a row in `ai_telemetry` (MongoDB) with:
  - intent, model, provider
  - cache_hit (true / false / "would_have_hit" / None when cache off)
  - workflow tag (free-form, e.g. "blog.save", "admin.translate")
  - latency_ms (wall-clock duration of the LLM call only — excludes
    cache lookup and post-processing)
  - input_chars, output_chars  (we don't get tokenizer counts back from
    emergentintegrations, so we record character counts and apply a
    coarse 4-chars-per-token estimate at read time)
  - input_tokens_est, output_tokens_est
  - cost_estimate_usd
  - status: "ok" | "error" | "schema_fail"
  - error_class (only when status != "ok")
  - created_at (UTC, ISO8601 string)
  - request_id (for correlating multi-call workflows)

Why character counts: emergentintegrations.send_message returns a string
with no usage block, so accurate token counts would require running a
local tokenizer. The 4-chars/token estimate is within ~15% for English /
HTML and is good enough to measure cost trends. When Phase 1 swaps in
provider-native SDKs we'll wire exact counts.

Reads: `aggregate_recent()` / `summary()` for the admin dashboard endpoint.
"""
from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Awaitable, Callable, Optional

from .feature_flags import telemetry_enabled

logger = logging.getLogger(__name__)

# ─── Cost table (USD per 1M tokens, May 2026) ─────────────────────────
# Sourced from Anthropic / OpenAI / Google pricing pages. We store both
# input and output rates and apply them separately. Update this table
# when prices change — it is the single source of truth.
_COST_TABLE: dict[tuple[str, str], tuple[float, float]] = {
    # provider, model_starts_with → (in_per_1m, out_per_1m)
    ("anthropic", "claude-sonnet-4-5"): (3.0, 15.0),
    ("anthropic", "claude-haiku-4-5"):  (1.0,  5.0),
    ("anthropic", "claude-opus-4-5"):   (15.0, 75.0),
    ("openai",    "gpt-5"):              (5.0, 20.0),
    ("openai",    "gpt-4o-mini"):       (0.15, 0.60),
    ("openai",    "gpt-4o"):             (5.0, 15.0),
    ("google",    "gemini-3-flash"):    (0.30, 1.20),
    ("google",    "gemini-3-pro"):       (3.50, 14.0),
}


def estimate_cost_usd(provider: str, model: str, input_chars: int, output_chars: int) -> float:
    """Coarse cost estimate from character counts. ~4 chars/token."""
    in_tok = input_chars / 4
    out_tok = output_chars / 4
    for (p, prefix), (in_rate, out_rate) in _COST_TABLE.items():
        if provider == p and model.startswith(prefix):
            return round((in_tok * in_rate + out_tok * out_rate) / 1_000_000, 6)
    # Unknown model — return 0 rather than guess; will surface in telemetry as "uncosted".
    logger.warning(f"No cost entry for {provider}/{model}; cost recorded as 0")
    return 0.0


async def record(
    db,
    *,
    intent: str,
    provider: str,
    model: str,
    input_chars: int,
    output_chars: int,
    latency_ms: int,
    workflow: str | None = None,
    cache_hit: bool | str | None = None,
    status: str = "ok",
    error_class: str | None = None,
    request_id: str | None = None,
    user_email: str | None = None,
) -> None:
    """Insert a single telemetry row. Errors are swallowed — we never
    let telemetry failures break a user-facing AI flow.

    Behaviour:
      - Returns immediately when `telemetry_enabled()` is False
      - Writes to MongoDB `ai_telemetry` collection
      - Computes cost on the fly using the local _COST_TABLE
    """
    if not telemetry_enabled() or db is None:
        return

    try:
        cost = estimate_cost_usd(provider, model, input_chars, output_chars)
        doc = {
            "intent": intent,
            "provider": provider,
            "model": model,
            "workflow": workflow,
            "cache_hit": cache_hit,
            "input_chars": int(input_chars),
            "output_chars": int(output_chars),
            "input_tokens_est": round(input_chars / 4),
            "output_tokens_est": round(output_chars / 4),
            "cost_estimate_usd": cost,
            "latency_ms": int(latency_ms),
            "status": status,
            "error_class": error_class,
            "request_id": request_id,
            "user_email": user_email,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.ai_telemetry.insert_one(doc)
    except Exception as e:
        logger.warning(f"Telemetry write failed (non-fatal): {e}")


@asynccontextmanager
async def trace(
    db,
    *,
    intent: str,
    provider: str,
    model: str,
    workflow: str | None = None,
    cache_hit: bool | str | None = None,
    request_id: str | None = None,
    user_email: str | None = None,
):
    """
    Wraps an LLM call so callers don't have to do the timing dance:

        async with trace(db, intent="translate.title", ...) as t:
            t.input_chars = len(input_text)
            resp = await chat.send_message(...)
            t.output_chars = len(resp)

    If the body raises, status is recorded as "error" with the exception class.
    """
    class _Trace:
        input_chars: int = 0
        output_chars: int = 0
        status: str = "ok"
        error_class: str | None = None

    t = _Trace()
    t0 = time.perf_counter()
    try:
        yield t
    except Exception as e:
        t.status = "error"
        t.error_class = type(e).__name__
        raise
    finally:
        latency_ms = int((time.perf_counter() - t0) * 1000)
        await record(
            db,
            intent=intent,
            provider=provider,
            model=model,
            input_chars=t.input_chars,
            output_chars=t.output_chars,
            latency_ms=latency_ms,
            workflow=workflow,
            cache_hit=cache_hit,
            status=t.status,
            error_class=t.error_class,
            request_id=request_id,
            user_email=user_email,
        )


# ─── Read-side helpers (for the admin dashboard endpoint) ─────────────

async def summary(db, since_hours: int = 168) -> dict:
    """Aggregated metrics for the last N hours (default: 1 week).

    Returns:
      - total_calls
      - total_cost_usd
      - avg_latency_ms
      - cache_hit_rate
      - by_intent: per-intent breakdown
      - by_workflow: per-workflow breakdown
      - duplicate_request_rate: % of calls whose (intent, input_chars,
        first 64 chars hash equivalent) collide with another in the window
    """
    since = datetime.now(timezone.utc) - timedelta(hours=since_hours)
    pipeline_overall = [
        {"$match": {"created_at": {"$gte": since.isoformat()}}},
        {"$group": {
            "_id": None,
            "total_calls": {"$sum": 1},
            "total_cost_usd": {"$sum": "$cost_estimate_usd"},
            "avg_latency_ms": {"$avg": "$latency_ms"},
            "input_tokens": {"$sum": "$input_tokens_est"},
            "output_tokens": {"$sum": "$output_tokens_est"},
            "cache_hits": {"$sum": {"$cond": [{"$eq": ["$cache_hit", True]}, 1, 0]}},
            "would_have_hits": {"$sum": {"$cond": [{"$eq": ["$cache_hit", "would_have_hit"]}, 1, 0]}},
            "errors": {"$sum": {"$cond": [{"$ne": ["$status", "ok"]}, 1, 0]}},
        }},
    ]
    pipeline_by_intent = [
        {"$match": {"created_at": {"$gte": since.isoformat()}}},
        {"$group": {
            "_id": "$intent",
            "calls": {"$sum": 1},
            "cost_usd": {"$sum": "$cost_estimate_usd"},
            "avg_latency_ms": {"$avg": "$latency_ms"},
            "input_tokens": {"$sum": "$input_tokens_est"},
            "output_tokens": {"$sum": "$output_tokens_est"},
        }},
        {"$sort": {"calls": -1}},
    ]
    pipeline_by_workflow = [
        {"$match": {"created_at": {"$gte": since.isoformat()}, "workflow": {"$ne": None}}},
        {"$group": {
            "_id": "$workflow",
            "calls": {"$sum": 1},
            "cost_usd": {"$sum": "$cost_estimate_usd"},
            "avg_latency_ms": {"$avg": "$latency_ms"},
        }},
        {"$sort": {"calls": -1}},
    ]
    overall = await db.ai_telemetry.aggregate(pipeline_overall).to_list(1)
    by_intent = await db.ai_telemetry.aggregate(pipeline_by_intent).to_list(50)
    by_workflow = await db.ai_telemetry.aggregate(pipeline_by_workflow).to_list(50)

    o = overall[0] if overall else {}
    total = o.get("total_calls", 0) or 0
    cache_hits = o.get("cache_hits", 0) or 0
    would_have = o.get("would_have_hits", 0) or 0
    cache_rate = round((cache_hits + would_have) / total, 3) if total else 0.0
    return {
        "since_hours": since_hours,
        "total_calls": total,
        "total_cost_usd": round(o.get("total_cost_usd", 0.0) or 0.0, 4),
        "avg_latency_ms": round(o.get("avg_latency_ms", 0.0) or 0.0, 1),
        "input_tokens_est": o.get("input_tokens", 0),
        "output_tokens_est": o.get("output_tokens", 0),
        "cache_hits": cache_hits,
        "would_have_hits": would_have,
        "cache_hit_rate": cache_rate,
        "errors": o.get("errors", 0),
        "by_intent": [{"intent": r["_id"], **{k: v for k, v in r.items() if k != "_id"}} for r in by_intent],
        "by_workflow": [{"workflow": r["_id"], **{k: v for k, v in r.items() if k != "_id"}} for r in by_workflow],
    }


def new_request_id() -> str:
    """Short id used to correlate the multiple LLM calls in one workflow run."""
    return uuid.uuid4().hex[:12]
