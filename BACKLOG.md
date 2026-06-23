# CredSure (Next.js) — Backlog

Open items for upcoming sessions. Newest context at top.

## 🟢 LIVE on credsure.io (cutover 2026-06-10)
The Next.js site on Vercel now serves `credsure.io` — the old Emergent/CRA site is replaced.
- DNS cut over in Cloudflare to Vercel, **DNS-only (grey cloud)**: apex `A → 76.76.21.21`, `www CNAME → cname.vercel-dns.com`. Confirmed `server: Vercel`, no `cf-ray`.
- `credsure.io` + `www.credsure.io` attached to the Vercel project (`prj_egig95cAXvefMpyb5xBE3c6VBBTm`, team `certif-id-international-gmb-h`). `www` → apex via **308** redirect.
- Full site test passed: all 62 routes 200, localized EN/DE content, blog API (126 EN posts) via Vercel→Railway proxy, cookie consent + Consent Mode, topic filter, sticky bar, exit intent, currency, analytics — all verified live in-browser.

---

## 🔎 Blog audit (2026-06-23)
Full-stack blog audit (frontend SSR/SEO/i18n + FastAPI backend), verified against the running app + production API. Overall healthy — SSR/SEO correct, filters work, sanitization in place, EN/DE i18n complete.

### ✅ Fixed — frontend (2026-06-23, shipped c4c2130)
- **Dead newsletter form on `/[locale]/blog`** — the "Stay Updated" CTA (`src/views/Blog.jsx`) had no `<form>`, no handler, an uncontrolled input and a no-op Subscribe button. Wired it to `/api/leads` (mirrors `InlineBlogCTA`, `source: "blog-index-newsletter"`) with success state. Verified live: captured POST + success render, no navigation.
- **Soft-404 on missing post slugs** — `blog/[slug]/page.tsx` returned HTTP 200 + perpetual spinner for unknown slugs (Google soft-404). Now calls `notFound()` when the post is null. Verified: bad slug → 404, real post → 200.

### ✅ Fixed — backend hardening + frontend polish (2026-06-23) — NEEDS RAILWAY DEPLOY to take effect
Backend changes verified by py_compile + a real `bleach` unit test of the sanitizer + import test of the shared limiter (full boot is healthcheck-gated on Railway). Fresh reviewer PASS.
- **Stored XSS — now sanitized on write.** New `backend/utils/sanitize.py` (`bleach==6.1.0`, allowlist mirrors the frontend `sanitize-html` config). Called in `admin/blogs.py` create+update and both `ai_blog.py` AI write paths. Defense-in-depth on top of the read-path sanitizer; also closes the gap that `blogApi.ts` never sanitized `content_html_de`.
- **View-ping rate-limited + deduped** (`blogs.py`) — `@limiter.limit("30/minute")` + per-IP+slug+hour dedupe via new `blog_view_dedupe` collection (only the first hit increments `view_count`). TTL index (2h, `created_at` as BSON Date) created in `server.py` startup. Limiter moved to shared `backend/utils/rate_limit.py` to avoid a circular import.
- **DE half-translation fixed** (`blogs.py`) — `has_de` now requires `title_de` AND `content_html_de`; DE branch uses truthy (`or`) fallbacks so an empty German field falls back to EN instead of serving a blank.
- **Regex injection / ReDoS** — `re.escape` + 100-char cap on admin search (`admin/blogs.py`).
- **`BlogPostUpdate.status` validated** (`models/blog.py`) — now has the `draft|published|scheduled` pattern.
- **AI generate endpoints rate-limited** — `@limiter.limit("20/hour")` on the 3 `ai_blog.py` generate endpoints (cost ceiling). **Editor access kept** (per decision) — editors can still delete/publish/generate.
- **Frontend:** search-filter crash guard (`Blog.jsx` — `(post.title||'')`); post-hero `<img>` now `loading="eager" fetchPriority="high"` for LCP (`BlogPost.jsx`).
- **Follow-up fix (62021cf):** the post-deploy smoke test caught that slowapi's `get_remote_address` returns Railway's **proxy IP** (shared/unstable), which made view-dedupe collapse distinct real users into one bucket (suppressing legit counts) and rate-limiting never trigger. Added `client_ip()` in `utils/rate_limit.py` (leftmost `X-Forwarded-For`, fall back to peer host); used for both the limiter key_func and the dedupe key.
- **✅ Verified live on Railway (2026-06-23):** clean startup (no `view-dedupe index error`); per-client dedupe works (fresh client IP → `counted:true` then `counted:false`); rate limit fires at 30/min keyed on the real client IP (`slowapi ... (78.145.129.123) exceeded`, 28×200 + 12×429); DE fallback `served_lang=de`; frontend soft-404 live (`credsure.io` bad slug → 404, real → 200).
- **Minor residual (noted):** `client_ip` uses the leftmost XFF entry, which is client-supplied; a determined attacker could rotate it to evade the view-dedupe/limit on this vanity metric. Acceptable for a view counter; revisit (trust only Railway-appended IP, or Mongo/Redis-backed limit storage for cross-replica limits) if it ever matters.

