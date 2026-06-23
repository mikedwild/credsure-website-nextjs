from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking (production only)
if os.getenv('SENTRY_DSN') and os.getenv('SENTRY_ENVIRONMENT', 'development') == 'production':
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        environment=os.getenv('SENTRY_ENVIRONMENT', 'production'),
        release=os.getenv('APP_VERSION', '1.0.0'),
        traces_sample_rate=0.1,
        integrations=[
            FastApiIntegration(transaction_style="url", failed_request_status_codes=[500, 599]),
            LoggingIntegration(level=logging.INFO, event_level=logging.ERROR),
        ],
        before_send=lambda event, hint: event if os.getenv('SENTRY_ENVIRONMENT') == 'production' else None,
    )
    logger.info("✅ Sentry initialized for production")
else:
    logger.info("Sentry not initialized (dev mode or no DSN)")

# MongoDB connection
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# CORS configuration.
# IMPORTANT: the Google sign-in flow (AuthCallback.jsx) issues a fetch with
# `credentials: 'include'`. Per CORS spec, browsers REJECT a credentialed
# request whose response carries `Access-Control-Allow-Origin: *`, so we
# must echo a specific origin and emit `Access-Control-Allow-Credentials`.
# Starlette's CORSMiddleware silently drops the credentials header when
# `allow_origins=["*"]`, which is exactly what bricked sign-in on prod.
#
# Sources of allowed origins:
#   1. CORS_ORIGINS env var (comma-separated explicit list — overrides defaults)
#   2. CORS_ORIGIN_REGEX env var (regex for preview / deploy domain patterns)
#   3. Hardcoded production + preview defaults so the app works out of the box
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').strip()
_DEFAULT_ORIGINS = [
    "https://credsure.io",
    "https://www.credsure.io",
    "https://credsure-website-nextjs.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
]
if CORS_ORIGINS and CORS_ORIGINS != '*':
    ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(',') if o.strip()]
else:
    # Treat empty or "*" as "use the safe defaults" — never literal "*"
    # because that breaks credentialed requests.
    ALLOWED_ORIGINS = list(_DEFAULT_ORIGINS)

# Regex to cover Vercel preview deployments (credsure-website-nextjs-<hash>-…
# .vercel.app) without enumerating each one. (Replaces the old Emergent preview/
# deploy-domain pattern, which is no longer used.)
ALLOWED_ORIGIN_REGEX = os.environ.get(
    'CORS_ORIGIN_REGEX',
    r"https://credsure-website-nextjs[a-z0-9-]*\.vercel\.app",
)

# Rate limiter — shared instance lives in utils.rate_limit so route modules
# can import it for @limiter.limit(...) without a circular import on server.
from utils.rate_limit import limiter

# Create FastAPI app
app = FastAPI(
    title="CredSure API",
    description="Blockchain-Verified Digital Credentials Platform",
    version="2.0.0"
)

# Add rate limiter middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression for responses > 500 bytes
app.add_middleware(GZipMiddleware, minimum_size=500)


# Cache-Control middleware for API responses
class CacheControlMiddleware(BaseHTTPMiddleware):
    """Sets Cache-Control and security headers based on route patterns."""

    # Routes that should be cached (path prefix -> max-age in seconds)
    CACHEABLE = {
        "/api/blogs": 300,         # 5 min for blog listings/details
        "/api/sitemap": 3600,      # 1 hour for sitemap
        "/api/status": 60,         # 1 min for status
    }
    # Routes that must never be cached
    NO_CACHE = {"/api/auth", "/api/admin", "/api/leads"}

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        path = request.url.path

        # Security headers (all responses)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Skip non-GET requests for caching
        if request.method != "GET":
            return response

        # No-cache routes
        for prefix in self.NO_CACHE:
            if path.startswith(prefix):
                response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
                return response

        # Cacheable routes
        for prefix, max_age in self.CACHEABLE.items():
            if path.startswith(prefix):
                response.headers["Cache-Control"] = f"public, max-age={max_age}, stale-while-revalidate={max_age * 2}"
                return response

        return response


app.add_middleware(CacheControlMiddleware)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    app.state.mongo_client = AsyncIOMotorClient(MONGO_URL)
    app.state.db = app.state.mongo_client[DB_NAME]
    logger.info(f"Connected to MongoDB: {DB_NAME}")
    # Blog image/file storage is now MongoDB GridFS (utils.storage) — no separate
    # object-store service or warm-up step needed.
    # Seed admin user
    try:
        from utils.auth import seed_admin
        await seed_admin(app.state.db)
        logger.info("Admin user seeded")
    except Exception as e:
        logger.warning(f"Admin seed error: {e}")
    # TTL index so the blog view-dedupe collection self-expires (keeps it
    # bounded). `created_at` is stored as a BSON Date (datetime) for TTL to
    # apply. 2h covers the per-hour dedupe window with margin.
    try:
        await app.state.db.blog_view_dedupe.create_index(
            "created_at", expireAfterSeconds=7200
        )
    except Exception as e:
        logger.warning(f"view-dedupe index error: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.mongo_client.close()
    logger.info("✅ MongoDB connection closed")

# Import and include routers
from routes.status import router as status_router
from routes.leads import router as leads_router
from routes.sitemap import router as sitemap_router
from routes.blogs import router as blogs_router
from routes.analytics import router as analytics_router
from routes.admin import router as admin_router
from routes.auth import router as auth_router
from routes.google_auth import router as google_auth_router
from routes.invites import router as invites_router
from routes.og import router as og_router

app.include_router(status_router, prefix="/api", tags=["status"])
app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(google_auth_router, prefix="/api", tags=["auth"])
app.include_router(invites_router, prefix="/api", tags=["auth"])
app.include_router(analytics_router, prefix="/api", tags=["analytics"])
app.include_router(admin_router, prefix="/api", tags=["admin"])
app.include_router(leads_router, prefix="/api", tags=["leads"])
app.include_router(sitemap_router, prefix="/api", tags=["seo"])
app.include_router(blogs_router, prefix="/api", tags=["blogs"])
app.include_router(og_router, prefix="/api", tags=["seo"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CredSure API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
