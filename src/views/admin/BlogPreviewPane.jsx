"use client";
import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Calendar, User, Clock, Eye } from 'lucide-react';

/**
 * Side-by-side preview pane for the blog editor.
 *
 * Renders the active-language post (title + excerpt + featured image +
 * sanitized HTML body) using the same typography + spacing rules as the
 * public BlogPost page so writers can see exactly how it will appear
 * before publishing. Sanitizes via DOMPurify (same call site used on the
 * public page) — never trust unsanitized Quill output even inside admin.
 *
 * Lightweight + stateless: re-renders on every keystroke without any
 * fetch / debounce. Quill emits onChange synchronously which makes the
 * preview feel truly live.
 */
export default function BlogPreviewPane({ form, activeLang }) {
  const title = activeLang === 'en' ? form.title : form.title_de;
  const excerpt = activeLang === 'en' ? form.excerpt : form.excerpt_de;
  const content = activeLang === 'en' ? form.content_html : form.content_html_de;
  const safeHtml = useMemo(() => DOMPurify.sanitize(content || ''), [content]);
  const date = new Date().toLocaleDateString(activeLang === 'de' ? 'de-DE' : 'en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)] sticky top-6"
      data-testid="admin-blog-preview"
    >
      {/* Header — mirrors a browser chrome strip so the writer feels
          they are looking at a rendered page, not another editor panel. */}
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="ml-2 text-[11px] text-gray-500 font-mono truncate">
          credsure.io/{activeLang}/blog/{form.slug || 'preview'}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 uppercase tracking-wider">
          <Eye className="w-3 h-3" /> Live Preview
        </span>
      </div>

      {/* Body — same color/typography rules as /blog/{slug} hero + article. */}
      <div className="flex-1 overflow-y-auto" data-testid="admin-blog-preview-body">
        {/* Hero band */}
        <div className="relative h-44 bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] overflow-hidden">
          {form.featured_image && (
            <img
              src={form.featured_image}
              alt={title || 'Preview'}
              className="w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#5B22D6]/90 via-[#5B22D6]/50 to-[#3F2BD9]/30" />
          <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white">
            <div>
              {form.category && form.category !== 'Uncategorized' && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold mb-3 uppercase tracking-wide">
                  {form.category}
                </span>
              )}
              <h1 className="text-xl md:text-2xl font-bold leading-tight mb-3 line-clamp-3">
                {title || (activeLang === 'de' ? 'Vorschau Titel' : 'Untitled draft')}
              </h1>
              <div className="flex items-center justify-center gap-3 text-[11px] text-white/90 flex-wrap">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{form.author || 'CredSure Team'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{form.read_time || '5 min read'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article */}
        <article className="px-6 py-6 max-w-none">
          {excerpt && (
            <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium border-l-4 border-[#5B22D6] pl-4">
              {excerpt}
            </p>
          )}
          {safeHtml ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 [&_h1]:text-xl [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0F0E1A] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#0F0E1A] [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:my-3 [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-[#5B22D6] [&_a]:underline [&_img]:rounded-lg [&_img]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-violet-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          ) : (
            <p className="text-sm text-gray-400 italic">
              {activeLang === 'de'
                ? 'Beginne mit dem Schreiben — die Vorschau wird live aktualisiert.'
                : 'Start writing — the preview updates as you type.'}
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
