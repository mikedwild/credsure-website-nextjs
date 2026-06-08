# CredSure (Next.js) — Backlog

Open items for upcoming sessions. Newest context at top.

## 🔐 Security — rotate & de-token (priority)
Live credentials are sitting in plaintext and the GitHub PAT is duplicated across several places:
- `~/.claude/settings.json` — GitHub PAT, Supabase access token, MongoDB keys (plaintext)
- `.git/config` in **both** `credsure-website` and `credsure-website-nextjs` — PAT embedded in the `origin` remote URL (`https://ghp_…@github.com/…`)

**To do:**
1. Rotate the GitHub PAT (GitHub → Settings → Developer settings → Personal access tokens → revoke + regenerate). Also rotate Supabase + MongoDB keys if they were ever exposed.
2. Strip the inline token from both repos' remotes:
   `git remote set-url origin https://github.com/mikedwild/credsure-website-nextjs.git`
   (and same for `credsure-website`), then let macOS Keychain / a git credential helper hold the new token.
3. Move secrets out of `~/.claude/settings.json` into env vars / a secrets manager.

## 🎨 Visual A/B vs credsure.io (blocked)
Full pixel-level page-by-page design comparison between `credsure-website-nextjs.vercel.app` and the live `credsure.io` (old CRA site) is still pending. **Blocker:** the Claude-in-Chrome extension refuses to drive `credsure.io` ("Navigation to this domain is not allowed") even after granting Chrome host permission — it's the extension's own agent-domain policy. Need to unblock that (extension site-access settings) before automating the diff.

## ⚡ Performance (optional, push to 90+)
Mobile PageSpeed is ~82–86 (Accessibility/SEO/Best-Practices all 100, CLS 0). Remaining lever is LCP (~4.1–4.6s) — gated on font-display tuning, render-blocking CSS/JS, and bundle code-splitting, not images. Higher-risk pass; do deliberately.

## 🧹 Housekeeping
- Archive the stale `credsure-website` (old CRA, last touched May 27) once the Next.js site is confirmed at parity. `credsure.io` still serves the old one, so keep until cutover.

---

## ✅ Done (this migration session, 2026-06-08)
- Brand gradient system restored (`beamery-system.css` was never imported)
- react-i18next inline-default translations restored (126 strings, `useTranslation` wrapper)
- Catch-all locale route — entire German site + missing pages (webinars/contact/customer-success) were 404ing
- `LocalizedLink` `/enundefined` bug — every nav link was broken site-wide
- `useNavigate` returned the router object instead of a callable function — broke mega-menu, CTAs, language switcher, breadcrumbs
- PageSpeed: Accessibility 94→100, SEO 92→100, CLS→0
