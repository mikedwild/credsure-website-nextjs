"""Migrate published blog posts from the live (old Emergent) site's PUBLIC API
into the new Atlas `blog_posts` collection.

Why the public API instead of a DB copy: the old Emergent cluster's Atlas
allowlist blocks outside connections, but credsure.io/api exposes every
published post with full bilingual content. Verified: only 3 of 126 posts are
genuinely German-translated, and the API reports that faithfully — so we store
DE fields only when a real translation exists (otherwise the API falls back to
EN and we'd duplicate it into the German field).

Target DB comes from MONGO_URL / DB_NAME (run via `railway run`).
Idempotent: upserts by slug, so re-running updates rather than duplicates.

    cd backend
    railway run python3.11 -m scripts.migrate_blogs_from_api            # dry run
    railway run python3.11 -m scripts.migrate_blogs_from_api --commit   # write
"""
import asyncio
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient

SOURCE = "https://credsure.io/api"


def _api(path: str) -> dict:
    with urllib.request.urlopen(f"{SOURCE}{path}", timeout=30) as r:
        return json.loads(r.read().decode())


def _as_list(v):
    if isinstance(v, list):
        return v
    if isinstance(v, str) and v.strip():
        return [t.strip() for t in v.split(",") if t.strip()]
    return []


def _build_doc(listing: dict, en: dict, de: dict | None) -> dict:
    """Map the API's served view onto the new BlogPost schema."""
    slug = en.get("slug") or listing.get("slug")
    has_de = bool(en.get("has_de_translation")) and de is not None and (
        (de.get("content_html") or "") != (en.get("content_html") or "")
    )
    doc = {
        "id": en.get("id") or listing.get("id"),
        "slug": slug,
        "title": en.get("title") or listing.get("title") or "",
        "title_de": (listing.get("title_de") or "") if has_de else "",
        "excerpt": en.get("excerpt") or listing.get("excerpt") or "",
        "excerpt_de": (listing.get("excerpt_de") or "") if has_de else "",
        "content_html": en.get("content_html") or "",
        "content_html_de": (de.get("content_html") or "") if has_de else "",
        "category": en.get("category") or listing.get("category") or "Uncategorized",
        "tags": _as_list(en.get("tags") or listing.get("tags")),
        "tags_de": _as_list(listing.get("tags_de")) if has_de else [],
        "author": en.get("author") or listing.get("author") or "CredSure Team",
        "read_time": en.get("read_time") or en.get("readTime") or listing.get("read_time") or "5 min read",
        "status": "published",
        "scheduled_at": en.get("scheduled_at") or listing.get("scheduled_at"),
        "featured_image": en.get("featured_image") or listing.get("featured_image") or "",
        "seo_title": en.get("seo_title") or "",
        "seo_description": en.get("seo_description") or "",
        "seo_title_de": (de.get("seo_title") or "") if has_de else "",
        "seo_description_de": (de.get("seo_description") or "") if has_de else "",
        "date": en.get("date") or listing.get("date"),
        "date_modified": en.get("date_modified"),
        "ai_generated": bool(en.get("ai_generated")),
        "has_de_translation": has_de,
        "migrated_at": datetime.now(timezone.utc).isoformat(),
        "migrated_from": "credsure.io/api",
    }
    return doc


async def main(commit: bool):
    db = AsyncIOMotorClient(os.environ["MONGO_URL"])[os.environ.get("DB_NAME", "credsure")]
    before = await db.blog_posts.count_documents({})
    print(f"target blog_posts before: {before}   commit={commit}\n")

    posts = _api("/blogs?limit=500").get("posts", [])
    print(f"source published posts: {len(posts)}")

    written = de_count = errors = 0
    for p in posts:
        slug = p.get("slug")
        if not slug:
            continue
        try:
            en = _api(f"/blogs/{slug}").get("post", {})
            de = _api(f"/blogs/{slug}?lang=de").get("post", {}) if en.get("has_de_translation") else None
            doc = _build_doc(p, en, de)
            if doc["has_de_translation"]:
                de_count += 1
            if commit:
                await db.blog_posts.update_one({"slug": slug}, {"$set": doc}, upsert=True)
            written += 1
        except Exception as e:
            print(f"  ERROR {slug}: {e}")
            errors += 1

    after = await db.blog_posts.count_documents({}) if commit else before
    print(f"\n{'WROTE' if commit else 'would write'}: {written} posts ({de_count} with real DE translation), errors={errors}")
    print(f"target blog_posts after: {after}")
    if not commit:
        print("\nDRY RUN — nothing written. Re-run with --commit to upsert into Atlas.")
    else:
        print("\nDone. (Drafts + site_settings + users are not in the public API — handle separately.)")


if __name__ == "__main__":
    asyncio.run(main(commit="--commit" in sys.argv))
