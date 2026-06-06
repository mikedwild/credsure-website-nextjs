"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { X, Shield, BarChart3, Target, User } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from '../ui/button';
import { CookieToggle } from './CookieToggle';

export const CookiePreferencesModal = ({ preferences, onToggle, onAcceptAll, onRejectAll, onSave, onClose }) => {
  const t = useTranslation();

  const categories = [
    {
      key: 'necessary',
      icon: Shield,
      gradient: 'bg-[#5B22D6]',
      hoverBorder: '',
      alwaysActive: true,
    },
    {
      key: 'analytics',
      icon: BarChart3,
      gradient: 'bg-gradient-to-br from-[#E22B8A] to-[#B82BC4]',
      hoverBorder: 'hover:border-[#E22B8A]',
      toggleColor: 'bg-[#E22B8A]',
    },
    {
      key: 'marketing',
      icon: Target,
      gradient: 'bg-gradient-to-br from-[#B82BC4] to-[#5B22D6]',
      hoverBorder: 'hover:border-[#B82BC4]',
      toggleColor: 'bg-[#B82BC4]',
    },
    {
      key: 'personalization',
      icon: User,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
      hoverBorder: 'hover:border-[#E22B8A]',
      toggleColor: 'bg-emerald-500',
    },
  ];

  return (
    <div data-testid="cookie-preferences-modal" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white  rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white  border-b border-slate-200  px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-2xl font-bold text-slate-900  font-heading">{t('cookies.customize')}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 :bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-600 " />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className={`border border-slate-200  rounded-2xl p-6 ${cat.alwaysActive ? 'bg-slate-50 ' : ''} ${cat.hoverBorder || ''} transition-colors`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 ${cat.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900  mb-1">
                        {t(`cookies.${cat.key}`)}
                      </h4>
                      <p className="text-sm text-slate-600 ">
                        {t(`cookies.${cat.key}Desc`)}
                      </p>
                    </div>
                  </div>
                  {cat.alwaysActive ? (
                    <div className="px-3 py-1 bg-[#5B22D6] text-white text-xs font-bold rounded-full ml-4">
                      {t('cookies.acceptAll') === 'Alle akzeptieren' ? 'Immer aktiv' : 'Always Active'}
                    </div>
                  ) : (
                    <CookieToggle
                      enabled={preferences[cat.key]}
                      color={cat.toggleColor}
                      onChange={() => onToggle(cat.key)}
                      testId={`cookie-${cat.key}-toggle`}
                    />
                  )}
                </div>
              </div>
            );
          })}

          <div className="border-t border-slate-200  pt-6">
            <p className="text-sm text-slate-600 ">
              <a href="/privacy" className="text-[#5B22D6]  hover:underline font-semibold">{t('footer.links.privacy')}</a>
              {' | '}
              <a href="/terms" className="text-[#5B22D6]  hover:underline font-semibold">{t('footer.links.terms')}</a>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50  border-t border-slate-200  px-8 py-6 flex flex-col sm:flex-row gap-3 rounded-b-3xl">
          <Button onClick={onRejectAll} variant="outline" className="flex-1 border-2 border-slate-300  text-slate-700  py-6 rounded-xl">
            {t('cookies.rejectAll')}
          </Button>
          <Button onClick={onSave} className="flex-1 brand-gradient hover:opacity-90 text-white py-6 rounded-xl font-semibold">
            {t('cookies.savePreferences')}
          </Button>
          <Button onClick={onAcceptAll} className="flex-1 bg-[#5B22D6] hover:bg-[#3F2BD9] text-white py-6 rounded-xl font-semibold">
            {t('cookies.acceptAll')}
          </Button>
        </div>
      </div>
    </div>
  );
};

CookiePreferencesModal.propTypes = {
  preferences: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onAcceptAll: PropTypes.func.isRequired,
  onRejectAll: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
