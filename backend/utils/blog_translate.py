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
