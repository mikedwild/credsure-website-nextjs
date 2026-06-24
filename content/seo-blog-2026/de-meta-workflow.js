export const meta = {
  name: 'blog-de-meta',
  description: 'Draft German seo_title_de + seo_description_de for 91 CredSure blog posts (read-only; no live changes)',
  phases: [ { title: 'Draft', detail: 'one agent per chunk of 5 posts \u2014 read German body + EN meta, write German meta' } ],
}

const SLUGS = [
  "digital-badges-employee-engagement", "gdpr-digital-credentials-compliance", "digital-credentials-higher-education", "how-to-build-a-great-soft-skill-training-program-for-your-employees", "certificate-of-appreciation-definition-and-10-examples",
  "what-are-digital-certificates-and-how-to-use-them", "why-should-you-use-a-free-certificate-template-examples", "what-is-credential-management-best-practice", "top-8-e-learning-platforms-for-2025", "how-do-you-choose-a-professional-credential-service",
  "how-do-we-create-job-training-programs", "whats-a-digital-badge-maker-how-do-you-use-it", "how-to-sell-an-online-course-7-tipshow-to-sell-an-online-course", "10-must-have-features-digital-credentialing-solution", "the-transformative-impact-of-artificial-intelligence-in-education",
  "how-to-use-digital-badges-for-internal-marketin", "8-ways-to-enhance-employee-training-programs", "empower-your-workers-with-artificial-intelligence-in-training", "educational-certificates-got-smarter", "6-benefits-of-competency-based-learning",
  "how-to-increase-website-traffic-with-digital-certificates", "how-to-digitise-your-certificate", "what-is-a-digital-certificate", "need-for-skills-training", "how-to-design-digital-badges",
  "guide-to-digital-badges-in-the-workplace", "enhance-learning-harness-the-power-of-gamification-in-education", "redefining-workforce-development-how-digital-badges-motivate-and-engage-learners", "5-reasons-why-use-digital-badges", "how-to-manage-and-share-digital-credentials",
  "academic-certificates-vs-digital-certificates", "how-to-create-a-linkedin-student-profile", "why-you-must-avoid-ghost-certificates", "digital-certificates-vs-paper-certificates", "rise-of-digital-educational-certificates",
  "micro-credentials-and-its-benefits", "certificate-fraud-in-the-job-market", "gamification-using-digital-badges", "digital-badges-in-education", "how-to-choose-digital-credentialing-software",
  "marketing-guide-for-your-professional-certification-course", "future-of-medical-professional-credentialing", "blockchain-digital-badges-to-promote-skills-and-achievement-recognition", "use-blockchain-to-store-the-entire-lifecycle-of-your-records", "educational-institutes-to-take-the-next-big-leap-in-automation",
  "why-to-issue-a-digital-certificate-on-blockchain", "mobility-will-drive-the-future-of-credentials-in-higher-education", "smart-tips-on-creating-your-perfect-skillpass", "how-will-blockchain-affect-the-future-of-education-and-learning", "how-can-you-bridge-skills-gap-with-digital-certificates",
  "meeting-the-demand-for-mechatronics-skills-in-the-workplace", "digital-transformation-in-the-education-sector", "filipino-seafarers-return-to-the-workplace-via-skillpass-event-highlights", "skills-to-meet-workforce-demands-in-the-4th-industrial-revolution", "digital-gurukul-adopts-digital-certificates-placed-on-blockchain",
  "humaci-a-global-training-and-consulting-organization-case-study", "industry-4-0-skills-to-support-automation-new-technologies", "skill-pass-proof-of-learning-and-development", "festo-introduces-digital-certificates-for-instant-verification-monitoring", "find-skilled-corporate-trainers-backed-by-digital-certification",
  "skills-gap-in-energy-sector-is-the-biggest-roadblock", "certificate-fraud-how-to-prevent-unqualified-professionals-from-entering-the-job-market", "the-need-for-skill-development-in-the-automotive-industry", "addressing-the-critical-need-for-skills-training-and-digital-certification", "get-smart-adopt-a-blockchain-powered-platform-to-enhance-institute-experience",
  "address-skills-shortage-in-the-global-healthcare-sector", "skilled-immigration-act-easier-access-to-the-german-labour-market", "educational-certifications-just-got-smarter", "modular-courses-to-bridge-the-skills-gap", "transforming-education-certification-with-blockchain",
  "why-the-world-needs-a-review-system-for-educational-institutions", "digital-signature-certificates-empower-your-students-to-prove-their-skills", "blockchain-platform-to-build-trust-in-global-education-sector", "evolution-of-digital-credentials", "technical-courses-in-india-an-opportunity-for-youth-to-gain-next-gen-skills",
  "a-critical-success-factor-upskill-and-reskill-the-workforce", "worldskills-kazan-2019-a-confluence-of-skill-dedication-and-purpose", "worldskills-2019-took-visitors-on-an-inspiring-journey-around-the-future-of-skills", "benefits-of-blockchain-promote-transparency-and-raise-education-standards", "two-reasons-why-digital-certificate-is-the-way-forward",
  "accredible-alternative", "best-credly-alternatives-for-badging", "digital-certificates-vs-digital-badges", "what-are-digital-credentials", "how-to-add-digital-badges-to-linkedin",
  "what-are-certification-badges", "what-are-digital-badges", "open-badges-explained", "how-to-verify-degrees-and-diplomas-online", "digital-badges-for-students-and-universities",
  "best-digital-credentialing-platforms-2026"
]

