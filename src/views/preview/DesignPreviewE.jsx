"use client";
/**
 * Blueprint E — Lattice-inspired homepage mockup (v2).
 *
 * Rebuilt to actually match lattice.com. The real Lattice does NOT use
 * Fraunces serif italics on cream — it uses a CLEAN MODERN SANS
 * (geometric grotesque) on warm off-white, and its signature element
 * is a MODULAR PASTEL-CARD GRID where each platform pillar gets its
 * own colored card with a real product UI screenshot embedded.
 *
 * Sections in order:
 *  1. Hero — clean dark sans headline, simple CTA pair, single big
 *     hero card with product UI in a soft pastel panel.
 *  2. Platform pillar grid — 5 pastel-colored modular cards
 *     (Performance, Goals, Engagement, Grow, Compensation).
 *  3. AI Agent feature — single dominant pastel card.
 *  4. Habits row — 3 cards, each with a UI screenshot.
 *  5. Testimonial grid — compact name + role + logo + photo.
 *  6. Integrations — square icon-tile grid.
 *  7. Resources row — 4 mini-cards.
 *  8. Final CTA — minimal, generous spacing.
 *
 * Loaded scoped to this preview so fonts/vars don't leak into the live
 * site. Delete once direction is picked.
 */
import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, ArrowUpRight, Sparkles, Award, ShieldCheck, BarChart3, Target, Heart, TrendingUp, Coins } from 'lucide-react';

const C = {
  // Lattice's actual warm off-white base.
  cream: '#FAF6EF',
  cream2: '#F2EBDD',
  paper: '#FFFFFF',
  ink: '#161614',
  ink2: '#3C3A36',
  mute: '#7A7568',
  line: '#E6DDC8',
  // Pastel module-card colors — Lattice's signature palette.
  pPerf: '#F1D7CC',   // dusty peach (Performance)
  pGoals: '#E2D4F2',  // soft lavender (Goals)
  pEng: '#D8E5DA',    // sage mint (Engagement)
  pGrow: '#FCE7B5',   // butter yellow (Grow)
  pComp: '#F7C8C5',   // blush pink (Compensation)
  pAgent: '#1E2440',  // deep ink-blue for AI Agent feature card
  // Subtle dark accent for body text.
  red: '#C8463A',
};

const Section = ({ children, bg = C.cream, id, className = '' }) => (
  <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
    <div className="max-w-[1240px] mx-auto px-6 md:px-10">{children}</div>
  </section>
);

// Module link header — tiny eyebrow + arrow.
const ModuleLabel = ({ children, color = C.ink }) => (
  <div className="flex items-center justify-between mb-3">
    <span className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color }}>
      {children} <ArrowUpRight className="w-3.5 h-3.5" />
    </span>
  </div>
);

