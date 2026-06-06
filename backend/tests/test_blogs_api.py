"""
Backend API tests for Blog endpoints - Iteration 29
Tests the new blog API migration from static frontend JS to backend API endpoints.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bilingual-lead-gen.preview.emergentagent.com')


class TestBlogListingAPI:
    """Tests for GET /api/blogs endpoint"""
    
    def test_get_all_blogs_returns_126_posts(self):
        """Verify /api/blogs returns 126 blog posts"""
        response = requests.get(f"{BASE_URL}/api/blogs?limit=200")
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data
        assert "total" in data
        assert data["total"] == 126, f"Expected 126 posts, got {data['total']}"
        
    def test_blogs_sorted_by_date_descending(self):
        """Verify posts are sorted by date descending (newest first)"""
        response = requests.get(f"{BASE_URL}/api/blogs?limit=10")
        assert response.status_code == 200
        data = response.json()
        posts = data["posts"]
        
        # Check first post is the newest (2026-03-01)
        assert posts[0]["slug"] == "digital-badges-employee-engagement"
        assert posts[0]["date"] == "2026-03-01"
        
        # Verify descending order
        dates = [p["date"] for p in posts]
        assert dates == sorted(dates, reverse=True), "Posts not sorted by date descending"
        
    def test_blogs_category_filter_technology(self):
        """Verify category filter works for Technology"""
        response = requests.get(f"{BASE_URL}/api/blogs?category=Technology")
        assert response.status_code == 200
        data = response.json()
        
        # All posts should be Technology category
        for post in data["posts"]:
            assert post["category"] == "Technology", f"Post {post['slug']} has category {post['category']}"
            
    def test_blogs_category_filter_education(self):
        """Verify category filter works for Education"""
        response = requests.get(f"{BASE_URL}/api/blogs?category=Education")
        assert response.status_code == 200
        data = response.json()
        
        assert data["total"] > 0, "Expected Education posts"
        for post in data["posts"]:
            assert post["category"] == "Education"
            
    def test_blogs_pagination(self):
        """Verify pagination parameters work"""
        response = requests.get(f"{BASE_URL}/api/blogs?page=1&limit=5")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["posts"]) == 5
        assert data["page"] == 1
        assert data["limit"] == 5
        
    def test_blogs_response_structure(self):
        """Verify each post has required fields"""
        response = requests.get(f"{BASE_URL}/api/blogs?limit=5")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "title", "excerpt", "category", "date", "author", "readTime", "slug"]
        for post in data["posts"]:
            for field in required_fields:
                assert field in post, f"Missing field {field} in post {post.get('slug', 'unknown')}"


class TestBlogPostAPI:
    """Tests for GET /api/blogs/:slug endpoint"""
    
    def test_get_bilingual_post_digital_badges(self):
        """Verify bilingual post returns content_html field"""
        response = requests.get(f"{BASE_URL}/api/blogs/digital-badges-employee-engagement?lang=en")
        assert response.status_code == 200
        data = response.json()
        
        assert data["source"] == "bilingual"
        post = data["post"]
        assert post["title"] == "How Digital Badges Boost Employee Engagement by 40%"
        assert "content_html" in post
        assert len(post["content_html"]) > 100, "content_html should have substantial content"
        assert "<h2>" in post["content_html"], "content_html should contain HTML headings"
        
    def test_get_bilingual_post_gdpr(self):
        """Verify GDPR bilingual post returns content_html"""
        response = requests.get(f"{BASE_URL}/api/blogs/gdpr-digital-credentials-compliance?lang=en")
        assert response.status_code == 200
        data = response.json()
        
        assert data["source"] == "bilingual"
        post = data["post"]
        assert "GDPR" in post["title"]
        assert "content_html" in post
        assert len(post["content_html"]) > 100
        
    def test_get_bilingual_post_higher_education(self):
        """Verify higher education bilingual post returns content_html"""
        response = requests.get(f"{BASE_URL}/api/blogs/digital-credentials-higher-education?lang=en")
        assert response.status_code == 200
        data = response.json()
        
        assert data["source"] == "bilingual"
        post = data["post"]
        assert "Higher Education" in post["title"]
        assert "content_html" in post
        
    def test_get_scraped_post_soft_skills(self):
        """Verify scraped post returns sections array"""
        response = requests.get(f"{BASE_URL}/api/blogs/how-to-build-a-great-soft-skill-training-program-for-your-employees?lang=en")
        assert response.status_code == 200
        data = response.json()
        
        assert data["source"] == "scraped"
        post = data["post"]
        assert "soft skill" in post["title"].lower()
        assert "sections" in post
        assert len(post["sections"]) > 10, f"Expected many sections, got {len(post['sections'])}"
        
        # Verify section structure
        for section in post["sections"]:
            assert "content" in section, "Each section should have content"
            
    def test_get_scraped_post_certificate_appreciation(self):
        """Verify another scraped post returns sections"""
        response = requests.get(f"{BASE_URL}/api/blogs/certificate-of-appreciation-definition-and-10-examples?lang=en")
        assert response.status_code == 200
        data = response.json()
        
        assert data["source"] == "scraped"
        post = data["post"]
        assert "sections" in post
        assert len(post["sections"]) > 5
        
    def test_get_nonexistent_post_returns_404(self):
        """Verify 404 for non-existent slug"""
        response = requests.get(f"{BASE_URL}/api/blogs/this-post-does-not-exist-xyz")
        assert response.status_code == 404
        
    def test_bilingual_post_german_language(self):
        """Verify German language returns German content"""
        response = requests.get(f"{BASE_URL}/api/blogs/digital-badges-employee-engagement?lang=de")
        assert response.status_code == 200
        data = response.json()
        
        post = data["post"]
        # German title should contain German words
        assert "Mitarbeiter" in post["title"] or "digitale" in post["title"].lower() or "Abzeichen" in post["title"]


class TestBlogCategoriesAPI:
    """Tests for GET /api/blogs/categories/list endpoint"""
    
    def test_get_categories_list(self):
        """Verify categories endpoint returns list"""
        response = requests.get(f"{BASE_URL}/api/blogs/categories/list")
        assert response.status_code == 200
        data = response.json()
        
        assert "categories" in data
        categories = data["categories"]
        
        # Verify expected categories exist
        expected = ["Education", "Industry", "Insights", "Technology"]
        for cat in expected:
            assert cat in categories, f"Missing category: {cat}"


class TestBlogAPICaching:
    """Tests for API caching headers"""
    
    def test_blogs_listing_has_cache_header(self):
        """Verify listing endpoint has Cache-Control header"""
        response = requests.get(f"{BASE_URL}/api/blogs?limit=5")
        assert response.status_code == 200
        assert "Cache-Control" in response.headers
        
    def test_blog_post_has_cache_header(self):
        """Verify post endpoint has Cache-Control header"""
        response = requests.get(f"{BASE_URL}/api/blogs/digital-badges-employee-engagement")
        assert response.status_code == 200
        assert "Cache-Control" in response.headers
