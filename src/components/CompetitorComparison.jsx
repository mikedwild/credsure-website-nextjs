"use client";
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { competitorComparison } from '@/data/mock';

export const CompetitorComparison = () => {
  const t = useTranslation();

  return (
    <section className="py-24 bg-white ">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900  mb-4">
            {competitorComparison.headline}
          </h2>
          <p className="text-xl text-slate-600 ">
            {competitorComparison.subheadline}
          </p>
        </div>

        {/* Comparison table */}
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <div className="bg-slate-50  border border-slate-200  rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="brand-gradient">
                  <th className="px-6 py-4 text-left text-white font-semibold text-lg">{t('comparison.feature')}</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-lg bg-brand-purple">
                    <div className="flex flex-col items-center">
                      <span>CredSure</span>
                      <span className="text-xs font-normal mt-1">{t('comparison.youreHere')}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-lg">Accredible</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-lg">Credly</th>
                  <th className="px-6 py-4 text-center text-white font-semibold text-lg">Certifier</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.features.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={`border-t border-slate-200  ${
                      index % 2 === 0 ? 'bg-white ' : 'bg-slate-50 '
                    } hover:bg-purple-50 :bg-purple-950/20 transition-colors`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 ">{row.feature}</td>
                    <td className={`px-6 py-4 text-center font-semibold ${
                      row.winner === 'credsure' || row.winner === 'tie'
                        ? 'bg-purple-100  text-brand-purple '
                        : 'text-slate-700 '
                    }`}>
                      {row.credsure}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 ">{row.accredible}</td>
                    <td className="px-6 py-4 text-center text-slate-600 ">{row.credly}</td>
                    <td className="px-6 py-4 text-center text-slate-600 ">{row.certifier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <div className="bg-purple-50  border border-purple-200  rounded-xl p-6">
            <p className="text-slate-700  mb-4">
              <strong>{t('comparison.bottomLineTitle')}</strong> {t('comparison.bottomLineText')}
            </p>
            <p className="text-sm text-slate-600 ">
              {t('comparison.pricingNote')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
