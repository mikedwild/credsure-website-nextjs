"""
Dynamic Open Graph image generation.

GET /api/og?title=...&highlight=...&desc=...&pill=...&tileTitle=...&tileSub=...

Renders the same brand-locked HTML template used for the homepage OG, with
per-page text overrides. Caches results to disk by query-hash so social-network
crawlers (LinkedIn, X, Slack, etc.) get cached responses on every retry.

Performance:
- First miss: ~1.5–2s (Playwright cold start + render)
- Cache hit:  ~5ms (FileResponse)

Cache strategy:
- Key: SHA-256 of normalized query string
- Storage: /app/backend/og_cache/<key>.jpg
- TTL: forever (the cache is keyed by content; if the title changes, a new file
  is generated. Stale files can be safely deleted at any time.)
"""
import asyncio
import base64
import hashlib
import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Query
from fastapi.responses import FileResponse, Response
from PIL import Image

router = APIRouter()

TEMPLATE_DIR = Path(__file__).parent.parent / "og_template"
TEMPLATE_HTML = TEMPLATE_DIR / "og.html"
LOGO_PATH = TEMPLATE_DIR / "logo.png"
CACHE_DIR = Path(__file__).parent.parent / "og_cache"
CACHE_DIR.mkdir(exist_ok=True)

# Pre-compute logo data URL once at startup
with open(LOGO_PATH, "rb") as _f:
    _LOGO_DATA_URL = "data:image/png;base64," + base64.b64encode(_f.read()).decode()

# Lazy-init Playwright browser instance — first request pays the cold-start cost
_browser = None
_browser_lock = asyncio.Lock()


async def _get_browser():
    """Get or create a shared Playwright browser instance."""
    global _browser
    if _browser is None:
        async with _browser_lock:
            if _browser is None:  # double-check
                from playwright.async_api import async_playwright
                _pw = await async_playwright().start()
                _browser = await _pw.chromium.launch(args=["--no-sandbox"])
    return _browser


def _cache_key(params: dict) -> str:
    """SHA-256 hash of the canonicalized query — stable cache key."""
    parts = "|".join(f"{k}={v}" for k, v in sorted(params.items()) if v is not None)
    return hashlib.sha256(parts.encode()).hexdigest()[:32]


async def _render(params: dict, out_path: Path):
    """Render the template HTML with the given param overrides → JPEG at out_path."""
    browser = await _get_browser()
    ctx = await browser.new_context(
        viewport={"width": 1200, "height": 630},
        device_scale_factor=2,
    )
    try:
        page = await ctx.new_page()
        # Inject logo data URL before navigation
        await page.add_init_script(f"window.__CS_LOGO_DATA_URL__ = {_LOGO_DATA_URL!r};")
        # Build URL with template params
        from urllib.parse import urlencode
        qs = urlencode({k: v for k, v in params.items() if v is not None})
        url = f"file://{TEMPLATE_HTML}?{qs}"
        await page.goto(url, wait_until="networkidle", timeout=10000)
        await page.wait_for_timeout(400)
        png_bytes = await page.screenshot(
            type="png",
            clip={"x": 0, "y": 0, "width": 1200, "height": 630},
        )
    finally:
        await ctx.close()
    # Convert PNG → JPEG (smaller, universally compatible)
    from io import BytesIO
    img = Image.open(BytesIO(png_bytes)).resize((1200, 630), Image.LANCZOS).convert("RGB")
    img.save(out_path, "JPEG", quality=88, optimize=True, progressive=True)


@router.get("/og", responses={200: {"content": {"image/jpeg": {}}}})
async def og_image(
    title: Optional[str] = Query(None, max_length=120),
    highlight: Optional[str] = Query(None, max_length=40),
    desc: Optional[str] = Query(None, max_length=240),
    pill: Optional[str] = Query(None, max_length=60),
    tileTitle: Optional[str] = Query(None, max_length=80),
    tileSub: Optional[str] = Query(None, max_length=80),
):
    """Generate or return a cached branded OG image."""
    params = {
        "title": title,
        "highlight": highlight,
        "desc": desc,
        "pill": pill,
        "tileTitle": tileTitle,
        "tileSub": tileSub,
    }
    key = _cache_key(params)
    out_path = CACHE_DIR / f"{key}.jpg"

    if not out_path.exists():
        try:
            await _render(params, out_path)
        except Exception as e:
            # On render failure, fall back to the static homepage OG so the share
            # link is never broken. Log to stderr; the request still succeeds.
            import sys
            print(f"[og] render failed for key={key}: {e}", file=sys.stderr)
            fallback = Path(__file__).parent.parent.parent / "frontend" / "public" / "og-image.jpg"
            if fallback.exists():
                return FileResponse(fallback, media_type="image/jpeg")
            return Response(status_code=500, content=b"OG render failed")

    return FileResponse(
        out_path,
        media_type="image/jpeg",
        headers={
            # 7-day browser cache + 30-day CDN cache. New title → new cache key.
            "Cache-Control": "public, max-age=604800, s-maxage=2592000, immutable",
        },
    )
