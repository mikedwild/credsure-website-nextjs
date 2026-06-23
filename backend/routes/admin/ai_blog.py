"""
AI blog content endpoints: recommend, generate, multi-step authoring
wizard (presets / keyword-research / generate-draft), and async-job
variants that avoid the 100s proxy timeout.
"""
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid
import logging

from utils.auth import get_current_admin
from utils.ai_content import recommend_topics, generate_blog_post
from utils.blog_translate import auto_translate_missing as _auto_translate_missing
from utils.sanitize import sanitize_blog_fields
from utils.rate_limit import limiter
from ai import feature_flags as ai_flags
from ai import job_store as ai_jobs


router = APIRouter()
logger = logging.getLogger(__name__)


# ─── AI Content Recommendation & Generation ─────────────────────────

class GenerateRequest(BaseModel):
    topic: str
    keywords: List[str] = []
    category: str = "Uncategorized"
    excerpt: str = ""


@router.post("/admin/ai/recommend")
async def admin_ai_recommend(request: Request):
    """Generate AI-powered blog topic recommendations."""
    await get_current_admin(request)
    if not ai_flags.ai_blog_recommend():
        raise HTTPException(status_code=503, detail="AI topic recommendation is currently disabled")
    db = request.app.state.db
    topics = await recommend_topics(db, count=8)
    return {"topics": topics}


@router.post("/admin/ai/generate")
@limiter.limit("20/hour")
async def admin_ai_generate(request: Request, body: GenerateRequest):
    """Generate a full blog post from a topic, auto-translate, and save as draft."""
    await get_current_admin(request)
    if not ai_flags.ai_blog_generate():
        raise HTTPException(status_code=503, detail="AI blog generation is currently disabled")
    db = request.app.state.db
    # Generate the English post
    post_data = await generate_blog_post(
        topic=body.topic, keywords=body.keywords,
        category=body.category, excerpt_hint=body.excerpt, db=db,
    )
    if not post_data:
        raise HTTPException(status_code=500, detail="Failed to generate blog content")

    # Build slug
    slug_base = post_data.get("title", body.topic).lower()
    slug_base = "".join(c if c.isalnum() or c == " " else "" for c in slug_base).strip()
    slug_base = slug_base.replace(" ", "-")[:60]
    # Ensure unique
    existing = await db.blog_posts.find_one({"slug": slug_base})
    slug = f"{slug_base}-{uuid.uuid4().hex[:4]}" if existing else slug_base

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "title": post_data.get("title", body.topic),
        "title_de": "",
        "slug": slug,
        "excerpt": post_data.get("excerpt", body.excerpt),
        "excerpt_de": "",
        "content_html": post_data.get("content_html", ""),
        "content_html_de": "",
        "category": body.category,
        "tags": body.keywords,
        "tags_de": [],
        "author": "CredSure Team",
        "read_time": post_data.get("read_time", "5 min read"),
        "status": "draft",
        "scheduled_at": None,
        "featured_image": "",
        "seo_title": post_data.get("seo_title", ""),
        "seo_description": post_data.get("seo_description", ""),
        "seo_title_de": "",
        "seo_description_de": "",
        "ai_generated": True,
        "date": now[:10],
        "created_at": now,
        "updated_at": now,
    }

    # Auto-translate to German
    doc = await _auto_translate_missing(doc, db=db)

    # Sanitize LLM-produced HTML on write — model output is untrusted input.
    doc = sanitize_blog_fields(doc)

    await db.blog_posts.insert_one(doc)
    doc.pop("_id", None)
    logger.info(f"AI generated blog: {doc['title'][:60]}")
    return {"post": doc, "message": "Blog post generated and saved as draft"}


# ─── AI Blog Generator (multi-step authoring flow) ───────────────────
# Ported from unified-talent-hub/backend/routes/ai_blog_generator.py.
# Three endpoints power the new <AIBlogGenerator/> wizard UI:
#   GET  /admin/ai/presets          → dropdown options (model/style/length/...)
#   POST /admin/ai/keyword-research → industry-aware keyword recommendations
#   POST /admin/ai/generate-draft   → single draft with steering knobs

