"""Drop-in replacement for emergentintegrations.llm.chat using anthropic/openai SDKs directly."""
import os
import uuid
import asyncio
import logging

logger = logging.getLogger(__name__)


class UserMessage:
    def __init__(self, text: str):
        self.text = text


class LlmChat:
    def __init__(self, api_key: str, session_id: str = "", system_message: str = ""):
        self.api_key = api_key
        self.session_id = session_id or uuid.uuid4().hex
        self.system_message = system_message
        self._provider = "anthropic"
        self._model = "claude-sonnet-4-5-20250929"

    def with_model(self, provider: str, model: str) -> "LlmChat":
        self._provider = provider
        self._model = model
        return self

    async def send_message(self, message: UserMessage) -> str:
        if self._provider == "anthropic":
            return await self._send_anthropic(message.text)
        elif self._provider == "openai":
            return await self._send_openai(message.text)
        else:
            raise ValueError(f"Unsupported provider: {self._provider}")

    async def _send_anthropic(self, text: str) -> str:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=self.api_key)
        messages = [{"role": "user", "content": text}]
        response = await client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=self.system_message,
            messages=messages,
        )
        return response.content[0].text if response.content else ""

    async def _send_openai(self, text: str) -> str:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=self.api_key)
        messages = []
        if self.system_message:
            messages.append({"role": "system", "content": self.system_message})
        messages.append({"role": "user", "content": text})
        response = await client.chat.completions.create(
            model=self._model,
            messages=messages,
        )
        return response.choices[0].message.content or ""