const SCHEMA = {
  type: "object",
  properties: { items: { type: "array", items: {
    type: "object",
    properties: {
      slug: { type: "string" },
      seo_title_de: { type: "string", description: "<=60 chars INCLUDING ' | CredSure'" },
      seo_description_de: { type: "string", description: "140-160 chars, fluent German" },
      target_keyword_de: { type: "string" }
    },
    required: ["slug","seo_title_de","seo_description_de","target_keyword_de"], additionalProperties: false
  }}},
  required: ["items"], additionalProperties: false
}

function chunk(a,n){const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o}
const groups = chunk(SLUGS,5)

const prompt = (slugs) => `Du optimierst die deutschen SEO-Metadaten von CredSure-Blogartikeln. CredSure (credsure.io) ist eine Plattform fuer digitales Credentialing: digitale Nachweise, Zertifikate und Badges blockchain-gestuetzt ausstellen, verwalten und verifizieren; DSGVO-konform, in der EU gehostet.

Fuer JEDEN Slug: Artikel ABRUFEN und deutsche SEO-Metadaten verfassen.

Abruf (aus dem Repo-Stammverzeichnis):
  TOK=$(cat content/seo-blog-2026/.publish-token)
  curl -s -H "Authorization: Bearer $TOK" "https://credsure-website-nextjs-production.up.railway.app/api/admin/blogs/<slug>"
Lies title_de und content_html_de (deutscher Text). Falls content_html_de leer ist, nutze title + content_html (Englisch) und das vorhandene englische seo_title/seo_description als Grundlage \u2014 schreibe die Metadaten trotzdem auf Deutsch.

Regeln pro Artikel:
- seo_title_de: MAXIMAL 60 Zeichen INKLUSIVE des Suffix " | CredSure". Mit dem deutschen Hauptkeyword beginnen, natuerlich, korrekt zum Inhalt. Zeichen zaehlen, 60 nicht ueberschreiten.
- seo_description_de: 140-160 Zeichen, fluessiges Deutsch, 1-2 Saetze, Hauptkeyword natuerlich einbauen, klarer Nutzen, keine abgeschnittenen Woerter, keine Anfuehrungszeichen.
- target_keyword_de: das deutsche Such-Hauptkeyword (verwende echte deutsche Suchbegriffe, KEINE woertliche Uebersetzung englischer Keywords).
- Idiomatisches Deutsch, kein \u201eDenglisch\u201c, ausser bei etablierten Begriffen (z. B. \u201edigitale Badges\u201c, \u201eCredential\u201c).

Pruefe vor der Rueckgabe: jeder seo_title_de <=60 Zeichen, jede seo_description_de 140-160 Zeichen.

Slugs: ${JSON.stringify(slugs)}

Gib ALLE ${slugs.length} via StructuredOutput zurueck als {items:[{slug, seo_title_de, seo_description_de, target_keyword_de}]}.`

phase('Draft')
const results = await parallel(groups.map((g,i)=>()=>
  agent(prompt(g), { label: `de:${i*5+1}-${i*5+g.length}`, phase: 'Draft', schema: SCHEMA })
))
const all = results.filter(Boolean).flatMap(r=>r.items||[])
const flags = all.filter(x => (x.seo_title_de||"").length>60 || (x.seo_description_de||"").length>162 || (x.seo_description_de||"").length<125).map(x=>({slug:x.slug, t:(x.seo_title_de||"").length, d:(x.seo_description_de||"").length}))
const got=new Set(all.map(x=>x.slug)); const missing=SLUGS.filter(s=>!got.has(s))
log(`drafted ${all.length}/${SLUGS.length} \u00b7 length-flags ${flags.length} \u00b7 missing ${missing.length}`)
return { count: all.length, items: all, lengthFlags: flags, missing }
