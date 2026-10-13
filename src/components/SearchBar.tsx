import React, { useState, useRef } from 'react';

interface SearchBarProps {
  searchEngine: string;
  onEngineChange?: (newEngine: string) => void;
  t: (key: string, fallback?: string) => string;
}

const ENGINES = [
  { name: 'Google', icon: 'fa-brands fa-google', template: 'https://www.google.com/search?q={query}' },
  { name: 'Bing', icon: 'fa-solid fa-magnifying-glass', template: 'https://www.bing.com/search?q={query}' },
  { name: 'DuckDuckGo', icon: 'fa-solid fa-shield-halved', template: 'https://duckduckgo.com/?q={query}' },
  { name: 'YouTube', icon: 'fa-brands fa-youtube', template: 'https://www.youtube.com/results?search_query={query}' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ searchEngine, onEngineChange, t }) => {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(searchEngine || ENGINES[0].template);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate URL vs search query
  const isValidUrl = (s: string): string | null => {
    const trimmed = (s || '').trim();
    if (!trimmed) return null;
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      try {
        const u = new URL(trimmed);
        if (['http:', 'https:'].includes(u.protocol)) return u.href;
      } catch (e) {
        return null;
      }
    }
    if (trimmed.includes(' ') || !trimmed.includes('.')) return null;
    try {
      return new URL('https://' + trimmed).href;
    } catch (e) {
      return null;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    const directUrl = isValidUrl(clean);
    if (directUrl) {
      window.location.assign(directUrl);
      return;
    }

    const template = selectedEngine || searchEngine || ENGINES[0].template;
    const finalUrl = template.replace('{query}', encodeURIComponent(clean));
    window.location.assign(finalUrl);
  };

  return (
    <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
      <form
        onSubmit={handleSearch}
        className="relative flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/60 hover:border-cyan-500/50 rounded-2xl shadow-xl shadow-cyan-950/20 backdrop-blur-md transition-all focus-within:border-cyan-400 focus-within:shadow-[0_0_30px_rgba(56,189,248,0.25)]"
      >
        <div className="pl-3 sm:pl-4 text-cyan-400 text-lg flex items-center">
          <i className="fa-solid fa-magnifying-glass" />
        </div>

        <input
          id="search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder', 'Entrer une URL ou rechercher sur le Web…')}
          aria-label={t('searchLabel', 'URL ou recherche')}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="flex-1 min-w-0 bg-transparent border-0 py-2.5 sm:py-3.5 px-2 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer focus:outline-none"
            title="Effacer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        )}

        {/* Engine switcher quick badges */}
        <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-2 pr-1">
          {ENGINES.map((eng) => {
            const isCurrent = selectedEngine === eng.template;
            return (
              <button
                key={eng.name}
                type="button"
                onClick={() => {
                  setSelectedEngine(eng.template);
                  if (onEngineChange) onEngineChange(eng.template);
                }}
                className={`p-1.5 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer focus:outline-none ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Moteur : ${eng.name}`}
              >
                <i className={`${eng.icon} text-xs`} />
                <span className="hidden md:inline">{eng.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:from-cyan-500 active:to-blue-600 text-slate-950 font-bold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md shadow-cyan-500/25 cursor-pointer focus:outline-none flex items-center gap-1.5"
        >
          <span>{t('go', 'GO ↗')}</span>
        </button>
      </form>

      <div className="text-center text-[11px] sm:text-xs text-slate-400 mt-2 px-2">
        <span>{t('searchHint', 'Saisissez une URL ou un terme de recherche, puis appuyez sur Entrée.')}</span>
      </div>
    </div>
  );
};
