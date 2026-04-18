import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALLERGEN_ICON_PRESETS } from '../constants/allergenIcons.js';

export default function IconPickerModal({ open, onClose, onSelect, selectedIcon }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="modal-backdrop z-[60]" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{t('admin.selectIcon')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
            aria-label={t('admin.cancel')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-500 text-xs mb-4">{t('admin.iconPickerHint')}</p>
        <div className="grid grid-cols-7 gap-2 max-h-[min(50vh,280px)] overflow-y-auto pr-1">
          {ALLERGEN_ICON_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all border
                ${
                  selectedIcon === emoji
                    ? 'bg-gold-500/20 border-gold-500 ring-2 ring-gold-500/50'
                    : 'bg-gray-800/80 border-gray-700 hover:border-gold-500/40 hover:bg-gray-800'
                }`}
            >
              <span className="leading-none">{emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
