"""One-time migration: copy blog images from the Emergent object store into
MongoDB GridFS, preserving each file's logical `path` so /files/{path} keeps
resolving after Emergent is decommissioned.

⚠️ Run this BEFORE Emergent is shut off — it reads the binaries from Emergent's
object store, which stops working once the account is gone.

Usage:
    cd backend
    EMERGENT_LLM_KEY=<old-key> MONGO_URL=... DB_NAME=credsure \
        python -m scripts.migrate_storage_to_gridfs            # dry-run
    ... python -m scripts.migrate_storage_to_gridfs --commit   # actually copy

Idempotent: files already present in GridFS (by path) are skipped, so it's safe
to re-run.
"""
import asyncio
import os
import sys

import requests
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket

from utils.storage import BUCKET_NAME, put_object

# ── Legacy Emergent object-store reader (kept only here, for the migration) ──
_EMERGENT_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
_EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
_storage_key = None


def _emergent_storage_key():
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(
        f"{_EMERGENT_URL}/init", json={"emergent_key": _EMERGENT_KEY}, timeout=30
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _emergent_get(path: str) -> tuple:
    key = _emergent_storage_key()
    resp = requests.get(
        f"{_EMERGENT_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=120,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


async def _already_in_gridfs(db, path: str) -> bool:
    doc = await db[f"{BUCKET_NAME}.files"].find_one(
        {"$or": [{"metadata.path": path}, {"filename": path}]}, {"_id": 1}
    )
    return doc is not None


async def main(commit: bool):
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "credsure")
    if not _EMERGENT_KEY:
        print("ERROR: EMERGENT_LLM_KEY not set — needed to read the old store.")
        sys.exit(1)

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    records = await db.files.find(
        {"is_deleted": {"$ne": True}}, {"storage_path": 1, "content_type": 1}
    ).to_list(length=None)
    print(f"{len(records)} file record(s) to consider. commit={commit}\n")

    migrated = skipped = failed = 0
    for r in records:
        path = r.get("storage_path")
        if not path:
            continue
        if await _already_in_gridfs(db, path):
            skipped += 1
            continue
        try:
            data, ct = _emergent_get(path)
            ct = r.get("content_type") or ct
            if commit:
                await put_object(db, path, data, ct)
            print(f"{'COPIED' if commit else 'WOULD COPY'}: {path} ({len(data)} bytes)")
            migrated += 1
        except Exception as e:
            print(f"FAILED: {path} — {e}")
            failed += 1

    print(f"\nDone. {'copied' if commit else 'would copy'}={migrated}, "
          f"skipped(existing)={skipped}, failed={failed}")
    if not commit:
        print("Dry-run only. Re-run with --commit to write to GridFS.")


if __name__ == "__main__":
    asyncio.run(main(commit="--commit" in sys.argv))
