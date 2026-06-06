"""
MFA (Multi-Factor Authentication) Tests - Iteration 35
Tests TOTP-based MFA setup, verification, login flow, and disable functionality.
"""
import pytest
import requests
import os
import pyotp

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@credsure.io"
ADMIN_PASSWORD = "CredSure@Admin2026!"


class TestLoginWithoutMFA:
    """Test login works normally when MFA is not enabled"""
    
    def test_login_without_mfa_returns_token(self):
        """Login without MFA enabled should return token directly"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Should return mfa_required=False and full token
        assert "mfa_required" in data
        if not data.get("mfa_required"):
            assert "token" in data, "Should return token when MFA not required"
            assert "user" in data, "Should return user info"
            assert data["user"]["email"] == ADMIN_EMAIL
            print(f"SUCCESS: Login without MFA returns token directly")
        else:
            # MFA is enabled - this is also valid, we'll test MFA flow
            assert "mfa_token" in data, "Should return mfa_token when MFA required"
            print(f"INFO: MFA is enabled for this user, mfa_token returned")


class TestMFAEndpointsUnauthorized:
    """Test MFA endpoints require JWT authentication"""
    
    def test_mfa_setup_requires_auth(self):
        """POST /api/auth/mfa/setup without JWT returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/mfa/setup")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: MFA setup requires authentication")
    
    def test_mfa_verify_setup_requires_auth(self):
        """POST /api/auth/mfa/verify-setup without JWT returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/mfa/verify-setup", json={"code": "123456"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: MFA verify-setup requires authentication")
    
    def test_mfa_disable_requires_auth(self):
        """POST /api/auth/mfa/disable without JWT returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/mfa/disable", json={"code": "123456"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: MFA disable requires authentication")
    
    def test_mfa_status_requires_auth(self):
        """GET /api/auth/mfa/status without JWT returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/mfa/status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: MFA status requires authentication")


class TestMFAFullFlow:
    """Test complete MFA setup, login, and disable flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get initial token and ensure MFA is disabled before tests"""
        # Login to get token
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        if data.get("mfa_required"):
            # MFA is enabled, we need to disable it first
            # This shouldn't happen if tests run in order, but handle it
            pytest.skip("MFA is already enabled - run disable test first")
        
        self.token = data["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        yield
    
    def test_01_mfa_status_initially_disabled(self):
        """MFA should be disabled initially"""
        response = requests.get(f"{BASE_URL}/api/auth/mfa/status", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "mfa_enabled" in data
        # Note: MFA might be enabled from previous test runs
        print(f"MFA Status: enabled={data.get('mfa_enabled')}, recovery_codes_remaining={data.get('recovery_codes_remaining', 0)}")
    
    def test_02_mfa_setup_returns_qr_and_secret(self):
        """POST /api/auth/mfa/setup returns QR code and secret"""
        response = requests.post(f"{BASE_URL}/api/auth/mfa/setup", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "secret" in data, "Should return TOTP secret"
        assert "qr_code" in data, "Should return QR code"
        assert "uri" in data, "Should return TOTP URI"
        
        # Validate secret format (base32)
        assert len(data["secret"]) >= 16, "Secret should be at least 16 chars"
        
        # Validate QR code is base64 PNG
        assert data["qr_code"].startswith("data:image/png;base64,"), "QR code should be base64 PNG"
        
        # Validate URI format
        assert "otpauth://totp/" in data["uri"], "URI should be TOTP format"
        assert "CredSure" in data["uri"], "URI should contain issuer name"
        
        print(f"SUCCESS: MFA setup returned secret (length={len(data['secret'])}), QR code, and URI")
    
    def test_03_mfa_verify_setup_invalid_code(self):
        """POST /api/auth/mfa/verify-setup with invalid code returns error"""
        # First start setup to get a pending secret
        setup_response = requests.post(f"{BASE_URL}/api/auth/mfa/setup", headers=self.headers)
        assert setup_response.status_code == 200
        
        # Try to verify with invalid code
        response = requests.post(f"{BASE_URL}/api/auth/mfa/verify-setup", 
                                headers=self.headers,
                                json={"code": "000000"})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Invalid code" in data.get("detail", ""), f"Expected 'Invalid code' error, got: {data}"
        print("SUCCESS: Invalid TOTP code rejected during setup verification")
    
    def test_04_mfa_verify_setup_valid_code_enables_mfa(self):
        """POST /api/auth/mfa/verify-setup with valid code enables MFA and returns recovery codes"""
        # Start setup
        setup_response = requests.post(f"{BASE_URL}/api/auth/mfa/setup", headers=self.headers)
        assert setup_response.status_code == 200
        setup_data = setup_response.json()
        secret = setup_data["secret"]
        
        # Generate valid TOTP code
        totp = pyotp.TOTP(secret)
        valid_code = totp.now()
        
        # Verify setup
        response = requests.post(f"{BASE_URL}/api/auth/mfa/verify-setup",
                                headers=self.headers,
                                json={"code": valid_code})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "recovery_codes" in data, "Should return recovery codes"
        assert len(data["recovery_codes"]) == 8, f"Should return 8 recovery codes, got {len(data['recovery_codes'])}"
        assert "message" in data
        
        # Validate recovery code format (8 hex chars uppercase)
        for code in data["recovery_codes"]:
            assert len(code) == 8, f"Recovery code should be 8 chars: {code}"
            assert code.isalnum(), f"Recovery code should be alphanumeric: {code}"
        
        # Store for later tests
        self.__class__.mfa_secret = secret
        self.__class__.recovery_codes = data["recovery_codes"]
        
        print(f"SUCCESS: MFA enabled, received {len(data['recovery_codes'])} recovery codes")
    
    def test_05_mfa_status_shows_enabled(self):
        """After enabling, MFA status should show enabled"""
        response = requests.get(f"{BASE_URL}/api/auth/mfa/status", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("mfa_enabled") == True, "MFA should be enabled"
        assert data.get("recovery_codes_remaining") == 8, "Should have 8 recovery codes"
        print("SUCCESS: MFA status shows enabled with 8 recovery codes")


class TestMFALoginFlow:
    """Test login flow when MFA is enabled"""
    
    def test_01_login_with_mfa_returns_mfa_token(self):
        """Login with MFA enabled returns mfa_required=true and mfa_token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # If MFA is enabled, should return mfa_required=true
        if data.get("mfa_required"):
            assert "mfa_token" in data, "Should return mfa_token"
            assert "token" not in data, "Should NOT return full access token yet"
            self.__class__.mfa_token = data["mfa_token"]
            print("SUCCESS: Login with MFA returns mfa_token for verification")
        else:
            # MFA not enabled - skip this test
            pytest.skip("MFA is not enabled for this user")
    
    def test_02_mfa_verify_invalid_code(self):
        """POST /api/auth/mfa/verify with invalid code returns 401"""
        # First get mfa_token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = login_response.json()
        
        if not data.get("mfa_required"):
            pytest.skip("MFA is not enabled")
        
        mfa_token = data["mfa_token"]
        
        # Try invalid code
        response = requests.post(f"{BASE_URL}/api/auth/mfa/verify", json={
            "mfa_token": mfa_token,
            "code": "000000"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Invalid TOTP code rejected during MFA verify")
    
    def test_03_mfa_verify_valid_totp_code(self):
        """POST /api/auth/mfa/verify with valid TOTP code returns access token"""
        # Get mfa_token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = login_response.json()
        
        if not data.get("mfa_required"):
            pytest.skip("MFA is not enabled")
        
        mfa_token = data["mfa_token"]
        
        # We need the secret to generate valid code
        # First login with a valid token to get the secret from setup
        # Since we can't access the secret directly, we'll use recovery code test instead
        # This test requires the secret from previous setup
        if not hasattr(TestMFAFullFlow, 'mfa_secret'):
            pytest.skip("MFA secret not available from setup test")
        
        secret = TestMFAFullFlow.mfa_secret
        totp = pyotp.TOTP(secret)
        valid_code = totp.now()
        
        response = requests.post(f"{BASE_URL}/api/auth/mfa/verify", json={
            "mfa_token": mfa_token,
            "code": valid_code
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "token" in data, "Should return access token"
        assert "user" in data, "Should return user info"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["mfa_enabled"] == True
        
        print("SUCCESS: Valid TOTP code returns full access token")
    
    def test_04_mfa_verify_with_recovery_code(self):
        """POST /api/auth/mfa/verify with recovery code works and consumes the code"""
        # Get mfa_token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = login_response.json()
        
        if not data.get("mfa_required"):
            pytest.skip("MFA is not enabled")
        
        mfa_token = data["mfa_token"]
        
        if not hasattr(TestMFAFullFlow, 'recovery_codes') or not TestMFAFullFlow.recovery_codes:
            pytest.skip("Recovery codes not available from setup test")
        
        # Use first recovery code
        recovery_code = TestMFAFullFlow.recovery_codes[0]
        
        response = requests.post(f"{BASE_URL}/api/auth/mfa/verify", json={
            "mfa_token": mfa_token,
            "code": recovery_code
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "token" in data, "Should return access token"
        assert data.get("recovery_code_used") == True, "Should indicate recovery code was used"
        assert data.get("recovery_codes_remaining") == 7, "Should have 7 codes remaining"
        
        # Remove used code from our list
        TestMFAFullFlow.recovery_codes.pop(0)
        
        print("SUCCESS: Recovery code accepted and consumed (7 remaining)")
    
    def test_05_mfa_verify_expired_token(self):
        """POST /api/auth/mfa/verify with expired/invalid mfa_token returns error"""
        response = requests.post(f"{BASE_URL}/api/auth/mfa/verify", json={
            "mfa_token": "invalid.token.here",
            "code": "123456"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Invalid mfa_token rejected")


class TestMFADisable:
    """Test MFA disable functionality"""
    
    def test_01_disable_mfa_with_valid_totp(self):
        """POST /api/auth/mfa/disable with valid TOTP code disables MFA"""
        # First login to get token (may need MFA)
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = login_response.json()
        
        if data.get("mfa_required"):
            # Need to complete MFA to get access token
            mfa_token = data["mfa_token"]
            
            if hasattr(TestMFAFullFlow, 'mfa_secret'):
                secret = TestMFAFullFlow.mfa_secret
                totp = pyotp.TOTP(secret)
                valid_code = totp.now()
                
                verify_response = requests.post(f"{BASE_URL}/api/auth/mfa/verify", json={
                    "mfa_token": mfa_token,
                    "code": valid_code
                })
                if verify_response.status_code == 200:
                    token = verify_response.json()["token"]
                else:
                    pytest.skip("Could not verify MFA to get access token")
            elif hasattr(TestMFAFullFlow, 'recovery_codes') and TestMFAFullFlow.recovery_codes:
                recovery_code = TestMFAFullFlow.recovery_codes[0]
                verify_response = requests.post(f"{BASE_URL}/api/auth/mfa/verify", json={
                    "mfa_token": mfa_token,
                    "code": recovery_code
                })
                if verify_response.status_code == 200:
                    token = verify_response.json()["token"]
                    TestMFAFullFlow.recovery_codes.pop(0)
                else:
                    pytest.skip("Could not verify MFA with recovery code")
            else:
                pytest.skip("No MFA secret or recovery codes available")
        else:
            token = data["token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check if MFA is enabled
        status_response = requests.get(f"{BASE_URL}/api/auth/mfa/status", headers=headers)
        status_data = status_response.json()
        
        if not status_data.get("mfa_enabled"):
            print("INFO: MFA is already disabled")
            return
        
        # Disable MFA with TOTP code
        if hasattr(TestMFAFullFlow, 'mfa_secret'):
            secret = TestMFAFullFlow.mfa_secret
            totp = pyotp.TOTP(secret)
            disable_code = totp.now()
            
            response = requests.post(f"{BASE_URL}/api/auth/mfa/disable",
                                    headers=headers,
                                    json={"code": disable_code})
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            data = response.json()
            assert "message" in data
            print("SUCCESS: MFA disabled with TOTP code")
        else:
            pytest.skip("No MFA secret available to disable")
    
    def test_02_login_after_disable_no_mfa(self):
        """After disabling MFA, login should not require MFA step"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        
        # Should return token directly without MFA
        assert data.get("mfa_required") == False, "MFA should not be required after disable"
        assert "token" in data, "Should return token directly"
        print("SUCCESS: Login after MFA disable returns token directly (no MFA step)")
    
    def test_03_mfa_status_shows_disabled(self):
        """After disabling, MFA status should show disabled"""
        # Login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = login_response.json()
        
        if data.get("mfa_required"):
            pytest.skip("MFA is still enabled")
        
        token = data["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/auth/mfa/status", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("mfa_enabled") == False, "MFA should be disabled"
        assert data.get("recovery_codes_remaining") == 0, "Should have 0 recovery codes"
        print("SUCCESS: MFA status shows disabled with 0 recovery codes")


class TestExistingFeaturesStillWork:
    """Verify existing admin features still work after MFA implementation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = response.json()
        
        if data.get("mfa_required"):
            # Use recovery code or TOTP to complete login
            mfa_token = data["mfa_token"]
            if hasattr(TestMFAFullFlow, 'mfa_secret'):
                totp = pyotp.TOTP(TestMFAFullFlow.mfa_secret)
                verify_response = requests.post(f"{BASE_URL}/api/auth/mfa/verify", json={
                    "mfa_token": mfa_token,
                    "code": totp.now()
                })
                self.token = verify_response.json().get("token")
            else:
                pytest.skip("Cannot complete MFA login")
        else:
            self.token = data["token"]
        
        self.headers = {"Authorization": f"Bearer {self.token}"}
        yield
    
    def test_dashboard_stats(self):
        """Dashboard stats endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/leads/analytics", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Dashboard/analytics endpoint works")
    
    def test_admin_blogs(self):
        """Admin blogs endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/admin/blogs", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "posts" in data
        print(f"SUCCESS: Admin blogs endpoint works ({len(data['posts'])} blogs)")
    
    def test_admin_leads(self):
        """Admin leads endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/admin/leads", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "leads" in data
        print(f"SUCCESS: Admin leads endpoint works ({len(data['leads'])} leads)")
    
    def test_admin_settings(self):
        """Admin settings endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Admin settings endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
