"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SEO, createBreadcrumbSchema, getBaseUrl } from '@/components/SEO';
import { useTranslation } from '@/lib/useTranslation';
import { useLocale } from 'next-intl';
import { Search, Filter, X, Tag } from 'lucide-react';
import { getPostTopics, localizeBlogLabel } from '../utils/blogUtils';
import { BlogCard } from './BlogCard';
import { BlogFilters } from './BlogFilters';
import { BlogPagination } from './BlogPagination';
import { trackNewsletterSignup } from '@/lib/analytics';

const POSTS_PER_PAGE = 12;

/**
 * @param {{ initialPosts?: Array<Record<string, unknown>> | null }} props
 *   Server-fetched post list (SSR seed); falls back to a client fetch when absent.
 */
export const Blog = ({ initialPosts = null }) => {
  const t = useTranslation();
  const i18n = { language: useLocale() };
  const [blogData, setBlogData] = useState(initialPosts || []);
  const [isLoading, setIsLoading] = useState(!initialPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Blog-index newsletter CTA state (the "Stay Updated" section). Mirrors the
  // in-article InlineBlogCTA submit so the index form actually subscribes
  // instead of silently doing nothing.
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const baseUrl = getBaseUrl();
  const blogTopRef = useRef(null);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterSubmitting) return;
    setNewsletterSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          name: '',
          company: '',
          role: '',
          source: 'blog-index-newsletter',
          interests: ['Blog Newsletter'],
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setNewsletterSuccess(true);
        trackNewsletterSignup({ source: 'blog-index-newsletter' });
      }
    } catch (err) {
      console.error('Blog newsletter submission failed:', err.message);
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  useEffect(() => {
    // Server already seeded the list for this locale (keyed remount on locale
    // change supplies fresh data) — skip the client refetch.
    if (initialPosts) return;
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    fetch(`${API_URL}/api/blogs?limit=200&lang=${i18n.language}`)
      .then(res => res.json())
      .then(data => {
        setBlogData(data.posts || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [i18n.language, initialPosts]);

  useEffect(() => {
    if (blogTopRef.current) {
      blogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' }
  ];

  const filteredPosts = useMemo(() => {
    return blogData
      .filter(post => {
        const matchesSearch = !searchTerm ||
          (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        const matchesTopics = selectedTopics.length === 0 ||
          selectedTopics.some(topic => getPostTopics(post).includes(topic));
        return matchesSearch && matchesCategory && matchesTopics;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [searchTerm, selectedCategory, selectedTopics, blogData]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handleCategoryChange = (cat) => { setSelectedCategory(cat); setCurrentPage(1); };
  const handleSearch = (term) => { setSearchTerm(term); setCurrentPage(1); };
  const toggleTopic = (topic) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
    setCurrentPage(1);
  };
  const clearAllFilters = () => { setSelectedCategory('All'); setSelectedTopics([]); setSearchTerm(''); setCurrentPage(1); };

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + selectedTopics.length + (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white   ">
      <SEO
        titleKey="seo.blog.title"
        descriptionKey="seo.blog.description"
        keywordsKey="seo.blog.keywords"
        canonical="/blog"
        structuredData={createBreadcrumbSchema(breadcrumbs, baseUrl)}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#FAFAFA] via-white to-purple-50/30   ">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F0E1A]  mb-6">
              {t('pages.blog.title')} <span className="text-transparent bg-gradient-to-r from-[#5B22D6] to-[#E22B8A] bg-clip-text">{t('pages.blog.titleHighlight')}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600  mb-8">{t('pages.blog.subtitle')}</p>
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  placeholder={t('pages.blog.searchPlaceholder', 'Search articles...')}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  data-testid="blog-search"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300    rounded-xl focus:border-[#5B22D6] focus:outline-none focus:ring-2 focus:ring-[#5B22D6]/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Filters Pills */}
      {(selectedTopics.length > 0 || selectedCategory !== 'All') && (
        <div className="container mx-auto px-6 md:px-12 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500  mr-1">{t('mscx.blog.filteringBy')}</span>
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#5B22D6]/10  text-[#5B22D6]  rounded-full text-xs font-medium">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedTopics.map(topic => (
              <span key={topic} className="inline-flex items-center gap-1 px-3 py-1 bg-[#E22B8A]/10  text-[#E22B8A]  rounded-full text-xs font-medium">
                <Tag className="w-3 h-3" />
                {localizeBlogLabel(topic, i18n.language)}
                <button onClick={() => toggleTopic(topic)} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-slate-500 hover:text-red-500 underline ml-2">{t('mscx.blog.clearAll')}</button>
          </div>
        </div>
      )}

      {/* Blog Grid with Sidebar */}
      <section className="py-12" ref={blogTopRef}>
        <div className="container mx-auto px-6 md:px-12">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden mb-6 flex items-center gap-2 px-4 py-2 border border-slate-300  rounded-xl text-sm font-medium text-slate-700  hover:bg-slate-50 :bg-slate-800"
            data-testid="blog-mobile-filter-toggle"
          >
            <Filter className="w-4 h-4" />
            {t('mscx.blog.filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 bg-white  border border-slate-200  rounded-2xl p-6">
                <BlogFilters
                  selectedCategory={selectedCategory}
                  selectedTopics={selectedTopics}
                  activeFilterCount={activeFilterCount}
                  onCategoryChange={handleCategoryChange}
                  onToggleTopic={toggleTopic}
                  onClearAll={clearAllFilters}
                />
              </div>
            </aside>

            {/* Mobile filters overlay */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white  overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 ">{t('mscx.blog.filters')}</h3>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="w-5 h-5 text-slate-600 " />
                    </button>
                  </div>
                  <BlogFilters
                    selectedCategory={selectedCategory}
                    selectedTopics={selectedTopics}
                    activeFilterCount={activeFilterCount}
                    onCategoryChange={handleCategoryChange}
                    onToggleTopic={toggleTopic}
                    onClearAll={clearAllFilters}
                  />
                </div>
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-white  border border-gray-200  rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-video bg-gray-200 " />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-gray-200  rounded w-1/3" />
                        <div className="h-5 bg-gray-200  rounded w-full" />
                        <div className="h-4 bg-gray-200  rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <>
              <div className="mb-6 text-sm text-gray-500 ">
                {t('pages.blog.showing', { count: paginatedPosts.length, total: filteredPosts.length, ns: 'pages' })}
                {selectedCategory !== 'All' && ` ${t('pages.blog.inCategory', { category: localizeBlogLabel(selectedCategory, i18n.language), ns: 'pages' })}`}
                {searchTerm && ` ${t('pages.blog.matching', { term: searchTerm, ns: 'common' })}`}
              </div>

              {paginatedPosts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-gray-600  mb-4">{t('mscx.blog.noPostsFound')}</p>
                  <button onClick={clearAllFilters} className="text-[#5B22D6] hover:underline font-medium">{t('mscx.blog.clearAllFilters')}</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedPosts.map((post, idx) => {
                    const isHero = idx === 0 && currentPage === 1 && !searchTerm && selectedCategory === 'All' && selectedTopics.length === 0;
                    return <BlogCard key={post.id} post={post} isHero={isHero} index={idx} />;
                  })}
                </div>
              )}

              <BlogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('pages.blog.stayUpdated', 'Stay Updated')}</h2>
            <p className="text-lg text-white/90 mb-8">{t('pages.blog.stayUpdatedDesc', 'Get the latest insights on digital credentialing delivered to your inbox')}</p>
            {newsletterSuccess ? (
              <p className="text-lg font-semibold text-white" data-testid="blog-newsletter-success">
                {t('inlineCTA.success', "You're subscribed! Check your inbox for insights.")}
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t('pages.blog.emailPlaceholder', 'Enter your email')}
                  data-testid="blog-newsletter-email"
                  className="flex-1 px-6 py-3 rounded-xl bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  disabled={newsletterSubmitting}
                  data-testid="blog-newsletter-submit"
                  className="px-8 py-3 bg-white text-[#5B22D6] rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {newsletterSubmitting ? '...' : t('pages.blog.subscribe', 'Subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
