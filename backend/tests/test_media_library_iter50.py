"""
Iteration 50 — Featured-image Media Library backend tests.
Covers:
  - GET /api/admin/files (auth, pagination, image filter, filename search)
  - DELETE /api/admin/files/{id} (admin-only, soft delete propagation)
  - POST /api/admin/upload + appearance in list
  - GET /api/files/{path} for soft-deleted -> 404
"""
import io
import os
import time
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
ADMIN_TOKEN = "test_session_1778055844"
EDITOR_TOKEN = "editor_mlib_test_sess_1"

# 1x1 transparent PNG
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf"
    b"\xc0\xf0\x1f\x00\x05\x00\x01\xff\xa3\x9c\xe2\x89\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.fixture(scope="module")
def admin_h():
    return {"Authorization": f"Bearer {ADMIN_TOKEN}"}


@pytest.fixture(scope="module")
def editor_h():
    return {"Authorization": f"Bearer {EDITOR_TOKEN}"}


# ---- Sanity ----
def test_base_url_set():
    assert BASE_URL, "REACT_APP_BACKEND_URL missing"


def test_auth_me_admin(admin_h):
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=admin_h, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    user = body.get("user", body)
    assert user.get("role") == "admin"


def test_auth_me_editor(editor_h):
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=editor_h, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    user = body.get("user", body)
    assert user.get("role") == "editor"


# ---- Media library list ----
def test_list_files_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/files", timeout=20)
    assert r.status_code in (401, 403)


def test_list_files_shape(admin_h):
    r = requests.get(f"{BASE_URL}/api/admin/files", headers=admin_h, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    for key in ("files", "total", "page", "limit"):
        assert key in data
    assert isinstance(data["files"], list)
    # No _id leak
    for f in data["files"]:
        assert "_id" not in f


def test_list_files_content_type_filter(admin_h):
    r = requests.get(
        f"{BASE_URL}/api/admin/files?content_type=image",
        headers=admin_h, timeout=20,
    )
    assert r.status_code == 200, r.text
    for f in r.json()["files"]:
        assert (f.get("content_type") or "").startswith("image")


def test_list_files_pagination_clamps(admin_h):
    # limit=0 should clamp to >=1; limit=9999 should clamp to <=100
    r = requests.get(f"{BASE_URL}/api/admin/files?page=1&limit=9999",
                     headers=admin_h, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert len(data["files"]) <= 100


# ---- Upload + appearance + fields ----
@pytest.fixture(scope="module")
def uploaded_file(admin_h):
    marker = f"TEST_mlib_{int(time.time())}.png"
    files = {"file": (marker, io.BytesIO(PNG_BYTES), "image/png")}
    r = requests.post(
        f"{BASE_URL}/api/admin/upload",
        headers={"Authorization": admin_h["Authorization"]},
        files=files, timeout=30,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "path" in body
    return {"marker": marker, "path": body["path"], "size": body.get("size")}


def test_uploaded_file_in_list(admin_h, uploaded_file):
    r = requests.get(
        f"{BASE_URL}/api/admin/files?search={uploaded_file['marker']}",
        headers=admin_h, timeout=20,
    )
    assert r.status_code == 200, r.text
    files = r.json()["files"]
    match = [f for f in files if f.get("filename") == uploaded_file["marker"]]
    assert len(match) == 1, f"expected 1 match, got {files}"
    f = match[0]
    for key in ("id", "storage_path", "url", "filename", "content_type", "size", "created_at"):
        assert key in f, f"missing {key} in {f}"
    assert "_id" not in f
    assert f["content_type"] == "image/png"
    assert f["url"].startswith("/api/files/")
    assert f["storage_path"] == uploaded_file["path"]
    # Save id for downstream tests via attribute on function
    uploaded_file["id"] = f["id"]


def test_list_sorted_desc(admin_h, uploaded_file):
    # Upload a 2nd marker, ensure newest first
    time.sleep(1)
    marker2 = f"TEST_mlib2_{int(time.time())}.png"
    files = {"file": (marker2, io.BytesIO(PNG_BYTES), "image/png")}
    r = requests.post(
        f"{BASE_URL}/api/admin/upload",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        files=files, timeout=30,
    )
    assert r.status_code == 200
    r = requests.get(f"{BASE_URL}/api/admin/files?content_type=image&limit=50",
                     headers=admin_h, timeout=20)
    items = r.json()["files"]
    # Find positions of both markers
    pos = {f["filename"]: i for i, f in enumerate(items) if f["filename"] in
           (uploaded_file["marker"], marker2)}
    if marker2 in pos and uploaded_file["marker"] in pos:
        assert pos[marker2] < pos[uploaded_file["marker"]], "newest should be first"


# ---- Search ----
def test_search_case_insensitive(admin_h, uploaded_file):
    r = requests.get(
        f"{BASE_URL}/api/admin/files?search={uploaded_file['marker'].upper()}",
        headers=admin_h, timeout=20,
    )
    assert r.status_code == 200
    files = r.json()["files"]
    assert any(f["filename"] == uploaded_file["marker"] for f in files)


# ---- Delete (soft) ----
def test_delete_as_editor_forbidden(editor_h, uploaded_file):
    fid = uploaded_file.get("id")
    assert fid, "uploaded_file id missing — prior test must have set it"
    r = requests.delete(f"{BASE_URL}/api/admin/files/{fid}", headers=editor_h, timeout=20)
    assert r.status_code == 403, r.text


def test_delete_as_admin_ok(admin_h, uploaded_file):
    fid = uploaded_file["id"]
    r = requests.delete(f"{BASE_URL}/api/admin/files/{fid}", headers=admin_h, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    assert body.get("id") == fid


def test_deleted_not_in_list(admin_h, uploaded_file):
    r = requests.get(
        f"{BASE_URL}/api/admin/files?search={uploaded_file['marker']}",
        headers=admin_h, timeout=20,
    )
    assert r.status_code == 200
    files = r.json()["files"]
    assert not any(f.get("id") == uploaded_file["id"] for f in files)


def test_deleted_serve_file_404(uploaded_file):
    # /api/files/{path} should 404 for soft-deleted
    r = requests.get(f"{BASE_URL}/api/files/{uploaded_file['path']}", timeout=20)
    assert r.status_code == 404, f"expected 404 for soft-deleted, got {r.status_code}"


def test_delete_missing_id_404(admin_h):
    r = requests.delete(f"{BASE_URL}/api/admin/files/nonexistent-id-12345",
                        headers=admin_h, timeout=20)
    assert r.status_code == 404
