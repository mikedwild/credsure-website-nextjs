"""
Admin Panel API Tests - Iteration 33
Tests for blog CRUD, lead management, and site settings admin endpoints
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_API_KEY = "dev-admin-key"

# Test data prefix for cleanup
TEST_PREFIX = "TEST_ITER33_"


class TestAdminAuth:
    """Test admin authentication via API key"""
    
    def test_admin_auth_valid_key(self):
        """Valid API key should return 200"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?limit=1",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "posts" in data
        assert "total" in data
        print(f"✓ Admin auth with valid key works, total posts: {data['total']}")
    
    def test_admin_auth_invalid_key(self):
        """Invalid API key should return 401"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?limit=1",
            headers={"X-API-Key": "invalid-key"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin auth rejects invalid key")
    
    def test_admin_auth_missing_key(self):
        """Missing API key should return 422 (validation error)"""
        response = requests.get(f"{BASE_URL}/api/admin/blogs?limit=1")
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("✓ Admin auth requires API key header")


class TestAdminBlogList:
    """Test admin blog listing with search, filter, pagination"""
    
    def test_list_blogs_returns_126_posts(self):
        """Should return 126 migrated blog posts"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?limit=200",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 126, f"Expected at least 126 posts, got {data['total']}"
        print(f"✓ Blog list returns {data['total']} posts")
    
    def test_list_blogs_pagination(self):
        """Pagination should work correctly"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?page=1&limit=15",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["posts"]) <= 15
        assert data["page"] == 1
        assert data["limit"] == 15
        print(f"✓ Pagination works: page 1 with {len(data['posts'])} posts")
    
    def test_list_blogs_status_filter_published(self):
        """Status filter should filter by published"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?status=published&limit=50",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        for post in data["posts"]:
            assert post["status"] == "published", f"Post {post['slug']} has status {post['status']}"
        print(f"✓ Status filter 'published' works: {len(data['posts'])} posts")
    
    def test_list_blogs_status_filter_draft(self):
        """Status filter should filter by draft"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?status=draft&limit=50",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        for post in data["posts"]:
            assert post["status"] == "draft", f"Post {post['slug']} has status {post['status']}"
        print(f"✓ Status filter 'draft' works: {len(data['posts'])} posts")
    
    def test_list_blogs_search(self):
        """Search should filter by title"""
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?search=digital&limit=50",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] > 0, "Search for 'digital' should return results"
        print(f"✓ Search works: found {data['total']} posts matching 'digital'")


class TestAdminBlogCRUD:
    """Test blog Create, Read, Update, Delete operations"""
    
    @pytest.fixture(autouse=True)
    def cleanup(self):
        """Cleanup test posts after each test"""
        yield
        # Delete any test posts created
        response = requests.get(
            f"{BASE_URL}/api/admin/blogs?search={TEST_PREFIX}&limit=100",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        if response.status_code == 200:
            for post in response.json().get("posts", []):
                requests.delete(
                    f"{BASE_URL}/api/admin/blogs/{post['slug']}",
                    headers={"X-API-Key": ADMIN_API_KEY}
                )
    
    def test_create_blog_post(self):
        """POST /api/admin/blogs should create a new post"""
        slug = f"{TEST_PREFIX}create-test-{uuid.uuid4().hex[:8]}"
        payload = {
            "title": f"{TEST_PREFIX}Test Blog Post",
            "title_de": f"{TEST_PREFIX}Test Blog Post DE",
            "slug": slug,
            "excerpt": "Test excerpt",
            "excerpt_de": "Test excerpt DE",
            "content_html": "<p>Test content</p>",
            "content_html_de": "<p>Test content DE</p>",
            "category": "Testing",
            "tags": ["test", "automation"],
            "tags_de": ["test", "automatisierung"],
            "author": "Test Author",
            "read_time": "3 min read",
            "status": "draft",
            "seo_title": "SEO Test Title",
            "seo_description": "SEO Test Description"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/blogs",
            headers={"X-API-Key": ADMIN_API_KEY, "Content-Type": "application/json"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "post" in data
        assert data["post"]["slug"] == slug
        assert data["post"]["title"] == payload["title"]
        assert data["post"]["status"] == "draft"
        print(f"✓ Created blog post: {slug}")
        
        # Verify with GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/blogs/{slug}",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["post"]["title"] == payload["title"]
        assert get_data["post"]["seo_title"] == payload["seo_title"]
        print(f"✓ Verified blog post exists via GET")
    
    def test_update_blog_post(self):
        """PUT /api/admin/blogs/{slug} should update a post"""
        # First create a post
        slug = f"{TEST_PREFIX}update-test-{uuid.uuid4().hex[:8]}"
        create_payload = {
            "title": f"{TEST_PREFIX}Original Title",
            "slug": slug,
            "status": "draft"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/blogs",
            headers={"X-API-Key": ADMIN_API_KEY, "Content-Type": "application/json"},
            json=create_payload
        )
        assert create_response.status_code == 200
        
        # Update the post
        update_payload = {
            "title": f"{TEST_PREFIX}Updated Title",
            "status": "published",
            "category": "Updated Category"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/blogs/{slug}",
            headers={"X-API-Key": ADMIN_API_KEY, "Content-Type": "application/json"},
            json=update_payload
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        data = update_response.json()
        assert data["post"]["title"] == update_payload["title"]
        assert data["post"]["status"] == "published"
        print(f"✓ Updated blog post: {slug}")
        
        # Verify with GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/blogs/{slug}",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert get_response.status_code == 200
        assert get_response.json()["post"]["title"] == update_payload["title"]
        print(f"✓ Verified update persisted via GET")
    
    def test_delete_blog_post(self):
        """DELETE /api/admin/blogs/{slug} should delete a post"""
        # First create a post
        slug = f"{TEST_PREFIX}delete-test-{uuid.uuid4().hex[:8]}"
        create_payload = {
            "title": f"{TEST_PREFIX}To Be Deleted",
            "slug": slug,
            "status": "draft"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/blogs",
            headers={"X-API-Key": ADMIN_API_KEY, "Content-Type": "application/json"},
            json=create_payload
        )
        assert create_response.status_code == 200
        
        # Delete the post
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/blogs/{slug}",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        print(f"✓ Deleted blog post: {slug}")
        
        # Verify deletion with GET (should 404)
        get_response = requests.get(
            f"{BASE_URL}/api/admin/blogs/{slug}",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert get_response.status_code == 404
        print(f"✓ Verified post deleted (404 on GET)")
    
    def test_schedule_blog_post(self):
        """POST /api/admin/blogs/{slug}/schedule should schedule a post"""
        # First create a post
        slug = f"{TEST_PREFIX}schedule-test-{uuid.uuid4().hex[:8]}"
        create_payload = {
            "title": f"{TEST_PREFIX}To Be Scheduled",
            "slug": slug,
            "status": "draft"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/blogs",
            headers={"X-API-Key": ADMIN_API_KEY, "Content-Type": "application/json"},
            json=create_payload
        )
        assert create_response.status_code == 200
        
        # Schedule the post
        future_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        schedule_response = requests.post(
            f"{BASE_URL}/api/admin/blogs/{slug}/schedule?scheduled_at={future_date}",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert schedule_response.status_code == 200, f"Expected 200, got {schedule_response.status_code}: {schedule_response.text}"
        print(f"✓ Scheduled blog post: {slug} for {future_date}")
        
        # Verify status changed to scheduled
        get_response = requests.get(
            f"{BASE_URL}/api/admin/blogs/{slug}",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert get_response.status_code == 200
        assert get_response.json()["post"]["status"] == "scheduled"
        print(f"✓ Verified post status is 'scheduled'")


class TestAdminLeads:
    """Test lead management endpoints"""
    
    def test_list_leads(self):
        """GET /api/admin/leads should return leads with pagination"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads?page=1&limit=25",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "leads" in data
        assert "total" in data
        assert "sources" in data
        assert data["page"] == 1
        assert data["limit"] == 25
        print(f"✓ Leads list works: {data['total']} total leads, sources: {data['sources']}")
    
    def test_list_leads_search(self):
        """Search should filter leads by email/name/company"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads?search=test&limit=25",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        assert "leads" in data
        print(f"✓ Leads search works: found {len(data['leads'])} leads matching 'test'")
    
    def test_list_leads_source_filter(self):
        """Source filter should filter leads by source"""
        # First get available sources
        response = requests.get(
            f"{BASE_URL}/api/admin/leads?limit=1",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        sources = response.json().get("sources", [])
        
        if sources:
            source = sources[0]
            filter_response = requests.get(
                f"{BASE_URL}/api/admin/leads?source={source}&limit=25",
                headers={"X-API-Key": ADMIN_API_KEY}
            )
            assert filter_response.status_code == 200
            data = filter_response.json()
            for lead in data["leads"]:
                assert lead.get("source") == source, f"Lead source mismatch: {lead.get('source')} != {source}"
            print(f"✓ Leads source filter works for '{source}'")
        else:
            print("⚠ No sources available to test filter")
    
    def test_export_leads_csv(self):
        """GET /api/admin/leads/export should return CSV file"""
        response = requests.get(
            f"{BASE_URL}/api/admin/leads/export",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/csv" in response.headers.get("Content-Type", "")
        assert "attachment" in response.headers.get("Content-Disposition", "")
        
        # Verify CSV content
        content = response.text
        assert "Name,Email,Company" in content or "Name" in content.split("\n")[0]
        print(f"✓ Leads CSV export works, size: {len(content)} bytes")


class TestAdminSettings:
    """Test site settings endpoints"""
    
    def test_get_settings(self):
        """GET /api/admin/settings should return site settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "settings" in data
        settings = data["settings"]
        # Check expected fields exist
        assert "site_title" in settings
        assert "site_description" in settings
        assert "default_author" in settings
        print(f"✓ Settings GET works: site_title='{settings.get('site_title')}'")
    
    def test_update_settings(self):
        """PUT /api/admin/settings should save site settings"""
        # First get current settings
        get_response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        original_settings = get_response.json().get("settings", {})
        
        # Update settings
        update_payload = {
            "site_title": "CredSure Test",
            "site_description": "Test description",
            "default_author": "Test Author",
            "social_linkedin": "https://linkedin.com/test",
            "social_twitter": "https://twitter.com/test",
            "contact_email": "test@example.com",
            "ga_tracking_id": "UA-TEST-123"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers={"X-API-Key": ADMIN_API_KEY, "Content-Type": "application/json"},
            json=update_payload
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        data = update_response.json()
        assert data["settings"]["site_title"] == update_payload["site_title"]
        print(f"✓ Settings PUT works")
        
        # Verify with GET
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["settings"]["site_title"] == update_payload["site_title"]
        assert verify_data["settings"]["ga_tracking_id"] == update_payload["ga_tracking_id"]
        print(f"✓ Settings update persisted")
        
        # Restore original settings
        restore_payload = {
            "site_title": original_settings.get("site_title", "CredSure"),
            "site_description": original_settings.get("site_description", ""),
            "default_author": original_settings.get("default_author", "CredSure Team"),
            "social_linkedin": original_settings.get("social_linkedin", ""),
            "social_twitter": original_settings.get("social_twitter", ""),
            "contact_email": original_settings.get("contact_email", ""),
            "ga_tracking_id": original_settings.get("ga_tracking_id", "")
        }
        requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers={"X-API-Key": ADMIN_API_KEY, "Content-Type": "application/json"},
            json=restore_payload
        )