class KeywordResearchRequest(BaseModel):
    industry: Optional[str] = None
    count: int = 10


class GenerateDraftRequest(BaseModel):
    keyword: str
    industry: str = "general"
    target_language: str = "en"
    # Steering knobs — all optional; defaults match AISteeringPanel UI.
    preset: str = "balanced"
    style: str = "b2b"
    reading_level: str = "standard"
    length: str = "standard"
    language_voice: str = "en"
    humanize: bool = True


@router.get("/admin/ai/presets")
async def admin_ai_presets(request: Request):
    """
    Return the option lists rendered by <AISteeringPanel/>. Static for
    now — the panel hydrates its dropdowns from this so backend changes
    propagate without a frontend deploy.
    """
    await get_current_admin(request)
    return {
        "model_presets": [
            {"value": "fast",     "label": "Fast — quick drafts"},
            {"value": "balanced", "label": "Balanced — Claude Sonnet (default)"},
            {"value": "premium",  "label": "Premium — Claude Sonnet, longer context"},
        ],
        "styles": [
            {"value": "b2b",            "label": "CredSure B2B (default)"},
            {"value": "conversational", "label": "Conversational"},
            {"value": "storytelling",   "label": "Storytelling"},
        ],
        "reading_levels": [
            {"value": "simple",   "label": "Simple"},
            {"value": "standard", "label": "Standard"},
            {"value": "expert",   "label": "Expert"},
        ],
        "lengths": [
            {"value": "short",    "label": "Short (400–600 w)"},
            {"value": "standard", "label": "Standard (900–1200 w)"},
            {"value": "long",     "label": "Long (1500–2000 w)"},
            {"value": "pillar",   "label": "Pillar (2500–3200 w)"},
        ],
        "language_voices": [
            {"value": "en",     "label": "English (default)"},
            {"value": "de_sie", "label": "Deutsch — Sie-Form"},
            {"value": "de_du",  "label": "Deutsch — Du-Form"},
        ],
        "defaults": {
            "preset": "balanced",
            "style": "b2b",
            "reading_level": "standard",
            "length": "standard",
            "language_voice": "en",
            "humanize": True,
        },
    }


# Industry-tagged seed keywords for the credentialing space. We could call
# the LLM here for richer recommendations, but the seed list is the most
# reliable thing on a low-volume marketing site — and free.
_INDUSTRY_KEYWORDS = {
    "higher-education": [
        ("digital diplomas",                          1900, "medium"),
        ("blockchain transcripts",                     880, "medium"),
        ("verifiable academic credentials",            720, "low"),
        ("micro-credentials for universities",        2400, "medium"),
        ("digital badges in higher education",        1300, "low"),
        ("alumni credential portal",                   320, "low"),
        ("open badges 3.0 implementation",             590, "medium"),
        ("graduation ceremony digital certificates",   720, "low"),
        ("MOOC certificate verification",              480, "low"),
        ("LTI credentialing integration",              260, "high"),
    ],
    "corporate-training": [
        ("employee training certificates",            3600, "medium"),
        ("L&D digital credentials",                    880, "low"),
        ("compliance training certificates",          2400, "high"),
        ("leadership programme badges",                590, "low"),
        ("skills-based credentialing employees",       720, "medium"),
        ("upskilling certificate ROI",                 320, "low"),
        ("training programme analytics",              1300, "medium"),
        ("compliance certificate management",         1100, "medium"),
        ("LMS credential integration",                 720, "medium"),
        ("digital learning portfolios",                590, "low"),
    ],
    "certification-bodies": [
        ("digital professional certificates",         2900, "medium"),
        ("ISO certificate management",                1900, "high"),
        ("professional licence verification",         1600, "medium"),
        ("CPD credential tracking",                    720, "low"),
        ("recertification reminders automation",       320, "low"),
        ("exam result digital delivery",               480, "low"),
        ("credentialing body fraud prevention",        260, "low"),
        ("certification audit trail",                  590, "medium"),
        ("white-label certificate platform",          1300, "high"),
        ("API-first credentialing",                    880, "medium"),
    ],
    "healthcare": [
        ("nurse credential verification",             3200, "medium"),
        ("clinical training certificates",            1600, "low"),
        ("CME credit tracking",                       2400, "medium"),
        ("HIPAA compliance certificates",             1900, "high"),
        ("medical licence portability",                880, "medium"),
        ("nursing CEU digital credentials",            720, "low"),
        ("hospital staff onboarding credentials",      590, "low"),
        ("healthcare CPD platform",                    480, "medium"),
        ("medical credentialing software",            2900, "high"),
        ("digital nursing portfolios",                 320, "low"),
    ],
    "general": [
        ("digital credentialing platform",            4400, "high"),
        ("blockchain certificate verification",       2900, "medium"),
        ("how to create digital certificates",        3600, "medium"),
        ("verifiable credentials open standards",      720, "low"),
        ("credential sharing LinkedIn",               1900, "low"),
        ("certificate template designer",             2400, "medium"),
        ("instant credential verification API",        880, "medium"),
        ("digital badge vs digital certificate",      1300, "low"),
        ("EU eIDAS digital signatures certificates",   590, "high"),
        ("W3C verifiable credentials guide",           720, "medium"),
    ],
}


