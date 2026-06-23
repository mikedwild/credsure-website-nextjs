"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Save, ArrowLeft, Eye, EyeOff, Clock, Upload, Globe, Languages, Loader2, History, RotateCcw, X, AlertCircle, CheckCircle2, ImageIcon, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOPanel from './SEOPanel';
import MediaLibrary from './MediaLibrary';
import BlogPreviewPane from './BlogPreviewPane';
import InternalLinkSuggestions from './InternalLinkSuggestions';
import SocialCardPreviews from './SocialCardPreviews';
// Quill CSS lazy-loaded here (admin-only) — was previously eagerly imported in App.js,
// adding ~30KB to every public page's critical CSS.
import 'react-quill-new/dist/quill.snow.css';
import '@/styles/admin-quill.css';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// ─── Content metrics helpers ─────────────────────────────────────────
// Extracted so the editor can show live word count + reading time as
// the writer types. Reading time uses 200 wpm (industry standard for
// adult English prose; close enough for German). Strips HTML tags and
// collapses whitespace before counting.
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};
const countWords = (html) => {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
};
const readingTime = (html) => {
  const w = countWords(html);
  return `${Math.max(1, Math.round(w / 200))} min read`;
};

// localStorage key for the per-slug auto-save snapshot. Cleared after a
// successful manual save so we don't restore stale drafts.
const draftKey = (slug) => `credsure-draft-${slug || 'new'}`;

// scheduled_at is stored as a UTC ISO string, but <input type="datetime-local">
// shows/reads LOCAL wall-clock. Convert UTC→local for display so a writer in
// (say) Berlin sees the hour they actually scheduled, not the raw UTC digits.
// onChange does the inverse (new Date(localValue).toISOString()).
const isoToLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
const LOCAL_TZ = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; }
  catch { return ''; }
})();

// Base toolbar layout — handlers are wired per-render so we can capture
// the current `setLibraryTarget` closure. See the useMemo below.
const QUILL_TOOLBAR_LAYOUT = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  [{ align: [] }],
  ['clean'],
];

const LazyQuill = React.lazy(() =>
  new Promise(resolve => setTimeout(resolve, 100)).then(() => import('react-quill-new'))
);

// Quill editor wrapper. We intentionally let the parent build the
// `modules` object so it can swap in a custom toolbar.image handler
// (the in-body Media Library picker). `forwardRef` exposes the
// underlying ReactQuill instance so we can call .getEditor() and
// insert an embed at the current cursor position.
const QuillEditor = React.forwardRef(({ value, onChange, placeholder, modules }, ref) => (
  <React.Suspense fallback={<div className="h-[350px] bg-slate-900 rounded-xl animate-pulse" />}>
    <LazyQuill
      ref={ref}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
    />
  </React.Suspense>
));
QuillEditor.displayName = 'QuillEditor';

