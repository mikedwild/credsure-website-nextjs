"""User management — list / create / update / delete. Admin role only."""
from fastapi import APIRouter, Request, HTTPException
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import logging

from utils.auth import require_admin_only


router = APIRouter()
logger = logging.getLogger(__name__)


class CreateUserRequest(BaseModel):
    email: str
    name: str
    password: str
    role: str = "editor"


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    active: Optional[bool] = None
    password: Optional[str] = None


@router.get("/admin/users")
async def admin_list_users(request: Request):
    await require_admin_only(request)
    db = request.app.state.db
    users = await db.users.find(
        {}, {"_id": 0, "password_hash": 0, "mfa_secret": 0, "mfa_pending_secret": 0, "recovery_codes": 0}
    ).sort("created_at", -1).limit(100).to_list(100)
    return {"users": users}


@router.post("/admin/users")
async def admin_create_user(request: Request, body: CreateUserRequest):
    from utils.auth import hash_password, VALID_ROLES
    await require_admin_only(request)
    db = request.app.state.db

    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(VALID_ROLES)}")

    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="User with this email already exists")

    now = datetime.now(timezone.utc).isoformat()
    await db.users.insert_one({
        "email": email,
        "name": body.name,
        "password_hash": hash_password(body.password),
        "role": body.role,
        "active": True,
        "mfa_enabled": False,
        "created_at": now,
    })
    logger.info(f"User created: {email} ({body.role})")
    return {"message": f"User {email} created as {body.role}"}


@router.put("/admin/users/{email}")
async def admin_update_user(request: Request, email: str):
    from utils.auth import hash_password, VALID_ROLES
    admin = await require_admin_only(request)
    db = request.app.state.db

    raw = await request.json()
    email_lower = email.lower().strip()

    user = await db.users.find_one({"email": email_lower})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from deactivating themselves
    if email_lower == admin["email"] and raw.get("active") is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    updates = {}
    if raw.get("name") is not None:
        updates["name"] = raw["name"]
    if raw.get("role") is not None:
        if raw["role"] not in VALID_ROLES:
            raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(VALID_ROLES)}")
        # Prevent admin from downgrading themselves
        if email_lower == admin["email"] and raw["role"] != "admin":
            raise HTTPException(status_code=400, detail="Cannot change your own role")
        updates["role"] = raw["role"]
    if raw.get("active") is not None:
        updates["active"] = raw["active"]
    if raw.get("password"):
        if len(raw["password"]) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        updates["password_hash"] = hash_password(raw["password"])

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"email": email_lower}, {"$set": updates})
    logger.info(f"User updated: {email_lower}")
    return {"message": f"User {email_lower} updated"}


@router.delete("/admin/users/{email}")
async def admin_delete_user(request: Request, email: str):
    admin = await require_admin_only(request)
    db = request.app.state.db

    email_lower = email.lower().strip()
    if email_lower == admin["email"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    result = await db.users.delete_one({"email": email_lower})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"User deleted: {email_lower}")
    return {"message": f"User {email_lower} deleted"}
