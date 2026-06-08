from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class BlogPostCreate(BaseModel):
    title: str
    title_de: str = ""
    slug: str
    excerpt: str = ""
    excerpt_de: str = ""
    content_html: str = ""
    content_html_de: str = ""
    category: str = "Uncategorized"
    tags: List[str] = []
    tags_de: List[str] = []
    author: str = "CredSure Team"
    read_time: str = "5 min read"
    status: str = Field(default="draft", pattern="^(draft|published|scheduled)$")
    scheduled_at: Optional[str] = None
    featured_image: str = ""
    seo_title: str = ""
    seo_description: str = ""
    seo_title_de: str = ""
    seo_description_de: str = ""


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    title_de: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    excerpt_de: Optional[str] = None
    content_html: Optional[str] = None
    content_html_de: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    tags_de: Optional[List[str]] = None
    author: Optional[str] = None
    read_time: Optional[str] = None
    status: Optional[str] = None
    scheduled_at: Optional[str] = None
    featured_image: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_title_de: Optional[str] = None
    seo_description_de: Optional[str] = None


class SiteSettings(BaseModel):
    site_title: str = "CredSure"
    site_description: str = ""
    default_author: str = "CredSure Team"
    social_linkedin: str = ""
    social_twitter: str = ""
    contact_email: str = ""
    ga_tracking_id: str = ""
    # LLM provider API keys for AI blog generation / translation / images.
    # Stored server-side; never returned verbatim by the API (masked on GET).
    anthropic_api_key: str = ""
    openai_api_key: str = ""
