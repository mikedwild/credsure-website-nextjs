"use client";
import React, { useMemo, useState } from 'react';
import { CheckCircle, Circle, Search, BarChart3, Type, Globe, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || '';
}

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function charColor(len, min, max) {
  if (len >= min && len <= max) return 'text-emerald-400';
  if (len === 0) return 'text-gray-500 ';
  return 'text-amber-400';
}

function densityColor(pct) {
  if (pct >= 1 && pct <= 3) return 'bg-emerald-500/20 text-emerald-400';
  if (pct > 0 && pct < 1) return 'bg-amber-500/20 text-amber-400';
  if (pct > 3) return 'bg-red-500/20 text-red-400';
  return 'bg-slate-700/40 text-gray-500 ';
}

function Check({ pass, label }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {pass ? (
        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-gray-600  mt-0.5 flex-shrink-0" />
      )}
      <span className={`text-xs ${pass ? 'text-gray-600 ' : 'text-gray-500 '}`}>{label}</span>
    </div>
  );
}

// ─── Google SERP Preview ────────────────────────────────────────────

function SERPPreview({ title, slug, description }) {
  const displayTitle = (title || 'Untitled Post').slice(0, 60);
  const displayUrl = `credsure.io/blog/${slug || 'post-url'}`;
  const displayDesc = (description || 'No description set').slice(0, 160);

  return (
    <div className="bg-white rounded-xl p-4 space-y-1" data-testid="serp-preview">
      <p className="text-sm text-gray-500  truncate">{displayUrl}</p>
      <p className="text-lg text-blue-700 font-medium leading-snug cursor-pointer hover:underline">{displayTitle}</p>
      <p className="text-sm text-gray-600  leading-relaxed line-clamp-2">{displayDesc}</p>
    </div>
  );
}

// ─── Keyword Density Calculator ─────────────────────────────────────

