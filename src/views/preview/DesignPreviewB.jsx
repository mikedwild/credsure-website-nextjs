"use client";
/**
 * Blueprint B — Beamery-inspired homepage mockup (v3).
 *
 * Rebuilt to match beamery.com's actual DNA:
 *  - Clean enterprise feel — generous whitespace, light/cream base.
 *  - Headline structure: "The AI Platform For [bold accent] Workforce
 *    Transformation" — sans-serif with bolded accent phrase.
 *  - Signature: 4 platform pillar tabs (Data Platform / Workforce
 *    Intelligence / Agentic AI / Execution Suite) — clicking each
 *    reveals an inline panel with description + Explore link.
 *  - "Meet Ray, your AI Talent Advisor" — named character mascot
 *    rendered as a soft gradient orb with conversational vibe.
 *  - 4-audience grid: Executives / HR / Recruiters / Candidate.
 *  - Workday + SAP integration callouts with inline pull quotes.
 *  - Fortune-500 customer story cards with metadata: Employees,
 *    Headquarters, Industry, tags, title, body, "Read case study".
 *  - Quote-rich UX — multiple attributed pull quotes throughout.
 *
 * Loaded scoped to this preview. Delete once direction is picked.
 */
import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, ArrowUpRight, Quote, Database, Brain, Sparkles, Workflow, Building2, Users, UserCheck, BadgeCheck } from 'lucide-react';

const C = {
  // Beamery's clean enterprise palette.
  paper: '#FFFFFF',
  cream: '#F8F5F0',
  cream2: '#EFEBE3',
  ink: '#181B23',
  ink2: '#3A3F4D',
  mute: '#6B6F7A',
  line: '#E2DDD2',
  // Signature warm orange-coral accent (from logo) — used sparingly.
  coral: '#E45530',
  coralDeep: '#C7411F',
  // Soft accent tints for tabs/cards.
  sand: '#F2EAD8',
  sage: '#D9E0D2',
  sky: '#D6DDE4',
  blush: '#F0DAD2',
};

// ─── Beamery's signature: clean platform-pillar tabs ───
const PillarTab = ({ icon: Icon, name, active, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-4 py-3 transition-all whitespace-nowrap" style={{
    color: active ? C.ink : C.mute,
    borderBottom: active ? `2px solid ${C.coral}` : `2px solid transparent`,
  }}>
    <Icon className="w-4 h-4" />
    <span className="text-sm font-semibold">{name}</span>
  </button>
);

const Section = ({ children, bg = C.paper, id, className = '' }) => (
  <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
    <div className="max-w-[1240px] mx-auto px-6 md:px-10">{children}</div>
  </section>
);

