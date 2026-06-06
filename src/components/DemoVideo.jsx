"use client";
import React from 'react';
import { useTranslations as useTranslation } from 'next-intl';
import { Play, CheckCircle2 } from 'lucide-react';

export const DemoVideo = () => {
  const t = useTranslation();
  const [isPlaying, setIsPlaying] = React.useState(false);

  const videoUrl = "https://player.vimeo.com/video/922333120";
  const duration = "2:30";

  return (
    <section id="demo-video" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('demoSection.headline')}
            </h2>
            <p className="text-xl text-slate-300">
              {t('demoSection.subheadline')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video player */}
            <div className="relative">
              <div className="relative bg-slate-700 rounded-2xl overflow-hidden shadow-2xl aspect-video">
                {!isPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                       onClick={() => setIsPlaying(true)}>
                    <div className="absolute inset-0 brand-gradient-blue opacity-80"></div>
                    <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      <Play className="w-10 h-10 text-brand-purple ml-1" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                      <span className="text-white text-sm font-medium">{duration}</span>
                    </div>
                  </div>
                ) : (
                  <iframe
                    className="w-full h-full"
                    src={`${videoUrl}?autoplay=1&loop=1&title=0&byline=0&portrait=0`}
                    title="CredSure Product Video"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>

              {/* Trust badge below video */}
              <div className="mt-6 flex items-center justify-center gap-4 text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-purple-light" />
                  <span className="text-sm">{t('demoSection.noSignup')}</span>
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-purple-light" />
                  <span className="text-sm">{t('demoSection.underMinutes')}</span>
                </span>
              </div>
            </div>

            {/* Features list */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                {t('demoSection.whatYoullLearn')}
              </h3>
              <ul className="space-y-4">
                {(Array.isArray(t('demoSection.features', { returnObjects: true })) ? t('demoSection.features', { returnObjects: true }) : []).map((feature, index) => (
                  <li key={`demo-feature-${index}`} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-purple-light rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-lg text-slate-200">{feature}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Additional CTA */}
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                <p className="text-white mb-4">
                  <strong>{t('demoSection.readyToTry')}</strong>
                </p>
                <p className="text-slate-300 mb-4">
                  {t('demoSection.readyToTryDesc')}
                </p>
                <a
                  href="#pricing"
                  className="inline-flex items-center text-brand-purple-light hover:text-white font-semibold"
                >
                  {t('demoSection.startFreeTrial')} &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
