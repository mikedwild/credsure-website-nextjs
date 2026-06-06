from fastapi import APIRouter, Request
from datetime import datetime, timezone, timedelta
from utils.auth import require_admin_only
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

SOURCE_LABELS = {
    'demo': 'Demo Request',
    'exit-intent-roi': 'Exit-Intent ROI',
    'inline-blog': 'Blog Newsletter',
    'gated-guide': 'Guide Download',
    'gated-webinar': 'Webinar Access',
    'website': 'Website Form',
    'roi-gate': 'ROI Calculator Gate',
}


@router.get("/leads/analytics")
async def get_lead_analytics(request: Request):
    """Lead analytics — all computed server-side via MongoDB aggregation."""
    await require_admin_only(request)

    db = request.app.state.db
    now = datetime.now(timezone.utc)
    thirty_days_ago = (now - timedelta(days=30)).isoformat()
    seven_days_ago = (now - timedelta(days=7)).isoformat()
    fourteen_days_ago = (now - timedelta(days=14)).isoformat()

    # Total count
    total = await db.leads.count_documents({})

    # By source — aggregation
    by_source = []
    async for doc in db.leads.aggregate([
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]):
        src = doc["_id"] or "unknown"
        by_source.append({
            "source": src,
            "label": SOURCE_LABELS.get(src, src.replace('-', ' ').title()),
            "count": doc["count"],
        })

    # Daily trend (last 30 days) — aggregation
    daily_map = {}
    for i in range(30):
        day = (now - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        daily_map[day] = 0

    async for doc in db.leads.aggregate([
        {"$match": {"timestamp": {"$gte": thirty_days_ago}}},
        {"$project": {"day": {"$substr": ["$timestamp", 0, 10]}}},
        {"$group": {"_id": "$day", "count": {"$sum": 1}}},
    ]):
        if doc["_id"] in daily_map:
            daily_map[doc["_id"]] = doc["count"]

    daily_trend = [{"date": k, "count": v} for k, v in daily_map.items()]

    # Week comparison — aggregation
    this_week_result = await db.leads.count_documents({"timestamp": {"$gte": seven_days_ago}})
    last_week_result = await db.leads.count_documents({
        "timestamp": {"$gte": fourteen_days_ago, "$lt": seven_days_ago}
    })
    week_change_pct = round(((this_week_result - last_week_result) / max(last_week_result, 1)) * 100, 1)

    # Recent leads — only 20
    recent = await db.leads.find(
        {}, {"_id": 0, "name": 1, "email": 1, "company": 1, "source": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(20).to_list(20)

    return {
        "total_leads": total,
        "this_week": this_week_result,
        "last_week": last_week_result,
        "week_change_pct": week_change_pct,
        "by_source": by_source,
        "daily_trend": daily_trend,
        "recent_leads": recent,
    }
