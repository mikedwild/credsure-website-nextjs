"use client";
import React, { useState } from 'react';
import { Share2, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Mock social-share card previews (Twitter / LinkedIn / Facebook).
 *
 * Why ship these in the editor: SEO meta is one thing — but most blog
 * traffic clicks through from a tweet, LinkedIn post, or Facebook share
 * card. Writers need to see how the title + description + image will
 * actually appear *before* they hit publish. This is the equivalent of
 * a 3-pack of OG-card previewers (the same job Yoast / Rank Math do
 * inside WordPress) without the WordPress.
 *
 * Inputs are all already on the form: featured_image, seo_title, title,
 * seo_description, excerpt, slug. We just render them inside three
 * pixel-faithful card mockups.
 */

function FallbackCardImage({ category }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#5B22D6] via-[#B82BC4] to-[#E22B8A] flex items-center justify-center">
      <span className="text-white/90 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/15 rounded-full backdrop-blur-sm">
        {category || 'CredSure'}
      </span>
    </div>
  );
}

function TwitterCard({ title, description, slug, image, category }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm" data-testid="social-card-twitter">
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] flex items-center justify-center text-white text-xs font-bold">CS</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">CredSure</p>
          <p className="text-xs text-gray-500 truncate">@CredSure_io · 2m</p>
        </div>
      </div>
      <p className="px-3 pb-3 text-sm text-gray-800 line-clamp-2">
        New on the CredSure blog →
      </p>
      <div className="mx-3 mb-3 border border-gray-200 rounded-2xl overflow-hidden">
        <div className="aspect-[2/1] bg-gray-100">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <FallbackCardImage category={category} />
          )}
        </div>
        <div className="px-3 py-2 border-t border-gray-200">
          <p className="text-[11px] text-gray-500 truncate">credsure.io</p>
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {title || 'Post title will appear here'}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {description || 'Description preview…'}
          </p>
        </div>
      </div>
    </div>
  );
}

function LinkedInCard({ title, description, slug, image, category }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm" data-testid="social-card-linkedin">
      <div className="px-3 pt-3 pb-2 flex items-start gap-2">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">CS</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">CredSure</p>
          <p className="text-[11px] text-gray-500 truncate">Digital Credentialing · 4,200 followers</p>
          <p className="text-[11px] text-gray-500">Just now · 🌐</p>
        </div>
      </div>
      <p className="px-3 pb-2 text-sm text-gray-800 line-clamp-2">
        Just published →
      </p>
      <div className="aspect-[1.91/1] bg-gray-100">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <FallbackCardImage category={category} />
        )}
      </div>
      <div className="px-3 py-2 bg-gray-50">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {title || 'Post title will appear here'}
        </p>
        <p className="text-[11px] text-gray-500 truncate mt-0.5">credsure.io · {slug || 'post-slug'}</p>
      </div>
    </div>
  );
}

function FacebookCard({ title, description, slug, image, category }) {
  return (
    <div className="bg-[#f0f2f5] rounded-lg overflow-hidden" data-testid="social-card-facebook">
      <div className="px-3 pt-3 pb-2 flex items-start gap-2 bg-white">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">CS</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">CredSure</p>
          <p className="text-[11px] text-gray-500 truncate">Just now · 🌐 Public</p>
        </div>
      </div>
      <p className="px-3 pb-2 text-sm text-gray-800 line-clamp-2 bg-white">
        Fresh on the blog →
      </p>
      <div className="aspect-[1.91/1] bg-gray-200">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <FallbackCardImage category={category} />
        )}
      </div>
      <div className="px-3 py-2 bg-[#f0f2f5]">
        <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">credsure.io</p>
        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
          {title || 'Post title will appear here'}
        </p>
        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
          {description || 'Description preview…'}
        </p>
      </div>
    </div>
  );
}

export default function SocialCardPreviews({ form, activeLang }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState('twitter');

  // Active-language SEO fields fall back to body fields when overrides
  // are empty (same fallback logic used by the public SEO component).
  const title = activeLang === 'en'
    ? (form.seo_title || form.title)
    : (form.seo_title_de || form.title_de || form.seo_title || form.title);
  const description = activeLang === 'en'
    ? (form.seo_description || form.excerpt)
    : (form.seo_description_de || form.excerpt_de || form.seo_description || form.excerpt);
  const image = form.featured_image || '';
  const cat = form.category || '';
  const slug = form.slug || '';

  const tabs = [
    { id: 'twitter', label: 'X / Twitter' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'facebook', label: 'Facebook' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" data-testid="social-card-previews">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        data-testid="social-card-previews-toggle"
      >
        <div className="flex items-center gap-3">
          <Share2 className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Social Share Preview
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all ${
                  tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                data-testid={`social-card-tab-${t.id}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'twitter' && <TwitterCard title={title} description={description} slug={slug} image={image} category={cat} />}
          {tab === 'linkedin' && <LinkedInCard title={title} description={description} slug={slug} image={image} category={cat} />}
          {tab === 'facebook' && <FacebookCard title={title} description={description} slug={slug} image={image} category={cat} />}
          {!image && (
            <p className="text-[10px] text-amber-600 italic">
              Set a featured image to replace the gradient placeholder in shares.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
