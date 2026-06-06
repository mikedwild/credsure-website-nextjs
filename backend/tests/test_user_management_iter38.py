"""
Iteration 38: User Management System Tests
Tests for admin/editor roles, user CRUD, and role-based access control
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@credsure.io"
ADMIN_PASSWORD = "CredSure@Admin2026!"
EDITOR_EMAIL = "editor@credsure.io"
EDITOR_PASSWORD = "Editor2026!"

# Test user for CRUD operations
TEST_USER_EMAIL = f"test_user_{int(time.time())}@credsure.io"
TEST_USER_NAME = "Test User"
TEST_USER_PASSWORD = "TestPass123!"


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Admin can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        # Either direct token or MFA required
        assert "token" in data or "mfa_required" in data
        if "token" in data:
            assert "user" in data
            assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful")


class TestEditorLogin:
    """Test editor authentication"""
    
    def test_editor_login_success(self):
        """Editor can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EDITOR_EMAIL,
            "password": EDITOR_PASSWORD
        })
        assert response.status_code == 200, f"Editor login failed: {response.text}"
        data = response.json()
        assert "token" in data or "mfa_required" in data
        if "token" in data:
            assert "user" in data
            assert data["user"]["role"] == "editor"
        print(f"✓ Editor login successful")


@pytest.fixture(scope="module")
def admin_token():
    """Get admin JWT token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Admin login failed: {response.text}")
    data = response.json()
    if data.get("mfa_required"):
        pytest.skip("Admin has MFA enabled - cannot test without TOTP code")
    return data["token"]


@pytest.fixture(scope="module")
def editor_token():
    """Get editor JWT token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": EDITOR_EMAIL,
        "password": EDITOR_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Editor login failed: {response.text}")
    data = response.json()
    if data.get("mfa_required"):
        pytest.skip("Editor has MFA enabled - cannot test without TOTP code")
    return data["token"]


