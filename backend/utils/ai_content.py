"""LLM-powered translation and content generation utilities.

Phase 0 (observability-only) wraps every LLM call with:
  - telemetry (latency + cost + token estimates → MongoDB)
  - cache lookup (currently disabled — only records would-have-hits)
  - per-request agent-call guard (charter §10)

No prompt or model changes; behaviour is preserved byte-for-byte.
Routes that pass `db` and `request_id` get observability; routes that
don't (legacy callers) still work but skip telemetry.
"""
import os
import uuid
import logging

from ai import telemetry as ai_telemetry
from ai import cache as ai_cache
from ai import routing as ai_routing
from ai.guard import RequestGuard
from ai.knowledge import brand_names_for_prompt
from utils.llm_keys import get_llm_key

logger = logging.getLogger(__name__)

LANG_NAMES = {"en": "English", "de": "German"}

# Pre-rendered brand-names list — used in prompt strings below to avoid
# repeating "(CredSure, ByteEDGE, Tsaaro, Clini INDIA)" in six places.
# Source of truth: /app/backend/ai/knowledge.py.
_BRANDS = brand_names_for_prompt()

# Module-level routing default. Each translate.* intent goes through
# ai_routing.resolve(intent), which returns Claude Sonnet 4.5 today
# but lets Phase 1 reroute per intent without touching this file.
# Kept for back-compat with any external caller importing the constant.
TRANSLATION_MODEL = ("anthropic", "claude-sonnet-4-5-20250929")


# Key resolution now goes through utils.llm_keys.get_llm_key(db, provider),
# which reads the admin-configured key (site_settings) → env (ANTHROPIC_API_KEY /
# OPENAI_API_KEY) → legacy EMERGENT_LLM_KEY. The async call sites pass `db`.


def _clean(text: str) -> str:
    return (text or "").strip().strip('"').strip("'")


def _strip_code_fence(out: str) -> str:
    """Strip accidental ```html / ``` fences the model occasionally adds."""
    out = (out or "").strip()
    if not out.startswith("```"):
        return out
    out = out.split("\n", 1)[1] if "\n" in out else out[3:]
    if out.endswith("```"):
        out = out[:-3]
    out = out.strip()
    if out.lower().startswith("html"):
        out = out[4:].strip()
    return out


async def _translate_one(
    *,
    intent: str,
    system_message: str,
    user_text: str,
    cache_inputs: dict,
    db,
    guard: RequestGuard,
    workflow: str | None,
    request_id: str | None,
    user_email: str | None,
) -> str:
    """Single instrumented LLM call.

    - Resolves the model via `ai_routing.resolve(intent)` (today: always
      Claude Sonnet 4.5; Phase 1 will fan out per intent).
    - Looks up the cache. On a real hit (only when `AI_CACHE_ENABLED=1`)
      returns immediately and records `cache_hit=True` telemetry. On a
      "would-have-hit" records that for projected savings.
    - Records latency + token estimates + cost in MongoDB via
      `ai_telemetry.trace(...)`.
    - Counts against the per-request `RequestGuard` cap.
    """
    spec = ai_routing.resolve(intent)

    # Cache probe — both real-hit and would-have-hit cases recorded
    status, cached = await ai_cache.lookup(
        db, intent=intent, provider=spec.provider, model=spec.model, inputs=cache_inputs,
    )
    if status == "hit" and cached is not None:
        # Real cache hit — skip LLM entirely. Still write a telemetry row
        # with latency_ms=0 so cost dashboards see the saved spend.
        await ai_telemetry.record(
            db,
            intent=intent, provider=spec.provider, model=spec.model,
            input_chars=len(user_text), output_chars=len(str(cached)),
            latency_ms=0, workflow=workflow, cache_hit=True,
            request_id=request_id, user_email=user_email,
        )
        return str(cached)

    # Cache miss (or cache disabled) — call the LLM under instrumentation
    from utils.llm_chat import LlmChat, UserMessage
    async with guard.call(intent):
        async with ai_telemetry.trace(
            db,
            intent=intent, provider=spec.provider, model=spec.model,
            workflow=workflow,
            cache_hit=(False if status == "miss" else
                       "would_have_hit" if status == "would_have_hit" else None),
            request_id=request_id, user_email=user_email,
        ) as t:
            chat = LlmChat(
                api_key=await get_llm_key(db, spec.provider),
                session_id=f"{intent}-{uuid.uuid4().hex[:8]}",
                system_message=system_message,
            ).with_model(spec.provider, spec.model)
            t.input_chars = len(system_message) + len(user_text)
            resp = await chat.send_message(UserMessage(text=user_text))
            t.output_chars = len(resp or "")

    # Best-effort cache write so future calls can register would-have-hits
    await ai_cache.store(
        db, intent=intent, provider=spec.provider, model=spec.model,
        inputs=cache_inputs, value=resp,
    )
    return resp


