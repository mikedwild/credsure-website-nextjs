"use client";
/**
 * Blueprint D — Webflow-inspired homepage mockup (v2).
 *
 * Rebuilt to match webflow.com's actual DNA:
 *  - Light/clean white-cream background (NOT dark cosmic grid).
 *  - "300,000+ brands move the needle" credibility headline.
 *  - Audience-tab switcher: Marketer / Designer / Developer / Agency
 *    — each tab swaps the customer-stories carousel.
 *  - Customer stories with VIDEO + photo + huge stat overlay
 *    (32 sites in 10 days, 20% conversion lift, $6M savings, etc.).
 *  - "From idea to impact, faster" — Build / Manage / Optimize tabs.
 *  - Feature group cards: Agility / Impact / Scale / Creative / Consistency.
 *  - "Made in Webflow" customer site gallery with thumbnails.
 *  - Restrained typography (Inter), subtle borders, lots of UI screenshots.
 *
 * Loaded scoped to this preview. Delete once direction is picked.
 */
import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, ArrowUpRight, Play, Code2, Palette, Megaphone, Briefcase, Layers, Zap, Globe, ShieldCheck } from 'lucide-react';

const C = {
  paper: '#FFFFFF',
  cream: '#FBFAF7',
  cream2: '#F2EFE6',
  ink: '#0E0F12',
  ink2: '#3B3D44',
  mute: '#6F727B',
  line: '#E6E2D7',
  // Webflow's signature soft accent palette — no dark cosmic.
  blue: '#4353FF',
  blueLight: '#EDF0FF',
  green: '#1FA877',
  greenLight: '#E4F6EE',
  purple: '#7C5BD9',
  purpleLight: '#F0EBFB',
  amber: '#E8A23D',
  amberLight: '#FBF1DD',
};

const Section = ({ children, bg = C.paper, id, className = '' }) => (
  <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
    <div className="max-w-[1240px] mx-auto px-6 md:px-10">{children}</div>
  </section>
);

const AudienceTab = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-5 py-2.5 transition-all whitespace-nowrap rounded-full" style={{
    background: active ? C.ink : 'transparent',
    color: active ? C.paper : C.ink,
    border: active ? `1px solid ${C.ink}` : `1px solid ${C.line}`,
  }}>
    <Icon className="w-4 h-4" />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

