"""
Auto-translate helper — bidirectional EN↔DE for blog post fields.

Extracted from `routes/admin.py` so both `routes/admin.py` (blog CRUD)
and `routes/admin_ai.py` (AI generation) can share it without a
circular import.

Covers: title, excerpt, content_html, tags, seo_title, seo_description.
Uses Claude Sonnet 4.5 via emergentintegrations (through `translate_fields`).
"""
from __future__ import annotations

import logging
from typing import Optional

from utils.ai_content import translate_fields
from ai import feature_flags as ai_flags

logger = logging.getLogger(__name__)


# English source field -> its German counterpart. Used by the edit-aware
# dirty-tracking path (retranslate_changed_fields). Tags are intentionally
# excluded — they're low-value and handled by the fill-missing path.
_EN_TO_DE = {
    "title": "title_de",
    "excerpt": "excerpt_de",
    "content_html": "content_html_de",
    "seo_title": "seo_title_de",
    "seo_description": "seo_description_de",
}


def changed_en_fields(existing: dict, updates: dict) -> set:
    """English source fields whose value changed in THIS update AND whose German
    counterpart the caller did not also set in the same save.

    Pure/deterministic so it's unit-testable without the LLM stack. `updates`
    only contains fields the caller actually sent (the route drops None), so a
    field's presence means "the editor touched it".
    """
    changed = set()
    for en_f, de_f in _EN_TO_DE.items():
        if en_f in updates and updates.get(en_f) != existing.get(en_f) and de_f not in updates:
            changed.add(en_f)
    return changed


async def retranslate_changed_fields(
    existing: dict, updates: dict, *, db=None, user_email: Optional[str] = None
) -> dict:
    """Edit-aware dirty-tracking: when an editor changes English on an already-
    translated post, refresh ONLY the German fields whose English source
    changed. Never a blanket re-translate — untouched posts/fields and
    hand-edited German are preserved. Returns {de_field: value} to merge into
    the update. No-op (and swallows errors) so a translate hiccup never blocks a
    save; complements `auto_translate_missing` (which only fills empty sides)."""
    if not ai_flags.auto_translate_on_save():
        return {}
    changed = changed_en_fields(existing, updates)
    if not changed:
        return {}
    try:
        tr = await translate_fields(
            title=updates.get("title", "") if "title" in changed else "",
            excerpt=updates.get("excerpt", "") if "excerpt" in changed else "",
            content_html=updates.get("content_html", "") if "content_html" in changed else "",
            tags="",
            seo_title=updates.get("seo_title", "") if "seo_title" in changed else "",
            seo_description=updates.get("seo_description", "") if "seo_description" in changed else "",
            source_lang="en", target_lang="de",
            db=db, workflow="blog.retranslate_changed", user_email=user_email,
        )
    except Exception as e:
        logger.warning(f"Re-translate changed EN→DE failed: {e}")
        return {}
    out = {}
    for en_f in changed:
        val = tr.get(en_f)
        if val:
            out[_EN_TO_DE[en_f]] = val
    return out


async def auto_translate_missing(doc: dict, *, db=None, user_email: Optional[str] = None) -> dict:
    """If one language is filled and the other is empty, auto-translate.

    No-op when both languages are filled or both are empty. Failures are
    logged but never raised — partial translation is acceptable; broken
    blog save is not.
    """
    if not ai_flags.auto_translate_on_save():
        return doc

    has_en = bool(doc.get("title", "").strip() and doc.get("content_html", "").strip())
    has_de = bool(doc.get("title_de", "").strip() and doc.get("content_html_de", "").strip())

    if has_en and not has_de:
        try:
            tags_str = ", ".join(doc.get("tags", [])) if isinstance(doc.get("tags"), list) else doc.get("tags", "")
            tr = await translate_fields(
                title=doc.get("title", ""), excerpt=doc.get("excerpt", ""),
                content_html=doc.get("content_html", ""), tags=tags_str,
                seo_title=doc.get("seo_title", ""), seo_description=doc.get("seo_description", ""),
                source_lang="en", target_lang="de",
                db=db, workflow="blog.auto_translate", user_email=user_email,
            )
            if tr.get("title"):
                doc["title_de"] = tr["title"]
            if tr.get("excerpt"):
                doc["excerpt_de"] = tr["excerpt"]
            if tr.get("content_html"):
                doc["content_html_de"] = tr["content_html"]
            if tr.get("tags"):
                doc["tags_de"] = [t.strip() for t in tr["tags"].split(",") if t.strip()]
            if tr.get("seo_title") and not doc.get("seo_title_de"):
                doc["seo_title_de"] = tr["seo_title"]
            if tr.get("seo_description") and not doc.get("seo_description_de"):
                doc["seo_description_de"] = tr["seo_description"]
            logger.info(f"Auto-translated EN→DE for: {doc.get('title', '')[:50]}")
        except Exception as e:
            logger.warning(f"Auto-translate EN→DE failed: {e}")

    elif has_de and not has_en:
        try:
            tags_str = ", ".join(doc.get("tags_de", [])) if isinstance(doc.get("tags_de"), list) else doc.get("tags_de", "")
            tr = await translate_fields(
                title=doc.get("title_de", ""), excerpt=doc.get("excerpt_de", ""),
                content_html=doc.get("content_html_de", ""), tags=tags_str,
                seo_title=doc.get("seo_title_de", ""), seo_description=doc.get("seo_description_de", ""),
                source_lang="de", target_lang="en",
                db=db, workflow="blog.auto_translate", user_email=user_email,
            )
            if tr.get("title"):
                doc["title"] = tr["title"]
            if tr.get("excerpt"):
                doc["excerpt"] = tr["excerpt"]
            if tr.get("content_html"):
                doc["content_html"] = tr["content_html"]
            if tr.get("tags"):
                doc["tags"] = [t.strip() for t in tr["tags"].split(",") if t.strip()]
            if tr.get("seo_title") and not doc.get("seo_title"):
                doc["seo_title"] = tr["seo_title"]
            if tr.get("seo_description") and not doc.get("seo_description"):
                doc["seo_description"] = tr["seo_description"]
            logger.info(f"Auto-translated DE→EN for: {doc.get('title_de', '')[:50]}")
        except Exception as e:
            logger.warning(f"Auto-translate DE→EN failed: {e}")

    return doc
