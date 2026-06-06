"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { SEO, getBaseUrl } from '@/components/SEO';
import { Check, X, ArrowRight, Shield, Zap, Clock, Users, Award, BarChart3 } from 'lucide-react';

const FeatureRow = ({ feature, credsure, competitor }) => (
  <div className="grid grid-cols-3 gap-0 border-b border-slate-100 last:border-0 hover:bg-purple-50/30 transition-colors">
    <div className="p-4 text-sm text-slate-700 font-medium">{feature}</div>
    <div className="p-4 flex items-center justify-center bg-purple-50/20">
      {typeof credsure === 'string' ? (
        <span className="text-sm text-slate-700">{credsure}</span>
      ) : credsure ? (
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center"><Check className="w-4 h-4 text-green-600" /></div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></div>
      )}
    </div>
    <div className="p-4 flex items-center justify-center">
      {typeof competitor === 'string' ? (
        <span className="text-sm text-slate-500">{competitor}</span>
      ) : competitor ? (
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center"><Check className="w-4 h-4 text-green-600" /></div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-400" /></div>
      )}
    </div>
  </div>
);

const ComparisonPage = ({ competitor, compSlug, tagline, reasons, features, faqs }) => {
  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white" data-testid={`compare-${compSlug}-page`}>
      <SEO
        titleKey={`seo.compare${competitor}.title`}
        descriptionKey={`seo.compare${competitor}.description`}
        keywordsKey={`seo.compare${competitor}.keywords`}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B22D6]/10 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#5B22D6]" />
              <span className="text-sm font-semibold text-[#5B22D6]">CredSure vs {competitor}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A] mb-6">
              The {competitor} alternative{' '}
              <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">that delivers</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8">{tagline}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo" className="inline-flex items-center justify-center px-8 py-4 bg-[#5B22D6] text-white rounded-xl font-bold hover:bg-[#2d2461] transition-colors" data-testid={`compare-${compSlug}-demo-btn`}>
                Book a Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/pricing" className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#5B22D6] text-[#5B22D6] rounded-xl font-bold hover:bg-[#5B22D6]/5 transition-colors">
                See Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Reasons */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] text-center mb-12">
            Why organizations choose CredSure over {competitor}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {reasons.map((reason, idx) => {
              const icons = [Zap, Clock, Users, Award, BarChart3, Shield];
              const Icon = icons[idx % icons.length];
              return (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:border-[#5B22D6]/20 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F0E1A] mb-2">{reason.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{reason.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A] text-center mb-12">
            Side-by-side comparison
          </h2>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-0 border-b-2 border-[#5B22D6]/20">
              <div className="p-5 font-bold text-slate-900">Feature</div>
              <div className="p-5 text-center bg-purple-50/30">
                <span className="font-bold text-[#5B22D6]">CredSure</span>
              </div>
              <div className="p-5 text-center">
                <span className="font-bold text-slate-600">{competitor}</span>
              </div>
            </div>
            {features.map((f) => (
              <FeatureRow key={f.feature} feature={f.feature} credsure={f.credsure} competitor={f.competitor} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#0F0E1A] text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <summary className="p-6 cursor-pointer font-bold text-[#0F0E1A] hover:text-[#5B22D6] transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 text-gray-600 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
        <div className="container mx-auto px-6 lg:px-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to switch from {competitor}?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">Join 150+ organizations that chose CredSure for transparent pricing, fast setup, and enterprise-grade security.</p>
          <Link to="/demo" className="inline-flex items-center px-8 py-4 bg-white text-[#5B22D6] rounded-xl font-bold hover:bg-white/90 transition-colors" data-testid={`compare-${compSlug}-cta`}>
            Book a Demo <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Other Comparisons */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h3 className="text-xl font-bold text-[#0F0E1A] mb-6">CredSure vs the others</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {compSlug !== 'accredible' && (
              <Link to="/compare/accredible" className="px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-[#5B22D6] hover:text-[#5B22D6] transition-colors">
                CredSure vs Accredible <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            )}
            {compSlug !== 'credly' && (
              <Link to="/compare/credly" className="px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-[#5B22D6] hover:text-[#5B22D6] transition-colors">
                CredSure vs Credly <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComparisonPage;
