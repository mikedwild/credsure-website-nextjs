"""
One-off backfill: ensure every blog post has `updated_at`, `created_at`,
and `dateModified` populated so AI search engines (Perplexity, ChatGPT
Search, Gemini) can correctly assess content freshness.

Resolution order for missing fields:
  - `updated_at` → `created_at` → ISO of `date` (YYYY-MM-DD) → today
  - `created_at` → `updated_at` → ISO of `date` → today
  - `dateModified` mirrors `updated_at` (the canonical "last edited" stamp)

Idempotent. Safe to re-run. Reports counts updated.

Usage (from /app/backend):
    python -m scripts.backfill_date_modified
"""
from __future__ import annotations

import asyncio
import os
import sys
from datetime import datetime, timezone

# Allow running from anywhere in /app/backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


def _iso_from_date(date_str: str | None) -> str | None:
    """Convert a `date` field (YYYY-MM-DD or ISO) into an ISO string."""
    if not date_str:
        return None
    try:
        # Already an ISO datetime
        if "T" in date_str:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
        # YYYY-MM-DD date — anchor to noon UTC so timezone shifts don't roll the day.
        return datetime.strptime(date_str, "%Y-%m-%d").replace(hour=12, tzinfo=timezone.utc).isoformat()
    except (ValueError, TypeError):
        return None


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    coll = db.blog_posts

    now_iso = datetime.now(timezone.utc).isoformat()
    total = await coll.count_documents({})
    print(f"Found {total} blog posts.\n")

    fixed_created_at = 0
    fixed_updated_at = 0
    fixed_date_modified = 0
    untouched = 0

    cursor = coll.find({}, {"_id": 1, "slug": 1, "date": 1, "created_at": 1, "updated_at": 1, "dateModified": 1})
    async for doc in cursor:
        patch: dict = {}

        date_iso = _iso_from_date(doc.get("date"))

        # created_at — prefer existing → updated_at → date → now
        if not doc.get("created_at"):
            patch["created_at"] = doc.get("updated_at") or date_iso or now_iso
            fixed_created_at += 1

        # updated_at — prefer existing → created_at → date → now
        if not doc.get("updated_at"):
            patch["updated_at"] = doc.get("created_at") or date_iso or now_iso
            fixed_updated_at += 1

        # dateModified — mirror updated_at (which we may have just set above)
        if not doc.get("dateModified"):
            patch["dateModified"] = (
                patch.get("updated_at")
                or doc.get("updated_at")
                or patch.get("created_at")
                or doc.get("created_at")
                or date_iso
                or now_iso
            )
            fixed_date_modified += 1

        if patch:
            await coll.update_one({"_id": doc["_id"]}, {"$set": patch})
        else:
            untouched += 1

    print(f"Backfill complete:")
    print(f"  created_at set on    : {fixed_created_at} posts")
    print(f"  updated_at set on    : {fixed_updated_at} posts")
    print(f"  dateModified set on  : {fixed_date_modified} posts")
    print(f"  untouched (all 3 ok) : {untouched} posts")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
