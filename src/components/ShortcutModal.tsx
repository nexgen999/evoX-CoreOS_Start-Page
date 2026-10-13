import React, { useState, useEffect } from 'react';
import { ShortcutItem, IconType } from '../types/config';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ShortcutItem) => void;
  initialItem?: ShortcutItem | null;
  isEditingIndex: number;
  t: (key: string, fallback?: string) => string;
}

export const ShortcutModal: React.FC<ShortcutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  isEditingIndex,
  t
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [type, setType] = useState<IconType>('fontawesome');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setUrl(initialItem.url || '');
      setIcon(initialItem.icon || '');
      setType(initialItem.type || 'fontawesome');
    } else {
      setName('');
      setUrl('');
      setIcon('fa-solid fa-globe');
      setType('fontawesome');
    }
    setError('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    let cleanUrl = url.trim();

    if (!cleanName) {
      setError('Veuillez renseigner un nom.');
      return;
    }

    if (!cleanUrl) {
      setError(t('badUrl', 'Veuillez saisir une URL valide.'));
      return;
    }

    // Auto prepend https:// if missing
    if (!/^[a-z]+:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError(t('badUrl', 'Veuillez saisir une URL valide.'));
      return;
    }

    onSave({
      name: cleanName,
      url: cleanUrl,
      icon: icon.trim() || 'fa-solid fa-globe',
      type
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#0f172a] border border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-link text-cyan-400 text-sm" />
            <span>
              {isEditingIndex >= 0
                ? t('editTitle', 'Modifier le raccourci')
                : t('addTitle', 'Ajouter un raccourci')}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t('nameLabel', 'Nom affiché')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. evoX Store / Netflix"
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {t('urlLabel', 'Adresse URL')}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemple.com"
              required
              autoCapitalize="off"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('iconTypeLabel', 'Type d’icône')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IconType)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="fontawesome">Font Awesome</option>
                <option value="image">Image (assets/ ou URL)</option>
                <option value="emoji">Emoji / Texte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('iconLabel', 'Valeur icône')}
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="fa-brands fa-github / assets/evox.svg"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
            {t('modalNote', 'Modifiez config.json pour les raccourcis de départ. Les images locales doivent être placées dans assets/.')}
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              {t('cancel', 'ANNULER')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {t('save', 'ENREGISTRER')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
