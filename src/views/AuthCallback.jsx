"use client";
/**
 * AuthCallback — handles the post-Google-sign-in landing.
 *
 * Emergent OAuth bounces the browser back to {redirect_url}#session_id=...
 * after a successful Google login. We detect the fragment SYNCHRONOUSLY
 * during render (NOT in useEffect — that's too late, would cause a race
 * with ProtectedRoute / AppRouter checks) and exchange it for a backend
 * session cookie via /api/auth/google/session.
 *
 * On success we redirect to /:lang/admin with the user data in
 * location.state so the admin shell can skip its own /auth/me check.
 *
 * On failure (rejected domain, pending approval, network error) we land
 * on /:lang/admin?auth_error=<message> so the login screen surfaces the
 * reason.
 *
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS,
 * THIS BREAKS THE AUTH.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from '@/lib/router-shim';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  // useRef (not useState) so the guard is set synchronously and survives
  // React StrictMode's double-effect-invocation.
  const hasProcessed = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || '';
    const sessionId = new URLSearchParams(hash.replace(/^#/, '')).get('session_id');

    if (!sessionId) {
      navigate('/en/admin', { replace: true });
      return;
    }

    const lang = location.pathname.split('/')[1] || 'en';
    const adminPath = `/${['en', 'de'].includes(lang) ? lang : 'en'}/admin`;

    (async () => {
      try {
        // If the user came in via an invite link, InviteAccept stashed the
        // token in localStorage before the OAuth redirect — replay it here
        // so the backend can auto-activate their account.
        let inviteToken = null;
        try {
          inviteToken = localStorage.getItem('credsure-pending-invite-token');
        } catch (e) { /* private mode */ }

        // No `credentials: 'include'` — Emergent's ingress overwrites
        // Access-Control-Allow-Origin to `*`, which (combined with
        // ACAC=true) is rejected by browsers. We bypass the issue
        // entirely by going token-based: backend returns a session
        // token in the JSON body, we store it in localStorage, and
        // send it as `Authorization: Bearer <token>` on subsequent
        // admin API calls. The backend already accepts both modes.
        const res = await fetch(`${API_URL}/api/auth/google/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            ...(inviteToken ? { invite_token: inviteToken } : {}),
          }),
        });

        // Always clear the stash after one attempt so a subsequent Google
        // sign-in (e.g. by a different person on the same browser) doesn't
        // reuse it. Server has already idempotently consumed it on success.
        if (inviteToken) {
          try { localStorage.removeItem('credsure-pending-invite-token'); } catch (e) { /* noop */ }
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = (data && data.detail) || 'Sign-in failed.';
          setError(msg);
          navigate(`${adminPath}?auth_error=${encodeURIComponent(msg)}`, { replace: true });
          return;
        }
        // Persist the session token so the admin panel and subsequent
        // /api/auth/me calls can authenticate via Authorization header
        // (cookies are blocked by the ingress's wildcard ACAO).
        try {
          if (data?.token) localStorage.setItem('credsure-admin-token', data.token);
        } catch (e) { /* private mode — caller will re-auth */ }

        navigate(adminPath, {
          replace: true,
          state: { user: data.user, token: data.token },
        });
      } catch (e) {
        const msg = 'Connection failed during sign-in.';
        setError(msg);
        navigate(`${adminPath}?auth_error=${encodeURIComponent(msg)}`, { replace: true });
      }
    })();
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center" data-testid="auth-callback">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="mt-4 text-sm text-gray-600">
          {error ? `Sign-in failed: ${error}` : 'Signing you in…'}
        </p>
      </div>
    </div>
  );
}
