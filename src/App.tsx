/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { useConfig } from './hooks/useConfig';
import { useTranslation } from './hooks/useTranslation';
import { useGamepad } from './hooks/useGamepad';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { ShortcutGrid } from './components/ShortcutGrid';
import { Footer } from './components/Footer';
import { LanguageModal } from './components/LanguageModal';
import { ShortcutModal } from './components/ShortcutModal';
import { ConfigModal } from './components/ConfigModal';
import { ShortcutItem } from './types/config';

export default function App() {
  const {
    config,
    saveConfig,
    setLanguage,
    addShortcut,
    updateShortcut,
    deleteShortcut,
    resetConfig
  } = useConfig();

  const { t, languages, currentLangInfo } = useTranslation(config.language || 'fr');

  // Modals and editing state
  const [isEditingShortcuts, setIsEditingShortcuts] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [editingShortcutIndex, setEditingShortcutIndex] = useState(-1);
  const [selectedShortcutForEdit, setSelectedShortcutForEdit] = useState<ShortcutItem | null>(null);

  // Focus helper
  const handleFocusSearch = () => {
    const el = document.getElementById('search-input') as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.select();
    }
  };

  // Close any modal handler
  const handleCloseAnyModal = () => {
    if (isLangModalOpen) setIsLangModalOpen(false);
    else if (isConfigModalOpen) setIsConfigModalOpen(false);
    else if (isShortcutModalOpen) setIsShortcutModalOpen(false);
    else if (isEditingShortcuts) setIsEditingShortcuts(false);
  };

  // Cycle languages with L1/R1
  const handleCycleLanguage = (direction: 'prev' | 'next') => {
    const currentIndex = languages.findIndex(l => l.code === (config.language || 'fr'));
    if (currentIndex === -1) return;
    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % languages.length
      : (currentIndex - 1 + languages.length) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  // Gamepad controller listener (works silently with controller)
  useGamepad({
    onBack: handleCloseAnyModal,
    onSearch: handleFocusSearch,
    onEdit: () => setIsEditingShortcuts(prev => !prev),
    onPrevTab: () => handleCycleLanguage('prev'),
    onNextTab: () => handleCycleLanguage('next'),
  });

  // Global keyboard shortcuts (Escape to close modals, '/' to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseAnyModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLangModalOpen, isConfigModalOpen, isShortcutModalOpen, isEditingShortcuts]);

  // Sync document title with config
  useEffect(() => {
    document.title = config.title || 'evoX Start Page Browser';
  }, [config.title]);

  const handleOpenAddShortcut = () => {
    setEditingShortcutIndex(-1);
    setSelectedShortcutForEdit(null);
    setIsShortcutModalOpen(true);
  };

  const handleOpenEditShortcut = (index: number) => {
    setEditingShortcutIndex(index);
    setSelectedShortcutForEdit(config.shortcuts[index] || null);
    setIsShortcutModalOpen(true);
  };

  const handleSaveShortcut = (item: ShortcutItem) => {
    if (editingShortcutIndex >= 0) {
      updateShortcut(editingShortcutIndex, item);
    } else {
      addShortcut(item);
    }
  };

  return (
    <div className="relative min-h-screen text-[#f3f7ff] bg-ambient-lines flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Outer wrapper centered with safe responsive padding */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex-1 flex flex-col">
        {/* Header: Logo, Title, and Language Selector replacing Quick Access */}
        <Header
          brand={config.brand}
          title={config.title}
          currentLangInfo={currentLangInfo}
          onOpenLanguageModal={() => setIsLangModalOpen(true)}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          t={t}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center">
          {/* Hero Profile / Welcome */}
          <Hero profile={config.profile} t={t} />

          {/* Search bar with direct URL and search engines */}
          <SearchBar
            searchEngine={config.searchEngine}
            onEngineChange={(newEngine) => {
              saveConfig({ ...config, searchEngine: newEngine });
            }}
            t={t}
          />

          {/* Shortcuts Grid */}
          <ShortcutGrid
            shortcuts={config.shortcuts}
            isEditing={isEditingShortcuts}
            onToggleEdit={() => setIsEditingShortcuts(!isEditingShortcuts)}
            onOpenAddModal={handleOpenAddShortcut}
            onOpenEditModal={handleOpenEditShortcut}
            onDeleteShortcut={deleteShortcut}
            t={t}
          />
        </main>

        {/* Configurable Footer with PlayStation & GitHub badges, text, and links */}
        <Footer
          footer={config.footer}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          t={t}
        />
      </div>

      {/* Language Selector Modal (30 languages) */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        languages={languages}
        currentLang={config.language || 'fr'}
        onSelectLanguage={setLanguage}
        t={t}
      />

      {/* Add / Edit Shortcut Modal */}
      <ShortcutModal
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
        onSave={handleSaveShortcut}
        initialItem={selectedShortcutForEdit}
        isEditingIndex={editingShortcutIndex}
        t={t}
      />

      {/* Config.json Live Editor & Customizer Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={saveConfig}
        onResetDefault={resetConfig}
        t={t}
      />
    </div>
  );
}
