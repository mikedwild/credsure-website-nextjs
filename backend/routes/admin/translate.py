"""Admin manual-translation endpoint."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from utils.auth import get_current_admin
from utils.ai_content import translate_fields
from ai import feature_flags as ai_flags


router = APIRouter()


class TranslateRequest(BaseModel):
    title: str = ""
    excerpt: str = ""
    content_html: str = ""
    tags: str = ""
    seo_title: str = ""
    seo_description: str = ""
    source_lang: str = "en"
    target_lang: str = "de"


@router.post("/admin/translate")
async def admin_translate(request: Request, body: TranslateRequest):
    admin = await get_current_admin(request)
    if not ai_flags.manual_translate():
        raise HTTPException(status_code=503, detail="Manual translation is currently disabled")
    db = request.app.state.db
    results = await translate_fields(
        title=body.title, excerpt=body.excerpt,
        content_html=body.content_html, tags=body.tags,
        seo_title=body.seo_title, seo_description=body.seo_description,
        source_lang=body.source_lang, target_lang=body.target_lang,
        # Phase-0 observability context
        db=db, workflow="admin.translate",
        user_email=(admin or {}).get("email") if isinstance(admin, dict) else getattr(admin, "email", None),
    )
    return results
