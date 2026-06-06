"""
Google OAuth (Emergent-managed) auth routes.

This is the SOLE authentication path for the admin panel. We intentionally
removed username/password sign-in — Google is now the only way in. The
existing /api/auth/login endpoints in routes/auth.py remain mounted for
backwards-compat (e.g. the legacy seed admin can still issue a JWT via
testing tooling), but the React UI no longer surfaces them.

Flow:
  1. Frontend redirects to https://auth.emergentagent.com/?redirect=<this-app>/en/admin
  2. Emergent does the Google OAuth dance and bounces back with #session_id=...
  3. AuthCallback.jsx posts that session_id to /api/auth/google/session
  4. We call Emergent's /session-data, validate the email domain, upsert into
     the existing `users` collection, store a session_token in `user_sessions`,
     and set a httpOnly session_token cookie.
  5. /api/auth/me reads the cookie and returns the user (used by ProtectedRoute).
  6. /api/auth/logout deletes the session and clears the cookie.

Domain whitelist + approval:
  • Only @credsure.io and @certif-id.com may complete the exchange.
  • Brand-new users land with role="editor" and active=False — an existing
    admin must flip active=True via /admin/users before they can log in.
  • Existing users (e.g. the seeded admin@credsure.io) are matched by email
    so their role/active state is preserved across the OAuth migration.
"""

import os
import uuid
import logging
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Request, Response, HTTPException, Cookie
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# Emergent-managed Google OAuth session-data endpoint
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# Email domains allowed to complete OAuth and provision an account
ALLOWED_EMAIL_DOMAINS = {"credsure.io", "certif-id.com"}

# Default role for newly auto-provisioned Google users (must be approved
# by an existing admin before they can actually log in)
DEFAULT_NEW_USER_ROLE = "editor"


async def _notify_slack_pending_approval(email: str, name: str, request: Request) -> None:
    """
    Fire-and-forget Slack notification when a domain-approved user signs in
    via Google but is awaiting admin approval. Lets admins act on the
    pending request without polling the user-management screen.

    Falls back silently if SLACK_WEBHOOK_URL is unset (e.g. local dev).
    """
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return

    # Derive the admin users URL from the request's Origin header so the
    # link works for both preview and prod without hardcoding domains.
    origin = request.headers.get("origin") or request.headers.get("referer") or ""
    if origin:
        # Strip any path off referer; keep scheme+host.
        from urllib.parse import urlparse
        parsed = urlparse(origin)
        origin = f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme else origin
    admin_users_url = f"{origin}/en/admin/users?filter=pending" if origin else "(visit /en/admin/users)"

    payload = {
        "text": f":wave: New admin sign-in pending approval: {email}",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": "👋 New admin sign-in — pending approval"}},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Email:*\n{email}"},
                    {"type": "mrkdwn", "text": f"*Name:*\n{name or '—'}"},
                ],
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "They signed in with Google but their account is `active=false`. Approve them in the admin user-management screen, or send them an invite to auto-activate next time.",
                },
            },
            {
                "type": "actions",
                "elements": [{
                    "type": "button",
                    "style": "primary",
                    "text": {"type": "plain_text", "text": "Open user management"},
                    "url": admin_users_url,
                }],
            },
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(webhook_url, json=payload)
            if res.status_code >= 400:
                logger.warning(f"Slack pending-approval ping failed: {res.status_code} {res.text[:200]}")
    except httpx.HTTPError as e:
        logger.warning(f"Slack pending-approval HTTP error: {e}")


