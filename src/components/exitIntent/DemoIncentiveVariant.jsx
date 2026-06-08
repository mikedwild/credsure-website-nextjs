"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { Sparkles, ArrowRight, Star, Users } from 'lucide-react';
import { getLangPrefix } from './getLangPrefix';
import { trackExitIntentLead } from '../../lib/analytics';

export const DemoIncentiveVariant = ({ onSubmitted }) => {
  const handleClick = () => {
    // Fire a tracking lead before navigating (no email required for this variant).
    // keepalive ensures the request completes even after navigation starts.
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'cta-click@anonymous.exit-intent',
          name: '', company: '', role: '',
          source: 'exit-intent-demo-incentive',
          interests: ['Demo incentive CTA clicked — 1 month free offer'],
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => { /* best effort */ });
    } catch (err) { /* noop */ }

    trackExitIntentLead({
      variant: 'demo_incentive',
      source: 'exit-intent-demo-incentive',
      offer: '1_month_free',
    });
    onSubmitted?.('cta-click');
  };

  const demoUrl = `${getLangPrefix()}/demo?source=exit-intent-demo-incentive`;

  return (
    <div data-testid="exit-variant-demo-incentive">
      <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#7c3aed]">
        <Sparkles className="w-7 h-7 text-white" />
      </div>

      <p className="text-center text-xs uppercase tracking-widest font-bold text-[#7c3aed] mb-2">
        Limited offer
      </p>
      <h2 className="text-2xl font-extrabold text-center text-[#0F0E1A]  mb-2 leading-tight">
        Book a 15-min demo, get <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B22D6] to-[#7c3aed]">1 month free</span>
      </h2>
      <p className="text-center text-gray-500  text-sm mb-5">
        See CredSure in action — and start saving from day one.
      </p>

      {/* Social proof block */}
      <div className="bg-gradient-to-br from-[#5B22D6]/5 to-[#7c3aed]/5   border border-[#5B22D6]/10  rounded-2xl p-5 mb-6 space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 ">
          <Users className="w-4 h-4 text-[#5B22D6]" />
          150+ orgs trust CredSure
        </div>
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm font-bold text-gray-700  ml-1">4.8/5 on G2</span>
        </div>
        <p className="text-xs text-center text-gray-500  italic">
          &ldquo;CredSure cut our credentialing costs by 60% and tripled engagement.&rdquo; — VP Learning, Fortune 500
        </p>
      </div>

      <a
        href={demoUrl}
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#5B22D6] to-[#7c3aed] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#5B22D6]/25 transition-all"
        data-testid="exit-demo-cta"
      >
        Book My Demo — Get 1 Month Free <ArrowRight className="w-5 h-5" />
      </a>
      <p className="text-xs text-center text-gray-600 mt-3">
        No credit card required · 5 spots remaining this month
      </p>
    </div>
  );
};

DemoIncentiveVariant.propTypes = {
  onSubmitted: PropTypes.func,
};
