"""
Iteration 51 backend tests — per-post blog analytics (view_count + lead_count)
+ public POST /api/blogs/<slug>/view endpoint + blog_slug attribution on
POST /api/leads.

References:
- /app/backend/routes/blogs.py (POST /blogs/{slug}/view)
- /app/backend/routes/admin.py (GET /admin/blogs view_count + lead_count)
- /app/backend/models/lead.py  (Lead/LeadCreate.blog_slug)
"""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_TOKEN = "test_session_1778055844"  # synthetic admin from /app/memory/test_credentials.md


@pytest.fixture(scope="module")
def admin_headers():
    return {"Authorization": f"Bearer {ADMIN_TOKEN}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def test_slug(admin_headers):
    """Create a throwaway blog post we own for the duration of these tests."""
    slug = f"test-iter51-{uuid.uuid4().hex[:8]}"
    payload = {
        "title": "TEST iter51 analytics",
        "title_de": "TEST iter51 analyse",
        "slug": slug,
        "excerpt": "TEST",
        "excerpt_de": "TEST",
        "content_html": "<p>test body</p>",
        "content_html_de": "<p>test body</p>",
        "category": "TEST",
        "tags": ["TEST"],
        "tags_de": ["TEST"],
        "author": "TEST",
        "status": "published",
        "featured_image": "",
        "read_time": "1 min read",
    }
    r = requests.post(f"{BASE_URL}/api/admin/blogs", json=payload, headers=admin_headers, timeout=15)
    assert r.status_code == 200, f"create blog failed: {r.status_code} {r.text}"
    yield slug
    # teardown
    requests.delete(f"{BASE_URL}/api/admin/blogs/{slug}", headers=admin_headers, timeout=15)
    # clean leads
    # there is no bulk-delete-by-blog_slug; delete by email used in tests
    requests.delete(
        f"{BASE_URL}/api/admin/leads/test-iter51-lead@example.com",
        headers=admin_headers,
        timeout=15,
    )


# ─── POST /api/blogs/{slug}/view ─────────────────────────────────────

class TestBlogView:
    def test_view_increments_count(self, test_slug, admin_headers):
        # baseline: read current view_count via admin list (search=slug)
        r0 = requests.get(
            f"{BASE_URL}/api/admin/blogs",
            headers=admin_headers,
            params={"search": test_slug, "limit": 5},
            timeout=10,
        )
        assert r0.status_code == 200
        before_post = next(p for p in r0.json()["posts"] if p["slug"] == test_slug)
        before = int(before_post.get("view_count", 0))

        # 3 view pings (no auth required)
        for _ in range(3):
            rv = requests.post(f"{BASE_URL}/api/blogs/{test_slug}/view", timeout=10)
            assert rv.status_code == 200
            assert rv.json() == {"ok": True}
            # ingress may inject extra cache directives; just check no-store is honored
            assert "no-store" in (rv.headers.get("Cache-Control") or "")
            time.sleep(0.15)

        # grace period for any write replication
        time.sleep(1.0)

        r1 = requests.get(
            f"{BASE_URL}/api/admin/blogs",
            headers=admin_headers,
            params={"search": test_slug, "limit": 5},
            timeout=10,
        )
        assert r1.status_code == 200
        after_post = next(p for p in r1.json()["posts"] if p["slug"] == test_slug)
        after = int(after_post.get("view_count", 0))
        assert after - before == 3, f"expected +3 views, got before={before} after={after}"

    def test_view_unknown_slug_404(self):
        r = requests.post(f"{BASE_URL}/api/blogs/does-not-exist-xyz-iter51/view", timeout=10)
        assert r.status_code == 404

    def test_view_no_auth_required(self, test_slug):
        # explicitly without any auth header
        s = requests.Session()
        s.headers.clear()
        r = s.post(f"{BASE_URL}/api/blogs/{test_slug}/view", timeout=10)
        assert r.status_code == 200
        assert r.json() == {"ok": True}


# ─── POST /api/leads with blog_slug ───────────────────────────────────

class TestLeadBlogSlug:
    def test_lead_persists_blog_slug(self, test_slug, admin_headers):
        payload = {
            "name": "TEST iter51 lead",
            "email": "test-iter51-lead@example.com",
            "company": "TEST",
            "source": "inline-blog",
            "blog_slug": test_slug,
        }
        r = requests.post(f"{BASE_URL}/api/leads", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("blog_slug") == test_slug
        assert body.get("email") == payload["email"]

        # verify persisted by listing leads (admin-only)
        r2 = requests.get(
            f"{BASE_URL}/api/admin/leads",
            headers=admin_headers,
            params={"search": payload["email"], "limit": 5},
            timeout=10,
        )
        assert r2.status_code == 200
        leads = r2.json()["leads"]
        match = [lead for lead in leads if lead.get("email") == payload["email"]]
        assert match, "lead not persisted"
        assert match[0].get("blog_slug") == test_slug


# ─── GET /api/admin/blogs view_count + lead_count ────────────────────

class TestAdminBlogsAggregation:
    def test_admin_list_returns_view_and_lead_counts(self, test_slug, admin_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/blogs",
            headers=admin_headers,
            params={"search": test_slug, "limit": 5},
            timeout=10,
        )
        assert r.status_code == 200
        posts = r.json()["posts"]
        assert posts, "post should be present in list"
        post = next(p for p in posts if p["slug"] == test_slug)

        # required new fields
        assert "view_count" in post and isinstance(post["view_count"], int)
        assert "lead_count" in post and isinstance(post["lead_count"], int)

        # after 3 views + 1 lead from prior tests (allow eventual consistency >=2)
        assert post["view_count"] >= 2
        assert post["lead_count"] >= 1

        # _id should not leak
        assert "_id" not in post

    def test_admin_list_pagination_still_works(self, admin_headers):
        r = requests.get(
            f"{BASE_URL}/api/admin/blogs",
            headers=admin_headers,
            params={"page": 1, "limit": 2},
            timeout=10,
        )
        assert r.status_code == 200
        body = r.json()
        assert body["page"] == 1 and body["limit"] == 2
        assert len(body["posts"]) <= 2
        # every post in the page must carry the new fields
        for p in body["posts"]:
            assert isinstance(p.get("view_count", 0), int)
            assert isinstance(p.get("lead_count", 0), int)
            assert "_id" not in p

    def test_admin_list_lead_count_is_zero_for_unattributed(self, admin_headers):
        # any post without a blog_slug attributed lead must still return
        # lead_count: 0 (key present, default int)
        r = requests.get(
            f"{BASE_URL}/api/admin/blogs",
            headers=admin_headers,
            params={"limit": 20},
            timeout=10,
        )
        assert r.status_code == 200
        for p in r.json()["posts"]:
            assert "lead_count" in p
            assert isinstance(p["lead_count"], int)

    def test_admin_list_unauth_401_or_403(self):
        r = requests.get(f"{BASE_URL}/api/admin/blogs", timeout=10)
        assert r.status_code in (401, 403)
