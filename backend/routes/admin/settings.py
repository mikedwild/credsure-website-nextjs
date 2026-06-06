"""Site-wide settings (key='global' singleton). Admin role only."""
from fastapi import APIRouter, Request
from datetime import datetime, timezone

from models.blog import SiteSettings
from utils.auth import require_admin_only


router = APIRouter()


@router.get("/admin/settings")
async def admin_get_settings(request: Request):
    await require_admin_only(request)
    db = request.app.state.db
    settings = await db.site_settings.find_one({"key": "global"}, {"_id": 0})
    if not settings:
        settings = SiteSettings().model_dump()
    return {"settings": settings}


@router.put("/admin/settings")
async def admin_update_settings(request: Request, body: SiteSettings):
    await require_admin_only(request)
    db = request.app.state.db
    data = body.model_dump()
    data["key"] = "global"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.site_settings.update_one({"key": "global"}, {"$set": data}, upsert=True)
    return {"settings": data, "message": "Settings saved"}
