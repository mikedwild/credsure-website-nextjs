"""
User invite flow.

Replaces the old "Add User" admin flow. Admin specifies email + role; backend
creates an invite token and posts the link to Slack. The invitee clicks the
link, lands on /:lang/invite/:token, and signs in with Google. The Google
session exchange in routes/google_auth.py auto-activates the new user (skips
manual admin approval) when an invite_token is supplied AND it matches the
Google email.

Endpoints:
  POST /api/admin/invites              (admin) — create invite + Slack notify
  GET  /api/admin/invites              (admin) — list outstanding invites
  DELETE /api/admin/invites/:invite_id (admin) — revoke an invite
  GET  /api/invites/:token             (public) — validate, return {email, role}
  (No password endpoint — Google sign-in is the only way to accept.)

Acceptance is consumed in routes/google_auth.py::google_session_exchange when
an invite_token is included in the body.
"""

import logging
import os
import secrets
import uuid
from datetime import datetime, timezone, timedelta

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from utils.auth import require_admin_only, VALID_ROLES

logger = logging.getLogger(__name__)
router = APIRouter()

INVITE_TTL_HOURS = 72  # 3 days
INVITE_TOKEN_BYTES = 32  # 64-char urlsafe


class InviteCreate(BaseModel):
    email: EmailStr
    role: str = Field(default="editor")


def _public_site_url(request: Request | None = None) -> str:
    """Where the invite link points the user. Must be the deployed site URL.

    Precedence (most → least authoritative):
    1. Origin header on the request — set by the browser. We treat it as
       authoritative *as long as it's not an internal cluster hostname*
       (Emergent's ingress can rewrite Origin to the cluster service URL
       like `*.cluster-N.preview.emergentcf.cloud`, which would otherwise
       leak into the invite link).
    2. SITE_URL env var — for non-browser-initiated requests or when
       Origin has been rewritten by the ingress.
    3. Hardcoded https://credsure.io fallback.

    We deliberately do NOT trust X-Forwarded-Host or the Host header —
    Kubernetes ingress rewrites these to internal cluster hostnames too.

    Blocklist patterns (host substrings that mean "not a real public URL"):
      • emergentcf.cloud  → internal cluster service hostname
      • cluster-          → internal cluster prefix
      • localhost / 127.0.0.1 / 0.0.0.0
    Note: preview.emergentagent.com is INTENTIONALLY NOT blocklisted —
    a QA tester on the preview URL should get a preview invite link so
    the full flow works end-to-end inside preview.
    """
    INTERNAL_PATTERNS = ("emergentcf.cloud", "cluster-", "localhost", "127.0.0.1", "0.0.0.0")

    def _is_safe_public(url_or_host: str) -> bool:
        h = (url_or_host or "").lower()
        return bool(h) and not any(p in h for p in INTERNAL_PATTERNS)

    if request is not None:
        origin = (request.headers.get("origin") or "").strip().rstrip("/")
        if origin and _is_safe_public(origin) and (origin.startswith("http://") or origin.startswith("https://")):
            return origin

    env_url = os.environ.get("SITE_URL", "").rstrip("/")
    if env_url and _is_safe_public(env_url):
        return env_url

    return "https://credsure.io"


async def _lookup_slack_user_id(email: str) -> str | None:
    """
    Resolve a Slack user_id from an email address via users.lookupByEmail.

    Returns the Slack user_id (e.g. 'U01234ABCD') when the email belongs
    to a member of our Slack workspace, otherwise None — which the caller
    treats as "fall back to the channel webhook so the invite still goes
    somewhere we can see it".
    """
    bot_token = os.getenv("SLACK_BOT_TOKEN")
    if not bot_token:
        return None
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(
                "https://slack.com/api/users.lookupByEmail",
                params={"email": email},
                headers={"Authorization": f"Bearer {bot_token}"},
            )
        data = res.json()
        if data.get("ok") and data.get("user", {}).get("id"):
            return data["user"]["id"]
        # Slack returns ok=false with errors like "users_not_found",
        # "missing_scope", "invalid_auth". Log and fall back.
        logger.info(f"Slack users.lookupByEmail({email}) → not_found ({data.get('error')})")
        return None
    except httpx.HTTPError as e:
        logger.warning(f"Slack users.lookupByEmail HTTP error: {e}")
        return None


