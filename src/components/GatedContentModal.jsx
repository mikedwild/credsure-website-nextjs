"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from '@/lib/useTranslation';
import { X, Lock, Download, ArrowRight } from 'lucide-react';
import { trackGatedUnlock } from '@/lib/analytics';

export const GatedContentModal = ({ isOpen, onClose, contentTitle, contentType = 'guide' }) => {
  const t = useTranslation();
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          company: '',
          role: '',
          source: `gated-${contentType}`,
          interests: [`${contentType} Download: ${contentTitle}`],
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setIsSuccess(true);
        trackGatedUnlock({
          source: `gated-${contentType}`,
          content_type: contentType,
          content_title: contentTitle,
        });
        // Store that user has unlocked gated content
        const unlocked = JSON.parse(localStorage.getItem('unlocked-content') || '[]');
        unlocked.push(contentTitle);
        localStorage.setItem('unlocked-content', JSON.stringify(unlocked));
      }
    } catch (err) {
      console.error('Lead submission failed:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ email: '', name: '' });
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" data-testid="gated-content-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white  rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 :bg-slate-800 transition-colors"
          data-testid="gated-content-close"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="h-2 bg-gradient-to-r from-[#5B22D6] via-[#E22B8A] to-[#7c3aed]" />

        <div className="p-8">
          {!isSuccess ? (
            <>
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#5B22D6]/10">
                <Lock className="w-7 h-7 text-[#5B22D6]" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-center text-[#0F0E1A]  mb-2">
                {t('gatedContent.title', 'Unlock This Resource')}
              </h2>
              <p className="text-center text-gray-500  text-sm mb-1 font-medium">
                {contentTitle}
              </p>
              <p className="text-center text-gray-500  text-sm mb-6">
                {t('gatedContent.subtitle', 'Enter your details for instant access.')}
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('gatedContent.namePlaceholder', 'Your name')}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200  bg-gray-50  text-[#0F0E1A]  placeholder:text-gray-400 focus:border-[#5B22D6] outline-none transition-all text-sm"
                  data-testid="gated-content-name"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('gatedContent.emailPlaceholder', 'Work email (required)')}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200  bg-gray-50  text-[#0F0E1A]  placeholder:text-gray-400 focus:border-[#5B22D6] outline-none transition-all text-sm"
                  data-testid="gated-content-email"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#5B22D6]/25 transition-all disabled:opacity-50 text-sm"
                  data-testid="gated-content-submit"
                >
                  <Download className="w-4 h-4" />
                  {isSubmitting
                    ? t('gatedContent.unlocking', 'Unlocking...')
                    : t('gatedContent.cta', 'Get Instant Access')}
                </button>
              </form>
              <p className="text-xs text-center text-gray-600  mt-4">
                {t('gatedContent.privacy', 'We respect your privacy. Unsubscribe anytime.')}
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-full bg-green-100 ">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-extrabold text-[#0F0E1A]  mb-2">
                {t('gatedContent.successTitle', 'Access Granted!')}
              </h3>
              <p className="text-gray-600  text-sm mb-6">
                {t('gatedContent.successDesc', 'Your resource is now available. We also sent a copy to your email.')}
              </p>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B22D6] text-white font-bold rounded-xl hover:bg-[#2e2668] transition-colors text-sm"
                data-testid="gated-content-continue"
              >
                {t('gatedContent.continue', 'Continue Reading')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards }
      `}</style>
    </div>
  );
};

GatedContentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contentTitle: PropTypes.string.isRequired,
  contentType: PropTypes.oneOf(['guide', 'webinar', 'whitepaper']),
};
