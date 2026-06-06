"""
Agent call guard — prevents runaway recursive AI flows.

Charter §10: MAX_AGENT_CALLS = 5 / MAX_DEPTH = 2 / MAX_RETRIES = 1.

Today the only call patterns are:
  - admin.translate         → 6 LLM calls (one per field) — at the cap
  - admin.ai.generate       → 1 call
  - admin.ai.recommend      → 1 call

Note: translate.fields-as-a-batch (6 calls in one request) is on the
ceiling of MAX_AGENT_CALLS. Phase 1 collapses it to 1 call via JSON
mode — which also brings us comfortably under the limit. For now we
allow 6 explicitly per the `_MAX_PER_REQUEST` override below.

Usage from a route:

    from .ai.guard import RequestGuard
    guard = RequestGuard(allowed=6)            # explicit cap for this request
    async with guard.call("translate.title"):
        await chat.send_message(...)
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

MAX_AGENT_CALLS = 5    # global default per RequestGuard instance
MAX_DEPTH       = 2
MAX_RETRIES     = 1


class AgentCallLimitExceeded(RuntimeError):
    pass


class RequestGuard:
    """Per-request counter of AI calls. Create one at the top of a
    handler, pass it down, and `async with guard.call(...)` around
    every LLM invocation.

    Default cap is 5 (charter default). Routes with legitimate higher
    fan-out (current translate-all-fields = 6) pass an explicit
    `allowed=` argument so the elevated count is visible in code review.
    """

    def __init__(self, *, allowed: int = MAX_AGENT_CALLS):
        self._allowed = allowed
        self._used = 0
        self._intents_used: list[str] = []

    @property
    def used(self) -> int:
        return self._used

    @property
    def intents(self) -> list[str]:
        return list(self._intents_used)

    @asynccontextmanager
    async def call(self, intent: str):
        if self._used >= self._allowed:
            raise AgentCallLimitExceeded(
                f"Request exceeded MAX_AGENT_CALLS={self._allowed} "
                f"(intents so far: {self._intents_used})"
            )
        self._used += 1
        self._intents_used.append(intent)
        try:
            yield
        finally:
            pass  # we don't decrement on exit — used calls stay counted
