<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 — verify APIs against the bundled docs

This project runs **Next.js 16** (App Router) with `next-intl` for i18n. It's standard Next.js, but version 16 changed several App Router APIs that older training data gets wrong. The matching docs ship inside the install at `node_modules/next/dist/docs/` — prefer them over memory when touching framework code.

Check the bundled docs before writing code that uses:
- **async `params` / `searchParams`** — these are Promises in Next 16; you must `await` them in pages, layouts, and route handlers.
- **Cache Components** — `'use cache'`, `cacheLife`, `cacheTag` (replaces older `unstable_cache` patterns).
- **`proxy` / middleware** and other request-time APIs.

Heed deprecation notices.

> Note: this block is scaffolded by `create-next-app` (markers above). Re-running the scaffold may overwrite it.
<!-- END:nextjs-agent-rules -->
