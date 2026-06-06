"""
Backend API Tests for Lead Generation Features
Tests the /api/leads endpoint with different source values:
- exit-intent
- inline-blog
- gated-guide
"""
import pytest
import requests
import os
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://bilingual-lead-gen.preview.emergentagent.com"


class TestLeadSourcesAPI:
    """Test lead capture with different source values for lead generation features"""
    
    def test_create_lead_exit_intent_source(self):
        """Test creating a lead with source='exit-intent' (Exit Intent Popup)"""
        lead_data = {
            "name": "",
            "email": f"TEST_exit_intent_{datetime.now().timestamp()}@example.com",
            "company": "",
            "role": "",
            "source": "exit-intent",
            "interests": ["ROI Guide Download"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify source is correctly stored
        assert data["source"] == "exit-intent", f"Expected source='exit-intent', got '{data['source']}'"
        assert data["email"] == lead_data["email"]
        print(f"✅ Exit-intent lead created successfully: {data['email']}")
    
    def test_create_lead_inline_blog_source(self):
        """Test creating a lead with source='inline-blog' (Inline Blog CTA)"""
        lead_data = {
            "name": "",
            "email": f"TEST_inline_blog_{datetime.now().timestamp()}@example.com",
            "company": "",
            "role": "",
            "source": "inline-blog",
            "interests": ["Blog Newsletter"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify source is correctly stored
        assert data["source"] == "inline-blog", f"Expected source='inline-blog', got '{data['source']}'"
        assert data["email"] == lead_data["email"]
        print(f"✅ Inline-blog lead created successfully: {data['email']}")
    
    def test_create_lead_gated_guide_source(self):
        """Test creating a lead with source='gated-guide' (Gated Content Modal)"""
        lead_data = {
            "name": "TEST_Gated User",
            "email": f"TEST_gated_guide_{datetime.now().timestamp()}@example.com",
            "company": "",
            "role": "",
            "source": "gated-guide",
            "interests": ["guide Download: The Complete Guide to Digital Credentials"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify source is correctly stored
        assert data["source"] == "gated-guide", f"Expected source='gated-guide', got '{data['source']}'"
        assert data["name"] == lead_data["name"]
        assert data["email"] == lead_data["email"]
        print(f"✅ Gated-guide lead created successfully: {data['email']}")
    
    def test_create_lead_gated_webinar_source(self):
        """Test creating a lead with source='gated-webinar' (Gated Content Modal for webinars)"""
        lead_data = {
            "name": "TEST_Webinar User",
            "email": f"TEST_gated_webinar_{datetime.now().timestamp()}@example.com",
            "company": "",
            "role": "",
            "source": "gated-webinar",
            "interests": ["webinar Download: Digital Credentials Webinar"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify source is correctly stored
        assert data["source"] == "gated-webinar", f"Expected source='gated-webinar', got '{data['source']}'"
        print(f"✅ Gated-webinar lead created successfully: {data['email']}")
    
    def test_create_lead_default_source(self):
        """Test that default source is 'website' when not specified"""
        lead_data = {
            "name": "TEST_Default Source User",
            "email": f"TEST_default_{datetime.now().timestamp()}@example.com",
            "company": "TEST_Corp"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify default source
        assert data["source"] == "website", f"Expected default source='website', got '{data['source']}'"
        print(f"✅ Default source 'website' verified: {data['email']}")
    
    def test_verify_leads_stored_with_sources(self):
        """Verify leads with different sources are stored in database"""
        response = requests.get(
            f"{BASE_URL}/api/leads",
            headers={"X-API-Key": "dev-admin-key"}
        )
        
        assert response.status_code == 200
        leads = response.json()
        
        # Check that we have leads with different sources
        sources_found = set()
        for lead in leads:
            if lead.get('email', '').startswith('TEST_'):
                source = lead.get('source', 'unknown')
                sources_found.add(source)
        
        print(f"✅ Found leads with sources: {sources_found}")
        # We should have at least some of our test sources
        assert len(sources_found) > 0, "No test leads found in database"


class TestLeadSourceValidation:
    """Test lead source field validation"""
    
    def test_source_field_accepts_any_string(self):
        """Test that source field accepts any string value"""
        lead_data = {
            "name": "TEST_Custom Source",
            "email": f"TEST_custom_{datetime.now().timestamp()}@example.com",
            "company": "",
            "source": "custom-landing-page-v2"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "custom-landing-page-v2"
        print("✅ Custom source value accepted")
    
    def test_empty_name_allowed_for_exit_intent(self):
        """Test that empty name is allowed (exit-intent popup only collects email)"""
        lead_data = {
            "name": "",
            "email": f"TEST_empty_name_{datetime.now().timestamp()}@example.com",
            "company": "",
            "source": "exit-intent"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == ""
        print("✅ Empty name allowed for exit-intent leads")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
