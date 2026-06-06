"""
Admin router package.

`admin.py` grew past 1300 lines and became a context-window hazard for
AI agents iterating on the admin surface. Split into domain modules,
each owning its own `APIRouter`. This file aggregates them into the
single `router` that `server.py` already imports as:

    from routes.admin import router as admin_router

so the move is transparent to callers and to URL routing.

IMPORTANT — route declaration order:
FastAPI matches routes in registration order. Within each module, the
order is preserved (e.g. /admin/blogs/slug-available is declared before
/admin/blogs/{slug}). Across modules, AI routes are included BEFORE
blogs to keep `/admin/ai/*` paths matched against their dedicated
handlers regardless of how Starlette resolves overlaps.
"""
from fastapi import APIRouter

from .translate import router as _translate_router
from .ai_blog import router as _ai_blog_router
from .ai_telemetry import router as _ai_telemetry_router
from .blogs import router as _blogs_router
from .images import router as _images_router
from .leads import router as _leads_router
from .settings import router as _settings_router
from .users import router as _users_router


router = APIRouter()
# AI routes first — they sit under /admin/ai/* and must resolve before
# the dynamic-slug /admin/blogs/{slug} handler that lives in blogs.py.
router.include_router(_translate_router)
router.include_router(_ai_blog_router)
router.include_router(_ai_telemetry_router)
router.include_router(_blogs_router)
router.include_router(_images_router)
router.include_router(_leads_router)
router.include_router(_settings_router)
router.include_router(_users_router)

__all__ = ["router"]
