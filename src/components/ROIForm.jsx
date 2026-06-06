"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslations as useTranslation } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { roiCalculatorData } from '@/data/roiCalculator';
import { useCurrency } from '@/utils/CurrencyContext';

const swapSymbol = (label, sym) => label.replace(/[€$£]/, sym);

export const ROIForm = ({ selectedVolume, manualMinutes, hourlyCost, roi, onVolumeChange, onManualMinutesChange, onHourlyCostChange }) => {
  const { t } = useTranslation();
  const { symbol } = useCurrency();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8" data-testid="roi-form">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('roiSection.yourRequirements', 'Your Current Process')}</h3>

      {/* Volume selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {t('roiSection.monthlyVolume', 'How many credentials do you issue monthly?')}
        </label>
        <Select value={selectedVolume.toString()} onValueChange={(value) => onVolumeChange(Number(value))}>
          <SelectTrigger className="w-full border-slate-300 focus:border-[#5B22D6] h-14 text-lg" data-testid="roi-volume-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roiCalculatorData.credentialVolumes.map((vol) => (
              <SelectItem key={vol.value} value={vol.value.toString()}>
                {vol.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Manual time per credential */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Time spent per credential (manual process)
        </label>
        <div className="grid grid-cols-5 gap-2">
          {roiCalculatorData.manualTimeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onManualMinutesChange(opt.value)}
              data-testid={`roi-time-${opt.value}`}
              className={`px-3 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                manualMinutes === opt.value
                  ? 'border-[#5B22D6] bg-purple-50 text-[#5B22D6]'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.value} min
            </button>
          ))}
        </div>
      </div>

      {/* Hourly cost */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Average staff hourly rate
        </label>
        <div className="grid grid-cols-5 gap-2">
          {roiCalculatorData.hourlyCostOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onHourlyCostChange(opt.value)}
              data-testid={`roi-cost-${opt.value}`}
              className={`px-3 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                hourlyCost === opt.value
                  ? 'border-[#5B22D6] bg-purple-50 text-[#5B22D6]'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {swapSymbol(opt.label, symbol)}
            </button>
          ))}
        </div>
      </div>

      {/* Current process summary */}
      {roi && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200" data-testid="roi-process-summary">
          <h4 className="font-semibold text-slate-900 mb-4">Your Current Process</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Manual hours/month</span>
              <span className="font-bold text-slate-900">{roi.manualHoursMonth} hrs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Monthly labor cost</span>
              <span className="font-bold text-slate-900">{symbol}{roi.manualCostMonth.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Cost per credential</span>
              <span className="font-bold text-red-600">{symbol}{roi.manualCostPerCredential.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ROIForm.propTypes = {
  selectedVolume: PropTypes.number.isRequired,
  manualMinutes: PropTypes.number.isRequired,
  hourlyCost: PropTypes.number.isRequired,
  roi: PropTypes.object,
  onVolumeChange: PropTypes.func.isRequired,
  onManualMinutesChange: PropTypes.func.isRequired,
  onHourlyCostChange: PropTypes.func.isRequired,
};
