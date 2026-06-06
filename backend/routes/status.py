from fastapi import APIRouter, Request
from typing import List
from datetime import datetime

from models.status_check import StatusCheck, StatusCheckCreate

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "CredSure API - Blockchain-Verified Digital Credentials"}

@router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate, request: Request):
    status_obj = StatusCheck(**input.model_dump())
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    db = request.app.state.db
    await db.status_checks.insert_one(doc)
    return status_obj

@router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(request: Request):
    db = request.app.state.db
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check.get('timestamp'), str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks
