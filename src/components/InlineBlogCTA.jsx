"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslations as useTranslation } from 'next-intl';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { trackNewsletterSignup } from '@/lib/analytics';

export const InlineBlogCTA = ({ variant = 'default', blogSlug }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: '',
          company: '',
          role: '',
          source: 'inline-blog',
          // Carry the originating post slug so the admin blog list can
          // attribute leads per-article. Optional — older callers without
          // a slug stay uncounted, which is fine.
          ...(blogSlug ? { blog_slug: blogSlug } : {}),
          interests: ['Blog Newsletter'],
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setIsSuccess(true);
        trackNewsletterSignup({ source: 'inline-blog', variant, blog_slug: blogSlug });
      }
    } catch (err) {
      console.error('Inline blog CTA submission failed:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="my-10 p-6 rounded-2xl bg-green-50  border border-green-200  text-center"
        data-testid="inline-blog-cta-success"
      >
        <p className="text-green-700  font-semibold">
          {t('inlineCTA.success', "You're subscribed! Check your inbox for insights.")}
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className="my-10 p-6 rounded-2xl bg-gradient-to-r from-[#5B22D6]/5 to-[#E22B8A]/5   border border-[#5B22D6]/15 "
        data-testid="inline-blog-cta"
      >
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-[#5B22D6] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-[#0F0E1A]  text-sm">
              {t('inlineCTA.compactTitle', 'Get credential insights delivered weekly')}
            </h4>
            <p className="text-xs text-gray-500  mt-1">
              {t('inlineCTA.compactDesc', 'Join 2,000+ credential professionals.')}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('inlineCTA.emailPlaceholder', 'you@company.com')}
            required
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200  bg-white  text-sm text-[#0F0E1A]  placeholder:text-gray-400 focus:border-[#5B22D6] outline-none transition-all"
            data-testid="inline-blog-email"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-[#5B22D6] text-white text-sm font-semibold rounded-lg hover:bg-[#2e2668] transition-colors disabled:opacity-50 whitespace-nowrap"
            data-testid="inline-blog-submit"
          >
            {isSubmitting ? '...' : t('inlineCTA.subscribe', 'Subscribe')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="my-12 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#5B22D6] to-[#E22B8A] text-white relative overflow-hidden"
      data-testid="inline-blog-cta"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider text-white/80">
            {t('inlineCTA.badge', 'Free Resource')}
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold mb-3">
          {t('inlineCTA.title', 'Get the Complete Digital Credentials Playbook')}
        </h3>
        <p className="text-white/80 mb-6 max-w-md">
          {t('inlineCTA.subtitle', 'A step-by-step guide to launching, scaling, and measuring your credentialing program.')}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('inlineCTA.emailPlaceholder', 'you@company.com')}
            required
            className="flex-1 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 outline-none transition-all"
            data-testid="inline-blog-email"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#5B22D6] font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 whitespace-nowrap"
            data-testid="inline-blog-submit"
          >
            {isSubmitting ? '...' : t('inlineCTA.download', 'Download Free')}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-xs text-white/50 mt-3">{t('inlineCTA.privacy', 'No spam. Instant delivery.')}</p>
      </div>
    </div>
  );
};

InlineBlogCTA.propTypes = {
  variant: PropTypes.oneOf(['default', 'compact']),
  blogSlug: PropTypes.string,
};
