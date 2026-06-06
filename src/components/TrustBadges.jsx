"use client";
import React from 'react';
import { Shield, Award, Star } from 'lucide-react';

export const TrustBadges = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-8">
      {/* G2 Badge */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-orange-400 text-orange-400" />
            ))}
          </div>
          <span className="font-bold text-slate-900">4.8/5</span>
        </div>
        <div className="h-8 w-px bg-slate-300"></div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Rated on</span>
          <span className="text-sm font-bold text-slate-900">G2</span>
        </div>
      </div>

      {/* EdTech Certified */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
        <Award className="w-5 h-5 text-blue-600" />
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">1EdTech</span>
          <span className="text-sm font-bold text-slate-900">Certified</span>
        </div>
      </div>

      {/* GDPR Compliant */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
        <Shield className="w-5 h-5 text-teal-600" />
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">GDPR</span>
          <span className="text-sm font-bold text-slate-900">Compliant</span>
        </div>
      </div>

      {/* ISO Certified */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
        <Shield className="w-5 h-5 text-blue-600" />
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">ISO 27001</span>
          <span className="text-sm font-bold text-slate-900">Certified</span>
        </div>
      </div>
    </div>
  );
};
