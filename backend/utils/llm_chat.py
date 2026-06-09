"""Drop-in replacement for emergentintegrations.llm.chat using anthropic/openai SDKs directly."""
import uuid
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

# Default output budget. The old value (4096) silently truncated longer blog
# posts: a "Standard" 1000-word HTML post wrapped in a JSON object lands around
# 3.5–4.5k output tokens, and "Long"/"Pillar" presets blow well past 4096 — the
# response gets cut mid-JSON, json.loads fails, and generation returns None.
# Claude Sonnet 4.5 supports up to 64k output tokens, so a generous default is
# free (you only pay for tokens actually produced).
DEFAULT_MAX_TOKENS = 8192


# Reuse SDK clients across calls. The old code constructed a brand-new client
# (and therefore a new httpx connection pool) on every send_message — wasteful
# when a single request fans out to 6+ LLM calls. Keyed by api_key so a key
# change still picks up a fresh client. Clients are cheap to hold and
# thread/async-safe to share.
@lru_cache(maxsize=8)
def _anthropic_client(api_key: str):
    import anthropic
    return anthropic.AsyncAnthropic(api_key=api_key, timeout=180.0, max_retries=2)


@lru_cache(maxsize=8)
def _openai_client(api_key: str):
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=api_key, timeout=180.0, max_retries=2)


class UserMessage:
    def __init__(self, text: str):
        self.text = text


class LlmChat:
    def __init__(self, api_key: str, session_id: str = "", system_message: str = "",
                 max_tokens: int = DEFAULT_MAX_TOKENS):
        self.api_key = api_key
        self.session_id = session_id or uuid.uuid4().hex
        self.system_message = system_message
        self.max_tokens = max_tokens
        self._provider = "anthropic"
        self._model = "claude-sonnet-4-5-20250929"

    def with_model(self, provider: str, model: str) -> "LlmChat":
        self._provider = provider
        self._model = model
        return self

    def with_max_tokens(self, max_tokens: int) -> "LlmChat":
        self.max_tokens = max_tokens
        return self

    async def send_message(self, message: UserMessage) -> str:
        if self._provider == "anthropic":
            return await self._send_anthropic(message.text)
        elif self._provider == "openai":
            return await self._send_openai(message.text)
        else:
            raise ValueError(f"Unsupported provider: {self._provider}")

    async def _send_anthropic(self, text: str) -> str:
        client = _anthropic_client(self.api_key)
        response = await client.messages.create(
            model=self._model,
            max_tokens=self.max_tokens,
            system=self.system_message,
            messages=[{"role": "user", "content": text}],
        )
        if response.stop_reason == "max_tokens":
            logger.warning(
                "Anthropic response hit max_tokens=%s (model=%s) — output may be truncated",
                self.max_tokens, self._model,
            )
        return response.content[0].text if response.content else ""

    async def _send_openai(self, text: str) -> str:
        client = _openai_client(self.api_key)
        messages = []
        if self.system_message:
            messages.append({"role": "system", "content": self.system_message})
        messages.append({"role": "user", "content": text})
        response = await client.chat.completions.create(
            model=self._model,
            messages=messages,
        )
        return response.choices[0].message.content or ""
