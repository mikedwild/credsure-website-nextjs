"""
Iteration 49 backend tests — admin blog QoL features:
- slug-available route ordering (must NOT be shadowed by /admin/blogs/{slug})
- duplicate post
- bulk action (publish/unpublish/delete)
- revisions list + create-on-update + restore
- CORS preflight + actual request for credentialed origin
"""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://bilingual-lead-gen.preview.emergentagent.com").rstrip("/")
SESSION_TOKEN = "test_session_1778055844"
HEADERS = {"Authorization": f"Bearer {SESSION_TOKEN}", "Content-Type": "application/json"}
TARGET_SLUG = "bilingual-lead-gen"


@pytest.fixture(scope="module")
def existing_slug():
    """Ensure target post exists; create a placeholder if not."""
    r = requests.get(f"{BASE_URL}/api/admin/blogs/{TARGET_SLUG}", headers=HEADERS, timeout=15)
    if r.status_code == 404:
        body = {
            "title": "Bilingual Lead Gen",
            "title_de": "Zweisprachige Lead-Generierung",
            "slug": TARGET_SLUG,
            "excerpt": "test excerpt",
            "excerpt_de": "test",
            "content_html": "<p>hello world</p>",
            "content_html_de": "<p>hallo welt</p>",
            "category": "General",
            "tags": ["test"],
            "tags_de": ["test"],
            "author": "Test",
            "read_time": "1 min read",
            "status": "draft",
            "featured_image": "",
            "seo_title": "",
            "seo_description": "",
        }
        cr = requests.post(f"{BASE_URL}/api/admin/blogs", headers=HEADERS, json=body, timeout=20)
        assert cr.status_code in (200, 201, 409), f"Setup failed: {cr.status_code} {cr.text[:300]}"
    return TARGET_SLUG


# --- slug-available ordering regression ---
class TestSlugAvailable:
    def test_slug_available_for_fresh_slug(self):
        fresh = f"TEST-fresh-slug-{int(time.time())}"
        r = requests.get(f"{BASE_URL}/api/admin/blogs/slug-available", params={"slug": fresh}, headers=HEADERS, timeout=15)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("available") is True
        assert data.get("slug") == fresh

    def test_slug_available_for_existing_slug_returns_false(self, existing_slug):
        r = requests.get(f"{BASE_URL}/api/admin/blogs/slug-available", params={"slug": existing_slug}, headers=HEADERS, timeout=15)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        data = r.json()
        assert data.get("available") is False
        assert data.get("slug") == existing_slug

    def test_slug_available_not_shadowed_by_dynamic_route(self, existing_slug):
        # Specifically: slug-available must come BEFORE /admin/blogs/{slug}
        r = requests.get(f"{BASE_URL}/api/admin/blogs/slug-available?slug={existing_slug}", headers=HEADERS, timeout=15)
        assert r.status_code == 200
        body = r.json()
        # If it were shadowed, we'd get the post object back, not {available: bool}
        assert "available" in body
        assert "post" not in body


# --- Duplicate ---
class TestDuplicate:
    def test_duplicate_creates_draft_with_copy_suffix(self, existing_slug):
        r = requests.post(f"{BASE_URL}/api/admin/blogs/{existing_slug}/duplicate", headers=HEADERS, timeout=20)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:400]}"
        body = r.json()
        post = body.get("post", {})
        new_slug = post.get("slug")
        assert new_slug is not None
        assert new_slug.startswith(f"{existing_slug}-copy")
        assert post.get("status") == "draft"
        # cleanup
        requests.delete(f"{BASE_URL}/api/admin/blogs/{new_slug}", headers=HEADERS, timeout=15)