async def _send_slack_dm(user_id: str, invite_url: str, email: str, role: str, invited_by: str) -> bool:
    """
    Post a chat.postMessage to the resolved Slack user as a DM.

    Slack auto-opens the IM channel when you pass a user_id as `channel`,
    so we don't need a separate conversations.open call. Returns True on
    success so the caller can decide whether to ALSO post to the channel
    webhook.
    """
    bot_token = os.getenv("SLACK_BOT_TOKEN")
    if not bot_token:
        return False
    payload = {
        "channel": user_id,
        "text": f":envelope_with_arrow: You've been invited to the CredSure admin panel as {role}.",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": "📨 You're invited to CredSure"}},
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Hey! *{invited_by}* invited you to the CredSure admin panel as `{role}`.\n\nClick the button below to sign in with Google — your account is auto-activated when you accept.",
                },
            },
            {
                "type": "actions",
                "elements": [{
                    "type": "button",
                    "style": "primary",
                    "text": {"type": "plain_text", "text": "Accept invite"},
                    "url": invite_url,
                }],
            },
            {
                "type": "context",
                "elements": [{
                    "type": "mrkdwn",
                    "text": f"Link expires in {INVITE_TTL_HOURS}h · Single-use · If the button doesn't work, paste this URL: <{invite_url}|{invite_url}>",
                }],
            },
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(
                "https://slack.com/api/chat.postMessage",
                json=payload,
                headers={
                    "Authorization": f"Bearer {bot_token}",
                    "Content-Type": "application/json; charset=utf-8",
                },
            )
        data = res.json()
        if data.get("ok"):
            logger.info(f"Slack DM sent to {email} (user_id={user_id})")
            return True
        logger.warning(f"Slack chat.postMessage failed for {email}: {data.get('error')}")
        return False
    except httpx.HTTPError as e:
        logger.warning(f"Slack chat.postMessage HTTP error: {e}")
        return False


async def _send_slack_invite(invite_url: str, email: str, role: str, invited_by: str) -> None:
    """
    Best-effort Slack notification.

    Order of operations:
      1. Try to DM the invitee directly via chat.postMessage (requires
         SLACK_BOT_TOKEN with chat:write + users:read.email scopes AND
         the invitee being a member of our Slack workspace).
      2. If the DM succeeds, we are DONE — nothing is posted to the
         channel webhook. The invite is private to the recipient.
      3. If the DM fails (no bot token, user not in workspace, missing
         scope, etc.) fall back to the legacy channel webhook so the
         invite link still lands somewhere humans can see it.
    """
    user_id = await _lookup_slack_user_id(email)
    if user_id and await _send_slack_dm(user_id, invite_url, email, role, invited_by):
        # DM delivered → no channel post. Keeps the invite private.
        return

    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        logger.info(f"No Slack DM and no SLACK_WEBHOOK_URL — invite for {email} created but not announced")
        return

    # Fallback: invitee isn't in our Slack workspace, post the full link
    # to the team channel so an admin can forward it manually.
    payload = {
        "text": ":envelope_with_arrow: New CredSure admin invite",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": "📨 New CredSure Admin Invite"}},
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Email:*\n{email}"},
                    {"type": "mrkdwn", "text": f"*Role:*\n{role}"},
                    {"type": "mrkdwn", "text": f"*Invited by:*\n{invited_by}"},
                    {"type": "mrkdwn", "text": f"*Expires in:*\n{INVITE_TTL_HOURS}h"},
                ],
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f":link: *Send this link to {email}:*\n```{invite_url}```",
                },
            },
            {
                "type": "context",
                "elements": [{
                    "type": "mrkdwn",
                    "text": "Couldn't DM directly — invitee isn't in this Slack workspace. Forward the link manually.",
                }],
            },
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            await client.post(webhook_url, json=payload)
    except Exception as e:
        logger.warning(f"Slack invite webhook notification failed: {e}")