def _bootstrap_admin_emails() -> set[str]:
    """
    Comma-separated list of emails that should be force-activated as admin
    on Google sign-in. Used for the FIRST admin (or to recover when no one
    has access). Read fresh on every request so the operator can rotate the
    env var without a restart.

    Example: BOOTSTRAP_ADMIN_EMAILS="mikedwild@certif-id.com,me@credsure.io"

    Once you're in and the proper users are activated, clear the env var
    (or set it to empty) and restart to re-lock the bootstrap door.
    """
    raw = os.getenv("BOOTSTRAP_ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}

SESSION_TTL_DAYS = 7
SESSION_COOKIE_NAME = "session_token"


class GoogleSessionRequest(BaseModel):
    """Body for /api/auth/google/session — the session_id Emergent put in the URL fragment."""
    session_id: str
    # Optional: when the user came in via an invite link, the frontend
    # stashes the invite token in localStorage before the OAuth roundtrip
    # and replays it here. We then auto-activate (skip manual admin
    # approval) and apply the invited role.
    invite_token: str | None = None


def _email_domain_allowed(email: str) -> bool:
    if not email or "@" not in email:
        return False
    return email.split("@", 1)[1].lower() in ALLOWED_EMAIL_DOMAINS


def _set_session_cookie(response: Response, token: str) -> None:
    """
    httpOnly session cookie.
    samesite=None + secure=True is required for cross-site preview-domain
    deployments (e.g. credsure.io front-end → emergent backend during local
    smoke tests). Cookie is bound to the API domain.
    """
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_DAYS * 24 * 3600,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", samesite="none", secure=True)


@router.post("/auth/google/session")
async def google_session_exchange(req: GoogleSessionRequest, request: Request, response: Response):
    """
    Exchange Emergent OAuth session_id (URL fragment) for an app session.

    Returns the upserted user document on success and sets the session cookie.
    """
    db = request.app.state.db

    # 1. Look up Google identity from Emergent
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                EMERGENT_SESSION_URL,
                headers={"X-Session-ID": req.session_id},
            )
    except httpx.HTTPError as e:
        logger.warning(f"Emergent session-data call failed: {e}")
        raise HTTPException(status_code=502, detail="Auth provider unavailable")

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired session_id")

    payload = res.json()
    email = (payload.get("email") or "").strip().lower()
    name = payload.get("name") or email.split("@", 1)[0]
    picture = payload.get("picture")
    google_sub = payload.get("id")
    session_token = payload.get("session_token")

    if not email or not session_token:
        raise HTTPException(status_code=400, detail="Auth provider returned an incomplete profile")

    # 2. Domain whitelist gate
    if not _email_domain_allowed(email):
        logger.info(f"Google sign-in rejected for non-whitelisted domain: {email}")
        raise HTTPException(
            status_code=403,
            detail="Email domain not allowed. Sign in with a @credsure.io or @certif-id.com account.",
        )

    # 2a. Bootstrap-admin override. If the operator has set
    #     BOOTSTRAP_ADMIN_EMAILS, those emails are force-activated as admin
    #     even without an invite. This is the recovery path when no one has
    #     access (e.g. first admin onboarding, or if every active admin's
    #     account got deactivated). Operator should clear the env var once
    #     real admins are in.
    is_bootstrap = email in _bootstrap_admin_emails()

    # 2b. If an invite_token was supplied, validate it now. Must be active,
    #     unexpired, and the invite email must match the Google email.
    invite_doc = None
    if req.invite_token:
        from routes.invites import load_active_invite  # local import avoids cycle
        try:
            invite_doc = await load_active_invite(db, req.invite_token)
        except HTTPException as e:
            # Surface the underlying invite error to the client unchanged.
            raise e
        if (invite_doc.get("email") or "").lower() != email:
            raise HTTPException(
                status_code=403,
                detail=f"This invite was issued for {invite_doc.get('email')}. Sign in with that Google account instead.",
            )

    # 3. Upsert into `users`. Match by email so the seeded admin@credsure.io
    #    keeps its role+active state on first Google login.
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    now_iso = datetime.now(timezone.utc).isoformat()

    if existing is None:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        # Bootstrap admin > invite > default. Bootstrap forces admin role +
        # active so the operator can recover access without poking the DB.
        if is_bootstrap:
            new_role = "admin"
            new_active = True
        elif invite_doc:
            new_role = invite_doc.get("role", DEFAULT_NEW_USER_ROLE)
            new_active = True
        else:
            new_role = DEFAULT_NEW_USER_ROLE
            new_active = False
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "google_sub": google_sub,
            "role": new_role,
            "active": new_active,
            "mfa_enabled": False,
            "created_at": now_iso,
            "auth_provider": "google",
            "invited_by": invite_doc.get("invited_by") if invite_doc else None,
        }
        await db.users.insert_one(user_doc)
        if is_bootstrap:
            logger.info(f"Google sign-in BOOTSTRAP-ADMIN provisioned: {email}")
        elif invite_doc:
            logger.info(f"Google sign-in accepted invite (auto-activated): {email} role={new_role}")
        else:
            logger.info(f"Google sign-in provisioned new user (pending approval): {email}")
        # Mongo's insert_one mutates user_doc by adding _id — drop it before returning
        user_doc.pop("_id", None)
    else:
        # Link Google identity onto existing record. If this sign-in is
        # consuming an invite OR the email is in BOOTSTRAP_ADMIN_EMAILS,
        # also flip active=True. Bootstrap additionally forces role=admin
        # (lets an operator recover full access).
        update = {
            "name": existing.get("name") or name,
            "picture": picture or existing.get("picture"),
            "google_sub": google_sub,
            "auth_provider": "google",
            "last_login_at": now_iso,
            "active": True if (invite_doc or is_bootstrap) else existing.get("active", True),
        }
        if is_bootstrap:
            update["role"] = "admin"
        elif invite_doc:
            update["role"] = invite_doc.get("role", existing.get("role", DEFAULT_NEW_USER_ROLE))
        await db.users.update_one({"email": email}, {"$set": update})
        user_id = existing.get("user_id") or f"user_{uuid.uuid4().hex[:12]}"
        if not existing.get("user_id"):
            await db.users.update_one({"email": email}, {"$set": {"user_id": user_id}})
        user_doc = {**existing, **update, "user_id": user_id}
        user_doc.pop("_id", None)
        if is_bootstrap:
            logger.info(f"Google sign-in BOOTSTRAP-ADMIN re-activated: {email}")

    # 3a. Mark the invite as consumed — must run AFTER the user upsert so
    #     a partial failure doesn't burn the invite without provisioning.
    if invite_doc:
        await db.user_invites.update_one(
            {"token": req.invite_token},
            {"$set": {
                "accepted_at": datetime.now(timezone.utc),
                "accepted_user_id": user_id,
            }},
        )

    # 4. Approval gate — block login if the user hasn't been activated yet.
    if user_doc.get("active") is False:
        logger.info(f"Google sign-in blocked (pending approval): {email}")
        # Best-effort Slack ping so admins know someone is waiting. Only
        # fire on the FIRST attempt (i.e. user was just created in step 3).
        # Repeat sign-in attempts by the same pending user don't re-notify.
        if existing is None:
            try:
                await _notify_slack_pending_approval(email, name, request)
            except Exception as e:  # noqa: BLE001 — never let Slack break auth
                logger.warning(f"Slack pending-approval notification failed (ignored): {e}")
        raise HTTPException(
            status_code=403,
            detail=(
                "Your account is awaiting approval from an administrator. "
                "We've notified the admin team — you'll be able to sign in "
                "once they activate your account. For urgent access, contact "
                "your inviter or email admin@credsure.io."
            ),
        )

    # 5. Persist session token + set cookie
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "email": email,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS),
        "created_at": datetime.now(timezone.utc),
    })

    _set_session_cookie(response, session_token)

    # Strip sensitive fields before returning
    safe_user = {k: v for k, v in user_doc.items() if k not in ("password_hash", "mfa_secret", "mfa_pending_secret", "recovery_codes", "google_sub")}

    return {"user": safe_user, "token": session_token}