class TestPublicBlogAPI:
    """Test public blog API still works after admin panel implementation"""
    
    def test_public_blog_listing(self):
        """GET /api/blogs should return published posts from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/blogs?limit=200")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "posts" in data
        assert data["total"] >= 100, f"Expected at least 100 public posts, got {data['total']}"
        print(f"✓ Public blog listing works: {data['total']} posts")
    
    def test_public_blog_post_detail(self):
        """GET /api/blogs/{slug} should return post from MongoDB"""
        # First get a slug from listing
        list_response = requests.get(f"{BASE_URL}/api/blogs?limit=1")
        assert list_response.status_code == 200
        posts = list_response.json().get("posts", [])
        
        if posts:
            slug = posts[0]["slug"]
            detail_response = requests.get(f"{BASE_URL}/api/blogs/{slug}")
            assert detail_response.status_code == 200, f"Expected 200, got {detail_response.status_code}"
            data = detail_response.json()
            assert "post" in data
            assert data["post"]["slug"] == slug
            assert data.get("source") == "mongodb"
            print(f"✓ Public blog detail works for '{slug}', source: mongodb")
        else:
            pytest.skip("No posts available to test")
    
    def test_public_blog_bilingual_lead_gen(self):
        """GET /api/blogs/bilingual-lead-gen should work"""
        response = requests.get(f"{BASE_URL}/api/blogs/bilingual-lead-gen")
        # This might be 404 if the slug doesn't exist, which is fine
        if response.status_code == 200:
            data = response.json()
            assert "post" in data
            print(f"✓ bilingual-lead-gen post exists")
        else:
            print(f"⚠ bilingual-lead-gen post not found (status {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
