"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BookOpen, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import { getLangPrefix } from './getLangPrefix';
import { trackExitIntentLead } from '../../lib/analytics';

const HIGHLIGHTS = [
  'Strategy frameworks proven at 150+ orgs',
  'Step-by-step implementation roadmap (4-8 weeks)',
  'ROI templates and KPI tracking benchmarks',
  'GDPR & compliance checklist for EU programs',
];

export const PdfGuideVariant = ({ onSubmitted }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, name: '', company: '', role: '',
          source: 'exit-intent-pdf-guide',
          interests: ['The Complete Guide to Digital Credentials in 2026 (PDF)'],
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSuccess(true);
        trackExitIntentLead({
          variant: 'pdf_guide',
          source: 'exit-intent-pdf-guide',
          asset: 'digital-credentials-2026-guide',
        });
        onSubmitted?.(email);
      }
    } catch (err) {
      console.error('Exit-intent PDF submission failed:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="exit-variant-pdf-guide">
      <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#E22B8A]/10">
        <BookOpen className="w-7 h-7 text-[#E22B8A]" />
      </div>

      {!success ? (
        <>
          <p className="text-center text-xs uppercase tracking-widest font-bold text-[#E22B8A] mb-2">
            Free Guide · 25 min read
          </p>
          <h2 className="text-2xl font-extrabold text-center text-[#0F0E1A]  mb-2 leading-tight">
            The Complete Guide to Digital Credentials in 2026
          </h2>
          <p className="text-center text-gray-500  text-sm mb-5">
            Everything you need to launch, scale, and measure a credentialing program — sent straight to your inbox.
          </p>

          <ul className="space-y-2.5 mb-6 bg-gray-50  rounded-2xl p-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700 ">
                <CheckCircle2 className="w-4 h-4 text-[#E22B8A] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200  bg-gray-50  text-[#0F0E1A]  placeholder:text-gray-400 focus:border-[#E22B8A] outline-none transition-all"
              data-testid="exit-pdf-email"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#E22B8A] to-[#5B22D6] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              data-testid="exit-pdf-submit"
            >
              <Download className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Get the Free Guide'}
            </button>
          </form>
          <p className="text-xs text-center text-gray-600 mt-3">No spam. Unsubscribe any time.</p>
        </>
      ) : (
        <div className="text-center space-y-4 py-2" data-testid="exit-pdf-success">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100  flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0F0E1A] ">Check your inbox!</h3>
          <p className="text-sm text-gray-600 ">
            We&apos;re sending the guide to <span className="font-semibold">{email}</span>. Arrives in under 2 minutes.
          </p>
          <a
            href={`${window.location.origin}${getLangPrefix()}/guides`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B22D6] hover:underline"
            data-testid="exit-pdf-browse-more"
          >
            Browse all guides <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};

PdfGuideVariant.propTypes = {
  onSubmitted: PropTypes.func,
};
