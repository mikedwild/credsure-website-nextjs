"""
Iteration 36: Test Translation API and SEO Panel Features
Tests:
- POST /api/admin/translate endpoint (EN→DE and DE→EN)
- JWT authentication requirement
- Translation of title, excerpt, content_html, tags
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@credsure.io"
ADMIN_PASSWORD = "CredSure@Admin2026!"


class TestTranslateAPI:
    """Translation endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # Handle MFA if enabled
        if data.get("mfa_required"):
            pytest.skip("MFA is enabled - skipping translation tests")
        return data.get("token")
    
    def test_translate_requires_auth(self):
        """Translation endpoint requires JWT authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/translate",
            json={
                "title": "Test Title",
                "source_lang": "en",
                "target_lang": "de"
            }
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Translation endpoint requires authentication")
    
    def test_translate_en_to_de_title(self, auth_token):
        """Translate English title to German"""
        response = requests.post(
            f"{BASE_URL}/api/admin/translate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Digital Credentials for Modern Businesses",
                "excerpt": "",
                "content_html": "",
                "tags": "",
                "source_lang": "en",
                "target_lang": "de"
            },
            timeout=30  # LLM calls can take time
        )
        assert response.status_code == 200, f"Translation failed: {response.text}"
        data = response.json()
        assert "title" in data, "Response should contain translated title"
        assert len(data["title"]) > 0, "Translated title should not be empty"
        print(f"✓ EN→DE title translation: '{data['title']}'")
    
    def test_translate_en_to_de_full(self, auth_token):
        """Translate full content from English to German"""
        response = requests.post(
            f"{BASE_URL}/api/admin/translate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Why Digital Credentials Matter",
                "excerpt": "Learn about the importance of digital credentials in today's business world.",
                "content_html": "<p>Digital credentials are transforming how businesses verify skills and achievements.</p>",
                "tags": "credentials, digital, business",
                "source_lang": "en",
                "target_lang": "de"
            },
            timeout=60  # Multiple LLM calls
        )
        assert response.status_code == 200, f"Translation failed: {response.text}"
        data = response.json()
        
        # Verify all fields are translated
        assert "title" in data, "Response should contain translated title"
        assert "excerpt" in data, "Response should contain translated excerpt"
        assert "content_html" in data, "Response should contain translated content"
        assert "tags" in data, "Response should contain translated tags"
        
        # Verify translations are not empty
        assert len(data["title"]) > 0, "Translated title should not be empty"
        assert len(data["excerpt"]) > 0, "Translated excerpt should not be empty"
        assert len(data["content_html"]) > 0, "Translated content should not be empty"
        assert len(data["tags"]) > 0, "Translated tags should not be empty"
        
        print(f"✓ EN→DE full translation:")
        print(f"  Title: {data['title']}")
        print(f"  Excerpt: {data['excerpt'][:50]}...")
        print(f"  Tags: {data['tags']}")
    
    def test_translate_de_to_en_title(self, auth_token):
        """Translate German title to English"""
        response = requests.post(
            f"{BASE_URL}/api/admin/translate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Digitale Zertifikate für moderne Unternehmen",
                "excerpt": "",
                "content_html": "",
                "tags": "",
                "source_lang": "de",
                "target_lang": "en"
            },
            timeout=30
        )
        assert response.status_code == 200, f"Translation failed: {response.text}"
        data = response.json()
        assert "title" in data, "Response should contain translated title"
        assert len(data["title"]) > 0, "Translated title should not be empty"
        print(f"✓ DE→EN title translation: '{data['title']}'")
    
    def test_translate_de_to_en_full(self, auth_token):
        """Translate full content from German to English"""
        response = requests.post(
            f"{BASE_URL}/api/admin/translate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Warum digitale Zertifikate wichtig sind",
                "excerpt": "Erfahren Sie mehr über die Bedeutung digitaler Zertifikate in der heutigen Geschäftswelt.",
                "content_html": "<p>Digitale Zertifikate verändern die Art und Weise, wie Unternehmen Fähigkeiten und Leistungen überprüfen.</p>",
                "tags": "Zertifikate, digital, Geschäft",
                "source_lang": "de",
                "target_lang": "en"
            },
            timeout=60
        )
        assert response.status_code == 200, f"Translation failed: {response.text}"
        data = response.json()
        
        assert "title" in data, "Response should contain translated title"
        assert "excerpt" in data, "Response should contain translated excerpt"
        assert "content_html" in data, "Response should contain translated content"
        assert "tags" in data, "Response should contain translated tags"
        
        print(f"✓ DE→EN full translation:")
        print(f"  Title: {data['title']}")
        print(f"  Excerpt: {data['excerpt'][:50]}...")
        print(f"  Tags: {data['tags']}")
    
    def test_translate_preserves_html_tags(self, auth_token):
        """Translation should preserve HTML structure"""
        html_content = "<h2>Introduction</h2><p>This is a <strong>test</strong> paragraph with <a href='#'>a link</a>.</p><ul><li>Item 1</li><li>Item 2</li></ul>"
        
        response = requests.post(
            f"{BASE_URL}/api/admin/translate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "",
                "excerpt": "",
                "content_html": html_content,
                "tags": "",
                "source_lang": "en",
                "target_lang": "de"
            },
            timeout=30
        )
        assert response.status_code == 200, f"Translation failed: {response.text}"
        data = response.json()
        
        translated = data.get("content_html", "")
        # Check that HTML tags are preserved
        assert "<h2>" in translated or "<H2>" in translated.upper(), "H2 tag should be preserved"
        assert "<p>" in translated or "<P>" in translated.upper(), "P tag should be preserved"
        assert "<strong>" in translated or "<b>" in translated or "strong" in translated.lower(), "Strong/bold tag should be preserved"
        
        print(f"✓ HTML tags preserved in translation")
        print(f"  Original: {html_content[:50]}...")
        print(f"  Translated: {translated[:50]}...")
    
    def test_translate_empty_fields_returns_empty(self, auth_token):
        """Empty fields should not be translated"""
        response = requests.post(
            f"{BASE_URL}/api/admin/translate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Test Title",
                "excerpt": "",
                "content_html": "",
                "tags": "",
                "source_lang": "en",
                "target_lang": "de"
            },
            timeout=30
        )
        assert response.status_code == 200, f"Translation failed: {response.text}"
        data = response.json()
        
        # Only title should be in response since others are empty
        assert "title" in data, "Title should be translated"
        # Empty fields should not be in response or should be empty
        assert data.get("excerpt", "") == "" or "excerpt" not in data, "Empty excerpt should not be translated"
        
        print("✓ Empty fields handled correctly")


class TestExistingAdminFeatures:
    """Verify existing admin features still work"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        if data.get("mfa_required"):
            pytest.skip("MFA is enabled")
        return data.get("token")
    
    def test_admin_blogs_list(self, auth_token):
        """Admin can list blogs"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data
        assert "total" in data
        print(f"✓ Admin blogs list works - {data['total']} posts")
    
    def test_admin_leads_list(self, auth_token):
        """Admin can list leads"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "leads" in data
        assert "total" in data
        print(f"✓ Admin leads list works - {data['total']} leads")
    
    def test_admin_settings(self, auth_token):
        """Admin can get settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "settings" in data
        print("✓ Admin settings endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
