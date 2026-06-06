"""
Image upload, AI featured-image generation, file serving, and media-library
endpoints. All file metadata is tracked in `db.files`; binaries live in
GridFS via utils.storage.
"""
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Response
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid
import os
import logging

from utils.storage import upload_image, get_object
from utils.auth import get_current_admin
from ai import feature_flags as ai_flags


router = APIRouter()
logger = logging.getLogger(__name__)


# ─── Image Upload ────────────────────────────────────────────────────

@router.post("/admin/upload")
async def admin_upload_image(request: Request, file: UploadFile = File(...)):
    await get_current_admin(request)
    db = request.app.state.db

    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported type: {file.content_type}")

    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    path = upload_image(data, file.filename, file.content_type)

    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": path,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": len(data),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"path": path, "filename": file.filename, "size": len(data)}


# ─── AI Featured-Image Generation ─────────────────────────────────────
# Ported (adapted) from unified-talent-hub admin_blog_images.py.
# Uses our existing GridFS storage layer instead of a separate /uploads
# filesystem path, so generated images live alongside manual uploads.

SUPPORTED_IMAGE_MODELS = {
    "gpt-image-1": {
        "label": "OpenAI gpt-image-1 (default, fast, sharp text)",
        "provider": "openai",
        "model_id": "gpt-image-1",
    },
    "nano-banana": {
        "label": "Gemini Nano Banana (artistic)",
        "provider": "gemini",
        "model_id": "gemini-2.5-flash-image-preview",
    },
}
DEFAULT_IMAGE_MODEL = "gpt-image-1"


class GenerateFeaturedImageRequest(BaseModel):
    prompt: str
    model: Optional[str] = DEFAULT_IMAGE_MODEL
    number_of_images: int = 1


@router.get("/admin/blog/images/models")
async def admin_blog_image_models(request: Request):
    """Frontend reads this to populate the model picker dropdown."""
    await get_current_admin(request)
    return {
        "default": DEFAULT_IMAGE_MODEL,
        "models": [
            {"id": mid, "label": cfg["label"], "provider": cfg["provider"]}
            for mid, cfg in SUPPORTED_IMAGE_MODELS.items()
        ],
    }


@router.post("/admin/blog/images/generate")
async def admin_generate_featured_image(request: Request, body: GenerateFeaturedImageRequest):
    """
    Generate a featured/hero image via OpenAI gpt-image-1 or Gemini Nano Banana.
    Saves the PNG to GridFS through our existing storage layer; returns a
    URL of the same shape as /admin/upload so the editor can use one slot.
    """
    await get_current_admin(request)
    if not ai_flags.ai_image_generate():
        raise HTTPException(status_code=503, detail="AI image generation is currently disabled")

    db = request.app.state.db
    prompt = (body.prompt or "").strip()
    if len(prompt) < 4 or len(prompt) > 2000:
        raise HTTPException(status_code=400, detail="Prompt must be 4–2000 characters")

    model_cfg = SUPPORTED_IMAGE_MODELS.get(body.model or DEFAULT_IMAGE_MODEL)
    if model_cfg is None:
        raise HTTPException(status_code=400, detail="unsupported_model")

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="EMERGENT_LLM_KEY not configured")

    provider = model_cfg["provider"]
    model_id = model_cfg["model_id"]
    n = max(1, min(int(body.number_of_images or 1), 2))

    try:
        if provider == "openai":
            from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration  # noqa: E501
            gen = OpenAIImageGeneration(api_key=api_key)
            images = await gen.generate_images(
                prompt=prompt, model=model_id, number_of_images=n,
            )
        elif provider == "gemini":
            from emergentintegrations.llm.gemeni.image_generation import GeminiImageGeneration  # noqa: E501
            gen = GeminiImageGeneration(api_key=api_key)
            images = await gen.generate_images(
                prompt=prompt, model=model_id, number_of_images=n,
            )
        else:
            raise HTTPException(status_code=400, detail="unsupported_provider")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[admin/images/generate] provider={provider} failed: {exc!r}")
        raise HTTPException(status_code=502, detail=f"image_gen_failed:{exc.__class__.__name__}") from exc

    if not images:
        raise HTTPException(status_code=502, detail="image_gen_empty_response")

    saved = []
    for image_bytes in images:
        if not isinstance(image_bytes, (bytes, bytearray)):
            logger.warning(f"[admin/images/generate] non-bytes payload from {provider}")
            continue
        filename = f"ai-{uuid.uuid4().hex[:10]}.png"
        path = upload_image(bytes(image_bytes), filename, "image/png")
        await db.files.insert_one({
            "id": str(uuid.uuid4()),
            "storage_path": path,
            "original_filename": filename,
            "content_type": "image/png",
            "size": len(image_bytes),
            "is_deleted": False,
            "ai_generated": True,
            "ai_model": model_id,
            "ai_prompt": prompt[:500],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        saved.append({"path": path, "filename": filename})

    if not saved:
        raise HTTPException(status_code=502, detail="image_gen_no_valid_payload")

    return {
        "path": saved[0]["path"],
        "filename": saved[0]["filename"],
        "source": f"ai-{provider}",
        "model": model_id,
        "variants": saved,
    }


@router.get("/files/{path:path}")
async def serve_file(request: Request, path: str):
    db = request.app.state.db
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")

    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))


# ─── Media Library ───────────────────────────────────────────────────
# Lets the blog editor browse and reuse previously uploaded images
# instead of re-uploading the same file. Tracked in `db.files` since
# the existing /admin/upload route already inserts a record there.

@router.get("/admin/files")
async def admin_list_files(
    request: Request,
    page: int = 1,
    limit: int = 30,
    search: Optional[str] = None,
    content_type: Optional[str] = None,
):
    """
    Paginated list of uploaded files, newest first. Excludes soft-deleted
    rows. Optional `search` filters by original filename, `content_type`
    by mime prefix (e.g. 'image' to return only images).
    """
    await get_current_admin(request)
    db = request.app.state.db

    query: dict = {"is_deleted": {"$ne": True}}
    if search:
        query["original_filename"] = {"$regex": search, "$options": "i"}
    if content_type:
        # Allow broad-match: 'image' matches image/png, image/jpeg, etc.
        query["content_type"] = {"$regex": f"^{content_type}", "$options": "i"}

    total = await db.files.count_documents(query)
    cursor = (
        db.files.find(query, {"_id": 0})
        .sort("created_at", -1)
        .skip(max(0, (page - 1) * limit))
        .limit(min(100, max(1, limit)))
    )
    files = []
    async for doc in cursor:
        files.append({
            "id": doc.get("id"),
            "storage_path": doc.get("storage_path"),
            # Caller composes the absolute URL via REACT_APP_BACKEND_URL +
            # this relative path so we don't bake the API host into mongo.
            "url": f"/api/files/{doc.get('storage_path')}",
            "filename": doc.get("original_filename"),
            "content_type": doc.get("content_type"),
            "size": doc.get("size"),
            "created_at": doc.get("created_at"),
        })
    return {"files": files, "total": total, "page": page, "limit": limit}


@router.delete("/admin/files/{file_id}")
async def admin_delete_file(request: Request, file_id: str):
    """
    Soft-delete a file from the library. Existing posts that already
    reference the URL keep working because /api/files/<path> reads the
    same `is_deleted` flag and 404s — but the editor's library hides it.
    Admin role required to avoid editors mass-deleting shared assets.
    """
    user = await get_current_admin(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    db = request.app.state.db
    result = await db.files.update_one(
        {"id": file_id, "is_deleted": {"$ne": True}},
        {"$set": {"is_deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"ok": True, "id": file_id}
