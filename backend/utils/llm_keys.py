"""Resolve LLM API keys per provider.

Replaces the single Emergent universal key (EMERGENT_LLM_KEY, which only worked
through Emergent's proxy) with real provider keys. Resolution order:

  1. Admin-configured key stored in site_settings (set via the blog admin UI)
  2. Environment variable (ANTHROPIC_API_KEY / OPENAI_API_KEY)
  3. Legacy EMERGENT_LLM_KEY (kept only so existing deployments don't hard-break)

Anthropic powers blog generation, topic recommendation, and translation;
OpenAI powers image generation.
"""
import os
import logging

logger = logging.getLogger(__name__)

_ENV_BY_PROVIDER = {
    "anthropic": "ANTHROPIC_API_KEY",
    "openai": "OPENAI_API_KEY",
}
_SETTINGS_FIELD_BY_PROVIDER = {
    "anthropic": "anthropic_api_key",
    "openai": "openai_api_key",
}


async def get_llm_key(db, provider: str = "anthropic") -> str:
    """Return the API key for `provider`, or raise RuntimeError if unconfigured."""
    provider = (provider or "anthropic").lower()
    field = _SETTINGS_FIELD_BY_PROVIDER.get(provider)
    env_var = _ENV_BY_PROVIDER.get(provider)

    # 1) Admin-configured key from site_settings
    if db is not None and field:
        try:
            settings = await db.site_settings.find_one(
                {"key": "global"}, {"_id": 0, field: 1}
            )
            if settings and settings.get(field):
                return settings[field]
        except Exception as e:  # pragma: no cover - defensive
            logger.warning("site_settings lookup for %s key failed: %s", provider, e)

    # 2) Environment variable
    if env_var and os.environ.get(env_var):
        return os.environ[env_var]

    # 3) Legacy Emergent universal key (deprecated)
    legacy = os.environ.get("EMERGENT_LLM_KEY")
    if legacy:
        logger.warning(
            "Falling back to legacy EMERGENT_LLM_KEY for %s; configure %s instead.",
            provider, env_var,
        )
        return legacy

    raise RuntimeError(
        f"No API key configured for provider '{provider}'. "
        f"Set it in the blog admin (Settings → API Keys) or via {env_var}."
    )