async def translate_fields(
    title: str = "",
    excerpt: str = "",
    content_html: str = "",
    tags: str = "",
    seo_title: str = "",
    seo_description: str = "",
    source_lang: str = "en",
    target_lang: str = "de",
    *,
    db=None,
    workflow: str | None = None,
    request_id: str | None = None,
    user_email: str | None = None,
):
    """Translate blog fields from one language to another. Returns dict of translated fields.

    Uses Claude Sonnet 4.5 (best marketing tone + HTML structure preservation).
    Each field is translated in an isolated single-shot session to keep the
    target focused and avoid cross-field bleed-through.

    Optional Phase-0 observability kwargs (kw-only so legacy callers
    keep working unchanged):
      - db: motor AsyncIOMotorDatabase — telemetry/cache writes use this
      - workflow: string tag identifying the originating flow
        ("admin.translate" or "blog.auto_translate")
      - request_id: short id correlating the 6 LLM calls of a single request
      - user_email: who initiated this (for per-user spend reporting)
    """
    src = LANG_NAMES.get(source_lang, "English")
    tgt = LANG_NAMES.get(target_lang, "German")
    results: dict = {}

    # Each translation request can fan out to at most 6 fields. We pass
    # allowed=6 explicitly so the elevated count is visible in code
    # review (charter §10 default is 5).
    guard = RequestGuard(allowed=6)

    common = {"source_lang": source_lang, "target_lang": target_lang}
    rid = request_id or ai_telemetry.new_request_id()

    if title.strip():
        resp = await _translate_one(
            intent="translate.title",
            system_message=f"You are a professional marketing translator. Translate the following blog title from {src} to {tgt}. Preserve brand names ({_BRANDS}) verbatim. Return ONLY the translated text — no quotes, no commentary.",
            user_text=title,
            cache_inputs={**common, "field": "title", "input": title},
            db=db, guard=guard, workflow=workflow, request_id=rid, user_email=user_email,
        )
        results["title"] = _clean(resp)

    if excerpt.strip():
        resp = await _translate_one(
            intent="translate.excerpt",
            system_message=f"You are a professional marketing translator. Translate the following blog excerpt from {src} to {tgt}. Preserve brand names verbatim. Keep tone concise and benefit-led. Return ONLY the translated text.",
            user_text=excerpt,
            cache_inputs={**common, "field": "excerpt", "input": excerpt},
            db=db, guard=guard, workflow=workflow, request_id=rid, user_email=user_email,
        )
        results["excerpt"] = _clean(resp)

    if content_html.strip():
        resp = await _translate_one(
            intent="translate.html_body",
            system_message=(
                f"You are a professional marketing translator working with rich HTML blog content. "
                f"Translate the visible text from {src} to {tgt} while STRICTLY preserving every HTML tag, "
                f"attribute, class, id, href, src, alt, data-* attribute, list structure, heading hierarchy, "
                f"inline formatting, links, and image references unchanged. Translate alt text and image "
                f"captions. Preserve brand names ({_BRANDS}) verbatim. "
                f"Do NOT add Markdown. Do NOT wrap the output in code fences. Return ONLY the translated HTML."
            ),
            user_text=content_html,
            cache_inputs={**common, "field": "content_html", "input": content_html},
            db=db, guard=guard, workflow=workflow, request_id=rid, user_email=user_email,
        )
        results["content_html"] = _strip_code_fence(resp)

    if tags.strip():
        resp = await _translate_one(
            intent="translate.tags",
            system_message=f"Translate the following comma-separated blog tags from {src} to {tgt}. Keep them concise (1–3 words each). Preserve brand names. Return ONLY the translated comma-separated tags — no numbering, no commentary.",
            user_text=tags,
            cache_inputs={**common, "field": "tags", "input": tags},
            db=db, guard=guard, workflow=workflow, request_id=rid, user_email=user_email,
        )
        results["tags"] = _clean(resp)

    if seo_title.strip():
        resp = await _translate_one(
            intent="translate.seo_title",
            system_message=f"You are an SEO copywriter. Translate the following SEO meta title from {src} to {tgt}. Keep it under 60 characters when possible. Preserve brand names verbatim. Return ONLY the translated text.",
            user_text=seo_title,
            cache_inputs={**common, "field": "seo_title", "input": seo_title},
            db=db, guard=guard, workflow=workflow, request_id=rid, user_email=user_email,
        )
        results["seo_title"] = _clean(resp)

    if seo_description.strip():
        resp = await _translate_one(
            intent="translate.seo_description",
            system_message=f"You are an SEO copywriter. Translate the following SEO meta description from {src} to {tgt}. Aim for 150–160 characters. Preserve brand names verbatim. Return ONLY the translated text.",
            user_text=seo_description,
            cache_inputs={**common, "field": "seo_description", "input": seo_description},
            db=db, guard=guard, workflow=workflow, request_id=rid, user_email=user_email,
        )
        results["seo_description"] = _clean(resp)

    return results


