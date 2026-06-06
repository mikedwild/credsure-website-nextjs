"""AI telemetry dashboard endpoint."""
from fastapi import APIRouter, Request

from utils.auth import get_current_admin
from ai import feature_flags as ai_flags
from ai import telemetry as ai_telemetry
from ai import routing as ai_routing


router = APIRouter()


@router.get("/admin/ai/telemetry")
async def admin_ai_telemetry(request: Request, hours: int = 168):
    """Aggregated AI usage / cost / latency / cache metrics.

    Default window: 168 hours (1 week). Pass `?hours=24` for last day,
    `?hours=720` for last month. Returns:

      - flags: current feature-flag snapshot
      - routing: per-intent model + tier table (from /ai/agents/)
      - summary: rolled-up metrics for the window
      - summary.by_intent / by_workflow: breakdown rows

    Read by the admin UI to surface "AI Spend" and "Save latency" charts,
    and to confirm cache_hit_rate / would_have_hit_rate before flipping
    the cache flag in Phase 1.
    """
    await get_current_admin(request)
    db = request.app.state.db
    hours = max(1, min(24 * 90, int(hours)))   # clamp 1h..90d
    return {
        "flags": ai_flags.snapshot(),
        "routing": ai_routing.all_intents(),
        "summary": await ai_telemetry.summary(db, since_hours=hours),
    }
