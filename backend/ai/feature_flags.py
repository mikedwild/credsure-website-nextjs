"""
Feature flags for AI subsystems.

Every AI behaviour shipped to production is gated by an env-var flag so
we can disable a misbehaving feature without redeploying. Defaults are
chosen to preserve current behaviour exactly — flipping an env var to
`0` is the only way to change anything.

Naming convention: `AI_FEATURE_<name>` for user-visible features,
`AI_<subsystem>_ENABLED` for infrastructure switches. All values are
parsed leniently — `1`, `true`, `yes`, `on` all count as enabled.

See /app/ai/ENGINEERING_RULES.md §9.
"""
from __future__ import annotations

import os
from functools import lru_cache

_TRUTHY = {"1", "true", "yes", "on", "enabled"}


def _read(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in _TRUTHY


# ─── Feature gates (default: preserve current behaviour) ──────────────
@lru_cache(maxsize=None)
def auto_translate_on_save() -> bool:
    """Auto-translate missing language on blog save. Default ON."""
    return _read("AI_FEATURE_AUTO_TRANSLATE", True)


@lru_cache(maxsize=None)
def manual_translate() -> bool:
    """Admin → 'Translate' button endpoint. Default ON."""
    return _read("AI_FEATURE_TRANSLATE", True)


@lru_cache(maxsize=None)
def ai_blog_generate() -> bool:
    """POST /api/admin/ai/generate. Default ON."""
    return _read("AI_FEATURE_AI_GENERATE", True)


@lru_cache(maxsize=None)
def ai_blog_recommend() -> bool:
    """POST /api/admin/ai/recommend. Default ON."""
    return _read("AI_FEATURE_AI_RECOMMEND", True)


@lru_cache(maxsize=None)
def ai_image_generate() -> bool:
    """POST /api/admin/blog/images/generate. Default ON."""
    return _read("AI_FEATURE_AI_IMAGE_GENERATE", True)


# ─── Infrastructure switches (default OFF — opt-in for Phase 1) ───────
@lru_cache(maxsize=None)
def telemetry_enabled() -> bool:
    """Record AI call telemetry to MongoDB. Default ON.

    Cheap (one insert per call), already-async; safe to leave on.
    """
    return _read("AI_TELEMETRY_ENABLED", True)


@lru_cache(maxsize=None)
def cache_enabled() -> bool:
    """Use the AI cache for translation/extraction. Default OFF.

    The cache interface is in place (`backend/ai/cache.py`) and records
    'would-have-hit' telemetry even when disabled, so we can measure
    the cache value *before* turning it on in Phase 1.
    """
    return _read("AI_CACHE_ENABLED", False)


@lru_cache(maxsize=None)
def async_jobs_enabled() -> bool:
    """Run auto-translate as a background task. Default OFF.

    Frontend isn't wired to poll for completion yet — Phase 1 turns this
    on. The interface in `backend/ai/jobs.py` is ready.
    """
    return _read("AI_ASYNC_JOBS_ENABLED", False)


def snapshot() -> dict:
    """Returns the current flag state for /api/admin/ai/telemetry."""
    return {
        "auto_translate_on_save": auto_translate_on_save(),
        "manual_translate": manual_translate(),
        "ai_blog_generate": ai_blog_generate(),
        "ai_blog_recommend": ai_blog_recommend(),
        "ai_image_generate": ai_image_generate(),
        "telemetry_enabled": telemetry_enabled(),
        "cache_enabled": cache_enabled(),
        "async_jobs_enabled": async_jobs_enabled(),
    }