### ✅ Fixed — single-source blog translations + edit-aware re-translation (2026-06-23) — NEEDS RAILWAY DEPLOY for the backend half
The DB/API is now the single source of truth for blog translations (was a real correctness trap: the static `blog.json` catalog shadowed the DB, so CMS edits to German never rendered, and `<title>` could drift from `<h1>`).
- **Frontend:** `BlogCard`/`BlogPost` render `post.title`/`post.excerpt` straight from the API (the backend already serves them in the requested locale). Dropped the per-slug `t('${slug}.title')` catalog override and the now-dead `ScopedMessagesProvider`/`getBlogMessages` merge on both blog routes (removed the unused `getBlogMessages` export). **Verified live (SSR + client):** `/de/blog` cards + post `<h1>` render German from the API, `/en` English, chrome still localized (no missing-key leaks), console clean of new errors. Bonus: blog routes no longer ship the ~45 KB per-slug catalog.
- **Backend (deploys via Railway):** edit-aware dirty-tracking in `admin_update_blog` — when an editor changes English on an already-translated post, `retranslate_changed_fields` re-translates **only the changed German field(s)**. Never a blanket pass; existing untouched posts/fields are never re-translated; German edited in the **same save** is preserved. (Because English is the source of truth, a German field edited in a *prior* save will be refreshed the next time its English changes — intended.) Pure selection logic (`changed_en_fields`) unit-tested (7 cases); gated by `AI_FEATURE_AUTO_TRANSLATE`; swallows errors so a save never breaks; re-translated HTML is sanitized on write.
- **Auto-translate context (corrected):** the Anthropic key is configured in the **blog admin Settings** (resolved by `utils/llm_keys.py`: site_settings → env → legacy), so auto-translate is **live**: new posts get German on save; the existing 126 (both languages filled) hit the fill-missing no-op and stay untouched. (Supersedes the old "no LLM key on Railway" note.)
- **Follow-up cleanup (deferrable):** `blog.json` is now only read by `getGlobalMessages` to omit those slug keys from the global flight; it + that omit-logic can be deleted entirely in a later pass (touches the global i18n path, so kept out of this change).

### 🟡 Open — deliberately deferred (low value)
- **List endpoint omits `served_lang`/`date_modified`/`ai_generated`** — cards can't show an AI badge / "updated" date / per-card language; minor SEO/UX nicety vs the detail endpoint. Additive + low-risk, but no current consumer — do only on demand.

### ✅ Fixed — GtmScripts hydration mismatch → next/script (2026-06-23)
The GTM/PostHog loaders were raw inline `<script>` children of `<body>`; GTM/PostHog injected sibling `<script>`s that shifted positions → React hydration mismatch on **every page**, forcing a client re-render of the body (hurt LCP/TBT + every-page console error). Converted `src/components/AnalyticsScripts.tsx` to `next/script`: consent-default + gtm-loader `strategy="beforeInteractive"` (injected into `<head>`, run before hydration, in placement order — so the GDPR consent→GTM sequence is preserved), PostHog `strategy="afterInteractive"`. Suppressed the `no-before-interactive-script-outside-document` eslint warning (Pages-Router-only rule; App Router puts beforeInteractive in the root layout, which `[locale]/layout.tsx` is). **Verified live:** SSR HTML has consent-default before gtm-loader, `gtag`/`dataLayer`/`posthog` all functional, consent defaults to denied, and **zero console errors** (hydration mismatch gone) on homepage + blog post. Fresh reviewer PASS against the Next 16 docs.
- Note: the two `<script type="application/ld+json">` tags in `[locale]/layout.tsx` remain plain body children — inert (`ld+json` never executes, no sibling injection), so they don't reproduce the bug. Left as-is.

