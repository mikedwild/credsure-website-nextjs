#!/usr/bin/env python3
"""Restore the clean body HTML for the SEO posts.

The live DB copies of these posts were mangled by an HTML round-trip (the
translation LLM and/or the Quill editor): the comparison table's <thead>/<th>
collapsed into a single cell and every space became &nbsp;, which broke layout
and pushed text off the page. The local create--*.json / update--*.json files
still hold the clean source.

This re-PUTs ONLY content_html (the clean local copy) for each post — it does
NOT touch status, so published posts stay published. The update handler keeps
content_html as-sent (it's in the payload), the deployed sanitizer strips any
nbsp, and German is retranslated from the clean English.

Dry run by default; pass --apply. Needs ADMIN_TOKEN + BACKEND_ORIGIN.
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


def put(slug, body):
    data = json.dumps(body).encode()
    r = urllib.request.Request(
        f"{BACKEND}/api/admin/blogs/{slug}", data=data, method="PUT")
    r.add_header("Content-Type", "application/json")
    r.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        with urllib.request.urlopen(r, timeout=600) as resp:
            return resp.status, json.loads(resp.read() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, {"error": (e.read() or b"").decode()[:200]}
    except Exception as e:  # noqa: BLE001
        return 0, {"error": str(e)}


def main():
    if not BACKEND or (APPLY and not TOKEN):
        print("Set BACKEND_ORIGIN, and ADMIN_TOKEN for --apply.")
        return 2

    files = sorted(HERE.glob("create--*.json")) + sorted(HERE.glob("update--*.json"))
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN'} | {len(files)} posts\n")

    for f in files:
        body = json.loads(f.read_text())
        slug = body.get("slug") or f.stem[len("update--"):]
        html = body.get("content_html", "")
        if not html:
            print(f"[skip] {slug}: no content_html in source")
            continue
        nbsp_local = "&nbsp;" in html
        if not APPLY:
            print(f"[dry] PUT content_html ({len(html)} chars, local nbsp={nbsp_local}) -> {slug}")
            continue
        status, data = put(slug, {"content_html": html})
        ok = status == 200
        print(f"[{'OK ' if ok else 'ERR'}] {slug:48} http={status} {data.get('error','')}")
    if not APPLY:
        print("\nDry run complete. Re-run with --apply (retranslates German; allow a few minutes).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