# ─── Admin endpoints ────────────────────────────────────────────────


@router.post("/admin/invites")
async def create_invite(req: InviteCreate, request: Request):
    """Create a new user invite. Admin-only. Sends Slack notification."""
    admin = await require_admin_only(request)
    db = request.app.state.db

    if req.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of {VALID_ROLES}")

    email = req.email.lower().strip()

    existing_user = await db.users.find_one({"email": email}, {"_id": 0, "email": 1, "active": 1})
    if existing_user and existing_user.get("active") is not False:
        raise HTTPException(status_code=409, detail="An active user with this email already exists.")

    # Revoke any prior outstanding invite for this email so only the latest works
    await db.user_invites.delete_many({"email": email, "accepted_at": {"$exists": False}})

    token = secrets.token_urlsafe(INVITE_TOKEN_BYTES)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=INVITE_TTL_HOURS)
    invite_doc = {
        "invite_id": f"inv_{uuid.uuid4().hex[:12]}",
        "token": token,
        "email": email,
        "role": req.role,
        "invited_by": admin["email"],
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
    }
    await db.user_invites.insert_one(invite_doc)

    invite_url = f"{_public_site_url(request)}/en/invite/{token}"
    await _send_slack_invite(invite_url, email, req.role, admin["email"])
    logger.info(f"Invite created for {email} (role={req.role}) by {admin['email']}")

    return {
        "message": "Invite created. The link has been posted to Slack.",
        "invite_url": invite_url,
        "email": email,
        "role": req.role,
        "expires_at": expires_at.isoformat(),
    }


@router.get("/admin/invites")
async def list_invites(request: Request):
    """List outstanding (non-accepted, non-expired) invites. Admin-only."""
    await require_admin_only(request)
    db = request.app.state.db

    now = datetime.now(timezone.utc)
    cursor = db.user_invites.find(
        {"accepted_at": {"$exists": False}, "expires_at": {"$gt": now}},
        {"_id": 0, "token": 0},
    ).sort("created_at", -1).limit(200)

    invites = []
    async for doc in cursor:
        for k in ("created_at", "expires_at"):
            if isinstance(doc.get(k), datetime):
                doc[k] = doc[k].isoformat()
        invites.append(doc)
    return {"invites": invites}


@router.delete("/admin/invites/{invite_id}")
async def revoke_invite(invite_id: str, request: Request):
    """Revoke an outstanding invite by invite_id. Admin-only."""
    await require_admin_only(request)
    db = request.app.state.db
    res = await db.user_invites.delete_one({"invite_id": invite_id, "accepted_at": {"$exists": False}})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invite not found or already accepted")
    return {"message": "Invite revoked"}


# ─── Public endpoint (no auth — token IS the auth) ──────────────────


def _normalize_expiry(value):
    if isinstance(value, str):
        value = datetime.fromisoformat(value)
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value


async def load_active_invite(db, token: str) -> dict:
    """Shared helper used here AND in google_auth.py during session exchange."""
    invite = await db.user_invites.find_one({"token": token}, {"_id": 0})
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    if invite.get("accepted_at"):
        raise HTTPException(status_code=410, detail="Invite already used")
    expires = _normalize_expiry(invite["expires_at"])
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Invite expired")
    return invite


@router.get("/invites/{token}")
async def get_invite(token: str, request: Request):
    """Validate the invite token. Returns email + role for the landing page."""
    db = request.app.state.db
    invite = await load_active_invite(db, token)
    return {"email": invite["email"], "role": invite["role"]}
