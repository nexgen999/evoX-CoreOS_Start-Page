import React, { useState } from 'react';
import { ShortcutItem } from '../types/config';

interface ShortcutGridProps {
  shortcuts: ShortcutItem[];
  customShortcuts: ShortcutItem[];
  isEditing: boolean;
  onToggleEdit: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (index: number, isCustom: boolean) => void;
  onDeleteShortcut: (index: number, isCustom: boolean) => void;
  t: (key: string, fallback?: string) => string;
}

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({
  shortcuts,
  customShortcuts,
  isEditing,
  onToggleEdit,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteShortcut,
  t
}) => {
  return (
    <section className="mb-10 w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-2 px-1">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2">
          <span className="w-1.5 h-3.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          <span>{t('shortcuts', 'Mes raccourcis')}</span>
          <span className="text-[10px] text-slate-400 font-mono font-normal">
            ({shortcuts.length + (customShortcuts?.length || 0)})
          </span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleEdit}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 ${
              isEditing
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen-to-square'} text-[11px]`} />
            <span>{isEditing ? t('done', 'TERMINER') : t('manage', 'GÉRER')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-blue-600/90 to-cyan-600/90 hover:from-blue-500 hover:to-cyan-500 text-white border border-cyan-400/30 transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 shadow-md shadow-blue-900/20"
          >
            <i className="fa-solid fa-plus text-[11px]" />
            <span>{t('add', '＋ AJOUTER')}</span>
          </button>
        </div>
      </div>

      {/* LIGNE 1 : Les 6 Raccourcis Principaux evoX (avec marge suffisante au-dessus pour éviter tout découpage au survol) */}
      <div className="pt-3 pb-2 px-1 overflow-visible">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 w-full overflow-visible">
          {shortcuts.map((item, index) => (
            <ShortcutCard
              key={`official-${item.name}-${index}`}
              item={item}
              index={index}
              isCustom={false}
              isEditing={isEditing}
              onCardClick={() => {
                if (isEditing) {
                  onOpenEditModal(index, false);
                }
              }}
              onDelete={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteShortcut(index, false);
              }}
            />
          ))}
        </div>
      </div>

      {/* LIGNE 2 : Raccourcis Personnalisés ajoutés par l'utilisateur */}
      {(customShortcuts && customShortcuts.length > 0) || isEditing ? (
        <div className="mt-4 pt-3 pb-2 px-1 border-t border-slate-800/50">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <i className="fa-solid fa-bookmark text-cyan-400 text-xs" />
              <span>Raccourcis personnalisés</span>
              <span className="text-[10px] text-slate-400 font-mono">({customShortcuts.length})</span>
            </span>
            {isEditing && (
              <span className="text-[11px] text-amber-300 font-medium">
                Cliquez sur ✕ pour supprimer
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 w-full overflow-visible">
            {customShortcuts.map((item, index) => (
              <ShortcutCard
                key={`custom-${item.name}-${index}`}
                item={item}
                index={index}
                isCustom={true}
                isEditing={isEditing}
                onCardClick={() => {
                  if (isEditing) {
                    onOpenEditModal(index, true);
                  }
                }}
                onDelete={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteShortcut(index, true);
                }}
              />
            ))}

            {/* Quick Add Card on Line 2 */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="min-h-[108px] rounded-xl p-3 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-700/80 hover:border-cyan-400/60 bg-slate-900/30 hover:bg-slate-900/60 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800/60 border border-slate-700/60 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10 transition-colors">
                <i className="fa-solid fa-plus text-sm" />
              </div>
              <span className="text-[11px] font-bold text-center">Ajouter un favori</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

interface ShortcutCardProps {
  item: ShortcutItem;
  index: number;
  isCustom: boolean;
  isEditing: boolean;
  onCardClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ShortcutCard: React.FC<ShortcutCardProps> = ({
  item,
  isCustom,
  isEditing,
  onCardClick,
  onDelete
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Render tile icon
  const renderIcon = () => {
    const type = item.type || 'fontawesome';
    const iconStr = item.icon || '';

    if (type === 'image' && !imgFailed) {
      const src = iconStr.startsWith('assets/') ? `/${iconStr}` : iconStr;
      return (
        <img
          src={src}
          alt={item.name}
          className="w-full h-full object-contain p-1 drop-shadow"
          onError={() => setImgFailed(true)}
        />
      );
    }

    if (type === 'fontawesome' || imgFailed) {
      return (
        <i
          className={`${item.icon || 'fa-solid fa-globe'} text-xl text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]`}
          aria-hidden="true"
        />
      );
    }

    // Emoji or raw character
    return (
      <span className="text-xl leading-none select-none">
        {iconStr || item.name.charAt(0).toUpperCase()}
      </span>
    );
  };

  const CardWrapper = isEditing ? 'div' : 'a';
  const cardProps = isEditing
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: onCardClick,
        className:
          'relative min-h-[108px] rounded-xl p-3 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#18263e]/95 to-[#0e1625]/98 border border-amber-500/60 shadow-lg cursor-pointer transition-all hover:scale-[1.03] hover:z-20 hover:border-amber-400 focus:outline-none'
      }
    : {
        href: item.url,
        tabIndex: 0,
        className:
          'relative min-h-[108px] rounded-xl p-3 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#15233c]/85 to-[#0b1322]/95 border border-slate-700/60 shadow-md hover:shadow-cyan-500/15 hover:border-cyan-400/80 hover:bg-gradient-to-b hover:from-[#1c3054] hover:to-[#101c31] transition-all hover:scale-[1.03] hover:z-20 active:scale-[0.98] group focus:outline-none'
      };

  return (
    // @ts-ignore
    <CardWrapper {...cardProps} title={`${item.name} (${item.url})`}>
      {/* Icon frame */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1b2f4f] to-[#101b2d] border border-blue-400/20 group-hover:border-cyan-400/60 transition-colors shadow-inner overflow-hidden shrink-0">
        {renderIcon()}
      </div>

      {/* Label */}
      <div className="text-center w-full px-1">
        <div className="text-[11px] font-bold text-slate-100 group-hover:text-cyan-300 leading-tight line-clamp-2 transition-colors break-words">
          {item.name}
        </div>
      </div>

      {/* Bouton de suppression bien visible en mode GÉRER */}
      {isEditing && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white flex items-center justify-center text-xs font-black shadow-xl border-2 border-[#070b14] cursor-pointer transition-transform hover:scale-115 z-30"
          title="Supprimer ce raccourci"
          aria-label={`Supprimer ${item.name}`}
        >
          ✕
        </button>
      )}

      {/* Tag badge for custom shortcuts */}
      {isCustom && !isEditing && (
        <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
      )}
    </CardWrapper>
  );
};
