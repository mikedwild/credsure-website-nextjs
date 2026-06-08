"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Save, CheckCircle, Shield, ShieldOff, Smartphone, Copy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// ─── MFA Section Component ──────────────────────────────────────────

function MFASection({ token }) {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [recoveryCodesRemaining, setRecoveryCodesRemaining] = useState(0);
  const [setupData, setSetupData] = useState(null);
  const [setupCode, setSetupCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/mfa/status`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setMfaEnabled(data.mfa_enabled);
      setRecoveryCodesRemaining(data.recovery_codes_remaining);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/mfa/setup`, { method: 'POST', headers });
      const data = await res.json();
      if (res.ok) {
        setSetupData(data);
      } else {
        setError(data.detail || 'Setup failed');
      }
    } catch { setError('Connection failed'); }
    setLoading(false);
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/mfa/verify-setup`, {
        method: 'POST', headers,
        body: JSON.stringify({ code: setupCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecoveryCodes(data.recovery_codes);
        setMfaEnabled(true);
        setSetupData(null);
        setSetupCode('');
        setMessage('MFA enabled successfully!');
        setRecoveryCodesRemaining(data.recovery_codes.length);
      } else {
        setError(data.detail || 'Verification failed');
      }
    } catch { setError('Connection failed'); }
    setLoading(false);
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/mfa/disable`, {
        method: 'POST', headers,
        body: JSON.stringify({ code: disableCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMfaEnabled(false);
        setShowDisable(false);
        setDisableCode('');
        setRecoveryCodes(null);
        setMessage('MFA disabled');
        setRecoveryCodesRemaining(0);
      } else {
        setError(data.detail || 'Failed to disable');
      }
    } catch { setError('Connection failed'); }
    setLoading(false);
  };

  const copyRecoveryCodes = () => {
    if (recoveryCodes) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="bg-white  border border-gray-200  rounded-2xl p-6 space-y-5" data-testid="mfa-section">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900  uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" /> Two-Factor Authentication
        </h3>
        {mfaEnabled ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100  text-emerald-700 " data-testid="mfa-status-enabled">
            <Shield className="w-3 h-3" /> Enabled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100  text-gray-600  " data-testid="mfa-status-disabled">
            <ShieldOff className="w-3 h-3" /> Disabled
          </span>
        )}
      </div>

      {message && <p className="text-emerald-400 text-sm">{message}</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* MFA Enabled State */}
      {mfaEnabled && !showDisable && !recoveryCodes && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 ">
            Your account is protected with TOTP-based two-factor authentication.
            {recoveryCodesRemaining > 0 && <span className="text-gray-600  "> ({recoveryCodesRemaining} recovery codes remaining)</span>}
          </p>
          <Button
            onClick={() => { setShowDisable(true); setError(''); setMessage(''); }}
            variant="outline"
            className="border-red-700/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
            data-testid="mfa-disable-start-btn"
          >
            <ShieldOff className="w-4 h-4 mr-2" /> Disable MFA
          </Button>
        </div>
      )}

      {/* Disable Confirmation */}
      {mfaEnabled && showDisable && (
        <form onSubmit={handleDisable} className="space-y-4 border border-red-900/30 rounded-xl p-4 bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 ">Enter your current authenticator code or a recovery code to disable MFA.</p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/[^0-9A-Fa-f]/g, ''))}
            placeholder="Enter code"
            className="w-full px-4 py-3 bg-gray-50  border border-gray-300  rounded-xl text-gray-900  text-center font-mono text-lg tracking-wider placeholder-gray-400  outline-none focus:ring-2 focus:ring-red-500"
            data-testid="mfa-disable-code-input"
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={loading || disableCode.length < 6} className="bg-red-600 hover:bg-red-700 text-white" data-testid="mfa-disable-confirm-btn">
              {loading ? 'Disabling...' : 'Confirm Disable'}
            </Button>
            <Button type="button" onClick={() => { setShowDisable(false); setDisableCode(''); setError(''); }} variant="outline" className="border-gray-300  text-gray-500 ">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Recovery Codes Display (shown after setup) */}
      {recoveryCodes && (
        <div className="space-y-4 border border-amber-900/30 rounded-xl p-4 bg-amber-950/20" data-testid="mfa-recovery-codes">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Save your recovery codes</p>
              <p className="text-xs text-gray-500  mt-1">Store these codes in a safe place. Each code can only be used once. You won't see them again.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recoveryCodes.map(code => (
              <div key={code} className="px-3 py-2 bg-slate-800 rounded-lg font-mono text-sm text-gray-900  text-center tracking-wider">
                {code}
              </div>
            ))}
          </div>
          <Button onClick={copyRecoveryCodes} variant="outline" className="border-gray-300  text-gray-600 " data-testid="mfa-copy-codes-btn">
            <Copy className="w-4 h-4 mr-2" /> {copiedCodes ? 'Copied!' : 'Copy All Codes'}
          </Button>
          <Button onClick={() => setRecoveryCodes(null)} variant="outline" className="ml-3 border-gray-300  text-gray-500 ">
            I've saved them
          </Button>
        </div>
      )}

      {/* MFA Disabled — Setup Flow */}
      {!mfaEnabled && !setupData && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 ">
            Add an extra layer of security. Use an authenticator app like Google Authenticator, Authy, or 1Password.
          </p>
          <Button
            onClick={handleStartSetup}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="mfa-enable-btn"
          >
            <Smartphone className="w-4 h-4 mr-2" /> {loading ? 'Setting up...' : 'Enable MFA'}
          </Button>
        </div>
      )}

      {/* QR Code Setup Step */}
      {!mfaEnabled && setupData && (
        <form onSubmit={handleVerifySetup} className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm text-gray-600 ">1. Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center p-4 bg-white rounded-xl w-fit mx-auto">
              <img src={setupData.qr_code} alt="MFA QR Code" className="w-48 h-48" data-testid="mfa-qr-code" />
            </div>
            <details className="text-xs text-gray-500 ">
              <summary className="cursor-pointer hover:text-gray-600 ">Can't scan? Enter this key manually</summary>
              <code className="block mt-2 p-3 bg-slate-800 rounded-lg font-mono text-gray-600  break-all text-center" data-testid="mfa-manual-key">
                {setupData.secret}
              </code>
            </details>
          </div>
          <div>
            <p className="text-sm text-gray-600  mb-2">2. Enter the 6-digit code from your app:</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={setupCode}
              onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
              className="w-full px-4 py-3 bg-gray-50  border border-gray-300  rounded-xl text-gray-900  text-center font-mono text-xl tracking-[0.4em] placeholder-gray-400  outline-none focus:ring-2 focus:ring-emerald-500"
              data-testid="mfa-setup-code-input"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading || setupCode.length < 6} className="bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="mfa-setup-verify-btn">
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
            <Button type="button" onClick={() => { setSetupData(null); setSetupCode(''); setError(''); }} variant="outline" className="border-gray-300  text-gray-500 ">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

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

  useEffect(() => {
    fetch(`${API_URL}/api/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          const s = data.settings;
          // Keep the secret inputs blank so saving the form never wipes a stored
          // key; track set/hint metadata separately for the status display.
          setForm(prev => ({ ...prev, ...s, anthropic_api_key: '', openai_api_key: '' }));
          setKeyMeta({
            anthropic_api_key_set: !!s.anthropic_api_key_set,
            anthropic_api_key_hint: s.anthropic_api_key_hint || '',
            openai_api_key_set: !!s.openai_api_key_set,
            openai_api_key_hint: s.openai_api_key_hint || '',
          });
        }
      });
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`${API_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
      {/* MFA Section */}
      <MFASection token={token} />

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
        {saved && <span className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved</span>}
      </div>
    </div>
  );
}
