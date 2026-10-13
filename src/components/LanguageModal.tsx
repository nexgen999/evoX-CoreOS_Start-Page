import React, { useState, useEffect, useRef } from 'react';
import { LanguageInfo } from '../data/translationsData';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: LanguageInfo[];
  currentLang: string;
  onSelectLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  languages,
  currentLang,
  onSelectLanguage,
  t
}) => {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = languages.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl max-h-[85vh] bg-[#0f172a] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-sm">
              <i className="fa-solid fa-globe" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t('selectLanguage', 'Choisir la langue')}
              </h2>
              <p className="text-xs text-slate-400">
                30 {t('languages', 'langues disponibles')} (JSON)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Search input inside modal */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="relative flex items-center">
            <i className="fa-solid fa-magnifying-glass absolute left-3 text-slate-400 text-xs" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher / Search language…"
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none" role="img" aria-hidden="true">
                    {lang.flag}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{lang.name}</span>
                      {lang.dir === 'rtl' && (
                        <span className="text-[9px] px-1 bg-slate-800 text-slate-400 rounded">RTL</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wide">
                      {lang.code}.json
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <span>{filtered.length} langue(s) affichée(s)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
          >
            {t('cancel', 'Fermer')}
          </button>
        </div>
      </div>
    </div>
  );
};
