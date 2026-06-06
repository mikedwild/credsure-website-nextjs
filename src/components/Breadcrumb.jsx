"use client";
import React from 'react';
import { useLocation } from '@/lib/router-shim';
import { useTranslation } from '@/lib/useTranslation';
import { ChevronRight, Home } from 'lucide-react';
import { useLocalizedNavigate } from '@/utils/useLocalizedNavigate';

export const Breadcrumb = () => {
  const t = useTranslation();
  const navigate = useLocalizedNavigate();
  const location = useLocation();

  // Parse pathname into breadcrumb segments
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Strip the locale prefix (en/de) from the visible breadcrumb path —
  // it's a routing concern, not a place users navigate to. Click targets
  // keep the locale prefix so navigation stays language-aware.
  const langCodes = ['en', 'de'];
  if (pathSegments.length === 0) return null;
  if (pathSegments.length === 1 && langCodes.includes(pathSegments[0])) return null;
  const visibleSegments = pathSegments.filter(s => !langCodes.includes(s));
  const langPrefix = langCodes.includes(pathSegments[0]) ? `/${pathSegments[0]}` : '';

  // Map routes to translated labels
  const getLabel = (segment) => {
    const labelMap = {
      'blog': t('nav.blog'),
      'about': t('nav.about'),
      'solutions': t('nav.solutions'),
      'resources': t('nav.resources'),
      'pricing': t('nav.pricing'),
      'customer-success': t('nav.customerSuccess'),
      'privacy': t('footer.links.privacy'),
      'terms': t('footer.links.terms'),
      'use-cases': 'Use Cases',
      'course-completion': 'Course Completion',
      'professional-licenses': 'Professional Licenses',
      'member-credentials': 'Member Credentials',
      'scale-program': 'Scale Your Program',
      'increase-engagement': 'Increase Engagement',
      'save-time': 'Save Time',
      'features': 'Features'
    };

    return labelMap[segment] || segment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="bg-slate-50/50 border-b border-slate-200"
    >
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-3">
        <ol className="flex items-center gap-2 text-sm">
          {/* Home */}
          <li>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-slate-600 hover:text-[#5B22D6] transition-colors group"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t('breadcrumb.home')}</span>
            </button>
          </li>

          {/* Path Segments — locale segment skipped; click targets keep the
              locale prefix so navigation stays language-aware. */}
          {visibleSegments.map((segment, index) => {
            const path = `${langPrefix}/${visibleSegments.slice(0, index + 1).join('/')}`;
            const isLast = index === visibleSegments.length - 1;

            return (
              <li key={path} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400" />
                {isLast ? (
                  <span className="text-slate-900 font-medium">
                    {getLabel(segment)}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(path)}
                    className="text-slate-600 hover:text-[#5B22D6] transition-colors"
                  >
                    {getLabel(segment)}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