export default function DesignPreviewD() {
  const audiences = [
    { id: 'marketer', label: 'Marketer', icon: Megaphone },
    { id: 'designer', label: 'Designer', icon: Palette },
    { id: 'developer', label: 'Developer', icon: Code2 },
    { id: 'agency', label: 'Agency', icon: Briefcase },
  ];
  const [aud, setAud] = React.useState(0);

  // Customer stories per audience — this is the big Webflow signature.
  const storiesByAud = {
    marketer: [
      { logo: 'Cambridge', stat: '32', label: 'global cohorts launched in 10 days', quote: "With CredSure, we're not just keeping up, we're setting the pace. It's the speedboat that's helping us move faster than ever before.", who: 'Rob Alfano', role: 'VP of Digital Marketing', accent: C.blueLight, dot: C.blue },
      { logo: 'Lattice', stat: '20%', label: 'increase in site-wide credential conversion', quote: "With CredSure, we've significantly improved organic credential traffic, SEO, and conversions. From my perspective as CMO, that's a huge win because our brand is reaching more people.", who: 'Elizabeth Walton Egan', role: 'CMO', accent: C.purpleLight, dot: C.purple },
      { logo: 'Orangetheory Edu', stat: '$6M', label: 'in cost savings annually', quote: "We're saving upwards of $6 million a year with CredSure, and we've reinvested those savings in localisation and recipient experience.", who: 'Malcolm Greene', role: 'Chief Information Officer', accent: C.amberLight, dot: C.amber },
    ],
    designer: [
      { logo: 'Dropbox Edu', stat: '3×', label: 'more interactive credentials', quote: "Combining design, emotion, and usability, our credential brand is on the leading edge of how modern web tools elevate digital trust experiences.", who: 'Carla Weis', role: 'VP, Brand & Creative', accent: C.greenLight, dot: C.green },
      { logo: 'Petal', stat: '8', label: 'redesigns, zero devs', quote: "I feel like CredSure has given our credential team superpowers. The biggest hurdle to bringing credentials to life has always been engineering — that's completely removed.", who: 'Anya Müller', role: 'Head of Design', accent: C.purpleLight, dot: C.purple },
      { logo: 'Vanta', stat: 'Faster', label: 'brand-to-market', quote: "CredSure is one of our biggest revenue drivers and we need our marketing team to have flexibility to bring credentials to market with fewer resources.", who: 'Jorge Costa', role: 'Director of Programmes', accent: C.blueLight, dot: C.blue },
    ],
    developer: [
      { logo: 'Dropbox Sign', stat: '67%', label: 'fewer dev tickets', quote: 'CredSure has enabled us to move fast, iterate, and scale so we can meet our aggressive credential goals and stay agile when our needs evolve.', who: 'Helena Bauer', role: 'CISO', accent: C.greenLight, dot: C.green },
      { logo: '21.co', stat: '$300k', label: 'annual savings', quote: 'Being able to make technical credential changes without relying on engineers makes a huge difference. It\'s a big change in the way 21.co does things.', who: 'Liam Nuñez', role: 'CTO', accent: C.blueLight, dot: C.blue },
      { logo: 'Spin Master', stat: '$500k', label: 'dev cost reduction', quote: "CredSure Enterprise has truly transformed the way we work. It's streamlined our process, freeing up our engineering teams to focus on the products.", who: 'Mira Stein', role: 'VP of Engineering', accent: C.amberLight, dot: C.amber },
    ],
    agency: [
      { logo: 'Verndale', stat: '44%', label: 'faster project timelines', quote: 'CredSure eliminates the traditionally gated processes of credential development. Building credentials is no longer rigid — it\'s a more fluid, collaborative process.', who: 'Sam Reyes', role: 'Founder', accent: C.purpleLight, dot: C.purple },
      { logo: 'Flow Ninja', stat: '$10M', label: 'pipeline generated', quote: "CredSure's visual-first credential CMS makes our design-to-issuance process seamless, ensuring precision and flexibility.", who: 'Pia Lindholm', role: 'Creative Director', accent: C.blueLight, dot: C.blue },
      { logo: 'Composite', stat: 'Weeks', label: 'vs. months for full enterprise rollouts', quote: 'CredSure is the perfect answer to the problem I had as a designer — a way to build fully custom credentials without being stuck in inflexible plugins or templates.', who: 'David Liu', role: 'Principal', accent: C.greenLight, dot: C.green },
    ],
  };
  const stories = storiesByAud[audiences[aud].id];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      />

      <style>{`
        .bp-d { background:${C.paper}; color:${C.ink}; font-family:'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing:antialiased; }
        .bp-d .display { font-weight:800; letter-spacing:-0.04em; line-height:0.96; }
        .bp-d .display-md { font-weight:700; letter-spacing:-0.025em; line-height:1.05; }
        .bp-d .btn-primary { background:${C.ink}; color:${C.paper}; padding:0.9rem 1.4rem; font-weight:600; font-size:0.92rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:8px; transition: background 200ms ease; }
        .bp-d .btn-primary:hover { background:${C.blue}; }
        .bp-d .btn-ghost { color:${C.ink}; padding:0.9rem 1.4rem; font-weight:600; font-size:0.92rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:8px; border:1px solid ${C.ink}; }
        .bp-d .btn-ghost:hover { background:${C.cream2}; }
        .bp-d .pill { display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.85rem; border-radius:9999px; font-size:0.74rem; font-weight:600; background:${C.cream2}; color:${C.ink2}; }
        .bp-d .card { border-radius:18px; background:#FFFFFF; border:1px solid ${C.line}; }
      `}</style>

      <div className="bp-d min-h-screen">
        {/* preview chrome */}
        <div className="px-6 md:px-10 py-2.5 flex items-center justify-between text-xs" style={{ background: C.ink, color: C.paper }}>
          <span>CredSure · Design preview <span className="font-semibold" style={{ color: C.blue }}>Blueprint D — Webflow-inspired</span></span>
          <Link to="/preview/design" className="underline hover:no-underline" data-testid="preview-back-to-index">← Back to options</Link>
        </div>

        {/* nav */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <img src="/credsure-logo-main.webp" alt="CredSure" className="h-7" />
          <nav className="hidden md:flex gap-7 text-sm font-medium" style={{ color: C.ink }}>
            <span>Platform</span><span>Solutions</span><span>Resources</span><span>Customers</span><span>Pricing</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm font-semibold">Log in</span>
            <button className="btn-ghost text-sm">Contact sales</button>
            <button className="btn-primary text-sm">Start for free</button>
          </div>
        </header>

        {/* ─── 1. Logo wall (Webflow leads with this) ─── */}
        <Section className="!pt-12 !pb-8">
          <p className="text-center text-sm font-semibold mb-7" style={{ color: C.mute }}>Trusted by teams at</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-12 gap-y-6 items-center justify-items-center">
            {['Cambridge', 'TÜV', 'Pasteur', 'Fraunhofer', 'BBDO', 'Docusign'].map(l => (
              <p key={l} className="text-base font-bold tracking-tight" style={{ color: C.ink, opacity: 0.7 }}>{l}</p>
            ))}
          </div>
        </Section>

        {/* ─── 2. Customer stories — audience tab + carousel ─── */}
        <Section bg={C.paper}>
          <div className="mb-10">
            <h1 className="display text-5xl md:text-7xl max-w-3xl">300,000+ brands move the needle with CredSure</h1>
          </div>

          {/* Audience tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {audiences.map((a, i) => (
              <AudienceTab key={a.id} icon={a.icon} label={a.label} active={aud === i} onClick={() => setAud(i)} />
            ))}
          </div>

          {/* Story cards (3-up) */}
          <div className="grid md:grid-cols-3 gap-5">
            {stories.map((s, i) => (
              <article key={i} className="card overflow-hidden flex flex-col">
                {/* Photo / Video frame */}
                <div className="aspect-[4/3] relative overflow-hidden" style={{ background: s.accent }}>
                  {/* Pretend "video" with photo dot pattern */}
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-9 opacity-40">
                    {Array.from({ length: 108 }).map((_, k) => (
                      <div key={k} style={{ background: k % 5 === 0 ? s.dot : 'transparent', opacity: (k % 7) / 10 }} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.95)' }}>
                      <Play className="w-5 h-5 ml-0.5" style={{ color: C.ink }} fill={C.ink} />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md text-xs font-bold" style={{ background: 'rgba(255,255,255,0.95)' }}>{s.logo}</div>
                </div>
                {/* Stat + quote */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="display text-5xl" style={{ color: C.ink }}>{s.stat}</p>
                  <p className="text-sm mt-1.5 font-semibold" style={{ color: C.ink2 }}>{s.label}</p>
                  <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: C.ink2 }}>"{s.quote}"</p>
                  <div className="mt-5 pt-4 border-t flex items-center justify-between" style={{ borderColor: C.line }}>
                    <div>
                      <p className="text-sm font-bold">{s.who}</p>
                      <p className="text-xs" style={{ color: C.mute }}>{s.role}</p>
                    </div>
                    <button className="text-sm font-bold flex items-center gap-1.5" style={{ color: C.ink }}>
                      Read story <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom callout */}
          <p className="mt-10 text-center text-base" style={{ color: C.ink2 }}>
            Let's talk about what your credentials could be doing for your institution. <button className="font-bold underline" style={{ color: C.ink }}>Talk to sales →</button>
          </p>
        </Section>

        {/* ─── 3. From idea to impact — Build/Manage/Optimize tabs ─── */}
        <Section bg={C.cream}>
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <p className="pill mb-5"><Zap className="w-3 h-3" /> Machine Mode</p>
              <h2 className="display text-4xl md:text-6xl">From idea to impact, faster</h2>
              <p className="mt-6 text-base md:text-lg" style={{ color: C.ink2 }}>
                CredSure's agentic AI works alongside your team — drafting credentials, generating cohorts, running experiments — with the guardrails enterprise teams need.
              </p>
              <button className="btn-ghost mt-8 text-sm">Discover CredSure AI <ArrowUpRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="md:col-span-7 space-y-3">
              {[
                { tab: 'Build', body: 'Create a credential and brand system from the ground up, modify it easily, and generate clean templates to power dynamic experiences.', accent: C.blue, accentBg: C.blueLight },
                { tab: 'Manage', body: 'Generate copy and credential collection items individually or in bulk to keep your output fresh, drive trust, and strengthen your brand.', accent: C.purple, accentBg: C.purpleLight },
                { tab: 'Optimize', body: 'Turn issuance into trust. Native tools run experiments, personalise by audience, and optimise for every distribution channel and verifier.', accent: C.green, accentBg: C.greenLight },
              ].map((t, i) => (
                <article key={t.tab} className="card overflow-hidden">
                  <div className="grid grid-cols-12">
                    <div className="col-span-12 md:col-span-7 p-6">
                      <span className="pill mb-3" style={{ background: t.accentBg, color: t.accent }}>0{i + 1} · {t.tab}</span>
                      <h3 className="display-md text-2xl mt-3">{t.tab}</h3>
                      <p className="text-sm mt-2.5" style={{ color: C.ink2 }}>{t.body}</p>
                    </div>
                    <div className="col-span-12 md:col-span-5 relative" style={{ background: t.accentBg, minHeight: 140 }}>
                      <div className="absolute inset-3 rounded-lg" style={{ background: '#FFFFFF', border: `1px solid ${C.line}` }}>
                        <div className="p-3">
                          <div className="h-2 w-1/3 rounded mb-2" style={{ background: t.accent }} />
                          <div className="h-1.5 w-full rounded mb-1.5" style={{ background: C.cream2 }} />
                          <div className="h-1.5 w-4/5 rounded mb-1.5" style={{ background: C.cream2 }} />
                          <div className="h-1.5 w-3/5 rounded mb-3" style={{ background: C.cream2 }} />
                          <div className="grid grid-cols-3 gap-1.5">
                            {[0, 1, 2].map(k => <div key={k} className="aspect-square rounded" style={{ background: t.accent, opacity: 0.3 + k * 0.2 }} />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── 4. Everything teams love about CredSure — feature group cards ─── */}
        <Section bg={C.paper}>
          <h2 className="display text-4xl md:text-6xl mb-12 max-w-3xl">Everything credential teams love about CredSure</h2>
          <div className="grid md:grid-cols-12 gap-5">
            {[
              { name: 'Agility', desc: 'Create and launch new cohorts on your timeline — no waiting for dev resources.', span: 7, accent: C.blue, bg: C.blueLight },
              { name: 'Impact', desc: 'Every tool you need to grow trust, convert recipients, and prove ROI.', span: 5, accent: C.green, bg: C.greenLight },
              { name: 'Scale', desc: 'Give everyone room to issue, with guardrails that keep things on brand.', span: 5, accent: C.purple, bg: C.purpleLight },
              { name: 'Creative freedom', desc: 'Build exactly what you imagine, without compromises or workarounds.', span: 7, accent: C.amber, bg: C.amberLight },
            ].map(g => (
              <article key={g.name} className="card p-7 flex flex-col" style={{ gridColumn: `span ${g.span} / span ${g.span}` }}>
                <span className="pill self-start mb-4" style={{ background: g.bg, color: g.accent }}><Layers className="w-3 h-3" /> {g.name}</span>
                <h3 className="display-md text-3xl">{g.name}</h3>
                <p className="mt-3 text-base flex-1" style={{ color: C.ink2 }}>{g.desc}</p>
                <div className="mt-6 grid grid-cols-3 gap-2.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="aspect-[4/3] rounded-lg" style={{ background: g.bg, border: `1px solid ${C.line}` }}>
                      <div className="h-full p-2.5 flex flex-col justify-end">
                        <div className="h-1 rounded mb-1" style={{ background: g.accent, opacity: 0.6 }} />
                        <div className="h-1 rounded" style={{ background: g.accent, opacity: 0.3, width: '60%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 5. Made in CredSure — customer site gallery ─── */}
        <Section bg={C.cream}>
          <div className="mb-10">
            <p className="pill mb-4"><Globe className="w-3 h-3" /> Made in CredSure</p>
            <h2 className="display text-4xl md:text-6xl">Make your credentials your competitive edge</h2>
            <p className="mt-5 text-base md:text-lg max-w-xl" style={{ color: C.ink2 }}>
              Build a brand recipients trust and pipeline you can measure, all with one powerful platform.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn-primary">Get started — it's free</button>
              <button className="btn-ghost">Talk to sales</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Cambridge Edu', accent: C.blueLight },
              { name: 'TÜV Skills', accent: C.greenLight },
              { name: 'Fraunhofer Cert', accent: C.purpleLight },
              { name: 'ETH Diploma', accent: C.amberLight },
              { name: 'Pasteur Lab', accent: C.greenLight },
              { name: 'DB Compliance', accent: C.blueLight },
              { name: 'L\'Oréal Academy', accent: C.purpleLight },
              { name: 'Mars University', accent: C.amberLight },
            ].map(s => (
              <article key={s.name} className="card overflow-hidden">
                <div className="aspect-[4/3] relative" style={{ background: s.accent }}>
                  <div className="absolute inset-3 rounded-md" style={{ background: '#FFFFFF', border: `1px solid ${C.line}` }}>
                    <div className="p-2.5 space-y-1.5">
                      <div className="h-1 w-1/2 rounded" style={{ background: C.ink, opacity: 0.4 }} />
                      <div className="aspect-[5/2] rounded" style={{ background: s.accent }} />
                      <div className="h-1 rounded" style={{ background: C.cream2 }} />
                      <div className="h-1 rounded" style={{ background: C.cream2, width: '60%' }} />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <p className="text-xs font-bold">{s.name}</p>
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: C.mute }} />
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 6. Enterprise grade callout ─── */}
        <Section bg={C.paper} className="!py-20">
          <div className="card p-10 grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7">
              <ShieldCheck className="w-10 h-10 mb-5" style={{ color: C.blue }} strokeWidth={1.5} />
              <h2 className="display text-4xl md:text-5xl">Enterprise-grade security, hosting, and AEO built in.</h2>
              <p className="mt-5 text-base md:text-lg" style={{ color: C.ink2 }}>
                99.99% uptime, SOC 2 Type II, ISO 27001, eIDAS, GDPR. Trusted by 500+ institutions.
              </p>
            </div>
            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'eIDAS', '99.99% uptime', 'WCAG AA'].map(b => (
                <div key={b} className="rounded-lg px-3.5 py-3 text-sm font-bold flex items-center gap-2" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: C.green }} />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <footer className="py-10 text-xs" style={{ background: C.ink, color: 'rgba(255,255,255,0.55)' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex flex-wrap justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/credsure-logo-main.webp" alt="CredSure" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
              <span>· The agentic credential platform for modern institutions · © 2026</span>
            </div>
            <span style={{ color: C.blue }}>Munich · Singapore</span>
          </div>
        </footer>
      </div>
    </>
  );
}
