"use client";
import React from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';

import { motion } from 'framer-motion';
import { Code, Book } from 'lucide-react';
export const ApiDocs = () => {
  const t = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      <SEO
        titleKey="seo.apiDocs.title"
        descriptionKey="seo.apiDocs.description"
        keywordsKey="seo.apiDocs.keywords"
        canonical="/api-docs"
      />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F0E1A] mb-4">API Documentation</h1>
            <p className="text-gray-600">Integrate CredSure into your application</p>
          </motion.div>
          <div className="bg-white border border-gray-200 rounded-3xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <Book className="w-8 h-8 text-[#5B22D6] flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-[#0F0E1A] mb-3">REST API</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Full REST API documentation with endpoints for credential issuance, verification, and management.
                </p>
                <div className="bg-gray-100 rounded-xl p-4 font-mono text-sm">
                  <code className="text-[#5B22D6]">GET /api/v1/credentials</code><br/>
                  <code className="text-[#5B22D6]">POST /api/v1/credentials/issue</code><br/>
                  <code className="text-[#5B22D6]">GET /api/v1/verify/:id</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
