"""Lead management — list, CSV export, delete. Admin role only."""
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional

from utils.auth import require_admin_only


router = APIRouter()


def _csv_escape(val):
    """Escape a value for CSV output."""
    s = str(val).replace('"', '""')
    if "," in s or '"' in s or "\n" in s:
        return f'"{s}"'
    return s


@router.get("/admin/leads")
async def admin_list_leads(
    request: Request,
    source: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 25,
):
    await require_admin_only(request)
    db = request.app.state.db
    query = {}
    if source:
        query["source"] = source
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
        ]

    total = await db.leads.count_documents(query)
    leads = await db.leads.find(query, {"_id": 0}).sort("timestamp", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    sources = await db.leads.distinct("source")
    return {"leads": leads, "total": total, "page": page, "limit": limit, "sources": sorted(s for s in sources if s)}


@router.get("/admin/leads/export")
async def admin_export_leads(request: Request):
    await require_admin_only(request)
    db = request.app.state.db

    async def generate_csv():
        # Header row
        yield "Name,Email,Company,Role,Source,Interests,Timestamp\n"
        # Stream in batches of 500. Cap at 50k rows to keep export under
        # 30 s on the deployment ingress; admins can re-run for older data
        # via the date filter once that lands.
        cursor = db.leads.find({}, {"_id": 0}).sort("timestamp", -1).limit(50000)
        batch = []
        async for lead in cursor:
            row = ",".join([
                _csv_escape(lead.get("name", "")),
                _csv_escape(lead.get("email", "")),
                _csv_escape(lead.get("company", "")),
                _csv_escape(lead.get("role", "")),
                _csv_escape(lead.get("source", "")),
                _csv_escape(", ".join(lead.get("interests", []))),
                _csv_escape(lead.get("timestamp", "")),
            ])
            batch.append(row + "\n")
            if len(batch) >= 500:
                yield "".join(batch)
                batch = []
        if batch:
            yield "".join(batch)

    return StreamingResponse(
        generate_csv(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads_export.csv"}
    )


@router.delete("/admin/leads/{email}")
async def admin_delete_lead(request: Request, email: str):
    await require_admin_only(request)
    db = request.app.state.db
    result = await db.leads.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}
