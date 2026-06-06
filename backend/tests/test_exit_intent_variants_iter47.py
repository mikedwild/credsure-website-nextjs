"""
Iter47: Backend tests for the 3 exit-intent variants.
Verify POST /api/leads accepts and persists:
- exit-intent-roi
- exit-intent-pdf-guide
- exit-intent-demo-incentive
"""
import os
import time
import pytest
import requests

BASE_URL = (os.environ.get('REACT_APP_BACKEND_URL') or
            "https://bilingual-lead-gen.preview.emergentagent.com").rstrip('/')
ADMIN_KEY = os.environ.get('ADMIN_API_KEY', 'dev-admin-key')


def _post_lead(source, email, interests):
    payload = {
        "name": "",
        "email": email,
        "company": "",
        "role": "",
        "source": source,
        "interests": interests,
    }
    return requests.post(f"{BASE_URL}/api/leads", json=payload,
                         headers={"Content-Type": "application/json"}, timeout=15)


@pytest.mark.parametrize("source,interests", [
    ("exit-intent-roi", ["ROI Calculator: Accredible vs CredSure, 1000/mo"]),
    ("exit-intent-pdf-guide", ["The Complete Guide to Digital Credentials in 2026 (PDF)"]),
    ("exit-intent-demo-incentive", ["Demo incentive CTA clicked — 1 month free offer"]),
])
def test_create_lead_for_each_variant(source, interests):
    ts = int(time.time() * 1000)
    email = f"TEST_iter47_{source.replace('-', '_')}_{ts}@example.com"
    res = _post_lead(source, email, interests)
    assert res.status_code == 200, f"{source}: {res.status_code} {res.text}"
    data = res.json()
    assert data["source"] == source
    assert data["email"] == email


def test_demo_incentive_anonymous_email_accepted():
    """The DemoIncentiveVariant uses email='cta-click@anonymous.exit-intent' as placeholder."""
    res = _post_lead(
        "exit-intent-demo-incentive",
        "cta-click@anonymous.exit-intent",
        ["Demo incentive CTA clicked — 1 month free offer"],
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["source"] == "exit-intent-demo-incentive"


def test_persistence_in_mongodb_via_admin_get():
    """GET /api/leads with admin key returns the leads we just created."""
    res = requests.get(f"{BASE_URL}/api/leads",
                       headers={"X-API-Key": ADMIN_KEY}, timeout=15)
    assert res.status_code == 200, res.text
    leads = res.json()
    sources = {l.get("source") for l in leads}
    expected = {"exit-intent-roi", "exit-intent-pdf-guide", "exit-intent-demo-incentive"}
    missing = expected - sources
    assert not missing, f"Missing sources in DB: {missing}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
