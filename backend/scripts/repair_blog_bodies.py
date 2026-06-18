"""
One-off repair: restore blog post BODIES lost during the original migration.

Root cause: `scripts/migrate_blogs.py` built `content_html` by reading each
scraped section's body from a field named `paragraphs`, but the source data
(`data/blog_content.json`) stores body text in a field named `content`. The
mismatch meant only the `<h2>` headings were written and every paragraph was
dropped — so 123 of 126 posts render as headings-only (or empty). The body
text is intact in `data/blog_content.json` (~650K chars), so this is fully
recoverable: re-extract using the correct `content` field and update the
existing Mongo docs.

SAFETY:
- Dry-run by default — prints what it would change. Pass --apply to write.
- Only updates posts whose CURRENT body is "thin" (< MIN_BODY_CHARS of <p>/<li>
  text), so the 3 healthy posts (sourced from blog_posts_bilingual.json) are
  never clobbered. Idempotent — safe to re-run.
- Touches only `content_html` (English). German bodies are handled separately
  by `backfill_blog_translations.py`, which should be run AFTER this so it
  translates real content rather than bare headings.

Usage (from /app/backend):
    python -m scripts.repair_blog_bodies                 # dry run, all posts
    python -m scripts.repair_blog_bodies --only some-slug
    python -m scripts.repair_blog_bodies --apply         # repair + write
"""
from __future__ import annotations

import argparse
import asyncio
import html as html_lib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
DATA_DIR = Path(__file__).parent.parent / "data"

# A post with fewer than this many characters of real body text (<p>/<li>) is
# considered "thin" (headings-only or empty) and eligible for repair.
MIN_BODY_CHARS = 120


def _body_chars(content_html: str) -> int:
    """Characters of actual paragraph/list-item text in the stored HTML."""
    blocks = re.findall(r"<(?:p|li)[^>]*>(.*?)</(?:p|li)>", content_html or "", re.I | re.S)
    return sum(len(re.sub(r"<[^>]+>", "", b).strip()) for b in blocks)


def build_html_from_sections(sections: list[dict]) -> str:
    """Rebuild content_html from scraped sections using the `content` field.

    Mirrors the original migrate_blogs.py intent, but reads the body from
    `content` (the field that actually holds it) and splits it into paragraphs
    on blank lines. HTML-escapes text so stray <, >, & don't corrupt markup;
    the read path sanitizes again before render.
    """
    out = []
    for sec in sections or []:
        heading = (sec.get("heading") or "").strip()
        if heading:
            out.append(f"<h2>{html_lib.escape(heading)}</h2>")
        body = (sec.get("content") or "").strip()
        if body:
            for para in re.split(r"\n\s*\n", body):
                para = para.strip()
                if para:
                    out.append(f"<p>{html_lib.escape(para)}</p>")
    return "\n".join(out) + ("\n" if out else "")


async def main():
    parser = argparse.ArgumentParser(description="Restore blog post bodies lost in migration.")
    parser.add_argument("--apply", action="store_true", help="Write to MongoDB. Without this, dry-run only.")
    parser.add_argument("--only", type=str, default="", help="Repair a single post by slug.")
    args = parser.parse_args()

    with open(DATA_DIR / "blog_content.json") as f:
        content = json.load(f)

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    coll = db.blog_posts

    query = {"slug": args.only} if args.only else {}
    now_iso = datetime.now(timezone.utc).isoformat()

    to_repair, skipped_healthy, no_source, would = [], 0, [], []
    async for doc in coll.find(query, {"_id": 1, "slug": 1, "content_html": 1}):
        slug = doc.get("slug")
        if _body_chars(doc.get("content_html", "")) >= MIN_BODY_CHARS:
            skipped_healthy += 1
            continue
        sections = (content.get(slug) or {}).get("sections", [])
        new_html = build_html_from_sections(sections)
        if _body_chars(new_html) < MIN_BODY_CHARS:
            no_source.append(slug)  # nothing recoverable from source
            continue
        to_repair.append((doc["_id"], slug, new_html))
        would.append(f"{slug}  (+{_body_chars(new_html)} body chars)")

    print(f"{'APPLY' if args.apply else 'DRY-RUN'} — repairing thin blog bodies in '{DB_NAME}'.")
    print(f"  healthy (left untouched): {skipped_healthy}")
    print(f"  no recoverable source   : {len(no_source)}" + (f" → {', '.join(no_source[:8])}" if no_source else ""))
    print(f"  repairable              : {len(to_repair)}\n")

    if not args.apply:
        for w in would:
            print("  would repair:", w)
        print("\nDry run only — no changes written. Re-run with --apply.")
        client.close()
        return

    repaired = 0
    for _id, slug, new_html in to_repair:
        await coll.update_one(
            {"_id": _id},
            {"$set": {"content_html": new_html, "updated_at": now_iso, "dateModified": now_iso}},
        )
        repaired += 1
        print(f"  ✓ {slug}")

    print(f"\nRepair complete: {repaired} post bodies restored.")
    print("Next: run `python -m scripts.backfill_blog_translations --apply` to translate the restored bodies to German.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
