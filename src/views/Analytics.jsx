"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, BarChart3, Activity, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const COLORS = ['#5B22D6', '#3F2BD9', '#E22B8A', '#B82BC4', '#6366f1', '#8b5cf6', '#06b6d4'];

const StatCard = ({ title, value, subtitle, trend, icon: Icon }) => (
  <div className="bg-white  border border-slate-200  rounded-2xl p-6 hover:shadow-lg transition-all" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend !== undefined && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600  ' : 'bg-red-50 text-red-600  '}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-slate-900  mb-1">{value}</p>
    <p className="text-sm text-slate-500 ">{subtitle || title}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white  border border-slate-200  rounded-xl p-3 shadow-lg">
      <p className="text-xs text-slate-500  mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="text-sm font-semibold text-slate-900 ">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const fetchAnalytics = async (jwt) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/leads/analytics`, {
        headers: { 'Authorization': `Bearer ${jwt}` },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('unauthorized');
        throw new Error(`API error: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const loginData = await res.json();
      if (res.ok) {
        setToken(loginData.token);
        fetchAnalytics(loginData.token);
      } else {
        setError(typeof loginData.detail === 'string' ? loginData.detail : 'Invalid credentials');
      }
    } catch {
      setError('Connection failed');
    }
  };

  // Pie chart label
  const renderPieLabel = ({ name, percent }) =>
    percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : '';

  const pieData = useMemo(() => {
    if (!data?.by_source) return [];
    return data.by_source.map((s) => ({ name: s.label, value: s.count }));
  }, [data]);

  // Trend chart — format date axis
  const trendData = useMemo(() => {
    if (!data?.daily_trend) return [];
    return data.daily_trend.map((d) => ({
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [data]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white   flex items-center justify-center px-6" data-testid="analytics-login">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white  border border-slate-200  rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5B22D6] to-[#3F2BD9] mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900  mb-2">Lead Analytics</h1>
            <p className="text-sm text-slate-500 ">Sign in with your admin credentials</p>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-white  text-slate-900  focus:ring-2 focus:ring-[#5B22D6] focus:border-transparent outline-none transition"
              data-testid="analytics-email-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300  bg-white  text-slate-900  focus:ring-2 focus:ring-[#5B22D6] focus:border-transparent outline-none transition"
              data-testid="analytics-password-input"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error === 'unauthorized' ? 'Invalid credentials' : error}</p>}
          <Button type="submit" className="w-full mt-4 brand-gradient text-white py-3 rounded-xl font-semibold" data-testid="analytics-login-btn">
            <ArrowRight className="w-4 h-4 mr-2" /> Access Dashboard
          </Button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B22D6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white   pt-28 pb-16" data-testid="analytics-dashboard">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900  mb-2">Lead Analytics</h1>
          <p className="text-base text-slate-500 ">Real-time conversion data across all {data?.by_source?.length || 0} lead touchpoints</p>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard title="Total Leads" value={data?.total_leads || 0} subtitle="All time" icon={Users} />
          <StatCard title="This Week" value={data?.this_week || 0} subtitle="Last 7 days" trend={data?.week_change_pct} icon={TrendingUp} />
          <StatCard title="Sources" value={data?.by_source?.length || 0} subtitle="Active touchpoints" icon={BarChart3} />
          <StatCard title="Avg/Day" value={data?.total_leads ? Math.round(data.total_leads / 30) : 0} subtitle="Last 30 days" icon={Activity} />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Area Chart: Daily Trend */}
          <div className="bg-white  border border-slate-200  rounded-2xl p-6" data-testid="daily-trend-chart">
            <h2 className="text-lg font-bold text-slate-900  mb-4">Daily Leads (30 days)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B22D6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5B22D6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Leads" stroke="#5B22D6" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart: By Source */}
          <div className="bg-white  border border-slate-200  rounded-2xl p-6" data-testid="source-pie-chart">
            <h2 className="text-lg font-bold text-slate-900  mb-4">Leads by Source</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={renderPieLabel} labelLine={false}>
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400">No source data yet</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Source Breakdown */}
        <div className="bg-white  border border-slate-200  rounded-2xl p-6 mb-10" data-testid="source-bar-chart">
          <h2 className="text-lg font-bold text-slate-900  mb-4">Conversion by Touchpoint</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.by_source || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Leads" fill="#5B22D6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Leads Table */}
        <div className="bg-white  border border-slate-200  rounded-2xl overflow-hidden" data-testid="recent-leads-table">
          <div className="p-6 border-b border-slate-200 ">
            <h2 className="text-lg font-bold text-slate-900 ">Recent Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 ">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ">Company</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ">Source</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 ">
                {(data?.recent_leads || []).map((lead) => (
                  <tr key={`${lead.email}-${lead.timestamp}`} className="hover:bg-slate-50 :bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 ">{lead.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 ">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 ">{lead.company || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-[#5B22D6]/10 text-[#5B22D6]  ">
                        {lead.source || 'website'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 ">
                      {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
                {(!data?.recent_leads || data.recent_leads.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No leads captured yet. Your first lead will appear here.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
