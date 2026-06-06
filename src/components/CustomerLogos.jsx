"use client";
import React from 'react';
import { useTranslation } from '@/lib/useTranslation';

const logos = [
  { name: 'Apollo Medskills', src: '/images/logos/apollo.webp' },
  { name: 'California Metropolitan University', src: '/images/logos/cmu.webp' },
  { name: 'Flipkart', src: '/images/logos/flipkart.webp' },
  { name: 'NEBOSH', src: '/images/logos/nebosh.webp' },
  { name: 'St. John Ambulans Malaysia', src: '/images/logos/sjam.webp' },
  { name: 'TUV Rheinland', src: '/images/logos/tuv.webp' },
  { name: "King's Business School", src: '/images/logos/kc.webp' },
  { name: 'American Halal Foundation', src: '/images/logos/ahf.webp' }
];

export const CustomerLogos = () => {
  const t = useTranslation();

  return (
    <section className="py-16 bg-white  border-y border-slate-200  transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 data-testid="trusted-by-heading" className="text-center text-lg md:text-xl font-semibold text-slate-700  mb-10">
          {t('trustedBy')}
        </h2>

        {/* Marquee scroll */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white  to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white  to-transparent z-10" />

          <div className="flex items-center gap-16 animate-scroll">
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div key={`logo-${index}-${logo.name}`} className="flex-shrink-0 flex items-center justify-center h-20 w-44">
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-h-16 max-w-full object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
