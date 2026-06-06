"""
Analytics API Tests - Tests for /api/leads/analytics endpoint
Tests API key authentication and response data structure
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_API_KEY = os.environ.get('ADMIN_API_KEY', 'dev-admin-key')


class TestAnalyticsAPI:
    """Analytics endpoint authentication and data tests"""

    def test_analytics_requires_api_key(self):
        """GET /api/leads/analytics without API key returns 401"""
        response = requests.get(f"{BASE_URL}/api/leads/analytics")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Analytics endpoint requires API key (401 without key)")

    def test_analytics_rejects_invalid_key(self):
        """GET /api/leads/analytics with wrong API key returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": "wrong-key"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Analytics endpoint rejects invalid API key")

    def test_analytics_accepts_valid_key(self):
        """GET /api/leads/analytics with valid API key returns 200"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Analytics endpoint accepts valid API key")

    def test_analytics_response_structure(self):
        """Analytics response contains required fields"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check required top-level fields
        required_fields = ['total_leads', 'this_week', 'by_source', 'daily_trend', 'recent_leads']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print(f"✅ Analytics response contains all required fields: {required_fields}")

    def test_analytics_total_leads_is_integer(self):
        """total_leads field is an integer"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        data = response.json()
        assert isinstance(data['total_leads'], int), "total_leads should be integer"
        assert data['total_leads'] >= 0, "total_leads should be non-negative"
        print(f"✅ total_leads is valid integer: {data['total_leads']}")

    def test_analytics_by_source_structure(self):
        """by_source is array with source, label, count fields"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        data = response.json()
        
        assert isinstance(data['by_source'], list), "by_source should be a list"
        
        if len(data['by_source']) > 0:
            first_source = data['by_source'][0]
            assert 'source' in first_source, "by_source items should have 'source'"
            assert 'label' in first_source, "by_source items should have 'label'"
            assert 'count' in first_source, "by_source items should have 'count'"
            assert isinstance(first_source['count'], int), "count should be integer"
        
        print(f"✅ by_source structure valid with {len(data['by_source'])} sources")

    def test_analytics_daily_trend_structure(self):
        """daily_trend is array with date and count fields"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        data = response.json()
        
        assert isinstance(data['daily_trend'], list), "daily_trend should be a list"
        assert len(data['daily_trend']) == 30, f"daily_trend should have 30 days, got {len(data['daily_trend'])}"
        
        if len(data['daily_trend']) > 0:
            first_day = data['daily_trend'][0]
            assert 'date' in first_day, "daily_trend items should have 'date'"
            assert 'count' in first_day, "daily_trend items should have 'count'"
        
        print(f"✅ daily_trend structure valid with {len(data['daily_trend'])} days")

    def test_analytics_recent_leads_structure(self):
        """recent_leads is array with lead details"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        data = response.json()
        
        assert isinstance(data['recent_leads'], list), "recent_leads should be a list"
        assert len(data['recent_leads']) <= 20, "recent_leads should have max 20 items"
        
        if len(data['recent_leads']) > 0:
            first_lead = data['recent_leads'][0]
            # Check for expected fields (some may be optional)
            assert 'email' in first_lead, "recent_leads items should have 'email'"
        
        print(f"✅ recent_leads structure valid with {len(data['recent_leads'])} leads")

    def test_analytics_week_change_percentage(self):
        """week_change_pct is a number"""
        response = requests.get(
            f"{BASE_URL}/api/leads/analytics",
            headers={"X-API-Key": ADMIN_API_KEY}
        )
        data = response.json()
        
        assert 'week_change_pct' in data, "Should have week_change_pct field"
        assert isinstance(data['week_change_pct'], (int, float)), "week_change_pct should be numeric"
        
        print(f"✅ week_change_pct is valid: {data['week_change_pct']}%")


class TestTeamImagesAPI:
    """Test that team images are accessible"""

    def test_tim_miller_image_accessible(self):
        """Tim Miller image is accessible"""
        response = requests.get(f"{BASE_URL}/images/team/tim-miller.png")
        assert response.status_code == 200, f"Tim Miller image not accessible: {response.status_code}"
        assert 'image' in response.headers.get('content-type', ''), "Should return image content type"
        print("✅ Tim Miller image accessible")

    def test_markus_dohm_image_accessible(self):
        """Markus Dohm image is accessible"""
        response = requests.get(f"{BASE_URL}/images/team/markus-dohm.png")
        assert response.status_code == 200, f"Markus Dohm image not accessible: {response.status_code}"
        assert 'image' in response.headers.get('content-type', ''), "Should return image content type"
        print("✅ Markus Dohm image accessible")

    def test_mike_wild_image_accessible(self):
        """Mike Wild image is accessible"""
        response = requests.get(f"{BASE_URL}/images/team/mike-wild.png")
        assert response.status_code == 200, f"Mike Wild image not accessible: {response.status_code}"
        assert 'image' in response.headers.get('content-type', ''), "Should return image content type"
        print("✅ Mike Wild image accessible")
