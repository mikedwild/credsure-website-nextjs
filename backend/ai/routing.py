"""
AI model routing.

Single source of truth for "which model serves which intent". Today
every intent maps to Claude Sonnet 4.5 — Phase 0 is observability-only,
no routing changes. Phase 1 will introduce intent-specific tiers (e.g.
short-string translations → Haiku) by editing this registry only,
without touching any call sites.

Future plan: replace `_REGISTRY` with a loader that parses the
frontmatter of `/app/ai/agents/<intent>.md` files at startup.
"""
from __future__ import annotations

import logging
from typing import NamedTuple

logger = logging.getLogger(__name__)


class ModelSpec(NamedTuple):
    provider: str       # "anthropic" | "openai" | "google"
    model: str          # e.g. "claude-sonnet-4-5-20250929"
    tier: str           # "small" | "mid" | "premium"


# ─── Intent → ModelSpec registry ──────────────────────────────────────
# Charter §7: prefer the smallest capable model. During Phase 0 we ship
# everything to Sonnet 4.5 to preserve exact behaviour and gather
# baseline telemetry. Phase 1 cascades the cheap intents down to Haiku.
_REGISTRY: dict[str, ModelSpec] = {
    # Translation intents
    "translate.title":            ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),
    "translate.excerpt":          ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),
    "translate.html_body":        ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),
    "translate.tags":             ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),
    "translate.seo_title":        ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),
    "translate.seo_description":  ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),

    # Blog generation intents
    "blog.recommend":             ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),
    "blog.generate":              ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium"),
}

_DEFAULT = ModelSpec("anthropic", "claude-sonnet-4-5-20250929", "premium")


def resolve(intent: str) -> ModelSpec:
    """Returns the ModelSpec for an intent, falling back to default if unknown.

    Unknown intents log a warning so we catch typos before they hit prod.
    """
    spec = _REGISTRY.get(intent)
    if spec is None:
        logger.warning(f"Unknown AI intent '{intent}' — falling back to default model")
        return _DEFAULT
    return spec


def all_intents() -> list[dict]:
    """For /api/admin/ai/telemetry — exposes the routing table."""
    return [
        {"intent": k, "provider": v.provider, "model": v.model, "tier": v.tier}
        for k, v in _REGISTRY.items()
    ]
