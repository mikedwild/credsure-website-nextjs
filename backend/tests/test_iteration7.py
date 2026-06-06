"""
Backend API Tests for Iteration 7
Testing: /api/leads POST endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bilingual-lead-gen.preview.emergentagent.com')

class TestLeadsAPI:
    """Tests for /api/leads endpoint"""
    
    def test_leads_post_valid_data(self):
        """Test POST /api/leads with valid data returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "name": "Test User",
                "email": "test_iter7@example.com",
                "company": "Test Company",
                "role": "Developer"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == "Test User"
        assert data["email"] == "test_iter7@example.com"
        assert data["company"] == "Test Company"
        assert "timestamp" in data
        assert data["status"] == "new"
    
    def test_leads_post_invalid_email(self):
        """Test POST /api/leads with invalid email returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "name": "Test User",
                "email": "invalid-email",
                "company": "Test Company"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    
    def test_leads_post_missing_required_fields(self):
        """Test POST /api/leads with missing required fields returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "company": "Test Company"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    
    def test_leads_post_minimal_data(self):
        """Test POST /api/leads with minimal required data"""
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json={
                "name": "Minimal User",
                "email": "minimal_iter7@example.com"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == "Minimal User"
        assert data["email"] == "minimal_iter7@example.com"


class TestHealthEndpoint:
    """Tests for health check endpoint"""
    
    def test_api_status(self):
        """Test /api/status endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/status")
        
        assert response.status_code == 200
        # Status endpoint returns list of leads or empty array
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