def _normalize_industry(raw: Optional[str]) -> str:
    if not raw:
        return "general"
    s = raw.lower().strip().replace("_", "-")
    return s if s in _INDUSTRY_KEYWORDS else "general"


@router.post("/admin/ai/keyword-research")
async def admin_ai_keyword_research(request: Request, body: KeywordResearchRequest):
    """Return industry-tagged keyword ideas with search volume + difficulty."""
    await get_current_admin(request)
    industry = _normalize_industry(body.industry)
    seeds = _INDUSTRY_KEYWORDS.get(industry, _INDUSTRY_KEYWORDS["general"])
    limit = max(1, min(body.count or 10, len(seeds)))

    recommendations = []
    for keyword, search_volume, difficulty in seeds[:limit]:
        # 2% CTR (industry-realistic for blog #3-#5 ranking) → estimated traffic.
        recommendations.append({
            "keyword": keyword,
            "title": keyword.title(),
            "industry": industry,
            "search_volume": search_volume,
            "difficulty": difficulty,
            "estimated_traffic": int(search_volume * 0.02),
        })
    return {"industry": industry, "recommendations": recommendations}


async def _perform_generate_draft(db, body: "GenerateDraftRequest") -> dict:
    """
    Core generation work for /admin/ai/generate-draft.
    Extracted so the async-job runner can call the same code path.
    Returns the same shape the sync endpoint does.
    """
    if not ai_flags.ai_blog_generate():
        raise HTTPException(status_code=503, detail="AI blog generation is currently disabled")

    # Fold steering knobs into an instruction prefix the LLM honours.
    length_words = {"short": "500", "standard": "1000", "long": "1700", "pillar": "2800"}.get(body.length, "1000")
    style_label = {"b2b": "professional B2B", "conversational": "conversational", "storytelling": "storytelling"}.get(body.style, "professional B2B")
    reading_label = {"simple": "easy-to-read (Flesch 70+)", "standard": "standard business audience", "expert": "expert / technical audience"}.get(body.reading_level, "standard business audience")
    voice_label = {"en": "US English", "de_sie": "German (formal, Sie-Form)", "de_du": "German (informal, Du-Form)"}.get(body.language_voice, "US English")

    steering_hint = (
        f"Write in {voice_label}, {style_label} tone, for a {reading_label}. "
        f"Target length ~{length_words} words. "
        f"{'Apply a humanize pass: avoid AI tells (banned phrases, em-dash overuse, adverb pile-ups). ' if body.humanize else ''}"
    )

    post_data = await generate_blog_post(
        topic=body.keyword,
        keywords=[body.keyword],
        category=body.industry.replace("-", " ").title(),
        excerpt_hint=steering_hint, db=db,
    )
    if not post_data:
        raise HTTPException(status_code=500, detail="Failed to generate blog content")

    slug_base = "".join(c if c.isalnum() or c == " " else "" for c in post_data.get("title", body.keyword).lower()).strip().replace(" ", "-")[:60]
    existing = await db.blog_posts.find_one({"slug": slug_base})
    slug = f"{slug_base}-{uuid.uuid4().hex[:4]}" if existing else slug_base

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "title": post_data.get("title", body.keyword),
        "title_de": "",
        "slug": slug,
        "excerpt": post_data.get("excerpt", ""),
        "excerpt_de": "",
        "content_html": post_data.get("content_html", ""),
        "content_html_de": "",
        "category": body.industry.replace("-", " ").title(),
        "tags": [body.keyword],
        "tags_de": [],
        "author": "CredSure Team",
        "read_time": post_data.get("read_time", "5 min read"),
        "status": "draft",
        "scheduled_at": None,
        "featured_image": "",
        "seo_title": post_data.get("seo_title", ""),
        "seo_description": post_data.get("seo_description", ""),
        "seo_title_de": "",
        "seo_description_de": "",
        "ai_generated": True,
        "ai_steering": {
            "preset": body.preset,
            "style": body.style,
            "reading_level": body.reading_level,
            "length": body.length,
            "language_voice": body.language_voice,
            "humanize": body.humanize,
        },
        "date": now[:10],
        "created_at": now,
        "updated_at": now,
    }
    doc = await _auto_translate_missing(doc, db=db)
    # Sanitize LLM-produced HTML on write — model output is untrusted input.
    doc = sanitize_blog_fields(doc)
    await db.blog_posts.insert_one(doc)
    doc.pop("_id", None)

    plain = post_data.get("content_html", "")
    word_count = len(plain.split()) if plain else 0
    return {
        "post_id": doc["id"],
        "slug": doc["slug"],
        "title": doc["title"],
        "word_count": word_count,
        "status": "draft",
    }


