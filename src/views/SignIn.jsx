"use client";
import React, { useState } from 'react';
import { SEO } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SignIn = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-purple-50/20 flex items-center justify-center px-6">
      <SEO
        titleKey="seo.signIn.title"
        descriptionKey="seo.signIn.description"
        keywordsKey="seo.signIn.keywords"
        canonical="/signin"
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#0F0E1A] mb-4">Sign In</h1>
          <p className="text-gray-600">Access your CredSure account</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#5B22D6] focus:outline-none focus:ring-2 focus:ring-[#5B22D6]/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#5B22D6] focus:outline-none focus:ring-2 focus:ring-[#5B22D6]/20"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full brand-gradient text-white py-3 rounded-xl font-semibold">
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-[#5B22D6] hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