# --- Bulk actions ---
class TestBulkActions:
    @pytest.fixture
    def two_test_posts(self):
        slugs = []
        for i in range(2):
            slug = f"TEST-bulk-{int(time.time())}-{i}"
            body = {
                "title": f"Bulk test {i}",
                "title_de": "",
                "slug": slug,
                "excerpt": "x",
                "excerpt_de": "",
                "content_html": "<p>x</p>",
                "content_html_de": "",
                "category": "General",
                "tags": [],
                "tags_de": [],
                "author": "T",
                "read_time": "1 min read",
                "status": "draft",
                "featured_image": "",
                "seo_title": "",
                "seo_description": "",
            }
            r = requests.post(f"{BASE_URL}/api/admin/blogs", headers=HEADERS, json=body, timeout=20)
            assert r.status_code in (200, 201), f"setup failed: {r.text[:300]}"
            slugs.append(slug)
        yield slugs
        requests.post(f"{BASE_URL}/api/admin/blogs/bulk", headers=HEADERS, json={"slugs": slugs, "action": "delete"}, timeout=20)

    def test_bulk_publish(self, two_test_posts):
        r = requests.post(f"{BASE_URL}/api/admin/blogs/bulk", headers=HEADERS,
                          json={"slugs": two_test_posts, "action": "publish"}, timeout=20)
        assert r.status_code == 200, r.text[:300]
        assert r.json().get("matched") == 2
        # verify
        g = requests.get(f"{BASE_URL}/api/admin/blogs/{two_test_posts[0]}", headers=HEADERS, timeout=15)
        assert g.json()["post"]["status"] == "published"

    def test_bulk_unpublish(self, two_test_posts):
        # publish first then unpublish
        requests.post(f"{BASE_URL}/api/admin/blogs/bulk", headers=HEADERS,
                      json={"slugs": two_test_posts, "action": "publish"}, timeout=20)
        r = requests.post(f"{BASE_URL}/api/admin/blogs/bulk", headers=HEADERS,
                          json={"slugs": two_test_posts, "action": "unpublish"}, timeout=20)
        assert r.status_code == 200
        assert r.json().get("matched") == 2
        g = requests.get(f"{BASE_URL}/api/admin/blogs/{two_test_posts[0]}", headers=HEADERS, timeout=15)
        assert g.json()["post"]["status"] == "draft"

    def test_bulk_delete(self):
        # create then delete
        slug = f"TEST-bulk-del-{int(time.time())}"
        body = {"title": "X", "slug": slug, "excerpt": "x", "content_html": "<p>x</p>",
                "category": "General", "tags": [], "author": "T", "read_time": "1 min", "status": "draft"}
        r = requests.post(f"{BASE_URL}/api/admin/blogs", headers=HEADERS, json=body, timeout=20)
        assert r.status_code in (200, 201)
        d = requests.post(f"{BASE_URL}/api/admin/blogs/bulk", headers=HEADERS,
                         json={"slugs": [slug], "action": "delete"}, timeout=20)
        assert d.status_code == 200
        assert d.json().get("matched") == 1
        # verify gone
        g = requests.get(f"{BASE_URL}/api/admin/blogs/{slug}", headers=HEADERS, timeout=15)
        assert g.status_code == 404

    def test_bulk_unknown_action_400(self):
        r = requests.post(f"{BASE_URL}/api/admin/blogs/bulk", headers=HEADERS,
                          json={"slugs": ["x"], "action": "nuke"}, timeout=15)
        assert r.status_code == 400


