"use client";
import React, { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Award, Shield, BarChart3, Users, Headphones, Building2 } from 'lucide-react';

const categoryIcons = [Award, Shield, BarChart3, Users, Headphones, Building2];
const categoryGradients = [
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-slate-600 to-slate-800'
];

export const PricingFeaturesComparison = () => {
  const t = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState(0);
  
  const rawCategories = t('pricingFeatures.categories', { returnObjects: true });
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const rawPlans = t('pricingFeatures.plans', { returnObjects: true });
  const plans = Array.isArray(rawPlans) ? rawPlans : ['Start', 'Grow', 'Boost'];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50  transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80  backdrop-blur-sm border border-purple-200  rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600 " />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 ">
              {t('pricingFeatures.badge')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900  mb-4">
            {t('pricingFeatures.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9]">
              {t('pricingFeatures.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-slate-600 ">
            {t('pricingFeatures.subtitle')}
          </p>
        </motion.div>

        {/* Bento Grid of Feature Categories */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto mb-8"
        >
          {categories.map((category, catIndex) => {
            const IconComponent = categoryIcons[catIndex] || Award;
            const isExpanded = expandedCategory === catIndex;
            return (
              <motion.div
                key={category.name || `cat-${catIndex}`}
                variants={item}
                onClick={() => setExpandedCategory(catIndex)}
                data-testid={`feature-category-${catIndex}`}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  isExpanded
                    ? 'border-[#5B22D6]  bg-white  shadow-xl scale-[1.02]'
                    : 'border-slate-200  bg-white/70  hover:border-slate-300 :border-slate-600 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryGradients[catIndex]} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900  text-sm">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-500 ">
                      {category.features.length} features
                    </p>
                  </div>
                </div>
                {/* Mini preview of check marks */}
                <div className="flex gap-1 flex-wrap">
                  {category.features.slice(0, 6).map((f) => (
                    <div key={f.name} className={`w-2 h-2 rounded-full ${f.boost ? 'bg-green-400' : 'bg-slate-300 '}`} />
                  ))}
                  {category.features.length > 6 && (
                    <span className="text-[10px] text-slate-400">+{category.features.length - 6}</span>
                  )}
                </div>
                {isExpanded && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-white  border-b-2 border-r-2 border-[#5B22D6]  rotate-45 translate-y-1/2" />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Expanded Feature Table */}
        {categories[expandedCategory] && (
          <motion.div
            key={expandedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <div className="bg-white  rounded-2xl border-2 border-[#5B22D6]  shadow-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-0 border-b border-slate-200 ">
                <div className="p-5 flex items-center gap-3">
                  {React.createElement(categoryIcons[expandedCategory] || Award, {
                    className: 'w-5 h-5 text-[#5B22D6] '
                  })}
                  <span className="font-bold text-slate-900  text-sm">
                    {categories[expandedCategory].name}
                  </span>
                </div>
                {plans.map((plan, i) => (
                  <div key={plan} className={`p-5 text-center ${i === 2 ? 'bg-gradient-to-b from-purple-50 to-transparent ' : ''}`}>
                    <span className={`font-bold text-sm ${i === 2 ? 'text-[#5B22D6] ' : 'text-slate-700 '}`}>
                      {plan}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feature Rows */}
              {categories[expandedCategory].features.map((feature, fIndex) => (
                <div
                  key={feature.name}
                  className={`grid grid-cols-4 gap-0 border-b border-slate-100  last:border-0 ${
                    fIndex % 2 === 0 ? 'bg-slate-50/50 ' : ''
                  } hover:bg-purple-50/50 :bg-purple-900/10 transition-colors`}
                >
                  <div className="p-4 flex items-center">
                    <span className="text-sm text-slate-700 ">{feature.name}</span>
                  </div>
                  {['start', 'grow', 'boost'].map((plan) => (
                    <div key={plan} className={`p-4 flex items-center justify-center ${plan === 'boost' ? 'bg-purple-50/30 ' : ''}`}>
                      {feature[plan] ? (
                        <div className="w-7 h-7 rounded-full bg-green-100  flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600 " />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100  flex items-center justify-center">
                          <X className="w-4 h-4 text-slate-400 " />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
