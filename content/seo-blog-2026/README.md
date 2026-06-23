# SEO Blog Build — 2026 (Phases 1–4)

Publish-ready blog content + tooling, grounded in Ubersuggest SERP analysis of
credsure.io (DA 53, ~960 organic visits/mo, content stuck on page 2–3).

## Why this folder exists

Live blog posts are stored in **MongoDB**, served by the FastAPI backend
(`backend/routes/blogs.py`) and rendered by `src/app/[locale]/blog/[slug]/page.tsx`.
They are **not** files in the repo. Creating/editing a post means going through the
admin dashboard (`src/views/admin/AdminBlogEditor.jsx`) or POSTing to the
auth-gated `/api/admin/blogs` API.

This folder holds each new/updated post as an **import-ready JSON payload** that
matches the `BlogPostCreate` / `BlogPostUpdate` schema (`backend/models/blog.py`),
so they can be published in one command (`publish.py`) or pasted into the editor.

## The content plan (each file = one post)

| File | Action | Target keyword | Vol/mo | Role |
|---|---|---|---|---|
| `update--what-are-digital-badges.json` | UPDATE | what is a digital credential | — | Phase 1 refresh (ranks #72) |
| `create--verifiable-credentials-explained.json` | CREATE | verifiable credentials | 9,900 | **Phase 2 PILLAR** |
| `create--best-digital-credentialing-platforms-2026.json` | CREATE | digital credentials platform (cluster) | ~hundreds, $26 CPC | Phase 3 revenue listicle |
| `create--open-badges-explained.json` | CREATE | open badges | 6,600 | Phase 4 spoke |
| `create--digital-badges-for-students-and-universities.json` | CREATE | digital badges for students | 170+ | Phase 4 spoke |
| `create--how-to-verify-degrees-and-diplomas-online.json` | CREATE | degree/diploma verification online | 140–8,100 | Phase 4 spoke |

All spokes link **up** to the pillar (`/en/blog/verifiable-credentials-explained`)
and across to siblings — that internal-link cluster is the main lever for a DA-53
site to outrank thinner competitors (dock.io DA 46, certifier DA 37, etc.).

## German (DE)

Posts are authored in English. The create API auto-translates missing German
(`_auto_translate_missing` in `backend/routes/admin/blogs.py`) using the configured
LLM. **Review the auto-generated DE** in the editor before/after publishing.

## How to publish (fixes the stale-seed problem)

`migrate_blogs.py` is one-shot (skips if any posts exist) and the committed seed is
stale. `publish.py` is the repeatable path — it POSTs/PUTs each JSON file through the
admin API (so HTML is sanitized and revisions are kept).

```bash
# dry run (default): shows what would happen, changes nothing
BACKEND_ORIGIN=https://credsure-website-nextjs-production.up.railway.app \
ADMIN_TOKEN=<your admin JWT> \
python3 content/seo-blog-2026/publish.py

# actually publish
... ADMIN_TOKEN=<jwt> python3 content/seo-blog-2026/publish.py --apply
```

Get `ADMIN_TOKEN` by logging into the admin dashboard and copying the bearer token,
or via the auth endpoint. Posts are created as `status: "draft"` — flip to
`published` in the dashboard after a final read.

## Refresh the stale seed file from live

```bash
BACKEND_ORIGIN=https://... python3 content/seo-blog-2026/export_live_to_seed.py
```
Pulls the live published posts (public API, no auth) and writes a lossless
snapshot to `backend/data/blog_posts_live_export.json` so the repo has an
up-to-date, version-controlled copy of production content. It does not clobber the
original seed (whose field names differ).
