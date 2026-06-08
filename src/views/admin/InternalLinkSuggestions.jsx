"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link2, Loader2, RefreshCw, ExternalLink, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

/**
 * Sidebar widget that surfaces published posts the writer can link to
 * from the current draft, based on tag overlap + category match.
 *
 * Why this matters: internal links are the highest-leverage on-page SEO
 * signal (PageRank distribution + topical clustering + dwell time). Most
 * writers forget to add them. This widget removes the friction: it
 * proposes 3-6 relevant posts as they type and inserts a proper
 * `<a href="/blog/{slug}">{title}</a>` anchor at the Quill cursor in one
 * click.
 *
 * Debounced fetch so a 300-word paste doesn't fire 300 requests.
 */
export default function InternalLinkSuggestions({ token, activeLang, tags, category, excludeSlug, onInsertLink }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastReqRef = useRef(0);

  const fetchSuggestions = useCallback(async () => {
    // Need at least one signal to query against. Otherwise the response
    // would just be the homepage of "everything published recently",
    // which is noise.
    const tagList = (tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (!tagList.length && !category) {
      setSuggestions([]);
      return;
    }
    const reqId = ++lastReqRef.current;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/blogs/related-suggestions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: tagList, category: category || '', exclude_slug: excludeSlug || '', limit: 6 }),
      });
      // Drop stale responses if a newer request has been kicked off
      // while we were waiting.
      if (reqId !== lastReqRef.current) return;
      if (!res.ok) {
        setError('Failed to load suggestions');
        setSuggestions([]);
        return;
      }
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      if (reqId === lastReqRef.current) setError('Connection error');
    } finally {
      if (reqId === lastReqRef.current) setLoading(false);
    }
  }, [token, tags, category, excludeSlug]);

  // Debounce on tags/category change so we don't hammer the API on
  // every keystroke. 600ms feels responsive without spamming.
  useEffect(() => {
    const handle = setTimeout(() => { fetchSuggestions(); }, 600);
    return () => clearTimeout(handle);
  }, [fetchSuggestions]);

  const handleInsert = (s) => {
    const langPrefix = activeLang === 'de' ? '/de' : '/en';
    const displayTitle = activeLang === 'de' && s.title_de ? s.title_de : s.title;
    const href = `${langPrefix}/blog/${s.slug}`;
    if (onInsertLink) onInsertLink(href, displayTitle);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3" data-testid="admin-internal-links">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-violet-500" /> Suggested Links
        </h4>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          aria-label="Refresh suggestions"
          data-testid="admin-links-refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!tags && !category && (
        <p className="text-[11px] text-gray-500 italic">
          Add tags or set a category to see related published posts you can link to.
        </p>
      )}

      {loading && !suggestions.length && (
        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Finding related posts…
        </p>
      )}

      {error && (
        <p className="text-[11px] text-red-600">{error}</p>
      )}

      {!loading && !error && suggestions.length === 0 && (tags || category) && (
        <p className="text-[11px] text-gray-500 italic">
          No published posts match these tags or category yet.
        </p>
      )}

      {suggestions.length > 0 && (
        <ul className="space-y-2" data-testid="admin-links-list">
          {suggestions.map((s) => (
            <li
              key={s.slug}
              className="group border border-gray-100 hover:border-violet-300 rounded-xl p-2.5 transition-colors"
              data-testid={`admin-link-row-${s.slug}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">
                    {activeLang === 'de' && s.title_de ? s.title_de : s.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500 flex-wrap">
                    {s.category && (
                      <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded font-semibold">
                        {s.category}
                      </span>
                    )}
                    <span className="text-gray-400">score {s.score}</span>
                    {s.tag_overlap > 0 && (
                      <span className="text-gray-400">· {s.tag_overlap} tag{s.tag_overlap === 1 ? '' : 's'} match</span>
                    )}
                  </div>
                </div>
                <a
                  href={`/${activeLang}/blog/${s.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-300 hover:text-violet-600"
                  title="Open in new tab"
                  data-testid={`admin-link-preview-${s.slug}`}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button
                onClick={() => handleInsert(s)}
                className="mt-2 w-full inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-white hover:bg-violet-600 border border-violet-200 hover:border-violet-600 rounded-lg px-2 py-1.5 transition-all"
                data-testid={`admin-link-insert-${s.slug}`}
              >
                Insert link <ArrowRight className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