---

## 🔐 Security — rotate keys (priority, needs your dashboards)
De-tokenizing is done; **the already-exposed secrets still need rotating** (I can't — needs GitHub/Atlas/Supabase consoles):
1. **Rotate the GitHub PAT** (GitHub → Settings → Developer settings → Personal access tokens → revoke + regenerate). Also rotate Supabase + MongoDB keys if ever exposed, and the old `bilingual-lead-gen` Mongo password (exposed in chat; nothing depends on it now).
2. Move secrets out of `~/.claude/settings.json` into env vars / a secrets manager.
- ✅ Done this session: inline PAT stripped from the `origin` remote in **both** `credsure-website` and `credsure-website-nextjs` (Keychain holds the token now).

## 🧹 Housekeeping
- **Archive the old `credsure-website` (CRA)** — now safe: `credsure.io` serves the Next.js site, parity confirmed. The old repo is no longer referenced by DNS.

## ⚡ Performance (optional, push mobile to green)
Mobile PageSpeed **82** (LCP 3.5s, CLS 0, A11y/BP/SEO 100); **Desktop 99** (all green).
- ✅ Done this session: hero image is the mobile LCP element — added a homepage `<link rel="preload" as="image">` (responsive srcset) → **LCP 4.8s → 3.5s**.
- **Next lever (deliberate, mobile-only visual change):** gate the hero's `blur-3xl` animated mesh orbs behind a mobile breakpoint + `prefers-reduced-motion`. That's what holds TBT (300ms) and Speed Index (4.3s) back; freeing the main thread would likely push LCP under the 2.5s green line. Desktop (99) unaffected.

## 🧊 SSG / ISR for marketing pages (nice to have)
All app routes are dynamic (`ƒ`) — server-rendered on demand. The marketing pages (home, catch-all `[...slug]`) render from i18n JSON + static data, so their HTML is identical per request; recomputing it every hit is wasted work. Making them **static** (prerendered, edge-cached) would give lower TTFB globally (helps crawl speed/SEO), lower serverless cost, and better spike resilience — with no downside since the per-user bits (currency geo, cookie consent) are client-side.
- **How:** add `generateStaticParams` to enumerate routes (`routeConfig` × locales) so Next prerenders them (`○`). Keep the **blog on ISR** (already `revalidate` 5m/10m) — not pure static — so DB-published posts stay fresh without a redeploy.
- **Cost:** longer builds (~240 route×locale combos); must ensure no route uses a request-time API (`cookies()`/`headers()`) that forces dynamic.
- **Verdict:** polish, not a problem — the site already scores Desktop 99. Worth it if optimizing crawl/TTFB or serverless cost; fine to defer otherwise.

## ✨ Minor polish / SEO follow-ons
- **GSC: resubmit `/sitemap.xml`** in Search Console — it last fetched 01/06 (pre-fix, no blog posts). Resubmitting forces a re-read so Google discovers all 126 posts. Then let the "Discovered – currently not indexed" validation (started 10/06) run.
- **Dead CSS classes** on the hero — `hero-rise`, `hero-delay-*`, `hero-underline` are no-ops (animation CSS dropped in migration; underline still renders via `cs-hero-underline`). Tidy up.
- ~~**13 published posts have empty bodies**~~ — superseded: root-caused as a migration bug affecting **123 posts** (see "Blog bodies lost in migration" below).
- **GA4 verify:** confirm the `GTM-NSZF3Q8` container has its GA4 (`G-K0QTRESXBJ`) tags published — accept cookies, check GA4 Realtime. Code loads GTM correctly; tag publishing is a GTM-dashboard action.
- **Optional AI keys:** add `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` (Railway vars or admin Settings) for AI blog gen/images.
- German eyebrow: feature-page overview eyebrow falls back to EN "Why it matters"; add `features.overviewEyebrow` to the DE messages if a translation is wanted.

## ✅ DONE — Blog bodies restored (2026-06-18)
Ran `repair_blog_bodies.py --apply` against production Mongo via `railway run` (commit `33b54ee` deployed). **123 post bodies restored** from `blog_content.json` (10 already-healthy left untouched; 1 — `digitale-zertifikate-unternehmen` — has no recoverable source). Verified live: `/en/blog/digital-certificates-vs-digital-badges` now renders the full article (0 → 10,845 body chars). Migration bug also fixed at source in `migrate_blogs.py`.

## ✅ DONE — German blog bodies translated & published (2026-06-18)
All **126 posts now serve full German bodies** on `/de/blog/*` (verified: backend `served_lang=de` for 126/126, live spot-checks render German). Did NOT use the backend LLM pipeline (no key on Railway) — instead translated the bodies directly (parallel translators) into `backend/data/blog_content_de.json` (German mirror of `blog_content.json`), then published `content_html_de` + `title_de`/`excerpt_de` to Mongo via `scripts/apply_blog_de.py` (run with `railway run`, idempotent). To re-run or extend: edit `blog_content_de.json`, then `railway run python3 -m scripts.apply_blog_de --apply`.
- The unused `backfill_blog_translations.py` (backend-LLM path) remains as an alternative if an `ANTHROPIC_API_KEY` is ever added to Railway.

## ~~🩹 Blog bodies lost in migration — restore from source~~ (DONE above)
**Root cause found (2026-06-18):** `backend/scripts/migrate_blogs.py` read each scraped section's body from a field named `paragraphs`, but `backend/data/blog_content.json` stores body text in **`content`**. The mismatch dropped every paragraph on import — so **123 of 126 posts render as headings-only (110) or empty (13)**; only the 3 posts sourced from `blog_posts_bilingual.json` have real bodies. The text is intact in `blog_content.json` (~650K chars) → fully recoverable.
- **Fixed the migration bug** in `migrate_blogs.py` (now reads `content`) so a re-migration can't repeat it (`<commit>`). The live DB still has the broken bodies, though (migration is insert-once / idempotent-guarded).
- **Repair script written (not run):** `backend/scripts/repair_blog_bodies.py` — dry-run default, idempotent; rebuilds `content_html` from `blog_content.json` for "thin" posts only (skips the 3 healthy ones), `--apply` to write. Locally verified it restores e.g. `digital-certificates-vs-digital-badges` from 0 → ~10.8K body chars.
  ```bash
  python -m scripts.repair_blog_bodies              # dry run
  python -m scripts.repair_blog_bodies --apply      # restore EN bodies
  ```
- **Order matters:** run THIS repair first, THEN `backfill_blog_translations.py --apply` — otherwise the DE translation would translate bare headings.

## 🌍 i18n — translate blog posts to German (needs Railway run)
The static site is now fully EN/DE, but the **blog content is ~98% English-only**: of 126 posts, only **3 have German** — `/de/blog/*` falls back to English for the other **123** (the backend serves `served_lang: en`). Dry run confirmed the 123 candidates (slug list in the commit + transcript 2026-06-18).
- **Script ready (not yet run):** `backend/scripts/backfill_blog_translations.py` — dry-run default, idempotent, writes the six `*_de` fields via the existing `translate_fields` pipeline (Claude Sonnet 4.5). Lazy-imports the LLM stack so dry-run needs no provider SDK.
- **Run it in the Railway backend** (where `MONGO_URL`/`DB_NAME` + LLM key live; local macOS can't — no Mongo creds + Python 3.9 < the 3.10 the AI module needs):
  ```bash
  python -m scripts.backfill_blog_translations              # dry run — re-confirm 123
  python -m scripts.backfill_blog_translations --apply --limit 1   # translate ONE, eyeball it
  python -m scripts.backfill_blog_translations --apply             # full run (~6 LLM calls/post)
  ```
- **Caveats:** machine-translated → spot-review before relying on it; costs LLM tokens; writes to the live DB. After it runs, `/de/blog/*` serves German and the sitemap auto-emits `de` hreflang for translated posts.

---

## ✅ Done — German pages rendering English (i18n) (2026-06-18)
Reported: `/de/digitale-badges` (and many pages) showed English despite German URLs. Root cause was **not** the message data (EN/DE key parity was already exact, 1416 keys) — ~25 view/components **hardcoded English in JSX and bypassed next-intl entirely**. The original route audit also missed two classes: the **homepage** (not a `routeConfig` route) and **shared child components** (`CustomerCard`, `SolutionEnrichment/FAQ`). (`f5b2f98`)
- Migrated all user-visible copy into **12 locale-isolated message files** (`src/messages/{en,de}/*-extra.json`: solutions/templates/resources/pages/misc/homepage), deep-merged via `src/i18n/request.ts`. Read back through `useTranslation()` / `t(key, { returnObjects: true })`. **English byte-identical; German added.**
- Fixed ~42 public routes + homepage: solution/feature/use-case shared templates (repairs 26+ routes), DigitalBadges, compare/*, Integrations, Guides, Webinars, Tutorials, Templates, CustomerSuccess, ROICalculatorPage, Demo, Blog filter UI, SignIn, PoliciesTerms chrome, plus homepage IndustryUseCases / Testimonials2026 / Features2026 / BeameryPlatform pillars (added `platformPillars.{issue,verify,govern,insights}`) / G2Badges / CustomerCard.
- Verified: `next build` passes, EN/DE parity exact, live `/de` render checks show no English leftovers, `/en` unchanged, fresh reviewer PASS.
- **Follow-up same day (`0d22e05`) — two more issues found in the wild:**
  - **Main-nav routed German pages to `/en/*`** — `HeaderWithMegaMenu` read `useParams().lang`, but the segment is `[locale]`, so the param is `locale` and `lang` was always `undefined` → `currentLang` pinned to `'en'`. Also both the header handler and `useLocalizedNavigate` only *prefixed* the locale without translating the slug. Both now read `locale` and use `localePath()` → nav lands on the translated German slug (`/de/funktionen/digitale-zertifikate`, `/de/plattform`). Verified live (mega-menu click).
  - **Feature pages + Platform showed English body copy on `/de`** — `FeaturePageTemplate` + `Platform.jsx` pull description/useCases/faq/metrics + platform stats/how-it-works from the **static English `src/data/featureContent.js`**, never localized (my view-only batches didn't touch `src/data/`). Added German overrides in `messages/de/feature-content-extra.json` (`featx` namespace), read via `t(key,{returnObjects,defaultValue})` so EN still comes from the data file unchanged. Verified live.
- **Open follow-ons:**
  - **Run the blog backfill** — `backend/scripts/backfill_blog_translations.py` (dry-run default, idempotent, `--apply` to write) translates the ~123 English-only blog posts to German via the existing `translate_fields` pipeline. Written this session, **not yet run**. `/de/blog/*` still falls back to English until run.
  - **Terms/MSA legal body still English on `/de`** — page chrome is German, but the contract clauses in `src/data/msa` (`MSA_SECTIONS`) were intentionally left English. The German chrome is **machine-translated and flagged in-code for legal review**. Get a human/legal pass before relying on any German legal copy.

## ✅ Done — favicon + mobile spacing (2026-06-15)
Three reported homepage issues, all fixed and verified live on `credsure.io` (`6e1b3ec`, deploy `dpl_4baPwo…`):
- **Favicon was the stock `create-next-app` icon** (black circle/white triangle) — `src/app/favicon.ico` (App Router metadata file) shadowed the real brand `public/favicon.ico`, so the live `<link>` pointed at the Next default with a broken `sizes="256x256"`. Swapped the brand icon into `src/app/favicon.ico`, added `src/app/apple-icon.png` (now emits `<link rel="apple-touch-icon">`, was absent), removed the duplicate `public/favicon.ico`. Live link now `sizes="32x32"` + apple-touch present.
- **Oversized mobile spacing (site-wide)** — 16 section components used `py-24/28/32` (96–128px) on mobile; set the mobile base to `py-16` (64px) across all of them, **preserving every desktop `md:` value**. Hero top padding `pt-28`→`pt-12` (112px→48px) to tighten the nav→hero gap (h1 top 246px→182px on a 375px viewport).
- **The big mobile gaps in the screenshot** — `system/ProductUIWindow` hardcoded `minHeight: 420px` at *all* breakpoints, letterboxing the short landscape product mocks with ~250–290px of dead space on mobile. Gated the reserve to `md+` only (no CLS — the mock `<img>`s carry `width`/`height`); removed the redundant inner inline `minHeight:420` in `Features2026` + `ProductShowcase`. Dead space per panel ~290px→~32px on mobile; desktop 420px reserve unchanged.
- **Side fix:** `next.config.ts` now pins `turbopack.root` to the project dir — a stray `~/package-lock.json` was making Next infer the home dir as the workspace root, 404ing `/en` in local dev. (Underlying cause: delete that stray lockfile when convenient.)

## ✅ Done — footer heyData seal (2026-06-10)
- **heyData GDPR privacy seal in the footer** — mirrors the trust badge on `talentsure.de`. Added to the bottom-bar trust cluster (next to the Vanta badge): an `<a>` to `heydata.eu` wrapping the seal `<img>` from `api.heydata.eu/privacy-seal/seal/{id}`. Reuses the Certif-ID International GmbH seal (same legal entity as TalentSure); `lang` param follows the active locale (`en`/`de`). Verified rendering on both locales locally (real SVG, correct 406×226 aspect → no CLS). (`a59cb3e`)

## ✅ Done — SSR/SEO hardening (2026-06-10)
Audited how much of the site actually uses Next's SSR (the CRA→Next migration left a lot client-only) and closed the gaps:
- **Blog "Discovered – currently not indexed"** (GSC, 128 pages) — posts were absent from the sitemap AND `blog/[slug]` was `ssr:false` + no metadata. Sitemap now emits all 126 posts (hreflang `de` only when translated); `blog/[slug]` is a server component with `generateMetadata` + SSR body via pure-JS `sanitize-html` (jsdom failed on Vercel). (`2c5a25d`, `dfb2c07`)
- **Header + Footer SSR** — were `ssr:false` (blanket migration default), so the mega-menu + footer link graph was absent from server HTML. Audited safe, switched to static imports. (`d698eda`)
- **`/blog` index SSR + metadata** — was `ssr:false`/client-fetch with a generic title; now a server component (`generateMetadata` + `getBlogList`, ISR 5m, seeds `Blog` via `initialPosts`). (`d698eda`)
- **Per-page JSON-LD server-side** — `SEO.jsx`/`StructuredData.jsx` rendered JSON-LD via react-helmet with no provider (no-op). Switched to plain `<script>` → Article/BreadcrumbList/FAQPage/Speakable now in SSR HTML; removed the `react-helmet-async` dependency; 404 `noIndex` now works. (`ac345fb`)
- **Header logo → next/image** — every-page logo now optimizer-served (AVIF, right-sized) with priority. Other raw `<img>` left as-is on purpose (dead/admin/external-billing/already-optimized). (`567b0df`)

## ✅ Done — go-live session (2026-06-10)
- **Domain cutover** to Vercel + `www→apex` 308 redirect; domains attached to the project.
- **Restored 5 global mounts** dropped in the CRA→Next migration (all were defined but never rendered):
  - `StickyBottomBar` (demo bar) + `ExitIntentPopup` (`30a4703`, `aaacd03`)
  - `CurrencyProvider` (geo $/£/€ on pricing + ROI), `ScrollToTop` (GA4 SPA pageviews + scroll reset), `SkipLinks` (WCAG) (`26cece6`)
- **Blog topic filter** — `onToggleTopic` was a dead prop (no click handler); wired it (`30a4703`). Verified: filters results live.
- **Analytics restored** — GTM (`GTM-NSZF3Q8`) + GA4 (`G-K0QTRESXBJ`) + PostHog (`phc_xAvL2Iq4…`) loaders were never migrated from the old `index.html`; added `AnalyticsScripts.tsx` (Consent Mode v2 default → GTM → deferred PostHog) (`0fd24d2`). Verified consent flow flips storage to `granted` on accept.
- **Currency geo-detection** made robust to Cloudflare proxy mode — fell back to ipapi only on a failed `/cdn-cgi/trace`; now falls back whenever `loc=` is absent (works DNS-only) (`9c205a4`). Verified GB → £.
- **Feature description band** restyled as an editorial lead (gradient "Why it matters" eyebrow, 22px copy, purple payoff line, gradient hairline) — one shared template, all feature pages (`581dd36`).
- **Hero image preload** → mobile LCP 4.8s → 3.5s (`1d8d1ff`).
- **Blog SEO — fixed GSC "Discovered – currently not indexed"** (128 pages, mostly `/de/blog/*`). Root cause: posts were absent from the sitemap AND `blog/[slug]` was `"use client"` + `ssr:false` with no metadata (generic root title, no canonical/hreflang, JS-only body). (`2c5a25d`, `dfb2c07`)
  - Sitemap now async + emits all 126 published posts with `de` hreflang only when a translation exists (`title_de`). 57 → 183 URLs.
  - `blog/[slug]/page.tsx` → server component with `generateMetadata`: per-post title, description, self-canonical, hreflang (en/de/x-default), Article OG/Twitter. DE posts that fall back to EN content (`served_lang='en'`) canonicalize to EN.
  - SSR the article body: page server-fetches the post and seeds `BlogPost` via an `initialPost` prop. **Gotcha:** `isomorphic-dompurify`'s jsdom worked under `next start` but silently failed in Vercel's serverless runtime → body fell back to client-only (caught by diffing raw SSR HTML vs post-hydration DOM). Fixed by sanitizing server-side with pure-JS `sanitize-html` in `lib/blogApi.ts` (cache()'d, ISR 5m/10m). Verified body in raw SSR HTML on live.
- Git remotes de-tokenized (both repos).

## ✅ Done — earlier (pre-cutover, 2026-06-09→10)
- Google OAuth login fixed (`/en/admin` crash — `useSearchParams` shim shape + `<Suspense>`) (`d5d12ea`); Railway vars set; verified 302 → accounts.google.com.
- Footer GDPR badge self-hosted — was on `customer-assets.emergentagent.com`, now `/public/images/badges/gdpr-light.svg` (`529bf8c`).
- CORS allowlist — dead Emergent origin regex replaced with Vercel preview pattern + prod origin (`1ccb874`).

---

## ✅ Done — migration session (2026-06-08)
- Brand gradient system restored (`beamery-system.css` was never imported)
- react-i18next inline-default translations restored (126 strings, `useTranslation` wrapper)
- Catch-all locale route — entire German site + missing pages (webinars/contact/customer-success) were 404ing
- `LocalizedLink` `/enundefined` bug — every nav link was broken site-wide
- `useNavigate` returned the router object instead of a callable function — broke mega-menu, CTAs, language switcher, breadcrumbs
- PageSpeed: Accessibility 94→100, SEO 92→100, CLS→0

## ✅ Done — De-Emergent migration (2026-06-08)
- **AI LLM keys**: `EMERGENT_LLM_KEY` → provider keys (`utils/llm_keys.py`); admin "AI / API Keys" page. Anthropic = blog gen/translation, OpenAI = images.
- **Storage**: Emergent object store → MongoDB GridFS (`utils/storage.py`). 0 images existed to migrate.
- **Auth (code)**: Emergent OAuth → direct Google OAuth (`routes/google_auth.py`). Admin SPA routed (`[locale]/admin`, `[locale]/invite/[token]`).
- **Blog content migrated**: 133 posts (126 published + 7 drafts) + site_settings + 5 users + 1 invite → new Atlas. DE translations intact, umlauts preserved.
- **Railway↔Atlas**: fixed (Atlas Network Access `0.0.0.0/0`).
- **Vercel blog fetch**: client uses relative `/api/*` (Vercel proxy → Railway).
- **Temp Emergent export endpoint**: removed (404 verified).

---

## 🗄️ Obsolete
- ~~Visual A/B vs the live old `credsure.io` (CRA)~~ — moot: `credsure.io` is now the Next.js site; there's no live old site left to diff against.
- ~~Footer GDPR badge on Emergent~~ — done (`529bf8c`).
- ~~CORS allowlist references Emergent~~ — done (`1ccb874`).
