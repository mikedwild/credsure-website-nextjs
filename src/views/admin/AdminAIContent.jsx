"use client";
import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, FileText, TrendingUp, Tag, ArrowRight, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function IntentBadge({ intent }) {
  const colors = {
    informational: 'bg-sky-500/20 text-sky-400',
    commercial: 'bg-emerald-100 text-emerald-800',
    navigational: 'bg-violet-500/20 text-violet-400',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[intent] || 'bg-slate-700 text-gray-500 '}`}>
      {intent}
    </span>
  );
}

function VolumeBadge({ volume }) {
  const colors = {
    high: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-amber-500/20 text-amber-400',
    low: 'bg-slate-500/20 text-gray-500 ',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${colors[volume] || 'bg-slate-700 text-gray-500 '}`}>
      <TrendingUp className="w-2.5 h-2.5" /> {volume}
    </span>
  );
}

function TopicCard({ topic, onGenerate, generating, generatedSlug }) {
  const isGenerated = !!generatedSlug;

  return (
    <div className={`bg-white  border rounded-2xl p-5 transition-all ${isGenerated ? 'border-emerald-500/50 ' : 'border-gray-200  hover:border-[#5B22D6]/30 :border-slate-600'}`} data-testid="ai-topic-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-900  leading-snug flex-1">{topic.topic}</h3>
        <div className="flex gap-1.5 flex-shrink-0">
          <IntentBadge intent={topic.search_intent} />
          <VolumeBadge volume={topic.estimated_volume} />
        </div>
      </div>

      <p className="text-xs text-gray-600  mb-3 leading-relaxed">{topic.excerpt}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(topic.keywords || []).map(kw => (
          <span key={kw} className="text-[10px] px-2 py-0.5 bg-gray-100  text-gray-600  rounded-md flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" /> {kw}
          </span>
        ))}
      </div>

      {topic.rationale && (
        <p className="text-[10px] text-gray-500  italic mb-3">{topic.rationale}</p>
      )}

      <div className="flex items-center gap-3">
        {isGenerated ? (
          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Saved as draft
          </span>
        ) : (
          <Button
            onClick={() => onGenerate(topic)}
            disabled={generating}
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-gray-900  text-xs px-4"
            data-testid="ai-generate-btn"
          >
            {generating ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-3.5 h-3.5 mr-1.5" /> Generate Draft</>
            )}
          </Button>
        )}
        {topic.category && (
          <span className="text-[10px] text-gray-600  ml-auto">{topic.category}</span>
        )}
      </div>
    </div>
  );
}

export default function AdminAIContent({ token, onNavigateToBlog }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingTopic, setGeneratingTopic] = useState(null);
  const [generatedSlugs, setGeneratedSlugs] = useState({});
  const [genMessage, setGenMessage] = useState('');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');
    setTopics([]);
    try {
      const res = await fetch(`${API_URL}/api/admin/ai/recommend`, { method: 'POST', headers });
      const data = await res.json();
      if (res.ok) {
        setTopics(data.topics || []);
        if (!data.topics?.length) setError('No recommendations generated. Try again.');
      } else {
        setError(data.detail || 'Failed to generate recommendations');
      }
    } catch (e) {
      setError(`Network error: ${e.message}`);
    }
    setLoading(false);
  }, [token]);

  const handleGenerate = useCallback(async (topic) => {
    setGeneratingTopic(topic.topic);
    setGenMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/ai/generate`, {
        method: 'POST', headers,
        body: JSON.stringify({
          topic: topic.topic,
          keywords: topic.keywords || [],
          category: topic.category || 'Uncategorized',
          excerpt: topic.excerpt || '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedSlugs(prev => ({ ...prev, [topic.topic]: data.post?.slug }));
        setGenMessage(`"${data.post?.title}" generated and saved as draft (EN + DE)`);
      } else {
        setError(data.detail || 'Generation failed');
      }
    } catch (e) {
      setError(`Network error contacting backend: ${e.message}. Tip: long blog drafts can exceed the 100s proxy timeout — retry with a shorter topic, or use the new AI Generator wizard which streams results.`);
    }
    setGeneratingTopic(null);
  }, [token]);

  return (
    <div className="space-y-6" data-testid="admin-ai-content">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900  flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" /> AI Content Engine
          </h2>
          <p className="text-sm text-gray-500  mt-1">
            Get AI-recommended blog topics based on search volume, then auto-generate full SEO-optimized posts in both languages.
          </p>
        </div>
        <Button
          onClick={fetchRecommendations}
          disabled={loading}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
          data-testid="ai-recommend-btn"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : topics.length > 0 ? (
            <><RefreshCw className="w-4 h-4 mr-2" /> Refresh Topics</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Get Recommendations</>
          )}
        </Button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {genMessage && (
        <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {genMessage}
        </div>
      )}

      {/* Empty state */}
      {!loading && topics.length === 0 && !error && (
        <div className="text-center py-16 bg-gray-50  border border-gray-200  border-dashed rounded-2xl">
          <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-gray-500  mb-2">No recommendations yet</h3>
          <p className="text-xs text-gray-500  max-w-md mx-auto mb-6">
            Click "Get Recommendations" to have AI analyze your existing content and suggest high-traffic blog topics tailored to CredSure's niche.
          </p>
          <Button onClick={fetchRecommendations} disabled={loading} className="bg-violet-600 text-white" data-testid="ai-recommend-empty-btn">
            <Sparkles className="w-4 h-4 mr-2" /> Get Recommendations
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white  border border-gray-200  rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-full mb-2" />
              <div className="h-3 bg-slate-800 rounded w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-5 bg-slate-800 rounded-full w-16" />
                <div className="h-5 bg-slate-800 rounded-full w-16" />
                <div className="h-5 bg-slate-800 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Topic cards */}
      {topics.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {topics.map((topic, idx) => (
            <TopicCard
              key={`${topic.topic}-${idx}`}
              topic={topic}
              onGenerate={handleGenerate}
              generating={generatingTopic === topic.topic}
              generatedSlug={generatedSlugs[topic.topic]}
            />
          ))}
        </div>
      )}

      {/* Generated posts summary */}
      {Object.keys(generatedSlugs).length > 0 && (
        <div className="bg-white  border border-gray-200  rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900  mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" /> Generated Drafts ({Object.keys(generatedSlugs).length})
          </h3>
          <p className="text-xs text-gray-500  mb-3">
            All posts have been auto-translated to both English and German. Review them in the Blog Posts tab.
          </p>
          {onNavigateToBlog && (
            <Button
              onClick={() => onNavigateToBlog()}
              variant="outline"
              className="border-gray-300  text-gray-600  hover:text-white"
              data-testid="ai-view-drafts-btn"
            >
              <ArrowRight className="w-4 h-4 mr-2" /> View Draft Posts
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
