from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address
from utils.auth import (
    verify_password,
    hash_password,
    create_access_token,
    create_mfa_token,
    verify_mfa_token,
    get_current_admin,
    check_brute_force,
    record_failed_attempt,
    clear_failed_attempts,
    generate_mfa_secret,
    get_totp_uri,
    generate_qr_base64,
    verify_totp,
    generate_recovery_codes,
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MFAVerifyRequest(BaseModel):
    mfa_token: str
    code: str


class MFASetupVerifyRequest(BaseModel):
    code: str


class MFADisableRequest(BaseModel):
    code: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/auth/login")
@limiter.limit("10/minute")
async def admin_login(request: Request, body: LoginRequest):
    db = request.app.state.db
    email = body.email.lower().strip()
    ip = get_remote_address(request)
    identifier = f"{ip}:{email}"

    await check_brute_force(db, identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await record_failed_attempt(db, identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("role") not in ("admin", "editor"):
        raise HTTPException(status_code=403, detail="Access denied")

    if user.get("active") is False:
        raise HTTPException(status_code=403, detail="Account deactivated")

    await clear_failed_attempts(db, identifier)

    # If MFA is enabled, return a short-lived mfa_token instead of full access
    if user.get("mfa_enabled"):
        mfa_token = create_mfa_token(
            user_id=str(user.get("_id", "")),
            email=user["email"],
        )
        logger.info(f"MFA challenge issued for: {email}")
        return {
            "mfa_required": True,
            "mfa_token": mfa_token,
        }

    # No MFA — issue full access token
    token = create_access_token(
        user_id=str(user.get("_id", "")),
        email=user["email"],
        role=user["role"],
    )

    logger.info(f"Admin login: {email}")
    return {
        "mfa_required": False,
        "token": token,
        "user": {
            "email": user["email"],
            "name": user.get("name", "Admin"),
            "role": user["role"],
            "mfa_enabled": user.get("mfa_enabled", False),
        },
    }


@router.post("/auth/mfa/verify")
@limiter.limit("10/minute")
async def mfa_verify(request: Request, body: MFAVerifyRequest):
    """Step 2 of login: verify the TOTP code after password was validated."""
    db = request.app.state.db
    payload = verify_mfa_token(body.mfa_token)
    email = payload["email"]

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    code = body.code.strip().replace(" ", "")

    # Try TOTP first
    if user.get("mfa_secret") and verify_totp(user["mfa_secret"], code):
        token = create_access_token(
            user_id=str(user.get("_id", "")),
            email=user["email"],
            role=user["role"],
        )
        logger.info(f"MFA verified for: {email}")
        return {
            "token": token,
            "user": {
                "email": user["email"],
                "name": user.get("name", "Admin"),
                "role": user["role"],
                "mfa_enabled": True,
            },
        }

    # Try recovery code
    recovery_codes = user.get("recovery_codes", [])
    if code.upper() in recovery_codes:
        recovery_codes.remove(code.upper())
        await db.users.update_one(
            {"email": email},
            {"$set": {"recovery_codes": recovery_codes}}
        )
        token = create_access_token(
            user_id=str(user.get("_id", "")),
            email=user["email"],
            role=user["role"],
        )
        logger.info(f"MFA recovery code used for: {email} ({len(recovery_codes)} remaining)")
        return {
            "token": token,
            "user": {
                "email": user["email"],
                "name": user.get("name", "Admin"),
                "role": user["role"],
                "mfa_enabled": True,
            },
            "recovery_code_used": True,
            "recovery_codes_remaining": len(recovery_codes),
        }

    raise HTTPException(status_code=401, detail="Invalid verification code")


# ─── MFA Setup ───────────────────────────────────────────────────────

@router.post("/auth/mfa/setup")
async def mfa_setup(request: Request):
    """Generate a new TOTP secret and QR code for the admin to scan."""
    admin = await get_current_admin(request)
    db = request.app.state.db

    secret = generate_mfa_secret()
    uri = get_totp_uri(secret, admin["email"])
    qr_data = generate_qr_base64(uri)

    # Store the pending secret (not yet activated)
    await db.users.update_one(
        {"email": admin["email"]},
        {"$set": {"mfa_pending_secret": secret}}
    )

    return {
        "secret": secret,
        "qr_code": qr_data,
        "uri": uri,
    }


@router.post("/auth/mfa/verify-setup")
async def mfa_verify_setup(request: Request, body: MFASetupVerifyRequest):
    """Verify the first TOTP code to activate MFA. Returns recovery codes."""
    admin = await get_current_admin(request)
    db = request.app.state.db

    user = await db.users.find_one({"email": admin["email"]})
    pending_secret = user.get("mfa_pending_secret")
    if not pending_secret:
        raise HTTPException(status_code=400, detail="No MFA setup in progress. Start setup first.")

    code = body.code.strip().replace(" ", "")
    if not verify_totp(pending_secret, code):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    recovery_codes = generate_recovery_codes()

    await db.users.update_one(
        {"email": admin["email"]},
        {
            "$set": {
                "mfa_enabled": True,
                "mfa_secret": pending_secret,
                "recovery_codes": recovery_codes,
            },
            "$unset": {"mfa_pending_secret": ""},
        }
    )

    logger.info(f"MFA enabled for: {admin['email']}")
    return {
        "message": "MFA enabled successfully",
        "recovery_codes": recovery_codes,
    }


@router.post("/auth/mfa/disable")
async def mfa_disable(request: Request, body: MFADisableRequest):
    """Disable MFA. Requires a valid TOTP code or recovery code."""
    admin = await get_current_admin(request)
    db = request.app.state.db

    user = await db.users.find_one({"email": admin["email"]})
    if not user.get("mfa_enabled"):
        raise HTTPException(status_code=400, detail="MFA is not enabled")

    code = body.code.strip().replace(" ", "")
    valid = False

    if user.get("mfa_secret") and verify_totp(user["mfa_secret"], code):
        valid = True
    elif code.upper() in user.get("recovery_codes", []):
        valid = True

    if not valid:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    await db.users.update_one(
        {"email": admin["email"]},
        {
            "$set": {"mfa_enabled": False},
            "$unset": {"mfa_secret": "", "mfa_pending_secret": "", "recovery_codes": ""},
        }
    )

    logger.info(f"MFA disabled for: {admin['email']}")
    return {"message": "MFA disabled successfully"}


@router.get("/auth/mfa/status")
async def mfa_status(request: Request):
    """Check if MFA is enabled for the current admin."""
    admin = await get_current_admin(request)
    db = request.app.state.db
    user = await db.users.find_one({"email": admin["email"]}, {"_id": 0, "mfa_enabled": 1, "recovery_codes": 1})
    return {
        "mfa_enabled": user.get("mfa_enabled", False),
        "recovery_codes_remaining": len(user.get("recovery_codes", [])),
    }


# ─── Existing Auth Endpoints ────────────────────────────────────────

@router.get("/auth/me")
async def admin_me(request: Request):
    """
    Return the current user. Also echoes back the session_token (whether
    authentication came in via cookie OR `Authorization: Bearer <token>`)
    so the React admin can re-hydrate its `token` state after a hard
    reload — existing admin child components send the token as
    `Authorization: Bearer <token>` and would otherwise have no way to
    recover it.

    Echoing the token on the same-session response is safe: the caller
    already proved possession by sending it.
    """
    user = await get_current_admin(request)
    token = request.cookies.get("session_token") or ""
    if not token:
        # Recover from Authorization header so the bearer-only flow used
        # by the admin SPA (cookies are blocked by Emergent's ingress
        # wildcard ACAO) gets the same hydration response.
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    return {"user": user, "token": token}


@router.post("/auth/change-password")
async def admin_change_password(request: Request, body: ChangePasswordRequest):
    admin = await get_current_admin(request)
    db = request.app.state.db

    user = await db.users.find_one({"email": admin["email"]})
    if not user or not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    await db.users.update_one(
        {"email": admin["email"]},
        {"$set": {"password_hash": hash_password(body.new_password)}}
    )
    logger.info(f"Password changed for: {admin['email']}")
    return {"message": "Password changed successfully"}
