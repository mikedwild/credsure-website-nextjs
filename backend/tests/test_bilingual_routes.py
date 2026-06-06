"""
Backend API tests for bilingual lead-gen website.
Tests: Lead API, Status API, and sitemap verification.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bilingual-lead-gen.preview.emergentagent.com').rstrip('/')

class TestStatusAPI:
    """Status endpoint tests"""
    
    def test_status_endpoint(self):
        """Test /api/status returns empty list or valid response"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        print(f"✅ Status endpoint returned: {response.json()}")


class TestLeadsAPI:
    """Lead capture API tests"""
    
    def test_create_lead_success(self):
        """Test POST /api/leads with valid data"""
        payload = {
            "name": "TEST_User",
            "email": "test_bilingual@example.com",
            "company": "Test Company",
            "phone": "+1234567890",
            "message": "Test message from bilingual test"
        }
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["company"] == payload["company"]
        assert "timestamp" in data
        assert data["status"] == "new"
        print(f"✅ Lead created successfully: {data['email']}")
    
    def test_create_lead_minimal(self):
        """Test POST /api/leads with minimal required fields"""
        payload = {
            "name": "TEST_Minimal",
            "email": "minimal@example.com",
            "company": "Minimal Corp"
        }
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == payload["email"]
        print(f"✅ Minimal lead created: {data['email']}")
    
    def test_create_lead_missing_email(self):
        """Test POST /api/leads fails without email"""
        payload = {
            "name": "No Email User",
            "company": "Test Corp"
        }
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Should fail validation
        assert response.status_code == 422
        print("✅ Lead creation correctly rejected without email")


class TestSitemap:
    """Sitemap.xml verification tests"""
    
    def test_sitemap_exists(self):
        """Test sitemap.xml is accessible"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        assert "xml" in response.headers.get("content-type", "").lower() or "text" in response.headers.get("content-type", "").lower()
        print("✅ Sitemap.xml is accessible")
    
    def test_sitemap_has_hreflang(self):
        """Test sitemap contains hreflang alternates"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        content = response.text
        assert 'hreflang="en"' in content
        assert 'hreflang="de"' in content
        assert 'hreflang="x-default"' in content
        print("✅ Sitemap contains hreflang alternates")
    
    def test_sitemap_url_count(self):
        """Test sitemap has expected number of URLs (104 = 52 per language)"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        content = response.text
        url_count = content.count("<url>")
        assert url_count >= 100, f"Expected ~104 URLs, got {url_count}"
        print(f"✅ Sitemap has {url_count} URLs")
    
    def test_sitemap_has_translated_slugs(self):
        """Test sitemap contains both EN and DE translated slugs"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        content = response.text
        
        # Check for EN slugs
        assert "/en/pricing" in content
        assert "/en/features" in content
        assert "/en/solutions" in content
        
        # Check for DE translated slugs
        assert "/de/preise" in content
        assert "/de/funktionen" in content
        assert "/de/loesungen" in content
        
        print("✅ Sitemap contains both EN and DE translated slugs")


class TestFrontendRoutes:
    """Frontend route accessibility tests"""
    
    def test_root_loads(self):
        """Test root URL loads (client-side redirect to /en or /de happens via React Router)"""
        response = requests.get(f"{BASE_URL}/", allow_redirects=True)
        assert response.status_code == 200
        # Root URL loads the React app which handles redirect client-side
        print(f"✅ Root URL loads successfully (client-side redirect to /en or /de)")
    
    def test_en_homepage(self):
        """Test /en homepage loads"""
        response = requests.get(f"{BASE_URL}/en")
        assert response.status_code == 200
        assert "CredSure" in response.text or "Credential" in response.text
        print("✅ EN homepage loads correctly")
    
    def test_de_homepage(self):
        """Test /de homepage loads"""
        response = requests.get(f"{BASE_URL}/de")
        assert response.status_code == 200
        print("✅ DE homepage loads correctly")
    
    def test_en_pricing_page(self):
        """Test /en/pricing page loads"""
        response = requests.get(f"{BASE_URL}/en/pricing")
        assert response.status_code == 200
        print("✅ EN pricing page loads")
    
    def test_de_preise_page(self):
        """Test /de/preise page loads"""
        response = requests.get(f"{BASE_URL}/de/preise")
        assert response.status_code == 200
        print("✅ DE preise page loads")
    
    def test_en_solutions_corporate_training(self):
        """Test /en/solutions/corporate-training page loads"""
        response = requests.get(f"{BASE_URL}/en/solutions/corporate-training")
        assert response.status_code == 200
        print("✅ EN corporate training page loads")
    
    def test_de_loesungen_unternehmensschulungen(self):
        """Test /de/loesungen/unternehmensschulungen page loads"""
        response = requests.get(f"{BASE_URL}/de/loesungen/unternehmensschulungen")
        assert response.status_code == 200
        print("✅ DE unternehmensschulungen page loads")
    
    def test_en_features_credential_management(self):
        """Test /en/features/credential-management page loads"""
        response = requests.get(f"{BASE_URL}/en/features/credential-management")
        assert response.status_code == 200
        print("✅ EN credential management page loads")
    
    def test_de_funktionen_zertifikatsverwaltung(self):
        """Test /de/funktionen/zertifikatsverwaltung page loads"""
        response = requests.get(f"{BASE_URL}/de/funktionen/zertifikatsverwaltung")
        assert response.status_code == 200
        print("✅ DE zertifikatsverwaltung page loads")
    
    def test_en_blog_page(self):
        """Test /en/blog page loads"""
        response = requests.get(f"{BASE_URL}/en/blog")
        assert response.status_code == 200
        print("✅ EN blog page loads")
    
    def test_en_demo_page(self):
        """Test /en/demo page loads"""
        response = requests.get(f"{BASE_URL}/en/demo")
        assert response.status_code == 200
        print("✅ EN demo page loads")
    
    def test_de_demo_page(self):
        """Test /de/demo page loads"""
        response = requests.get(f"{BASE_URL}/de/demo")
        assert response.status_code == 200
        print("✅ DE demo page loads")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
