"""Site-wide settings (key='global' singleton). Admin role only.

API keys (anthropic_api_key / openai_api_key) are write-only from the client's
perspective: GET never returns the raw value (only a `*_set` flag + last-4
hint), and PUT preserves the stored key when the incoming field is blank — so
saving the settings form without re-typing a key doesn't wipe it.
"""
from fastapi import APIRouter, Request
from datetime import datetime, timezone
import secrets

from models.blog import SiteSettings
from utils.auth import require_admin_only, hash_publishing_token, PUBLISHING_TOKEN_PREFIX


router = APIRouter()

# Secret fields that must never be returned verbatim to the browser.
SECRET_FIELDS = ("anthropic_api_key", "openai_api_key")


def _mask(settings: dict) -> dict:
    """Strip raw secret values, add `<field>_set` bool + `<field>_hint` last-4.

    Also handles the publishing service token, which is stored hashed — the hash
    is never exposed; the client gets only a `set` flag + last-4 hint.
    """
    out = dict(settings)
    for f in SECRET_FIELDS:
        val = (settings.get(f) or "").strip()
        out[f] = ""
        out[f + "_set"] = bool(val)
        out[f + "_hint"] = ("…" + val[-4:]) if len(val) >= 8 else ""
    token_hash = settings.get("publishing_token_hash") or ""
    out.pop("publishing_token_hash", None)
    out["publishing_token_set"] = bool(token_hash)
    out["publishing_token_hint"] = settings.get("publishing_token_hint") or ""
    return out


@router.get("/admin/settings")
async def admin_get_settings(request: Request):
    await require_admin_only(request)
    db = request.app.state.db
    settings = await db.site_settings.find_one({"key": "global"}, {"_id": 0})
    if not settings:
        settings = SiteSettings().model_dump()
    return {"settings": _mask(settings)}


@router.put("/admin/settings")
async def admin_update_settings(request: Request, body: SiteSettings):
    await require_admin_only(request)
    db = request.app.state.db

    existing = await db.site_settings.find_one({"key": "global"}, {"_id": 0}) or {}
    data = body.model_dump()

    # Preserve stored secrets when the form submits a blank value (i.e. the
    # admin didn't re-type the key); only overwrite when a new value is given.
    for f in SECRET_FIELDS:
        incoming = (data.get(f) or "").strip()
        data[f] = incoming if incoming else (existing.get(f, "") or "")

    data["key"] = "global"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    # NB: the publishing token hash is intentionally NOT in the SiteSettings
    # model, so model_dump() omits it and this $set never clobbers it.
    await db.site_settings.update_one({"key": "global"}, {"$set": data}, upsert=True)

    return {"settings": _mask(data), "message": "Settings saved"}


@router.post("/admin/settings/publishing-token")
async def admin_create_publishing_token(request: Request):
    """Mint a long-lived publishing service token. Admin role only.

    Stores only the SHA-256 hash + a last-4 hint; returns the full token ONCE.
    Any previously-issued token is replaced (single active token).
    """
    await require_admin_only(request)
    db = request.app.state.db

    raw = PUBLISHING_TOKEN_PREFIX + secrets.token_urlsafe(32)
    hint = "…" + raw[-4:]
    await db.site_settings.update_one(
        {"key": "global"},
        {"$set": {
            "key": "global",
            "publishing_token_hash": hash_publishing_token(raw),
            "publishing_token_hint": hint,
            "publishing_token_created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"token": raw, "hint": hint, "message": "Publishing token generated"}


@router.delete("/admin/settings/publishing-token")
async def admin_revoke_publishing_token(request: Request):
    """Revoke the publishing service token. Admin role only."""
    await require_admin_only(request)
    db = request.app.state.db
    await db.site_settings.update_one(
        {"key": "global"},
        {"$unset": {
            "publishing_token_hash": "",
            "publishing_token_hint": "",
            "publishing_token_created_at": "",
        }},
    )
    return {"message": "Publishing token revoked"}
