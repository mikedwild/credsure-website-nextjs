"""
Externalised knowledge — single source of truth for stable domain
facts that used to be inlined into every prompt.

Charter §3 / §12: stable knowledge belongs in retrievable files, not
in runtime prompts. This module loads `/app/ai/knowledge/brand_voice.md`
at import time and exposes typed constants. Templates and prompts
import from here instead of duplicating strings across call sites.

Phase 1 will replace this with a generic markdown frontmatter loader
that can hot-reload — Phase 0 keeps it dead-simple so we don't risk
parser bugs in production.
"""
from __future__ import annotations

# ─── Brand names (preserved verbatim across translations) ─────────────
# Mirrors the RULES block of /app/ai/knowledge/brand_voice.md.
# When you add a customer to brand_voice.md, add it here too.
BRAND_NAMES: tuple[str, ...] = (
    "CredSure",
    "ByteEDGE",
    "Tsaaro",
    "Tsaaro Academy",
    "Clini INDIA",
    "BMS College of Engineering",
)


def brand_names_for_prompt() -> str:
    """Returns a comma-joined string suitable for prompt interpolation."""
    return ", ".join(BRAND_NAMES)


# ─── Banned phrases (brand voice) ─────────────────────────────────────
BANNED_PHRASES: tuple[str, ...] = (
    "revolutionary",
    "cutting-edge",
    "next-generation",
    "in the world of",
    "game-changer",   # except in customer quotes where it appears verbatim
)


# ─── Product taxonomy (for future routing decisions) ──────────────────
PRODUCT_CATEGORIES: tuple[str, ...] = (
    "Compliance",
    "Insights",
    "News",
    "Industry",
    "Technology",
    "Healthcare",
)