async def _resolve_session_user(db, request: Request) -> Optional[dict]:
    """
    Read session_token from cookie first, then Authorization header as
    fallback (testing/scripting). Returns the user doc or None.

    Mirrors the get_current_admin pattern but cookie-first.
    """
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        return None

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None

    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None

    user = await db.users.find_one(
        {"email": session["email"]},
        {"_id": 0, "password_hash": 0, "mfa_secret": 0, "mfa_pending_secret": 0, "recovery_codes": 0, "google_sub": 0},
    )
    if not user or user.get("active") is False:
        return None
    return user


@router.get("/auth/google/me")
async def auth_me_google(request: Request):
    """
    Diagnostic endpoint — returns the current user when authenticated via
    the Google session_token cookie. Mostly useful for the testing agent;
    production code should hit `/api/auth/me` (handled by the legacy
    auth router which now also echoes the token).
    """
    db = request.app.state.db
    user = await _resolve_session_user(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = request.cookies.get(SESSION_COOKIE_NAME) or ""
    return {"user": user, "token": token}


@router.post("/auth/logout")
async def auth_logout(request: Request, response: Response, session_token: Optional[str] = Cookie(default=None)):
    """Delete the session and clear the cookie. Accepts bearer too because
    Emergent's ingress wildcard ACAO blocks the cookie path on the SPA."""
    db = request.app.state.db
    token = session_token or request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    _clear_session_cookie(response)
    return {"ok": True}
