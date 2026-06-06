"use client";
/**
 * Design preview index — central picker for all six homepage mockups.
 * Each card is a faithful slice of a competitor's signature aesthetic
 * applied to CredSure's content. NOT linked from the site nav, NOT
 * indexed. Reach this page at /preview/design.
 */
import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, Sparkles, LineChart, Heart, Code2, BookOpen, Wand2 } from 'lucide-react';

const mockups = [
  {
    id: 'a',
    to: '/preview/design-a',
    label: 'Option A',
    name: 'ClickUp-inspired',
    blurb: 'Bright multi-colour energy with named character agent mascots (Agent Orange + a roster of coloured blob characters), feature carousel tabs, Forrester ROI stat grid (384% / $3.9M / 92,400 hrs / <6 mo), and a sliding marquee of G2 awards.',
    icon: Sparkles,
    bg: 'linear-gradient(135deg, #FF02A6 0%, #7B68EE 50%, #3DCFFF 100%)',
    text: '#FFFFFF',
    accent: '#FF02A6',
    testid: 'preview-link-clickup',
  },
  {
    id: 'b',
    to: '/preview/design-b',
    label: 'Option B',
    name: 'Beamery-inspired',
    blurb: 'Clean enterprise — 4 platform pillar tabs (Data / Intelligence / Agentic AI / Execution), "Meet Ray" your AI Credential Advisor mascot, Fortune-500 customer story cards with Employees+HQ+Industry meta and embedded pull quotes.',
    icon: LineChart,
    bg: 'linear-gradient(135deg, #F8F5F0 0%, #F2EAD8 50%, #E45530 100%)',
    text: '#181B23',
    accent: '#E45530',
    testid: 'preview-link-beamery',
  },
  {
    id: 'c',
    to: '/preview/design-c',
    label: 'Option C',
    name: 'Homerun-inspired',
    blurb: 'Yellow-warm cream with chunky rounded Fraunces display, hand-drawn brown-outline blob icons, pink-coral CTAs, single-column hero with one wide pipeline screenshot, plain quote-row testimonials with emoji trust badges (😃🤩).',
    icon: Heart,
    bg: 'linear-gradient(135deg, #F5EEDC 0%, #F2D67A 50%, #EE5A6A 100%)',
    text: '#1B1812',
    accent: '#EE5A6A',
    testid: 'preview-link-homerun',
  },
  {
    id: 'd',
    to: '/preview/design-d',
    label: 'Option D',
    name: 'Webflow-inspired',
    blurb: 'Dark · designer-grade · builder energy. Near-black canvas, electric blue/violet/cyan glows, dense bento, designer/code mode.',
    icon: Code2,
    bg: 'linear-gradient(135deg, #08080C 0%, #4353FF 50%, #A66CFF 100%)',
    text: '#FFFFFF',
    accent: '#33D9FF',
    testid: 'preview-link-webflow',
  },
  {
    id: 'e',
    to: '/preview/design-e',
    label: 'Option E',
    name: 'Lattice-inspired',
    blurb: 'Clean modern sans on warm off-white. Signature: a modular grid of pastel-coloured cards (peach, lavender, sage, butter, blush) — each containing a real product UI screenshot.',
    icon: BookOpen,
    bg: 'linear-gradient(135deg, #FAF6EF 0%, #E2D4F2 35%, #F1D7CC 70%, #F7C8C5 100%)',
    text: '#161614',
    accent: '#161614',
    testid: 'preview-link-lattice',
  },
  {
    id: 'f',
    to: '/preview/design-f',
    label: 'Option F',
    name: 'Jasper-inspired',
    blurb: 'Editorial parchment cream with Instrument Serif italics on red wordmark accent, black & white stippled illustrations as section dividers, 6 persona portraits (Performance/Product/Brand/Content/PR/Field), customer stat callouts, and a "The End" greeting card with florals as the closing CTA.',
    icon: Wand2,
    bg: 'linear-gradient(135deg, #F4EFE4 0%, #F1B8C5 50%, #E53935 100%)',
    text: '#1A1814',
    accent: '#E53935',
    testid: 'preview-link-jasper',
  },
];

export default function DesignPreviewIndex() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 mb-3">CredSure · Design exploration</p>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Pick a direction</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Six full vertical homepage slices — each captures a different competitor's signature aesthetic applied to CredSure's content. Click any card to walk through the full hero → trust → features → stories → CTA flow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map(m => {
            const Icon = m.icon;
            return (
              <Link
                key={m.id}
                to={m.to}
                data-testid={m.testid}
                className="group block rounded-2xl overflow-hidden border border-neutral-200 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[4/3] relative overflow-hidden" style={{ background: m.bg }}>
                  <div className="absolute inset-0 flex items-end p-7">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] mb-2 font-semibold opacity-90" style={{ color: m.text }}>{m.label}</p>
                      <h2 className="text-3xl font-bold tracking-tight" style={{ color: m.text }}>{m.name}</h2>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-neutral-700 leading-relaxed min-h-[60px]">{m.blurb}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3" style={{ color: m.accent }}>
                    <Icon className="w-4 h-4" />
                    <span>View mockup</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center text-xs text-neutral-500 space-y-1">
          <p>Not indexed. Not linked from the site nav. Delete once a direction is finalised.</p>
          <p>Direct URLs · /preview/design-a → -f · This index · /preview/design</p>
        </div>
      </div>
    </div>
  );
}
