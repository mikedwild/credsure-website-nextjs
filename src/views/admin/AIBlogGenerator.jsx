"use client";
/**
 * AIBlogGenerator — multi-step AI authoring wizard.
 *
 * Ported from unified-talent-hub (`pages/admin/AIBlogGenerator.jsx`),
 * adapted to CredSure conventions:
 *   - token-prop auth (no AdminAuthContext)
 *   - REACT_APP_BACKEND_URL for API base
 *   - onNavigateToBlog callback instead of useNavigate
 *   - Industries reflect CredSure verticals (higher-ed, corporate-training,
 *     certification-bodies, healthcare, general)
 *
 * Flow: Industry → Keyword recs → Steering knobs + selection → Generate → Results.
 */
import React, { useState } from 'react';
import {
  Sparkles, TrendingUp, Search, FileText, Loader2,
  CheckCircle, XCircle, ArrowRight, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AISteeringPanel, { AI_STEERING_DEFAULTS } from '@/components/admin/AISteeringPanel';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const INDUSTRIES = [
  { value: 'higher-education',     label: 'Higher Education',     color: 'bg-blue-50 border-blue-200',     hint: 'Universities, MOOCs, diplomas, alumni' },
  { value: 'corporate-training',   label: 'Corporate Training',   color: 'bg-emerald-50 border-emerald-200', hint: 'L&D, compliance, leadership programmes' },
  { value: 'certification-bodies', label: 'Certification Bodies', color: 'bg-amber-50 border-amber-200',   hint: 'Professional licences, exams, ISO' },
  { value: 'healthcare',           label: 'Healthcare',           color: 'bg-rose-50 border-rose-200',     hint: 'Nursing CEU, CME credits, clinical' },
  { value: 'general',              label: 'General',              color: 'bg-[#5B22D6]/10 border-[#5B22D6]/20', hint: 'Mixed credentialing topics' },
];

const difficultyClass = (d) => ({
  low:    'bg-emerald-100 text-emerald-800 border-emerald-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  high:   'bg-rose-100 text-rose-800 border-rose-300',
}[d] || 'bg-gray-100 text-gray-800 border-gray-300');

export default function AIBlogGenerator({ token, onNavigateToBlog, onEditDraft }) {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [steering, setSteering] = useState(AI_STEERING_DEFAULTS);
  const [error, setError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchKeywords = async () => {
    setError('');
    setGenerating(true);
    try {
      const r = await fetch(`${API_URL}/api/admin/ai/keyword-research`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ industry: industry || null, count: 10 }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setRecommendations(data.recommendations || []);
      setStep(2);
    } catch (e) {
      setError(`Failed to fetch keywords: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const toggleKeyword = (kw) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const generateDrafts = async () => {
    setError('');
    setGenerating(true);
    setStep(3);
    const out = [];
    for (const keyword of selectedKeywords) {
      const rec = recommendations.find((r) => r.keyword === keyword);
      const payload = {
        keyword,
        industry: rec?.industry || 'general',
        target_language: steering.language_voice.startsWith('de') ? 'de' : 'en',
        preset: steering.preset,
        style: steering.style,
        reading_level: steering.reading_level,
        length: steering.length,
        language_voice: steering.language_voice,
        humanize: steering.humanize,
      };
      try {
        // Submit async job — returns immediately with job_id.
        const submit = await fetch(`${API_URL}/api/admin/ai/jobs/generate-draft`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        if (!submit.ok) {
          const detail = await submit.json().catch(() => ({ detail: `HTTP ${submit.status}` }));
          out.push({ keyword, status: 'failed', error: detail.detail || `HTTP ${submit.status}` });
          continue;
        }
        const { job_id } = await submit.json();

        // Poll up to 5 minutes (60 polls × 5 s). Long pillar posts can take
        // 2–3 minutes including auto-translate.
        let data = null;
        let final = null;
        for (let i = 0; i < 60; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 5000));
          // eslint-disable-next-line no-await-in-loop
          const poll = await fetch(`${API_URL}/api/admin/ai/jobs/${job_id}`, { headers: authHeaders });
          if (!poll.ok) continue;
          // eslint-disable-next-line no-await-in-loop
          data = await poll.json();
          if (data.status === 'complete' || data.status === 'failed') { final = data; break; }
        }
        if (!final) {
          out.push({ keyword, status: 'failed', error: 'Job timed out after 5 minutes' });
        } else if (final.status === 'failed') {
          out.push({ keyword, status: 'failed', error: final.error || 'Generation failed' });
        } else {
          const r = final.result || {};
          out.push({ keyword, status: 'success', post_id: r.post_id, slug: r.slug, title: r.title, word_count: r.word_count });
        }
      } catch (e) {
        out.push({ keyword, status: 'failed', error: e.message });
      }
    }
    setResults(out);
    setStep(4);
    setGenerating(false);
  };

  const reset = () => {
    setStep(1);
    setIndustry('');
    setRecommendations([]);
    setSelectedKeywords([]);
    setResults([]);
    setError('');
  };

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-[#5B22D6]" />
            AI Blog Generator
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create SEO-optimised drafts from industry-trending keywords. EN + DE auto-translated.
          </p>
        </div>
        {onNavigateToBlog && (
          <Button variant="outline" onClick={onNavigateToBlog} data-testid="ai-gen-back-to-blogs">
            ← Back to blogs
          </Button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, label: 'Industry' },
          { num: 2, label: 'Topics' },
          { num: 3, label: 'Generate' },
          { num: 4, label: 'Review' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className={`flex flex-col items-center ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
                step >= s.num ? 'bg-[#5B22D6] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s.num}
              </div>
              <span className="text-xs mt-1 text-gray-600">{s.label}</span>
            </div>
            {idx < 3 && <div className={`w-16 h-1 mx-2 ${step > s.num ? 'bg-[#5B22D6]' : 'bg-gray-300'}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800" data-testid="ai-gen-error">
          {error}
        </div>
      )}

      {/* Step 1: Industry */}
      {step === 1 && (
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-[#5B22D6]" />
            <h2 className="text-xl font-bold">Select industry focus</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Choose an industry to get keyword recommendations, or "General" for mixed topics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.value}
                onClick={() => setIndustry(ind.value)}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  industry === ind.value
                    ? 'border-[#5B22D6] bg-[#5B22D6]/10 shadow-md'
                    : `${ind.color} hover:shadow-md`
                }`}
                data-testid={`industry-${ind.value}`}
              >
                <div className="font-semibold text-gray-900">{ind.label}</div>
                <div className="text-xs text-gray-600 mt-1">{ind.hint}</div>
              </button>
            ))}
          </div>
          <Button
            onClick={fetchKeywords}
            disabled={!industry || generating}
            className="w-full bg-[#5B22D6] hover:bg-[#3F2BD9] text-white py-5"
            data-testid="ai-gen-fetch-keywords"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analysing keywords…</>
            ) : (
              <><TrendingUp className="w-4 h-4 mr-2" /> Get keyword recommendations</>
            )}
          </Button>
        </Card>
      )}

      {/* Step 2: Keywords + steering */}
      {step === 2 && (
        <div>
          <Card className="p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Recommended keywords</h2>
                <p className="text-sm text-gray-600">
                  Select up to 10 keywords. Each becomes a separate draft.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#5B22D6]" data-testid="selected-count">{selectedKeywords.length}</div>
                <div className="text-xs text-gray-500">selected</div>
              </div>
            </div>
          </Card>

          <div className="mb-5">
            <AISteeringPanel
              value={steering}
              onChange={setSteering}
              token={token}
              subtitle="Applied to every draft below."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 mb-5">
            {recommendations.map((rec) => {
              const isSelected = selectedKeywords.includes(rec.keyword);
              return (
                <Card
                  key={rec.keyword}
                  className={`p-5 cursor-pointer transition-all ${
                    isSelected ? 'border-2 border-[#5B22D6] bg-[#5B22D6]/10' : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleKeyword(rec.keyword)}
                  data-testid={`kw-${rec.keyword.replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${difficultyClass(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Keyword: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{rec.keyword}</span>
                      </div>
                      <div className="flex items-center gap-5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{rec.search_volume.toLocaleString()}</span>
                          <span>searches/mo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-semibold text-gray-900">~{rec.estimated_traffic}</span>
                          <span>est. visitors</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-[#5B22D6] shrink-0" />}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              ← Back
            </Button>
            <Button
              onClick={generateDrafts}
              disabled={selectedKeywords.length === 0 || generating}
              className="flex-1 bg-[#5B22D6] hover:bg-[#3F2BD9] text-white py-5"
              data-testid="ai-gen-generate-btn"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate {selectedKeywords.length} draft{selectedKeywords.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Generating */}
      {step === 3 && (
        <Card className="p-12 text-center" data-testid="ai-gen-generating">
          <div className="flex flex-col items-center">
            <Loader2 className="w-14 h-14 text-[#5B22D6] animate-spin mb-5" />
            <h2 className="text-xl font-bold mb-2">Generating drafts…</h2>
            <p className="text-sm text-gray-600 mb-4">
              Creating {selectedKeywords.length} SEO-optimised draft{selectedKeywords.length !== 1 ? 's' : ''} with auto EN/DE translation.
            </p>
            <p className="text-xs text-gray-500">~30–60 seconds per draft.</p>
          </div>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div>
          <Card className="p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Generation complete</h2>
                <p className="text-sm text-gray-600">
                  {results.filter((r) => r.status === 'success').length} of {results.length} drafts created successfully
                </p>
              </div>
              {onNavigateToBlog && (
                <Button onClick={onNavigateToBlog} className="bg-[#5B22D6] hover:bg-[#3F2BD9] text-white" data-testid="ai-gen-view-drafts">
                  View all drafts <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 mb-5">
            {results.map((res) => (
              <Card key={res.keyword} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {res.status === 'success'
                        ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                      <h3 className="font-semibold text-gray-900">
                        {res.status === 'success' ? res.title : res.keyword}
                      </h3>
                    </div>
                    {res.status === 'success' ? (
                      <div className="flex items-center gap-3 text-xs text-gray-600 ml-8">
                        <span>Keyword: <span className="font-mono">{res.keyword}</span></span>
                        <span>•</span>
                        <span>{res.word_count} words</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">Draft saved</span>
                      </div>
                    ) : (
                      <div className="text-xs text-rose-700 ml-8">Error: {res.error}</div>
                    )}
                  </div>
                  {res.status === 'success' && onEditDraft && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditDraft(res.slug)}
                      data-testid={`edit-draft-${res.slug}`}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={reset} className="flex-1">
              Generate more
            </Button>
            {onNavigateToBlog && (
              <Button onClick={onNavigateToBlog} className="flex-1 bg-[#5B22D6] hover:bg-[#3F2BD9] text-white">
                Go to blog admin
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
