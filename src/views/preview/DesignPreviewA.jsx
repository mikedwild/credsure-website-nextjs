"use client";
/**
 * Blueprint A — ClickUp-inspired homepage mockup (v3).
 *
 * Rebuilt to match clickup.com's actual DNA:
 *  - Bright, multi-colour, energetic — pink/purple/yellow gradient brand.
 *  - Signature element: a roster of NAMED, COLOURED AGENT CHARACTERS
 *    (Agent Orange + light-blue / yellow / maroon / beige / pink /
 *    green / red blob mascots — Pac-Man-like personalities).
 *  - "Your company's brain" type headline + product feature carousel
 *    (Projects / Chat / Brain MAX / AI Agents / Sprints / Time Tracking
 *    / Calendar / Docs / Whiteboards / Automations / Dashboards).
 *  - ClickUp Brain section with chat-bubble screenshots.
 *  - Forrester ROI stats grid: 384% ROI / $3.9M / 92,400 hrs / <6 mo.
 *  - "Loved by 5M+ teams, 100+ awards" with marquee of G2 badges.
 *  - Enterprise badges (SOC 2 / ISO 27001 / GDPR / HIPAA).
 *
 * Loaded scoped to this preview. Delete once direction is picked.
 */
import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, Sparkles, Star, Zap, Cpu, Lock } from 'lucide-react';

const C = {
  ink: '#15101D',
  paper: '#FFFFFF',
  cream: '#F8F4FF',
  mute: '#5B536E',
  line: '#E8DFFB',
  // ClickUp's signature multi-colour palette.
  pink: '#FF02A6',
  purple: '#7B68EE',
  cyan: '#3DCFFF',
  yellow: '#FFD43B',
  // Agent character body colours.
  aOrange: '#FF7E36',
  aBlue: '#7CC8E8',
  aYellow: '#F4CC4D',
  aMaroon: '#A24252',
  aBeige: '#D4B891',
  aPurple: '#8B6BD8',
  aPink: '#FF8AB8',
  aGreen: '#7BB87E',
  aRed: '#D9412E',
};