async def recommend_topics(db, count=8):
    """Analyze existing blog topics and recommend new high-value article ideas.

    Phase-0: wrapped in `ai_telemetry.trace` so the dashboard sees this
    call's cost/latency. Caching off (TTL=1 day per /ai/cache); cache
    instrumentation runs anyway to project would-have-hit rate.
    """
    from utils.llm_chat import LlmChat, UserMessage

    # Get existing titles to avoid duplicates
    existing = await db.blog_posts.find({}, {"_id": 0, "title": 1, "category": 1}).limit(500).to_list(500)
    existing_titles = [p["title"] for p in existing if p.get("title")]
    categories = list(set(p.get("category", "") for p in existing if p.get("category")))

    titles_sample = "\n".join(existing_titles[:40])
    cats = ", ".join(categories[:10])

    spec = ai_routing.resolve("blog.recommend")

    # Cache probe (TTL = 1 day) — currently records would-have-hit only.
    cache_inputs = {"count": count, "titles_hash": str(hash(titles_sample)), "cats": cats}
    status, cached = await ai_cache.lookup(
        db, intent="blog.recommend", provider=spec.provider, model=spec.model, inputs=cache_inputs,
    )
    if status == "hit" and cached is not None:
        await ai_telemetry.record(
            db, intent="blog.recommend", provider=spec.provider, model=spec.model,
            input_chars=len(titles_sample), output_chars=len(str(cached)),
            latency_ms=0, workflow="admin.recommend", cache_hit=True,
        )
        return cached

    system_message = """You are an expert SEO content strategist for CredSure, a digital credentialing and badge platform.
Analyze the existing content and suggest new blog article topics that would drive organic search traffic.
Focus on topics with high search volume potential in the digital credentials, badges, certifications, compliance, and HR technology space.

Return EXACTLY a JSON array of objects. Each object must have:
- "topic": the article title (SEO-optimized, 50-65 chars)
- "category": one category name
- "search_intent": "informational", "commercial", or "navigational"
- "estimated_volume": "high", "medium", or "low"
- "keywords": array of 3-5 target keywords
- "excerpt": a compelling 1-2 sentence description (140-160 chars)
- "rationale": why this topic would perform well (1 sentence)

Return ONLY valid JSON, no markdown fences, no extra text."""

    prompt = f"""Here are the existing blog topics for CredSure:
{titles_sample}

Existing categories: {cats}

Suggest {count} NEW blog article topics that:
1. Don't duplicate existing content
2. Target high-volume search queries in digital credentialing, HR tech, compliance, and workforce development
3. Have clear SEO potential
4. Cover a mix of informational and commercial intent

Return as a JSON array:"""

    async with ai_telemetry.trace(
        db,
        intent="blog.recommend", provider=spec.provider, model=spec.model,
        workflow="admin.recommend",
        cache_hit=(False if status == "miss" else "would_have_hit" if status == "would_have_hit" else None),
    ) as t:
        chat = LlmChat(
            api_key=await get_llm_key(db, spec.provider),
            session_id=f"recommend-{uuid.uuid4().hex[:8]}",
            system_message=system_message,
        ).with_model(spec.provider, spec.model)
        t.input_chars = len(system_message) + len(prompt)
        resp = await chat.send_message(UserMessage(text=prompt))
        t.output_chars = len(resp or "")

    # Parse JSON response
    import json
    text = resp.strip()
    # Clean markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    if text.startswith("json"):
        text = text[4:].strip()

    try:
        topics = json.loads(text)
        if isinstance(topics, list):
            return topics
    except json.JSONDecodeError:
        logger.error(f"Failed to parse recommendation JSON: {text[:200]}")

    return []


