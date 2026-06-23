from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from datetime import datetime, timezone

from utils.rate_limit import limiter, client_ip

router = APIRouter()


@router.get("/blogs")
async def get_blog_listing(
    request: Request,
    category: str = Query(None),
    lang: str = Query("en"),
    page: int = Query(1, ge=1),
    limit: int = Query(200, ge=1, le=500),
):
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()

    # Server-side filtering: published OR (scheduled AND scheduled_at <= now)
    query = {
        "$or": [
            {"status": "published"},
            {"status": "scheduled", "scheduled_at": {"$lte": now}},
        ]
    }
    if category and category != "All":
        query = {"$and": [query, {"category": category}]}

    total = await db.blog_posts.count_documents(query)
    skip = (page - 1) * limit

    # Listing projection: exclude heavy HTML body fields, only fetch what UI needs
    LISTING_PROJECTION = {
        "_id": 0, "id": 1, "title": 1, "title_de": 1, "excerpt": 1, "excerpt_de": 1,
        "slug": 1, "category": 1, "author": 1, "date": 1, "read_time": 1, "readTime": 1,
        "featured_image": 1, "tags": 1, "tags_de": 1, "status": 1, "scheduled_at": 1,
    }
    paginated = await db.blog_posts.find(query, LISTING_PROJECTION).sort("date", -1).skip(skip).limit(limit).to_list(limit)

    # Map language-appropriate fields
    for p in paginated:
        p["readTime"] = p.get("read_time", p.get("readTime", "5 min read"))
        if lang == "de":
            if p.get("title_de"):
                p["title"] = p["title_de"]
            if p.get("excerpt_de"):
                p["excerpt"] = p["excerpt_de"]
            if p.get("tags_de"):
                p["tags"] = p["tags_de"]

    return JSONResponse(
        content={"posts": paginated, "total": total, "page": page, "limit": limit},
        headers={"Cache-Control": "public, max-age=60"},
    )


