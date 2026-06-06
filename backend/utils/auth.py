import os
import secrets
import bcrypt
import jwt
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY_HOURS = 24
MFA_TOKEN_EXPIRY_MINUTES = 5
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
VALID_ROLES = ("admin", "editor")
RECOVERY_CODE_COUNT = 8


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str = "admin") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRY_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_mfa_token(user_id: str, email: str) -> str:
    """Short-lived token issued after password verification when MFA is required."""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=MFA_TOKEN_EXPIRY_MINUTES),
        "type": "mfa_pending",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def verify_mfa_token(token: str) -> dict:
    """Decode and validate a mfa_pending token."""
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "mfa_pending":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="MFA verification timed out. Please login again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ─── MFA Helpers ─────────────────────────────────────────────────────

def generate_mfa_secret() -> str:
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    return pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name="CredSure Admin")


def generate_qr_base64(uri: str) -> str:
    """Generate a QR code PNG as a base64 data URL."""
    img = qrcode.make(uri, box_size=6, border=2)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def generate_recovery_codes() -> list:
    return [secrets.token_hex(4).upper() for _ in range(RECOVERY_CODE_COUNT)]


async def get_current_admin(request: Request) -> dict:
    """
    Resolve the current admin/editor.

    Auth precedence:
      1. `session_token` cookie (Emergent Google OAuth — primary path)
      2. `session_token` from Authorization: Bearer header (testing / API clients)
      3. Legacy JWT in Authorization: Bearer header (kept for any existing
         scripted callers; the React UI no longer issues these)

    Any active+whitelisted user is acceptable.
    """
    db = request.app.state.db

    # --- 1 + 2: session_token (cookie OR bearer header) -------------------
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if token:
        session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at and expires_at < datetime.now(timezone.utc):
                raise HTTPException(status_code=401, detail="Session expired")
            user = await db.users.find_one(
                {"email": session["email"]},
                {"_id": 0, "password_hash": 0, "mfa_secret": 0, "mfa_pending_secret": 0, "recovery_codes": 0, "google_sub": 0},
            )
            if not user or user.get("role") not in VALID_ROLES:
                raise HTTPException(status_code=403, detail="Access denied")
            if user.get("active") is False:
                raise HTTPException(status_code=403, detail="Account deactivated")
            return user

    # --- 3: Legacy JWT fallback ------------------------------------------
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    legacy_token = auth_header[7:]
    try:
        payload = jwt.decode(legacy_token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one(
            {"email": payload["email"]},
            {"_id": 0, "password_hash": 0, "mfa_secret": 0, "mfa_pending_secret": 0, "recovery_codes": 0}
        )
        if not user or user.get("role") not in VALID_ROLES:
            raise HTTPException(status_code=403, detail="Access denied")
        if user.get("active") is False:
            raise HTTPException(status_code=403, detail="Account deactivated")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin_only(request: Request) -> dict:
    """Require admin role specifically. Editors are denied."""
    user = await get_current_admin(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return user


async def check_brute_force(db, identifier: str):
    """Check if login is locked out due to too many failed attempts."""
    record = await db.login_attempts.find_one({"identifier": identifier})
    if not record:
        return
    if record.get("attempts", 0) >= MAX_LOGIN_ATTEMPTS:
        locked_until = record.get("locked_until")
        if locked_until:
            if isinstance(locked_until, str):
                locked_until = datetime.fromisoformat(locked_until)
            if locked_until.tzinfo is None:
                locked_until = locked_until.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) < locked_until:
                remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds() / 60) + 1
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many failed attempts. Try again in {remaining} minutes."
                )
            else:
                await db.login_attempts.delete_one({"identifier": identifier})


async def record_failed_attempt(db, identifier: str):
    """Increment failed login attempts and set lockout if threshold reached."""
    record = await db.login_attempts.find_one({"identifier": identifier})
    attempts = (record.get("attempts", 0) if record else 0) + 1
    update = {"attempts": attempts, "last_attempt": datetime.now(timezone.utc).isoformat()}
    if attempts >= MAX_LOGIN_ATTEMPTS:
        update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
    await db.login_attempts.update_one(
        {"identifier": identifier}, {"$set": update}, upsert=True
    )


async def clear_failed_attempts(db, identifier: str):
    """Clear failed login attempts on successful login."""
    await db.login_attempts.delete_one({"identifier": identifier})


async def seed_admin(db):
    """
    Create or update the bootstrap admin user(s) on startup.

    Two layers:
    1. The classic password-based seed admin (admin@credsure.io) — kept
       for backwards-compat with legacy /api/auth/login flows even though
       the React UI now uses Google OAuth exclusively.
    2. A list of GUARANTEED admin Google accounts (PERMANENT_ADMIN_EMAILS).
       Any email here is upserted as an active admin so they can sign in
       with Google immediately on a fresh deploy without anyone having to
       set BOOTSTRAP_ADMIN_EMAILS in the dashboard. This unblocks the
       "first deploy" / "everyone got deactivated" scenarios safely.
    """
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@credsure.io")
    admin_password = os.environ.get("ADMIN_PASSWORD", "CredSure@Admin2026!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "active": True,
            "mfa_enabled": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )

    # Permanent Google-OAuth admins. Source of truth is in code so that
    # a fresh deploy "just works" without any dashboard env-var setup.
    # These accounts are upserted as role=admin + active=True on every
    # startup, so even if someone accidentally deactivates them in the
    # Users tab, the next backend restart re-grants access.
    permanent_admins = [
        "admin@credsure.io",
        "mikedwild@certif-id.com",
        "nicola.miller@certif-id.com",
        "tim.miller@certif-id.com",
    ]
    now_iso = datetime.now(timezone.utc).isoformat()
    for email in permanent_admins:
        await db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "email": email,
                    "role": "admin",
                    "active": True,
                    "auth_provider": "google",
                },
                "$setOnInsert": {
                    "name": email.split("@", 1)[0].title(),
                    "mfa_enabled": False,
                    "created_at": now_iso,
                },
            },
            upsert=True,
        )

    # Indexes
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
