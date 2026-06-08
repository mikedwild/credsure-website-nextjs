"""
Google OAuth (direct) auth routes — the sole authentication path for the admin.

Previously this went through Emergent's managed OAuth
(auth.emergentagent.com + demobackend.emergentagent.com/.../session-data).
That dependency is removed: we now run the standard Google OAuth 2.0
Authorization-Code flow ourselves.

Flow:
  1. Frontend sends the browser to  GET /api/auth/google/start?redirect=<spa-url>&invite=<token?>
  2. We stash a one-time `state` (with the redirect + optional invite) and 302
     to Google's consent screen (redirect_uri = <backend>/api/auth/google/callback).
  3. Google bounces back to /api/auth/google/callback?code=...&state=...
  4. We exchange the code for tokens, read the Google profile from the userinfo
     endpoint, validate the email domain, upsert into `users`, create a session
     in `user_sessions`, set the httpOnly session cookie, and 302 back to the SPA
     redirect with `#token=<session_token>` (and `#error=...` on failure).
  5. /api/auth/me (legacy router) and /api/auth/google/me read the cookie/bearer.
  6. /api/auth/logout deletes the session and clears the cookie.

Config (env):
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   — from Google Cloud → Credentials
  OAUTH_CALLBACK_URL                        — must EXACTLY match an Authorized
                                              redirect URI on the OAuth client,
                                              e.g. https://api.credsure.io/api/auth/google/callback
                                              (falls back to BACKEND_PUBLIC_URL + path,
                                              else derived from the request)

Domain whitelist + approval (unchanged): only @credsure.io / @certif-id.com;
new users land role=editor active=False pending admin approval; invites and
BOOTSTRAP_ADMIN_EMAILS auto-activate.
"""

import os
import uuid
import secrets
import logging
import httpx
from urllib.parse import urlencode, quote, urlparse
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Request, Response, HTTPException, Cookie
from fastapi.responses import RedirectResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Google OAuth endpoints ──────────────────────────────────────────────
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# Email domains allowed to complete OAuth and provision an account
ALLOWED_EMAIL_DOMAINS = {"credsure.io", "certif-id.com"}

# Default role for newly auto-provisioned Google users (must be approved
# by an existing admin before they can actually log in)
DEFAULT_NEW_USER_ROLE = "editor"

SESSION_TTL_DAYS = 7
SESSION_COOKIE_NAME = "session_token"
STATE_TTL_MINUTES = 10


def _google_client():
    cid = os.getenv("GOOGLE_CLIENT_ID")
    secret = os.getenv("GOOGLE_CLIENT_SECRET")
    if not cid or not secret:
        raise HTTPException(
            status_code=503,
            detail="Google OAuth is not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
        )
    return cid, secret


def _callback_url(request: Request) -> str:
    """The redirect_uri sent to Google — must match an Authorized redirect URI."""
    explicit = os.getenv("OAUTH_CALLBACK_URL")
    if explicit:
        return explicit
    base = os.getenv("BACKEND_PUBLIC_URL")
    if base:
        return base.rstrip("/") + "/api/auth/google/callback"
    # Last resort: derive from the incoming request (works in simple setups).
    return str(request.url_for("google_oauth_callback"))


