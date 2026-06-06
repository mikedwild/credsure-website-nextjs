"use client";
/**
 * Blueprint C — Homerun-inspired homepage mockup (v3).
 *
 * Rebuilt again to be visually OPPOSITE to Lattice. Based on a fresh
 * scrape of homerun.co the true distinct moves are:
 *
 *  - Yellow-warm cream background (NOT grey-cream like Lattice).
 *  - Chunky ROUNDED display font (Recoleta-style) — warm, soft, not
 *    crisp/geometric.
 *  - PINK-CORAL CTAs (not red, not dark).
 *  - Hand-drawn brown-outline rounded SVG "blob" icons as section
 *    markers (the signature ATS / HR / ATS+HR icons).
 *  - SINGLE-COLUMN hero — text + one wide combined screenshot below.
 *  - Trust badges with emoji (😃 🤩) — Capterra + Intercom + G2.
 *  - Two product modules: icon header → H2 → paragraph → bullet list
 *    → wide screenshot. NO pastel coloured cards.
 *  - Plain testimonial cards — just circle photo + quote + role.
 *    No card backgrounds, no pastel tints.
 *  - Final CTA: brown-outline icon illustration + soft message +
 *    2 pink-coral buttons + "15 days free, no credit card needed".
 *
 * Loaded scoped to this preview so fonts/vars don't leak into the live
 * site. Delete once direction is picked.
 */
import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, ArrowUpRight, Check, ShieldCheck, Award, Briefcase, Users } from 'lucide-react';

const C = {
  // Yellow-warm cream — Homerun's true base, distinct from Lattice's cooler off-white.
  cream: '#F5EEDC',
  cream2: '#EFE5CC',
  paper: '#FFFFFF',
  ink: '#1B1812',
  ink2: '#3F362A',
  mute: '#8C7E68',
  line: '#E0D3B5',
  // Pink-coral — Homerun's true CTA colour. Softer than red, warmer than coral.
  pink: '#EE5A6A',
  pinkDeep: '#D6485B',
  // Brown — used in the brown-outline icons.
  brown: '#5C432B',
  // Tertiary tints used very sparingly inside trust badges only.
  butter: '#F2D67A',
  blush: '#F4B5B8',
};

// ─── Section icon — chunky filled circle wrapper around a Lucide icon, in homerun.co's restrained icon style ───
const SectionIcon = ({ icon: Icon, bg = C.butter, size = 80 }) => (
  <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: size, height: size, background: bg }}>
    <Icon className="w-9 h-9" style={{ color: C.ink }} strokeWidth={1.6} />
  </div>
);

// Capterra-style review-star row.
const Stars = ({ color = C.pink, size = 14 }) => (
  <span aria-hidden style={{ color, letterSpacing: '0.05em', fontSize: size }}>★★★★★</span>
);

const Section = ({ children, bg = C.cream, id, className = '' }) => (
  <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
    <div className="max-w-[1180px] mx-auto px-6 md:px-10">{children}</div>
  </section>
);

