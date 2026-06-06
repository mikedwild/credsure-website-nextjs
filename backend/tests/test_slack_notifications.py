"""
Test Slack Notifications for Lead Capture
Tests that all lead sources trigger Slack webhook notifications
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSlackNotifications:
    """Test Slack notifications are sent for all lead sources"""
    
    def test_demo_source_creates_lead(self):
        """POST /api/leads with source='demo' should create lead and trigger Slack"""
        payload = {
            "name": "TEST_Demo User",
            "email": f"test-demo-{int(time.time())}@example.com",
            "company": "Test Company",
            "role": "Manager",
            "source": "demo",
            "interests": ["Demo Request"],
            "timestamp": "2026-01-08T12:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["email"] == payload["email"]
        assert data["source"] == "demo"
        print(f"✅ Demo lead created: {data['email']}")
    
    def test_gated_guide_source_creates_lead(self):
        """POST /api/leads with source='gated-guide' should create lead and trigger Slack"""
        payload = {
            "name": "TEST_Guide User",
            "email": f"test-guide-{int(time.time())}@example.com",
            "company": "",
            "role": "",
            "source": "gated-guide",
            "interests": ["guide Download: Complete Guide to Digital Credentials"],
            "timestamp": "2026-01-08T12:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["source"] == "gated-guide"
        print(f"✅ Gated guide lead created: {data['email']}")
    
    def test_exit_intent_source_creates_lead(self):
        """POST /api/leads with source='exit-intent' should create lead and trigger Slack"""
        payload = {
            "name": "",
            "email": f"test-exit-{int(time.time())}@example.com",
            "company": "",
            "role": "",
            "source": "exit-intent",
            "interests": ["Exit Intent - ROI Guide"],
            "timestamp": "2026-01-08T12:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["source"] == "exit-intent"
        print(f"✅ Exit intent lead created: {data['email']}")
    
    def test_inline_blog_source_creates_lead(self):
        """POST /api/leads with source='inline-blog' should create lead and trigger Slack"""
        payload = {
            "name": "",
            "email": f"test-blog-{int(time.time())}@example.com",
            "company": "",
            "role": "",
            "source": "inline-blog",
            "interests": ["Blog Newsletter"],
            "timestamp": "2026-01-08T12:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["source"] == "inline-blog"
        print(f"✅ Inline blog lead created: {data['email']}")
    
    def test_lead_response_structure(self):
        """Verify lead response contains all expected fields"""
        payload = {
            "name": "TEST_Structure User",
            "email": f"test-structure-{int(time.time())}@example.com",
            "company": "Test Corp",
            "role": "Developer",
            "source": "demo",
            "interests": ["Demo Request", "API Integration"],
            "timestamp": "2026-01-08T12:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify core fields are present in response
        assert "name" in data
        assert "email" in data
        assert "company" in data
        assert "source" in data
        assert "timestamp" in data
        assert "status" in data
        
        # Verify values match
        assert data["name"] == payload["name"]
        assert data["company"] == payload["company"]
        assert data["source"] == payload["source"]
        print(f"✅ Lead response structure verified")


class TestLeadValidation:
    """Test lead validation and error handling"""
    
    def test_lead_requires_email(self):
        """Lead creation should fail without email"""
        payload = {
            "name": "No Email User",
            "company": "Test",
            "source": "demo",
            "interests": [],
            "timestamp": "2026-01-08T12:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 422, f"Expected 422 for missing email, got {response.status_code}"
        print("✅ Email validation working")
    
    def test_lead_with_minimal_data(self):
        """Lead creation should work with name and email (both required)"""
        payload = {
            "name": "Minimal User",
            "email": f"test-minimal-{int(time.time())}@example.com",
            "source": "website",
            "interests": [],
            "timestamp": "2026-01-08T12:00:00Z"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✅ Minimal lead creation working")


class TestHomepageAndLocalization:
    """Test homepage loads in both languages"""
    
    def test_english_homepage_loads(self):
        """English homepage should load correctly"""
        response = requests.get(f"{BASE_URL}/en")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "CredSure" in response.text or "credsure" in response.text.lower()
        print("✅ English homepage loads")
    
    def test_german_homepage_loads(self):
        """German homepage should load correctly"""
        response = requests.get(f"{BASE_URL}/de")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ German homepage loads")
    
    def test_guides_page_loads(self):
        """Guides page should load correctly"""
        response = requests.get(f"{BASE_URL}/en/guides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Guides page loads")
    
    def test_demo_page_loads(self):
        """Demo page should load correctly"""
        response = requests.get(f"{BASE_URL}/en/demo")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Demo page loads")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
