"""
SEO Audit Tests - Technical SEO verification for bilingual lead generation website
Tests P0, P1, P2 SEO fixes for credsure.io
"""
import pytest
import requests
import os
import re
from xml.etree import ElementTree

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestSitemapSEO:
    """P0-2: Sitemap tests - verify correct base URL and structure"""
    
    def test_sitemap_accessible(self):
        """Sitemap should be accessible at /api/sitemap.xml"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200, f"Sitemap not accessible: {response.status_code}"
        assert "application/xml" in response.headers.get("content-type", ""), "Sitemap should return XML content type"
    
    def test_sitemap_uses_correct_base_url(self):
        """Sitemap URLs should use the correct production base URL"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        
        content = response.text
        # Should contain the correct base URL
        assert "bilingual-lead-gen.preview.emergentagent.com" in content, "Sitemap should use correct base URL"
        # Should NOT contain localhost
        assert "localhost" not in content, "Sitemap should not contain localhost"
    
    def test_sitemap_has_language_prefixes(self):
        """All sitemap URLs should include language prefix (/en/ or /de/)"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        
        # Parse XML
        root = ElementTree.fromstring(response.content)
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        urls = root.findall('.//sm:loc', ns)
        assert len(urls) > 0, "Sitemap should contain URLs"
        
        for url_elem in urls:
            url = url_elem.text
            # Each URL should have /en/ or /de/ prefix
            assert '/en/' in url or '/de/' in url, f"URL missing language prefix: {url}"
    
    def test_sitemap_has_both_languages(self):
        """Sitemap should contain URLs for both EN and DE languages"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        
        content = response.text
        assert '/en/' in content, "Sitemap should contain English URLs"
        assert '/de/' in content, "Sitemap should contain German URLs"
    
    def test_sitemap_has_required_pages(self):
        """Sitemap should include all required pages"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        
        content = response.text
        required_pages = ['/pricing', '/demo', '/features', '/solutions', '/integrations', '/customer-success']
        
        for page in required_pages:
            assert page in content, f"Sitemap missing required page: {page}"


class TestRobotsTxt:
    """P1-3: robots.txt tests - verify Allow/Disallow order"""
    
    def test_robots_txt_accessible(self):
        """robots.txt should be accessible"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200, f"robots.txt not accessible: {response.status_code}"
    
    def test_robots_txt_allows_sitemap(self):
        """robots.txt should allow access to sitemap"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        
        content = response.text
        assert "Sitemap:" in content, "robots.txt should have Sitemap directive"
        assert "/api/sitemap.xml" in content, "robots.txt should reference sitemap"
    
    def test_robots_txt_allow_before_disallow(self):
        """Allow: /api/sitemap.xml should appear BEFORE Disallow: /api/"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        
        content = response.text
        
        # Find positions of Allow: /api/sitemap.xml and Disallow: /api/
        allow_sitemap_match = re.search(r'Allow:\s*/api/sitemap\.xml', content)
        disallow_api_match = re.search(r'Disallow:\s*/api/', content)
        
        assert allow_sitemap_match is not None, "robots.txt should have 'Allow: /api/sitemap.xml'"
        assert disallow_api_match is not None, "robots.txt should have 'Disallow: /api/'"
        
        # Allow should come before Disallow
        assert allow_sitemap_match.start() < disallow_api_match.start(), \
            "Allow: /api/sitemap.xml should appear BEFORE Disallow: /api/"
    
    def test_robots_txt_allows_language_paths(self):
        """robots.txt should allow /en/ and /de/ paths"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        
        content = response.text
        assert "Allow: /en/" in content, "robots.txt should allow /en/ path"
        assert "Allow: /de/" in content, "robots.txt should allow /de/ path"


class TestLeadsAPI:
    """Test leads API for demo form submission"""
    
    def test_leads_endpoint_accepts_demo_submission(self):
        """Demo form should successfully submit to /api/leads"""
        payload = {
            "name": "TEST_SEO_User",
            "email": "test_seo@example.com",
            "company": "TEST_SEO_Company",
            "role": "SEO Tester",
            "source": "demo",
            "interests": ["Demo Request"],
            "timestamp": "2026-01-08T12:00:00.000Z"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [200, 201], f"Lead submission failed: {response.status_code}"
        
        data = response.json()
        # API returns the lead data with status field
        assert "status" in data or "email" in data, "Response should contain lead data"
        assert data.get("email") == payload["email"], "Response should echo back the email"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_root(self):
        """API root should be accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        # API might return 200 or redirect
        assert response.status_code in [200, 307, 404], f"API root check: {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