export default function DesignPreviewC() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      />

      <style>{`
        .bp-c { background:${C.cream}; color:${C.ink}; font-family:'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing:antialiased; letter-spacing:-0.005em; }
        /* Heavy Inter to match homerun.co's clean bold sans-serif headlines (no serif). */
        .bp-c .display { font-family:'Inter', system-ui, sans-serif; font-weight:900; letter-spacing:-0.045em; line-height:0.95; }
        .bp-c .display-md { font-family:'Inter', system-ui, sans-serif; font-weight:800; letter-spacing:-0.03em; line-height:1.05; }
        .bp-c .btn-primary { background:${C.pink}; color:#FFFFFF; padding:0.9rem 1.5rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; transition: background 200ms ease, transform 200ms ease; }
        .bp-c .btn-primary:hover { background:${C.pinkDeep}; transform: translateY(-1px); }
        .bp-c .btn-secondary { background:${C.ink}; color:${C.cream}; padding:0.9rem 1.5rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; }
        .bp-c .btn-secondary:hover { background:${C.ink2}; }
        .bp-c .btn-ghost { color:${C.ink}; padding:0.9rem 1.5rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; border-radius:9999px; background:transparent; border:1.5px solid ${C.ink}; }
        .bp-c .pill { display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.85rem; border-radius:9999px; font-size:0.78rem; font-weight:600; }
      `}</style>

      <div className="bp-c min-h-screen">
        {/* preview chrome */}
        <div className="px-6 md:px-10 py-2.5 flex items-center justify-between text-xs" style={{ background: C.ink, color: C.cream }}>
          <span>CredSure · Design preview <span className="font-semibold" style={{ color: C.pink }}>Blueprint C — Homerun-inspired</span></span>
          <Link to="/preview/design" className="underline hover:no-underline" data-testid="preview-back-to-index">← Back to options</Link>
        </div>

        {/* nav — Homerun's nav is super minimal: logo, log in, two CTAs */}
        <header className="max-w-[1180px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <img src="/credsure-logo-main.webp" alt="CredSure" className="h-7" />
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm font-semibold" style={{ color: C.ink }}>Log in</span>
            <button className="btn-ghost text-sm">Book a demo</button>
            <button className="btn-primary text-sm">Start free trial</button>
          </div>
        </header>

        {/* ─── 1. HERO — single column, text first, screenshot below ─── */}
        <Section className="!pt-12 !pb-16">
          <div className="max-w-4xl">
            <h1 className="display text-[64px] md:text-[110px]">
              Beautiful credentials
              <br />
              for modern teams.
            </h1>
            <p className="mt-8 text-lg md:text-xl max-w-2xl" style={{ color: C.ink2 }}>
              Transform your credential issuing process, create a standout recipient experience, and verify identities at scale — with our simple, easy-to-use products.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="btn-primary" data-testid="preview-c-primary-cta">Try free for 15 days</button>
              <button className="btn-ghost">Book a demo</button>
            </div>

            {/* Trust strip — emoji-style cards, Capterra/Intercom/handshake */}
            <div className="mt-14 grid sm:grid-cols-3 gap-x-12 gap-y-6 max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: C.butter }}>
                  ⭐
                </div>
                <div>
                  <p className="display-md text-2xl">4.7</p>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: C.mute }}>Rating by Capterra users</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: C.blush }}>
                  😃
                </div>
                <div>
                  <p className="display-md text-2xl">98.9% Satisfaction</p>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: C.mute }}>1,500+ Support conversations</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: C.cream2 }}>
                  🤝
                </div>
                <div>
                  <p className="display-md text-2xl">500+ teams</p>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: C.mute }}>issuing credentials with CredSure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wide combined hero screenshot — single horizontal product preview */}
          <div className="mt-16 rounded-[28px] overflow-hidden" style={{ background: C.paper, border: `1px solid ${C.line}`, boxShadow: '0 24px 60px -24px rgba(27,24,18,0.18)' }}>
            <div className="flex items-center gap-1.5 px-5 py-3" style={{ background: C.cream, borderBottom: `1px solid ${C.line}` }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.pink }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.butter }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#9DBE93' }} />
              <span className="ml-3 text-[11px] font-medium" style={{ color: C.mute }}>app.credsure.io · Issuer dashboard</span>
            </div>
            <div className="grid grid-cols-12 h-[480px]">
              {/* sidebar */}
              <div className="col-span-2 border-r p-4 space-y-1.5" style={{ borderColor: C.line, background: '#FAF4E5' }}>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: C.mute }}>Issue</p>
                {['Pipeline', 'Templates', 'Recipients', 'Branding'].map((l, i) => (
                  <div key={l} className="px-2.5 py-1.5 rounded-lg text-xs font-medium" style={{ background: i === 0 ? C.pink : 'transparent', color: i === 0 ? '#FFFFFF' : C.ink }}>
                    {l}
                  </div>
                ))}
                <div className="pt-3" />
                <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: C.mute }}>Verify</p>
                {['Approvals', 'Audit logs', 'Insights'].map(l => (
                  <div key={l} className="px-2.5 py-1.5 rounded-lg text-xs font-medium" style={{ color: C.ink2 }}>{l}</div>
                ))}
              </div>
              {/* pipeline kanban */}
              <div className="col-span-7 p-5 grid grid-cols-3 gap-3" style={{ background: '#FBF6E8' }}>
                {[
                  { name: 'Drafting', count: 4, c: C.butter },
                  { name: 'In review', count: 3, c: C.blush },
                  { name: 'Issuing', count: 2, c: '#C7E0BD' },
                ].map(col => (
                  <div key={col.name} className="rounded-xl p-3" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold">{col.name}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: col.c, color: C.ink }}>{col.count}</span>
                    </div>
                    <div className="space-y-2">
                      {[0, 1, 2].slice(0, col.count).map(i => (
                        <div key={i} className="rounded-lg p-2.5" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ background: col.c }} />
                            <p className="text-[10px] font-bold">{['Cambridge', 'TÜV', 'Pasteur', 'Fraunhofer', 'ETH', 'DB'][i + col.count]}</p>
                          </div>
                          <div className="h-1.5 rounded mb-1" style={{ background: '#E5DCC0', width: '85%' }} />
                          <div className="h-1.5 rounded" style={{ background: '#E5DCC0', width: '60%' }} />
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex -space-x-1.5">
                              {[0, 1, 2].map(a => <div key={a} className="w-4 h-4 rounded-full border" style={{ background: [C.pink, C.butter, C.blush][a], borderColor: C.paper }} />)}
                            </div>
                            <p className="text-[9px]" style={{ color: C.mute }}>{[1240, 240, 50000, 8200][i] || 100} recipients</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* HR / to-do panel */}
              <div className="col-span-3 p-5 border-l" style={{ borderColor: C.line, background: C.paper }}>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: C.mute }}>Today</p>
                <div className="space-y-2.5">
                  {[
                    { t: 'Approve Cambridge cohort', c: C.pink },
                    { t: 'Sign Fraunhofer batch', c: C.butter },
                    { t: 'Audit log → Q4', c: '#9DBE93' },
                    { t: 'Renew Polygon anchor', c: C.blush },
                  ].map(r => (
                    <div key={r.t} className="rounded-lg p-2.5 flex items-center gap-2.5" style={{ background: C.cream }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.c }} />
                      <p className="text-[11px] font-medium flex-1">{r.t}</p>
                      <span className="text-[10px]" style={{ color: C.mute }}>→</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t grid grid-cols-2 gap-2" style={{ borderColor: C.line }}>
                  <div className="text-center">
                    <p className="display-md text-2xl">2,418</p>
                    <p className="text-[10px]" style={{ color: C.mute }}>Issued · this week</p>
                  </div>
                  <div className="text-center">
                    <p className="display-md text-2xl" style={{ color: C.pink }}>98.4%</p>
                    <p className="text-[10px]" style={{ color: C.mute }}>Verified first scan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 2. Customer logo wall — duplicate scrolling-style row ─── */}
        <Section bg={C.cream} className="!py-12">
          <div className="grid grid-cols-3 md:grid-cols-7 gap-x-10 gap-y-7 items-center justify-items-center">
            {['Cambridge', 'TÜV', 'Fraunhofer', 'ETH', 'Pasteur', 'DB', 'Buffer', 'Workday', 'Moodle', 'Canvas', 'Salesforce', 'Okta', 'HubSpot', 'Slack'].map(l => (
              <p key={l} className="text-base md:text-lg font-bold tracking-tight" style={{ color: C.ink, opacity: 0.55 }}>{l}</p>
            ))}
          </div>
        </Section>

        {/* ─── 3. Pricing teaser — chunky icon + inline message ─── */}
        <Section bg={C.cream2} className="!py-12">
          <div className="flex flex-wrap items-center justify-center gap-5 text-center">
            <SectionIcon icon={Briefcase} bg={C.butter} size={56} />
            <p className="text-lg md:text-xl font-medium" style={{ color: C.ink }}>
              Issue and verify credentials starting from <span style={{ color: C.pink, fontWeight: 700 }}>€49 per month.</span>
            </p>
            <Link to="/preview/design-c" className="text-base font-semibold underline underline-offset-4" style={{ color: C.ink }}>View pricing →</Link>
          </div>
        </Section>

        {/* ─── 4. Product module 1 — Issue ─── */}
        <Section bg={C.cream}>
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <SectionIcon icon={Award} bg={C.blush} />
              <h2 className="display mt-6 text-5xl md:text-6xl">Organise your issuing.</h2>
              <p className="mt-5 text-lg" style={{ color: C.ink2 }}>
                A credential-issuing platform that's easy to use, keeps your team aligned, and helps you create a recipient experience that feels human and personal.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'Get an overview of your issuing process',
                  'Save time with automations and templates',
                  "Showcase your institution's story",
                  'Never lose track of a recipient again',
                  'Reduce issuing bias with structured flows',
                  'Improve every step of the credential journey',
                ].map(b => (
                  <li key={b} className="flex items-start gap-3 text-base" style={{ color: C.ink }}>
                    <Check className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.pink }} strokeWidth={3} />
                    {b}
                  </li>
                ))}
              </ul>
              <button className="btn-secondary mt-8">Explore CredSure Issue <ArrowUpRight className="w-4 h-4" /></button>
            </div>

            <div className="md:col-span-7">
              <div className="rounded-[28px] overflow-hidden" style={{ background: C.paper, border: `1px solid ${C.line}`, boxShadow: '0 18px 50px -20px rgba(27,24,18,0.16)' }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold">Templates</p>
                    <span className="pill" style={{ background: C.pink, color: '#FFFFFF' }}>+ New template</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { c: `linear-gradient(135deg, ${C.pink}, ${C.blush})`, t: 'Diploma', n: 28 },
                      { c: `linear-gradient(135deg, ${C.butter}, ${C.pink})`, t: 'Certificate', n: 17 },
                      { c: `linear-gradient(135deg, #C7E0BD, #F4DDA0)`, t: 'Badge', n: 42 },
                      { c: `linear-gradient(135deg, ${C.blush}, ${C.butter})`, t: 'Skills card', n: 9 },
                      { c: `linear-gradient(135deg, ${C.cream2}, #C7E0BD)`, t: 'License', n: 11 },
                      { c: `linear-gradient(135deg, ${C.pink}, ${C.butter})`, t: 'Transcript', n: 6 },
                    ].map((tt, i) => (
                      <div key={i} className="rounded-2xl p-3" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
                        <div className="aspect-[4/3] rounded-xl mb-3 flex items-center justify-center" style={{ background: tt.c }}>
                          <Award className="w-6 h-6 text-white opacity-90" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-bold">{tt.t}</p>
                        <p className="text-[11px]" style={{ color: C.mute }}>{tt.n} issued · this month</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 5. Product module 2 — Verify (mirrored) ─── */}
        <Section bg={C.cream}>
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-7 order-2 md:order-1">
              <div className="rounded-[28px] overflow-hidden" style={{ background: C.paper, border: `1px solid ${C.line}`, boxShadow: '0 18px 50px -20px rgba(27,24,18,0.16)' }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-bold">To-do list</p>
                    <span className="pill" style={{ background: C.cream, color: C.ink, border: `1px solid ${C.line}` }}>Today</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { t: 'Approve 240 Cambridge diplomas', d: 'Due today', c: C.pink },
                      { t: 'Review TÜV cohort 14 templates', d: 'In 2 days', c: C.butter },
                      { t: 'Sign off on Fraunhofer Skills Passport', d: 'Friday', c: '#9DBE93' },
                      { t: 'Audit log export — Q4 regulator', d: 'Next Mon', c: C.blush },
                      { t: 'Renew Polygon anchor batch', d: 'Next Tue', c: '#C7B9E0' },
                    ].map(r => (
                      <div key={r.t} className="rounded-xl p-3.5 flex items-center justify-between gap-3" style={{ background: C.cream, border: `1px solid ${C.line}` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ background: r.c }} />
                          <p className="text-sm font-medium">{r.t}</p>
                        </div>
                        <p className="text-[11px]" style={{ color: C.mute }}>{r.d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t" style={{ borderColor: C.line }}>
                    <div className="rounded-xl p-3 text-center" style={{ background: C.cream }}>
                      <p className="display-md text-2xl">12</p>
                      <p className="text-[10px]" style={{ color: C.mute }}>Pending</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: C.cream }}>
                      <p className="display-md text-2xl" style={{ color: C.pink }}>148</p>
                      <p className="text-[10px]" style={{ color: C.mute }}>Approved</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: C.cream }}>
                      <p className="display-md text-2xl">100%</p>
                      <p className="text-[10px]" style={{ color: C.mute }}>Audit-ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-5 order-1 md:order-2">
              <SectionIcon icon={ShieldCheck} bg="#C7E0BD" />
              <h2 className="display mt-6 text-5xl md:text-6xl">Verify your team.</h2>
              <p className="mt-5 text-lg" style={{ color: C.ink2 }}>
                Approvals, audit logs, regulator exports, and recipient verification — all in one secure, organised place.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'Manage approvals and revocations',
                  'Stay aligned with a flexible audit calendar',
                  'Keep data organised and secure',
                  'Get simple insights at a glance',
                  'Visualise your credential portfolio',
                  'Store every artefact securely in one place',
                ].map(b => (
                  <li key={b} className="flex items-start gap-3 text-base" style={{ color: C.ink }}>
                    <Check className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.pink }} strokeWidth={3} />
                    {b}
                  </li>
                ))}
              </ul>
              <button className="btn-secondary mt-8">Explore CredSure Verify <ArrowUpRight className="w-4 h-4" /></button>
            </div>
          </div>
        </Section>

        {/* ─── 6. Customers — plain quote rows, no card backgrounds ─── */}
        <Section bg={C.cream}>
          <div className="max-w-2xl mb-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: C.pink }}>Customers</p>
            <h2 className="display mt-3 text-5xl md:text-6xl">Teams love CredSure.</h2>
            <p className="mt-5 text-lg" style={{ color: C.ink2 }}>
              CredSure customers share a passion for credibility, brand, and recipient experience. We all agree credentials should be personal, beautiful, and trusted.
            </p>
          </div>

          {/* Homerun Club style ribbon */}
          <div className="mb-12 mt-7 inline-flex items-center gap-3 px-5 py-2 rounded-full" style={{ background: C.ink, color: C.cream }}>
            <span className="text-xs font-bold uppercase tracking-widest">CredSure Club</span>
            <span style={{ color: C.pink }}>· 500+ members</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {[
              { quote: 'CredSure is super easy to use, even if you\'re technically challenged like me. ;-)', name: 'Eleanor Whitfield', role: 'Director of Credentialing, Cambridge Training', av: C.pink },
              { quote: 'The recipient pages we built in CredSure give every cohort a great first impression of our institution.', name: 'Anya Müller', role: 'Head of Learning, TÜV Rheinland', av: C.butter },
              { quote: 'As we grew and issued more, CredSure helped us professionalise our process in a very agile and lightweight way.', name: 'Jorge Costa', role: 'Director of Programs, Pasteur', av: '#C7E0BD' },
              { quote: 'Our credentialing team loves the ease of use and the ability to collaborate on issues and audits.', name: 'Mira Stein', role: 'Head of Operations, Fraunhofer', av: C.blush },
              { quote: "I've used other credential platforms — CredSure excels at organising info. Nothing slips through the cracks.", name: 'Liam Nuñez', role: 'Government Affairs, ETH Zürich', av: '#C7B9E0' },
              { quote: 'CredSure has made an incredible difference to the way we manage credential renewals, audits, and revocations.', name: 'Helena Bauer', role: 'CISO, Deutsche Bahn', av: C.cream2 },
            ].map((t, i) => (
              <div key={i} className="flex flex-col">
                <div className="w-14 h-14 rounded-full mb-4" style={{ background: t.av, border: `1px solid ${C.line}` }} aria-hidden />
                <p className="text-base leading-relaxed flex-1" style={{ color: C.ink }}>"{t.quote}"</p>
                <div className="mt-5">
                  <p className="text-sm font-bold" style={{ color: C.ink }}>{t.name}</p>
                  <p className="text-xs" style={{ color: C.mute }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Review badge strip — Capterra / Intercom / G2 with emoji */}
          <div className="mt-20 grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-5 p-6 rounded-2xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <p className="display text-5xl">4.7</p>
              <div className="flex-1">
                <Stars />
                <p className="mt-1.5 text-xs font-medium" style={{ color: C.ink2 }}>
                  Average review on <strong>Capterra</strong>, independent review site →
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 p-6 rounded-2xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <p className="display text-5xl">98.9%</p>
              <div className="flex-1">
                <p className="text-base">😃 🤩</p>
                <p className="mt-1 text-xs font-medium" style={{ color: C.ink2 }}>Average rating based on <strong>1,500+</strong> Intercom support conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-5 p-6 rounded-2xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <p className="display text-5xl">4.6</p>
              <div className="flex-1">
                <Stars />
                <p className="mt-1.5 text-xs font-medium" style={{ color: C.ink2 }}>Average review from <strong>100+</strong> reviews on G2 review site →</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 7. Final CTA — chunky icon + soft message ─── */}
        <Section bg={C.cream2} className="!py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6"><SectionIcon icon={Users} bg={C.pink} size={80} /></div>
            <h2 className="display text-5xl md:text-7xl" style={{ color: C.ink }}>
              Join 500+ teams<br />issuing with CredSure.
            </h2>
            <div className="mt-10 flex justify-center flex-wrap gap-3">
              <button className="btn-primary">Start free trial <ArrowRight className="w-4 h-4" /></button>
              <button className="btn-ghost">Book a demo</button>
            </div>
            <div className="mt-7 flex items-center justify-center gap-6 text-sm" style={{ color: C.ink2 }}>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: C.pink }} strokeWidth={3} /> 15 days free trial</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: C.pink }} strokeWidth={3} /> No credit card needed</span>
            </div>
          </div>
        </Section>

        <footer className="py-10 text-xs" style={{ background: C.ink, color: 'rgba(245,238,220,0.55)' }}>
          <div className="max-w-[1180px] mx-auto px-6 md:px-10 flex flex-wrap justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/credsure-logo-main.webp" alt="CredSure" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
              <span>· Beautiful credentials for modern teams · © 2026</span>
            </div>
            <span style={{ color: C.pink }}>Made in Munich · Singapore</span>
          </div>
        </footer>
      </div>
    </>
  );
}
