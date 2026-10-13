import React, { useState } from 'react';
import { FooterConfig, FooterBadge } from '../types/config';

interface FooterProps {
  footer: FooterConfig;
  showConfigButtons?: boolean;
  onOpenConfigModal: () => void;
  t: (key: string, fallback?: string) => string;
}

export const Footer: React.FC<FooterProps> = ({ footer, showConfigButtons, onOpenConfigModal, t }) => {
  const badges = footer.badges || [];
  const links = footer.links || [];

  return (
    <footer className="mt-14 pt-8 pb-10 border-t border-slate-800/80">
      {/* Top section: Badges showcase */}
      {badges.length > 0 && (
        <div className="mb-8">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{t('badges', 'Badges & Écosystème')}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {badges.map((badge) => (
              <BadgeItem key={badge.id || badge.label} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Main footer info & links */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-400">
        <div className="text-center md:text-left">
          <div className="font-semibold text-slate-200 flex items-center justify-center md:justify-start gap-2 mb-1">
            <span>{footer.text || 'evoX Start Page Browser'}</span>
            <span className="text-cyan-400">◆</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {footer.copyright || 'PS5 Edition'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-lg">
            {footer.subtext || t('footer', 'Conçue pour une navigation simple à la manette.')}
          </p>
        </div>

        {/* Links and Config modal launcher */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((link, idx) => (
            <a
              key={`${link.name}-${idx}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1.5"
            >
              <span>{link.name}</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-70" />
            </a>
          ))}

          {showConfigButtons !== false && (
            <button
              type="button"
              onClick={onOpenConfigModal}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer focus:outline-none"
              title="Éditer footer et badges dans config.json"
            >
              <i className="fa-solid fa-sliders text-[10px]" />
              <span>{t('openConfig', 'CONFIG.JSON')}</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

interface BadgeItemProps {
  badge: FooterBadge;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge }) => {
  const [imgErr, setImgErr] = useState(false);

  const isRectangular = badge.style === 'rectangular' || !badge.style;
  const isPill = badge.style === 'pill';

  const defaultBg = badge.bgColor || (badge.id === 'playstation' ? '#003791' : '#161b22');
  const textColor = badge.textColor || '#ffffff';

  const content = (
    <div
      style={{
        backgroundColor: defaultBg,
        color: textColor,
        borderColor: badge.accentColor || 'rgba(255, 255, 255, 0.15)'
      }}
      className={`relative flex items-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg focus:outline-none ${
        isRectangular
          ? 'px-3 py-1.5 rounded-xl border'
          : isPill
          ? 'px-3.5 py-1 rounded-full border text-xs font-semibold'
          : 'px-2.5 py-1 rounded-lg border text-xs'
      }`}
    >
      {/* Badge Icon */}
      {badge.iconImage && !imgErr ? (
        <img
          src={badge.iconImage.startsWith('assets/') ? `/${badge.iconImage}` : badge.iconImage}
          alt={badge.label}
          className="w-5 h-5 object-contain"
          onError={() => setImgErr(true)}
        />
      ) : badge.icon ? (
        <i className={`${badge.icon} text-base`} />
      ) : null}

      {/* Badge Labels */}
      <div className="flex flex-col text-left leading-tight">
        <span className="text-xs font-black tracking-wide uppercase">
          {badge.label}
        </span>
        {badge.subLabel && (
          <span className="text-[9px] opacity-85 font-mono tracking-tight">
            {badge.subLabel}
          </span>
        )}
      </div>

      {badge.url && (
        <i className="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-60 ml-0.5" />
      )}
    </div>
  );

  if (badge.url) {
    return (
      <a
        href={badge.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none rounded-xl"
        title={`${badge.label} ${badge.subLabel ? '• ' + badge.subLabel : ''}`}
      >
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
};
