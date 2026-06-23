"""
Blog CRUD + productivity endpoints: list/get/create/update/delete,
slug-available check, related-suggestions, duplicate, bulk actions,
revisions list/restore, publish, schedule.
"""
from fastapi import APIRouter, Request, HTTPException
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
import re
import uuid

from models.blog import BlogPostCreate, BlogPostUpdate
from utils.auth import get_current_admin
from utils.blog_translate import (
    auto_translate_missing as _auto_translate_missing,
    retranslate_changed_fields as _retranslate_changed_fields,
)
from utils.sanitize import sanitize_blog_fields


router = APIRouter()


@router.get("/admin/blogs")
async def admin_list_blogs(
    request: Request,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    await get_current_admin(request)
    db = request.app.state.db
    query = {}
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    if search:
        # Escape + length-cap the user input so it can't inject a
        # catastrophic-backtracking regex (ReDoS) or force a full scan.
        safe = re.escape(search.strip()[:100])
        query["$or"] = [
            {"title": {"$regex": safe, "$options": "i"}},
            {"slug": {"$regex": safe, "$options": "i"}},
        ]

    total = await db.blog_posts.count_documents(query)
    # Listing projection: exclude heavy HTML body fields from admin list view
    ADMIN_LIST_PROJECTION = {
        "_id": 0, "id": 1, "title": 1, "title_de": 1, "slug": 1, "category": 1,
        "status": 1, "author": 1, "date": 1, "updated_at": 1, "created_at": 1,
        "scheduled_at": 1, "ai_generated": 1, "featured_image": 1, "read_time": 1,
        "view_count": 1, "last_viewed_at": 1,
    }
    posts = await db.blog_posts.find(query, ADMIN_LIST_PROJECTION).sort("updated_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)

    # Per-post lead count attribution. Leads opt-in by sending the
    # `blog_slug` field (InlineBlogCTA does this); legacy leads w/o
    # blog_slug stay uncounted, which is fine — analytics is a relative
    # signal. Single $group keeps this O(1) round-trip regardless of
    # page size.
    slugs_on_page = [p.get("slug") for p in posts if p.get("slug")]
    lead_counts: dict[str, int] = {}
    if slugs_on_page:
        async for doc in db.leads.aggregate([
            {"$match": {"blog_slug": {"$in": slugs_on_page}}},
            {"$group": {"_id": "$blog_slug", "count": {"$sum": 1}}},
        ]):
            lead_counts[doc["_id"]] = doc["count"]

    for p in posts:
        p["view_count"] = int(p.get("view_count") or 0)
        p["lead_count"] = lead_counts.get(p.get("slug"), 0)

    return {"posts": posts, "total": total, "page": page, "limit": limit}


@router.get("/admin/blogs/slug-available")
async def admin_check_slug(request: Request, slug: str):
    """Quick pre-flight check used by the editor's onBlur slug validation.

    Declared BEFORE `/admin/blogs/{slug}` because FastAPI matches routes in
    registration order — otherwise `slug-available` would be swallowed by
    the dynamic-slug GET and always 404.
    """
    await get_current_admin(request)
    db = request.app.state.db
    exists = await db.blog_posts.find_one({"slug": slug}, {"_id": 1})
    return {"slug": slug, "available": exists is None}


class RelatedSuggestionsRequest(BaseModel):
    tags: List[str] = []
    category: str = ""
    exclude_slug: str = ""
    limit: int = 6


@router.post("/admin/blogs/related-suggestions")
async def admin_related_suggestions(request: Request, body: RelatedSuggestionsRequest):
    """Surface published posts the writer can link to from the current draft.

    Scoring: +3 per overlapping tag, +1 if same category. Only `published`
    posts are returned — never link to drafts/scheduled. Returns a slim
    payload (slug, title, category, tags, score) so the editor can render
    a sidebar widget with one-click "Insert link" buttons. POST so the
    tags array doesn't blow out the URL length on heavily-tagged drafts.

    Declared BEFORE `/admin/blogs/{slug}` so the dynamic-slug GET doesn't
    swallow `related-suggestions` as a slug. (Same trick as slug-available.)
    """
    await get_current_admin(request)
    db = request.app.state.db

    # Normalize tags: lowercase, strip, drop empties + de-dupe.
    norm_tags = list({t.strip().lower() for t in (body.tags or []) if t and t.strip()})
    cat = (body.category or "").strip()
    exclude = (body.exclude_slug or "").strip()

    # Match any post with at least one overlapping tag OR same category.
    # Tags stored case-mixed → use $regex case-insensitive match per tag.
    or_clauses: list[dict] = []
    if norm_tags:
        or_clauses.append({"tags": {"$in": [t for t in norm_tags] + [t.title() for t in norm_tags]}})
    if cat:
        or_clauses.append({"category": cat})
    if not or_clauses:
        return {"suggestions": []}

    query: dict = {
        "status": "published",
        "$or": or_clauses,
    }
    if exclude:
        query["slug"] = {"$ne": exclude}

    # Cap the candidate pool so we don't scan the entire collection on
    # popular tags. 50 is plenty — we only ever surface the top `limit`.
    candidates = await db.blog_posts.find(
        query,
        {
            "_id": 0, "slug": 1, "title": 1, "title_de": 1,
            "category": 1, "tags": 1, "excerpt": 1, "excerpt_de": 1,
            "date": 1, "featured_image": 1,
        },
    ).sort("date", -1).limit(50).to_list(50)

    # Score in Python — simple, deterministic, fast on a 50-row pool.
    scored = []
    for p in candidates:
        post_tags_lower = {(t or "").strip().lower() for t in (p.get("tags") or [])}
        tag_overlap = len(post_tags_lower & set(norm_tags))
        score = tag_overlap * 3
        if cat and p.get("category") == cat:
            score += 1
        if score <= 0:
            continue
        scored.append({
            "slug": p.get("slug"),
            "title": p.get("title"),
            "title_de": p.get("title_de", ""),
            "category": p.get("category"),
            "tags": p.get("tags") or [],
            "excerpt": p.get("excerpt", ""),
            "date": p.get("date", ""),
            "featured_image": p.get("featured_image", ""),
            "score": score,
            "tag_overlap": tag_overlap,
        })

    scored.sort(key=lambda x: (x["score"], x.get("date", "")), reverse=True)

    return {"suggestions": scored[: max(1, min(20, body.limit))]}


@router.get("/admin/blogs/{slug}")
async def admin_get_blog(request: Request, slug: str):
    await get_current_admin(request)
    db = request.app.state.db
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"post": post}


@router.post("/admin/blogs")
async def admin_create_blog(request: Request, body: BlogPostCreate):
    await get_current_admin(request)
    db = request.app.state.db

    exists = await db.blog_posts.find_one({"slug": body.slug})
    if exists:
        raise HTTPException(status_code=409, detail="Slug already exists")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        **body.model_dump(),
        "date": now[:10],
        "created_at": now,
        "updated_at": now,
    }

    # Auto-translate missing language
    doc = await _auto_translate_missing(doc, db=db)

    # Sanitize HTML on write (defense-in-depth — don't trust the client).
    doc = sanitize_blog_fields(doc)

    await db.blog_posts.insert_one(doc)
    doc.pop("_id", None)
    return {"post": doc, "message": "Post created"}


