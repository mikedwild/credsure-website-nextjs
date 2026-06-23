#!/usr/bin/env python3
"""Set every blog post's author to a single value (default "CredSure Team").

The blog was seeded with fictional author names (Prof. James Whitfield, Laura
Bergmann, Michael Chen, etc.). This normalises them. Author-only PUTs are fast:
they don't change any English content field, so the update handler does not
re-translate the German side.

Lists posts via the admin API (so drafts are included too), then PUTs only the
author field for any post whose author differs from the target. Dry run by
default; pass --apply to send. Stdlib only.

Env:
  BACKEND_ORIGIN   e.g. https://credsure-website-nextjs-production.up.railway.app
  ADMIN_TOKEN      admin JWT (bearer) — required with --apply
  AUTHOR           target author (default "CredSure Team")
"""
import json
import os
import sys
import urllib.request
import urllib.error

BACKEND = os.environ.get("BACKEND_ORIGIN", "").rstrip("/")
TOKEN = os.environ.get("ADMIN_TOKEN", "")
TARGET = os.environ.get("AUTHOR", "CredSure Team")
APPLY = "--apply" in sys.argv


def req(method, path, body=None):
    url = f"{BACKEND}{path}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    if TOKEN:
        r.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        with urllib.request.urlopen(r, timeout=120) as resp:
            return resp.status, json.loads(resp.read() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, {"error": (e.read() or b"").decode()[:200]}
    except Exception as e:  # noqa: BLE001
        return 0, {"error": str(e)}


def list_all():
    """Page through the admin listing to collect every post (incl. drafts)."""
    posts, page = [], 1
    while True:
        status, data = req("GET", f"/api/admin/blogs?page={page}&limit=100")
        if status != 200:
            print(f"List failed (page {page}): http={status} {data.get('error','')}")
            break
        batch = data.get("posts", data if isinstance(data, list) else [])
        if not batch:
            break
        posts.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return posts


def main():
    if not BACKEND:
        print("ERROR: set BACKEND_ORIGIN")
        return 2
    if not TOKEN:
        print("ERROR: set ADMIN_TOKEN (needed even for the dry-run listing)")
        return 2

    print(f"Backend: {BACKEND}")
    print(f"Target author: {TARGET!r}")
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (use --apply to send)'}\n")

    posts = list_all()
    todo = [p for p in posts if (p.get("author") or "").strip() != TARGET]
    print(f"{len(posts)} posts total, {len(todo)} need updating.\n")

    for p in todo:
        slug = p.get("slug")
        cur = p.get("author") or "(none)"
        if not APPLY:
            print(f"[dry] {slug:48} {cur!r} -> {TARGET!r}")
            continue
        status, data = req("PUT", f"/api/admin/blogs/{slug}", {"author": TARGET})
        ok = status == 200
        print(f"[{'OK ' if ok else 'ERR'}] {slug:48} {cur!r} -> {TARGET!r}  http={status} {data.get('error','')}")
    if not APPLY:
        print("\nDry run complete. Re-run with --apply to update.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
