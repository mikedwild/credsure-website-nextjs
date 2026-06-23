"use client";
import React, { useMemo, useState } from 'react';
import { CheckCircle, CircleDot, Circle, Search, BarChart3, Type, Globe, ChevronDown, ChevronUp } from 'lucide-react';

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

// ─── Graduated scorers (0..1) ───────────────────────────────────────
// Partial credit so a near-miss (e.g. a 55-char title that's slightly long, or
// a solid 550-word post) isn't treated the same as an empty field.
function gradeLen(len, lo, hi, slo, shi) {
  if (!len) return 0;
  if (len >= lo && len <= hi) return 1;
  if (len >= slo && len <= shi) return 0.5;
  return 0.2;
}
function gradeCount(n, target) {
  if (n <= 0) return 0;
  return Math.min(1, n / target);
}
function gradeWords(w, target) {
  if (w <= 0) return 0;
  if (w >= target) return 1;
  if (w >= target * 0.6) return 0.7;
  if (w >= target * 0.35) return 0.4;
  return 0.15;
}
function gradeDensity(pct) {
  if (pct >= 1 && pct <= 3) return 1;
  if (pct > 0 && pct < 4) return 0.5;
  return 0;
}

// A checklist row now carries a 0..1 score (full / partial / none) instead of a
// bare boolean, so the weighted total reflects how close each item is.
function Check({ score, label }) {
  const full = score >= 1;
  const partial = score > 0 && score < 1;
  return (
    <div className="flex items-start gap-2 py-1">
      {full ? (
        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
      ) : partial ? (
        <CircleDot className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-gray-600  mt-0.5 flex-shrink-0" />
      )}
      <span className={`text-xs ${full ? 'text-gray-600 ' : partial ? 'text-amber-600' : 'text-gray-500 '}`}>{label}</span>
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

  // ─── SEO Checks (weighted, graduated) ──────────────────────────
  // Each row carries a `weight` (relative importance) and a 0..1 `score`. The
  // headline % is the weighted average — so the factors that actually move
  // rankings (meta, headings, keyword placement, internal links, depth) count
  // for more than housekeeping fields (read time, author).
  const checks = useMemo(() => {
    const lower = contentText.toLowerCase();
    const titleLower = title.toLowerCase();
    const pk = primaryKw.toLowerCase();
    const hasH1 = /<h1[\s>]/i.test(contentHtml);
    const h2Count = (contentHtml.match(/<h2[\s>]/gi) || []).length;
    const imgCount = (contentHtml.match(/<img[\s>]/gi) || []).length;
    const linkCount = (contentHtml.match(/<a[\s>]/gi) || []).length;
    const imgAltMissing = (contentHtml.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
    const pkRe = pk
      ? new RegExp(`\\b${pk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      : null;
    const pkCount = pkRe ? (lower.match(pkRe) || []).length : 0;
    const pkDensity = words ? (pkCount / words) * 100 : 0;
    const b = (cond) => (cond ? 1 : 0); // boolean → score

    return [
      // Metadata that shows in the SERP — highest leverage.
      { weight: 8, score: gradeLen(seoTitle.length, 50, 60, 35, 65), label: `Meta title length (${seoTitle.length}/50-60 chars)` },
      { weight: 8, score: gradeLen(seoDesc.length, 150, 160, 120, 170), label: `Meta description length (${seoDesc.length}/150-160 chars)` },
      // Structure & depth.
      { weight: 8, score: gradeWords(words, 700), label: `Content depth (${words} words; 700+ ideal)` },
      { weight: 7, score: gradeCount(h2Count, 2), label: `H2 subheadings (${h2Count}; 2+ ideal)` },
      { weight: 4, score: gradeLen(title.length, 20, 70, 10, 80), label: `Title length (${title.length}/20-70 chars)` },
      { weight: 2, score: b(hasH1 || title.length > 0), label: 'H1 / title present' },
      // Keyword targeting.
      { weight: 7, score: b(primaryKw && titleLower.includes(pk)), label: 'Primary keyword in title' },
      { weight: 5, score: b(primaryKw && lower.includes(pk)), label: 'Primary keyword in body' },
      { weight: 4, score: b(primaryKw && seoDesc.toLowerCase().includes(pk)), label: 'Primary keyword in meta description' },
      { weight: 4, score: primaryKw ? gradeDensity(pkDensity) : 0, label: `Keyword density (${pkDensity.toFixed(1)}%; 1-3% ideal)` },
      { weight: 3, score: kwList.length >= 3 && kwList.length <= 5 ? 1 : kwList.length >= 1 ? 0.5 : 0, label: `Target keywords (${kwList.length}; 3-5 ideal)` },
      // Linking & media.
      { weight: 6, score: gradeCount(linkCount, 2), label: `Internal/outbound links (${linkCount}; 2+ ideal)` },
      { weight: 3, score: b(imgCount >= 1), label: `Images in content (${imgCount})` },
      { weight: 4, score: imgCount > 0 ? (imgCount - imgAltMissing) / imgCount : 1, label: imgCount > 0 ? `Image alt text (${imgCount - imgAltMissing}/${imgCount})` : 'Image alt text (no images)' },
      { weight: 4, score: b(!!form.featured_image), label: 'Featured image set' },
      // Housekeeping.
      { weight: 3, score: b(form.slug && form.slug.length > 5 && !form.slug.includes(' ')), label: 'URL slug optimized' },
      { weight: 1, score: b(form.slug && !/\b(the|a|an|is|are|and|or|but|in|on|at|to|for)\b/i.test(form.slug)), label: 'Slug has no stop words' },
      { weight: 2, score: b(!!excerpt), label: 'Excerpt provided' },
      { weight: 2, score: b(form.category && form.category !== 'Uncategorized'), label: 'Category set' },
      { weight: 1, score: b(!!form.author), label: 'Author set' },
      { weight: 1, score: b(!!form.read_time), label: 'Read time set' },
      // Localization (clearly states the direction; lower weight).
      { weight: 4, score: b(activeLang === 'en' ? !!form.title_de : !!form.title), label: activeLang === 'en' ? 'German translation added' : 'English version present' },
    ];
  }, [title, seoTitle, seoDesc, contentHtml, contentText, words, form, kwList, primaryKw, activeLang, excerpt]);

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + c.weight * c.score, 0);
  const score = Math.round((earned / totalWeight) * 100);
  const doneCount = checks.filter(c => c.score >= 1).length;
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
          <span className="text-xs font-semibold text-gray-600  uppercase tracking-wider">SEO Score · {activeLang === 'de' ? 'DE' : 'EN'}</span>
          <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
          <span className="text-[10px] text-gray-500 ">({doneCount}/{checks.length} done)</span>
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
              Checklist ({doneCount}/{checks.length})
            </h4>
            <div className="bg-gray-50  rounded-xl p-3 max-h-64 overflow-y-auto">
              {checks.map((c) => <Check key={c.label} score={c.score} label={c.label} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
