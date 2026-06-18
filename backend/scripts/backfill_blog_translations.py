"""
One-off backfill: translate English-only blog posts into German.

The site is bilingual (EN/DE) but ~123 of ~126 blog posts have no German
version, so /de/blog/* silently falls back to English content. This script
finds every post that has English copy but no German copy and fills in the
`*_de` fields using the SAME translation pipeline the admin UI uses
(`utils.ai_content.translate_fields`, Claude Sonnet 4.5).

Fields written (mirrors `utils.blog_translate.auto_translate_missing`):
    title_de, excerpt_de, content_html_de, tags_de,
    seo_title_de, seo_description_de

A post is considered "needs translation" when it has a non-empty `title`
and `content_html` but an empty/absent `title_de` or `content_html_de`.
Idempotent: posts already translated are skipped, so it is safe to re-run
(e.g. to pick up posts that failed on a previous pass).

SAFETY: dry-run by default — it only PRINTS what it would do. Pass --apply
to actually write to MongoDB. This hits the LLM once per field (6 calls per
post) and writes to the live database, so review the dry-run output first.

Usage (from /app/backend):
    python -m scripts.backfill_blog_translations              # dry run, all posts
    python -m scripts.backfill_blog_translations --limit 5    # dry run, first 5
    python -m scripts.backfill_blog_translations --apply      # translate + write
    python -m scripts.backfill_blog_translations --apply --limit 10
    python -m scripts.backfill_blog_translations --apply --only some-post-slug

Requires the same env as the backend: MONGO_URL, DB_NAME, and a configured
LLM key (see backend/.env.example / utils.ai_content).
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from datetime import datetime, timezone

# Allow running from anywhere in /app/backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# NOTE: `utils.ai_content` (the LLM stack) is imported lazily inside
# `_translate_one`, NOT at module top — so a dry run can list candidates
# without needing the translation provider SDK or Python 3.10+ `X | None`
# syntax present in that module. Only `--apply` pulls it in.

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

# Pause between posts so a large backfill doesn't hammer the LLM provider.
SLEEP_BETWEEN_POSTS_S = 1.0


def _needs_translation(doc: dict) -> bool:
    """True when the post has English copy but no German copy."""
    has_en = bool((doc.get("title") or "").strip() and (doc.get("content_html") or "").strip())
    has_de = bool((doc.get("title_de") or "").strip() and (doc.get("content_html_de") or "").strip())
    return has_en and not has_de


def _tags_to_str(tags) -> str:
    if isinstance(tags, list):
        return ", ".join(str(t) for t in tags)
    return str(tags or "")


async def _translate_one(doc: dict, *, db) -> dict:
    """Return the `$set` patch of `*_de` fields for a single post."""
    from utils.ai_content import translate_fields  # lazy: only needed for --apply

    tr = await translate_fields(
        title=doc.get("title", ""),
        excerpt=doc.get("excerpt", ""),
        content_html=doc.get("content_html", ""),
        tags=_tags_to_str(doc.get("tags")),
        seo_title=doc.get("seo_title", ""),
        seo_description=doc.get("seo_description", ""),
        source_lang="en",
        target_lang="de",
        db=db,
        workflow="blog.backfill_translate",
    )

    patch: dict = {}
    if tr.get("title"):
        patch["title_de"] = tr["title"]
    if tr.get("excerpt"):
        patch["excerpt_de"] = tr["excerpt"]
    if tr.get("content_html"):
        patch["content_html_de"] = tr["content_html"]
    if tr.get("tags"):
        patch["tags_de"] = [t.strip() for t in tr["tags"].split(",") if t.strip()]
    if tr.get("seo_title"):
        patch["seo_title_de"] = tr["seo_title"]
    if tr.get("seo_description"):
        patch["seo_description_de"] = tr["seo_description"]
    return patch


async def main():
    parser = argparse.ArgumentParser(description="Backfill German translations for English-only blog posts.")
    parser.add_argument("--apply", action="store_true", help="Write to MongoDB. Without this, dry-run only.")
    parser.add_argument("--limit", type=int, default=0, help="Max posts to process (0 = no limit).")
    parser.add_argument("--only", type=str, default="", help="Process a single post by slug.")
    args = parser.parse_args()

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    coll = db.blog_posts

    query: dict = {"slug": args.only} if args.only else {}
    projection = {
        "_id": 1, "slug": 1, "title": 1, "excerpt": 1, "content_html": 1,
        "tags": 1, "seo_title": 1, "seo_description": 1,
        "title_de": 1, "content_html_de": 1,
    }

    total = await coll.count_documents({})
    print(f"{'APPLY' if args.apply else 'DRY-RUN'} — {total} blog posts in '{DB_NAME}'.\n")

    candidates = []
    async for doc in coll.find(query, projection):
        if _needs_translation(doc):
            candidates.append(doc)

    if args.limit:
        candidates = candidates[: args.limit]

    print(f"{len(candidates)} post(s) need German translation"
          + (f" (limited to {args.limit})" if args.limit else "") + ".\n")

    if not args.apply:
        for d in candidates:
            print(f"  would translate: {d.get('slug')}")
        print("\nDry run only — no changes written. Re-run with --apply to translate.")
        client.close()
        return

    translated = 0
    failed = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    for i, doc in enumerate(candidates, 1):
        slug = doc.get("slug", str(doc["_id"]))
        print(f"[{i}/{len(candidates)}] translating: {slug} ...", flush=True)
        try:
            patch = await _translate_one(doc, db=db)
            if not patch.get("title_de") or not patch.get("content_html_de"):
                print(f"    ! incomplete translation (title_de/content_html_de missing) — skipping write")
                failed += 1
                continue
            patch["updated_at"] = now_iso
            patch["dateModified"] = now_iso
            await coll.update_one({"_id": doc["_id"]}, {"$set": patch})
            translated += 1
            print(f"    ✓ wrote {len(patch)} fields")
        except Exception as e:  # noqa: BLE001 — keep going; report at the end
            failed += 1
            print(f"    ✗ failed: {e}")
        await asyncio.sleep(SLEEP_BETWEEN_POSTS_S)

    print("\nBackfill complete:")
    print(f"  translated + written : {translated}")
    print(f"  failed / skipped     : {failed}")
    print(f"  (re-run to retry the failed ones — idempotent)")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
