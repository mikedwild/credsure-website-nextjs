"use client";
import React from 'react';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import {
  Award, BarChart3, Briefcase, Building2, CheckCircle,
  GraduationCap, Lock, Share2, Shield, Users, Zap,
  ArrowRight, BookOpen, Play, Laptop
} from 'lucide-react';
import { industryUseCases } from '@/data/mock';

const ICON_MAP = {
  Award, BarChart3, Briefcase, Building2, CheckCircle,
  GraduationCap, Lock, Share2, Shield, Users, Zap, Laptop
};

const industryLinks = {
  "Education & Universities": "/solutions/higher-education",
  "Corporate Training": "/solutions/corporate-training",
  "Professional Associations": "/solutions/associations",
  "Certification Bodies": "/solutions/certification-bodies",
  "Online Learning Platforms": "/solutions/higher-education",
  "Healthcare": "/solutions/healthcare"
};

export const IndustryUseCases = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight font-heading">
            Built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
              Every Industry
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 font-body">
            From education to enterprise, CredSure powers credentials across all sectors
          </p>
        </div>

        {/* Use cases grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {industryUseCases.map((useCase) => {
            const IconComponent = ICON_MAP[useCase.icon] || Zap;
            const link = industryLinks[useCase.title] || "/demo";
            return (
              <Link
                key={useCase.title}
                to={link}
                className="block bg-white border border-slate-200 rounded-3xl p-10 hover:shadow-2xl hover:border-brand-purple/30 transition-all duration-500 group"
              >
                {/* Icon */}
                <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-slate-900 mb-4 font-heading group-hover:text-brand-purple transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed text-lg font-body">
                  {useCase.description}
                </p>

                {/* Stats badge */}
                <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                  <span className="text-sm font-medium text-brand-purple">{useCase.stats}</span>
                </div>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center text-brand-purple font-medium">
                  <span className="mr-2">Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-20 space-y-6">
          <p className="text-slate-600 mb-6 text-lg">Don't see your industry? We work with all types of organizations.</p>
          <Link
            to="/pricing"
            className="inline-flex items-center text-brand-purple hover:text-brand-purple-light font-semibold text-lg group"
          >
            See Pricing for All Plans
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          
          {/* Contextual deep links */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/guides" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-purple font-medium" data-testid="industry-guides-link">
              <BookOpen className="w-3.5 h-3.5" /> Read our industry guides
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/webinars" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-purple font-medium" data-testid="industry-webinars-link">
              <Play className="w-3.5 h-3.5" /> Watch webinars
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/customer-success" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-purple font-medium" data-testid="industry-stories-link">
              <Users className="w-3.5 h-3.5" /> Customer stories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
