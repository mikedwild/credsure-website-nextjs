#!/usr/bin/env python3
"""Idempotent publisher for the SEO blog build.

Reads every `create--*.json` (BlogPostCreate body) and `update--*.json`
(BlogPostUpdate body, filename stem after `update--` is the target slug) in this
directory and pushes them through the auth-gated admin API:

  create--<slug>.json  ->  POST /api/admin/blogs   (falls back to PUT on 409)
  update--<slug>.json  ->  PUT  /api/admin/blogs/<slug>

Why the admin API and not a raw Mongo write: the API sanitizes HTML, auto-
translates missing German, dedupes slugs, and snapshots revisions. Raw writes
skip all of that.

Dry run by default. Pass --apply to actually send requests. Stdlib only.

Env:
  BACKEND_ORIGIN   e.g. https://credsure-website-nextjs-production.up.railway.app
  ADMIN_TOKEN      admin JWT (bearer) — required only with --apply
"""
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

HERE = Path(__file__).parent
BACKEND = os.environ.get("BACKEND_ORIGIN", "").rstrip("/")
TOKEN = os.environ.get("ADMIN_TOKEN", "")
APPLY = "--apply" in sys.argv


def _req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if TOKEN:
        req.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, {"error": (e.read() or b"").decode()[:300]}
    except Exception as e:  # noqa: BLE001
        return 0, {"error": str(e)}


def publish_create(slug, body):
    status, resp = _req("POST", f"{BACKEND}/api/admin/blogs", body)
    if status == 409:  # already exists -> update instead
        status, resp = _req("PUT", f"{BACKEND}/api/admin/blogs/{slug}", body)
        return "updated (existed)", status, resp
    return "created", status, resp


def publish_update(slug, body):
    status, resp = _req("PUT", f"{BACKEND}/api/admin/blogs/{slug}", body)
    return "updated", status, resp


def main():
    creates = sorted(HERE.glob("create--*.json"))
    updates = sorted(HERE.glob("update--*.json"))
    if not creates and not updates:
        print("No create--*.json / update--*.json files found.")
        return 1

    print(f"Backend: {BACKEND or '(unset!)'}")
    print(f"Mode:    {'APPLY' if APPLY else 'DRY RUN (use --apply to send)'}")
    print(f"Token:   {'present' if TOKEN else 'MISSING'}")
    print(f"Files:   {len(creates)} create, {len(updates)} update\n")

    if APPLY and (not BACKEND or not TOKEN):
        print("ERROR: --apply needs BACKEND_ORIGIN and ADMIN_TOKEN.")
        return 2

    plan = []
    for f in creates:
        body = json.loads(f.read_text())
        plan.append(("POST", body["slug"], f.name, body))
    for f in updates:
        slug = f.stem[len("update--"):]
        body = json.loads(f.read_text())
        plan.append(("PUT", slug, f.name, body))

    for verb, slug, name, body in plan:
        title = body.get("title", "(no title change)")
        if not APPLY:
            print(f"[dry] {verb:4} {slug:48} <- {name}  | {title[:50]}")
            continue
        if verb == "POST":
            action, status, resp = publish_create(slug, body)
        else:
            action, status, resp = publish_update(slug, body)
        ok = status in (200, 201)
        flag = "OK " if ok else "ERR"
        print(f"[{flag}] {action:18} {slug:40} http={status} {resp.get('error','')}")
    if not APPLY:
        print("\nDry run complete. Re-run with --apply (and ADMIN_TOKEN) to publish.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
