"use client";
/**
 * AdminPanel — Google-only authenticated workspace.
 *
 * Auth flow:
 *   1. On mount, ask the backend (via /api/auth/me) whether we already have
 *      a valid session_token cookie. If yes → show the panel.
 *   2. If not, show a single "Sign in with Google" button. Clicking it
 *      redirects to the Emergent OAuth start URL with the current page as
 *      the post-auth destination. Emergent does the Google dance and
 *      bounces the browser back with #session_id=... in the URL fragment.
 *   3. The top-level <AuthGateRouter /> in App.js detects the fragment and
 *      renders <AuthCallback />, which exchanges the session_id for a
 *      cookie and navigates back here with location.state.user populated.
 *
 * Email/password and TOTP MFA login were removed — Google is now the sole
 * sign-in method (per the user's directive). Existing seed admin records
 * are matched by email on first Google login so role+active state carry
 * over.
 *
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS,
 * THIS BREAKS THE AUTH.
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from '@/lib/router-shim';
import { LayoutDashboard, FileText, Users, Users2, Settings, LogOut, Shield, Menu, X, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminBlogList from './admin/AdminBlogList';
import AdminBlogEditor from './admin/AdminBlogEditor';
import AdminLeads from './admin/AdminLeads';
import AdminSettings from './admin/AdminSettings';
import AdminDashboard from './admin/AdminDashboard';
import AdminAIContent from './admin/AdminAIContent';
import AdminUsers from './admin/AdminUsers';
import AIBlogGenerator from './admin/AIBlogGenerator';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const ALL_NAV_ITEMS = [
  { key: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard, adminOnly: true  },
  { key: 'ai-content',   label: 'AI Content',    icon: Sparkles,        adminOnly: false },
  { key: 'ai-generator', label: 'AI Generator',  icon: Wand2,           adminOnly: false },
  { key: 'blogs',        label: 'Blog Posts',    icon: FileText,        adminOnly: false },
  { key: 'leads',        label: 'Leads',         icon: Users,           adminOnly: true  },
  { key: 'users',        label: 'Users',         icon: Users2,          adminOnly: true  },
  { key: 'settings',     label: 'Settings',      icon: Settings,        adminOnly: true  },
];

const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" width="20" height="20" {...props}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

export default function AdminPanel() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // location.state.user is populated by AuthCallback after a fresh Google
  // sign-in — using it lets us skip the /auth/me round-trip on first load.
  const initialUser = location.state?.user || null;
  const initialToken = location.state?.token || '';

  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(initialToken);
  const [authChecking, setAuthChecking] = useState(!initialUser);
  const [activeTab, setActiveTab] = useState(initialUser?.role === 'admin' ? 'dashboard' : 'blogs');
  const [editingSlug, setEditingSlug] = useState(null);
  const [error, setError] = useState(searchParams.get('auth_error') || '');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const navItems = useMemo(
    () => ALL_NAV_ITEMS.filter(item => !item.adminOnly || isAdmin),
    [isAdmin],
  );

  // On mount, if we don't already have a user from AuthCallback, try to
  // re-hydrate from a stored bearer token. We can't rely on the
  // session_token cookie because Emergent's ingress overwrites
  // Access-Control-Allow-Origin to '*', which (with credentials=true)
  // is rejected by the browser. The token is mirrored into localStorage
  // by AuthCallback after a successful Google sign-in.
  useEffect(() => {
    if (initialUser) return;
    let cancelled = false;
    (async () => {
      // Post-OAuth landing: the backend redirects here with the session token
      // (or an error) in the URL fragment. Fragments aren't sent to servers,
      // so this keeps the token out of logs/referrers. Persist it, then clean
      // the URL before the auth check below picks it up.
      try {
        const hash = window.location.hash || '';
        if (hash.length > 1) {
          const params = new URLSearchParams(hash.replace(/^#/, ''));
          const hashToken = params.get('token');
          const hashError = params.get('error');
          if (hashToken) {
            localStorage.setItem('credsure-admin-token', hashToken);
          }
          if (hashError) {
            setError(hashError);
          }
          if (hashToken || hashError) {
            // Strip the fragment so a refresh doesn't re-process it.
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      } catch (e) { /* private mode / SSR guard */ }

      let storedToken = '';
      try { storedToken = localStorage.getItem('credsure-admin-token') || ''; } catch (e) { /* private mode */ }
      if (!storedToken) {
        if (!cancelled) setAuthChecking(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          const userData = data.user || data;
          const hydratedToken = data.token || storedToken;
          setUser(userData);
          setToken(hydratedToken);
          setActiveTab(userData?.role === 'admin' ? 'dashboard' : 'blogs');
        } else if (!cancelled) {
          // Token expired/invalid — clear it so we don't loop.
          try { localStorage.removeItem('credsure-admin-token'); } catch (e) { /* noop */ }
        }
      } catch (e) {
        // network blip — fall through to login screen
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initialUser]);

  const handleGoogleLogin = useCallback(() => {
    setLoading(true);
    setError('');
    // Direct Google OAuth (no Emergent). We hand the backend a `redirect`
    // (this same admin page) so it can bounce the browser back here with
    // #token=... once Google + provisioning succeed. window.location.origin
    // keeps preview vs prod on the correct domain.
    const redirectUrl = window.location.origin + location.pathname;
    window.location.href = `${API_URL}/api/auth/google/start?redirect=${encodeURIComponent(redirectUrl)}`;
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      // Logout uses a bearer header; ingress wildcard makes cookies
      // unreliable. Token is cleared from localStorage regardless.
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
    } catch (e) { /* network noop — local state still clears below */ }
    try { localStorage.removeItem('credsure-admin-token'); } catch (e) { /* noop */ }
    setToken('');
    setUser(null);
    setActiveTab('dashboard');
  }, [token]);

  const navigateTo = useCallback((tab, slug) => {
    setActiveTab(tab);
    setEditingSlug(slug || null);
    setSidebarOpen(false);
  }, []);

  // ─── Loading state ────────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="admin-checking-auth">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  // ─── Login screen (Google-only) ───────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6" data-testid="admin-login">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-10 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1" data-testid="admin-login-title">CredSure Admin</h1>
            <p className="text-sm text-gray-500">Sign in with your CredSure or Certif-ID Google account</p>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 leading-relaxed"
              data-testid="admin-login-error"
            >
              <p className="font-semibold mb-1">Sign-in not completed</p>
              <p className="text-amber-800">{error}</p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 py-6 rounded-xl flex items-center justify-center gap-3 shadow-sm"
            data-testid="admin-google-login-btn"
          >
            <GoogleIcon />
            <span className="text-base font-semibold">{loading ? 'Redirecting…' : 'Sign in with Google'}</span>
          </Button>

          <p className="mt-6 text-xs text-center text-gray-500">
            Only <code className="font-mono">@credsure.io</code> and <code className="font-mono">@certif-id.com</code> accounts are accepted.
          </p>
        </div>
      </div>
    );
  }

  // ─── Authenticated panel ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex" data-testid="admin-panel">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CredSure</span>
          </div>
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)} data-testid="admin-sidebar-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigateTo(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === key || (activeTab === 'editor' && key === 'blogs')
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              data-testid={`admin-nav-${key}`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-500 truncate">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>{user?.role}</span>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-all"
            data-testid="admin-logout"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)} data-testid="admin-sidebar-open">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {activeTab === 'editor' ? (editingSlug ? 'Edit Post' : 'New Post') : ALL_NAV_ITEMS.find(n => n.key === activeTab)?.label || 'Admin'}
            </h2>
          </div>
        </header>
        <div className="p-6 lg:p-8">
          {activeTab === 'dashboard' && isAdmin && <AdminDashboard token={token} />}
          {activeTab === 'ai-content' && <AdminAIContent token={token} onNavigateToBlog={() => navigateTo('blogs')} />}
          {activeTab === 'ai-generator' && (
            <AIBlogGenerator
              token={token}
              onNavigateToBlog={() => navigateTo('blogs')}
              onEditDraft={(slug) => navigateTo('editor', slug)}
            />
          )}
          {activeTab === 'blogs' && <AdminBlogList token={token} onEdit={(slug) => navigateTo('editor', slug)} onNew={() => navigateTo('editor')} />}
          {activeTab === 'editor' && <AdminBlogEditor token={token} slug={editingSlug} userRole={user?.role} onBack={() => navigateTo('blogs')} />}
          {activeTab === 'leads' && isAdmin && <AdminLeads token={token} />}
          {activeTab === 'users' && isAdmin && <AdminUsers token={token} currentUserEmail={user?.email} />}
          {activeTab === 'settings' && isAdmin && <AdminSettings token={token} />}
        </div>
      </main>
    </div>
  );
}
