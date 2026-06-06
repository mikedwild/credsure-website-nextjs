"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminLeads({ token }) {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [sources, setSources] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams({ page, limit: 25 });
    if (search) params.set('search', search);
    if (sourceFilter) params.set('source', sourceFilter);
    const res = await fetch(`${API_URL}/api/admin/leads?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    setLeads(data.leads || []);
    setTotal(data.total || 0);
    setSources(data.sources || []);
  }, [token, page, search, sourceFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/leads/export`, { headers: { 'Authorization': `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { /* download failed silently */ }
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Delete lead ${email}?`)) return;
    await fetch(`${API_URL}/api/admin/leads/${encodeURIComponent(email)}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchLeads();
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6" data-testid="admin-leads">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 " />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="pl-10 pr-4 py-2 bg-white  border border-gray-200  rounded-xl text-sm text-gray-900  placeholder-gray-400  outline-none focus:ring-2 focus:ring-violet-500 w-64"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-white  border border-gray-200  rounded-xl text-sm text-gray-900  outline-none"
          >
            <option value="">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-gray-200  text-gray-600 ">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="bg-white  border border-gray-200  rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100  text-xs text-gray-500  uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Contact</th>
              <th className="px-5 py-3 text-left">Company</th>
              <th className="px-5 py-3 text-left">Source</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr key={`${lead.email}-${i}`} className="border-b border-gray-50  hover:bg-gray-50 :bg-slate-800/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="text-gray-900  font-medium">{lead.name || '—'}</div>
                  <div className="text-xs text-gray-600  flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</div>
                </td>
                <td className="px-5 py-3 text-gray-600  text-xs">{lead.company || '—'}</td>
                <td className="px-5 py-3">
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100  text-gray-600  rounded-full">{lead.source || '—'}</span>
                </td>
                <td className="px-5 py-3 text-gray-600  text-xs">{lead.timestamp?.slice(0, 10)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(lead.email)} className="p-1.5 rounded-lg hover:bg-gray-100 :bg-slate-700 text-gray-600  hover:text-red-600 :text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="text-center py-12 text-gray-600  text-sm">No leads found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 ">{total} leads total</span>
          <div className="flex gap-2">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm" className="border-gray-200  text-gray-600 ">Prev</Button>
            <span className="text-sm text-gray-600  px-3 py-1">{page}/{totalPages}</span>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline" size="sm" className="border-gray-200  text-gray-600 ">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
