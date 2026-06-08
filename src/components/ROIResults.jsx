"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from '@/lib/useTranslation';
import { Clock, TrendingDown, Zap, Lock, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { useCurrency } from '@/utils/CurrencyContext';
import { trackRoiUnlock } from '@/lib/analytics';

export const ROIResults = ({ roi, isAnimating, selectedVolume, onCtaClick }) => {
  const t = useTranslation();
  const { symbol } = useCurrency();
  const [isUnlocked, setIsUnlocked] = useState(() => typeof window !== 'undefined' && !!localStorage.getItem('roi-unlocked'));
  const [gateEmail, setGateEmail] = useState('');
  const [isGateSubmitting, setIsGateSubmitting] = useState(false);

  const handleUnlockROI = async (e) => {
    e.preventDefault();
    if (!gateEmail) return;
    setIsGateSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: gateEmail, name: '', company: '', role: '',
          source: 'roi-gate',
          interests: [`Efficiency ROI: ${selectedVolume}/mo credentials`],
          timestamp: new Date().toISOString(),
        }),
      });
      setIsUnlocked(true);
      localStorage.setItem('roi-unlocked', 'true');
      trackRoiUnlock({
        source: 'roi-gate',
        monthly_volume: selectedVolume,
        annual_savings: roi?.costSavedYear,
      });
    } catch (err) { console.error('ROI gate submission failed:', err.message); } finally {
      setIsGateSubmitting(false);
    }
  };

  if (!roi) return null;

  return (
    <div className="space-y-6">
      {/* Main efficiency card */}
      <div className={`bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-2xl p-8 text-white shadow-2xl transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`} data-testid="roi-efficiency-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-purple-100 text-sm">Efficiency Gain</p>
            <p className="text-3xl font-bold">{roi.roiPercent}%</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Time saved */}
          <div>
            <p className="text-purple-100 text-sm mb-3">Time Saved with Automation</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-200" />
                  <p className="text-xs text-purple-200">Hours/Month</p>
                </div>
                <p className="text-2xl font-bold">{roi.timeSavedHoursMonth} hrs</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-200" />
                  <p className="text-xs text-purple-200">Work Days/Year</p>
                </div>
                <p className="text-2xl font-bold">{roi.timeSavedDaysYear} days</p>
              </div>
            </div>
          </div>

          {/* Cost per credential comparison */}
          <div className="pt-6 border-t border-white/20">
            <p className="text-purple-100 text-sm mb-3">Cost per Credential</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-purple-200 mb-1">Manual Process</p>
                <p className="text-2xl font-bold line-through opacity-75">{symbol}{roi.manualCostPerCredential.toFixed(2)}</p>
              </div>
              <ArrowDown className="w-5 h-5 text-green-300 rotate-[-90deg]" />
              <div className="flex-1">
                <p className="text-xs text-purple-200 mb-1">With CredSure</p>
                <p className="text-3xl font-bold text-green-300">{symbol}{roi.automatedCostPerCredential.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Monthly savings */}
          <div className="pt-6 border-t border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-purple-100 text-xs mb-1">Monthly Savings</p>
                <p className="text-2xl font-bold">{symbol}{roi.costSavedMonth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-100 text-xs mb-1">Annual Savings</p>
                <p className="text-2xl font-bold">{symbol}{roi.costSavedYear.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Annual projection — gated */}
      {isUnlocked ? (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8" data-testid="roi-unlocked-report">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-[#3F2BD9]" />
          <h4 className="text-xl font-bold text-slate-900">Full Efficiency Report</h4>
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9] mb-2">
              {symbol}{roi.costSavedYear.toLocaleString()}
            </p>
            <p className="text-slate-600">total annual savings</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">CredSure Plan</p>
              <p className="text-lg font-bold text-slate-900">{symbol}{roi.credsureSubscription}/mo</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Automated Time</p>
              <p className="text-lg font-bold text-slate-900">{roi.automatedHoursMonth} hrs/mo</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#3F2BD9]" />Free up {roi.timeSavedDaysYear} work days per year for strategic initiatives</p>
            <p className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-[#3F2BD9]" />Reduce cost per credential by {roi.roiPercent}%</p>
          </div>
        </div>
      </div>
      ) : (
      <div className="relative rounded-2xl border border-slate-200 shadow-lg overflow-hidden" data-testid="roi-gate">
        <div className="p-8 filter blur-[4px] select-none pointer-events-none bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-[#3F2BD9]" />
            <h4 className="text-xl font-bold text-slate-900">Full Efficiency Report</h4>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
            <p className="text-5xl font-bold text-[#5B22D6]">{symbol}{roi.costSavedYear.toLocaleString()}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#5B22D6]/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#5B22D6]" />
            </div>
            <h4 className="text-lg font-extrabold text-[#0F0E1A] mb-2">Unlock Full Efficiency Report</h4>
            <p className="text-sm text-gray-500 mb-4">Get the complete ROI breakdown and annual projection</p>
            <form onSubmit={handleUnlockROI} className="flex gap-2">
              <input
                type="email" required value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="Work email"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#0F0E1A] placeholder:text-gray-400 focus:border-[#5B22D6] outline-none"
                data-testid="roi-gate-email"
              />
              <button
                type="submit" disabled={isGateSubmitting}
                className="px-4 py-2.5 bg-[#5B22D6] text-white text-sm font-bold rounded-lg hover:bg-[#2e2668] transition-colors disabled:opacity-50 whitespace-nowrap"
                data-testid="roi-gate-submit"
              >
                {isGateSubmitting ? '...' : 'Unlock'}
              </button>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* CTA */}
      <Button
        onClick={onCtaClick}
        size="lg"
        data-testid="roi-cta-btn"
        className="w-full bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9] hover:from-[#2d2461] hover:to-[#5B22D6] text-white py-7 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {t('roiSection.startSaving', 'Start Saving Today — Free Trial')}
      </Button>
      <p className="text-center text-sm text-slate-500">{t('roiSection.trialInfo', '14-day free trial • No credit card required • Cancel anytime')}</p>
    </div>
  );
};

ROIResults.propTypes = {
  roi: PropTypes.object,
  isAnimating: PropTypes.bool.isRequired,
  selectedVolume: PropTypes.number.isRequired,
  onCtaClick: PropTypes.func,
};