// "Ray" — the AI Talent Advisor character (soft gradient orb mascot)
const Ray = ({ size = 220 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full" style={{
      background: `radial-gradient(circle at 30% 30%, #FFFFFF 0%, ${C.coral} 30%, ${C.coralDeep} 70%, ${C.ink} 100%)`,
      boxShadow: `0 24px 60px -16px ${C.coral}66`,
    }} />
    <div className="absolute inset-[12%] rounded-full" style={{
      background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)`,
    }} />
    {/* small pulse ring */}
    <div className="absolute -inset-3 rounded-full pointer-events-none" style={{ border: `1px dashed ${C.coral}55` }} />
  </div>
);

export default function DesignPreviewB() {
  const [tab, setTab] = React.useState(0);
  const pillars = [
    { name: 'Data Platform', icon: Database, title: 'Build on connected, trusted data', body: "Bring together fragmented data on credentials, roles, recipients, and the market to create a dynamic, reliable source of truth. CredSure's platform connects your ecosystem, powering every decision with a consistent view of your credential landscape." },
    { name: 'Workforce Intelligence', icon: Brain, title: 'Turn insight into strategic advantage', body: "Model future scenarios, uncover credential risks, and understand how trust gets earned. With CredSure's Intelligence Suite, you can plan with precision: balancing automation, reskilling, and verification to meet your goals." },
    { name: 'Agentic AI', icon: Sparkles, title: 'Meet Ray, your AI Credential Advisor', body: "Ray is your embedded, agentic AI consultant: built to help you understand and shape the future of credentials. Built on robust ethical AI models, Ray accelerates workflows and delivers transparent, context-aware recommendations for faster, smarter decisions." },
    { name: 'Execution Suite', icon: Workflow, title: 'Activate credential strategies faster', body: "Move from planning to action with AI-powered issuing, matching, and verification — fully integrated into your existing HR systems. CredSure connects across your tech stack to unify workflows and accelerate the execution of your credential strategy." },
  ];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />

      <style>{`
        .bp-b { background:${C.paper}; color:${C.ink}; font-family:'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing:antialiased; }
        .bp-b .display { font-weight:700; letter-spacing:-0.025em; line-height:1.05; }
        .bp-b .display-md { font-weight:700; letter-spacing:-0.018em; line-height:1.1; }
        /* Gradient accent treatment — used on the bold accent words throughout. */
        .bp-b .grad-text { background: linear-gradient(95deg, #F2A03D 0%, ${C.coral} 38%, ${C.coralDeep} 72%, #8B2A18 100%); -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent; }
        .bp-b .grad-text-soft { background: linear-gradient(95deg, ${C.coral} 0%, #E8732B 100%); -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent; }
        .bp-b .grad-text-warm { background: linear-gradient(95deg, #D9A03A 0%, ${C.coral} 60%, ${C.coralDeep} 100%); -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent; }
        .bp-b .btn-primary { background:${C.ink}; color:${C.paper}; padding:0.85rem 1.5rem; font-weight:600; font-size:0.92rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; transition:background 200ms ease; }
        .bp-b .btn-primary:hover { background:${C.coral}; }
        .bp-b .btn-secondary { background: linear-gradient(95deg, ${C.coral}, ${C.coralDeep}); color:#FFFFFF; padding:0.85rem 1.5rem; font-weight:600; font-size:0.92rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; transition:filter 200ms ease, transform 200ms ease; box-shadow:0 8px 24px -8px ${C.coral}55; }
        .bp-b .btn-secondary:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .bp-b .btn-ghost { color:${C.ink}; padding:0.85rem 1.5rem; font-weight:600; font-size:0.92rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; border:1px solid ${C.ink}; }
        .bp-b .pill { display:inline-flex; align-items:center; gap:0.4rem; padding:0.35rem 0.85rem; border-radius:9999px; font-size:0.74rem; font-weight:600; }
        .bp-b .meta { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.16em; color:${C.mute}; font-weight:600; }
      `}</style>

      <div className="bp-b min-h-screen">
        {/* preview chrome */}
        <div className="px-6 md:px-10 py-2.5 flex items-center justify-between text-xs" style={{ background: C.ink, color: C.cream }}>
          <span>CredSure · Design preview <span className="font-semibold" style={{ color: C.coral }}>Blueprint B — Beamery-inspired</span></span>
          <Link to="/preview/design" className="underline hover:no-underline" data-testid="preview-back-to-index">← Back to options</Link>
        </div>

        {/* nav */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <img src="/credsure-logo-main.webp" alt="CredSure" className="h-7" />
          <nav className="hidden md:flex gap-7 text-sm font-medium" style={{ color: C.ink }}>
            <span>Platform</span><span>Solutions</span><span>Resources</span><span>Customers</span><span>Pricing</span>
          </nav>
          <div className="flex items-center gap-3">
            <button className="btn-ghost text-sm">Why CredSure</button>
            <button className="btn-secondary text-sm">Book a demo</button>
          </div>
        </header>

        {/* ─── 1. HERO — restrained editorial sans ─── */}
        <Section className="!pt-12 !pb-16">
          <div className="max-w-4xl">
            <h1 className="display text-[52px] md:text-[88px]">
              The AI Platform For <strong className="grad-text">Credential Transformation</strong>
            </h1>
            <p className="mt-7 text-lg md:text-xl max-w-2xl" style={{ color: C.ink2 }}>
              Connect credential strategy to business outcomes with <span className="grad-text-soft font-semibold">real-time intelligence</span> on people, skills, and tasks.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button className="btn-primary" data-testid="preview-b-primary-cta">Why CredSure</button>
              <button className="btn-secondary">Book a demo</button>
            </div>
          </div>
        </Section>

        {/* ─── 2. Platform pillars — 4 tabs with inline panel ─── */}
        <Section bg={C.cream} className="!py-24">
          <div className="mb-10">
            <h2 className="display text-4xl md:text-6xl">Explore Our <span className="grad-text-warm">Credential Intelligence</span> Platform</h2>
          </div>
          {/* Tab strip */}
          <div className="flex flex-wrap gap-1 border-b" style={{ borderColor: C.line }}>
            {pillars.map((p, i) => (
              <PillarTab key={p.name} icon={p.icon} name={p.name} active={tab === i} onClick={() => setTab(i)} />
            ))}
          </div>
          {/* Active panel */}
          <div className="mt-12 grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <p className="meta mb-3">{pillars[tab].name}</p>
              <h3 className="display text-3xl md:text-5xl">{pillars[tab].title}</h3>
              <p className="mt-6 text-base md:text-lg" style={{ color: C.ink2 }}>{pillars[tab].body}</p>
              <button className="btn-ghost mt-8 text-sm">Explore the CredSure Platform <ArrowUpRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="md:col-span-5 flex justify-center">
              {tab === 2 ? (
                /* Ray — AI Credential Advisor */
                <div className="text-center">
                  <Ray size={240} />
                  <p className="mt-6 text-sm font-semibold" style={{ color: C.coral }}>Meet Ray</p>
                  <p className="text-xs" style={{ color: C.mute }}>Your AI Credential Advisor</p>
                </div>
              ) : (
                /* Generic UI panel placeholder per pillar */
                <div className="rounded-2xl p-6 w-full" style={{ background: C.paper, border: `1px solid ${C.line}`, boxShadow: '0 12px 40px -16px rgba(24,27,35,0.16)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold" style={{ color: C.coral }}>{pillars[tab].name}</p>
                    <span className="pill" style={{ background: C.sage, color: C.ink }}>● live</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { l: ['Cambridge cohort 26', 'Salesforce 2026 Q4', 'TÜV onboarding', 'Fraunhofer Skills Passport'][tab], v: 92, c: C.coral },
                      { l: 'In progress', v: 64, c: C.sand },
                      { l: 'Pending review', v: 38, c: C.sky },
                      { l: 'Verified', v: 100, c: C.sage },
                    ].map(r => (
                      <div key={r.l} className="flex items-center gap-3">
                        <p className="text-xs font-medium w-32 shrink-0" style={{ color: C.ink2 }}>{r.l}</p>
                        <div className="flex-1 h-2 rounded-full" style={{ background: C.cream2 }}>
                          <div className="h-full rounded-full" style={{ background: r.c, width: `${r.v}%` }} />
                        </div>
                        <span className="text-xs font-bold w-10 text-right">{r.v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ─── 3. Andi Zyka pull quote (Salesforce) ─── */}
        <Section bg={C.paper} className="!py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="w-10 h-10 mx-auto mb-5" style={{ color: C.coral }} />
            <p className="display text-3xl md:text-5xl" style={{ color: C.ink, lineHeight: 1.15 }}>
              "CredSure is a strategic tool and a <strong className="grad-text">strategic investment</strong> that we made that is going to ultimately <strong className="grad-text-warm">help us find the right credentials</strong> at our institution that will allow us <strong className="grad-text-soft">to innovate, deliver, and expand</strong> as an organisation."
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full" style={{ background: `linear-gradient(135deg, ${C.coral}, ${C.coralDeep})` }} />
              <div className="text-left">
                <p className="text-sm font-bold">Andi Zyka</p>
                <p className="text-xs" style={{ color: C.mute }}>Director, Credentialing Product Management</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 4. Audience cards — 4-up ─── */}
        <Section bg={C.cream}>
          <div className="mb-12">
            <h2 className="display text-4xl md:text-6xl">Unlock <span className="grad-text">Data-Driven Credential Decisions</span> At Every Level</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { name: 'Executives', icon: Building2, body: 'Align your credential strategy with your business vision. Ensure you have the right skills in place to meet your goals, navigate change, and lead with confidence.' },
              { name: 'Human Resources', icon: Users, body: 'Proactively manage risk, better advise the business, and support credential development by integrating unified skills data and ethical AI into your processes.' },
              { name: 'Verifiers', icon: UserCheck, body: 'Verify credentials in milliseconds. Use AI and actionable insights around recipient skills and authenticity to build diverse, high-trust pipelines.' },
              { name: 'Recipient Experiences', icon: BadgeCheck, body: 'Discover relevant credentials, and map out a clear path to career success. Our AI platform connects skills and ambitions with the right opportunities.' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <article key={a.name} className="rounded-2xl p-7 flex flex-col" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <Icon className="w-8 h-8 mb-5" style={{ color: C.coral }} strokeWidth={1.5} />
                  <h3 className="display-md text-2xl">{a.name}</h3>
                  <p className="mt-3 text-sm flex-1" style={{ color: C.ink2 }}>{a.body}</p>
                  <button className="mt-5 text-sm font-bold inline-flex items-center gap-1" style={{ color: C.coral }}>
                    {a.name.split(' ')[0]} Solutions <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </article>
              );
            })}
          </div>
        </Section>

        {/* ─── 5. Supercharge Your HR Ecosystem — integration callouts with quotes ─── */}
        <Section bg={C.paper}>
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <h2 className="display text-4xl md:text-5xl">Supercharge Your <span className="grad-text-warm">HR Ecosystem</span></h2>
              <p className="mt-6 text-base md:text-lg" style={{ color: C.ink2 }}>
                Maximise your investment in systems like Workday and SAP. CredSure connects and enhances your data, for dynamic credential intelligence you can apply throughout the issuance lifecycle.
              </p>
              <button className="btn-ghost mt-7 text-sm">Discover integrations <ArrowUpRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="md:col-span-7 space-y-5">
              {[
                { quote: "We are excited for CredSure to integrate with our Talent Intelligence Hub. Our joint customers will <strong class='grad-text'>realise the full value</strong> of the Talent Intelligence Hub and <strong class='grad-text-soft'>accelerate their journey</strong> to becoming skill-based organisations.", name: 'Josh Gosliner', role: 'Vice President, Product Strategy · Workday' },
                { quote: "CredSure was the clear choice for EisnerAmper due to its <strong class='grad-text-warm'>close connection with Workday</strong>… CredSure's <strong class='grad-text'>strong capabilities</strong>, and the <strong class='grad-text-soft'>team that was involved</strong> from start to finish… nothing but <strong class='grad-text'>the best</strong>.", name: 'Joe Mazzo', role: 'Director, HR Information Technology · EisnerAmper' },
              ].map((q, i) => (
                <article key={i} className="rounded-2xl p-7" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
                  <p className="text-base leading-relaxed" style={{ color: C.ink }} dangerouslySetInnerHTML={{ __html: `"${q.quote}"` }} />
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full" style={{ background: i ? C.sand : C.sage }} />
                    <div>
                      <p className="text-sm font-bold">{q.name}</p>
                      <p className="text-xs" style={{ color: C.mute }}>{q.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── 6. Customer story cards with metadata ─── */}
        <Section bg={C.cream}>
          <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
            <div className="max-w-2xl">
              <h2 className="display text-4xl md:text-6xl">See How Enterprises Are <span className="grad-text">Transforming</span> Their Credentials</h2>
            </div>
            <div className="flex gap-3">
              <button className="btn-ghost text-sm">View all case studies</button>
              <button className="btn-secondary text-sm">Book a demo</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                emp: '140,000+', hq: 'United States', ind: 'Manufacturing', tags: ['Workforce Intelligence'],
                title: 'Using AI to supercharge Flex\'s skills-based credential strategy',
                body: "Flex chose CredSure for its AI capabilities — helping them transform unstructured credential data, including job descriptions, into a customised skills framework. They can now match recipients to credentials, with greater consistency, agility, and confidence.",
                logo: 'Flex', accent: C.sand,
              },
              {
                emp: '75,000+', hq: 'United States', ind: 'Cloud Computing', tags: ['Talent Acquisition', 'Workforce Intelligence'],
                title: 'Embracing skills-based transformation with CredSure\'s AI platform',
                body: "Salesforce was able to improve the quality of their credentials, and reduce risks associated with poor-quality data, thanks to CredSure. Their integrated Credential CRM provides real-time AI-powered recommendations.",
                logo: 'Salesforce', accent: C.sky,
                quote: { text: 'Using credentials as currency allows you to verify faster and verify better, because you\'re looking at the skill, not just the individual.', name: 'Andi Zyka', role: 'Director, Employee Success · Salesforce' },
              },
              {
                emp: '30,000+', hq: 'Liechtenstein', ind: 'Construction', tags: ['Talent Acquisition', 'Workforce Intelligence'],
                title: 'Planning to save $260M by finding the right credentials, faster',
                body: "Hilti has put CredSure at the heart of a more efficient and proactive credential strategy, where they can nurture even passive contacts — using unified skills data to meet big credentialing targets.",
                logo: 'Hilti', accent: C.sage,
              },
              {
                emp: '225,000+', hq: 'United States', ind: 'Financial Services', tags: ['Talent Acquisition', 'Talent Experience'],
                title: 'Powering veteran credentialing through technology',
                body: "With CredSure, Wells Fargo gained new operational efficiencies, created a unified data ecosystem to manage credential data, and ultimately engaged and supported veterans as they transitioned credentials to civilian careers.",
                logo: 'Wells Fargo', accent: C.blush,
                quote: { text: "Since we've adopted CredSure, it's been a real game-changer. We've seen a 700% increase in military credential seekers from before using CredSure to now.", name: 'Cameron Crossley', role: 'Data Analyst · Wells Fargo' },
              },
            ].map((cs, i) => (
              <article key={i} className="rounded-2xl overflow-hidden" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                <div className="grid grid-cols-3 px-7 py-5 gap-4" style={{ background: cs.accent }}>
                  <div>
                    <p className="meta">Employees</p>
                    <p className="display-md text-xl mt-1">{cs.emp}</p>
                  </div>
                  <div>
                    <p className="meta">Headquarters</p>
                    <p className="text-sm font-bold mt-1.5">{cs.hq}</p>
                  </div>
                  <div>
                    <p className="meta">Industry</p>
                    <p className="text-sm font-bold mt-1.5">{cs.ind}</p>
                  </div>
                </div>
                <div className="p-7">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cs.tags.map(t => (
                      <span key={t} className="pill" style={{ background: C.cream, color: C.ink2, border: `1px solid ${C.line}` }}>{t}</span>
                    ))}
                  </div>
                  <h3 className="display-md text-2xl">{cs.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: C.ink2 }}>{cs.body}</p>
                  {cs.quote && (
                    <blockquote className="mt-5 p-4 rounded-xl" style={{ background: C.cream, borderLeft: `3px solid ${C.coral}` }}>
                      <p className="text-sm italic" style={{ color: C.ink2 }}>"{cs.quote.text}"</p>
                      <p className="mt-2 text-xs font-bold">{cs.quote.name}</p>
                      <p className="text-xs" style={{ color: C.mute }}>{cs.quote.role}</p>
                    </blockquote>
                  )}
                  <div className="mt-5 pt-5 border-t flex items-center justify-between" style={{ borderColor: C.line }}>
                    <p className="text-sm font-bold">{cs.logo}</p>
                    <button className="text-sm font-bold flex items-center gap-1.5" style={{ color: C.coral }}>Read case study <ArrowUpRight className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 7. Final CTA ─── */}
        <Section bg={C.paper} className="!py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-4xl md:text-6xl">Transform your credentials with <strong className="grad-text">AI-powered credential intelligence.</strong></h2>
            <button className="btn-secondary mt-10">Book a demo <ArrowRight className="w-4 h-4" /></button>
          </div>
        </Section>

        <footer className="py-10 text-xs" style={{ background: C.ink, color: 'rgba(248,245,240,0.55)' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex flex-wrap justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/credsure-logo-main.webp" alt="CredSure" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
              <span>· The AI platform for credential transformation · © 2026</span>
            </div>
            <span style={{ color: C.coral }}>Munich · Singapore</span>
          </div>
        </footer>
      </div>
    </>
  );
}
