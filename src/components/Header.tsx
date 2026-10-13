import React, { useState } from 'react';
import { BrandConfig } from '../types/config';
import { LanguageInfo } from '../data/translationsData';

interface HeaderProps {
  brand: BrandConfig;
  title: string;
  currentLangInfo: LanguageInfo;
  onOpenLanguageModal: () => void;
  onOpenConfigModal: () => void;
  t: (key: string, fallback?: string) => string;
}

export const Header: React.FC<HeaderProps> = ({
  brand,
  title,
  currentLangInfo,
  onOpenLanguageModal,
  onOpenConfigModal,
  t
}) => {
  const [imgError, setImgError] = useState(false);

  // Determine logo source
  const iconSrc = brand.icon || 'https://cdn.jsdelivr.net/gh/selfhst/icons/png/playstation-light.png';
  const resolvedIcon = iconSrc.startsWith('assets/') ? `/${iconSrc}` : iconSrc;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-12 pt-2">
      {/* Brand & App Title */}
      <div className="flex items-center gap-3.5 group">
        <div 
          tabIndex={0}
          role="button"
          onClick={onOpenConfigModal}
          title="Paramètres / Configuration"
          className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#173866] to-[#0a162b] border border-[#43e0e0]/30 shadow-lg shadow-cyan-500/10 flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        >
          {brand.iconType === 'fontawesome' ? (
            <i className={`${brand.icon || 'fa-brands fa-playstation'} text-xl text-[#43e0e0]`} />
          ) : !imgError ? (
            <img
              src={resolvedIcon}
              alt="Brand Logo"
              className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(67,224,224,0.6)]"
              onError={() => {
                if (brand.localAssetFallback && !imgError) {
                  setImgError(true);
                } else {
                  setImgError(true);
                }
              }}
            />
          ) : (
            <i className="fa-brands fa-playstation text-xl text-[#43e0e0]" />
          )}
          {/* Subtle glow edge */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-400/10 to-blue-500/20 pointer-events-none" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white drop-shadow-sm flex items-center">
              <span>evo</span>
              <span className="text-[#38bdf8] drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]">X</span>
              <span className="ml-1.5 font-light text-slate-300 text-xs sm:text-sm tracking-normal capitalize">Start Page Browser</span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
            PlayStation®5 Web Experience
          </p>
        </div>
      </div>

      {/* Header Actions: Language button (replacing PS5 - QUICK ACCESS) and Quick Config button */}
      <div className="flex items-center gap-2.5">
        {/* Language Selector Button */}
        <button
          id="btn-language-selector"
          type="button"
          onClick={onOpenLanguageModal}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-[#162744] active:bg-[#1f3863] border border-blue-400/25 hover:border-cyan-400/60 text-slate-200 hover:text-white transition-all shadow-md hover:shadow-cyan-500/10 cursor-pointer focus:outline-none"
          aria-label={t('selectLanguage', 'Choisir la langue')}
          title={t('selectLanguage', 'Choisir la langue')}
        >
          <span className="text-lg leading-none" role="img" aria-hidden="true">
            {currentLangInfo.flag}
          </span>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] font-bold tracking-wide uppercase text-cyan-300">
              {currentLangInfo.code.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {currentLangInfo.name}
            </span>
          </div>
          <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5" />
        </button>

        {/* Config / Settings Button */}
        <button
          type="button"
          onClick={onOpenConfigModal}
          className="p-2 w-9 h-9 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 active:bg-slate-700 border border-slate-700/60 hover:border-blue-400/50 text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-center cursor-pointer focus:outline-none"
          title={t('settings', 'Paramètres & config.json')}
          aria-label="Settings"
        >
          <i className="fa-solid fa-gear text-sm" />
        </button>
      </div>
    </header>
  );
};
