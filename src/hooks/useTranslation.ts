import { useState, useEffect } from 'react';
import { LANGUAGES, DEFAULT_TRANSLATIONS, LanguageInfo } from '../data/translationsData';

export function useTranslation(currentLang: string) {
  const [langData, setLangData] = useState<Record<string, any>>(() => {
    return DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['fr'] || {};
  });

  useEffect(() => {
    // Immediate fallback from bundled data
    const bundled = DEFAULT_TRANSLATIONS[currentLang] || DEFAULT_TRANSLATIONS['fr'] || {};
    setLangData(bundled);

    // Try fetching external JSON from /translations/${currentLang}.json
    let isCancelled = false;
    async function loadJson() {
      try {
        const res = await fetch(`/translations/${currentLang}.json`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled) {
            setLangData(prev => ({ ...prev, ...json }));
          }
        }
      } catch (err) {
        // Ignored, bundled fallback already active
      }
    }

    loadJson();

    // Set document lang & text direction (RTL for Arabic/Hebrew)
    const langInfo = LANGUAGES.find(l => l.code === currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = langInfo?.dir || 'ltr';

    return () => {
      isCancelled = true;
    };
  }, [currentLang]);

  const t = (key: string, fallbackText?: string): string => {
    if (!key) return '';
    // Support nested keys like gamepadHints.select
    const parts = key.split('.');
    let val: any = langData;
    for (const part of parts) {
      if (val && typeof val === 'object' && part in val) {
        val = val[part];
      } else {
        val = undefined;
        break;
      }
    }

    if (typeof val === 'string') return val;

    // Fallback to FR or EN default translations
    const frData = DEFAULT_TRANSLATIONS['fr'] || {};
    let frVal: any = frData;
    for (const part of parts) {
      if (frVal && typeof frVal === 'object' && part in frVal) {
        frVal = frVal[part];
      } else {
        frVal = undefined;
        break;
      }
    }
    if (typeof frVal === 'string') return frVal;

    return fallbackText || key;
  };

  const currentLangInfo: LanguageInfo = LANGUAGES.find(l => l.code === currentLang) || {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    dir: 'ltr'
  };

  return { t, languages: LANGUAGES, currentLangInfo };
}
