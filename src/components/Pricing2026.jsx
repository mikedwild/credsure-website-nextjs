"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';
import { Check, Star, Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { pricing } from '@/data/mock';
import { useCurrency } from '@/utils/CurrencyContext';

const swapCurrencySymbol = (priceStr, symbol) => {
  if (!priceStr || priceStr === 'Custom') return priceStr;
  return priceStr.replace(/[€$£]/, symbol);
};

export const Pricing2026 = ({ onCtaClick }) => {
  const t = useTranslation();
  const { symbol } = useCurrency();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="pricing" className="py-16 md:py-32 bg-gradient-to-b from-slate-50 via-white to-purple-50/20    relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#B82BC4]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E22B8A]/10 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80  backdrop-blur-sm border border-purple-200  rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#B82BC4] " />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9] ">
              {t('pricing.subtitle')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F0E1A]  mb-6 leading-tight">
            {t('pricing.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pricing.titleHighlight', '')}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600  leading-relaxed">
            {t('pricingExtras.affordable')}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {pricing.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              data-testid={`pricing-card-${plan.name.toLowerCase()}`}
              className={`relative backdrop-blur-xl rounded-3xl p-10 transition-all duration-500 ${
                plan.popular
                  ? 'bg-white/90  border-2 border-[#E22B8A]  shadow-2xl shadow-purple-500/20 scale-105 md:scale-110 z-10'
                  : 'bg-white/70  border border-gray-200/50  hover:border-[#5B22D6] :border-purple-400 hover:shadow-xl hover:bg-white/90 :bg-slate-800/90'
              }`}
              whileHover={{ y: plan.popular ? 0 : -8 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  <div className="bg-gradient-to-r from-[#E22B8A] to-[#B82BC4] text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    {t('pricingUI.mostPopular')}
                  </div>
                </motion.div>
              )}

              {/* Plan Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                plan.popular
                  ? 'bg-gradient-to-br from-[#E22B8A] to-[#B82BC4]'
                  : 'bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]'
              }`}>
                <Zap className="w-8 h-8 text-white" />
              </div>

              {/* Plan Name */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0E1A]  mb-2">
                {plan.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600  mb-8 leading-relaxed">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                {plan.price === 'Custom' ? (
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-[#0F0E1A]  mb-2">
                      Custom
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 ">{plan.period}</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-[#0F0E1A] ">{swapCurrencySymbol(plan.price, symbol)}</span>
                      <span className="text-gray-600  text-base sm:text-lg">/{plan.period.replace('per ', '')}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">{t('pricingUI.billedAnnually')}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-[#E22B8A]/10' : 'bg-[#5B22D6]/10'
                    }`}>
                      <Check className={`w-4 h-4 ${
                        plan.popular ? 'text-[#E22B8A]' : 'text-[#5B22D6]'
                      }`} />
                    </div>
                    <span className="text-gray-700 text-base leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={onCtaClick}
                className={`w-full py-7 text-lg rounded-full font-bold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#E22B8A] to-[#B82BC4] hover:opacity-90 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-white border-2 border-[#5B22D6] text-[#5B22D6] hover:bg-[#5B22D6] hover:text-white'
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 text-lg">
            {t('pricingExtras.includes')}
          </p>
        </motion.div>
      </div>
    </section>
  );

Pricing2026.propTypes = {
  onCtaClick: PropTypes.func,
};
};