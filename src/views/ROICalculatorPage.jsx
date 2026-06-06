"use client";
import React from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { ROICalculator } from '@/components/ROICalculator';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ArrowLeft } from 'lucide-react';

export const ROICalculatorPage = () => {
  const baseUrl = getBaseUrl();

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'ROI Calculator', path: '/roi-calculator' }
  ];

  return (
    <>
      <SEO
        titleKey="seo.roiCalculator.title"
        descriptionKey="seo.roiCalculator.description"
        keywordsKey="seo.roiCalculator.keywords"
        canonical="/roi-calculator"
        structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
        {/* Header with back button */}
        <div className="pt-24 pb-8 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 lg:px-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[#5B22D6] hover:text-[#3F2BD9] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0F0E1A]">
              Efficiency <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">Calculator</span>
            </h1>
            <p className="text-xl text-gray-600 mt-3">
              See how much time and money you save by automating credential management
            </p>
          </div>
        </div>

        {/* ROI Calculator Component */}
        <ROICalculator />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] text-white">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Saving?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join 150+ organizations that have already switched to CredSure and are saving thousands every year.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/demo"
                className="px-8 py-4 bg-white text-[#5B22D6] rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Book a Demo
              </Link>
              <Link 
                to="/pricing"
                className="px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white/10 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
