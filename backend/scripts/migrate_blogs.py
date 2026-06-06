"""Migrate 126 blog posts from JSON files into MongoDB."""
import asyncio
import json
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

DATA_DIR = Path(__file__).parent.parent / "data"
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "test_database")


async def migrate():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    existing = await db.blog_posts.count_documents({})
    if existing > 0:
        print(f"Already {existing} posts in DB. Skipping migration.")
        return

    # Load all 3 data sources
    with open(DATA_DIR / "blog_listing.json") as f:
        listing = json.load(f)
    with open(DATA_DIR / "blog_content.json") as f:
        content = json.load(f)
    with open(DATA_DIR / "blog_posts_bilingual.json") as f:
        bilingual = json.load(f)

    docs = []
    bilingual_slugs = set(bilingual.keys())

    for post in listing:
        slug = post["slug"]
        now = datetime.now(timezone.utc).isoformat()

        # Build sections HTML from scraped content
        sections = content.get(slug, {}).get("sections", [])
        content_html = ""
        for sec in sections:
            if sec.get("heading"):
                content_html += f"<h2>{sec['heading']}</h2>\n"
            for p in sec.get("paragraphs", []):
                content_html += f"<p>{p}</p>\n"

        doc = {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "title": post.get("title", ""),
            "title_de": "",
            "excerpt": post.get("excerpt", ""),
            "excerpt_de": "",
            "content_html": content_html,
            "content_html_de": "",
            "category": post.get("category", "Uncategorized"),
            "tags": [],
            "tags_de": [],
            "author": post.get("author", "CredSure Team"),
            "read_time": post.get("readTime", "5 min read"),
            "date": post.get("date", now[:10]),
            "status": "published",
            "scheduled_at": None,
            "featured_image": "",
            "seo_title": "",
            "seo_description": "",
            "created_at": now,
            "updated_at": now,
        }

        # Overlay bilingual content if available
        if slug in bilingual_slugs:
            bp = bilingual[slug]
            doc["title"] = bp.get("title_en", doc["title"])
            doc["title_de"] = bp.get("title_de", "")
            doc["excerpt"] = bp.get("excerpt_en", doc["excerpt"])
            doc["excerpt_de"] = bp.get("excerpt_de", "")
            doc["content_html"] = bp.get("content_en", doc["content_html"])
            doc["content_html_de"] = bp.get("content_de", "")
            doc["tags"] = bp.get("tags", [])
            doc["tags_de"] = bp.get("tags_de", [])
            doc["featured_image"] = bp.get("image", "")

        docs.append(doc)

    if docs:
        await db.blog_posts.insert_many(docs)
        # Create indexes
        await db.blog_posts.create_index("slug", unique=True)
        await db.blog_posts.create_index("status")
        await db.blog_posts.create_index("category")
        await db.blog_posts.create_index("scheduled_at")
        print(f"Migrated {len(docs)} posts to MongoDB.")


if __name__ == "__main__":
    asyncio.run(migrate())
