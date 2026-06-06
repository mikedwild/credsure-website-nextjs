"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations as useTranslation } from 'next-intl';
import { User, Mail, Building2, Briefcase, CheckCircle, Sparkles, Calendar, Shield, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { trackDemoRequest } from '../lib/analytics';

const LOGOS = [
  { name: 'Apollo Medskills', src: '/images/logos/apollo.webp' },
  { name: 'California Metropolitan University', src: '/images/logos/cmu.webp' },
  { name: 'Flipkart', src: '/images/logos/flipkart.webp' },
  { name: 'NEBOSH', src: '/images/logos/nebosh.webp' },
  { name: 'TUV Rheinland', src: '/images/logos/tuv.webp' },
  { name: "King's Business School", src: '/images/logos/kc.webp' },
];

const TRUST_SIGNALS = [
  { icon: Clock, text: '30-min personalized session' },
  { icon: CreditCard, text: 'Free, no credit card required' },
  { icon: Shield, text: 'GDPR compliant & secure' },
];

export const Demo = () => {
  const t = useTranslation();
  const baseUrl = getBaseUrl();
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Book a Demo', path: '/demo' }];
  const [formData, setFormData] = useState({ name: '', email: '', company: '', role: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.company.trim()) errs.company = 'Company is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'demo',
          interests: ['Demo Request'],
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setIsComplete(true);
        trackDemoRequest({ source: 'demo', has_role: !!formData.role });
        toast.success(t('demoPage.successToast', 'Demo request submitted!'));
      } else {
        toast.error(t('demoPage.errorToast', 'Something went wrong.'));
      }
    } catch {
      toast.error(t('demoPage.networkError', 'Network error. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const benefits = t('demoPage.benefits', { returnObjects: true });

  const inputClass = (field) =>
    `w-full pl-11 pr-4 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#5B22D6]/20   ${
      errors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-gray-200  focus:border-[#5B22D6]'
    }`;

  return (
    <>
      <SEO titleKey="demo.seo.title" descriptionKey="demo.seo.description" keywordsKey="demo.seo.keywords" canonical="/demo" structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)} />
      <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-purple-50/20   ">
        <section className="pt-28 pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white  border border-purple-200  rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-[#B82BC4]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F2BD9] ">{t('demoPage.badge', 'Book a Demo')}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F0E1A]  mb-4 leading-tight">
                  {t('demoPage.title', 'See CredSure in Action')}
                </h1>
                <p className="text-base md:text-lg text-gray-600  leading-relaxed max-w-2xl mx-auto">
                  {t('demoPage.subtitle', 'Schedule a personalized demo and discover how CredSure can transform your credentialing process')}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* Single-Step Form */}
                <div className="bg-white  border border-gray-200  rounded-3xl p-8 shadow-xl" data-testid="demo-form">
                  {!isComplete ? (
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700  mb-1.5">
                            {t('demoPage.fullName', 'Full Name')} <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleChange('name', e.target.value)}
                              placeholder="John Smith"
                              className={inputClass('name')}
                              data-testid="demo-input-name"
                            />
                          </div>
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700  mb-1.5">
                            {t('demoPage.workEmail', 'Work Email')} <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleChange('email', e.target.value)}
                              placeholder="john@company.com"
                              className={inputClass('email')}
                              data-testid="demo-input-email"
                            />
                          </div>
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Company */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700  mb-1.5">
                            {t('demoPage.companyName', 'Company')} <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                              type="text"
                              value={formData.company}
                              onChange={(e) => handleChange('company', e.target.value)}
                              placeholder="Acme Corp"
                              className={inputClass('company')}
                              data-testid="demo-input-company"
                            />
                          </div>
                          {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
                        </div>

                        {/* Role (optional) */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700  mb-1.5">
                            {t('demoPage.jobTitle', 'Job Title')} <span className="text-gray-600 text-xs font-normal">(optional)</span>
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                              type="text"
                              value={formData.role}
                              onChange={(e) => handleChange('role', e.target.value)}
                              placeholder="Head of L&D"
                              className={inputClass('role')}
                              data-testid="demo-input-role"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 brand-gradient hover:opacity-90 text-white py-3 rounded-xl font-semibold text-base"
                        data-testid="demo-submit"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {t('demoPage.requestDemo', 'Request a Demo')}
                          </span>
                        )}
                      </Button>

                      {/* Trust Signals */}
                      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5">
                        {TRUST_SIGNALS.map((signal) => (
                          <div key={signal.text} className="flex items-center gap-1.5 text-xs text-gray-500 ">
                            <signal.icon className="w-3.5 h-3.5 text-[#5B22D6] " />
                            <span>{signal.text}</span>
                          </div>
                        ))}
                      </div>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-10"
                      data-testid="demo-success"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100  flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-[#0F0E1A]  mb-3">
                        {t('demoPage.successTitle', "You're All Set!")}
                      </h3>
                      <p className="text-gray-600  max-w-sm mx-auto">
                        {t('demoPage.successDesc', "We'll reach out within 24 hours to schedule your personalized demo.")}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Right Column: Benefits + Logos */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] text-white rounded-3xl p-8">
                    <h3 className="text-2xl font-bold mb-5">{t('demoPage.whatToExpect', 'What to Expect')}</h3>
                    <ul className="space-y-4">
                      {Array.isArray(benefits) && benefits.map((text, index) => (
                        <li key={`benefit-${index}`} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span className="text-white/90">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-5">
                      Trusted by 150+ organizations
                    </p>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                      {LOGOS.map((logo) => (
                        <div key={logo.name} className="flex items-center justify-center h-12">
                          <img
                            src={logo.src}
                            alt={logo.name}
                            className="max-h-12 max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
