#!/usr/bin/env python3
"""CredSure blog SEO optimize → preview → publish workflow (the proven process).

Reads `update--<slug>.json` (a BlogPostUpdate body: slug, title, seo_title,
seo_description, content_html, tags) and runs the safe publish flow:

  python3 seo_publish.py check   <slug>   # strict link check only
  python3 seo_publish.py preview <slug>   # create/refresh a [PREVIEW] draft to review
  python3 seo_publish.py publish <slug>   # strict check -> publish live -> delete preview -> verify

KEY SAFEGUARD — strict link check: an internal link is valid ONLY if it returns
200 AND is NOT noindex. This app renders soft-404s as HTTP 200 + <meta robots
noindex>, so a plain status check passes dead pages (this bit us twice). The
`publish` command ABORTS if any internal link fails.

Auth: ADMIN_TOKEN env var, or a gitignored `.publish-token` file in this dir.
Backend: BACKEND_ORIGIN env (defaults to Railway prod). Site: SITE_ORIGIN env
(defaults to https://credsure.io).

Standard loop: build update--<slug>.json -> `preview` -> review in admin editor
preview pane (no ISR cache) -> get approval -> `publish`. Live render is ISR
(~5 min) so verify via admin API / preview pane, not the public URL immediately.
"""
import json, os, re, sys, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
BACKEND = (os.environ.get("BACKEND_ORIGIN")
           or "https://credsure-website-nextjs-production.up.railway.app").rstrip("/")
SITE = (os.environ.get("SITE_ORIGIN") or "https://credsure.io").rstrip("/")


def _token() -> str:
    t = os.environ.get("ADMIN_TOKEN", "").strip()
    if t:
        return t
    f = HERE / ".publish-token"
    return f.read_text().strip() if f.exists() else ""


TOK = _token()


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(f"{BACKEND}{path}", data=data, method=method,
                               headers={"Authorization": f"Bearer {TOK}",
                                        "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=600) as resp:
            return resp.status, json.loads(resp.read() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, {"error": (e.read() or b"").decode()[:200]}


def _link_status(path):
    """Return (http_status, is_noindex) for a site path."""
    try:
        h = urllib.request.urlopen(
            urllib.request.Request(SITE + path, headers={"User-Agent": "Mozilla/5.0"}),
            timeout=20)
        body = h.read().decode("utf-8", "ignore")
        return h.status, bool(re.search(r'name=["\']robots["\'][^>]*noindex', body, re.I))
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception:
        return 0, None


def strict_check(html):
    links = sorted(set(re.findall(r'href="(/(?:en|de)/[^"]+)"', html)))
    bad = []
    for u in links:
        code, ni = _link_status(u)
        ok = (code == 200 and ni is False)
        print(f"  {'OK ' if ok else 'BAD'} {code} noindex={ni}  {u}")
        if not ok:
            bad.append(u)
    return links, bad


def load(slug):
    f = HERE / f"update--{slug}.json"
    if not f.exists():
        sys.exit(f"missing {f.name}")
    return json.loads(f.read_text())


def main():
    if len(sys.argv) < 3:
        sys.exit("usage: seo_publish.py [check|preview|publish] <slug>")
    cmd, slug = sys.argv[1], sys.argv[2]
    if not TOK:
        sys.exit("no token (set ADMIN_TOKEN or .publish-token)")
    d = load(slug)
    print(f"[{cmd}] {slug} — strict link check (200 AND not noindex):")
    _, bad = strict_check(d.get("content_html", ""))

    if cmd == "check":
        print("ABORT-worthy bad links:" , bad or "none")
        return
    if cmd == "preview":
        pv = dict(d)
        pv["slug"] = f"{slug}-preview"
        pv["title"] = "[PREVIEW] " + d.get("title", "")
        pv["status"] = "draft"
        st, _ = api("GET", f"/api/admin/blogs/{slug}-preview")
        action = "PUT" if st == 200 else "POST"
        path = f"/api/admin/blogs/{slug}-preview" if st == 200 else "/api/admin/blogs"
        code, _ = api(action, path, pv)
        print(f"preview {action.lower()} -> {code}")
        if bad:
            print("WARNING: preview has bad links:", bad)
        print(f"review (admin editor preview pane, no cache) — slug: {slug}-preview")
        return
    if cmd == "publish":
        if bad:
            sys.exit(f"ABORT — bad internal links, not publishing: {bad}")
        print("publish ->", api("PUT", f"/api/admin/blogs/{slug}", d)[0])
        print("delete preview ->", api("DELETE", f"/api/admin/blogs/{slug}-preview")[0])
        _, g = api("GET", f"/api/admin/blogs/{slug}")
        p = g.get("post", g)
        print(f"verified: seo_title={p.get('seo_title')!r} | "
              f"desc_len={len(p.get('seo_description') or '')} | status={p.get('status')}")
        return
    sys.exit(f"unknown command: {cmd}")


if __name__ == "__main__":
    main()
