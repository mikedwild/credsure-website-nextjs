"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useTranslations as useTranslation } from 'next-intl';
import { getPostImage, formatDate } from '../utils/blogImageUtils';
import { getPostTopics } from '../utils/blogUtils';

export const BlogCard = ({ post, isHero, index }) => {
  const { t, i18n } = useTranslation(['common', 'blog']);
  const postTopics = getPostTopics(post);

  return (
    <motion.article
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className={`group bg-white  border border-gray-200  rounded-2xl overflow-hidden hover:border-[#5B22D6] hover:shadow-xl transition-all duration-500 ${isHero ? 'md:col-span-2 xl:col-span-3' : ''}`}
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <div className={`relative overflow-hidden ${isHero ? 'aspect-[21/9]' : 'aspect-video'}`}>
          <img
            src={getPostImage(post)}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#5B22D6]">{post.category}</span>
            {isHero && (
              <span className="px-3 py-1 bg-[#5B22D6]/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">{t('pages.blog.latest', 'Latest')}</span>
            )}
          </div>
        </div>
        <div className={`${isHero ? 'p-8' : 'p-5'}`}>
          <div className="flex items-center gap-3 text-xs text-gray-500  mb-3">
            <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(post.date, i18n.language)}</div>
            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</div>
          </div>
          <h3 className={`${isHero ? 'text-2xl' : 'text-base'} font-bold text-[#0F0E1A]  mb-2 group-hover:text-[#5B22D6] transition-colors line-clamp-2`}>
            {t(`${post.slug}.title`, { ns: 'blog', defaultValue: post.title })}
          </h3>
          <p className={`text-gray-600  mb-4 leading-relaxed ${isHero ? 'line-clamp-3 text-sm' : 'line-clamp-2 text-xs'}`}>
            {t(`${post.slug}.excerpt`, { ns: 'blog', defaultValue: post.excerpt })}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {postTopics.slice(0, 3).map(topic => (
              <span key={topic} className="px-2 py-0.5 bg-slate-100  text-slate-500  rounded text-[10px] font-medium">
                {topic}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center text-[#5B22D6] hover:text-[#3F2BD9] font-bold text-sm">
            {t('pages.blog.readMore')}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

BlogCard.propTypes = {
  post: PropTypes.object.isRequired,
  isHero: PropTypes.bool,
  index: PropTypes.number.isRequired,
};
