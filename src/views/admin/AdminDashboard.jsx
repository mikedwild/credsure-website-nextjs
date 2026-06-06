"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, BarChart } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminDashboard({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [blogStats, setBlogStats] = useState(null);

  useEffect(() => {
    const h = { 'Authorization': `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/leads/analytics`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/blogs?limit=1`, { headers: h }).then(r => r.json()),
    ]).then(([a, b]) => { setAnalytics(a); setBlogStats(b); });
  }, [token]);

  if (!analytics) return <div className="text-gray-600 ">Loading...</div>;

  const cards = [
    { label: 'Total Leads', value: analytics.total_leads, icon: Users, color: 'text-violet-600  bg-violet-100 ' },
    { label: 'This Week', value: analytics.this_week, icon: TrendingUp, color: 'text-emerald-600  bg-emerald-100 ' },
    { label: 'Week Change', value: `${analytics.week_change_pct > 0 ? '+' : ''}${analytics.week_change_pct}%`, icon: BarChart, color: 'text-sky-600  bg-sky-100 ' },
    { label: 'Blog Posts', value: blogStats?.total || 0, icon: FileText, color: 'text-amber-600  bg-amber-100 ' },
  ];

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white  border border-gray-200  rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 ">{c.value}</p>
            <p className="text-xs text-gray-500  mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white  border border-gray-200  rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900  mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {analytics.by_source?.map(s => (
              <div key={s.source} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 ">{s.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100  rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min((s.count / analytics.total_leads) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500  w-8 text-right">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white  border border-gray-200  rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900  mb-4">Recent Leads</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.recent_leads?.slice(0, 10).map((l, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100  last:border-0">
                <div>
                  <p className="text-sm text-gray-900 ">{l.name || l.email}</p>
                  <p className="text-xs text-gray-600 ">{l.company || l.source}</p>
                </div>
                <span className="text-[10px] text-gray-600 ">{l.timestamp?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
