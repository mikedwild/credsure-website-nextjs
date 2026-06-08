"""Import the one-time Emergent export (credsure_export.json) into the new Atlas.

Reads the dump produced by the temporary /api/admin/export/dump endpoint and
upserts blog_posts (by slug), site_settings (by key), users (by email), and
user_invites (by token) into the new database (MONGO_URL / DB_NAME via Railway).

Idempotent: upserts, so re-running updates instead of duplicating. The source
`_id` (stringified old ObjectId) is dropped so Atlas assigns fresh _ids; the
app's stable `id`/`slug` are preserved.

    cd backend
    railway run python3.11 -m scripts.import_credsure_dump /tmp/credsure_migrate/credsure_export.json
    railway run python3.11 -m scripts.import_credsure_dump /tmp/credsure_migrate/credsure_export.json --commit
"""
import asyncio
import json
import os
import sys

from motor.motor_asyncio import AsyncIOMotorClient

# Fields the new BlogPost schema expects (others from source are kept if useful).
NEW_BLOG_DEFAULTS = {
    "title_de": "", "excerpt_de": "", "content_html_de": "",
    "tags": [], "tags_de": [], "seo_title": "", "seo_description": "",
    "seo_title_de": "", "seo_description_de": "", "featured_image": "",
    "read_time": "5 min read", "category": "Uncategorized", "status": "draft",
}


def _as_list(v):
    if isinstance(v, list):
        return v
    if isinstance(v, str) and v.strip():
        return [t.strip() for t in v.split(",") if t.strip()]
    return []


def _clean_blog(p: dict) -> dict:
    p = {k: v for k, v in p.items() if k != "_id"}
    for k, default in NEW_BLOG_DEFAULTS.items():
        p.setdefault(k, default)
    p["tags"] = _as_list(p.get("tags"))
    p["tags_de"] = _as_list(p.get("tags_de"))
    return p


async def main(path: str, commit: bool):
    data = json.load(open(path, encoding="utf-8"))
    db = AsyncIOMotorClient(os.environ["MONGO_URL"])[os.environ.get("DB_NAME", "credsure")]

    print(f"importing from {path}   commit={commit}\n")

    # ── blog_posts (by slug) ──
    posts = data.get("blog_posts", [])
    empty_pub = []
    for p in posts:
        doc = _clean_blog(p)
        if doc.get("status") == "published" and (doc.get("content_html") or "").strip() in ("", "<p></p>"):
            empty_pub.append(doc.get("slug"))
        if commit:
            await db.blog_posts.update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)
    bp_after = await db.blog_posts.count_documents({}) if commit else 0
    print(f"blog_posts: {len(posts)} ({'written' if commit else 'would write'})"
          f"{' → now '+str(bp_after)+' in Atlas' if commit else ''}")
    print(f"  ⚠ published-but-empty bodies ({len(empty_pub)}): {empty_pub}")

    # ── site_settings (by key='global') ──
    for s in data.get("site_settings", []):
        s = {k: v for k, v in s.items() if k != "_id"}
        s.setdefault("key", "global")
        # never overwrite admin-entered API keys with absent source fields
        s.pop("anthropic_api_key", None)
        s.pop("openai_api_key", None)
        if commit:
            await db.site_settings.update_one({"key": s["key"]}, {"$set": s}, upsert=True)
    print(f"site_settings: {len(data.get('site_settings', []))} ({'written' if commit else 'would write'})")

    # ── users (by email) — carries role/active into the new Google auth ──
    for u in data.get("users", []):
        u = {k: v for k, v in u.items() if k != "_id"}
        if not u.get("email"):
            continue
        if commit:
            await db.users.update_one({"email": u["email"].lower()}, {"$set": u}, upsert=True)
    print(f"users: {len(data.get('users', []))} ({'written' if commit else 'would write'})")

    # ── user_invites (by token) ──
    for iv in data.get("user_invites", []):
        iv = {k: v for k, v in iv.items() if k != "_id"}
        key = {"token": iv["token"]} if iv.get("token") else {"invite_id": iv.get("invite_id")}
        if commit:
            await db.user_invites.update_one(key, {"$set": iv}, upsert=True)
    print(f"user_invites: {len(data.get('user_invites', []))} ({'written' if commit else 'would write'})")

    if not commit:
        print("\nDRY RUN — nothing written. Re-run with --commit to import.")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    path = args[0] if args else "/tmp/credsure_migrate/credsure_export.json"
    asyncio.run(main(path, commit="--commit" in sys.argv))