class TestUserCRUD:
    """Test user CRUD operations (admin only)"""
    
    def test_create_user_success(self, admin_token):
        """Admin can create a new user"""
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": TEST_USER_EMAIL,
                "name": TEST_USER_NAME,
                "password": TEST_USER_PASSWORD,
                "role": "editor"
            }
        )
        assert response.status_code == 200, f"Create user failed: {response.text}"
        data = response.json()
        assert "message" in data
        assert TEST_USER_EMAIL in data["message"]
        print(f"✓ User created: {TEST_USER_EMAIL}")
    
    def test_create_user_duplicate_email_409(self, admin_token):
        """Creating user with duplicate email returns 409"""
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": TEST_USER_EMAIL,  # Same email as above
                "name": "Duplicate User",
                "password": "DupePass123!",
                "role": "editor"
            }
        )
        assert response.status_code == 409, f"Expected 409, got {response.status_code}: {response.text}"
        print(f"✓ Duplicate email correctly rejected with 409")
    
    def test_create_user_short_password_400(self, admin_token):
        """Creating user with password < 8 chars returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": "shortpw@test.com",
                "name": "Short Password",
                "password": "short",  # Less than 8 chars
                "role": "editor"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "8 characters" in data.get("detail", "")
        print(f"✓ Short password correctly rejected with 400")
    
    def test_list_users_no_password_hash(self, admin_token):
        """GET /api/admin/users returns users without password hashes"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"List users failed: {response.text}"
        data = response.json()
        assert "users" in data
        assert len(data["users"]) > 0
        
        # Verify no password hashes exposed
        for user in data["users"]:
            assert "password_hash" not in user, "Password hash should not be exposed"
            assert "mfa_secret" not in user, "MFA secret should not be exposed"
            assert "recovery_codes" not in user, "Recovery codes should not be exposed"
        print(f"✓ User list returned {len(data['users'])} users without sensitive data")
    
    def test_update_user_name_role_password(self, admin_token):
        """Admin can update user name, role, and password"""
        response = requests.put(
            f"{BASE_URL}/api/admin/users/{TEST_USER_EMAIL}",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={
                "name": "Updated Name",
                "role": "admin",
                "password": "NewPassword123!"
            }
        )
        assert response.status_code == 200, f"Update user failed: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"✓ User updated successfully")
        
        # Verify update persisted
        list_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = list_response.json()["users"]
        updated_user = next((u for u in users if u["email"] == TEST_USER_EMAIL), None)
        assert updated_user is not None
        assert updated_user["name"] == "Updated Name"
        assert updated_user["role"] == "admin"
        print(f"✓ User update verified in database")
    
    def test_admin_cannot_deactivate_self(self, admin_token):
        """Admin cannot deactivate their own account"""
        response = requests.put(
            f"{BASE_URL}/api/admin/users/{ADMIN_EMAIL}",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={"active": False}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "own account" in data.get("detail", "").lower() or "deactivate" in data.get("detail", "").lower()
        print(f"✓ Admin correctly prevented from deactivating self")
    
    def test_admin_cannot_change_own_role(self, admin_token):
        """Admin cannot change their own role"""
        response = requests.put(
            f"{BASE_URL}/api/admin/users/{ADMIN_EMAIL}",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={"role": "editor"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "own role" in data.get("detail", "").lower() or "change" in data.get("detail", "").lower()
        print(f"✓ Admin correctly prevented from changing own role")
    
    def test_admin_cannot_delete_self(self, admin_token):
        """Admin cannot delete their own account"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/users/{ADMIN_EMAIL}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "own account" in data.get("detail", "").lower() or "delete" in data.get("detail", "").lower()
        print(f"✓ Admin correctly prevented from deleting self")
    
    def test_delete_user_success(self, admin_token):
        """Admin can delete another user"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/users/{TEST_USER_EMAIL}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Delete user failed: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"✓ User deleted: {TEST_USER_EMAIL}")
        
        # Verify deletion
        list_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = list_response.json()["users"]
        deleted_user = next((u for u in users if u["email"] == TEST_USER_EMAIL), None)
        assert deleted_user is None, "User should be deleted"
        print(f"✓ User deletion verified")


class TestEditorAccessControl:
    """Test editor role-based access control"""
    
    def test_editor_can_access_blogs(self, editor_token):
        """Editor CAN access GET /api/admin/blogs"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs",
            headers={"Authorization": f"Bearer {editor_token}"}
        )
        assert response.status_code == 200, f"Editor should access blogs: {response.text}"
        data = response.json()
        assert "posts" in data
        print(f"✓ Editor can access blogs ({len(data['posts'])} posts)")
    
    def test_editor_can_create_blog(self, editor_token):
        """Editor CAN access POST /api/admin/blogs"""
        test_slug = f"editor-test-{int(time.time())}"
        response = requests.post(
            f"{BASE_URL}/api/admin/blogs",
            headers={"Authorization": f"Bearer {editor_token}"},
            json={
                "title": "Editor Test Post",
                "slug": test_slug,
                "excerpt": "Test excerpt",
                "content_html": "<p>Test content</p>",
                "category": "Test",
                "tags": ["test"],
                "author": "Editor",
                "read_time": "1 min",
                "status": "draft"
            }
        )
        assert response.status_code == 200, f"Editor should create blogs: {response.text}"
        print(f"✓ Editor can create blog posts")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/blogs/{test_slug}",
            headers={"Authorization": f"Bearer {editor_token}"}
        )
    
    def test_editor_cannot_access_leads_403(self, editor_token):
        """Editor CANNOT access GET /api/admin/leads (403)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"Authorization": f"Bearer {editor_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print(f"✓ Editor correctly denied access to leads (403)")
    
    def test_editor_cannot_access_users_403(self, editor_token):
        """Editor CANNOT access GET /api/admin/users (403)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {editor_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print(f"✓ Editor correctly denied access to users (403)")
    
    def test_editor_cannot_access_settings_403(self, editor_token):
        """Editor CANNOT access GET /api/admin/settings (403)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {editor_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print(f"✓ Editor correctly denied access to settings (403)")
    
    def test_editor_cannot_access_analytics_403(self, editor_token):
        """Editor CANNOT access GET /api/leads/analytics (403)"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"Authorization": f"Bearer {editor_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print(f"✓ Editor correctly denied access to analytics (403)")


class TestDeactivatedUser:
    """Test deactivated user cannot login"""
    
    def test_deactivate_and_login_denied(self, admin_token):
        """Deactivated user cannot login (403)"""
        # Create a test user
        deactivate_email = f"deactivate_test_{int(time.time())}@credsure.io"
        deactivate_password = "DeactivateTest123!"
        
        # Create user
        create_response = requests.post(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": deactivate_email,
                "name": "Deactivate Test",
                "password": deactivate_password,
                "role": "editor"
            }
        )
        assert create_response.status_code == 200, f"Create user failed: {create_response.text}"
        
        # Verify user can login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": deactivate_email,
            "password": deactivate_password
        })
        assert login_response.status_code == 200, f"User should be able to login: {login_response.text}"
        print(f"✓ Active user can login")
        
        # Deactivate user
        deactivate_response = requests.put(
            f"{BASE_URL}/api/admin/users/{deactivate_email}",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={"active": False}
        )
        assert deactivate_response.status_code == 200, f"Deactivate failed: {deactivate_response.text}"
        print(f"✓ User deactivated")
        
        # Verify deactivated user cannot login
        denied_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": deactivate_email,
            "password": deactivate_password
        })
        assert denied_response.status_code == 403, f"Expected 403, got {denied_response.status_code}: {denied_response.text}"
        print(f"✓ Deactivated user correctly denied login (403)")
        
        # Cleanup - delete the test user
        requests.delete(
            f"{BASE_URL}/api/admin/users/{deactivate_email}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