@router.post("/admin/ai/generate-draft")
@limiter.limit("20/hour")
async def admin_ai_generate_draft(request: Request, body: GenerateDraftRequest):
    """
    Synchronous draft generation — kept for backwards compatibility and
    short-form drafts. Blocks for the full LLM call (30-90 s). For long
    drafts that risk the 100s proxy timeout, use the async job variant
    at /admin/ai/jobs/generate-draft.
    """
    await get_current_admin(request)
    db = request.app.state.db
    return await _perform_generate_draft(db, body)


# ─── Async AI Jobs (avoids 100s proxy timeout for long generation) ────

@router.post("/admin/ai/jobs/generate-draft")
@limiter.limit("20/hour")
async def admin_ai_jobs_generate_draft(
    request: Request,
    body: GenerateDraftRequest,
    background_tasks: BackgroundTasks,
):
    """
    Non-blocking variant of /admin/ai/generate-draft. Returns immediately
    with a job_id; the actual generation runs as a FastAPI BackgroundTask
    and writes the result back to MongoDB. Poll GET /admin/ai/jobs/{id}.

    Solves the 100s proxy timeout that bites long-form blog generation
    (pillar posts can exceed 90 s on the LLM call alone, then add
    auto-translate on top).
    """
    admin = await get_current_admin(request)
    db = request.app.state.db
    if not ai_flags.ai_blog_generate():
        raise HTTPException(status_code=503, detail="AI blog generation is currently disabled")

    job_id = await ai_jobs.create_job(
        db,
        kind="generate-draft",
        params=body.model_dump(),
        owner_email=admin.get("email") if isinstance(admin, dict) else None,
    )

    async def _runner():
        return await _perform_generate_draft(db, body)

    background_tasks.add_task(ai_jobs.run_with_tracking, db, job_id, _runner)
    return {"job_id": job_id, "status": "pending"}


@router.get("/admin/ai/jobs/{job_id}")
async def admin_ai_jobs_get(request: Request, job_id: str):
    """Poll a job's status. Returns the full job record (status, result,
    error). Status values: pending → running → complete | failed.
    """
    await get_current_admin(request)
    db = request.app.state.db
    job = await ai_jobs.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