export default function AdminBlogEditor({ token, slug, userRole, onBack }) {
  const [form, setForm] = useState({
    title: '', title_de: '', slug: '', excerpt: '', excerpt_de: '',
    content_html: '', content_html_de: '', category: 'Uncategorized',
    tags: '', tags_de: '', author: 'CredSure Team', read_time: '5 min read',
    status: 'draft', scheduled_at: '', featured_image: '',
    seo_title: '', seo_description: '',
    seo_title_de: '', seo_description_de: '',
  });
  const [activeLang, setActiveLang] = useState('en');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  // Side-by-side live preview toggle. Persisted to localStorage so the
  // writer's preference survives page reloads. Defaults to off — Quill
  // is wide enough on its own; preview is an explicit opt-in.
  const [showPreview, setShowPreview] = useState(() => {
    try { return localStorage.getItem('credsure-admin-show-preview') === '1'; } catch { return false; }
  });
  const fileRef = useRef();
  // AI featured-image generation state
  const [genImageOpen, setGenImageOpen] = useState(false);
  const [genImagePrompt, setGenImagePrompt] = useState('');
  const [genImageModel, setGenImageModel] = useState('gpt-image-1');
  const [genImageBusy, setGenImageBusy] = useState(false);
  const [genImageError, setGenImageError] = useState('');

  // Auto-save bookkeeping. `lastSavedRef` snapshots the form payload that
  // was last successfully sent to the backend so warn-on-leave knows
  // whether there are unsaved changes. `autoSaveStatus` powers the
  // "Last saved 2 min ago" indicator next to the save buttons.
  const lastSavedRef = useRef(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState({ at: null, dirty: false });
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null });
  const [showLibrary, setShowLibrary] = useState(false);
  // 'featured' = drop URL into form.featured_image
  // 'body'     = insert <img src="..."> at the current Quill cursor position
  const [libraryTarget, setLibraryTarget] = useState('featured');
  const quillRef = useRef(null);
  // Quill's Delta model can't represent tables, so its value→Delta round-trip
  // flattens <thead>/<th> into a single concatenated <td> — and because
  // setContents re-fires onChange, merely OPENING a table post overwrites the
  // body with the mangled HTML (no edit needed). So edit bodies that contain a
  // <table> as raw HTML in a plain textarea, bypassing Quill. The server
  // sanitizer preserves the table markup on save (verified). Auto-enabled on
  // load when a table is present.
  const [htmlMode, setHtmlMode] = useState(false);

  useEffect(() => {
    if (!slug) {
      // New post — restore any auto-saved draft for "new" slot if present.
      try {
        const raw = localStorage.getItem(draftKey(null));
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft && (draft.title || draft.content_html)) {
            if (window.confirm('You have an unsaved draft from a previous session. Restore it?')) {
              setForm(p => ({ ...p, ...draft }));
              setMessage('Restored unsaved draft');
            } else {
              localStorage.removeItem(draftKey(null));
            }
          }
        }
      } catch (e) { /* corrupt — ignore */ }
      return;
    }
    fetch(`${API_URL}/api/admin/blogs/${slug}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const p = data.post;
        const next = {
          title: p.title || '', title_de: p.title_de || '',
          slug: p.slug || '', excerpt: p.excerpt || '', excerpt_de: p.excerpt_de || '',
          content_html: p.content_html || '', content_html_de: p.content_html_de || '',
          category: p.category || 'Uncategorized',
          tags: (p.tags || []).join(', '), tags_de: (p.tags_de || []).join(', '),
          author: p.author || 'CredSure Team', read_time: p.read_time || '5 min read',
          status: p.status || 'draft', scheduled_at: p.scheduled_at || '',
          featured_image: p.featured_image || '',
          seo_title: p.seo_title || '', seo_description: p.seo_description || '',
          seo_title_de: p.seo_title_de || '', seo_description_de: p.seo_description_de || '',
        };
        setForm(next);
        lastSavedRef.current = JSON.stringify(next);
        // A table in either language can't survive Quill — open it in raw-HTML
        // mode so the editor never flattens it.
        if (/<table[\s>]/i.test(next.content_html) || /<table[\s>]/i.test(next.content_html_de)) {
          setHtmlMode(true);
        }
      });
  }, [slug, token]);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // ─── In-body image picker (Quill toolbar override) ───────────────
  // The default Quill image button opens an OS file picker; we hijack
  // it to open MediaLibrary instead so writers can re-use existing
  // assets. The actual <img> insert is done in `handleLibrarySelect`
  // below — we stash the cursor index here so the modal close→insert
  // round-trip lands in the right spot.
  const savedRangeRef = useRef(null);
  const openLibraryForBody = useCallback(() => {
    try {
      const editor = quillRef.current?.getEditor?.();
      savedRangeRef.current = editor?.getSelection?.() || null;
    } catch { /* quill not ready yet — insert will fall back to end */ }
    setLibraryTarget('body');
    setShowLibrary(true);
  }, []);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: QUILL_TOOLBAR_LAYOUT,
      handlers: { image: openLibraryForBody },
    },
  }), [openLibraryForBody]);

  const handleLibrarySelect = useCallback((url) => {
    if (libraryTarget === 'body') {
      const editor = quillRef.current?.getEditor?.();
      if (editor) {
        const range = savedRangeRef.current
          || editor.getSelection(true)
          || { index: editor.getLength(), length: 0 };
        editor.insertEmbed(range.index, 'image', url, 'user');
        editor.setSelection(range.index + 1, 0, 'user');
        savedRangeRef.current = null;
      }
    } else {
      setField('featured_image', url);
    }
  }, [libraryTarget]);

  // ─── Internal link insertion ─────────────────────────────────────
  // Called by InternalLinkSuggestions when the writer clicks "Insert
  // link" on a suggested post. Inserts the post title at the current
  // Quill cursor with `href` as a styled link. If text is currently
  // selected, applies the link to the selection instead. Mirrors the
  // pattern Quill's native link button uses (formatText), so the link
  // is fully integrated into the doc model (revisions/copy-paste work).
  const handleInsertInternalLink = useCallback((href, title) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) {
      setMessage('Editor not ready — try again in a moment');
      return;
    }
    editor.focus();
    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
    if (range.length > 0) {
      // Apply the link to the existing selection.
      editor.formatText(range.index, range.length, 'link', href, 'user');
      editor.setSelection(range.index + range.length, 0, 'user');
    } else {
      // Insert the post title as link text at the cursor.
      editor.insertText(range.index, title, { link: href }, 'user');
      // Clear formatting on the newly-inserted gap so the next character
      // typed isn't sucked into the link span.
      editor.setSelection(range.index + title.length, 0, 'user');
      editor.format('link', false, 'user');
    }
    setMessage(`Link inserted: ${title.slice(0, 40)}${title.length > 40 ? '…' : ''}`);
  }, []);

  // ─── Live word count + reading time (active language) ────────────
  const wordCount = useMemo(
    () => countWords(activeLang === 'en' ? form.content_html : form.content_html_de),
    [form.content_html, form.content_html_de, activeLang]
  );
  const autoReadTime = useMemo(
    () => readingTime(activeLang === 'en' ? form.content_html : form.content_html_de),
    [form.content_html, form.content_html_de, activeLang]
  );

  // ─── Dirty tracking ──────────────────────────────────────────────
  // Compare full form JSON against the last-saved snapshot so warn-on-leave
  // and the auto-save indicator stay accurate as the user edits.
  useEffect(() => {
    const dirty = lastSavedRef.current !== JSON.stringify(form);
    setAutoSaveStatus(prev => prev.dirty === dirty ? prev : { ...prev, dirty });
  }, [form]);

  // ─── Warn before leaving if there are unsaved changes ────────────
  useEffect(() => {
    const handler = (e) => {
      if (autoSaveStatus.dirty) {
        e.preventDefault();
        e.returnValue = '';  // required by Chrome
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [autoSaveStatus.dirty]);

  // ─── Auto-save to localStorage every 30s while dirty ─────────────
  // Dies cheap if user has multiple tabs open editing the same slug —
  // last write wins, which is the same semantics as manual save.
  useEffect(() => {
    if (!autoSaveStatus.dirty) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(slug), JSON.stringify(form));
        setAutoSaveStatus({ at: new Date().toISOString(), dirty: true });
      } catch (e) { /* quota/private mode */ }
    }, 30000);
    return () => clearTimeout(id);
  }, [form, autoSaveStatus.dirty, slug]);

  // ─── Slug uniqueness check on blur ───────────────────────────────
  const checkSlugAvailable = useCallback(async () => {
    // Only meaningful for new posts (existing posts keep their own slug
    // unless explicitly renamed; we still report against backend).
    if (!form.slug) { setSlugStatus({ checking: false, available: null }); return; }
    if (slug && form.slug === slug) { setSlugStatus({ checking: false, available: true }); return; }
    setSlugStatus({ checking: true, available: null });
    try {
      const res = await fetch(`${API_URL}/api/admin/blogs/slug-available?slug=${encodeURIComponent(form.slug)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setSlugStatus({ checking: false, available: !!data.available });
    } catch { setSlugStatus({ checking: false, available: null }); }
  }, [form.slug, slug, token]);

  // ─── Revisions panel ─────────────────────────────────────────────
  const fetchRevisions = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/blogs/${slug}/revisions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRevisions(data.revisions || []);
    } catch { /* swallow — panel will just stay empty */ }
  }, [slug, token]);

  const handleRestoreRevision = useCallback(async (revisionAt) => {
    if (!slug) return;
    if (!window.confirm('Restore this revision? Your current draft will be snapshotted before it gets overwritten — you can undo by restoring the most recent revision.')) return;
    try {
      const res = await fetch(
        `${API_URL}/api/admin/blogs/${slug}/revisions/restore?revision_at=${encodeURIComponent(revisionAt)}`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } },
      );
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Revision restored');
        // Re-pull the post so the editor shows the restored content.
        const r = await fetch(`${API_URL}/api/admin/blogs/${slug}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const p = (await r.json()).post;
        const next = {
          title: p.title || '', title_de: p.title_de || '',
          slug: p.slug || '', excerpt: p.excerpt || '', excerpt_de: p.excerpt_de || '',
          content_html: p.content_html || '', content_html_de: p.content_html_de || '',
          category: p.category || 'Uncategorized',
          tags: (p.tags || []).join(', '), tags_de: (p.tags_de || []).join(', '),
          author: p.author || 'CredSure Team', read_time: p.read_time || '5 min read',
          status: p.status || 'draft', scheduled_at: p.scheduled_at || '',
          featured_image: p.featured_image || '',
          seo_title: p.seo_title || '', seo_description: p.seo_description || '',
          seo_title_de: p.seo_title_de || '', seo_description_de: p.seo_description_de || '',
        };
        setForm(next);
        lastSavedRef.current = JSON.stringify(next);
        setAutoSaveStatus({ at: new Date().toISOString(), dirty: false });
        setShowRevisions(false);
        fetchRevisions();
      } else {
        setMessage(`Error: ${data.detail || 'Restore failed'}`);
      }
    } catch { setMessage('Connection error during restore'); }
  }, [slug, token, fetchRevisions]);

  const handleSave = async (targetStatus) => {
    setSaving(true);
    setMessage('');
    const payload = {
      ...form,
      // Persist the auto-calculated reading time when the writer hasn't
      // overridden it (still respects manual values).
      read_time: form.read_time || autoReadTime,
      status: targetStatus || form.status,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      tags_de: form.tags_de.split(',').map(t => t.trim()).filter(Boolean),
    };

    const isNew = !slug;
    const url = isNew ? `${API_URL}/api/admin/blogs` : `${API_URL}/api/admin/blogs/${slug}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Saved!');
        // On a brand-new post the server assigns the slug. Fold it into BOTH
        // the form and the dirty-tracking snapshot — snapshotting `form` while
        // its slug is still empty would leave the editor looking dirty the
        // instant the assigned slug renders.
        const savedForm = isNew && data.post?.slug
          ? { ...form, slug: data.post.slug }
          : form;
        if (isNew && data.post?.slug) setField('slug', data.post.slug);
        lastSavedRef.current = JSON.stringify(savedForm);
        setAutoSaveStatus({ at: new Date().toISOString(), dirty: false });
        // Drop any local draft now that the server has the canonical copy.
        try { localStorage.removeItem(draftKey(slug || null)); } catch (e) { /* noop */ }
      } else {
        setMessage(`Error: ${data.detail || 'Save failed'}`);
      }
    } catch {
      setMessage('Connection error');
    }
    setSaving(false);
  };

  const handleSchedule = async () => {
    if (!form.scheduled_at) { setMessage('Set a schedule date first'); return; }
    await handleSave('scheduled');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (res.ok) setField('featured_image', `${API_URL}/api/files/${data.path}`);
    } catch { setMessage('Upload failed'); }
    setUploading(false);
  };

  // AI-generated featured image. Default prompt = current title (EN or DE
  // depending on the active tab). User can refine before generating.
  const openGenerateImage = () => {
    const seed = activeLang === 'en'
      ? (form.title || form.title_de)
      : (form.title_de || form.title);
    setGenImagePrompt(seed
      ? `Editorial illustration for a credentialing blog post titled "${seed}". Clean, modern, professional B2B aesthetic. No text, no faces, no logos.`
      : ''
    );
    setGenImageError('');
    setGenImageOpen(true);
  };

  const handleGenerateImage = async () => {
    const prompt = genImagePrompt.trim();
    if (prompt.length < 4) {
      setGenImageError('Prompt must be at least 4 characters.');
      return;
    }
    setGenImageBusy(true);
    setGenImageError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/images/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model: genImageModel, number_of_images: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenImageError(data.detail || `HTTP ${res.status}`);
        return;
      }
      setField('featured_image', `${API_URL}/api/files/${data.path}`);
      setGenImageOpen(false);
      setMessage('AI-generated featured image applied');
    } catch (err) {
      setGenImageError(`Network error: ${err.message}`);
    } finally {
      setGenImageBusy(false);
    }
  };

  const autoSlug = () => {
    if (form.title && !slug) {
      setField('slug', form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // ─── Auto Translate ──────────────────────────────────────────────
  // Bidirectional: source = whichever language tab the writer is on.
  // Click the button while the source tab is active and the OTHER side
  // (title/excerpt/content/tags/SEO fields) gets filled in. Uses Claude
  // Sonnet 4.5 on the backend for marketing tone + strict HTML structure
  // preservation. Auto-save also runs the same translation server-side
  // whenever exactly one language is filled.
  //
  // When the target side already has content, we treat the click as a
  // "Re-translate" — the writer must confirm before we overwrite their
  // existing translation. This is the workflow for "I edited EN, now
  // refresh the DE side from the latest English".
  const handleTranslate = useCallback(async () => {
    const srcLang = activeLang;
    const tgtLang = srcLang === 'en' ? 'de' : 'en';
    const srcTitle = srcLang === 'en' ? form.title : form.title_de;
    const srcExcerpt = srcLang === 'en' ? form.excerpt : form.excerpt_de;
    const srcContent = srcLang === 'en' ? form.content_html : form.content_html_de;
    const srcTags = srcLang === 'en' ? form.tags : form.tags_de;
    const srcSeoTitle = srcLang === 'en' ? form.seo_title : form.seo_title_de;
    const srcSeoDesc = srcLang === 'en' ? form.seo_description : form.seo_description_de;

    if (!srcTitle && !srcContent) {
      setMessage('Write content first, then translate');
      return;
    }

    // Detect whether the target side is already populated — if so this
    // is a re-translate that will clobber existing content. Require an
    // explicit confirm so the writer can't lose work by accident.
    const tgtTitle = tgtLang === 'de' ? form.title_de : form.title;
    const tgtContent = tgtLang === 'de' ? form.content_html_de : form.content_html;
    const willClobber = (tgtTitle && tgtTitle.trim()) || (tgtContent && tgtContent.trim());
    if (willClobber) {
      const langName = tgtLang === 'de' ? 'German' : 'English';
      const ok = window.confirm(
        `The ${langName} side already has content. Re-translate from ${srcLang === 'en' ? 'English' : 'German'} and overwrite it?`,
      );
      if (!ok) return;
    }

    setTranslating(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/admin/translate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: srcTitle,
          excerpt: srcExcerpt,
          content_html: srcContent,
          tags: srcTags,
          seo_title: srcSeoTitle,
          seo_description: srcSeoDesc,
          source_lang: srcLang,
          target_lang: tgtLang,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const isDe = tgtLang === 'de';
        const titleKey = isDe ? 'title_de' : 'title';
        const excerptKey = isDe ? 'excerpt_de' : 'excerpt';
        const contentKey = isDe ? 'content_html_de' : 'content_html';
        const tagsKey = isDe ? 'tags_de' : 'tags';
        const seoTitleKey = isDe ? 'seo_title_de' : 'seo_title';
        const seoDescKey = isDe ? 'seo_description_de' : 'seo_description';
        setForm(prev => ({
          ...prev,
          ...(data.title && { [titleKey]: data.title }),
          ...(data.excerpt && { [excerptKey]: data.excerpt }),
          ...(data.content_html && { [contentKey]: data.content_html }),
          ...(data.tags && { [tagsKey]: data.tags }),
          ...(data.seo_title && { [seoTitleKey]: data.seo_title }),
          ...(data.seo_description && { [seoDescKey]: data.seo_description }),
        }));
        // Auto-switch to the target tab so the writer immediately sees results.
        setActiveLang(tgtLang);
        setMessage(willClobber
          ? `Re-translated to ${isDe ? 'German' : 'English'}`
          : `Translated to ${isDe ? 'German' : 'English'}!`);
      } else {
        setMessage(`Error: ${data.detail || 'Translation failed'}`);
      }
    } catch {
      setMessage('Translation connection error');
    }
    setTranslating(false);
  }, [activeLang, form, token]);

  // Persist the live-preview toggle preference per-writer.
  const togglePreview = useCallback(() => {
    setShowPreview(prev => {
      const next = !prev;
      try { localStorage.setItem('credsure-admin-show-preview', next ? '1' : '0'); } catch { /* quota */ }
      return next;
    });
  }, []);

  // Does the target language already have content? Drives the
  // Translate / Re-translate button label so the writer knows whether
  // clicking will create fresh or overwrite.
  const targetHasContent = useMemo(() => {
    const tgtLang = activeLang === 'en' ? 'de' : 'en';
    const tgtTitle = tgtLang === 'de' ? form.title_de : form.title;
    const tgtContent = tgtLang === 'de' ? form.content_html_de : form.content_html;
    return Boolean((tgtTitle && tgtTitle.trim()) || (tgtContent && tgtContent.trim()));
  }, [activeLang, form.title, form.title_de, form.content_html, form.content_html_de]);

  return (
    <div className="space-y-6" data-testid="admin-blog-editor">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm" data-testid="admin-editor-back">
          <ArrowLeft className="w-4 h-4" /> Back to posts
        </button>
        <div className="flex items-center gap-3">
          {/* Auto-save / dirty indicator. Order: explicit message wins, then dirty,
              then last-saved time. Helps the writer trust they won't lose work. */}
          {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`} data-testid="admin-editor-message">{message}</span>}
          {!message && autoSaveStatus.dirty && (
            <span className="text-xs text-amber-600 flex items-center gap-1" data-testid="admin-editor-dirty">
              <Clock className="w-3 h-3" /> Unsaved changes
            </span>
          )}
          {!message && !autoSaveStatus.dirty && autoSaveStatus.at && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Saved
            </span>
          )}
          {slug && (
            <Button onClick={() => { setShowRevisions(s => !s); fetchRevisions(); }} variant="outline" data-testid="admin-revisions-btn">
              <History className="w-4 h-4 mr-2" /> Revisions
            </Button>
          )}
          <Button onClick={() => handleSave('draft')} disabled={saving} variant="outline" data-testid="admin-save-draft">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={handleSchedule} disabled={saving} variant="outline" className="border-amber-300 text-amber-600 hover:text-amber-700" data-testid="admin-schedule-btn">
            <Clock className="w-4 h-4 mr-2" /> Schedule
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="admin-publish-btn">
            <Eye className="w-4 h-4 mr-2" /> Publish
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-3' : 'lg:grid-cols-3'}`}>
        {/* Main editor — col-span-2 when preview off, col-span-1 when preview on
            (preview takes the second col so sidebar is always 1 col wide) */}
        <div className={`${showPreview ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-6`}>
          {/* Language toggle + Translate + Preview controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {['en', 'de'].map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLang === lang ? 'bg-violet-600 text-white' : 'bg-slate-800 text-gray-500  hover:text-white'
                }`}
                data-testid={`admin-lang-${lang}`}
              >
                <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'English' : 'Deutsch'}
              </button>
            ))}
            <Button
              onClick={togglePreview}
              variant="outline"
              className={`ml-auto ${showPreview ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-300 text-gray-600'}`}
              data-testid="admin-preview-toggle"
              title={showPreview ? 'Hide live preview pane' : 'Show live preview pane'}
            >
              {showPreview ? (
                <><EyeOff className="w-4 h-4 mr-2" /> Hide Preview</>
              ) : (
                <><Eye className="w-4 h-4 mr-2" /> Live Preview</>
              )}
            </Button>
            <Button
              onClick={handleTranslate}
              disabled={translating}
              variant="outline"
              className={`${targetHasContent ? 'border-amber-300 text-amber-700 hover:border-amber-400 bg-amber-50/40' : 'border-sky-700/60 text-sky-600 hover:text-sky-700 hover:border-sky-600'}`}
              data-testid="admin-translate-btn"
              title={targetHasContent
                ? `Re-translate from ${activeLang === 'en' ? 'English' : 'German'} — overwrites the existing ${activeLang === 'en' ? 'German' : 'English'} side`
                : `Translate the current ${activeLang === 'en' ? 'English' : 'German'} content into ${activeLang === 'en' ? 'German' : 'English'}`}
            >
              {translating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Translating...</>
              ) : targetHasContent ? (
                <><RefreshCw className="w-4 h-4 mr-2" /> Re-translate {activeLang === 'en' ? 'EN → DE' : 'DE → EN'}</>
              ) : (
                <><Languages className="w-4 h-4 mr-2" /> Translate {activeLang === 'en' ? 'EN → DE' : 'DE → EN'}</>
              )}
            </Button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500  uppercase tracking-wider mb-2">
              Title ({activeLang === 'en' ? 'English' : 'German'})
            </label>
            <input
              value={activeLang === 'en' ? form.title : form.title_de}
              onChange={e => setField(activeLang === 'en' ? 'title' : 'title_de', e.target.value)}
              onBlur={autoSlug}
              placeholder="Post title..."
              className="w-full px-4 py-3 bg-white  border border-gray-200   rounded-xl text-gray-900  text-lg placeholder-gray-400  focus:ring-2 focus:ring-violet-500 outline-none"
              data-testid="admin-editor-title"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-gray-500  uppercase tracking-wider mb-2">
              Excerpt ({activeLang === 'en' ? 'English' : 'German'})
            </label>
            <textarea
              value={activeLang === 'en' ? form.excerpt : form.excerpt_de}
              onChange={e => setField(activeLang === 'en' ? 'excerpt' : 'excerpt_de', e.target.value)}
              rows={3}
              placeholder="Brief summary..."
              className="w-full px-4 py-3 bg-white  border border-gray-200   rounded-xl text-gray-900  text-sm placeholder-gray-400  focus:ring-2 focus:ring-violet-500 outline-none resize-none"
              data-testid="admin-editor-excerpt"
            />
          </div>

          {/* Content (WYSIWYG / raw HTML) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-500  uppercase tracking-wider">
                Content ({activeLang === 'en' ? 'English' : 'German'})
              </label>
              <button
                type="button"
                onClick={() => {
                  // Check BOTH languages, not just the active one: a table in
                  // the other language would still be flattened by Quill once
                  // that tab is opened in rich-text mode.
                  const hasTable =
                    /<table[\s>]/i.test(form.content_html) ||
                    /<table[\s>]/i.test(form.content_html_de);
                  if (
                    htmlMode &&
                    hasTable &&
                    !window.confirm(
                      "This content has a table. The rich-text editor can't represent tables and will flatten it on save. Switch to rich text anyway?"
                    )
                  ) {
                    return;
                  }
                  setHtmlMode(m => !m);
                }}
                className="text-[11px] font-semibold text-[#5B22D6] hover:underline"
                data-testid="admin-editor-html-toggle"
              >
                {htmlMode ? '← Rich text' : 'Edit as HTML </>'}
              </button>
            </div>
            {htmlMode ? (
              // Raw-HTML editing surface. Bound straight to the body field and
              // saved verbatim (never through Quill), so tables and other markup
              // Quill can't model survive. Server-side sanitizer cleans on save.
              <textarea
                value={activeLang === 'en' ? form.content_html : form.content_html_de}
                onChange={e => setField(activeLang === 'en' ? 'content_html' : 'content_html_de', e.target.value)}
                placeholder="Write HTML — tables, etc. Saved as-is and sanitized server-side."
                spellCheck={false}
                data-testid="admin-editor-html-source"
                className="w-full h-[350px] font-mono text-xs leading-relaxed bg-white  border border-gray-200  rounded-xl p-4 text-gray-800  focus:border-[#5B22D6] focus:outline-none resize-y"
              />
            ) : (
            <div className="admin-quill-wrapper bg-white  border border-gray-200   rounded-xl overflow-hidden">
              {/* key={activeLang} forces a fresh editor instance per language.
                  Without it, the SAME react-quill instance has its `value` AND
                  `onChange` swapped in one render on a language switch. The new
                  `value` makes react-quill call setContents(); Quill normalizes
                  the HTML so its emitted value differs from the raw input, which
                  re-fires onChange — but during shouldComponentUpdate the
                  instance still holds the PREVIOUS render's props, so the old
                  language's onChange runs and writes the incoming content into
                  the wrong field (e.g. German body overwriting content_html).
                  Remounting gives the new instance the correct props from mount,
                  so the normalization onChange targets the right field. */}
              <QuillEditor
                key={activeLang}
                ref={quillRef}
                modules={quillModules}
                value={activeLang === 'en' ? form.content_html : form.content_html_de}
                onChange={val => setField(activeLang === 'en' ? 'content_html' : 'content_html_de', val)}
                placeholder="Write your post content..."
              />
            </div>
            )}
            {/* Live word count + reading-time pill. Mirrors the CMS-style
                feedback writers expect from Notion / Medium / Ghost. */}
            <div className="mt-2 flex items-center justify-end gap-3 text-[11px] text-gray-500" data-testid="admin-editor-metrics">
              <span>{wordCount.toLocaleString()} words</span>
              <span aria-hidden="true">·</span>
              <span>{autoReadTime}</span>
            </div>
          </div>
        </div>

        {/* Live Preview pane — slots between the editor column and the
            sidebar when enabled. Renders the active-language title +
            featured image + sanitized HTML using the same typography
            as the public BlogPost page. */}
        {showPreview && (
          <div className="lg:col-span-1">
            <BlogPreviewPane form={form} activeLang={activeLang} />
          </div>
        )}

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* SEO Panel */}
          <SEOPanel form={form} activeLang={activeLang} />

          {/* Social card share preview (Twitter / LinkedIn / Facebook) */}
          <SocialCardPreviews form={form} activeLang={activeLang} />

          {/* Internal link suggestions — published posts related to the
              current draft (tag overlap + category match). One click
              inserts an <a href="..."> at the Quill cursor. */}
          <InternalLinkSuggestions
            token={token}
            activeLang={activeLang}
            tags={activeLang === 'en' ? form.tags : form.tags_de}
            category={form.category}
            excludeSlug={form.slug}
            onInsertLink={handleInsertInternalLink}
          />

          {/* Post Settings */}
          <div className="bg-white  border border-gray-200  rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-gray-500  uppercase tracking-wider">Post Settings</h4>
            <div>
              <label className="block text-xs text-gray-500  mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={e => { setField('slug', e.target.value); setSlugStatus({ checking: false, available: null }); }}
                onBlur={checkSlugAvailable}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none focus:ring-1 focus:ring-violet-500"
                data-testid="admin-editor-slug"
              />
              {/* Live slug-availability indicator. Quiet by default; only
                  shows feedback after the writer blurs the field. */}
              {slugStatus.checking && (
                <p className="mt-1 text-[11px] text-gray-500 flex items-center gap-1" data-testid="admin-slug-checking">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking availability…
                </p>
              )}
              {!slugStatus.checking && slugStatus.available === true && form.slug && (
                <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1" data-testid="admin-slug-available">
                  <CheckCircle2 className="w-3 h-3" /> Slug is available
                </p>
              )}
              {!slugStatus.checking && slugStatus.available === false && (
                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1" data-testid="admin-slug-taken">
                  <AlertCircle className="w-3 h-3" /> Slug already in use — pick another
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500  mb-1">Category</label>
              <input
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none"
                data-testid="admin-editor-category"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500  mb-1">Author</label>
              <input
                value={form.author}
                onChange={e => setField('author', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500  mb-1">Read Time</label>
              <input
                value={form.read_time}
                onChange={e => setField('read_time', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500  mb-1">Tags (comma separated)</label>
              <input
                value={activeLang === 'en' ? form.tags : form.tags_de}
                onChange={e => setField(activeLang === 'en' ? 'tags' : 'tags_de', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none"
                data-testid="admin-editor-tags"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white  border border-gray-200  rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-gray-500  uppercase tracking-wider">Schedule</h4>
            <div>
              <label className="block text-xs text-gray-500  mb-1">Publish Date & Time</label>
              <input
                type="datetime-local"
                value={isoToLocalInput(form.scheduled_at)}
                onChange={e => setField('scheduled_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none"
                data-testid="admin-editor-schedule-date"
              />
              {LOCAL_TZ && (
                <p className="text-[11px] text-gray-400 mt-1">Times shown in your timezone ({LOCAL_TZ})</p>
              )}
            </div>
            <p className="text-xs text-gray-500 ">
              Status: <span className={`font-semibold ${form.status === 'published' ? 'text-emerald-400' : form.status === 'scheduled' ? 'text-amber-400' : 'text-gray-500 '}`}>{form.status}</span>
            </p>
          </div>

          {/* Featured Image */}
          <div className="bg-white  border border-gray-200  rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-gray-500  uppercase tracking-wider">Featured Image</h4>
            {form.featured_image && (
              <img src={form.featured_image} alt="Featured" className="w-full h-32 object-cover rounded-lg" />
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={openGenerateImage} variant="outline" className="border-[#5B22D6]/30 text-[#5B22D6] hover:bg-[#5B22D6]/5" data-testid="admin-editor-ai-generate-image">
                <Sparkles className="w-4 h-4 mr-2" /> AI
              </Button>
              <Button onClick={() => fileRef.current?.click()} disabled={uploading} variant="outline" className="border-gray-300  text-gray-600 " data-testid="admin-editor-upload-image">
                <Upload className="w-4 h-4 mr-2" /> {uploading ? '…' : 'Upload'}
              </Button>
              {/* Reuse-from-library shortcut. Saves writers from re-uploading
                  the same hero shot — opens MediaLibrary modal which lists
                  every previously-uploaded image (image/* filter applied). */}
              <Button onClick={() => { setLibraryTarget('featured'); setShowLibrary(true); }} variant="outline" className="border-gray-300 text-gray-600" data-testid="admin-editor-open-library">
                <ImageIcon className="w-4 h-4 mr-2" /> Library
              </Button>
            </div>
            {form.featured_image && (
              <input
                value={form.featured_image}
                onChange={e => setField('featured_image', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-xs text-gray-500  outline-none"
                placeholder="Or paste image URL"
                data-testid="admin-editor-featured-image"
              />
            )}
          </div>

          {/* SEO Fields — per-language. Mirrors the language tab so the
              writer maintains separate EN / DE SEO meta and the auto-
              translate flow can fill the missing side automatically. */}
          <div className="bg-white  border border-gray-200  rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-gray-500  uppercase tracking-wider">
              SEO Meta ({activeLang === 'en' ? 'English' : 'German'})
            </h4>
            <div>
              <label className="block text-xs text-gray-500  mb-1">SEO Title</label>
              <input
                value={activeLang === 'en' ? form.seo_title : form.seo_title_de}
                onChange={e => setField(activeLang === 'en' ? 'seo_title' : 'seo_title_de', e.target.value)}
                placeholder={(activeLang === 'en' ? form.title : form.title_de) || 'Page title for search engines'}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none"
                data-testid="admin-editor-seo-title"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500  mb-1">Meta Description</label>
              <textarea
                value={activeLang === 'en' ? form.seo_description : form.seo_description_de}
                onChange={e => setField(activeLang === 'en' ? 'seo_description' : 'seo_description_de', e.target.value)}
                placeholder={(activeLang === 'en' ? form.excerpt : form.excerpt_de) || 'Description for search results'}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50  border border-gray-300  rounded-lg text-sm text-gray-900  outline-none resize-none"
                data-testid="admin-editor-seo-desc"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Revisions slide-over ───────────────────────────────────
          Lazy-mounted: only present in the DOM when the writer asks
          for it. Each revision shows its timestamp + title at the
          point it was saved, with a one-click restore. */}
      {showRevisions && (
        <div className="fixed inset-0 z-40 flex" data-testid="admin-revisions-panel">
          <button
            aria-label="Close revisions"
            onClick={() => setShowRevisions(false)}
            className="flex-1 bg-black/30"
          />
          <aside className="w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col">
            <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-violet-600" /> Revision history
              </h3>
              <button
                onClick={() => setShowRevisions(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close revisions"
                data-testid="admin-revisions-close"
              >
                <X className="w-4 h-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {revisions.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-12">
                  No prior revisions. Each save creates a snapshot here.
                </p>
              )}
              {revisions.map((rev) => (
                <div key={rev.revision_at} className="border border-gray-100 rounded-xl p-3 hover:border-violet-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{rev.title || '(untitled)'}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {new Date(rev.revision_at).toLocaleString()}
                        {rev.status && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{rev.status}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreRevision(rev.revision_at)}
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 px-2 py-1 rounded-lg hover:bg-violet-50"
                      data-testid={`admin-restore-${rev.revision_at}`}
                    >
                      <RotateCcw className="w-3 h-3" /> Restore
                    </button>
                  </div>
                  {rev.excerpt && (
                    <p className="mt-1.5 text-[11px] text-gray-600 line-clamp-2">{rev.excerpt}</p>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Media library — lazy-mounted, reuses /api/admin/files. Routes
          its selection back through `handleLibrarySelect` which inserts
          at the Quill cursor for in-body picks or sets featured_image
          for the sidebar Library button. */}
      <MediaLibrary
        token={token}
        isAdmin={userRole === 'admin'}
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleLibrarySelect}
      />

      {/* AI featured-image generation modal. Kept simple: prompt textarea +
          model picker + Generate button. On success, sets featured_image
          and closes. Image is saved via the existing GridFS storage layer
          so it shows up in the media library alongside manual uploads. */}
      {genImageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !genImageBusy && setGenImageOpen(false)} data-testid="ai-image-modal">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5B22D6]" />
                Generate featured image with AI
              </h3>
              <button onClick={() => !genImageBusy && setGenImageOpen(false)} className="text-gray-400 hover:text-gray-700" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-1">Model</label>
                <select
                  value={genImageModel}
                  onChange={(e) => setGenImageModel(e.target.value)}
                  disabled={genImageBusy}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5B22D6]"
                  data-testid="ai-image-model"
                >
                  <option value="gpt-image-1">OpenAI gpt-image-1 (default, fast, sharp text)</option>
                  <option value="nano-banana">Gemini Nano Banana (artistic)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-1">Prompt</label>
                <textarea
                  value={genImagePrompt}
                  onChange={(e) => setGenImagePrompt(e.target.value)}
                  disabled={genImageBusy}
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5B22D6]"
                  placeholder="Describe the hero image you want…"
                  data-testid="ai-image-prompt"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Tip: avoid faces, logos, or inline text — they tend to look uncanny. CredSure heroes look best as clean editorial illustrations.
                </p>
              </div>
              {genImageError && (
                <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800" data-testid="ai-image-error">
                  {genImageError}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGenImageOpen(false)} disabled={genImageBusy}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateImage}
                disabled={genImageBusy}
                className="bg-[#5B22D6] hover:bg-[#3F2BD9] text-white"
                data-testid="ai-image-generate-btn"
              >
                {genImageBusy ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
