"use client";
/**
 * AdminBlogList — list view with search, status filter, bulk actions, and
 * per-row Edit/Duplicate/Delete.
 *
 * Bulk actions: select multiple via checkboxes, then publish / unpublish /
 * delete in one call. Backend endpoint POST /api/admin/blogs/bulk handles
 * all three; admin role required.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, FileText, CheckSquare, Square, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

function StatusBadge({ status }) {
  const colors = {
    published: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
}

export default function AdminBlogList({ token, onEdit, onNew }) {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [message, setMessage] = useState('');

  const authHeader = { 'Authorization': `Bearer ${token}` };
  const jsonHeader = { ...authHeader, 'Content-Type': 'application/json' };

  const fetchPosts = useCallback(async () => {
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`${API_URL}/api/admin/blogs?${params}`, { headers: authHeader });
    const data = await res.json();
    setPosts(data.posts || []);
    setTotal(data.total || 0);
    setSelected(new Set());  // clear selection on any list change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, search, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (slug) => {
    if (!window.confirm(`Delete "${slug}"?`)) return;
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/admin/blogs/${slug}`, { method: 'DELETE', headers: authHeader });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.detail || `Delete failed (HTTP ${res.status})`}`);
        return;
      }
      setMessage('Post deleted');
      fetchPosts();
    } catch {
      setMessage('Connection error during delete');
    }
  };

  const handleDuplicate = async (slug) => {
    setMessage('');
    const res = await fetch(`${API_URL}/api/admin/blogs/${slug}/duplicate`, {
      method: 'POST', headers: authHeader,
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      fetchPosts();
      // Open the new draft in the editor so user can tweak immediately
      if (data.post?.slug) onEdit(data.post.slug);
    } else {
      setMessage(`Error: ${data.detail || 'Duplicate failed'}`);
    }
  };

  const toggleSelect = (slug) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === posts.length) setSelected(new Set());
    else setSelected(new Set(posts.map(p => p.slug)));
  };

  const handleBulk = async (action) => {
    if (selected.size === 0) return;
    if (action === 'delete' && !window.confirm(`Permanently delete ${selected.size} post(s)?`)) return;
    setBulkBusy(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/admin/blogs/bulk`, {
        method: 'POST', headers: jsonHeader,
        body: JSON.stringify({ slugs: Array.from(selected), action }),
      });
      const data = await res.json();
      if (res.ok) { setMessage(data.message); fetchPosts(); }
      else setMessage(`Error: ${data.detail || 'Bulk action failed'}`);
    } catch { setMessage('Connection failed'); }
    setBulkBusy(false);
  };

  const totalPages = Math.ceil(total / 15);
  const allSelected = posts.length > 0 && selected.size === posts.length;

  return (
    <div className="space-y-6" data-testid="admin-blog-list">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500 w-64"
              data-testid="admin-blog-search"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <Button onClick={onNew} className="bg-violet-600 hover:bg-violet-700 text-white" data-testid="admin-new-post">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {message && <p className={`text-sm rounded-xl px-4 py-3 ${message.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`} data-testid="admin-blog-list-message">{message}</p>}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center justify-between" data-testid="admin-bulk-bar">
          <span className="text-sm font-semibold text-violet-900">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={bulkBusy} onClick={() => handleBulk('publish')} className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="admin-bulk-publish">Publish</Button>
            <Button size="sm" disabled={bulkBusy} onClick={() => handleBulk('unpublish')} variant="outline" data-testid="admin-bulk-unpublish">Unpublish</Button>
            <Button size="sm" disabled={bulkBusy} onClick={() => handleBulk('delete')} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" data-testid="admin-bulk-delete">Delete</Button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 px-2 hover:text-gray-700">Clear</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="pl-5 pr-2 py-3 w-10">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-violet-600" data-testid="admin-bulk-select-all" aria-label="Select all">
                  {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left whitespace-nowrap" title="Per-post analytics: pageviews / leads attributed via inline blog CTA">Views / Leads</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => {
              const isSelected = selected.has(post.slug);
              return (
                <tr key={post.slug} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-violet-50/50' : ''}`}>
                  <td className="pl-5 pr-2 py-3">
                    <button onClick={() => toggleSelect(post.slug)} className="text-gray-400 hover:text-violet-600" data-testid={`admin-row-select-${post.slug}`} aria-label={`Select ${post.slug}`}>
                      {isSelected ? <CheckSquare className="w-4 h-4 text-violet-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-gray-900 font-medium truncate max-w-md">{post.title}</div>
                    <div className="text-xs text-gray-600 truncate">{post.slug}</div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={post.status} /></td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{post.category}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{post.date || post.created_at?.slice(0, 10)}</td>
                  <td className="px-5 py-3 text-xs whitespace-nowrap" data-testid={`admin-row-stats-${post.slug}`}>
                    <span className="inline-flex items-center gap-1 text-gray-600 mr-3" title={`${post.view_count || 0} pageviews`}>
                      <Eye className="w-3 h-3 text-gray-400" />
                      {(post.view_count || 0).toLocaleString()}
                    </span>
                    <span className={`inline-flex items-center gap-1 ${post.lead_count ? 'text-emerald-700 font-medium' : 'text-gray-400'}`} title={`${post.lead_count || 0} leads attributed`}>
                      <Users className="w-3 h-3" />
                      {post.lead_count || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(post.slug)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-violet-600 transition-colors" title="Edit" data-testid={`admin-edit-${post.slug}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDuplicate(post.slug)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-sky-600 transition-colors" title="Duplicate" data-testid={`admin-duplicate-${post.slug}`}>
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(post.slug)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors" title="Delete" data-testid={`admin-delete-${post.slug}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-600 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" /> No posts found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{total} posts total</span>
          <div className="flex gap-2">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm" className="border-gray-200 text-gray-600">Prev</Button>
            <span className="text-sm text-gray-600 px-3 py-1">{page}/{totalPages}</span>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline" size="sm" className="border-gray-200 text-gray-600">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
