import React, { useState } from 'react';
import { ProfileConfig } from '../types/config';

interface HeroProps {
  profile: ProfileConfig;
  t: (key: string, fallback?: string) => string;
}

export const Hero: React.FC<HeroProps> = ({ profile, t }) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <section className="text-center mx-auto mb-7 sm:mb-9 transition-all">
      <div className="relative inline-block mb-3 sm:mb-4 group">
        <a 
          href={profile.github || 'https://github.com/nexgen999'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block rounded-full focus:outline-none"
          tabIndex={0}
          title={profile.name ? `Profil de ${profile.name}` : 'GitHub'}
        >
          <img
            src={!avatarError ? (profile.avatar || 'https://github.com/nexgen999.png') : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
            alt={profile.name || 'Profile Avatar'}
            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-3 border-cyan-400/80 shadow-[0_0_24px_rgba(56,189,248,0.35)] object-cover bg-slate-900 transition-transform duration-200 group-hover:scale-105"
            onError={() => setAvatarError(true)}
          />
          {profile.online !== false && (
            <span 
              className="absolute right-1 bottom-1 w-4 h-4 rounded-full bg-[#41e0ae] border-3 border-[#070b14] shadow-sm animate-pulse"
              title="Online"
            />
          )}
        </a>
      </div>

      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
        <span className="font-normal text-slate-200">{t('welcome', 'Bienvenue sur')}</span>{' '}
        <span className="text-white">evo</span>
        <span className="text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">X</span>
      </h2>

      <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto font-medium">
        {t('subtitle', 'Tout votre web, au même endroit.')}
      </p>
    </section>
  );
};
