from fastapi import APIRouter, Response
from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

BASE_URL = os.environ.get('SITE_URL', os.environ.get('APP_URL', ''))

# Mongo client (sitemap is read-only; use a lightweight async client tied to the app's DB)
_mongo_client = None


def _get_db():
    """Lazy MongoDB client for blog slug lookups."""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    return _mongo_client[os.environ['DB_NAME']]


STATIC_PAGES = [
    {"path": "/", "priority": "1.0", "changefreq": "weekly"},
    {"path": "/platform", "priority": "0.9", "changefreq": "monthly"},
    {"path": "/pricing", "priority": "0.9", "changefreq": "monthly"},
    {"path": "/about", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/blog", "priority": "0.9", "changefreq": "daily"},
    {"path": "/demo", "priority": "0.9", "changefreq": "monthly"},
    {"path": "/contact", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/templates", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/integrations", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/customer-success", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/customer-success/byteedge", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/customer-success/clini-india", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/customer-success/tsaaro", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/help-center", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/api-docs", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/tutorials", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/roi-calculator", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/resources", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/guides", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/webinars", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/security", "priority": "0.5", "changefreq": "yearly"},
    {"path": "/gdpr", "priority": "0.5", "changefreq": "yearly"},
    {"path": "/privacy-policy", "priority": "0.3", "changefreq": "yearly"},
    {"path": "/policies/terms", "priority": "0.4", "changefreq": "yearly"},
    {"path": "/legal-notice", "priority": "0.3", "changefreq": "yearly"},
    {"path": "/solutions/education", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/solutions/corporate", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/solutions/healthcare", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/solutions/government", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/solutions/associations", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/solutions/enterprise", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/features/credential-management", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/features/blockchain-verification", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/features/template-designer", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/features/analytics", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/features/api-integration", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/features/white-label", "priority": "0.7", "changefreq": "monthly"},
]

LANGUAGES = ["en", "de"]


async def _load_blog_slugs():
    """
    Load published blog slugs from MongoDB.

    Returns a list of dicts: {slug, lastmod, has_de}. `has_de` flags
    whether the post has a real German translation — when it doesn't,
    the sitemap omits the `/de/blog/<slug>` URL entirely. This avoids
    advertising two languages for what is actually the same English
    content (the prior cause of "Duplicate without user-selected
    canonical" warnings in Google Search Console).
    """
    try:
        db = _get_db()
        cursor = db.blog_posts.find(
            {"status": "published"},
            {"_id": 0, "slug": 1, "updated_at": 1, "published_at": 1, "date": 1, "title_de": 1}
        ).limit(5000)
        posts = []
        async for post in cursor:
            slug = post.get("slug")
            if not slug:
                continue
            ts = post.get("updated_at") or post.get("published_at") or post.get("date")
            if isinstance(ts, datetime):
                lastmod = ts.strftime("%Y-%m-%d")
            elif isinstance(ts, str) and ts:
                lastmod = ts[:10]
            else:
                lastmod = datetime.now().strftime("%Y-%m-%d")
            posts.append({
                "slug": slug,
                "lastmod": lastmod,
                "has_de": bool(post.get("title_de")),
            })
        return posts
    except Exception:
        return []


def _hreflang_block(en_url: str, de_url: str | None) -> str:
    """Render the xhtml:link rel=alternate annotations for a sitemap URL.

    Always emits the English link + x-default. Only emits the German link
    when the page has a real German variant. Sources Google's recommended
    multilingual sitemap shape: https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap
    """
    parts = [
        f'    <xhtml:link rel="alternate" hreflang="en" href="{en_url}"/>',
        f'    <xhtml:link rel="alternate" hreflang="x-default" href="{en_url}"/>',
    ]
    if de_url:
        parts.append(f'    <xhtml:link rel="alternate" hreflang="de" href="{de_url}"/>')
    return "\n".join(parts)


@router.get("/sitemap.xml", response_class=Response)
async def sitemap():
    today = datetime.now().strftime("%Y-%m-%d")
    blog_posts = await _load_blog_slugs()

    urls = []

    # Static pages — both languages always exist (i18n covers everything).
    for page in STATIC_PAGES:
        en_url = f'{BASE_URL}/en{page["path"]}'
        de_url = f'{BASE_URL}/de{page["path"]}'
        for lang_url in (en_url, de_url):
            urls.append(
                f'  <url>\n    <loc>{lang_url}</loc>\n'
                f'    <lastmod>{today}</lastmod>\n    <changefreq>{page["changefreq"]}</changefreq>\n'
                f'    <priority>{page["priority"]}</priority>\n'
                f'{_hreflang_block(en_url, de_url)}\n'
                f'  </url>'
            )

    # Blog posts — only emit /de/ URL when a real translation exists.
    for post in blog_posts:
        slug = post["slug"]
        date = post["lastmod"]
        en_url = f'{BASE_URL}/en/blog/{slug}'
        de_url = f'{BASE_URL}/de/blog/{slug}' if post["has_de"] else None
        urls.append(
            f'  <url>\n    <loc>{en_url}</loc>\n'
            f'    <lastmod>{date}</lastmod>\n    <changefreq>monthly</changefreq>\n'
            f'    <priority>0.6</priority>\n'
            f'{_hreflang_block(en_url, de_url)}\n'
            f'  </url>'
        )
        if de_url:
            urls.append(
                f'  <url>\n    <loc>{de_url}</loc>\n'
                f'    <lastmod>{date}</lastmod>\n    <changefreq>monthly</changefreq>\n'
                f'    <priority>0.6</priority>\n'
                f'{_hreflang_block(en_url, de_url)}\n'
                f'  </url>'
            )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(urls)
        + "\n</urlset>"
    )

    return Response(content=xml, media_type="application/xml")
