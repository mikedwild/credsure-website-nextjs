"use client";
/**
 * Hero2026 — above-the-fold landing hero (split layout v2).
 *
 * TalentSure-style split layout:
 *   - LEFT: eyebrow → headline → description → CTAs → starting price → trust strip
 *   - RIGHT: hero photo with a floating credential UI card layered on top
 *
 * Performance notes:
 *   - No framer-motion: H1 is the LCP. Ambient blob orbs animate via
 *     `@keyframes` float in App.css.
 *   - Hero image uses `<img loading="eager" fetchpriority="high">` + a
 *     small webp candidate set so it's not LCP-blocking on mobile.
 */
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useLocalizedNavigate } from '@/utils/useLocalizedNavigate';
import { GradientMeshBackground } from './VideoBackground';

// Local optimised hero — was previously an external Unsplash URL (~80–120 KB
// on mobile + DNS / TLS to a third-party CDN). Moving local: 17 KB WebP at
// 480w, 36 KB at 800w, 72 KB at 1200w. Big LCP win on mobile (PERF-1 / PERF-4).
// PERF: hero image is the LCP candidate. Preloaded in /public/index.html
// with matching width variants. Iteration history (2026-05-19):
//   v1-v5: various RGB-flattened ChatGPT exports + flood-fill keying
//   v6: opaque image + aggressive radial mask (45%/92%) — worked but
//        cropped corner callouts at the mask boundary
//   v7 (current): True-alpha PNG export ("Verify-credentials (1).png").
//        RGBA, ~38% transparent + 8% partial-alpha (clean drop shadows).
//        Processed via 0.4-px alpha gaussian (smooth sub-pixel jaggies),
//        pad+crop with 20-px margin, encoded q=88 + alpha_quality=100
//        (lossless alpha). Sizes 26/53/90 KB at 480/800/1200w.
//        Radial mask removed — the alpha channel itself is the edge
//        treatment, so corner callouts stay fully visible.
const HERO_WEBP_SRCSET = [
  '/img/heroes/hero-passport-480.webp 480w',
  '/img/heroes/hero-passport-800.webp 800w',
  '/img/heroes/hero-passport-1200.webp 1200w',
].join(', ');
// Tiny inline fallback — modern browsers all support WebP-with-alpha;
// the 800w variant doubles as the no-srcset fallback.
const HERO_WEBP_FALLBACK = '/img/heroes/hero-passport-800.webp';

export const Hero2026 = () => {
  const t = useTranslation();
  const navigate = useLocalizedNavigate();

  return (
    <GradientMeshBackground className="relative flex items-center transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 pt-28 pb-16 md:pt-32 md:pb-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* ─── Left column — text + CTAs ─── */}
          <div className="lg:col-span-6 hero-fade-in">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full hero-rise" style={{ background: 'rgba(91,34,214,0.06)', border: '1px solid rgba(91,34,214,0.18)' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#5B22D6' }} />
              <span className="text-xs font-semibold cs-grad-text">{t('hero.eyebrow', 'NEW · Issue, verify and govern in one place')}</span>
            </div>

            {/* Headline — LCP element */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[76px] font-bold tracking-tight text-[#0F0E1A] mb-6 leading-[1.05] hero-rise">
              {t('hero.title')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10 cs-grad-text">{t('hero.titleHighlight')}</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 cs-hero-underline -z-0 hero-underline" aria-hidden="true" />
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#2E2A3D] leading-relaxed mb-8 max-w-xl hero-rise hero-delay-1">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 hero-rise hero-delay-2">
              <Button
                onClick={() => navigate('/demo')}
                data-testid="hero-cta"
                className="group cs-btn cs-btn-gradient !rounded-full !px-7 !py-6 !text-base !font-bold transition-all duration-300 hover:!scale-[1.02]"
              >
                {t('hero.cta.secondary')}
                <ArrowRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://app.certif-id.com/sign-up', '_blank')}
                className="group !bg-white !border-2 !border-[#0F0E1A] !text-[#0F0E1A] hover:!bg-[#0F0E1A] hover:!text-white !rounded-full !px-7 !py-6 !text-base !font-bold transition-all duration-300"
              >
                <Play className="mr-1 w-5 h-5 fill-current" />
                {t('hero.cta.primary')}
              </Button>
            </div>

            {/* Price + trust strip */}
            <div className="flex flex-wrap items-center gap-6 hero-rise hero-delay-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/85 backdrop-blur-sm border border-[#ECE7F1] rounded-full shadow-sm">
                <span className="text-xs font-bold cs-grad-text">{t('hero2026.startingFrom', 'Starting from')}</span>
                <span className="text-base font-extrabold text-[#0F0E1A]">€45</span>
                <span className="text-xs text-[#6A6478]">/{t('hero2026.perMonth', 'month')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: 'linear-gradient(135deg, #5B22D6, #E22B8A)' }} />
                  ))}
                </div>
                <span className="text-sm text-[#2E2A3D]">{t('hero.stats.organizations')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex" style={{ color: '#E22B8A' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-[#2E2A3D]">{t('hero2026.g2Rating')}</span>
              </div>
            </div>
          </div>

          {/* ─── Right column — passport composition (transparent WebP) ───
              Grid is 6/6 (headline wraps cleanly at 3 lines). To make the
              image feel BIGGER without crushing the headline, on lg+ we
              add a negative right-margin so the image extends ~80px past
              its grid column edge. Page overflow stays hidden via the
              parent section's container. */}
          <div className="lg:col-span-6 relative hero-rise hero-delay-2 lg:-mr-12 xl:-mr-20">
            <div className="relative">
              {/* Hero passport composition
                  The image is transparent (alpha-keyed from white) and is
                  itself a complete composition: central passport card + 5
                  floating callouts + footer banner + dashed connectors.
                  We deliberately DROP the previous rounded-clip / shadow /
                  warm-overlay / "Master Educator" sticker card because:
                    - the rounded clip would chop off the floating callouts
                    - shadow-2xl would render a hard rectangle behind the
                      transparent image edges
                    - the warm color overlay would tint the carefully-
                      designed credential UI
                    - the sticker card was redundant with the new image
                  We KEEP a very subtle radial halo behind so the comp has
                  some "lift" over the page bg without competing with the
                  image's own micro-glow. */}
              <div
                className="absolute -inset-8 rounded-[40px] blur-3xl opacity-50 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 45%, rgba(187,158,255,0.40) 0%, rgba(255,158,215,0.20) 55%, transparent 80%)' }}
                aria-hidden="true"
              />
              <picture>
                <source type="image/webp" srcSet={HERO_WEBP_SRCSET} sizes="(max-width: 640px) 480px, (max-width: 1024px) 600px, 800px" />
                <img
                  src={HERO_WEBP_FALLBACK}
                  alt={t('hero.imageAlt', 'Your Digital Trust Passport — Alex Morgan\'s verified credential portfolio on CredSure, with 4 verified credentials (Master Educator, Advanced Data Science, Cybersecurity Fundamentals, Leadership Essentials), QR verification, shareable link, lifetime record, blockchain-anchored tamper-proof storage, and trusted by top organizations')}
                  width="1200"
                  height="1178"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="relative w-full h-auto"
                  // v7 source is true-alpha — the alpha channel IS the
                  // edge treatment. No CSS mask needed; corner callouts
                  // (QR Verified / Employer Viewed / etc) stay fully
                  // visible without the radial fade clipping them.
                  data-testid="hero-image"
                />
              </picture>
            </div>
          </div>

        </div>
      </div>
    </GradientMeshBackground>
  );
};
