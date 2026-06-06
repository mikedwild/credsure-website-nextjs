from fastapi import APIRouter, HTTPException, Request, Header
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional, List
import os
import logging
import httpx

from models.lead import Lead, LeadCreate

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

# Source labels for human-readable Slack messages
SOURCE_LABELS = {
    'demo': 'Demo Request',
    'exit-intent': 'Exit-Intent Popup',
    'inline-blog': 'Blog Newsletter',
    'gated-guide': 'Guide Download',
    'gated-webinar': 'Webinar Access',
    'website': 'Website Form',
}

def _build_slack_blocks(lead_data: dict) -> list:
    """Build Slack Block Kit blocks from lead data."""
    source = lead_data.get('source', 'website')
    source_label = SOURCE_LABELS.get(source, source)
    interests = ', '.join(lead_data.get('interests', [])) or 'N/A'

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"New Lead: {source_label}", "emoji": True}
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Email:*\n{lead_data.get('email', 'N/A')}"},
                {"type": "mrkdwn", "text": f"*Source:*\n{source_label}"},
            ]
        },
    ]

    detail_fields = []
    if lead_data.get('name'):
        detail_fields.append({"type": "mrkdwn", "text": f"*Name:*\n{lead_data['name']}"})
    if lead_data.get('company'):
        detail_fields.append({"type": "mrkdwn", "text": f"*Company:*\n{lead_data['company']}"})
    if lead_data.get('role'):
        detail_fields.append({"type": "mrkdwn", "text": f"*Role:*\n{lead_data['role']}"})
    if interests != 'N/A':
        detail_fields.append({"type": "mrkdwn", "text": f"*Interests:*\n{interests}"})

    if detail_fields:
        blocks.append({"type": "section", "fields": detail_fields})

    if lead_data.get('message'):
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Message:*\n>{lead_data['message']}"}
        })

    blocks.append({"type": "divider"})
    return blocks, source_label


async def send_slack_notification(lead_data: dict):
    """Send Slack notification via incoming webhook when a new lead is captured"""
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')

    if not webhook_url:
        logger.warning("SLACK_WEBHOOK_URL not set - skipping Slack notification")
        return

    blocks, source_label = _build_slack_blocks(lead_data)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json={"blocks": blocks, "text": f"New lead from {source_label}: {lead_data.get('email')}"},
                timeout=10.0,
            )
            if response.status_code == 200:
                logger.info(f"Slack notification sent for lead: {lead_data['email']}")
            else:
                logger.warning(f"Slack notification failed: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Slack notification error: {str(e)}")


async def send_lead_notification(lead_data: dict):
    """Send email notification when new lead is captured"""
    resend_api_key = os.getenv('RESEND_API_KEY')

    if not resend_api_key:
        logger.warning("RESEND_API_KEY not set - skipping email notification")
        return

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "CredSure <noreply@credsure.com>",
                    "to": ["hello@credsure.com"],
                    "subject": f"New Lead from {lead_data.get('source', 'website')}: {lead_data.get('email')}",
                    "html": f"""
                    <h2>New Lead Captured</h2>
                    <p><strong>Source:</strong> {lead_data.get('source', 'website')}</p>
                    <p><strong>Name:</strong> {lead_data.get('name', 'N/A')}</p>
                    <p><strong>Email:</strong> {lead_data['email']}</p>
                    <p><strong>Company:</strong> {lead_data.get('company', 'N/A')}</p>
                    <p><strong>Role:</strong> {lead_data.get('role', 'N/A')}</p>
                    <p><strong>Interests:</strong> {', '.join(lead_data.get('interests', []))}</p>
                    <p><strong>Timestamp:</strong> {lead_data['timestamp']}</p>
                    """
                },
                timeout=10.0
            )

            if response.status_code == 200:
                logger.info(f"Email notification sent for lead: {lead_data['email']}")
            else:
                logger.warning(f"Email failed: {response.status_code} - {response.text}")

    except Exception as e:
        logger.error(f"Email notification error: {str(e)}")


@router.post("/leads", response_model=Lead)
@limiter.limit("10/minute")
async def create_lead(input: LeadCreate, request: Request):
    """Submit a new lead from the website"""
    lead_obj = Lead(**input.model_dump())

    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = lead_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    # Get database from request
    db = request.app.state.db

    # Store in MongoDB
    await db.leads.insert_one(doc)

    # Send notifications (async, non-blocking)
    try:
        await send_slack_notification(doc)
    except Exception as slack_error:
        logger.error(f"Slack notification failed but lead saved: {slack_error}")

    try:
        await send_lead_notification(doc)
    except Exception as email_error:
        logger.error(f"Email notification failed but lead saved: {email_error}")

    logger.info(f"New lead captured: {lead_obj.name} ({lead_obj.email}) from {lead_obj.source}")

    return lead_obj


@router.get("/leads")
async def get_leads(request: Request, api_key: Optional[str] = Header(None, alias="X-API-Key")):
    """Get all leads (admin only - requires API key)"""
    admin_key = os.environ.get('ADMIN_API_KEY', 'dev-admin-key')

    if api_key != admin_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    db = request.app.state.db
    leads = await db.leads.find({}, {"_id": 0, "name": 1, "email": 1, "company": 1, "role": 1, "interests": 1, "source": 1, "timestamp": 1}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for lead in leads:
        if isinstance(lead.get('timestamp'), str):
            from datetime import datetime
            lead['timestamp'] = datetime.fromisoformat(lead['timestamp'])

    return leads
