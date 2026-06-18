"""
Publish German blog bodies: write `content_html_de` (+ title_de/excerpt_de) to
MongoDB so /de/blog/* serves fully-German articles.

Input: backend/data/blog_content_de.json — same shape as blog_content.json,
but with German `heading`/`content` per section:
    { "<slug>": { "sections": [ { "heading": "…DE…", "content": "…DE…" }, … ] }, … }

For each slug present in that file, this script:
  - builds `content_html_de` from the German sections (reusing the repair
    builder so markup matches the English bodies), and
  - sets `title_de` / `excerpt_de` from the already-translated frontend i18n
    file (src/messages/de/blog.json) when present — the backend only serves a
    German post when `title_de` is set (see routes/blogs.py get_blog_post).

SAFETY: dry-run by default; pass --apply to write. Idempotent — safe to re-run
(e.g. after adding more slugs to blog_content_de.json). Run via `railway run`
so MONGO_URL/DB_NAME are injected from the Railway service:
    railway run python3 -m scripts.apply_blog_de            # dry run
    railway run python3 -m scripts.apply_blog_de --apply    # write
    railway run python3 -m scripts.apply_blog_de --only some-slug
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from scripts.repair_blog_bodies import build_html_from_sections, _body_chars

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

BACKEND_DIR = Path(__file__).parent.parent
REPO_ROOT = BACKEND_DIR.parent
DE_SECTIONS_PATH = BACKEND_DIR / "data" / "blog_content_de.json"
# Frontend i18n German titles/excerpts (already live on the site).
BLOG_JSON_DE = REPO_ROOT / "src" / "messages" / "de" / "blog.json"


def _load_titles() -> dict:
    try:
        data = json.loads(BLOG_JSON_DE.read_text())
    except FileNotFoundError:
        print(f"  ! {BLOG_JSON_DE} not found — title_de/excerpt_de will be left unset.")
        return {}
    out = {}
    for slug, v in data.items():
        if isinstance(v, dict) and (v.get("title") or v.get("excerpt")):
            out[slug] = {"title_de": v.get("title", ""), "excerpt_de": v.get("excerpt", "")}
    return out


async def main():
    parser = argparse.ArgumentParser(description="Publish German blog bodies to MongoDB.")
    parser.add_argument("--apply", action="store_true", help="Write to MongoDB. Without this, dry-run only.")
    parser.add_argument("--only", type=str, default="", help="Publish a single slug.")
    args = parser.parse_args()

    de_sections = json.loads(DE_SECTIONS_PATH.read_text())
    titles = _load_titles()

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    coll = db.blog_posts
    now_iso = datetime.now(timezone.utc).isoformat()

    slugs = [args.only] if args.only else list(de_sections.keys())
    planned, missing_doc, thin = [], [], []

    for slug in slugs:
        entry = de_sections.get(slug)
        if not entry:
            print(f"  ! {slug} not in blog_content_de.json — skipping")
            continue
        html_de = build_html_from_sections(entry.get("sections", []))
        if _body_chars(html_de) < 120:
            thin.append(slug)
            continue
        doc = await coll.find_one({"slug": slug}, {"_id": 1})
        if not doc:
            missing_doc.append(slug)
            continue
        patch = {"content_html_de": html_de, "updated_at": now_iso, "dateModified": now_iso}
        t = titles.get(slug)
        if t:
            if t["title_de"]:
                patch["title_de"] = t["title_de"]
            if t["excerpt_de"]:
                patch["excerpt_de"] = t["excerpt_de"]
        planned.append((doc["_id"], slug, patch))

    print(f"{'APPLY' if args.apply else 'DRY-RUN'} — publishing German bodies to '{DB_NAME}'.")
    print(f"  to publish        : {len(planned)}")
    print(f"  thin translation  : {len(thin)}" + (f" → {', '.join(thin[:6])}" if thin else ""))
    print(f"  no matching post  : {len(missing_doc)}" + (f" → {', '.join(missing_doc[:6])}" if missing_doc else ""))

    if not args.apply:
        for _id, slug, patch in planned:
            print(f"  would publish: {slug}  ({_body_chars(patch['content_html_de'])} body chars, title_de={'yes' if patch.get('title_de') else 'NO'})")
        print("\nDry run only — no changes written. Re-run with --apply.")
        client.close()
        return

    for _id, slug, patch in planned:
        await coll.update_one({"_id": _id}, {"$set": patch})
        print(f"  ✓ {slug}")
    print(f"\nPublished {len(planned)} German bodies.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
