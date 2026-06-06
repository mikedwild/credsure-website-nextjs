"use client";
/**
 * Blueprint F — Jasper-inspired homepage mockup (v2).
 *
 * Rebuilt completely after fresh source scrape. The real jasper.ai is
 * NOT a cosmic-black-with-gradient-orbs site. It is an editorial
 * parchment/cream aesthetic with:
 *
 *   - Warm cream/parchment background with subtle paper texture.
 *   - Black & white stippled/dotted artwork as section dividers
 *     (coffee mug, hand pyramid, rocket, swans, handshake).
 *   - Bold sans-serif headlines + a red wordmark accent.
 *   - 6 "persona portraits" — real-feeling photographic frames with
 *     each persona on a different abstract colored background:
 *       Performance · green/black
 *       Product     · yellow/black
 *       Brand       · pink
 *       Content     · red/orange pixelated
 *       PR          · blue pixelated
 *       Field       · purple/lavender
 *   - Customer story callouts with HUGE stats (10K hours, 60% SEO,
 *     7,500 descriptions, 3× production, etc.) and brand logos.
 *   - Trust Foundation / Resources rows with stippled illustrations.
 *   - "The End" greeting card with floral motif as the closing CTA.
 *
 * Loaded scoped to this preview so fonts/vars don't leak. Delete once
 * direction is picked.
 */
import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';

const C = {
  // Warm parchment cream — Jasper's actual base.
  paper: '#F4EFE4',
  paper2: '#EAE2D0',
  card: '#FBF7EE',
  ink: '#1A1814',
  ink2: '#3A332A',
  mute: '#7A6E5C',
  line: '#D9CCAE',
  // Jasper's signature wordmark red.
  red: '#E53935',
  redDeep: '#C72A22',
  // Persona accent backgrounds (mirroring jasper.ai's role grid).
  pPerf: '#3F6648',   // green/black
  pProd: '#D9B83A',   // yellow
  pBrand: '#F1B8C5',  // soft pink
  pContent: '#D14B2E', // red/orange pixelated
  pPR: '#3E5C8C',     // blue pixelated
  pField: '#9C84C8',  // lavender
};

