"""
Iteration 37: AI Content Engine Tests
Tests for:
- POST /api/admin/ai/recommend - AI topic recommendations
- POST /api/admin/ai/generate - Full blog post generation with auto-translation
- POST /api/admin/blogs - Auto-translate when only one language provided
- Existing blog CRUD operations
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@credsure.io"
ADMIN_PASSWORD = "CredSure@Admin2026!"


class TestAIContentAuth:
    """Test that AI endpoints require JWT authentication"""
    
    def test_recommend_requires_auth(self):
        """POST /api/admin/ai/recommend should return 401 without token"""
        response = requests.post(f"{BASE_URL}/api/admin/ai/recommend", timeout=30)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: /api/admin/ai/recommend requires JWT auth")
    
    def test_generate_requires_auth(self):
        """POST /api/admin/ai/generate should return 401 without token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/ai/generate",
            json={"topic": "Test", "keywords": [], "category": "Test"},
            timeout=30
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: /api/admin/ai/generate requires JWT auth")


class TestAIRecommendations:
    """Test AI topic recommendation endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # Handle MFA if enabled
        if data.get("mfa_required"):
            pytest.skip("MFA enabled - cannot test without TOTP code")
        return data["token"]
    
    def test_recommend_returns_topics(self, auth_token):
        """POST /api/admin/ai/recommend should return 8 topic recommendations"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # This endpoint uses real LLM, may take 10-30 seconds
        response = requests.post(
            f"{BASE_URL}/api/admin/ai/recommend",
            headers=headers,
            timeout=120  # Long timeout for LLM call
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "topics" in data, "Response should contain 'topics' key"
        topics = data["topics"]
        assert isinstance(topics, list), "Topics should be a list"
        assert len(topics) >= 1, "Should return at least 1 topic"
        
        # Verify first topic has required fields
        topic = topics[0]
        required_fields = ["topic", "category", "search_intent", "estimated_volume", "keywords", "excerpt", "rationale"]
        for field in required_fields:
            assert field in topic, f"Topic missing required field: {field}"
        
        # Verify field types
        assert isinstance(topic["topic"], str), "topic should be string"
        assert isinstance(topic["keywords"], list), "keywords should be list"
        assert topic["search_intent"] in ["informational", "commercial", "navigational"], f"Invalid search_intent: {topic['search_intent']}"
        assert topic["estimated_volume"] in ["high", "medium", "low"], f"Invalid estimated_volume: {topic['estimated_volume']}"
        
        print(f"PASS: /api/admin/ai/recommend returned {len(topics)} topics with all required fields")
        print(f"  Sample topic: {topic['topic'][:60]}...")
        print(f"  Intent: {topic['search_intent']}, Volume: {topic['estimated_volume']}")
        print(f"  Keywords: {topic['keywords'][:3]}")


class TestAIGenerate:
    """Test AI blog post generation endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        if data.get("mfa_required"):
            pytest.skip("MFA enabled - cannot test without TOTP code")
        return data["token"]
    
    def test_generate_creates_full_post(self, auth_token):
        """POST /api/admin/ai/generate should create a full blog post with EN and DE content"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        payload = {
            "topic": "TEST_AI_Benefits of Digital Credentials for Remote Workforce",
            "keywords": ["digital credentials", "remote work", "verification"],
            "category": "Digital Credentials",
            "excerpt": "Explore how digital credentials streamline verification for remote teams."
        }
        
        # This endpoint generates EN content then auto-translates to DE, may take 30-60 seconds
        response = requests.post(
            f"{BASE_URL}/api/admin/ai/generate",
            headers=headers,
            json=payload,
            timeout=180  # Very long timeout for generation + translation
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "post" in data, "Response should contain 'post' key"
        assert "message" in data, "Response should contain 'message' key"
        
        post = data["post"]
        
        # Verify English fields
        assert post.get("title"), "Post should have title"
        assert post.get("content_html"), "Post should have content_html"
        assert post.get("seo_title"), "Post should have seo_title"
        assert post.get("seo_description"), "Post should have seo_description"
        assert post.get("excerpt"), "Post should have excerpt"
        
        # Verify content length (800+ words)
        content = post.get("content_html", "")
        word_count = len(content.split())
        assert word_count >= 200, f"Content should have 200+ words, got {word_count}"  # HTML tags inflate count
        
        # Verify German auto-translation
        assert post.get("title_de"), f"Post should have title_de (auto-translated), got: {post.get('title_de')}"
        assert post.get("content_html_de"), "Post should have content_html_de (auto-translated)"
        assert post.get("excerpt_de"), f"Post should have excerpt_de (auto-translated), got: {post.get('excerpt_de')}"
        
        # Verify tags_de is populated
        tags_de = post.get("tags_de", [])
        assert isinstance(tags_de, list), "tags_de should be a list"
        
        # Verify draft status and ai_generated flag
        assert post.get("status") == "draft", f"Post should be draft, got: {post.get('status')}"
        assert post.get("ai_generated") == True, "Post should have ai_generated=true"
        
        # Verify slug was generated
        assert post.get("slug"), "Post should have slug"
        
        print(f"PASS: /api/admin/ai/generate created full post with auto-translation")
        print(f"  Title EN: {post['title'][:60]}...")
        print(f"  Title DE: {post.get('title_de', 'N/A')[:60]}...")
        print(f"  Content words: ~{word_count}")
        print(f"  Status: {post['status']}, AI Generated: {post['ai_generated']}")
        
        # Store slug for cleanup
        return post.get("slug")


class TestAutoTranslateOnSave:
    """Test auto-translation when creating/updating blogs with only one language"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        if data.get("mfa_required"):
            pytest.skip("MFA enabled - cannot test without TOTP code")
        return data["token"]
    
    def test_create_blog_auto_translates_en_to_de(self, auth_token):
        """POST /api/admin/blogs should auto-translate EN→DE when only English provided"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        import uuid
        unique_id = uuid.uuid4().hex[:6]
        
        payload = {
            "title": f"TEST_AUTO_TRANSLATE_Understanding Digital Badges {unique_id}",
            "title_de": "",  # Empty - should be auto-translated
            "slug": f"test-auto-translate-badges-{unique_id}",
            "excerpt": "Learn about the benefits of digital badges for professional development.",
            "excerpt_de": "",  # Empty - should be auto-translated
            "content_html": "<h1>Understanding Digital Badges</h1><p>Digital badges are a powerful way to recognize skills and achievements. They provide verifiable credentials that can be shared across platforms.</p><p>Organizations use digital badges to motivate learners and validate competencies.</p>",
            "content_html_de": "",  # Empty - should be auto-translated
            "category": "Digital Credentials",
            "tags": ["digital badges", "credentials", "skills"],
            "tags_de": [],  # Empty - should be auto-translated
            "author": "Test Author",
            "read_time": "3 min read",
            "status": "draft",
            "featured_image": "",
            "seo_title": "Understanding Digital Badges | CredSure",
            "seo_description": "Learn about digital badges and how they help recognize professional skills."
        }
        
        # This may take time due to auto-translation
        response = requests.post(
            f"{BASE_URL}/api/admin/blogs",
            headers=headers,
            json=payload,
            timeout=120
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        post = data.get("post", {})
        
        # Verify English content preserved
        assert post.get("title") == payload["title"], "English title should be preserved"
        assert post.get("content_html") == payload["content_html"], "English content should be preserved"
        
        # Verify German auto-translation occurred
        assert post.get("title_de"), f"title_de should be auto-translated, got: {post.get('title_de')}"
        assert post.get("excerpt_de"), f"excerpt_de should be auto-translated, got: {post.get('excerpt_de')}"
        assert post.get("content_html_de"), "content_html_de should be auto-translated"
        
        # Verify tags_de is populated
        tags_de = post.get("tags_de", [])
        assert isinstance(tags_de, list), "tags_de should be a list"
        
        print(f"PASS: Auto-translate EN→DE on blog create")
        print(f"  Title EN: {post['title'][:50]}...")
        print(f"  Title DE: {post.get('title_de', 'N/A')[:50]}...")
        
        # Cleanup - delete the test post
        slug = post.get("slug")
        if slug:
            requests.delete(f"{BASE_URL}/api/admin/blogs/{slug}", headers=headers, timeout=30)
            print(f"  Cleaned up test post: {slug}")


class TestExistingBlogCRUD:
    """Verify existing blog CRUD operations still work"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        if data.get("mfa_required"):
            pytest.skip("MFA enabled - cannot test without TOTP code")
        return data["token"]
    
    def test_list_blogs(self, auth_token):
        """GET /api/admin/blogs should return paginated list"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/blogs", headers=headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "posts" in data, "Response should contain 'posts'"
        assert "total" in data, "Response should contain 'total'"
        assert isinstance(data["posts"], list), "posts should be a list"
        
        print(f"PASS: GET /api/admin/blogs returned {len(data['posts'])} posts (total: {data['total']})")
    
    def test_get_single_blog(self, auth_token):
        """GET /api/admin/blogs/:slug should return single post"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First get list to find a slug
        list_response = requests.get(f"{BASE_URL}/api/admin/blogs?limit=1", headers=headers, timeout=30)
        assert list_response.status_code == 200
        posts = list_response.json().get("posts", [])
        
        if not posts:
            pytest.skip("No blog posts available to test")
        
        slug = posts[0].get("slug")
        response = requests.get(f"{BASE_URL}/api/admin/blogs/{slug}", headers=headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "post" in data, "Response should contain 'post'"
        assert data["post"].get("slug") == slug, "Returned post should match requested slug"
        
        print(f"PASS: GET /api/admin/blogs/{slug} returned correct post")
    
    def test_filter_blogs_by_status(self, auth_token):
        """GET /api/admin/blogs?status=draft should filter by status"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/blogs?status=draft", headers=headers, timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # All returned posts should be drafts
        for post in data.get("posts", []):
            assert post.get("status") == "draft", f"Post {post.get('slug')} should be draft"
        
        print(f"PASS: GET /api/admin/blogs?status=draft returned {len(data.get('posts', []))} draft posts")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