function KeywordDensity({ keywords, contentText }) {
  const total = wordCount(contentText);
  const lower = contentText.toLowerCase();

  if (!keywords.trim() || total === 0) {
    return <p className="text-xs text-gray-500 ">Add keywords to see density analysis</p>;
  }

  const kws = keywords.split(',').map(k => k.trim()).filter(Boolean);

  return (
    <div className="space-y-2" data-testid="keyword-density">
      {kws.map(kw => {
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = lower.match(regex);
        const count = matches ? matches.length : 0;
        const pct = ((count / total) * 100);
        return (
          <div key={kw} className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600  truncate flex-1">"{kw}"</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 ">{count}x</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${densityColor(pct)}`}>
                {pct.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-gray-600  mt-1">Optimal: 1-3% | Warning: &lt;1% | Overstuffed: &gt;3%</p>
    </div>
  );
}

// ─── Character Counter ──────────────────────────────────────────────

function CharCounter({ label, value, min, max }) {
  const len = (value || '').length;
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 ">{label}</span>
      <span className={`text-xs font-mono ${charColor(len, min, max)}`}>
        {len} / {min}-{max}
      </span>
    </div>
  );
}

// ─── Main SEO Panel ─────────────────────────────────────────────────

export default function SEOPanel({ form, activeLang }) {
  const [expanded, setExpanded] = useState(true);

  const title = activeLang === 'en' ? form.title : form.title_de;
  const excerpt = activeLang === 'en' ? form.excerpt : form.excerpt_de;
  const contentHtml = activeLang === 'en' ? form.content_html : form.content_html_de;
  const tags = activeLang === 'en' ? form.tags : form.tags_de;
  const contentText = useMemo(() => stripHtml(contentHtml), [contentHtml]);
  const words = useMemo(() => wordCount(contentText), [contentText]);
  // SEO Title / Description are per-language — fall back to body fields
  // if the writer hasn't filled the SEO override for that language yet.
  const seoTitle = (activeLang === 'en' ? form.seo_title : form.seo_title_de) || title;
  const seoDesc = (activeLang === 'en' ? form.seo_description : form.seo_description_de) || excerpt;
  const kwList = tags.split(',').map(k => k.trim()).filter(Boolean);
  const primaryKw = kwList[0] || '';

  // ─── SEO Checks ────────────────────────────────────────────────
  const checks = useMemo(() => {
    const lower = contentText.toLowerCase();
    const titleLower = title.toLowerCase();
    const hasH1 = /<h1[\s>]/i.test(contentHtml);
    const h2Count = (contentHtml.match(/<h2[\s>]/gi) || []).length;
    const imgCount = (contentHtml.match(/<img[\s>]/gi) || []).length;
    const linkCount = (contentHtml.match(/<a[\s>]/gi) || []).length;
    const imgAltMissing = (contentHtml.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;

    return [
      { pass: seoTitle.length >= 50 && seoTitle.length <= 60, label: `Meta title length (${seoTitle.length}/50-60 chars)` },
      { pass: seoDesc.length >= 150 && seoDesc.length <= 160, label: `Meta description length (${seoDesc.length}/150-160 chars)` },
      { pass: hasH1 || title.length > 0, label: 'H1 title present' },
      { pass: title.length >= 20 && title.length <= 70, label: `Title length optimal (${title.length}/20-70 chars)` },
      { pass: h2Count >= 2, label: `H2 subheadings used (${h2Count} found)` },
      { pass: kwList.length >= 3 && kwList.length <= 5, label: `Target keywords (${kwList.length}/3-5 tags)` },
      { pass: !!form.featured_image, label: 'Featured image included' },
      { pass: words >= 800, label: `Content length (${words}/800+ words)` },
      { pass: form.slug && form.slug.length > 5 && !form.slug.includes(' '), label: 'URL slug optimized' },
      { pass: form.slug && !/\b(the|a|an|is|are|and|or|but|in|on|at|to|for)\b/i.test(form.slug), label: 'Slug has no stop words' },
      { pass: primaryKw && titleLower.includes(primaryKw.toLowerCase()), label: 'Primary keyword in title' },
      { pass: primaryKw && seoDesc.toLowerCase().includes(primaryKw.toLowerCase()), label: 'Primary keyword in meta description' },
      { pass: primaryKw && lower.includes(primaryKw.toLowerCase()), label: 'Primary keyword in content' },
      { pass: linkCount >= 1, label: `Links in content (${linkCount} found)` },
      { pass: imgCount >= 1, label: `Images in content (${imgCount} found)` },
      { pass: imgAltMissing === 0 && imgCount > 0, label: imgCount > 0 ? `All images have alt text (${imgAltMissing} missing)` : 'Add images with alt text' },
      { pass: !!excerpt, label: 'Excerpt provided' },
      { pass: kwList.length > 0, label: 'Tags defined' },
      { pass: form.category && form.category !== 'Uncategorized', label: 'Category set' },
      { pass: !!form.author, label: 'Author defined' },
      { pass: activeLang === 'en' ? !!form.title_de : !!form.title, label: 'Translation provided (both languages)' },
      { pass: !!form.read_time, label: 'Read time set' },
    ];
  }, [title, seoTitle, seoDesc, contentHtml, contentText, words, form, kwList, primaryKw, activeLang]);

  const passCount = checks.filter(c => c.pass).length;
  const score = Math.round((passCount / checks.length) * 100);
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="bg-white  border border-gray-200  rounded-2xl overflow-hidden" data-testid="seo-panel">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50  transition-colors"
      >
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-500 " />
          <span className="text-xs font-semibold text-gray-600  uppercase tracking-wider">SEO Score</span>
          <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
          <span className="text-[10px] text-gray-500 ">({passCount}/{checks.length})</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500 " /> : <ChevronDown className="w-4 h-4 text-gray-500 " />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-800 pt-4">
          {/* Google Preview */}
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500  uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Google Search Preview
            </h4>
            <SERPPreview title={seoTitle} slug={form.slug} description={seoDesc} />
          </div>

          {/* Character Counters */}
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500  uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Type className="w-3 h-3" /> Character Counters
            </h4>
            <div className="space-y-1.5 bg-gray-50  rounded-xl p-3">
              <CharCounter label="SEO Title" value={seoTitle} min={50} max={60} />
              <CharCounter label="Meta Description" value={seoDesc} min={150} max={160} />
              <CharCounter label="Title" value={title} min={20} max={70} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 ">Word Count</span>
                <span className={`text-xs font-mono ${words >= 800 ? 'text-emerald-400' : words >= 400 ? 'text-amber-400' : 'text-red-400'}`}>
                  {words} words
                </span>
              </div>
            </div>
          </div>

          {/* Keyword Density */}
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500  uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3" /> Keyword Density
            </h4>
            <div className="bg-gray-50  rounded-xl p-3">
              <KeywordDensity keywords={tags} contentText={contentText} />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h4 className="text-[10px] font-semibold text-gray-500  uppercase tracking-wider mb-2">
              Checklist ({passCount}/{checks.length})
            </h4>
            <div className="bg-gray-50  rounded-xl p-3 max-h-64 overflow-y-auto">
              {checks.map((c) => <Check key={c.label} pass={c.pass} label={c.label} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
