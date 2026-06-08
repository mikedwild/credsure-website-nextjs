"use client";
/**
 * InviteAccept — public landing page for /:lang/invite/:token.
 *
 * The recipient lands here from the Slack invite link. We:
 *   1. Validate the token via GET /api/invites/:token (server-side checks
 *      expiry + un-accepted state).
 *   2. Show their assigned role and the Google account they should sign
 *      in with.
 *   3. On click: stash the invite_token in localStorage and kick off the
 *      Emergent OAuth flow. AuthCallback (post-Google) reads the stash and
 *      replays it to /api/auth/google/session so the backend auto-activates
 *      the new user with the invited role.
 *
 * No password is set anywhere — Google is the sole credential.
 *
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS,
 * THIS BREAKS THE AUTH.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from '@/lib/router-shim';
import { Mail, Shield, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const PENDING_INVITE_KEY = 'credsure-pending-invite-token';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" width="20" height="20" {...props}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

export default function InviteAccept() {
  const { token } = useParams();
  const location = useLocation();

  const [invite, setInvite] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/invites/${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setInviteError(data?.detail || 'This invite link is no longer valid.');
        } else {
          setInvite(data);
        }
      } catch {
        if (!cancelled) setInviteError('Could not reach the server. Please try again.');
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const lang = location.pathname.split('/')[1];
  const adminPath = `/${['en', 'de'].includes(lang) ? lang : 'en'}/admin`;

  const handleAcceptWithGoogle = () => {
    setRedirecting(true);
    // Direct Google OAuth. The invite token rides through the backend `state`
    // (no localStorage needed): the callback validates it and auto-activates
    // the account, then bounces the browser to the admin path with #token=...
    const redirectUrl = window.location.origin + adminPath;
    const params = new URLSearchParams({ redirect: redirectUrl, invite: token });
    window.location.href = `${API_URL}/api/auth/google/start?${params.toString()}`;
  };

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="invite-loading">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-10 shadow-lg text-center" data-testid="invite-invalid">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite unavailable</h1>
          <p className="text-sm text-gray-500 mb-6">{inviteError}</p>
          <p className="text-xs text-gray-400">Ask the admin who invited you to send a fresh link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-10 shadow-lg" data-testid="invite-accept">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4">
            {invite.role === 'admin'
              ? <Shield className="w-7 h-7 text-white" />
              : <FileText className="w-7 h-7 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CredSure</h1>
          <p className="text-sm text-gray-500">
            You've been invited as <span className="font-semibold capitalize">{invite.role}</span>.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Sign in as</div>
            <div className="text-sm text-gray-900 truncate" data-testid="invite-email-display">{invite.email}</div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAcceptWithGoogle}
          disabled={redirecting}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 py-6 rounded-xl flex items-center justify-center gap-3 shadow-sm"
          data-testid="invite-google-btn"
        >
          <GoogleIcon />
          <span className="text-base font-semibold">
            {redirecting ? 'Redirecting…' : 'Sign in with Google'}
          </span>
        </Button>

        <p className="mt-6 text-xs text-center text-gray-500">
          Use the Google account associated with <code className="font-mono">{invite.email}</code>.
          Other accounts will be rejected.
        </p>
      </div>
    </div>
  );
}