@router.put("/admin/blogs/{slug}")
async def admin_update_blog(request: Request, slug: str, body: BlogPostUpdate):
    await get_current_admin(request)
    db = request.app.state.db

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    # Check if we need auto-translate: merge with existing doc to detect missing language
    existing = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if existing:
        # Snapshot the pre-update state into blog_revisions BEFORE we touch
        # the live doc. Stripped of _id and capped at 50 revisions per slug
        # (admin can review/restore via /admin/blogs/:slug/revisions).
        revision = {k: v for k, v in existing.items() if k != "_id"}
        revision["_revision_at"] = datetime.now(timezone.utc).isoformat()
        revision["_revision_slug"] = slug
        await db.blog_revisions.insert_one(revision)
        # Trim history: keep only the 50 newest per slug.
        cursor = db.blog_revisions.find(
            {"_revision_slug": slug}, {"_id": 1}
        ).sort("_revision_at", -1).skip(50).limit(500)
        old_ids = [d["_id"] async for d in cursor]
        if old_ids:
            await db.blog_revisions.delete_many({"_id": {"$in": old_ids}})

        merged = {**existing, **updates}
        translated = await _auto_translate_missing(merged, db=db)
        # Only add newly translated fields to updates
        for key in [
            "title_de", "excerpt_de", "content_html_de", "tags_de",
            "seo_title_de", "seo_description_de",
            "title", "excerpt", "content_html", "tags",
            "seo_title", "seo_description",
        ]:
            if key not in updates and translated.get(key) != existing.get(key) and translated.get(key):
                updates[key] = translated[key]

        # Edit-aware dirty-tracking: if the editor changed English on an
        # already-translated post, refresh ONLY the German fields whose English
        # source changed (existing posts/fields untouched; hand-edited German in
        # this same save is preserved). Runs after the fill-missing merge above
        # so a just-filled German field is skipped (it's already in `updates`).
        updates.update(await _retranslate_changed_fields(existing, updates, db=db))

    # Sanitize any HTML body fields being written (defense-in-depth).
    updates = sanitize_blog_fields(updates)

    result = await db.blog_posts.update_one({"slug": slug}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    return {"post": post, "message": "Post updated"}


@router.delete("/admin/blogs/{slug}")
async def admin_delete_blog(request: Request, slug: str):
    await get_current_admin(request)
    db = request.app.state.db
    result = await db.blog_posts.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    # Also nuke its revision history — keeping orphans clutters the collection.
    await db.blog_revisions.delete_many({"_revision_slug": slug})
    return {"message": "Post deleted"}


# ─── New blog admin productivity endpoints ───────────────────────────


@router.post("/admin/blogs/{slug}/duplicate")
async def admin_duplicate_blog(request: Request, slug: str):
    """
    Clone an existing post as a fresh draft. New slug = old slug + "-copy"
    (with -2/-3/... suffix if collisions). Status forced to draft regardless
    of source status so duplicates never auto-publish.
    """
    await get_current_admin(request)
    db = request.app.state.db
    src = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not src:
        raise HTTPException(status_code=404, detail="Source post not found")

    # Find a non-colliding slug
    base = f"{slug}-copy"
    new_slug = base
    n = 2
    while await db.blog_posts.find_one({"slug": new_slug}, {"_id": 1}):
        new_slug = f"{base}-{n}"
        n += 1

    now_iso = datetime.now(timezone.utc).isoformat()
    clone = {**src}
    clone["id"] = str(uuid.uuid4())
    clone["slug"] = new_slug
    clone["title"] = f"{src.get('title') or ''} (Copy)".strip()
    if src.get("title_de"):
        clone["title_de"] = f"{src['title_de']} (Kopie)"
    clone["status"] = "draft"
    clone["scheduled_at"] = None
    clone["date"] = now_iso[:10]
    clone["created_at"] = now_iso
    clone["updated_at"] = now_iso
    clone.pop("_id", None)

    await db.blog_posts.insert_one(clone)
    clone.pop("_id", None)
    return {"post": clone, "message": f"Duplicated as {new_slug}"}


class BulkBlogAction(BaseModel):
    slugs: list[str]
    action: str  # "publish" | "unpublish" | "delete"


@router.post("/admin/blogs/bulk")
async def admin_bulk_blog_action(request: Request, body: BulkBlogAction):
    """
    Apply a single action to many posts at once. Returns counts per outcome.
    Only admins may use this — editors typically shouldn't be able to mass-delete.
    """
    user = await get_current_admin(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    db = request.app.state.db

    if not body.slugs:
        raise HTTPException(status_code=400, detail="No posts selected")
    if body.action not in {"publish", "unpublish", "delete"}:
        raise HTTPException(status_code=400, detail="Unknown action")

    if body.action == "delete":
        result = await db.blog_posts.delete_many({"slug": {"$in": body.slugs}})
        await db.blog_revisions.delete_many({"_revision_slug": {"$in": body.slugs}})
        return {"action": "delete", "matched": result.deleted_count, "message": f"Deleted {result.deleted_count} posts"}

    new_status = "published" if body.action == "publish" else "draft"
    result = await db.blog_posts.update_many(
        {"slug": {"$in": body.slugs}},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"action": body.action, "matched": result.modified_count, "message": f"{body.action.title()}ed {result.modified_count} posts"}


@router.get("/admin/blogs/{slug}/revisions")
async def admin_list_revisions(request: Request, slug: str):
    """List up to 50 most recent revisions for a slug (newest first)."""
    await get_current_admin(request)
    db = request.app.state.db
    cursor = db.blog_revisions.find(
        {"_revision_slug": slug},
        {"_id": 0, "content_html": 0, "content_html_de": 0},  # omit heavy bodies — caller fetches one
    ).sort("_revision_at", -1).limit(50)
    revisions = []
    async for doc in cursor:
        revisions.append({
            "revision_at": doc.get("_revision_at"),
            "title": doc.get("title"),
            "title_de": doc.get("title_de"),
            "status": doc.get("status"),
            "excerpt": doc.get("excerpt"),
        })
    return {"slug": slug, "revisions": revisions}


@router.post("/admin/blogs/{slug}/revisions/restore")
async def admin_restore_revision(request: Request, slug: str, revision_at: str):
    """
    Restore a specific revision back into the live post. The pre-restore
    state is itself snapshotted into blog_revisions so a restore can be
    undone immediately.
    """
    await get_current_admin(request)
    db = request.app.state.db

    revision = await db.blog_revisions.find_one(
        {"_revision_slug": slug, "_revision_at": revision_at},
        {"_id": 0},
    )
    if not revision:
        raise HTTPException(status_code=404, detail="Revision not found")

    current = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Post not found")

    # Snapshot the current state before overwriting
    snapshot = {**current, "_revision_at": datetime.now(timezone.utc).isoformat(), "_revision_slug": slug}
    await db.blog_revisions.insert_one(snapshot)

    # Restore: copy everything from the revision EXCEPT the bookkeeping keys.
    restore = {k: v for k, v in revision.items() if not k.startswith("_revision")}
    restore["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.blog_posts.update_one({"slug": slug}, {"$set": restore})

    return {"message": f"Restored revision from {revision_at}", "slug": slug}


@router.post("/admin/blogs/{slug}/publish")
async def admin_publish_blog(request: Request, slug: str):
    await get_current_admin(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.update_one(
        {"slug": slug},
        {"$set": {"status": "published", "date": now[:10], "updated_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post published"}


@router.post("/admin/blogs/{slug}/schedule")
async def admin_schedule_blog(request: Request, slug: str, scheduled_at: str):
    await get_current_admin(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.update_one(
        {"slug": slug},
        {"$set": {"status": "scheduled", "scheduled_at": scheduled_at, "updated_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": f"Post scheduled for {scheduled_at}"}
