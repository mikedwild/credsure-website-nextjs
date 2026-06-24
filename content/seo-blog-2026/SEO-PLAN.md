# CredSure — Page-1 SEO Plan (2026-06)

Data source: Ubersuggest (US, locId 2840), pulled 2026-06-24.

## Diagnosis
- **DA 53** — higher than every direct competitor (certifier.io 37, sertifier.com 34, virtualbadge.io 25), yet ~959 traffic/mo vs their 10k–125k. **Not a backlink/authority problem.**
- **0 keywords in positions 1–3** (entire history). ~47 in pos 4–10 (low volume). 173 total keywords vs competitors' 8k–24k.
- Traffic comes from off-topic pages (certificate-of-appreciation wording, linkedin student profile), not credentialing. Product pages (/solutions/digital-badges, 50 backlinks) rank for nothing.
- Old /blogs/ pages had duplicate generic titles ("Digital Credential Platform — Blockchain Verified"). Fixed by /en/blog migration + 301s (shipped 2026-06) — awaiting recrawl.
- GSC/GA not connected in Ubersuggest → no query/CTR feedback loop.
- No free tools/templates — the #1 competitor traffic driver.

## Competitor playbook (what's actually winning)
High-volume, LOW-difficulty utility/definitional content, not product terms:
- certifier.io: "certificate template" (9900), "signature font" (8100, pd 11), "certificate generator" (2900), dozens of "[X] certificate template" pages (pd 1–3, pos 2).
- sertifier.com: "badging meaning" (4400, pd 1, pos 5), "canva certificate templates" (4400), "certificate of completion" (8100).

## Plan

### Phase 0 — Foundation (week 1–2, unblock everything)
1. **Set up & verify Google Search Console + GA4** (USER action). Submit sitemap. Watch the /blogs→/en/blog migration (old URLs drop, new index). This is the #1 gap — currently blind.
2. Verify redirects in GSC coverage; confirm /en/blog pages index with the new titles + JSON-LD.
3. **Unique titles/meta site-wide** — audit every /solutions, /features, /platform, /pricing page for the duplicate generic title; give each a unique, keyword-targeted title + meta description.
4. **Product/solution pages: SSR + schema** — ensure they render server-side with Product/Service/SoftwareApplication JSON-LD (mirror the blog work).
5. **Internal links** from high-authority pages (certificate-of-appreciation page = 46 ref domains; /solutions/digital-badges = 50 backlinks) into the money pages.

### Phase 1 — Keyword targeting (the "right keywords")
- **Commercial (convert):** digital credentialing platform, digital credential service ($24 CPC), certification badges (480), digital badge software, issue digital certificates, open badge platform, + **competitor-alternative pages** (credly alternative, accredible alternative, certifier alternative).
- **Definitional (topical authority):** what is a digital credential, what is badging (4400, pd 1), micro-credentials, verifiable credentials, open badges — expand into a full cluster.
- **Utility/tool magnets (volume engine):** certificate generator (2900), certificate templates (9900), certificate of completion templates, certificate wording, certificate size, signature fonts — high volume, difficulty 1–3.

### Phase 2 — Content clusters (topical authority)
1. Digital credentialing pillar + spokes (partly exists).
2. Certificates utility cluster (templates, wording, size, fonts) — your best page already proves this works.
3. Comparisons/alternatives (vs Credly/Accredible/Certifier; "best platforms" exists).
4. Use-case/solution pages (universities, associations, training providers, compliance).

### Phase 3 — Free tools (highest leverage, competitor-proven)
- **Free certificate generator / badge maker** (vol 2900; "create digital badge" $9.73 CPC) — linkable asset, top-funnel volume, product showcase.
- Certificate template library.

### Phase 4 — Quick wins (existing near-page-1)
- Optimize the ~47 pos-4–10 and the pos 11–20 cluster (titles, depth, internal links) to push toward top 3.
- Refresh the certificate-of-appreciation page (46 ref domains, pos 19–30) and link it to money pages.

## Measurement
Track via GSC: page-1 keyword count (pos 1–3 and 4–10), per cluster. Target: first top-3 commercial rankings within 2–3 months of recrawl.
