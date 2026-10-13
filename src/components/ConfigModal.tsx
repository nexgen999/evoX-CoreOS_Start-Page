import React, { useState, useEffect } from 'react';
import { AppConfig, FooterBadge } from '../types/config';
import { exportGitHubZip } from '../utils/exportZip';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onResetDefault: () => void;
  t: (key: string, fallback?: string) => string;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefault,
  t
}) => {
  const [tab, setTab] = useState<'badges' | 'general' | 'json'>('badges');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // General settings
  const [title, setTitle] = useState('');
  const [brandIcon, setBrandIcon] = useState('');
  const [footerText, setFooterText] = useState('');
  const [footerSubtext, setFooterSubtext] = useState('');
  const [showConfigButtons, setShowConfigButtons] = useState(true);

  // Badges list & Badge editing state
  const [badges, setBadges] = useState<FooterBadge[]>([]);
  const [editingBadgeIndex, setEditingBadgeIndex] = useState<number | null>(null);
  const [editingBadgeData, setEditingBadgeData] = useState<FooterBadge | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(config.title || 'evoX Start Page Browser');
      setBrandIcon(config.brand?.icon || '');
      setFooterText(config.footer?.text || '');
      setFooterSubtext(config.footer?.subtext || '');
      setShowConfigButtons(config.appearance?.showConfigButtons ?? true);
      setBadges(config.footer?.badges ? JSON.parse(JSON.stringify(config.footer.badges)) : []);
      setJsonText(JSON.stringify(config, null, 2));
      setEditingBadgeIndex(null);
      setEditingBadgeData(null);
      setJsonError('');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Handle ZIP Export
  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const currentConfig: AppConfig = {
        ...config,
        title,
        brand: { ...config.brand, icon: brandIcon },
        footer: { ...config.footer, text: footerText, subtext: footerSubtext, badges },
        appearance: { ...config.appearance, showConfigButtons }
      };
      await exportGitHubZip(currentConfig);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la création du ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveAll = () => {
    const updated: AppConfig = {
      ...config,
      title,
      brand: {
        ...config.brand,
        icon: brandIcon
      },
      footer: {
        ...config.footer,
        text: footerText,
        subtext: footerSubtext,
        badges
      },
      appearance: {
        ...config.appearance,
        showConfigButtons
      }
    };
    onSaveConfig(updated);
    onClose();
  };

  // Badge edit actions
  const startEditBadge = (idx: number) => {
    setEditingBadgeIndex(idx);
    setEditingBadgeData({ ...badges[idx] });
  };

  const saveEditedBadge = () => {
    if (editingBadgeIndex === null || !editingBadgeData) return;
    const updated = [...badges];
    updated[editingBadgeIndex] = editingBadgeData;
    setBadges(updated);
    setEditingBadgeIndex(null);
    setEditingBadgeData(null);
  };

  const addNewBadge = (preset: 'playstation' | 'github' | 'discord' | 'custom') => {
    let newBadge: FooterBadge;
    if (preset === 'playstation') {
      newBadge = {
        id: 'ps-' + Date.now(),
        style: 'rectangular',
        label: 'PlayStation®',
        subLabel: 'PS5 BROWSER',
        icon: 'fa-brands fa-playstation',
        iconImage: 'https://cdn.jsdelivr.net/gh/selfhst/icons/png/playstation-light.png',
        url: 'https://www.playstation.com',
        bgColor: '#003791',
        textColor: '#ffffff',
        accentColor: '#0070d1',
        border: true
      };
    } else if (preset === 'github') {
      newBadge = {
        id: 'gh-' + Date.now(),
        style: 'rectangular',
        label: 'GitHub',
        subLabel: config.profile?.name || 'nexgen999',
        icon: 'fa-brands fa-github',
        url: `https://github.com/${config.profile?.name || 'nexgen999'}`,
        bgColor: '#161b22',
        textColor: '#e6edf3',
        accentColor: '#30363d',
        border: true
      };
    } else if (preset === 'discord') {
      newBadge = {
        id: 'dc-' + Date.now(),
        style: 'rectangular',
        label: 'Discord',
        subLabel: 'Communauté',
        icon: 'fa-brands fa-discord',
        url: 'https://discord.com',
        bgColor: '#5865F2',
        textColor: '#ffffff',
        accentColor: '#7289da',
        border: true
      };
    } else {
      newBadge = {
        id: 'custom-' + Date.now(),
        style: 'rectangular',
        label: 'Nouveau Badge',
        subLabel: 'Lien',
        icon: 'fa-solid fa-star',
        url: 'https://exemple.com',
        bgColor: '#0e1f38',
        textColor: '#38bdf8',
        accentColor: '#0284c7',
        border: true
      };
    }

    const updated = [...badges, newBadge];
    setBadges(updated);
    // Directly open editor for new badge
    setEditingBadgeIndex(updated.length - 1);
    setEditingBadgeData(newBadge);
  };

  const deleteBadge = (idx: number) => {
    setBadges(badges.filter((_, i) => i !== idx));
    if (editingBadgeIndex === idx) {
      setEditingBadgeIndex(null);
      setEditingBadgeData(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[92vh] bg-[#0c1527] border border-blue-500/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#0a1222]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-lg">
              <i className="fa-solid fa-sliders" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Panneau de Configuration & Export</span>
              </h2>
              <p className="text-xs text-slate-400">
                Éditeur de badges du footer, réglages et export GitHub Pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* BIG EXPORT BUTTON */}
            <button
              type="button"
              onClick={handleExportZip}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Génère un ZIP prêt pour GitHub Pages"
            >
              <i className="fa-solid fa-file-zipper text-sm" />
              <span>{isExporting ? 'Création du ZIP…' : 'Exporter pour GitHub (ZIP)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('badges')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'badges'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-award" />
            <span>Badges du Footer ({badges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'general'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-sliders" />
            <span>Titres & Affichage</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setJsonText(JSON.stringify({ ...config, footer: { ...config.footer, badges } }, null, 2));
              setTab('json');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'json'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-code" />
            <span>config.json</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {tab === 'badges' ? (
            <div className="space-y-6">
              {/* Add Badge Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <i className="fa-solid fa-plus-circle text-cyan-400" />
                  <span>Ajouter un badge rapide :</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addNewBadge('playstation')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#003791] text-white hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-brands fa-playstation" /> + PlayStation
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewBadge('github')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#161b22] text-white hover:bg-slate-800 cursor-pointer border border-slate-700 flex items-center gap-1.5"
                  >
                    <i className="fa-brands fa-github" /> + GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewBadge('discord')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#5865F2] text-white hover:bg-indigo-600 cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-brands fa-discord" /> + Discord
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewBadge('custom')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950 text-cyan-300 hover:bg-cyan-900 cursor-pointer border border-cyan-800 flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-star" /> + Personnalisé
                  </button>
                </div>
              </div>

              {/* Editing Form when a badge is selected */}
              {editingBadgeData && editingBadgeIndex !== null && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1c33] border-2 border-cyan-500/60 shadow-xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                    <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                      <i className="fa-solid fa-pen" />
                      <span>Modifier le badge #{editingBadgeIndex + 1} ({editingBadgeData.label})</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingBadgeIndex(null); setEditingBadgeData(null); }}
                        className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={saveEditedBadge}
                        className="text-xs px-3 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold"
                      >
                        ✓ Valider la modification
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Titre principal</label>
                      <input
                        type="text"
                        value={editingBadgeData.label}
                        onChange={(e) => setEditingBadgeData({ ...editingBadgeData, label: e.target.value })}
                        placeholder="PlayStation®"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Sous-titre (facultatif)</label>
                      <input
                        type="text"
                        value={editingBadgeData.subLabel || ''}
                        onChange={(e) => setEditingBadgeData({ ...editingBadgeData, subLabel: e.target.value })}
                        placeholder="PS5 BROWSER / nexgen999"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Icône (Font Awesome ou image)</label>
                      <input
                        type="text"
                        value={editingBadgeData.icon || ''}
                        onChange={(e) => setEditingBadgeData({ ...editingBadgeData, icon: e.target.value })}
                        placeholder="fa-brands fa-playstation / fa-brands fa-github"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Lien URL au clic</label>
                      <input
                        type="text"
                        value={editingBadgeData.url || ''}
                        onChange={(e) => setEditingBadgeData({ ...editingBadgeData, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Couleur de fond (Hex)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingBadgeData.bgColor || '#003791'}
                          onChange={(e) => setEditingBadgeData({ ...editingBadgeData, bgColor: e.target.value })}
                          className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={editingBadgeData.bgColor || ''}
                          onChange={(e) => setEditingBadgeData({ ...editingBadgeData, bgColor: e.target.value })}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Couleur du texte & Style</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingBadgeData.textColor || '#ffffff'}
                          onChange={(e) => setEditingBadgeData({ ...editingBadgeData, textColor: e.target.value })}
                          className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <select
                          value={editingBadgeData.style || 'rectangular'}
                          onChange={(e) => setEditingBadgeData({ ...editingBadgeData, style: e.target.value as any })}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                        >
                          <option value="rectangular">Rectangulaire (Recommandé)</option>
                          <option value="pill">Pilule arrondie</option>
                          <option value="badge">Badge simple</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Live Badge Preview */}
                  <div className="p-3 bg-slate-950/60 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-400">Aperçu direct :</span>
                    <div
                      style={{
                        backgroundColor: editingBadgeData.bgColor || '#003791',
                        color: editingBadgeData.textColor || '#fff',
                        borderColor: editingBadgeData.accentColor || 'rgba(255,255,255,0.2)'
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow"
                    >
                      {editingBadgeData.icon && <i className={`${editingBadgeData.icon} text-base`} />}
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-xs font-black uppercase">{editingBadgeData.label || 'Titre'}</span>
                        {editingBadgeData.subLabel && <span className="text-[9px] opacity-85 font-mono">{editingBadgeData.subLabel}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* List of existing badges */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Badges configurés ({badges.length})
                </h4>

                {badges.map((badge, idx) => (
                  <div
                    key={badge.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Visual rendering of badge */}
                      <div
                        style={{
                          backgroundColor: badge.bgColor || '#003791',
                          color: badge.textColor || '#fff',
                          borderColor: badge.accentColor || 'rgba(255,255,255,0.2)'
                        }}
                        className="flex items-center gap-2 px-3 py-1 rounded-xl border text-xs"
                      >
                        {badge.icon && <i className={`${badge.icon}`} />}
                        <div className="flex flex-col text-left leading-none">
                          <span className="font-bold uppercase text-[11px]">{badge.label}</span>
                          {badge.subLabel && <span className="text-[8px] opacity-85 font-mono">{badge.subLabel}</span>}
                        </div>
                      </div>

                      <span className="text-xs text-slate-400 truncate max-w-xs hidden sm:inline">
                        {badge.url || 'Aucun lien'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditBadge(idx)}
                        className="px-2.5 py-1 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-cyan-300 text-xs font-bold cursor-pointer"
                        title="Éditer ce badge"
                      >
                        <i className="fa-solid fa-pen text-[10px] mr-1" /> Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBadge(idx)}
                        className="p-1 px-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs cursor-pointer"
                        title="Supprimer ce badge"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === 'general' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <i className="fa-solid fa-desktop" /> Titres & En-tête
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Titre de l'application</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Logo PlayStation / evoX (Haut gauche)</label>
                  <input
                    type="text"
                    value={brandIcon}
                    onChange={(e) => setBrandIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <i className="fa-solid fa-eye" /> Affichage sur le site final
                </h3>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showConfigButtons}
                    onChange={(e) => setShowConfigButtons(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Afficher les boutons de configuration (Engrenage et CONFIG.JSON)
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Décochez cette case pour masquer complètement les boutons de configuration sur le site final. (Le ZIP GitHub les masque automatiquement).
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <i className="fa-solid fa-message" /> Textes du Footer
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Texte principal</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Mention</label>
                  <input
                    type="text"
                    value={footerSubtext}
                    onChange={(e) => setFooterSubtext(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs text-slate-400">Éditeur direct de config.json :</span>
              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs">
                  {jsonError}
                </div>
              )}
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-cyan-200"
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0a1222] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('Réinitialiser aux valeurs d\'origine ?')) {
                onResetDefault();
                onClose();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
          >
            Réinitialiser
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold uppercase cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
