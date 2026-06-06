"use client";
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslations as useTranslation } from 'next-intl';
import { Calculator } from 'lucide-react';
import { roiCalculatorData, calculateROI } from '@/data/roiCalculator';
import { ROIForm } from './ROIForm';
import { ROIResults } from './ROIResults';

export const ROICalculator = ({ onCtaClick }) => {
  const { t } = useTranslation();
  const [selectedVolume, setSelectedVolume] = useState(1000);
  const [manualMinutes, setManualMinutes] = useState(10);
  const [hourlyCost, setHourlyCost] = useState(50);
  const [roi, setRoi] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const computeROI = useCallback(() => {
    return calculateROI(selectedVolume, manualMinutes, hourlyCost);
  }, [selectedVolume, manualMinutes, hourlyCost]);

  useEffect(() => {
    setIsAnimating(true);
    const result = computeROI();
    const timer = setTimeout(() => {
      setRoi(result);
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [computeROI]);

  return (
    <section id="roi-calculator" className="py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-slate-50 relative overflow-hidden" data-testid="roi-calculator-section">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-full mb-4">
            <Calculator className="w-4 h-4 text-[#5B22D6]" />
            <span className="text-sm font-semibold text-[#5B22D6]">{t('roiSection.badge', 'ROI Calculator')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{roiCalculatorData.headline}</h2>
          <p className="text-xl text-slate-600">{roiCalculatorData.subheadline}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <ROIForm
              selectedVolume={selectedVolume}
              manualMinutes={manualMinutes}
              hourlyCost={hourlyCost}
              roi={roi}
              onVolumeChange={setSelectedVolume}
              onManualMinutesChange={setManualMinutes}
              onHourlyCostChange={setHourlyCost}
            />
            <ROIResults
              roi={roi}
              isAnimating={isAnimating}
              selectedVolume={selectedVolume}
              onCtaClick={onCtaClick}
            />
          </div>

          <div className="mt-12 text-center max-w-2xl mx-auto">
            <p className="text-sm text-slate-500">{t('roiSection.disclaimer', '* Savings estimates based on typical manual credentialing processes. Actual results may vary based on your specific workflow and volume.')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

ROICalculator.propTypes = {
  onCtaClick: PropTypes.func,
};
