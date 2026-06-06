"""
Test suite for iteration 6 - Testing social links, i18n, legal pages
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bilingual-lead-gen.preview.emergentagent.com')

class TestLeadsAPI:
    """Test leads API endpoint"""
    
    def test_leads_post_valid(self):
        """Test POST /api/leads with valid data"""
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "name": "TEST_User",
                "email": "test@example.com",
                "company": "Test Corp",
                "role": "Developer",
                "interests": ["education"]
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        data = response.json()
        assert "name" in data
        assert data["name"] == "TEST_User"
        print(f"✅ POST /api/leads returned {response.status_code}")
    
    def test_leads_post_invalid_email(self):
        """Test POST /api/leads with invalid email"""
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "name": "TEST_User",
                "email": "invalid-email",
                "company": "Test Corp",
                "role": "Developer",
                "interests": []
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print(f"✅ POST /api/leads with invalid email returned {response.status_code}")


class TestStatusAPI:
    """Test status API endpoint"""
    
    def test_status_endpoint(self):
        """Test GET /api/status"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ GET /api/status returned {response.status_code}")


class TestHealthAPI:
    """Test health check endpoint"""
    
    def test_health_endpoint(self):
        """Test GET /api/status as health check (internal /health not exposed)"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ GET /api/status (health check) returned {response.status_code}")


class TestFrontendPages:
    """Test frontend pages load correctly"""
    
    def test_homepage_loads(self):
        """Test homepage loads"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "CredSure" in response.text or "credsure" in response.text.lower()
        print(f"✅ Homepage loaded successfully")
    
    def test_impressum_page_loads(self):
        """Test /impressum page loads"""
        response = requests.get(f"{BASE_URL}/impressum")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ /impressum page loaded successfully")
    
    def test_privacy_page_loads(self):
        """Test /privacy page loads"""
        response = requests.get(f"{BASE_URL}/privacy")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ /privacy page loaded successfully")
    
    def test_terms_page_loads(self):
        """Test /terms page loads"""
        response = requests.get(f"{BASE_URL}/terms")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ /terms page loaded successfully")
    
    def test_demo_page_loads(self):
        """Test /demo page loads"""
        response = requests.get(f"{BASE_URL}/demo")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✅ /demo page loaded successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