// ─── ClickUp's signature: named agent character blob ───
const Agent = ({ name, color = C.aOrange, mask = false, size = 110 }) => (
  <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
    <svg viewBox="0 0 120 130" width={size} height={size * 130 / 120} aria-hidden>
      <defs>
        <radialGradient id={`g-${name}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      {/* Body — friendly blob */}
      <path d="M 60 8 C 90 8, 110 30, 110 60 C 110 88, 100 110, 90 120 L 30 120 C 20 110, 10 88, 10 60 C 10 30, 30 8, 60 8 Z" fill={`url(#g-${name})`} />
      {/* Wave bottom */}
      <path d="M 30 120 Q 40 112 50 120 T 70 120 T 90 120 L 90 122 L 30 122 Z" fill={color} opacity="0.85" />
      {/* Eyes */}
      <ellipse cx="46" cy="58" rx="6" ry="8" fill={C.ink} />
      <ellipse cx="74" cy="58" rx="6" ry="8" fill={C.ink} />
      <ellipse cx="48" cy="55" rx="2" ry="2.5" fill="#FFFFFF" />
      <ellipse cx="76" cy="55" rx="2" ry="2.5" fill="#FFFFFF" />
      {/* Mouth */}
      <path d="M 50 78 Q 60 86 70 78" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Optional superhero mask */}
      {mask && (
        <path d="M 30 48 Q 30 42 38 42 L 82 42 Q 90 42 90 48 L 90 64 Q 90 70 82 70 Q 76 66 60 66 Q 44 66 38 70 Q 30 70 30 64 Z" fill={C.ink} />
      )}
    </svg>
  </div>
);

const Section = ({ children, bg = C.paper, id, className = '' }) => (
  <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
    <div className="max-w-[1280px] mx-auto px-6 md:px-10">{children}</div>
  </section>
);

const FeatureTab = ({ label, active = false, color = C.purple }) => (
  <button className="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap" style={{
    background: active ? color : 'transparent', color: active ? '#FFFFFF' : C.ink,
    border: active ? `1px solid ${color}` : `1px solid ${C.line}`,
  }}>{label}</button>
);

export default function DesignPreviewA() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      />

      <style>{`
        .bp-a { background:${C.paper}; color:${C.ink}; font-family:'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing:antialiased; }
        .bp-a .display { font-weight:900; letter-spacing:-0.045em; line-height:0.96; }
        .bp-a .display-md { font-weight:800; letter-spacing:-0.03em; line-height:1.05; }
        .bp-a .btn-primary { background:linear-gradient(90deg, ${C.pink}, ${C.purple}); color:#FFFFFF; padding:0.95rem 1.6rem; font-weight:700; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; transition:transform 200ms ease, box-shadow 200ms ease; box-shadow:0 8px 24px -8px ${C.pink}66; }
        .bp-a .btn-primary:hover { transform:translateY(-2px); box-shadow:0 14px 36px -8px ${C.pink}99; }
        .bp-a .btn-ghost { color:${C.ink}; padding:0.95rem 1.6rem; font-weight:700; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; border:2px solid ${C.ink}; }
        .bp-a .gradient-text { background:linear-gradient(90deg, ${C.pink} 0%, ${C.purple} 50%, ${C.cyan} 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .bp-a .pill { display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.85rem; border-radius:9999px; font-size:0.74rem; font-weight:700; }
        .bp-a .glow-card { background:#FFFFFF; border:1px solid ${C.line}; border-radius:24px; box-shadow:0 14px 40px -20px rgba(123,104,238,0.18); }
        @keyframes scroll-x { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .bp-a .marquee { animation: scroll-x 40s linear infinite; }
      `}</style>

      <div className="bp-a min-h-screen">
        {/* preview chrome */}
        <div className="px-6 md:px-10 py-2.5 flex items-center justify-between text-xs" style={{ background: C.ink, color: '#FFFFFF' }}>
          <span>CredSure · Design preview <span className="font-semibold" style={{ color: C.pink }}>Blueprint A — ClickUp-inspired</span></span>
          <Link to="/preview/design" className="underline hover:no-underline" data-testid="preview-back-to-index">← Back to options</Link>
        </div>

        {/* Top announcement strip with agent characters */}
        <div className="text-center text-xs py-2.5 font-semibold" style={{ background: 'linear-gradient(90deg, #FF02A6, #7B68EE)', color: '#FFFFFF' }}>
          NEW · AI Super Agents are here. Build your own credential agent →
        </div>

        {/* nav */}
        <header className="max-w-[1280px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <img src="/credsure-logo-main.webp" alt="CredSure" className="h-7" />
          <nav className="hidden md:flex gap-6 text-sm font-semibold" style={{ color: C.ink }}>
            <span className="flex items-center gap-1.5">CredSure 4.0 <span className="pill" style={{ background: C.pink, color: '#FFFFFF', padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>NEW</span></span>
            <span>Agents</span><span>Brain (AI)</span><span>Pricing</span><span>Compare</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm font-semibold">Log in</span>
            <button className="btn-primary text-sm">Get started. It's FREE</button>
          </div>
        </header>

        {/* ─── 1. HERO with floating agents ─── */}
        <Section className="!pt-12 !pb-20 relative overflow-hidden">
          {/* Floating agents around the hero */}
          <div className="hidden md:block absolute top-12 right-12 transform rotate-6"><Agent name="hero-orange" color={C.aOrange} size={120} /></div>
          <div className="hidden md:block absolute top-32 right-44 transform -rotate-12"><Agent name="hero-pink" color={C.aPink} size={80} /></div>
          <div className="hidden md:block absolute bottom-20 right-32 transform rotate-3"><Agent name="hero-blue" color={C.aBlue} size={90} /></div>

          <div className="max-w-3xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
              <span className="flex -space-x-1.5">
                <span className="w-5 h-5 rounded-full" style={{ background: C.aOrange, border: '2px solid #FFFFFF' }} />
                <span className="w-5 h-5 rounded-full" style={{ background: C.aPink, border: '2px solid #FFFFFF' }} />
                <span className="w-5 h-5 rounded-full" style={{ background: C.aBlue, border: '2px solid #FFFFFF' }} />
              </span>
              <span className="text-xs font-bold" style={{ color: C.purple }}>NEW! Introducing Super Agents</span>
            </div>
            <h1 className="display text-[64px] md:text-[120px]">
              Your <span className="gradient-text">credential</span><br />
              brain.
            </h1>
            <ul className="mt-8 space-y-2 text-base md:text-lg max-w-xl" style={{ color: C.ink }}>
              <li><strong>All software:</strong> issuing, verification, audits + 20 more.</li>
              <li><strong>Every AI</strong> polished and personalised with your context.</li>
              <li><strong>Humans &amp; agents</strong> working together to 100× trust.</li>
            </ul>
            <div className="mt-9 flex items-center gap-3">
              <button className="btn-primary"><strong>Get started.</strong> It's FREE</button>
            </div>
            <p className="mt-4 text-xs font-semibold" style={{ color: C.mute }}>Free forever. No credit card.</p>
          </div>

          {/* Feature carousel tab strip */}
          <div className="mt-14 flex flex-wrap items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <FeatureTab label="Projects" active color={C.pink} />
            <FeatureTab label="Chat" />
            <FeatureTab label="Brain MAX" />
            <FeatureTab label="AI Agents" />
            <FeatureTab label="Sprints" />
            <FeatureTab label="Time Tracking" />
            <FeatureTab label="Calendar" />
            <FeatureTab label="Docs" />
            <FeatureTab label="Whiteboards" />
            <FeatureTab label="Automations" />
            <FeatureTab label="Dashboards" />
            <FeatureTab label="Scheduling" />
          </div>

          {/* Hero product screenshot — big purple gradient frame */}
          <div className="mt-6 rounded-3xl p-2" style={{ background: `linear-gradient(135deg, ${C.pink}, ${C.purple})` }}>
            <div className="rounded-[20px] overflow-hidden bg-white" style={{ minHeight: 480 }}>
              <div className="px-5 py-3 flex items-center gap-1.5 border-b" style={{ borderColor: C.line, background: C.cream }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.pink }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.yellow }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.cyan }} />
                <span className="ml-3 text-xs font-medium" style={{ color: C.mute }}>app.credsure.io · Project Management</span>
              </div>
              <div className="grid grid-cols-12 h-[440px]">
                <div className="col-span-3 p-4 border-r space-y-1.5" style={{ borderColor: C.line, background: '#FBFAFE' }}>
                  {['Inbox', 'Pulse', 'Goals', 'Templates', 'Dashboards'].map((l, i) => (
                    <div key={l} className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2" style={{ background: i === 1 ? `${C.purple}11` : 'transparent', color: i === 1 ? C.purple : C.ink }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: [C.pink, C.purple, C.cyan, C.yellow, C.aGreen][i] }} />
                      {l}
                    </div>
                  ))}
                  <div className="pt-3" />
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: C.mute }}>Agents</p>
                  {[
                    { n: 'Intake', c: C.aBlue }, { n: 'Triage', c: C.aYellow },
                    { n: 'Brand', c: C.aGreen }, { n: 'Live Answers', c: C.aBeige },
                  ].map(a => (
                    <div key={a.n} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-2" style={{ color: C.ink2 }}>
                      <span className="w-4 h-4 rounded-full" style={{ background: a.c }} />
                      {a.n}
                    </div>
                  ))}
                </div>
                <div className="col-span-9 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="display-md text-2xl">Pulse — Cambridge cohort 26</p>
                    <span className="pill" style={{ background: C.purple, color: '#FFFFFF' }}>+ Activate Agent</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { stage: 'Intake', count: 4, c: C.pink },
                      { stage: 'Issuing', count: 6, c: C.purple },
                      { stage: 'Verified', count: 9, c: C.cyan },
                    ].map(col => (
                      <div key={col.stage} className="rounded-2xl p-3" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold">{col.stage}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: col.c, color: '#FFFFFF' }}>{col.count}</span>
                        </div>
                        <div className="space-y-2">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="rounded-lg p-2.5 bg-white" style={{ border: `1px solid ${C.line}` }}>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ background: col.c }} />
                                <p className="text-[11px] font-bold">{['Cambridge', 'TÜV', 'Pasteur', 'Fraunhofer', 'ETH', 'Boeing'][(i + col.count) % 6]}</p>
                              </div>
                              <div className="h-1.5 rounded mb-1" style={{ background: C.line, width: '85%' }} />
                              <div className="h-1.5 rounded" style={{ background: C.line, width: '60%' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 2. Trusted by the best ─── */}
        <Section bg={C.paper} className="!py-12">
          <p className="text-center text-sm font-bold uppercase tracking-[0.18em] mb-7" style={{ color: C.mute }}>Trusted by the best</p>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-x-10 gap-y-6 items-center justify-items-center" style={{ opacity: 0.65 }}>
            {['Cambridge', 'TÜV', 'Pasteur', 'Fraunhofer', 'ETH Zürich', 'DB', 'Boeing', 'L\'Oréal', 'Mars', 'Hitachi', 'Sanofi', 'Cognizant', 'Accenture', 'Prudential'].map(l => (
              <p key={l} className="text-base font-bold tracking-tight" style={{ color: C.ink }}>{l}</p>
            ))}
          </div>
        </Section>

        {/* ─── 3. A new era of humans, with Super Agents ─── */}
        <Section bg="#0E0820" className="!py-32 relative overflow-hidden text-white">
          <div className="absolute inset-0 opacity-30" style={{
            background: `radial-gradient(circle at 30% 30%, ${C.purple}, transparent 60%), radial-gradient(circle at 70% 70%, ${C.pink}, transparent 60%)`,
          }} />
          <div className="relative grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6">
              <p className="text-sm font-bold uppercase tracking-[0.22em] mb-4" style={{ color: C.cyan }}>Convergence powerhouse</p>
              <h2 className="display text-5xl md:text-7xl">A new era of humans, with <span className="gradient-text">Super Agents.</span></h2>
              <p className="mt-6 text-lg max-w-md" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Build your own credential agent. Delegate any task. Infinite memory.
              </p>
              <button className="btn-primary mt-8">Build your own agent</button>
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-md text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div className="flex items-center gap-2"><Zap className="w-3 h-3" style={{ color: C.yellow }} /> Delegate any task</div>
                <div className="flex items-center gap-2"><Cpu className="w-3 h-3" style={{ color: C.cyan }} /> Infinite memory</div>
                <div className="flex items-center gap-2"><Sparkles className="w-3 h-3" style={{ color: C.pink }} /> Update task</div>
                <div className="flex items-center gap-2"><Sparkles className="w-3 h-3" style={{ color: C.aGreen }} /> Send email</div>
              </div>
            </div>
            <div className="md:col-span-6 flex justify-center">
              <div className="relative">
                <Agent name="hero-mask" color={C.aOrange} mask size={260} />
                <div className="absolute -top-4 -left-12 transform -rotate-12"><Agent name="side1" color={C.aBlue} size={70} /></div>
                <div className="absolute -bottom-2 -right-10 transform rotate-12"><Agent name="side2" color={C.aPink} size={70} /></div>
                <div className="absolute top-1/2 -right-16 transform -rotate-6"><Agent name="side3" color={C.aGreen} size={60} /></div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 4. AI solutions for every team — agent grid ─── */}
        <Section bg={C.paper}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="display text-5xl md:text-6xl">AI solutions for every team</h2>
            <p className="mt-5 text-base md:text-lg" style={{ color: C.mute }}>Your key workflows, powered by CredSure Agents.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { team: 'Issuing', title: 'Deliver issuance on time, every time', agents: [
                { n: 'Intake Agent', t: 'standardises cohort kickoff', c: C.aBlue },
                { n: 'Assign Agent', t: 'determines task owners', c: C.aYellow },
                { n: 'PM Agent', t: 'tracks deliverables + timelines', c: C.aMaroon },
                { n: 'Live Answers', t: 'keeps everyone informed', c: C.aBeige },
              ]},
              { team: 'Marketing', title: "Maximise marketing's impact and results", agents: [
                { n: 'Brief Agent', t: 'creates campaign briefs', c: C.aBlue },
                { n: 'Content Agent', t: 'drafts promo copy', c: C.aPink },
                { n: 'Brand Agent', t: 'applies guidelines', c: C.aGreen },
                { n: 'Live Intel', t: 'updates core docs', c: C.aYellow },
              ]},
              { team: 'Verification', title: 'Ship faster, more reliable verifications', agents: [
                { n: 'PRD Agent', t: 'creates docs from voice notes', c: C.aPurple },
                { n: 'Triage Agent', t: 'prioritises bugs', c: C.aBeige },
                { n: 'Live Answers', t: 'keeps everyone informed', c: C.aRed },
                { n: 'Codegen Agent', t: 'produces quality code', c: C.aYellow },
              ]},
            ].map(g => (
              <article key={g.team} className="glow-card p-7">
                <h3 className="display-md text-2xl">{g.title}</h3>
                <p className="text-xs uppercase tracking-[0.18em] font-bold mt-3 mb-4" style={{ color: C.purple }}>Replaces: spreadsheets · email · zaps</p>
                <ul className="space-y-3">
                  {g.agents.map(a => (
                    <li key={a.n} className="flex items-center gap-3">
                      <Agent name={`agent-${g.team}-${a.n}`} color={a.c} size={36} />
                      <div>
                        <p className="text-sm font-bold">{a.n}</p>
                        <p className="text-xs" style={{ color: C.mute }}>{a.t}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t flex items-center gap-2 text-sm font-bold" style={{ borderColor: C.line, color: C.purple }}>
                  Explore solution <ArrowRight className="w-4 h-4" />
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 5. ROI — Forrester-style stat grid ─── */}
        <Section bg={C.cream}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="display text-5xl md:text-6xl">It's like adding 15 full-time agents</h2>
            <p className="mt-5 text-base md:text-lg" style={{ color: C.ink2 }}>According to third-party research, CredSure saves the average institution 30k+ hours per year and delivers industry-leading ROI.</p>
            <button className="btn-primary mt-7">Get started</button>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'ROI', stat: '384%', body: 'CredSure delivered 384% ROI over three years, helping institutions unlock significant efficiency gains.', c: C.pink },
              { label: 'Revenue increase', stat: '$3.9M', body: 'CredSure projects drove $3.9M in revenue gains by streamlining work, consolidating tools, and scaling faster.', c: C.purple },
              { label: 'Hours saved', stat: '92,400', body: 'Institutions saved 92,400 hours with CredSure, reducing manual work and recapturing trust at scale.', c: C.cyan },
              { label: 'Payback', stat: '<6 mo', body: 'Customers reached payback in under six months, making CredSure a proven investment with rapid returns.', c: C.yellow },
            ].map(s => (
              <article key={s.label} className="glow-card p-7">
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold mb-2" style={{ color: s.c }}>{s.label}</p>
                <p className="display text-5xl md:text-6xl" style={{ color: s.c }}>{s.stat}</p>
                <p className="text-xs mt-3" style={{ color: C.ink2 }}>{s.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-xs text-center" style={{ color: C.mute }}>*From the 2026 The Total Economic Impact™ of CredSure report from Forrester. <span className="underline">Get the report →</span></p>
        </Section>

        {/* ─── 6. Loved by 5M teams — testimonials ─── */}
        <Section bg={C.paper}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="display text-5xl md:text-6xl">Loved by 500+ institutions, backed by 100+ awards</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Eleanor Whitfield', role: 'Sr. Programme Manager · Cambridge', q: '"CredSure is serving us so we can serve our learners."', bg: `linear-gradient(135deg, ${C.aBlue}, ${C.cyan})` },
              { name: 'Anya Müller', role: 'VP of Learning · TÜV Rheinland', q: "\"It's a low-code platform that helps us automate processes.\"", bg: `linear-gradient(135deg, ${C.aPink}, ${C.pink})` },
              { name: 'Mira Stein', role: 'Chief of Staff · Fraunhofer', q: '"CredSure is the best thing I\'ve rolled out in the past two years."', bg: `linear-gradient(135deg, ${C.aGreen}, ${C.yellow})` },
            ].map(t => (
              <article key={t.name} className="glow-card overflow-hidden">
                <div className="aspect-[4/3] relative" style={{ background: t.bg }}>
                  <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-md text-xs font-bold" style={{ background: 'rgba(255,255,255,0.92)', color: C.ink }}>
                    {t.role.split('·')[1]}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-base font-medium" style={{ color: C.ink }}>{t.q}</p>
                  <p className="mt-3 text-sm font-bold">{t.name}</p>
                  <p className="text-xs" style={{ color: C.mute }}>{t.role}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="text-center mt-8 text-sm font-semibold">Rated <span style={{ color: C.purple }}>4.7/5</span> by 10,000+ users on G2</p>

          {/* G2 award marquee */}
          <div className="mt-10 overflow-hidden">
            <div className="flex gap-3 marquee" style={{ width: 'max-content' }}>
              {Array(2).fill(null).flatMap((_, group) => [
                'Best Software 2026 — Agentic AI', 'Best Software 2026 — AI Products', 'Best Software 2026 — Software',
                'Best Software 2026 — Project Management', 'Winter 2026 Momentum Leader', 'Winter 2026 Leader',
                'High Performer Enterprise', 'Best Software 2026 — Global', 'Best Software 2026 — IT', 'HR Software 2026',
              ].map((b, i) => (
                <div key={`${group}-${i}`} className="shrink-0 px-5 py-3 rounded-full flex items-center gap-2 text-xs font-bold" style={{ background: C.cream, border: `1px solid ${C.line}`, color: C.purple }}>
                  <Star className="w-3.5 h-3.5 fill-current" /> {b}
                </div>
              )))}
            </div>
          </div>
        </Section>

        {/* ─── 7. Enterprise grade ─── */}
        <Section bg={C.cream} className="!py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="display text-5xl md:text-6xl">Enterprise-grade <span className="gradient-text">everything</span></h2>
            <p className="mt-5 text-base md:text-lg" style={{ color: C.ink2 }}>Out of the box security & AI that's even more private than ChatGPT</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA', '24/7 support'].map(b => (
                <div key={b} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <Lock className="w-3.5 h-3.5" style={{ color: C.purple }} />
                  <span className="text-sm font-bold">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── 8. Final CTA — gradient with floating agents ─── */}
        <Section bg={`linear-gradient(135deg, ${C.pink} 0%, ${C.purple} 50%, ${C.cyan} 100%)`} className="!py-32 relative overflow-hidden text-white">
          <div className="hidden md:block absolute top-12 left-12 transform rotate-12"><Agent name="cta1" color={C.aOrange} size={70} /></div>
          <div className="hidden md:block absolute top-20 right-12 transform -rotate-12"><Agent name="cta2" color={C.aYellow} size={90} /></div>
          <div className="hidden md:block absolute bottom-12 right-32 transform rotate-6"><Agent name="cta3" color={C.aGreen} size={60} /></div>
          <div className="text-center max-w-3xl mx-auto relative">
            <h2 className="display text-5xl md:text-7xl">All your work, all your people, all powered by AI</h2>
            <button className="btn-primary mt-10" style={{ background: '#FFFFFF', color: C.ink, boxShadow: '0 10px 32px -8px rgba(0,0,0,0.3)' }}>Get started FREE</button>
          </div>
        </Section>

        <footer className="py-10 text-xs" style={{ background: C.ink, color: 'rgba(255,255,255,0.55)' }}>
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-wrap justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/credsure-logo-main.webp" alt="CredSure" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
              <span>· Your company's credential brain · © 2026</span>
            </div>
            <span style={{ color: C.pink }}>Munich · Singapore</span>
          </div>
        </footer>
      </div>
    </>
  );
}
