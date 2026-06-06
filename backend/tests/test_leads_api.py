"""
Backend API Tests for CredSure Lead Capture
Tests the /api/leads endpoint for lead capture functionality
"""
import pytest
import requests
import os
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://bilingual-lead-gen.preview.emergentagent.com"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check_internal(self):
        """Test health endpoint on internal port"""
        response = requests.get("http://localhost:8001/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "CredSure API"
        print("✅ Health check passed")


class TestStatusEndpoint:
    """Status endpoint tests"""
    
    def test_status_endpoint(self):
        """Test /api/status endpoint"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        # Status returns an array
        data = response.json()
        assert isinstance(data, list)
        print("✅ Status endpoint passed")


class TestLeadsAPI:
    """Lead capture API tests"""
    
    def test_create_lead_success(self):
        """Test creating a new lead with valid data"""
        lead_data = {
            "name": "TEST_John Doe",
            "email": f"TEST_john_{datetime.now().timestamp()}@example.com",
            "company": "TEST_Acme Corp",
            "role": "Manager",
            "message": "Interested in demo",
            "interests": ["Demo Request"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response data
        assert data["name"] == lead_data["name"]
        assert data["email"] == lead_data["email"]
        assert data["company"] == lead_data["company"]
        assert "timestamp" in data
        assert data["status"] == "new"
        print(f"✅ Lead created successfully: {data['email']}")
    
    def test_create_lead_minimal_data(self):
        """Test creating a lead with minimal required data"""
        lead_data = {
            "name": "TEST_Minimal User",
            "email": f"TEST_minimal_{datetime.now().timestamp()}@example.com",
            "company": "TEST_Minimal Corp"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == lead_data["name"]
        assert data["source"] == "website"  # Default source
        print("✅ Minimal lead created successfully")
    
    def test_create_lead_with_all_fields(self):
        """Test creating a lead with all optional fields"""
        lead_data = {
            "name": "TEST_Full User",
            "email": f"TEST_full_{datetime.now().timestamp()}@example.com",
            "company": "TEST_Full Corp",
            "phone": "+1-555-123-4567",
            "role": "Director",
            "message": "Full demo request with all fields",
            "interests": ["Demo Request", "Pricing", "Enterprise"],
            "source": "landing_page"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == lead_data["phone"]
        assert data["message"] == lead_data["message"]
        print("✅ Full lead created successfully")
    
    def test_get_leads_requires_api_key(self):
        """Test that GET /api/leads requires API key"""
        response = requests.get(f"{BASE_URL}/api/leads")
        
        assert response.status_code == 401
        data = response.json()
        assert "Invalid API key" in data.get("detail", "")
        print("✅ API key validation working correctly")
    
    def test_get_leads_with_invalid_api_key(self):
        """Test GET /api/leads with invalid API key"""
        response = requests.get(
            f"{BASE_URL}/api/leads",
            headers={"X-API-Key": "invalid-key-12345"}
        )
        
        assert response.status_code == 401
        print("✅ Invalid API key rejected correctly")
    
    def test_get_leads_with_valid_api_key(self):
        """Test GET /api/leads with valid API key (dev key)"""
        response = requests.get(
            f"{BASE_URL}/api/leads",
            headers={"X-API-Key": "dev-admin-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Retrieved {len(data)} leads with valid API key")


class TestLeadsValidation:
    """Lead validation tests"""
    
    def test_create_lead_missing_name(self):
        """Test creating a lead without name fails"""
        lead_data = {
            "email": "test@example.com",
            "company": "Test Corp"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        # Should fail validation
        assert response.status_code == 422
        print("✅ Missing name validation working")
    
    def test_create_lead_missing_email(self):
        """Test creating a lead without email fails"""
        lead_data = {
            "name": "Test User",
            "company": "Test Corp"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        # Should fail validation
        assert response.status_code == 422
        print("✅ Missing email validation working")
    
    def test_create_lead_invalid_email(self):
        """Test creating a lead with invalid email format"""
        lead_data = {
            "name": "Test User",
            "email": "not-an-email",
            "company": "Test Corp"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        # Should fail email validation
        assert response.status_code == 422
        print("✅ Invalid email validation working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
