#!/usr/bin/env python3
"""Snapshot the live (published) blog posts to a versioned file.

The committed seed (`backend/data/blog_posts_bilingual.json`) is stale — 10 posts
vs ~126 live — and `migrate_blogs.py` only seeds an empty DB. This pulls the live
posts through the PUBLIC read API (no auth needed) and writes a lossless snapshot
so the repo has an up-to-date, version-controlled copy of production content.

Writes to backend/data/blog_posts_live_export.json (does NOT clobber the original
seed, whose field names differ). Stdlib only.

Env: BACKEND_ORIGIN (default: the Railway origin used by src/lib/blogApi.ts)
"""
import json
import os
import urllib.request
from pathlib import Path

BACKEND = os.environ.get(
    "BACKEND_ORIGIN",
    "https://credsure-website-nextjs-production.up.railway.app",
).rstrip("/")
OUT = Path(__file__).parents[2] / "backend" / "data" / "blog_posts_live_export.json"


def get(url):
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def main():
    listing = get(f"{BACKEND}/api/blogs?lang=en&limit=500")
    posts = listing.get("posts", listing if isinstance(listing, list) else [])
    print(f"Listing returned {len(posts)} posts. Fetching full bodies...")

    full = []
    for i, p in enumerate(posts, 1):
        slug = p.get("slug")
        if not slug:
            continue
        try:
            detail = get(f"{BACKEND}/api/blogs/{slug}?lang=en")
            full.append(detail.get("post", detail))
            print(f"  [{i}/{len(posts)}] {slug}")
        except Exception as e:  # noqa: BLE001
            print(f"  [{i}/{len(posts)}] {slug}  FAILED: {e}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(full, indent=2, ensure_ascii=False))
    print(f"\nWrote {len(full)} posts -> {OUT.relative_to(Path.cwd())}")


if __name__ == "__main__":
    main()
