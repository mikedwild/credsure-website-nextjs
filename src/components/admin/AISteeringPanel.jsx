"use client";
/**
 * AISteeringPanel — reusable AI steering controls.
 *
 * Ported from unified-talent-hub (`frontend/src/components/admin/AISteeringPanel.jsx`),
 * adapted to use our token-prop auth pattern instead of useAdminAuth context.
 *
 * Loads dropdown options from GET /api/admin/ai/presets so the backend
 * stays the single source of truth for steering options.
 *
 * Props:
 *   value     — current steering object {preset, style, reading_level, length, language_voice, humanize}
 *   onChange  — (next) => void
 *   token     — admin auth token (passed via Authorization header)
 *   compact?  — 2-col layout when used inline in the editor
 *   title?    — heading text (default "AI Style & Model")
 *   subtitle? — small grey text under the heading
 */
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export const AI_STEERING_DEFAULTS = {
  preset: 'balanced',
  style: 'b2b',
  reading_level: 'standard',
  length: 'standard',
  language_voice: 'en',
  humanize: true,
};

const FALLBACK_PRESETS = [
  { value: 'fast', label: 'Fast — quick drafts' },
  { value: 'balanced', label: 'Balanced — Claude Sonnet (default)' },
  { value: 'premium', label: 'Premium — Claude Sonnet, longer context' },
];

const FALLBACK_STYLES = [
  { value: 'b2b', label: 'CredSure B2B (default)' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'storytelling', label: 'Storytelling' },
];

const FALLBACK_READING = [
  { value: 'simple', label: 'Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'expert', label: 'Expert' },
];

const FALLBACK_LENGTHS = [
  { value: 'short', label: 'Short (400–600 w)' },
  { value: 'standard', label: 'Standard (900–1200 w)' },
  { value: 'long', label: 'Long (1500–2000 w)' },
  { value: 'pillar', label: 'Pillar (2500–3200 w)' },
];

const FALLBACK_VOICES = [
  { value: 'en', label: 'English (default)' },
  { value: 'de_sie', label: 'Deutsch — Sie-Form' },
  { value: 'de_du', label: 'Deutsch — Du-Form' },
];

export const AISteeringPanel = ({
  value,
  onChange,
  token,
  compact = false,
  title = 'AI Style & Model',
  subtitle = null,
}) => {
  const [presets, setPresets] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/admin/ai/presets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled) setPresets(data);
      } catch {
        /* fallback dropdowns remain */
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const set = (patch) => onChange({ ...value, ...patch });
  const cls = compact
    ? 'grid grid-cols-2 gap-3'
    : 'grid grid-cols-2 lg:grid-cols-3 gap-3';

  const modelPresets = presets?.model_presets || FALLBACK_PRESETS;
  const styles = presets?.styles || FALLBACK_STYLES;
  const readingLevels = presets?.reading_levels || FALLBACK_READING;
  const lengths = presets?.lengths || FALLBACK_LENGTHS;
  const voices = presets?.language_voices || FALLBACK_VOICES;

  const labelCls = 'block text-xs uppercase tracking-wide text-gray-600 mb-1';
  const selectCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5B22D6]';

  return (
    <div
      className="p-5 bg-gradient-to-br from-[#5B22D6]/5 to-[#E22B8A]/5 rounded-xl border border-[#5B22D6]/20"
      data-testid="ai-steering-panel"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Sparkles className="w-5 h-5 text-[#5B22D6]" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <span className="text-xs text-gray-500 font-normal">{subtitle}</span>}
      </div>
      <div className={cls}>
        <div>
          <label className={labelCls}>Model preset</label>
          <select
            value={value.preset}
            onChange={(e) => set({ preset: e.target.value })}
            className={selectCls}
            data-testid="ai-preset-select"
          >
            {modelPresets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Writing style</label>
          <select
            value={value.style}
            onChange={(e) => set({ style: e.target.value })}
            className={selectCls}
            data-testid="ai-style-select"
          >
            {styles.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Length</label>
          <select
            value={value.length}
            onChange={(e) => set({ length: e.target.value })}
            className={selectCls}
            data-testid="ai-length-select"
          >
            {lengths.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Reading level</label>
          <select
            value={value.reading_level}
            onChange={(e) => set({ reading_level: e.target.value })}
            className={selectCls}
            data-testid="ai-reading-select"
          >
            {readingLevels.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Source language</label>
          <select
            value={value.language_voice}
            onChange={(e) => set({ language_voice: e.target.value })}
            className={selectCls}
            data-testid="ai-voice-select"
          >
            {voices.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm select-none cursor-pointer mb-1">
            <input
              type="checkbox"
              checked={value.humanize}
              onChange={(e) => set({ humanize: e.target.checked })}
              className="rounded"
              data-testid="ai-humanize-toggle"
            />
            <span>Humanize after drafting</span>
            <span
              className="text-xs text-gray-500"
              title="Run a second-pass prompt that strips AI-generated tells (banned phrases, em-dash overuse, adverb pile-ups) while keeping every fact and tag."
            >
              (?)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AISteeringPanel;