// Lattice-style pretend product UI panel — minimal, colored.
const UIPanel = ({ accent, title, rows = 4, mode = 'list' }) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 12px 24px -16px rgba(22,22,20,0.18)' }}>
    <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#FBFAF7', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="w-2 h-2 rounded-full" style={{ background: '#D8D2C2' }} />
      <div className="w-2 h-2 rounded-full" style={{ background: '#D8D2C2' }} />
      <div className="w-2 h-2 rounded-full" style={{ background: '#D8D2C2' }} />
      <span className="ml-2 text-[10px] font-medium" style={{ color: '#9A9385' }}>{title}</span>
    </div>
    <div className="p-4 space-y-2">
      {mode === 'list' && Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full" style={{ background: accent, opacity: 0.4 + (i * 0.12) }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-1.5 rounded" style={{ background: accent, width: `${88 - i * 8}%`, opacity: 0.7 }} />
            <div className="h-1 rounded" style={{ background: '#E5DFD0', width: `${64 - i * 7}%` }} />
          </div>
          <div className="text-[9px] font-bold" style={{ color: accent }}>{(95 - i * 6)}%</div>
        </div>
      ))}
      {mode === 'bars' && (
        <div className="flex items-end gap-1.5 h-32 pt-2">
          {[42, 58, 50, 66, 72, 64, 78, 84, 90, 86, 94, 98].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i >= 9 ? accent : '#EAE3D2' }} />
          ))}
        </div>
      )}
      {mode === 'cards' && (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: '#FBFAF7', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="aspect-[4/3] rounded mb-2" style={{ background: accent, opacity: 0.4 + i * 0.15 }} />
              <div className="h-1.5 rounded" style={{ background: '#E5DFD0', width: '80%' }} />
            </div>
          ))}
        </div>
      )}
      {mode === 'matrix' && (
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-square rounded" style={{ background: accent, opacity: 0.18 + (Math.random() * 0.55) }} />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default function DesignPreviewE() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      />

      <style>{`
        .bp-e { background:${C.cream}; color:${C.ink}; font-family:'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing:antialiased; font-feature-settings: 'ss01', 'cv11'; }
        .bp-e .display { font-weight:800; letter-spacing:-0.045em; line-height:0.98; }
        .bp-e .display-md { font-weight:700; letter-spacing:-0.025em; line-height:1.05; }
        .bp-e .btn-primary { background:${C.ink}; color:${C.cream}; padding:0.85rem 1.4rem; font-weight:600; font-size:0.9rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; transition: background 200ms ease; }
        .bp-e .btn-primary:hover { background:${C.ink2}; }
        .bp-e .btn-ghost { color:${C.ink}; padding:0.85rem 1.4rem; font-weight:600; font-size:0.9rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; border:1px solid ${C.ink}; }
        .bp-e .btn-ghost:hover { background:${C.ink}; color:${C.cream}; }
        .bp-e .module-card { border-radius:28px; padding:2rem; transition: transform 250ms ease; }
        .bp-e .module-card:hover { transform: translateY(-4px); }
        .bp-e .pill { display:inline-flex; align-items:center; gap:0.4rem; padding:0.35rem 0.85rem; border-radius:9999px; font-size:0.74rem; font-weight:600; background:${C.paper}; border:1px solid ${C.line}; }
      `}</style>

      <div className="bp-e min-h-screen">
        {/* preview chrome */}
        <div className="px-6 md:px-10 py-2.5 flex items-center justify-between text-xs" style={{ background: C.ink, color: C.cream }}>
          <span>CredSure · Design preview <span className="font-semibold" style={{ color: C.pPerf }}>Blueprint E — Lattice-inspired</span></span>
          <Link to="/preview/design" className="underline hover:no-underline" data-testid="preview-back-to-index">← Back to options</Link>
        </div>

        {/* Top announcement strip — Lattice-style */}
        <div className="text-center text-xs py-2.5 font-medium" style={{ background: C.ink, color: C.cream }}>
          CredVerse 2026 — Credentials + AI: A New Era of Trust · <span className="underline">Register now →</span>
        </div>

        {/* nav */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <img src="/credsure-logo-main.webp" alt="CredSure" className="h-7" />
          <nav className="hidden md:flex gap-7 text-sm font-medium" style={{ color: C.ink }}>
            <span>Platform</span><span>Use cases</span><span>Pricing</span><span>Compare</span><span>Resources</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm font-medium" style={{ color: C.ink }}>Log in</span>
            <button className="btn-primary text-sm">Request a demo</button>
          </div>
        </header>

        {/* ─── 1. HERO ─── */}
        <Section className="!pt-12 !pb-20">
          <div className="max-w-4xl">
            <h1 className="display text-[60px] md:text-[104px]" style={{ color: C.ink }}>
              Trusted credentials are issued here.
            </h1>
            <p className="mt-7 text-lg md:text-xl max-w-2xl" style={{ color: C.ink2 }}>
              CredSure is your team's daily destination for credentialing, combining the best people and AI tools to help recipients grow, issuers lead, and institutions succeed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="btn-primary" data-testid="preview-e-primary-cta">Request a demo <ArrowRight className="w-4 h-4" /></button>
              <button className="btn-ghost">Take a tour <ArrowUpRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Big offset hero card */}
          <div className="mt-20 relative">
            <div className="module-card relative" style={{ background: C.pPerf, padding: '3rem' }}>
              <div className="grid md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-5">
                  <ModuleLabel>Platform overview</ModuleLabel>
                  <h2 className="display text-4xl md:text-5xl">Issue, verify, govern,<br />and grow trust.</h2>
                  <p className="mt-4 text-base" style={{ color: C.ink2 }}>One platform for the entire credential lifecycle. From bulk issuance to offline verification.</p>
                  <button className="btn-ghost mt-6 text-sm" style={{ background: '#FFFFFF', borderColor: C.ink }}>Take a tour <ArrowUpRight className="w-3.5 h-3.5" /></button>
                </div>
                <div className="md:col-span-7">
                  <UIPanel accent={C.red} title="credsure.io · Performance overview" rows={5} mode="list" />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 2. Platform pillars — 5 pastel modular cards ─── */}
        <Section bg={C.cream}>
          <div className="grid md:grid-cols-12 gap-5">
            {/* Big card — Performance */}
            <div className="md:col-span-7 module-card" style={{ background: C.pPerf }}>
              <ModuleLabel><Award className="w-3.5 h-3.5" /> Performance</ModuleLabel>
              <h3 className="display-md text-3xl md:text-4xl">Drive issuance when you need it most.</h3>
              <p className="mt-2 text-base" style={{ color: C.ink2 }}>Identify your best templates, scale the rest.</p>
              <div className="mt-6">
                <UIPanel accent={C.red} title="Performance · last 12 weeks" mode="bars" />
              </div>
            </div>
            {/* Goals & OKRs */}
            <div className="md:col-span-5 module-card" style={{ background: C.pGoals }}>
              <ModuleLabel><Target className="w-3.5 h-3.5" /> Goals & OKRs</ModuleLabel>
              <h3 className="display-md text-3xl">Set goals, track progress.</h3>
              <p className="mt-2 text-base" style={{ color: C.ink2 }}>Align your programmes around what matters most.</p>
              <div className="mt-6">
                <UIPanel accent="#7E5BB0" title="Q4 OKRs" rows={4} mode="list" />
              </div>
            </div>
            {/* Engagement */}
            <div className="md:col-span-4 module-card" style={{ background: C.pEng }}>
              <ModuleLabel><Heart className="w-3.5 h-3.5" /> Engagement</ModuleLabel>
              <h3 className="display-md text-2xl md:text-3xl">Survey smarter with AI insights.</h3>
              <p className="mt-2 text-sm" style={{ color: C.ink2 }}>Engage recipients and drive shareability results.</p>
              <div className="mt-5">
                <UIPanel accent="#3F6B47" title="Engagement pulse" mode="matrix" />
              </div>
            </div>
            {/* Grow */}
            <div className="md:col-span-4 module-card" style={{ background: C.pGrow }}>
              <ModuleLabel><TrendingUp className="w-3.5 h-3.5" /> Grow</ModuleLabel>
              <h3 className="display-md text-2xl md:text-3xl">Make credential progression clear.</h3>
              <p className="mt-2 text-sm" style={{ color: C.ink2 }}>Develop your recipients, drive performance.</p>
              <div className="mt-5">
                <UIPanel accent="#B08A2C" title="Skills ladder" rows={4} mode="list" />
              </div>
            </div>
            {/* Compensation */}
            <div className="md:col-span-4 module-card" style={{ background: C.pComp }}>
              <ModuleLabel><Coins className="w-3.5 h-3.5" /> Verification</ModuleLabel>
              <h3 className="display-md text-2xl md:text-3xl">Strategic checks that retain trust.</h3>
              <p className="mt-2 text-sm" style={{ color: C.ink2 }}>Run consistent and fair credential reviews.</p>
              <div className="mt-5">
                <UIPanel accent="#A8403A" title="Verification flow" mode="cards" />
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 3. AI Agent feature card ─── */}
        <Section bg={C.cream}>
          <div className="module-card" style={{ background: C.pAgent, color: C.cream, padding: '3.5rem' }}>
            <div className="grid md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-6">
                <ModuleLabel color={C.cream}><Sparkles className="w-3.5 h-3.5" /> AI Agent</ModuleLabel>
                <h2 className="display text-4xl md:text-5xl mt-2">Unblock issuance and unlock potential with your personal AI Agent.</h2>
                <p className="mt-5 text-base md:text-lg" style={{ color: 'rgba(250,246,239,0.75)' }}>
                  Support recipients, registrars, and issuers alike in doing their best work — by proactively surfacing insights, answering policy questions, and reinforcing positive credential habits.
                </p>
                <button className="btn-primary mt-7 text-sm" style={{ background: C.cream, color: C.ink }}>Meet the Agent <ArrowUpRight className="w-3.5 h-3.5" /></button>
              </div>
              <div className="md:col-span-6">
                <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {[
                    { who: 'AI Agent', msg: 'Cohort Cambridge-26 has 2,140 credentials ready for review. 38 flagged for missing signatures — want me to draft outreach?' },
                    { who: 'You', msg: 'Yes — Slack the registrar.' },
                    { who: 'AI Agent', msg: 'Done. I\'ve also queued the remaining 2,102 for the 14:00 anchor batch. Verification stays at 387ms p99.' },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: i % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.10)' }}>
                      <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: m.who === 'AI Agent' ? C.pPerf : C.cream }}>{m.who}</p>
                      <p className="text-sm" style={{ color: 'rgba(250,246,239,0.92)' }}>{m.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 4. Habits row — three product cards ─── */}
        <Section bg={C.cream}>
          <div className="max-w-3xl mb-10">
            <ModuleLabel><BarChart3 className="w-3.5 h-3.5" /> Habits</ModuleLabel>
            <h2 className="display text-5xl md:text-6xl mt-2">Build trust through everyday habits.</h2>
            <p className="mt-5 text-base md:text-lg" style={{ color: C.ink2 }}>
              Turn daily moments like reviews, audit pings, and recipient feedback into clarity and alignment that boost issuance quality.
            </p>
            <button className="mt-6 text-sm font-semibold underline underline-offset-4" style={{ color: C.ink }}>Learn more →</button>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: 'Reviews', body: 'Ensure productive, regular communication between issuers and recipients.', bg: C.pPerf, accent: C.red },
              { title: 'Weekly Updates', body: 'Proactively track progress, overcome obstacles, and keep every cohort aligned.', bg: C.pEng, accent: '#3F6B47' },
              { title: 'Feedback', body: 'Share real-time feedback to guide credential growth and impact all year long.', bg: C.pGoals, accent: '#7E5BB0' },
            ].map(h => (
              <div key={h.title} className="module-card" style={{ background: h.bg, padding: '1.75rem' }}>
                <UIPanel accent={h.accent} title={`${h.title.toLowerCase()}.app`} rows={3} mode="list" />
                <h3 className="display-md text-2xl mt-5">{h.title}</h3>
                <p className="mt-2 text-sm" style={{ color: C.ink2 }}>{h.body}</p>
              </div>
            ))}
          </div>

          {/* Q&A boards single card */}
          <div className="mt-5 module-card" style={{ background: C.pGrow, padding: '2.5rem' }}>
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <h3 className="display-md text-3xl md:text-4xl">Q&A Boards</h3>
                <p className="mt-3 text-base" style={{ color: C.ink2 }}>Support transparent conversations with a space for every recipient's questions.</p>
                <button className="btn-ghost mt-5 text-sm" style={{ background: '#FFFFFF', borderColor: C.ink }}>Explore <ArrowUpRight className="w-3.5 h-3.5" /></button>
              </div>
              <div className="md:col-span-7">
                <UIPanel accent="#B08A2C" title="Q&A · Cambridge cohort" rows={4} mode="list" />
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 5. Customer testimonial grid ─── */}
        <Section bg={C.cream}>
          <div className="mb-12">
            <ModuleLabel><Award className="w-3.5 h-3.5" /> Customer stories</ModuleLabel>
            <h2 className="display text-5xl md:text-6xl mt-2">Trusted by top performers.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Eleanor Whitfield', role: 'Director of Credentialing', co: 'Cambridge Training', quote: 'CredSure is better than its competitors. It feels like it was made for us. Everything is rooted in raising the trust bar year-on-year.', bg: C.pPerf },
              { name: 'Anya Müller', role: 'Head of Learning', co: 'TÜV Rheinland', quote: 'CredSure listens to us, a lot. And then our suggestions either ship in the next release or are taken seriously as roadmap items.', bg: C.pGoals },
              { name: 'Jorge Costa', role: 'Director of Programs', co: 'Institut Pasteur', quote: 'We wanted to create the most efficient credential issuance system. CredSure helps us remove unnecessary admin while raising the bar.', bg: C.pEng },
              { name: 'Mira Stein', role: 'Head of Operations', co: 'Fraunhofer', quote: 'We\'ve come a long way, and CredSure made that possible. Not by changing who we are, but by helping us do what we already value, better.', bg: C.pGrow },
              { name: 'Liam Nuñez', role: 'Government Affairs', co: 'ETH Zürich', quote: 'What I liked about CredSure was that the bulk-issuance was just really, really good, and easy for our registrars to do.', bg: C.pComp },
              { name: 'Helena Bauer', role: 'CISO', co: 'Deutsche Bahn', quote: 'Having CredSure integrate with Workday gave us the best of both worlds. Workday as system of record, CredSure for credentials.', bg: C.cream2 },
            ].map((t, i) => (
              <article key={i} className="module-card flex flex-col" style={{ background: t.bg, padding: '1.75rem' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
                  <div className="w-7 h-7 rounded-md" style={{ background: 'rgba(0,0,0,0.12)' }} />
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: C.ink }}>{t.quote}</p>
                <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                  <p className="text-sm font-bold" style={{ color: C.ink }}>{t.name}</p>
                  <p className="text-xs" style={{ color: C.ink2 }}>{t.role} @ {t.co}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ─── 6. Integrations grid ─── */}
        <Section bg={C.cream}>
          <div className="max-w-3xl mb-10">
            <ModuleLabel><ShieldCheck className="w-3.5 h-3.5" /> Integrations</ModuleLabel>
            <h2 className="display text-5xl md:text-6xl mt-2">Integrate everything. Align everyone.</h2>
            <p className="mt-5 text-base md:text-lg" style={{ color: C.ink2 }}>
              Connect CredSure with your favourite SIS, HRIS, productivity, and communication tools to keep data flowing and credentials growing.
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {['Moodle', 'Canvas', 'Workday', 'Salesforce', 'HubSpot', 'Slack', 'Okta', 'Microsoft', 'BambooHR', 'ADP', 'Gusto', 'SuccessFactors', 'Teams', 'Outlook', 'Google', 'Personio'].map((name, i) => (
              <div key={name} className="aspect-square rounded-2xl flex items-center justify-center px-2 text-center" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                <span className="text-xs font-bold" style={{ color: C.ink, opacity: 0.7 }}>{name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── 7. Resources ─── */}
        <Section bg={C.cream}>
          <div className="mb-10">
            <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: C.ink }}>Resources</p>
            <h2 className="display text-4xl md:text-5xl mt-2">Power your high-trust institution.</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Library', body: 'Explore the ultimate resource centre for credentialing and operations.', bg: C.pPerf },
              { name: 'CredSure University', body: 'Curriculum, training, and templates to build successful credential programmes.', bg: C.pGoals },
              { name: 'Community', body: 'Join the Resources for Issuers community and connect with other credential leaders.', bg: C.pEng },
              { name: 'Events', body: 'Join us for events and webinars on all things credentialing and trust.', bg: C.pGrow },
            ].map(r => (
              <div key={r.name} className="module-card" style={{ background: r.bg, padding: '1.75rem' }}>
                <div className="w-12 h-12 rounded-2xl mb-5" style={{ background: 'rgba(0,0,0,0.06)' }} />
                <h3 className="display-md text-2xl">{r.name}</h3>
                <p className="mt-2 text-sm" style={{ color: C.ink2 }}>{r.body}</p>
                <span className="text-xs font-bold mt-4 inline-flex items-center gap-1" style={{ color: C.ink }}>Explore <ArrowUpRight className="w-3 h-3" /></span>
              </div>
            ))}
          </div>

          {/* G2 badge bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.red }}>
                <span className="text-white text-xs font-bold">G2</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold" style={{ color: C.ink }}>3,300+ 5-star</p>
                <p className="text-xs" style={{ color: C.mute }}>G2 reviews · ⭐⭐⭐⭐⭐</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.pAgent, color: C.cream }}>
                <span className="text-xs font-bold">'26</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold" style={{ color: C.ink }}>Top 50 SaaS</p>
                <p className="text-xs" style={{ color: C.mute }}>G2 2026 award · Spring leader</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 8. Final CTA ─── */}
        <Section bg={C.cream2} className="!py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="display text-5xl md:text-7xl" style={{ color: C.ink }}>Your credentials are your business.</h2>
            <p className="mt-5 text-base md:text-lg" style={{ color: C.ink2 }}>Ensure both are successful with CredSure.</p>
            <div className="mt-10 flex justify-center flex-wrap gap-3">
              <button className="btn-primary">Request a demo <ArrowRight className="w-4 h-4" /></button>
              <button className="btn-ghost">Take a free tour</button>
            </div>
          </div>
        </Section>

        <footer className="py-10 text-xs" style={{ background: C.ink, color: 'rgba(250,246,239,0.55)' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex flex-wrap justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/credsure-logo-main.webp" alt="CredSure" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
              <span>· The credential platform that institutions love · © 2026</span>
            </div>
            <span style={{ color: C.pPerf }}>Munich · Singapore</span>
          </div>
        </footer>
      </div>
    </>
  );
}
