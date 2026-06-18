"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from './ui/button';

/**
 * Stats bar — key metrics for each solution page
 */
export const SolutionStats = ({ solutionKey }) => {
  const t = useTranslation();
  const stats = t(`solx.stats.${solutionKey}`, { returnObjects: true });
  if (!Array.isArray(stats) || stats.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9]" data-testid={`${solutionKey}-stats`}>
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Comparison table — Traditional vs CredSure
 */
export const SolutionComparison = ({ solutionKey }) => {
  const t = useTranslation();
  const data = t(`solx.comparison.${solutionKey}`, { returnObjects: true });
  if (!data || !data.title || !Array.isArray(data.rows)) return null;

  return (
    <section className="py-20 bg-white " data-testid={`${solutionKey}-comparison`}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
          {data.title.split(' vs ')[0]} vs{' '}
          <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">
            {data.title.split(' vs ')[1]}
          </span>
        </h2>
        <p className="text-center text-gray-500  mb-10 text-sm">{t('solx.headings.comparisonSubtitle')}</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-[#5B22D6]/20">
                <th className="text-left py-4 px-4 text-sm font-bold text-slate-500  uppercase tracking-wider w-1/3">{t('solx.headings.comparisonFeature')}</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-red-400 uppercase tracking-wider w-1/3">{t('solx.headings.comparisonTraditional')}</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#5B22D6]  uppercase tracking-wider w-1/3">{t('solx.headings.comparisonCredsure')}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-100  hover:bg-slate-50 :bg-slate-900/50 transition-colors"
                >
                  <td className="py-4 px-4 font-semibold text-slate-800  text-sm">{row.feature}</td>
                  <td className="py-4 px-4 text-center text-slate-500  text-sm">{row.traditional}</td>
                  <td className="py-4 px-4 text-center font-semibold text-[#5B22D6]  text-sm">{row.credsure}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

/**
 * How It Works — 3-4 step process for each solution
 */
export const SolutionHowItWorks = ({ solutionKey }) => {
  const t = useTranslation();
  const steps = t(`solx.steps.${solutionKey}`, { returnObjects: true });
  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 " data-testid={`${solutionKey}-how-it-works`}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
          {t('solx.headings.howItWorksTitle')}{' '}
          <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('solx.headings.howItWorksHighlight')}</span>
        </h2>
        <p className="text-center text-gray-500  mb-12 text-sm">{t('solx.headings.howItWorksSubtitle')}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="bg-white  border border-gray-200  rounded-2xl p-6 h-full hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 bg-gradient-to-br from-[#5B22D6] to-[#E22B8A] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="text-lg font-bold text-[#0F0E1A]  mb-2">{step.title}</h3>
                <p className="text-gray-600  text-sm leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-[#5B22D6]/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Platform capability matrix table
 */
export const PlatformCapabilityTable = () => {
  const t = useTranslation();
  const rawCategories = t('solx.capabilities', { returnObjects: true });
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  const renderIcon = (val) => {
    if (val === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    if (val === false) return <Minus className="w-5 h-5 text-slate-300  mx-auto" />;
    return <span className="text-sm text-slate-500">{val}</span>;
  };

  return (
    <section className="py-20 bg-white " data-testid="platform-capabilities">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="text-3xl font-bold text-[#0F0E1A]  mb-4 text-center">
          {t('solx.headings.capabilitiesTitle')}{' '}
          <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('solx.headings.capabilitiesHighlight')}</span>
        </h2>
        <p className="text-center text-gray-500  mb-10 text-sm">{t('solx.headings.capabilitiesSubtitle')}</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-[#5B22D6]/20">
                <th className="text-left py-4 px-4 text-sm font-bold text-slate-500  uppercase tracking-wider w-2/5">{t('solx.headings.capabilitiesFeature')}</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-slate-600  uppercase tracking-wider">{t('solx.headings.capabilitiesStarter')}</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#5B22D6]  uppercase tracking-wider">{t('solx.headings.capabilitiesProfessional')}</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-[#E22B8A] uppercase tracking-wider">{t('solx.headings.capabilitiesEnterprise')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <React.Fragment key={cat.name}>
                  <tr className="bg-slate-50 ">
                    <td colSpan={4} className="py-3 px-4 font-bold text-sm text-[#5B22D6]  uppercase tracking-wider">{cat.name}</td>
                  </tr>
                  {cat.features.map((feat) => (
                    <motion.tr
                      key={feat.name}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.03 }}
                      className="border-b border-slate-100  hover:bg-slate-50 :bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-700 ">{feat.name}</td>
                      <td className="py-3 px-4">{renderIcon(feat.starter)}</td>
                      <td className="py-3 px-4">{renderIcon(feat.professional)}</td>
                      <td className="py-3 px-4">{renderIcon(feat.enterprise)}</td>
                    </motion.tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

SolutionStats.propTypes = {
  solutionKey: PropTypes.string.isRequired,
};

SolutionComparison.propTypes = {
  solutionKey: PropTypes.string.isRequired,
};

SolutionHowItWorks.propTypes = {
  solutionKey: PropTypes.string.isRequired,
};
