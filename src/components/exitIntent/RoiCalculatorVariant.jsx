"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Calculator, ArrowRight, TrendingDown, DollarSign, Lock } from 'lucide-react';
import { getLangPrefix } from './getLangPrefix';
import { trackExitIntentLead } from '../../lib/analytics';

const VOLUMES = [
  { value: 100, label: '100/mo' },
  { value: 500, label: '500/mo' },
  { value: 1000, label: '1K/mo' },
  { value: 2500, label: '2.5K/mo' },
  { value: 5000, label: '5K/mo' },
  { value: 10000, label: '10K+/mo' },
];

const COMPETITORS = [
  { key: 'accredible', name: 'Accredible', pricing: { 100: 45, 500: 99, 1000: 299, 2500: 599, 5000: 999, 10000: 1500 } },
  { key: 'credly', name: 'Credly', pricing: { 100: 208, 500: 417, 1000: 708, 2500: 917, 5000: 1250, 10000: 2000 } },
  { key: 'certifier', name: 'Certifier', pricing: { 100: 49, 500: 99, 1000: 249, 2500: 499, 5000: 899, 10000: 1400 } },
];

const CREDSURE_PRICING = { 100: 29, 500: 99, 1000: 99, 2500: 199, 5000: 199, 10000: 499 };

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

export const RoiCalculatorVariant = ({ onSubmitted }) => {
  const [volume, setVolume] = useState(1000);
  const [competitor, setCompetitor] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comp = COMPETITORS[competitor];
  const savings = comp.pricing[volume] - CREDSURE_PRICING[volume];
  const annualSavings = savings * 12;
  const pct = Math.round((savings / comp.pricing[volume]) * 100);

  const handleCalculate = () => setShowResults(true);

  const handleUnlock = async (e) => {
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
          source: 'exit-intent-roi',
          interests: [`ROI Calculator: ${comp.name} vs CredSure, ${volume}/mo, saves ${fmt(annualSavings)}/yr`],
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setShowFullResults(true);
        trackExitIntentLead({
          variant: 'roi_calculator',
          source: 'exit-intent-roi',
          competitor: comp.name,
          monthly_volume: volume,
          annual_savings: annualSavings,
        });
        onSubmitted?.(email);
      }
    } catch (err) {
      console.error('Exit-intent ROI submission failed:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="exit-variant-roi-calculator">
      <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#5B22D6]/10">
        <Calculator className="w-7 h-7 text-[#5B22D6]" />
      </div>
      <h2 className="text-2xl font-extrabold text-center text-[#0F0E1A]  mb-2">
        Wait — See How Much You Can Save
      </h2>
      <p className="text-center text-gray-500  text-sm mb-6">
        Quick 10-second calculation. No commitment.
      </p>

      {!showResults ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700  mb-2">
              Monthly credentials issued
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VOLUMES.map(v => (
                <button
                  key={v.value}
                  onClick={() => setVolume(v.value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    volume === v.value
                      ? 'border-[#5B22D6] bg-[#5B22D6]/10 text-[#5B22D6]'
                      : 'border-gray-200  text-gray-600  hover:border-[#5B22D6]/40'
                  }`}
                  data-testid={`exit-vol-${v.value}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700  mb-2">
              Currently using
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMPETITORS.map((c, i) => (
                <button
                  key={c.key}
                  onClick={() => setCompetitor(i)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    competitor === i
                      ? 'border-[#5B22D6] bg-[#5B22D6]/10 text-[#5B22D6]'
                      : 'border-gray-200  text-gray-600  hover:border-[#5B22D6]/40'
                  }`}
                  data-testid={`exit-comp-${c.key}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#5B22D6]/25 transition-all"
            data-testid="exit-calculate"
          >
            Calculate My Savings <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : !showFullResults ? (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50   border border-green-200  rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-green-700 ">You save {pct}%</span>
            </div>
            <p className="text-3xl font-extrabold text-green-700 ">
              {fmt(savings)}<span className="text-base font-normal text-green-600">/month</span>
            </p>
            <p className="text-sm text-green-600  mt-1">
              vs {comp.name} at {volume.toLocaleString()} credentials/mo
            </p>
          </div>

          <div className="relative">
            <div className="bg-gray-50  rounded-2xl p-5 filter blur-[3px] select-none pointer-events-none">
              <div className="flex justify-between mb-2"><span>Annual Savings</span><span>{fmt(annualSavings)}</span></div>
              <div className="flex justify-between mb-2"><span>3-Year Savings</span><span>{fmt(annualSavings * 3)}</span></div>
              <div className="flex justify-between"><span>CredSure Price</span><span>{fmt(CREDSURE_PRICING[volume])}/mo</span></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-white  rounded-full shadow-lg border border-gray-200 ">
                <Lock className="w-4 h-4 text-[#5B22D6]" />
                <span className="text-sm font-bold text-[#5B22D6]">Unlock full breakdown</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200  bg-gray-50  text-[#0F0E1A]  placeholder:text-gray-400 focus:border-[#5B22D6] outline-none transition-all"
              data-testid="exit-intent-email"
            />
            <button
              type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              data-testid="exit-intent-submit"
            >
              <DollarSign className="w-4 h-4" />
              {isSubmitting ? 'Unlocking...' : 'Get Full Savings Report'}
            </button>
          </form>
          <p className="text-xs text-center text-gray-600">No spam. Instant results.</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="exit-intent-full-results">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50   border border-green-200  rounded-2xl p-5 text-center">
            <p className="text-sm font-bold text-green-700  mb-1">You save {pct}%</p>
            <p className="text-3xl font-extrabold text-green-700 ">
              {fmt(savings)}<span className="text-base font-normal text-green-600">/month</span>
            </p>
          </div>

          <div className="bg-gray-50  rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 ">{comp.name} Cost</span>
              <span className="font-bold text-red-500 line-through">{fmt(comp.pricing[volume])}/mo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 ">CredSure Cost</span>
              <span className="font-bold text-green-600">{fmt(CREDSURE_PRICING[volume])}/mo</span>
            </div>
            <hr className="border-gray-200 " />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-700 ">Annual Savings</span>
              <span className="font-extrabold text-green-600">{fmt(annualSavings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-700 ">3-Year Savings</span>
              <span className="font-extrabold text-[#5B22D6]">{fmt(annualSavings * 3)}</span>
            </div>
          </div>

          <a
            href={`${window.location.origin}${getLangPrefix()}/demo`}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] text-white font-bold rounded-xl hover:shadow-lg transition-all"
            data-testid="exit-intent-cta"
          >
            Start Saving Today — Book a Demo <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};

RoiCalculatorVariant.propTypes = {
  onSubmitted: PropTypes.func,
};