async def _notify_slack_pending_approval(email: str, name: str, base_url: str) -> None:
    """Fire-and-forget Slack ping when a domain-approved user is awaiting approval."""
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return
    admin_users_url = f"{base_url}/en/admin/users?filter=pending" if base_url else "(visit /en/admin/users)"
    payload = {
        "text": f":wave: New admin sign-in pending approval: {email}",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": "👋 New admin sign-in — pending approval"}},
            {"type": "section", "fields": [
                {"type": "mrkdwn", "text": f"*Email:*\n{email}"},
                {"type": "mrkdwn", "text": f"*Name:*\n{name or '—'}"},
            ]},
            {"type": "section", "text": {"type": "mrkdwn",
                "text": "They signed in with Google but their account is `active=false`. Approve them in user management or send an invite to auto-activate."}},
            {"type": "actions", "elements": [{
                "type": "button", "style": "primary",
                "text": {"type": "plain_text", "text": "Open user management"},
                "url": admin_users_url,
            }]},
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
    """Comma-separated emails force-activated as admin on Google sign-in
    (first-admin onboarding / access recovery). Read fresh each request."""
    raw = os.getenv("BOOTSTRAP_ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def _email_domain_allowed(email: str) -> bool:
    if not email or "@" not in email:
        return False
    return email.split("@", 1)[1].lower() in ALLOWED_EMAIL_DOMAINS


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME, value=token,
        max_age=SESSION_TTL_DAYS * 24 * 3600,
        httponly=True, secure=True, samesite="none", path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", samesite="none", secure=True)


class _AuthError(Exception):
    """Provisioning rejection carrying a user-facing message + HTTP status."""
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message
        super().__init__(message)


async def _provision_and_issue_session(
    db, *, email: str, name: str, picture: Optional[str], google_sub: Optional[str],
    invite_token: Optional[str], base_url: str,
) -> tuple[dict, str]:
    """Shared post-identity logic: domain gate → invite/bootstrap → upsert →
    approval gate → create session. Returns (safe_user, session_token).
    Raises _AuthError on rejection."""
    email = (email or "").strip().lower()
    name = name or (email.split("@", 1)[0] if email else "")

    if not email:
        raise _AuthError(400, "Google returned an incomplete profile (no email).")

    # Domain whitelist gate
    if not _email_domain_allowed(email):
        logger.info(f"Google sign-in rejected for non-whitelisted domain: {email}")
        raise _AuthError(403, "Email domain not allowed. Sign in with a @credsure.io or @certif-id.com account.")

    is_bootstrap = email in _bootstrap_admin_emails()

    # Validate invite (if any)
    invite_doc = None
    if invite_token:
        from routes.invites import load_active_invite  # local import avoids cycle
        invite_doc = await load_active_invite(db, invite_token)  # raises HTTPException on bad invite
        if (invite_doc.get("email") or "").lower() != email:
            raise _AuthError(403, f"This invite was issued for {invite_doc.get('email')}. Sign in with that Google account instead.")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    now_iso = datetime.now(timezone.utc).isoformat()

    if existing is None:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        if is_bootstrap:
            new_role, new_active = "admin", True
        elif invite_doc:
            new_role, new_active = invite_doc.get("role", DEFAULT_NEW_USER_ROLE), True
        else:
            new_role, new_active = DEFAULT_NEW_USER_ROLE, False
        user_doc = {
            "user_id": user_id, "email": email, "name": name, "picture": picture,
            "google_sub": google_sub, "role": new_role, "active": new_active,
            "mfa_enabled": False, "created_at": now_iso, "auth_provider": "google",
            "invited_by": invite_doc.get("invited_by") if invite_doc else None,
        }
        await db.users.insert_one(user_doc)
        user_doc.pop("_id", None)
        logger.info(f"Google sign-in provisioned: {email} role={new_role} active={new_active}")
    else:
        update = {
            "name": existing.get("name") or name,
            "picture": picture or existing.get("picture"),
            "google_sub": google_sub, "auth_provider": "google", "last_login_at": now_iso,
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

    # Consume invite after successful upsert
    if invite_doc:
        await db.user_invites.update_one(
            {"token": invite_token},
            {"$set": {"accepted_at": datetime.now(timezone.utc), "accepted_user_id": user_id}},
        )

    # Approval gate
    if user_doc.get("active") is False:
        logger.info(f"Google sign-in blocked (pending approval): {email}")
        if existing is None:
            try:
                await _notify_slack_pending_approval(email, name, base_url)
            except Exception as e:  # noqa: BLE001
                logger.warning(f"Slack pending-approval notification failed (ignored): {e}")
        raise _AuthError(403,
            "Your account is awaiting approval from an administrator. "
            "We've notified the admin team — you'll be able to sign in once they "
            "activate your account. For urgent access, email admin@credsure.io.")

    # Issue our own session token (no longer provided by Emergent)
    session_token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "user_id": user_id, "email": email, "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS),
        "created_at": datetime.now(timezone.utc),
    })

    safe_user = {k: v for k, v in user_doc.items()
                 if k not in ("password_hash", "mfa_secret", "mfa_pending_secret", "recovery_codes", "google_sub")}
    return safe_user, session_token


# ── OAuth: start ─────────────────────────────────────────────────────────

@router.get("/auth/google/start")
async def google_oauth_start(request: Request, redirect: str = "", invite: str = ""):
    """Kick off Google OAuth. Stashes a one-time state then 302s to Google."""
    db = request.app.state.db
    client_id, _ = _google_client()

    state = secrets.token_urlsafe(24)
    await db.oauth_states.insert_one({
        "state": state,
        "redirect": redirect or "",
        "invite_token": invite or "",
        "created_at": datetime.now(timezone.utc),
    })

    params = {
        "client_id": client_id,
        "redirect_uri": _callback_url(request),
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
        "include_granted_scopes": "true",
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}", status_code=302)


# ── OAuth: callback ──────────────────────────────────────────────────────

def _spa_base(redirect: str) -> str:
    if not redirect:
        return ""
    p = urlparse(redirect)
    return f"{p.scheme}://{p.netloc}" if p.scheme else ""


def _redirect_with_error(redirect: str, message: str) -> RedirectResponse:
    target = redirect or "/en/admin"
    return RedirectResponse(f"{target}#error={quote(message)}", status_code=302)


@router.get("/auth/google/callback", name="google_oauth_callback")
async def google_oauth_callback(request: Request, code: str = "", state: str = "", error: str = ""):
    """Handle Google's redirect: exchange code → profile → provision → session,
    then 302 back to the SPA with #token=... (or #error=...)."""
    db = request.app.state.db
    client_id, client_secret = _google_client()

    # Resolve + consume state
    st = await db.oauth_states.find_one({"state": state}) if state else None
    spa_redirect = (st or {}).get("redirect") or ""
    invite_token = (st or {}).get("invite_token") or ""
    if st:
        await db.oauth_states.delete_one({"state": state})
        created = st.get("created_at")
        if created and created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if created and created < datetime.now(timezone.utc) - timedelta(minutes=STATE_TTL_MINUTES):
            return _redirect_with_error(spa_redirect, "Login link expired, please try again.")

    def _fail(msg: str):
        return _redirect_with_error(spa_redirect, msg)

    if error:
        return _fail(f"Google sign-in was cancelled ({error}).")
    if not state or not st:
        return _fail("Invalid or expired login state, please try again.")
    if not code:
        return _fail("Google did not return an authorization code.")

    # Exchange the code for tokens, then read the verified profile
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            tok = await client.post(GOOGLE_TOKEN_URL, data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": _callback_url(request),
                "grant_type": "authorization_code",
            })
            if tok.status_code != 200:
                logger.warning(f"Google token exchange failed: {tok.status_code} {tok.text[:200]}")
                return _fail("Could not complete sign-in with Google. Please try again.")
            access_token = tok.json().get("access_token")

            info = await client.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
            if info.status_code != 200:
                return _fail("Could not read your Google profile. Please try again.")
            profile = info.json()
    except httpx.HTTPError as e:
        logger.warning(f"Google OAuth HTTP error: {e}")
        return _fail("Google is unavailable right now. Please try again shortly.")

    if not profile.get("email_verified", True):
        return _fail("Your Google email is not verified.")

    base_url = _spa_base(spa_redirect)
    try:
        _safe_user, session_token = await _provision_and_issue_session(
            db,
            email=profile.get("email", ""),
            name=profile.get("name", ""),
            picture=profile.get("picture"),
            google_sub=profile.get("sub"),
            invite_token=invite_token or None,
            base_url=base_url,
        )
    except _AuthError as e:
        return _fail(e.message)
    except HTTPException as e:  # invite errors
        return _fail(e.detail if isinstance(e.detail, str) else "Sign-in failed.")

    # Success: set cookie + bounce back to the SPA with the token in the fragment
    # (fragments aren't sent to servers / logged). The SPA stores it as a bearer.
    target = spa_redirect or "/en/admin"
    resp = RedirectResponse(f"{target}#token={quote(session_token)}", status_code=302)
    _set_session_cookie(resp, session_token)
    return resp


# ── Session resolution / me / logout (unchanged behaviour) ───────────────

async def _resolve_session_user(db, request: Request) -> Optional[dict]:
    """Cookie-first, then Authorization bearer fallback. Returns user or None."""
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
    db = request.app.state.db
    user = await _resolve_session_user(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = request.cookies.get(SESSION_COOKIE_NAME) or ""
    return {"user": user, "token": token}


@router.post("/auth/logout")
async def auth_logout(request: Request, response: Response, session_token: Optional[str] = Cookie(default=None)):
    """Delete the session and clear the cookie. Accepts bearer too."""
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
