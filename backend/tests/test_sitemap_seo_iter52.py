"""SEO regression tests for sitemap hreflang + blog served_lang (iter52)."""
import os
import re
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")

# Slugs per spec
SLUG_WITH_DE = "digital-badges-employee-engagement"
SLUG_WITHOUT_DE = "10-must-have-features-digital-credentialing-solution"

STATIC_PAGES_COUNT = 37  # per sitemap.py


@pytest.fixture(scope="module")
def sitemap_xml():
    r = requests.get(f"{BASE_URL}/api/sitemap.xml", timeout=30)
    assert r.status_code == 200, r.text[:500]
    assert "xml" in r.headers.get("content-type", "").lower()
    return r.text


class TestSitemap:
    def test_sitemap_loads(self, sitemap_xml):
        assert sitemap_xml.startswith('<?xml')
        assert 'xmlns:xhtml="http://www.w3.org/1999/xhtml"' in sitemap_xml

    def test_url_count_formula(self, sitemap_xml):
        # Count <url> entries
        url_count = len(re.findall(r"<url>", sitemap_xml))
        # Count published posts and posts with title_de via API
        posts_res = requests.get(f"{BASE_URL}/api/blogs?limit=500", timeout=30).json()
        posts = posts_res.get("posts", [])
        en_count = len(posts)
        de_count = sum(1 for p in posts if p.get("title_de"))
        expected = 2 * STATIC_PAGES_COUNT + en_count + de_count
        print(f"url_count={url_count} en={en_count} de_translated={de_count} expected={expected}")
        assert url_count == expected, f"Expected {expected} URLs, got {url_count}"

    def test_hreflang_count(self, sitemap_xml):
        url_count = len(re.findall(r"<url>", sitemap_xml))
        xhtml_count = len(re.findall(r"<xhtml:link rel=\"alternate\"", sitemap_xml))
        # Each <url> has min 2 xhtml:link (en + x-default); de-bearing URLs add 1 more
        assert xhtml_count >= 2 * url_count, f"hreflang={xhtml_count} < 2x urls={url_count}"

    def test_only_credsure_urls_in_loc(self, sitemap_xml):
        locs = re.findall(r"<loc>([^<]+)</loc>", sitemap_xml)
        for loc in locs:
            assert loc.startswith("https://credsure.io/en/") or loc.startswith("https://credsure.io/de/"), \
                f"Unexpected loc (possibly redirected): {loc}"

    def test_post_with_de_has_both_entries(self, sitemap_xml):
        en_loc = f"https://credsure.io/en/blog/{SLUG_WITH_DE}"
        de_loc = f"https://credsure.io/de/blog/{SLUG_WITH_DE}"
        assert f"<loc>{en_loc}</loc>" in sitemap_xml
        assert f"<loc>{de_loc}</loc>" in sitemap_xml

    def test_post_without_de_only_en_entry(self, sitemap_xml):
        en_loc = f"https://credsure.io/en/blog/{SLUG_WITHOUT_DE}"
        de_loc = f"https://credsure.io/de/blog/{SLUG_WITHOUT_DE}"
        assert f"<loc>{en_loc}</loc>" in sitemap_xml
        assert f"<loc>{de_loc}</loc>" not in sitemap_xml, "DE URL should NOT be present for post without title_de"

    def test_post_without_de_no_de_hreflang(self, sitemap_xml):
        # Find the <url> block containing the EN slug and ensure no hreflang=de within it
        en_loc = f"https://credsure.io/en/blog/{SLUG_WITHOUT_DE}"
        m = re.search(r"<url>\s*<loc>" + re.escape(en_loc) + r"</loc>.*?</url>", sitemap_xml, re.DOTALL)
        assert m, "URL block for post without DE not found"
        block = m.group(0)
        assert 'hreflang="en"' in block
        assert 'hreflang="x-default"' in block
        assert 'hreflang="de"' not in block, f"Unexpected DE hreflang in block: {block}"

    def test_post_with_de_has_all_three_hreflangs(self, sitemap_xml):
        en_loc = f"https://credsure.io/en/blog/{SLUG_WITH_DE}"
        m = re.search(r"<url>\s*<loc>" + re.escape(en_loc) + r"</loc>.*?</url>", sitemap_xml, re.DOTALL)
        assert m
        block = m.group(0)
        assert 'hreflang="en"' in block
        assert 'hreflang="de"' in block
        assert 'hreflang="x-default"' in block


class TestBlogLangAPI:
    def test_en_request(self):
        r = requests.get(f"{BASE_URL}/api/blogs/{SLUG_WITHOUT_DE}?lang=en", timeout=30)
        assert r.status_code == 200
        post = r.json()["post"]
        assert post["served_lang"] == "en"
        assert post["has_de_translation"] is False

    def test_de_fallback_on_no_translation(self):
        r = requests.get(f"{BASE_URL}/api/blogs/{SLUG_WITHOUT_DE}?lang=de", timeout=30)
        assert r.status_code == 200
        post = r.json()["post"]
        assert post["served_lang"] == "en", "Should fall back to EN when no DE translation"
        assert post["has_de_translation"] is False

    def test_de_served_when_translated(self):
        r = requests.get(f"{BASE_URL}/api/blogs/{SLUG_WITH_DE}?lang=de", timeout=30)
        assert r.status_code == 200
        post = r.json()["post"]
        assert post["served_lang"] == "de"
        assert post["has_de_translation"] is True

    def test_en_on_translated_post(self):
        r = requests.get(f"{BASE_URL}/api/blogs/{SLUG_WITH_DE}?lang=en", timeout=30)
        assert r.status_code == 200
        post = r.json()["post"]
        assert post["served_lang"] == "en"
        assert post["has_de_translation"] is True
