"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations as useTranslation } from 'next-intl';
import { Zap, Shield, Sparkles, TrendingUp, Globe, Award, BarChart3, Lock } from 'lucide-react';
import { BentoHeroCard, BentoGlassCard, BentoStatCard, BentoCompactCard, BentoListCard } from './bento/BentoCards';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const BentoShowcase = () => {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-white  relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-30 ">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-400 via-pink-400 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 via-cyan-400 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-400 via-emerald-400 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80  backdrop-blur-sm border border-purple-200  rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600 " />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 ">{t('bento.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900  mb-4">{t('bento.title')}</h2>
          <p className="text-lg text-slate-600 ">{t('bento.subtitle')}</p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
          <BentoHeroCard
            icon={Zap}
            title={t('bento.fastIssuance')}
            description={t('bento.fastIssuanceDesc')}
            items={[t('bento.bulkUpload'), t('bento.realtimeApi'), t('bento.automatedWorkflows')]}
            className="md:col-span-6 lg:row-span-2"
          />

          <BentoGlassCard icon={Shield} iconGradient="bg-gradient-to-br from-green-500 to-emerald-600" title={t('bento.blockchainVerified')} description={t('bento.blockchainVerifiedDesc')} className="md:col-span-3" />

          <BentoStatCard icon={TrendingUp} value="99.9%" label={t('bento.uptimeSla')} gradient="bg-gradient-to-br from-orange-500/10 to-red-500/10   border border-orange-200  text-slate-900 " className="md:col-span-3" />

          <BentoGlassCard icon={BarChart3} iconGradient="bg-gradient-to-br from-blue-500 to-cyan-600" title={t('bento.advancedAnalytics')} description={t('bento.advancedAnalyticsDesc')} className="md:col-span-4" layout="horizontal" />

          <BentoCompactCard icon={Globe} value="45+" label={t('bento.countries')} gradient="bg-gradient-to-br from-cyan-500 to-blue-600  " className="md:col-span-2 aspect-square" rotate={2} />

          <BentoListCard
            icon={Lock}
            iconGradient="bg-gradient-to-br from-purple-500 to-pink-600"
            title={t('bento.enterpriseSecurity')}
            items={[t('bento.soc2'), t('bento.gdprCompliant'), t('bento.encryption'), t('bento.securityAudits')]}
            dotColor="bg-purple-600 "
            className="md:col-span-6 lg:col-span-4"
          />

          <BentoCompactCard icon={Award} value={t('bento.awardWinning')} label={t('bento.platform2025')} gradient="bg-gradient-to-br from-yellow-400 to-orange-500  " className="md:col-span-3 lg:col-span-2 aspect-square" rotate={-2} />
        </motion.div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 20s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </section>
  );
};
