"use client";
/**
 * MediaLibrary — modal grid for browsing previously-uploaded images.
 *
 * Used by the blog editor's featured-image picker so writers don't have
 * to re-upload the same hero shot over and over. Reads from the same
 * `db.files` collection that /api/admin/upload writes to.
 *
 * Selection contract: when the user clicks a thumbnail we call
 * `onSelect(absoluteUrl)` so the parent can drop it into form state
 * (e.g. setField('featured_image', url)) and close the modal.
 *
 * Soft-delete is admin-only; the icon is hidden for editors.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Search, X, Trash2, Loader2, ImageOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const PAGE_SIZE = 30;

const formatBytes = (n) => {
  if (!n) return '';
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
};

export default function MediaLibrary({ token, isAdmin, open, onClose, onSelect }) {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Debounce search input — avoids hammering /admin/files on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const fetchFiles = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        content_type: 'image',
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`${API_URL}/api/admin/files?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load library');
      setFiles(data.files || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [open, page, debouncedSearch, token]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // Reset to page 1 whenever the search term actually changes.
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleSelect = (file) => {
    // Compose the absolute URL once here so callers stay simple and
    // don't have to know about REACT_APP_BACKEND_URL.
    const url = `${API_URL}${file.url}`;
    onSelect(url, file);
    onClose();
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      // Auto-pick the freshly uploaded image — that's almost always
      // what the writer wants.
      handleSelect({ url: `/api/files/${data.path}`, filename: data.filename });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (file, ev) => {
    ev.stopPropagation();
    if (!window.confirm(`Hide "${file.filename}" from the library? Posts already using it keep working until you delete them.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/files/${file.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || 'Delete failed');
      }
      // Optimistic local update — avoids a full refetch.
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setTotal(t => Math.max(0, t - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!open) return null;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" data-testid="media-library">
      <button aria-label="Close media library" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[88vh] sm:max-h-[80vh] flex flex-col">
        <header className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900 mr-auto">Media library</h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search filenames…"
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-violet-500"
              data-testid="media-library-search"
            />
          </div>
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-violet-50" data-testid="media-library-upload">
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{uploading ? 'Uploading…' : 'Upload new'}</span>
          </label>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Close" data-testid="media-library-close">
            <X className="w-4 h-4" />
          </button>
        </header>

        {error && (
          <p className="mx-5 mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" data-testid="media-library-error">{error}</p>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {loading && files.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-gray-500" data-testid="media-library-loading">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading library…
            </div>
          )}
          {!loading && files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500" data-testid="media-library-empty">
              <ImageOff className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">No images in the library yet.</p>
              <p className="text-xs mt-1">Hit "Upload new" or upload directly from a post — they'll show up here.</p>
            </div>
          )}
          {files.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map(file => (
                <li key={file.id} className="group">
                  {/* Tile is a relatively-positioned wrapper so the delete
                      button can be absolutely placed without nesting buttons
                      (which is invalid HTML and confuses screen readers). */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => handleSelect(file)}
                      className="block w-full aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-violet-400 hover:ring-2 hover:ring-violet-200 transition-all bg-gray-100 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-300"
                      data-testid={`media-library-item-${file.id}`}
                      aria-label={`Use ${file.filename}`}
                    >
                      <img
                        src={`${API_URL}${file.url}`}
                        alt={file.filename}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(file, e)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Hide from library"
                        aria-label={`Hide ${file.filename}`}
                        data-testid={`media-library-delete-${file.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-600 truncate" title={file.filename}>{file.filename}</p>
                  <p className="text-[10px] text-gray-400">{formatBytes(file.size)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalPages > 1 && (
          <footer className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{total} files</span>
            <div className="flex items-center gap-2">
              <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm" data-testid="media-library-prev">Prev</Button>
              <span>{page} / {totalPages}</span>
              <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline" size="sm" data-testid="media-library-next">Next</Button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
