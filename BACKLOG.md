# CredSure (Next.js) — Backlog

Open items for upcoming sessions. Newest context at top.

## 🟢 LIVE on credsure.io (cutover 2026-06-10)
The Next.js site on Vercel now serves `credsure.io` — the old Emergent/CRA site is replaced.
- DNS cut over in Cloudflare to Vercel, **DNS-only (grey cloud)**: apex `A → 76.76.21.21`, `www CNAME → cname.vercel-dns.com`. Confirmed `server: Vercel`, no `cf-ray`.
- `credsure.io` + `www.credsure.io` attached to the Vercel project (`prj_egig95cAXvefMpyb5xBE3c6VBBTm`, team `certif-id-international-gmb-h`). `www` → apex via **308** redirect.
- Full site test passed: all 62 routes 200, localized EN/DE content, blog API (126 EN posts) via Vercel→Railway proxy, cookie consent + Consent Mode, topic filter, sticky bar, exit intent, currency, analytics — all verified live in-browser.

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

## ✨ Minor polish / SEO follow-ons
- **GSC: resubmit `/sitemap.xml`** in Search Console — it last fetched 01/06 (pre-fix, no blog posts). Resubmitting forces a re-read so Google discovers all 126 posts. Then let the "Discovered – currently not indexed" validation (started 10/06) run.
- Per-page blog **Article JSON-LD** still client-side via SEO.jsx/react-helmet (no HelmetProvider → effectively a no-op server-side). The blog `<title>`/canonical/hreflang are now server-rendered (see Done), but the Article schema isn't in the SSR HTML — emit it from `blog/[slug]/page.tsx` for the full win.
- **`/blog` list page** still emits the generic root title server-side (only `blog/[slug]` got `generateMetadata`). Add metadata for the list page too.
- **Dead CSS classes** on the hero — `hero-rise`, `hero-delay-*`, `hero-underline` are no-ops (animation CSS dropped in migration; underline still renders via `cs-hero-underline`). Tidy up.
- **13 published posts have empty bodies** (old certif-id press releases) — fill or unpublish.
- **GA4 verify:** confirm the `GTM-NSZF3Q8` container has its GA4 (`G-K0QTRESXBJ`) tags published — accept cookies, check GA4 Realtime. Code loads GTM correctly; tag publishing is a GTM-dashboard action.
- **Optional AI keys:** add `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` (Railway vars or admin Settings) for AI blog gen/images.
- German eyebrow: feature-page overview eyebrow falls back to EN "Why it matters"; add `features.overviewEyebrow` to the DE messages if a translation is wanted.

---

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
