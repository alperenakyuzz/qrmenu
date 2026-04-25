import React, { useEffect, useState } from 'react';
import AllergenIconRow from './AllergenIconRow.jsx';

export default function MenuItemDetailModal({ item, currency, t, onClose }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [item?.id, item?.image]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-item-detail-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-h-[min(90vh,760px)] rounded-2xl border border-gray-800 bg-[var(--theme-surface)] shadow-2xl flex flex-col overflow-hidden ${
          item.image && !imgError ? 'max-w-[512px]' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {item.image && !imgError && (
          <div className="flex justify-center flex-shrink-0 border-b border-gray-800/80">
            <div className="relative w-full h-[min(512px,60vh)] overflow-hidden bg-black/40">
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            </div>
          </div>
        )}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-gray-800/80">
          <div className="min-w-0 pr-2">
            <h2 id="menu-item-detail-title" className="text-lg font-semibold text-white leading-snug">
              {item.name}
            </h2>
            {item.category_name && (
              <p className="text-xs text-gray-500 mt-1">{item.category_name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            aria-label={t('public.close')}
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          {item.description && (
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
          )}
          {item.allergens?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800/80">
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">{t('public.allergens')}</p>
              <AllergenIconRow allergens={item.allergens} />
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
          <span className="price-tag text-xl">
            {currency}
            {Number(item.price).toFixed(2)}
          </span>
          <button type="button" onClick={onClose} className="btn-secondary text-sm px-4 py-2">
            {t('public.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
