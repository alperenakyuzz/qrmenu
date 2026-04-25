import React, { useState } from 'react';
import AllergenIconRow from './AllergenIconRow.jsx';

export default function MenuItemCard({ item, currency, t, onOpenDetail, showCategoryLabel = false }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = item.image && !imgError;
  const hasDescription = !!(item.description && String(item.description).trim());

  const cardClass = `menu-item-card w-full text-left ${hasImage ? 'flex items-stretch' : ''} ${
    hasDescription
      ? 'cursor-pointer hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--theme-primary)_45%,transparent)]'
      : ''
  }`;

  const inner = (
    <>
      {hasImage && (
        <div className="relative overflow-hidden aspect-square w-48 min-w-[12rem] flex-shrink-0">
          <img
            src={item.image}
            alt=""
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          {item.is_featured === 1 && (
            <div className="absolute top-3 left-3">
              <span className="badge-featured">
                <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t('public.featuredBadge')}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {!hasImage && item.is_featured === 1 && (
              <span className="badge-featured mt-0.5 flex-shrink-0">
                <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
            <h3 className="text-white font-semibold text-base leading-snug">{item.name}</h3>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="price-tag text-lg">
              {currency}
              {Number(item.price).toFixed(2)}
            </span>
          </div>
        </div>

        {showCategoryLabel && item.category_name && (
          <p className="text-xs text-gray-500 mb-2">{item.category_name}</p>
        )}

        {item.description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 text-left">{item.description}</p>
        )}

        {item.allergens?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800/80">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">{t('public.allergens')}</p>
            <AllergenIconRow allergens={item.allergens} />
          </div>
        )}
      </div>
    </>
  );

  if (hasDescription) {
    return (
      <button
        type="button"
        className={cardClass}
        onClick={() => onOpenDetail(item)}
        aria-label={`${item.name}. ${t('public.openMenuItemDetails')}`}
      >
        {inner}
      </button>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