// Stippled/dotted illustration — used in lieu of real photos.
const Stipple = ({ children, density = 200, seed = 0 }) => {
  // Deterministic dot field for that "halftone editorial" Jasper look.
  const dots = [];
  let s = seed;
  for (let i = 0; i < density; i++) {
    s = (s * 9301 + 49297) % 233280;
    const x = (s / 233280) * 100;
    s = (s * 9301 + 49297) % 233280;
    const y = (s / 233280) * 100;
    s = (s * 9301 + 49297) % 233280;
    const r = 0.4 + (s / 233280) * 1.2;
    dots.push(<circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill={C.ink} opacity={0.55 + (s / 233280) * 0.4} />);
  }
  return (
    <div className="relative w-full h-full">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">{dots}</svg>
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
};

const Section = ({ children, bg = C.paper, id, className = '' }) => (
  <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
    <div className="max-w-[1280px] mx-auto px-6 md:px-10">{children}</div>
  </section>
);

export default function DesignPreviewF() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap"
      />

      <style>{`
        .bp-f { background:${C.paper}; color:${C.ink}; font-family:'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing:antialiased; }
        .bp-f .display { font-weight:800; letter-spacing:-0.04em; line-height:0.96; }
        .bp-f .display-md { font-weight:700; letter-spacing:-0.025em; line-height:1.05; }
        .bp-f .serif { font-family:'Instrument Serif', Georgia, serif; font-weight:400; font-style: italic; letter-spacing:-0.01em; line-height:1; }
        .bp-f .btn-primary { background:${C.ink}; color:${C.paper}; padding:0.9rem 1.5rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; transition: background 200ms ease; }
        .bp-f .btn-primary:hover { background:${C.red}; }
        .bp-f .btn-secondary { background:${C.red}; color:#FFFFFF; padding:0.9rem 1.5rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; }
        .bp-f .btn-secondary:hover { background:${C.redDeep}; }
        .bp-f .btn-ghost { color:${C.ink}; padding:0.9rem 1.5rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; border:1.5px solid ${C.ink}; }
        .bp-f .pill { display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.85rem; border-radius:9999px; font-size:0.75rem; font-weight:600; border:1px solid ${C.ink}; background:transparent; color:${C.ink}; }
        /* Subtle paper grain texture overlay — what Jasper achieves with paper-texture.png */
        .bp-f .paper-grain { position:relative; }
        .bp-f .paper-grain::after { content:''; position:absolute; inset:0; pointer-events:none; opacity:0.06; mix-blend-mode:multiply;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .bp-f .pixel-bg { background-image:
          linear-gradient(45deg, rgba(0,0,0,0.18) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.18) 75%),
          linear-gradient(45deg, rgba(0,0,0,0.18) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.18) 75%);
          background-size: 8px 8px; background-position: 0 0, 4px 4px; }
      `}</style>

      <div className="bp-f min-h-screen paper-grain">
        {/* preview chrome */}
        <div className="px-6 md:px-10 py-2.5 flex items-center justify-between text-xs relative z-10" style={{ background: C.ink, color: C.paper }}>
          <span>CredSure · Design preview <span className="font-semibold serif text-[13px]" style={{ color: C.red }}>Blueprint F — Jasper-inspired</span></span>
          <Link to="/preview/design" className="underline hover:no-underline" data-testid="preview-back-to-index">← Back to options</Link>
        </div>

        {/* nav */}
        <header className="max-w-[1280px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between relative z-10">
          <img src="/credsure-logo-main.webp" alt="CredSure" className="h-7" />
          <nav className="hidden md:flex gap-7 text-sm font-medium" style={{ color: C.ink2 }}>
            <span>Platform</span><span>Solutions</span><span>Resources</span><span>Company</span><span>Pricing</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm" style={{ color: C.ink2 }}>Log in</span>
            <button className="btn-secondary text-sm">Get a demo</button>
          </div>
        </header>

        {/* Editorial banner — "The State of AI in Marketing" style */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 mb-2">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <span className="serif italic text-base" style={{ color: C.red }}>New research!</span>
            <span className="text-sm font-medium">The State of AI in Credentialing 2026.</span>
            <span className="text-sm font-bold underline">Download now →</span>
          </div>
        </div>

        {/* ─── 1. HERO — restrained editorial ─── */}
        <Section className="!pt-10 !pb-20">
          <div className="max-w-4xl">
            <h1 className="display text-[60px] md:text-[112px]" style={{ color: C.ink }}>
              Put AI agents to work for <span className="serif italic" style={{ color: C.red }}>credentialing</span>
            </h1>
            <p className="mt-7 text-lg md:text-xl max-w-2xl" style={{ color: C.ink2 }}>
              Orchestrate intelligent agents to run end-to-end credential workflows — delivering speed, control, and measurable trust.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button className="btn-primary" data-testid="preview-f-primary-cta">Start free trial</button>
              <button className="btn-ghost">Get a demo</button>
            </div>
          </div>

          {/* Logo wall — world-class enterprise brands */}
          <div className="mt-20">
            <h2 className="text-center text-base md:text-lg font-semibold mb-8" style={{ color: C.ink }}>World-class institutions trust CredSure</h2>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-x-10 gap-y-6 items-center justify-items-center" style={{ opacity: 0.6 }}>
              {['Cambridge', 'TÜV', 'Pasteur', 'Fraunhofer', 'ETH Zürich', 'Deutsche Bahn', 'Boeing', 'L\'Oréal', 'Mars', 'Hitachi', 'Sanofi', 'Accenture', 'Cognizant', 'Prudential'].map(l => (
                <p key={l} className="text-sm md:text-base font-bold tracking-tight" style={{ color: C.ink }}>{l}</p>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── 2. The Platform — three blocks ─── */}
        <Section bg={C.paper}>
          <div className="max-w-3xl mb-14">
            <p className="serif italic text-2xl mb-3" style={{ color: C.red }}>The CredSure Platform</p>
            <h2 className="display text-5xl md:text-7xl">
              The execution platform for <span className="serif italic" style={{ color: C.red }}>intelligent</span> credentialing
            </h2>
            <p className="mt-6 text-base md:text-lg" style={{ color: C.ink2 }}>
              CredSure is the agent workspace built for modern credentialing teams. With 100+ specialised AI agents and connected pipelines that turn plans into live credentials, transforming strategy into execution and driving measurable trust across every channel.
            </p>
            <button className="btn-ghost mt-8 text-sm">Explore the platform <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Agents', body: 'Purpose-built AI agents that execute real credential work.' },
              { name: 'Content Pipelines', body: 'Repeatable workflows that move work from idea to launch.' },
              { name: 'CredSure IQ', body: 'Maintain quality & authenticity with a rich context hub.' },
            ].map((b, i) => (
              <article key={b.name} className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <div className="aspect-[16/10] relative" style={{ background: C.paper2 }}>
                  <Stipple density={150} seed={i * 17} />
                </div>
                <div className="p-7">
                  <p className="text-xs uppercase tracking-[0.18em] font-bold mb-2" style={{ color: C.red }}>{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="display-md text-3xl">{b.name}</h3>
                  <p className="mt-3 text-sm" style={{ color: C.ink2 }}>{b.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 3. Solutions for every credentialing role — persona portraits ─── */}
        <Section bg={C.paper}>
          <div className="mb-14 max-w-3xl">
            <p className="serif italic text-2xl mb-3" style={{ color: C.red }}>Solutions for every role</p>
            <h2 className="display text-5xl md:text-7xl">
              Credentialing runs on trust. <span className="serif italic" style={{ color: C.red }}>CredSure</span> automates how it's earned.
            </h2>
            <p className="mt-6 text-base md:text-lg max-w-xl" style={{ color: C.ink2 }}>
              From bulk issuance to real-time verification, audit logs to recipient experience — CredSure provides the building blocks for every team to issue, automate, and scale with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { role: 'Performance', name: 'Issuers', tag: 'Scale issuance without slowing trust.', bg: C.pPerf, photoBg: 'green', popular: 'Bulk Issue', desc: 'Issue 50,000 credentials in a single batch with audit-ready logs.' },
              { role: 'Product', name: 'Registrars', tag: 'Less time managing batches. More time shaping programmes.', bg: C.pProd, popular: 'Cohort Brief', desc: 'Draft a comprehensive cohort plan with goals, deliverables, and timelines.' },
              { role: 'Brand', name: 'Marketing', tag: 'Protect your brand while you scale it.', bg: C.pBrand, popular: 'Template Suite', desc: 'Apply your brand kit across 80+ credential templates in one click.' },
              { role: 'Content', name: 'Communications', tag: 'Turn credential events into a growth engine.', bg: C.pContent, popular: 'Story Pipeline', desc: 'Long-form recipient stories that drive shareability and SEO.', pixel: true },
              { role: 'Digital', name: 'PR & Comms', tag: 'Move faster without losing message control.', bg: C.pPR, popular: 'Press release', desc: 'Share key institutional news with a well-crafted automated release.', pixel: true },
              { role: 'Field', name: 'Verifiers', tag: 'Launch local checks at global speed.', bg: C.pField, popular: 'Verification flow', desc: 'Transform incoming scans into structured verification at the border.' },
            ].map(p => (
              <article key={p.role} className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                {/* Persona portrait — colored abstract bg with stipple silhouette */}
                <div className={`aspect-[5/4] relative overflow-hidden ${p.pixel ? 'pixel-bg' : ''}`} style={{ background: p.bg }}>
                  <div className="absolute inset-0 flex items-end justify-center">
                    {/* Silhouette — abstract figure */}
                    <svg viewBox="0 0 200 200" className="h-full" preserveAspectRatio="xMidYMax slice" aria-hidden>
                      <defs>
                        <radialGradient id={`s-${p.role}`}>
                          <stop offset="0%" stopColor={C.ink} stopOpacity="0.6" />
                          <stop offset="100%" stopColor={C.ink} stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="100" cy="80" r="35" fill={C.ink} opacity="0.25" />
                      <path d={`M 50 200 Q 50 120 100 120 Q 150 120 150 200 Z`} fill={C.ink} opacity="0.25" />
                    </svg>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="pill" style={{ background: 'rgba(255,255,255,0.85)', borderColor: 'transparent', color: C.ink }}>{p.role}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="serif italic text-lg" style={{ color: C.ink2 }}>{p.tag}</p>
                  <h3 className="display-md text-2xl mt-1.5">Solutions for {p.name}</h3>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: C.line }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: C.red }}>Popular</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: C.ink }}>{p.popular}</p>
                      <p className="text-xs mt-1" style={{ color: C.mute }}>{p.desc}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 shrink-0" style={{ color: C.ink }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 4. Customer Stories — big stat callouts ─── */}
        <Section bg={C.paper2}>
          <div className="mb-14 flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="serif italic text-2xl mb-3" style={{ color: C.red }}>Customer stories</p>
              <h2 className="display text-5xl md:text-7xl">Proven workflows, <span className="serif italic" style={{ color: C.red }}>real</span> results</h2>
            </div>
            <button className="btn-ghost text-sm">Explore customer stories <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { stat: '10,000+', suffix: 'hours saved annually', body: 'Compliant, high-quality, and localised credential content at scale.', logo: 'Cambridge' },
              { stat: '60%', suffix: 'of issuance now automated with CredSure', body: 'Three years into adopting CredSure, here is what their team unlocked.', logo: 'TÜV Rheinland' },
              { stat: '7,500', suffix: 'credentials written by CredSure in 24 hours', body: 'How Adidas Education uses CredSure to scale credential issuance.', logo: 'Adidas Edu' },
              { stat: '3×', suffix: 'credential production', body: 'Avery Dennison ships 3× more credentials in the same timeframe.', logo: 'Avery Dennison' },
              { stat: 'Time-to-market', suffix: 'Faster end-to-end campaigns', body: 'Ulta Education runs 4× more credential cohorts than they used to.', logo: 'Ulta Edu' },
              { stat: '384%', suffix: '3-year ROI', body: 'Forrester Total Economic Impact™ of CredSure (2026 report).', logo: 'Forrester' },
            ].map((cs, i) => (
              <article key={i} className="rounded-2xl p-7 flex flex-col" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <p className="display text-5xl md:text-6xl" style={{ color: C.ink }}>{cs.stat}</p>
                <p className="text-sm mt-2 font-medium" style={{ color: C.ink2 }}>{cs.suffix}</p>
                <p className="text-sm mt-5 flex-1" style={{ color: C.mute }}>{cs.body}</p>
                <div className="mt-6 pt-5 border-t flex items-center justify-between" style={{ borderColor: C.line }}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: C.ink }}>{cs.logo}</p>
                  <ArrowUpRight className="w-4 h-4" style={{ color: C.ink }} />
                </div>
              </article>
            ))}
          </div>

          {/* Pull quote with portrait */}
          <div className="mt-12 grid md:grid-cols-12 gap-8 items-center p-8 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="md:col-span-3">
              <div className="aspect-[3/4] rounded-xl overflow-hidden" style={{ background: C.pProd }}>
                <Stipple density={120} seed={42} />
              </div>
            </div>
            <div className="md:col-span-9">
              <p className="serif text-3xl md:text-4xl leading-tight" style={{ color: C.ink }}>
                "Thrilled to be on CredSure's Customer Advisory Board. It's not just about efficiency gains — it's about <em style={{ color: C.red }}>augmenting human</em> judgement, scaling expertise, and unlocking new ways to verify trust and drive institutional outcomes."
              </p>
              <div className="mt-6">
                <p className="text-base font-bold" style={{ color: C.ink }}>Dr. Eleanor Whitfield</p>
                <p className="text-sm" style={{ color: C.mute }}>Director of Digital Credentialing · Cambridge Training</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 5. Trust Foundation ─── */}
        <Section bg={C.paper}>
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: C.paper2 }}>
                <Stipple density={250} seed={101} />
              </div>
            </div>
            <div className="md:col-span-7">
              <p className="serif italic text-2xl mb-3" style={{ color: C.red }}>Trust Foundation</p>
              <h3 className="display text-4xl md:text-6xl">Enterprise-grade <span className="serif italic" style={{ color: C.red }}>security</span>, quality outputs</h3>
              <p className="mt-6 text-base md:text-lg" style={{ color: C.ink2 }}>
                Enterprise-grade security and an LLM-agnostic architecture prioritise your data protection and privacy while providing superior quality credential outputs.
              </p>
              <button className="btn-ghost mt-8 text-sm">Explore Trust <ArrowUpRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </Section>

        {/* ─── 6. Resources — 6 tiles with stippled illustrations ─── */}
        <Section bg={C.paper}>
          <div className="mb-12 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="serif italic text-2xl mb-3" style={{ color: C.red }}>Resources</p>
              <h2 className="display text-5xl md:text-6xl">Your AI success starts here</h2>
            </div>
            <button className="btn-ghost text-sm">Explore all resources <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: 'The CredSure Blog', body: 'Stories, insights, and best practices for AI-powered credentialing.' },
              { title: 'Watch CredSure Foundations', body: 'The foundational knowledge to leverage CredSure for any credential project.' },
              { title: 'Customer Stories', body: 'How institutions like yours are leveraging CredSure to drive growth and trust.' },
              { title: 'Get Support', body: 'Get in touch about your account, partnerships, press, careers, and more.' },
              { title: 'Connect with community', body: 'Self-paced guides, courses, events, and resources, plus channels to connect.' },
              { title: 'Search Knowledge Center', body: 'Learn how to use generative AI for your specific credentialing role.' },
            ].map((r, i) => (
              <article key={r.title} className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <div className="aspect-[16/10]" style={{ background: C.paper2 }}>
                  <Stipple density={140} seed={i * 23 + 7} />
                </div>
                <div className="p-6">
                  <h3 className="display-md text-2xl">{r.title}</h3>
                  <p className="text-sm mt-2" style={{ color: C.ink2 }}>{r.body}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: C.ink }}>
                    Learn more <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 7. Final CTA — "The End" greeting card with florals ─── */}
        <Section bg={C.paper2} className="!py-32 relative overflow-hidden">
          {/* Greeting card composition */}
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7">
              <h2 className="display text-5xl md:text-7xl">Put AI agents to work, on <span className="serif italic" style={{ color: C.red }}>your terms</span></h2>
              <p className="mt-6 text-base md:text-lg max-w-xl" style={{ color: C.ink2 }}>
                Explore how CredSure agents help teams turn strategy into execution across every cohort, market, and audience.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button className="btn-primary">Get a demo</button>
                <button className="btn-secondary">Start free trial</button>
              </div>
            </div>
            <div className="md:col-span-5">
              {/* Greeting card — "The End" — bordered with florals (CSS) */}
              <div className="relative rounded-3xl overflow-hidden p-10 text-center" style={{ background: C.card, border: `2px solid ${C.line}` }}>
                {/* Hand-illustrated florals — abstract */}
                <svg className="absolute top-3 left-3 w-16 h-16" viewBox="0 0 64 64" fill="none" stroke={C.pPR} strokeWidth="1.5" aria-hidden>
                  <circle cx="20" cy="20" r="6" fill={C.pBrand} stroke={C.ink} />
                  <circle cx="38" cy="32" r="4" fill={C.pProd} stroke={C.ink} />
                  <path d="M 14 30 Q 24 24 30 38" stroke={C.pPerf} strokeWidth="1.5" />
                  <circle cx="44" cy="14" r="3" fill={C.red} stroke={C.ink} />
                </svg>
                <svg className="absolute bottom-3 right-3 w-16 h-16" viewBox="0 0 64 64" fill="none" stroke={C.pPR} strokeWidth="1.5" aria-hidden>
                  <circle cx="44" cy="44" r="6" fill={C.pField} stroke={C.ink} />
                  <circle cx="26" cy="32" r="4" fill={C.pProd} stroke={C.ink} />
                  <path d="M 50 34 Q 40 40 34 26" stroke={C.pPerf} strokeWidth="1.5" />
                  <circle cx="20" cy="50" r="3" fill={C.red} stroke={C.ink} />
                </svg>
                <svg className="absolute top-3 right-3 w-12 h-12" viewBox="0 0 48 48" fill="none" aria-hidden>
                  <circle cx="24" cy="24" r="5" fill={C.pBrand} stroke={C.ink} strokeWidth="1.2" />
                  <circle cx="14" cy="14" r="3" fill={C.pProd} stroke={C.ink} strokeWidth="1.2" />
                </svg>
                <p className="serif text-7xl md:text-8xl mt-2" style={{ color: C.ink }}>The End.</p>
                <p className="mt-5 text-sm font-medium" style={{ color: C.mute }}>— or just the beginning of your credential story.</p>
              </div>
            </div>
          </div>
        </Section>

        <footer className="py-10 text-xs" style={{ background: C.ink, color: 'rgba(244,239,228,0.6)' }}>
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-wrap justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/credsure-logo-main.webp" alt="CredSure" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
              <span>· The execution platform for intelligent credentialing · © 2026</span>
            </div>
            <span className="serif italic" style={{ color: C.red }}>Munich · Singapore</span>
          </div>
        </footer>
      </div>
    </>
  );
}
