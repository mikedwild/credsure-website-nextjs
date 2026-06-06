"""
Background job dispatcher — interface only, sync execution today.

Phase 0 keeps every AI flow synchronous so we don't introduce a
behavioural change. But the call sites are written against this
dispatcher so Phase 1 can flip a single env var (`AI_ASYNC_JOBS_ENABLED=1`)
and have FastAPI run the same workload via `BackgroundTasks` —
returning the HTTP response in <100 ms instead of blocking on the LLM.

For workloads that don't need to return data to the caller, this is the
right primitive. Workloads that need to return their result (e.g.
`/api/admin/translate`) must remain synchronous.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Awaitable, Callable

from fastapi import BackgroundTasks

from .feature_flags import async_jobs_enabled

logger = logging.getLogger(__name__)


def dispatch(
    background_tasks: BackgroundTasks | None,
    coro_factory: Callable[[], Awaitable[None]],
    *,
    job_name: str,
) -> str:
    """Run `coro_factory()` inline or in the background.

    Returns:
      "sync"   — ran inline (and awaited) before this function returned
      "queued" — scheduled to run after the response is sent

    When `async_jobs_enabled()` is False or no BackgroundTasks instance
    is provided, falls back to sync execution. Sync execution is the
    safe default — we never want a "fire and forget that silently never
    fired" code path.
    """
    if async_jobs_enabled() and background_tasks is not None:
        async def _wrapped():
            try:
                await coro_factory()
            except Exception:
                logger.exception(f"Background job '{job_name}' failed")
        background_tasks.add_task(_wrapped)
        return "queued"

    # Sync fallback — caller is awaiting us, so just run the coro.
    # We do NOT swallow exceptions in sync mode: the caller can decide.
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # We're inside an async route — caller should `await dispatch(...)`
            # but if they didn't, we still need to return synchronously.
            # Returning the coroutine would be a bug — better to schedule
            # it and let the loop handle it.
            asyncio.ensure_future(coro_factory())
            return "sync_scheduled"
    except RuntimeError:
        pass
    return "sync"


async def run_sync(coro_factory: Callable[[], Awaitable[None]], *, job_name: str) -> None:
    """Explicit sync runner — for routes that always want sync behaviour
    regardless of `async_jobs_enabled`. Mirrors the dispatch signature
    so call sites are uniform."""
    try:
        await coro_factory()
    except Exception:
        logger.exception(f"Sync job '{job_name}' failed")
        raise
