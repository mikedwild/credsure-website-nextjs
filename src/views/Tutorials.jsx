"use client";
import React, { useState, useCallback } from 'react';
import { SEO, createHowToSchema, createSpeakableSchema, combineSchemas, getBaseUrl } from '@/components/SEO';
import { useTranslations as useTranslation } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Clock, Award, Zap, BarChart3, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalizedLink as Link } from '@/components/LocalizedLink';

const ytThumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const TUTORIAL_CATEGORIES = [
  {
    titleKey: 'pages.tutorials.gettingStarted',
    icon: Award,
    tutorials: [
      {
        title: 'What are Digital Credentials?',
        duration: '5',
        desc: 'Learn what digital credentials are, why they matter, and how they are transforming certification across industries.',
        videoId: 'lvtywaANJE4',
        level: 'Beginner'
      },
      {
        title: 'CredSure Product Features Overview',
        duration: '3',
        desc: 'A complete walkthrough of the CredSure platform — from credential issuance to verification and analytics.',
        videoId: 'd1Ctb7rEWxs',
        level: 'Beginner'
      }
    ]
  },
  {
    titleKey: 'pages.tutorials.advancedFeatures',
    icon: Zap,
    tutorials: [
      {
        title: 'Branding & Custom URL Setup',
        duration: '2',
        desc: 'Customize your credentialing portal with your own branding, logo, colors, and custom URL for a seamless experience.',
        videoId: 'x9TzOBB7PSA',
        level: 'Intermediate'
      },
      {
        title: 'Boost Brand Visibility with Credentials',
        duration: '3',
        desc: 'Discover how shareable digital certificates and badges drive organic brand exposure across social platforms.',
        videoId: 'wP0txFtPMTg',
        level: 'Intermediate'
      }
    ]
  },
  {
    titleKey: 'pages.tutorials.analyticsReporting',
    icon: BarChart3,
    tutorials: [
      {
        title: 'Digital Badges & Brand Amplification',
        duration: '4',
        desc: 'Understand how digital badges unleash brand visibility and help you track engagement across your credential ecosystem.',
        videoId: '8t_W_mvLjtk',
        level: 'Intermediate'
      },
      {
        title: 'Digital Credentialing in Education',
        duration: '6',
        desc: 'Explore how online education institutions use digital credentials to validate learning and boost student outcomes.',
        videoId: '0BYkonjQiDM',
        level: 'Advanced'
      }
    ]
  }
];

const VideoModal = ({ videoId, title, onClose }) => (
  <AnimatePresence>
    {videoId && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            data-testid="video-modal-close"
            className="absolute -top-12 right-0 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const Tutorials = () => {
  const { t } = useTranslation();
  const baseUrl = getBaseUrl();
  const [activeVideo, setActiveVideo] = useState(null);

  const openVideo = useCallback((videoId, title) => {
    setActiveVideo({ videoId, title });
  }, []);

  const closeVideo = useCallback(() => {
    setActiveVideo(null);
  }, []);

  const getLevelColor = (level) => {
    if (level === 'Beginner') return 'bg-green-100 text-green-700';
    if (level === 'Intermediate') return 'bg-blue-100 text-blue-700';
    if (level === 'Advanced') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const howToSchemas = TUTORIAL_CATEGORIES.flatMap(cat =>
    cat.tutorials.map(tut => createHowToSchema({
      name: tut.title,
      description: tut.desc,
      totalTime: `PT${tut.duration}M`,
      steps: [{ name: tut.title, text: tut.desc }]
    }, baseUrl))
  );

  const speakableSchema = createSpeakableSchema(
    { title: 'CredSure Video Tutorials', description: t('pages.tutorials.subtitle') },
    ['h1', '.tutorial-description', 'h2']
  );

  return (
    <>
      <SEO
        titleKey="seo.tutorials.title"
        descriptionKey="seo.tutorials.description"
        keywordsKey="seo.tutorials.keywords"
        canonical="/tutorials"
        structuredData={combineSchemas(speakableSchema, ...howToSchemas)}
      />

      {activeVideo && (
        <VideoModal videoId={activeVideo.videoId} title={activeVideo.title} onClose={closeVideo} />
      )}

      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
        {/* Hero */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] text-white">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 data-testid="tutorials-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                {t('pages.tutorials.title')} <span className="text-transparent bg-gradient-to-r from-white to-blue-200 bg-clip-text">{t('pages.tutorials.titleHighlight')}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                {t('pages.tutorials.subtitle')}
              </p>
              <div className="flex items-center justify-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  <span>{t('pages.tutorials.videos')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{t('pages.tutorials.hours')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>{t('pages.tutorials.levels')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tutorial Categories */}
        {TUTORIAL_CATEGORIES.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          return (
            <section key={category.titleKey} className="py-16">
              <div className="container mx-auto px-6 lg:px-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#0F0E1A]">{t(category.titleKey)}</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.tutorials.map((tutorial) => (
                    <motion.div
                      key={tutorial.videoId}
                      data-testid={`tutorial-card-${tutorial.videoId}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      viewport={{ once: true }}
                      onClick={() => openVideo(tutorial.videoId, tutorial.title)}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#5B22D6] transition-all group cursor-pointer"
                    >
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={ytThumb(tutorial.videoId)}
                          alt={tutorial.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(tutorial.level)}`}>
                            {tutorial.level}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{tutorial.duration} {t('pages.tutorials.min')}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#0F0E1A] mb-2 group-hover:text-[#5B22D6] transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{tutorial.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('pages.tutorials.ctaTitle')}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('pages.tutorials.ctaDesc')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/demo">
                <Button className="bg-white text-[#5B22D6] hover:bg-white/90 px-10 py-6 text-lg rounded-2xl font-semibold">
                  {t('pages.tutorials.bookDemo')}
                </Button>
              </Link>
              <Link to="/help-center">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-lg rounded-2xl font-semibold">
                  {t('pages.tutorials.helpCenter')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
