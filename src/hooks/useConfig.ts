import { useState, useEffect, useCallback } from 'react';
import { AppConfig, ShortcutItem, FooterBadge } from '../types/config';
import { DEFAULT_CONFIG } from '../data/defaultConfig';

const LOCAL_STORAGE_KEY = 'evox_browser_config_v5';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Load config on mount
  useEffect(() => {
    async function load() {
      let loadedConfig = { ...DEFAULT_CONFIG };

      // Try fetching from public config.json or json/config.json
      try {
        const res = await fetch('/config.json', { cache: 'no-store' });
        if (res.ok) {
          const fetched = await res.json();
          loadedConfig = {
            ...DEFAULT_CONFIG,
            ...fetched,
            brand: { ...DEFAULT_CONFIG.brand, ...(fetched.brand || {}) },
            profile: { ...DEFAULT_CONFIG.profile, ...(fetched.profile || {}) },
            appearance: { ...DEFAULT_CONFIG.appearance, ...(fetched.appearance || {}) },
            footer: {
              ...DEFAULT_CONFIG.footer,
              ...(fetched.footer || {}),
              badges: Array.isArray(fetched.footer?.badges)
                ? fetched.footer.badges
                : DEFAULT_CONFIG.footer.badges,
              links: Array.isArray(fetched.footer?.links)
                ? fetched.footer.links
                : DEFAULT_CONFIG.footer.links
            },
            shortcuts: Array.isArray(fetched.shortcuts)
              ? fetched.shortcuts
              : DEFAULT_CONFIG.shortcuts,
            customShortcuts: Array.isArray(fetched.customShortcuts)
              ? fetched.customShortcuts
              : []
          };
        }
      } catch (err) {
        console.warn('Could not load /config.json, using defaults', err);
      }

      // Check localStorage for user overrides
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          loadedConfig = {
            ...loadedConfig,
            ...parsed,
            appearance: {
              ...loadedConfig.appearance,
              ...(parsed.appearance || {})
            },
            footer: {
              ...loadedConfig.footer,
              ...(parsed.footer || {})
            },
            shortcuts: Array.isArray(parsed.shortcuts) ? parsed.shortcuts : loadedConfig.shortcuts,
            customShortcuts: Array.isArray(parsed.customShortcuts) ? parsed.customShortcuts : (loadedConfig.customShortcuts || [])
          };
        }
      } catch (e) {
        console.warn('Could not read localStorage', e);
      }

      setConfig(loadedConfig);
      setLoading(false);
    }

    load();
  }, []);

  const saveConfig = useCallback((newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setConfig(prev => {
      const updated = { ...prev, language: lang };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Add custom shortcut to row 2
  const addCustomShortcut = useCallback((item: ShortcutItem) => {
    setConfig(prev => {
      const updatedCustom = [...(prev.customShortcuts || []), item];
      const updated = {
        ...prev,
        customShortcuts: updatedCustom
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Delete custom shortcut
  const deleteCustomShortcut = useCallback((index: number) => {
    setConfig(prev => {
      const updatedCustom = (prev.customShortcuts || []).filter((_, i) => i !== index);
      const updated = {
        ...prev,
        customShortcuts: updatedCustom
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Update custom shortcut
  const updateCustomShortcut = useCallback((index: number, item: ShortcutItem) => {
    setConfig(prev => {
      const list = [...(prev.customShortcuts || [])];
      list[index] = item;
      const updated = {
        ...prev,
        customShortcuts: list
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Official shortcuts operations (if user edits/deletes an official one)
  const deleteShortcut = useCallback((index: number) => {
    setConfig(prev => {
      const updatedList = prev.shortcuts.filter((_, i) => i !== index);
      const updated = {
        ...prev,
        shortcuts: updatedList
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const updateShortcut = useCallback((index: number, item: ShortcutItem) => {
    setConfig(prev => {
      const updatedList = [...prev.shortcuts];
      updatedList[index] = item;
      const updated = {
        ...prev,
        shortcuts: updatedList
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Footer badges operations
  const updateFooterBadges = useCallback((badges: FooterBadge[]) => {
    setConfig(prev => {
      const updated = {
        ...prev,
        footer: {
          ...prev.footer,
          badges
        }
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const resetConfig = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    loading,
    saveConfig,
    setLanguage,
    addCustomShortcut,
    updateCustomShortcut,
    deleteCustomShortcut,
    deleteShortcut,
    updateShortcut,
    updateFooterBadges,
    resetConfig
  };
}