async def generate_blog_post(topic, keywords, category, excerpt_hint="", *, db=None):
    """Generate a full SEO-optimized blog post from a topic. Returns dict with all blog fields.

    `db` (optional, kw-only) lets the key resolver read the admin-configured
    Anthropic key from site_settings; falls back to env / legacy if omitted.
    """
    from utils.llm_chat import LlmChat, UserMessage
    api_key = await get_llm_key(db, "anthropic")
    import json

    kw_str = ", ".join(keywords) if isinstance(keywords, list) else keywords

    chat = LlmChat(
        api_key=api_key,
        session_id=f"generate-{uuid.uuid4().hex[:8]}",
        system_message="""You are an expert SEO blog writer for CredSure, a leading digital credentialing platform.
Write comprehensive, authoritative blog posts that rank well in search engines.

Requirements:
- Content must be 800-1200 words
- Use proper HTML structure: one H1, 3-5 H2 subheadings, paragraphs, lists where appropriate
- Naturally include target keywords (1-3% density)
- Write in a professional but approachable tone
- Include actionable advice and specific examples
- Don't use markdown - output clean HTML only

Return EXACTLY a JSON object with:
- "title": SEO-optimized title (50-65 chars)
- "seo_title": optimized meta title (50-60 chars)
- "seo_description": compelling meta description (150-160 chars)
- "excerpt": brief summary (140-160 chars)
- "content_html": the full blog post in HTML (800+ words, with h1, h2, p, ul, li, strong, em tags)
- "read_time": estimated read time (e.g. "6 min read")

Return ONLY valid JSON, no markdown fences."""
    )

    prompt = f"""Write a comprehensive, SEO-optimized blog post about:
Topic: {topic}
Target Keywords: {kw_str}
Category: {category}
{f'Brief: {excerpt_hint}' if excerpt_hint else ''}

The blog should be authoritative, well-structured, and optimized for the keywords.
Return as a JSON object:"""

    resp = await chat.send_message(UserMessage(text=prompt))

    text = resp.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    if text.startswith("json"):
        text = text[4:].strip()

    try:
        post = json.loads(text)
        if isinstance(post, dict):
            return post
    except json.JSONDecodeError:
        logger.error(f"Failed to parse generated blog JSON: {text[:200]}")

    return None