@router.get("/blogs/categories/list")
async def get_blog_categories(request: Request):
    db = request.app.state.db
    categories = await db.blog_posts.distinct("category")
    return JSONResponse(
        content={"categories": sorted(categories)},
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.get("/blogs/{slug}")
async def get_blog_post(request: Request, slug: str, lang: str = Query("en")):
    db = request.app.state.db
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Track which language we actually served so the frontend can set the
    # canonical correctly. Without this signal, a DE request that falls
    # back to EN content makes /de/blog/x and /en/blog/x serve identical
    # HTML with self-canonicals → Search Console flags it as "Duplicate
    # without user-selected canonical".
    # A post counts as German only when BOTH the title AND the body exist —
    # otherwise a half-translated post (German title, empty German body) would
    # set served_lang="de" and serve an empty article. Mirrors the translate
    # helper's own definition of "has a German translation".
    has_de = bool((post.get("title_de") or "").strip() and (post.get("content_html_de") or "").strip())
    served_lang = "de" if (lang == "de" and has_de) else "en"

    # `date_modified` is the canonical "last meaningfully edited" timestamp.
    # AI search engines (Perplexity, ChatGPT Search, Gemini) heavily weight
    # content freshness when deciding what to cite. Without this, every
    # post looks the same age (only the `date` field).
    # Resolution order: explicit dateModified → updated_at → created_at → date.
    date_modified = (
        post.get("dateModified")
        or post.get("updated_at")
        or post.get("created_at")
        or post.get("date", "")
    )

    # Select language-appropriate fields
    if served_lang == "de":
        normalized = {
            "id": post.get("id", slug),
            "slug": post.get("slug", slug),
            # Truthy (`or`) fallbacks so an empty German field falls back to the
            # English value rather than serving a blank.
            "title": post.get("title_de") or post.get("title", ""),
            "excerpt": post.get("excerpt_de") or post.get("excerpt", ""),
            "content_html": post.get("content_html_de") or post.get("content_html", ""),
            "category": post.get("category", ""),
            "author": post.get("author", ""),
            "date": post.get("date", ""),
            "date_modified": date_modified,
            "readTime": post.get("read_time", ""),
            "featured_image": post.get("featured_image", ""),
            "tags": post.get("tags_de") or post.get("tags", []),
            # SEO meta overrides — prefer the German override, fall back to
            # the English override so a translated post never ships with
            # nothing in <title>/<meta name="description">.
            "seo_title": post.get("seo_title_de") or post.get("seo_title", ""),
            "seo_description": post.get("seo_description_de") or post.get("seo_description", ""),
            "sections": [],
            "source": "mongodb",
            "ai_generated": bool(post.get("ai_generated", False)),
        }
    else:
        normalized = {
            "id": post.get("id", slug),
            "slug": post.get("slug", slug),
            "title": post.get("title", ""),
            "excerpt": post.get("excerpt", ""),
            "content_html": post.get("content_html", ""),
            "category": post.get("category", ""),
            "author": post.get("author", ""),
            "date": post.get("date", ""),
            "date_modified": date_modified,
            "readTime": post.get("read_time", ""),
            "featured_image": post.get("featured_image", ""),
            "tags": post.get("tags", []),
            "seo_title": post.get("seo_title", ""),
            "seo_description": post.get("seo_description", ""),
            "sections": [],
            "source": "mongodb",
            "ai_generated": bool(post.get("ai_generated", False)),
        }

    # Surface the served language + translation availability so the
    # frontend can set canonical/hreflang correctly.
    normalized["served_lang"] = served_lang
    normalized["has_de_translation"] = has_de

    return JSONResponse(
        content={"post": normalized, "source": "mongodb"},
        headers={"Cache-Control": "public, max-age=60"},
    )


@router.post("/blogs/{slug}/view")
@limiter.limit("30/minute")
async def record_blog_view(request: Request, slug: str):
    """
    Lightweight, fire-and-forget hit counter. Increments
    `blog_posts.view_count` and, for the dashboard's recent-views chart,
    inserts a row into `blog_views` with a coarse hourly bucket.

    Public endpoint — no auth — so it has two abuse guards:
      1. A per-IP rate limit (slowapi, 30/min) caps raw request volume.
      2. Per-IP+slug+hour dedupe: the view_count / blog_views increments
         only fire on the FIRST hit from an IP for a slug in a given hour,
         so a refresh/loop can't inflate the counter. The dedupe rows live
         in `blog_view_dedupe` and self-expire via a TTL index (server.py).
    The dashboard treats these as a relative signal, not absolute truth.
    """
    db = request.app.state.db
    # Verify the slug exists so bots can't grow the collection by hitting
    # random slugs.
    exists = await db.blog_posts.find_one({"slug": slug}, {"_id": 1})
    if not exists:
        raise HTTPException(status_code=404, detail="Post not found")

    now = datetime.now(timezone.utc)
    # Round down to the hour for both the dedupe key and the chart bucket.
    bucket = now.replace(minute=0, second=0, microsecond=0).isoformat()

    # Dedupe: only the first hit from this IP for this slug+hour counts.
    ip = client_ip(request)
    dedupe = await db.blog_view_dedupe.update_one(
        {"ip": ip, "slug": slug, "hour": bucket},
        {"$setOnInsert": {"ip": ip, "slug": slug, "hour": bucket, "created_at": now}},
        upsert=True,
    )
    if dedupe.upserted_id is None:
        # Already counted this IP for this slug+hour — no-op.
        return JSONResponse({"ok": True, "counted": False}, headers={"Cache-Control": "no-store"})

    await db.blog_posts.update_one(
        {"slug": slug},
        {"$inc": {"view_count": 1}, "$set": {"last_viewed_at": now.isoformat()}},
    )
    await db.blog_views.update_one(
        {"slug": slug, "hour": bucket},
        {"$inc": {"count": 1}, "$setOnInsert": {"slug": slug, "hour": bucket}},
        upsert=True,
    )
    return JSONResponse({"ok": True, "counted": True}, headers={"Cache-Control": "no-store"})
