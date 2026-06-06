"""
Trackable AI jobs — for long-running operations that exceed the 100s
proxy timeout (e.g. blog draft generation: 30-90 s + auto-translate).

Pattern:
  1. Route handler creates a job record (status="pending"), returns job_id.
  2. FastAPI BackgroundTasks runs the actual work; updates the job
     record on completion or failure.
  3. Frontend polls GET /api/admin/ai/jobs/{id} until status is "complete"
     or "failed".

This is intentionally lightweight — uses the same MongoDB connection as
everything else. Per /app/ai/RUNTIME_AI_POSTURE.md we deliberately do NOT
pull in Celery / RQ / Dramatiq for marketing-site-volume traffic.
"""
from __future__ import annotations

import uuid
import logging
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Optional

logger = logging.getLogger(__name__)

JOBS_COLLECTION = "ai_jobs"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def create_job(db, *, kind: str, params: dict, owner_email: Optional[str] = None) -> str:
    """Insert a pending job record and return its id."""
    job_id = str(uuid.uuid4())
    await db[JOBS_COLLECTION].insert_one({
        "id": job_id,
        "kind": kind,
        "status": "pending",
        "params": params,
        "result": None,
        "error": None,
        "owner_email": owner_email,
        "created_at": _now(),
        "updated_at": _now(),
    })
    return job_id


async def update_job(db, job_id: str, *, status: str, result: Any = None, error: Optional[str] = None) -> None:
    """Mark a job complete / failed / running. No-op on unknown ids."""
    patch: dict = {"status": status, "updated_at": _now()}
    if result is not None:
        patch["result"] = result
    if error is not None:
        patch["error"] = error[:1000]  # cap error text
    await db[JOBS_COLLECTION].update_one({"id": job_id}, {"$set": patch})


async def get_job(db, job_id: str) -> Optional[dict]:
    """Fetch a job by id, ObjectId excluded."""
    return await db[JOBS_COLLECTION].find_one({"id": job_id}, {"_id": 0})


async def run_with_tracking(
    db, job_id: str, coro_factory: Callable[[], Awaitable[Any]]
) -> None:
    """
    Run a coroutine, capturing result/error into the job record.

    Designed to be the target of FastAPI's `BackgroundTasks.add_task`:
        background_tasks.add_task(run_with_tracking, db, job_id, factory)

    Note: we MUST pass `db` explicitly. The background task runs after
    the request returns, so request.app.state is not reliably available
    (depends on FastAPI internals); pass the motor client directly.
    """
    try:
        await update_job(db, job_id, status="running")
        result = await coro_factory()
        await update_job(db, job_id, status="complete", result=result)
        logger.info(f"AI job {job_id} complete")
    except Exception as exc:
        logger.exception(f"AI job {job_id} failed")
        await update_job(db, job_id, status="failed", error=f"{exc.__class__.__name__}: {exc}")
