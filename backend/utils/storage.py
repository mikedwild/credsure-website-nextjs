"""Binary storage for blog images / uploads, backed by MongoDB GridFS.

Replaces the previous Emergent object-store integration
(integrations.emergentagent.com/objstore + EMERGENT_LLM_KEY), which would stop
working — and make every existing image unreachable — once Emergent is
decommissioned. GridFS keeps the binaries in the same Mongo database, so there's
no extra infrastructure and no second credential to manage.

Public API (all async, take the Motor `db`):
    await put_object(db, path, data, content_type) -> {"path": path}
    await get_object(db, path) -> (bytes, content_type)
    await upload_image(db, data, filename, content_type) -> path

Files keep the same logical `path` (e.g. "blog-images/<uuid>.webp") that is
stored on each db.files record and served via /files/{path}.
"""
import logging
import uuid

from motor.motor_asyncio import AsyncIOMotorGridFSBucket

logger = logging.getLogger(__name__)

BUCKET_NAME = "blog_files"
# Logical path prefix for blog imagery (kept short; the old Emergent project
# slug "bilingual-lead-gen/" prefix is dropped on new uploads).
IMAGE_PREFIX = "blog-images"


def _bucket(db) -> AsyncIOMotorGridFSBucket:
    return AsyncIOMotorGridFSBucket(db, bucket_name=BUCKET_NAME)


async def put_object(db, path: str, data: bytes, content_type: str) -> dict:
    """Store bytes under `path`. A new upload to an existing path supersedes it
    (get_object returns the most recent by uploadDate)."""
    bucket = _bucket(db)
    await bucket.upload_from_stream(
        path,
        data,
        metadata={"path": path, "contentType": content_type},
    )
    return {"path": path}


async def get_object(db, path: str) -> tuple:
    """Return (bytes, content_type) for the file at `path`. Raises FileNotFoundError."""
    files_coll = db[f"{BUCKET_NAME}.files"]
    doc = await files_coll.find_one(
        {"$or": [{"metadata.path": path}, {"filename": path}]},
        sort=[("uploadDate", -1)],
    )
    if not doc:
        raise FileNotFoundError(path)
    bucket = _bucket(db)
    stream = await bucket.open_download_stream(doc["_id"])
    data = await stream.read()
    content_type = (doc.get("metadata") or {}).get(
        "contentType", "application/octet-stream"
    )
    return data, content_type


async def upload_image(db, data: bytes, filename: str, content_type: str) -> str:
    """Store an image and return its logical path."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    path = f"{IMAGE_PREFIX}/{uuid.uuid4()}.{ext}"
    await put_object(db, path, data, content_type)
    return path