# --- Revisions ---
class TestRevisions:
    def test_revisions_list_format(self, existing_slug):
        r = requests.get(f"{BASE_URL}/api/admin/blogs/{existing_slug}/revisions", headers=HEADERS, timeout=15)
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        assert data.get("slug") == existing_slug
        assert isinstance(data.get("revisions"), list)

    def test_update_creates_revision_and_restore(self, existing_slug):
        # snapshot original
        before = requests.get(f"{BASE_URL}/api/admin/blogs/{existing_slug}", headers=HEADERS, timeout=15).json()["post"]
        original_title = before.get("title")

        # Get revisions count before
        rev_before = requests.get(f"{BASE_URL}/api/admin/blogs/{existing_slug}/revisions", headers=HEADERS, timeout=15).json()
        count_before = len(rev_before["revisions"])

        # Do an update
        marker = f"REV-MARK-{int(time.time())}"
        upd = requests.put(f"{BASE_URL}/api/admin/blogs/{existing_slug}", headers=HEADERS,
                           json={"title": marker}, timeout=20)
        assert upd.status_code == 200, upd.text[:300]

        # Revisions should have grown by 1 (the pre-update snapshot)
        rev_after = requests.get(f"{BASE_URL}/api/admin/blogs/{existing_slug}/revisions", headers=HEADERS, timeout=15).json()
        revs = rev_after["revisions"]
        assert len(revs) == count_before + 1, f"expected +1 revision, got {len(revs)} from {count_before}"
        latest = revs[0]
        assert latest.get("title") == original_title, f"expected pre-update title preserved: {latest}"
        assert "revision_at" in latest

        # Restore the prior revision
        rest = requests.post(
            f"{BASE_URL}/api/admin/blogs/{existing_slug}/revisions/restore",
            headers=HEADERS,
            params={"revision_at": latest["revision_at"]},
            timeout=20,
        )
        assert rest.status_code == 200, rest.text[:300]

        # Verify restored
        after = requests.get(f"{BASE_URL}/api/admin/blogs/{existing_slug}", headers=HEADERS, timeout=15).json()["post"]
        assert after.get("title") == original_title


# --- CORS ---
# NOTE: We hit localhost:8001 directly because the Kubernetes ingress / Cloudflare
# in front of the preview URL short-circuits OPTIONS preflights and rewrites
# Access-Control-Allow-Origin to "*" before our backend's headers reach the
# client. Per main agent's note, that's outside backend control. Our job here
# is to verify the BACKEND itself emits the correct echoed-origin + credentials
# combo, which is what runs on credsure.io production (no CDN rewrite).
CORS_BACKEND = "http://localhost:8001"


class TestCORS:
    def test_preflight_credsure_io(self):
        r = requests.options(
            f"{CORS_BACKEND}/api/auth/google/session",
            headers={
                "Origin": "https://credsure.io",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=15,
        )
        # Backend should respond — even if CDN injects extra ACAO, backend's must echo origin
        acao = r.headers.get("access-control-allow-origin") or r.headers.get("Access-Control-Allow-Origin")
        acac = r.headers.get("access-control-allow-credentials") or r.headers.get("Access-Control-Allow-Credentials")
        # The header value may have multiple comma-separated values from middleware stacking
        assert acao is not None, f"no ACAO header. status={r.status_code}, headers={dict(r.headers)}"
        assert "https://credsure.io" in acao, f"ACAO does not echo origin: {acao}"
        assert acac and acac.lower() == "true", f"ACAC missing/invalid: {acac}"

    def test_preflight_preview_domain(self):
        origin = "https://bilingual-lead-gen.preview.emergentagent.com"
        r = requests.options(
            f"{CORS_BACKEND}/api/auth/google/session",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=15,
        )
        acao = r.headers.get("access-control-allow-origin") or r.headers.get("Access-Control-Allow-Origin")
        acac = r.headers.get("access-control-allow-credentials") or r.headers.get("Access-Control-Allow-Credentials")
        assert acao is not None, f"no ACAO. status={r.status_code} headers={dict(r.headers)}"
        assert origin in acao, f"ACAO does not echo origin: {acao}"
        assert acac and acac.lower() == "true"

    def test_actual_post_emits_credentialed_cors(self):
        r = requests.post(
            f"{CORS_BACKEND}/api/auth/google/session",
            headers={"Origin": "https://credsure.io", "Content-Type": "application/json"},
            json={"session_id": "invalid-test"},
            timeout=15,
        )
        acao = r.headers.get("access-control-allow-origin") or r.headers.get("Access-Control-Allow-Origin")
        acac = r.headers.get("access-control-allow-credentials") or r.headers.get("Access-Control-Allow-Credentials")
        assert acao is not None
        assert "https://credsure.io" in acao, f"ACAO mismatch: {acao}"
        assert acac and acac.lower() == "true"
