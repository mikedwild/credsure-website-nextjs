from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime, timezone

class Lead(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    name: str
    email: EmailStr
    company: str = ""
    phone: str = ""
    message: str = ""
    source: str = "website"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"
    # Mirror of LeadCreate.blog_slug — persisted so the admin list can
    # aggregate `db.leads` by blog_slug for the per-post lead column.
    blog_slug: Optional[str] = None

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    company: str = ""
    phone: str = ""
    message: str = ""
    source: str = "website"
    role: str = ""
    interests: list = []
    # Optional originating blog slug for per-post lead attribution.
    # Set by InlineBlogCTA on /blog/<slug> pages so the admin list can
    # show "leads attributed to this post". Stays empty for non-blog
    # lead sources (demo, exit-intent, etc.).
    blog_slug: Optional[str] = None
