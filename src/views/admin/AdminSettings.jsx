"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// ─── (removed) MFA Section ──────────────────────────────────────────
// Two-factor / TOTP MFA was removed: sign-in is Google-only, so an
// authenticator-app second factor is redundant. Google accounts carry
// their own 2FA. The backend /api/auth/mfa/* routes are now dead.
//
// Former location of MFA Section Component ──────────────────────────


// ─── Settings Page ──────────────────────────────────────────────────

export default function AdminSettings({ token }) {
  const [form, setForm] = useState({
    site_title: 'CredSure', site_description: '', default_author: 'CredSure Team',
    social_linkedin: '', social_twitter: '', contact_email: '', ga_tracking_id: '',
    anthropic_api_key: '', openai_api_key: '',
  });
  // Masked metadata for the secret key fields (the raw keys are never returned).
  const [keyMeta, setKeyMeta] = useState({
    anthropic_api_key_set: false, anthropic_api_key_hint: '',
    openai_api_key_set: false, openai_api_key_hint: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Apply a masked settings payload ({...fields, *_set, *_hint}) to local
  // state: blank the secret inputs (they're write-only) and refresh the
  // configured/not-set badges. Shared by initial load and post-save refresh.
  const applySettings = useCallback((s) => {
    setForm(prev => ({ ...prev, ...s, anthropic_api_key: '', openai_api_key: '' }));
    setKeyMeta({
      anthropic_api_key_set: !!s.anthropic_api_key_set,
      anthropic_api_key_hint: s.anthropic_api_key_hint || '',
      openai_api_key_set: !!s.openai_api_key_set,
      openai_api_key_hint: s.openai_api_key_hint || '',
    });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.settings) applySettings(data.settings); })
      .catch(() => {});
  }, [token, applySettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        // Surface the real failure instead of falsely showing "Saved". The old
        // code never checked res.ok, so a 401/403/422 looked like success while
        // the key silently never persisted.
        let detail = `HTTP ${res.status}`;
        try { const j = await res.json(); detail = j.detail || detail; } catch { /* noop */ }
        throw new Error(detail);
      }
      // Use the returned masked settings to refresh the badges immediately, so
      // a freshly-saved key flips to "Configured ✓ …last4" without a reload.
      const data = await res.json();
      if (data.settings) applySettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaveError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const Field = ({ label, field, type, rows }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500  uppercase tracking-wider mb-2">{label}</label>
      {rows ? (
        <textarea
          value={form[field]}
          onChange={e => setField(field, e.target.value)}
          rows={rows}
          className="w-full px-4 py-3 bg-gray-50  border border-gray-300  rounded-xl text-gray-900  text-sm placeholder-gray-400  outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      ) : (
        <input
          type={type || 'text'}
          value={form[field]}
          onChange={e => setField(field, e.target.value)}
          className="w-full px-4 py-3 bg-gray-50  border border-gray-300  rounded-xl text-gray-900  text-sm placeholder-gray-400  outline-none focus:ring-2 focus:ring-violet-500"
        />
      )}
    </div>
  );

  // Secret-key input: password type, shows a "configured ✓ …last4" badge when a
  // key is already stored, and only sends a new value when the admin types one.
  const KeyField = ({ label, field, placeholder }) => {
    const isSet = keyMeta[`${field}_set`];
    const hint = keyMeta[`${field}_hint`];
    return (
      <div>
        <label className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          <span>{label}</span>
          {isSet ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 normal-case tracking-normal font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Configured {hint && <code className="text-gray-400">{hint}</code>}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-600 normal-case tracking-normal font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Not set
            </span>
          )}
        </label>
        <input
          type="password"
          autoComplete="new-password"
          value={form[field]}
          onChange={e => setField(field, e.target.value)}
          placeholder={isSet ? '•••••••• (leave blank to keep current)' : (placeholder || 'Paste API key')}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm font-mono placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500"
          data-testid={`settings-${field}`}
        />
      </div>
    );
  };

  return (
    <div className="max-w-2xl space-y-8" data-testid="admin-settings">
      <div className="bg-white  border border-gray-200  rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900  uppercase tracking-wider">General</h3>
        <Field label="Site Title" field="site_title" />
        <Field label="Site Description" field="site_description" rows={3} />
        <Field label="Default Blog Author" field="default_author" />
        <Field label="Contact Email" field="contact_email" type="email" />
      </div>

      <div className="bg-white  border border-gray-200  rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900  uppercase tracking-wider">Social Links</h3>
        <Field label="LinkedIn URL" field="social_linkedin" />
        <Field label="Twitter URL" field="social_twitter" />
      </div>

      <div className="bg-white  border border-gray-200  rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900  uppercase tracking-wider">Analytics</h3>
        <Field label="Google Analytics Tracking ID" field="ga_tracking_id" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5" data-testid="settings-api-keys">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">AI / API Keys</h3>
          <p className="text-xs text-gray-500 mt-1">
            Powers AI blog generation, topic recommendations, translation (Anthropic)
            and featured-image generation (OpenAI). Stored securely server-side and
            never shown again after saving.
          </p>
        </div>
        <KeyField label="Anthropic API Key" field="anthropic_api_key" placeholder="sk-ant-..." />
        <KeyField label="OpenAI API Key" field="openai_api_key" placeholder="sk-..." />
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-gray-900  px-8" data-testid="admin-settings-save">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        {saved && <span className="text-emerald-600 text-sm flex items-center gap-1" data-testid="admin-settings-saved"><CheckCircle className="w-4 h-4" /> Saved</span>}
        {saveError && <span className="text-red-600 text-sm flex items-center gap-1" data-testid="admin-settings-error"><AlertTriangle className="w-4 h-4" /> {saveError}</span>}
      </div>
    </div>
  );
}
