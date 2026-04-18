import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { menuItemsApi, categoriesApi, settingsApi } from '../api/index.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AllergenIconRow from '../components/AllergenIconRow.jsx';

export default function CategoryMenu() {
  const { categoryId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLang } = useLanguage();

  const [menuItems, setMenuItems] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [items, cats, sett] = await Promise.all([
        menuItemsApi.getMenuItems(categoryId, currentLang),
        categoriesApi.getCategories(currentLang),
        settingsApi.getSettings(),
      ]);

      setMenuItems(items);
      setSettings(sett);

      const cat = cats.find(c => c.id === parseInt(categoryId));
      if (cat) setCategoryName(cat.name);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentLang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currency = settings.currency || '₺';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Back Button + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-white font-bold text-base truncate">
                {categoryName || settings.company_name || 'QRMenu'}
              </span>
            )}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="public" />
        </div>
      </header>

      {/* Category Title */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gold-500 rounded-full" />
          <h1 className="text-2xl font-bold text-white">{categoryName}</h1>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 text-sm">{t('public.loading')}</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500">{t('public.noItems')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} currency={currency} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Back to Menu Button (Bottom) */}
      {!loading && menuItems.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-700 hover:border-gold-500/40 text-gray-400 hover:text-gold-400 text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('public.backToMenu')}
          </button>
        </div>
      )}
    </div>
  );
}

// Menu Item Card Component
function MenuItemCard({ item, currency, t }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="menu-item-card">
      {/* Image */}
      {item.image && !imgError && (
        <div className="relative overflow-hidden" style={{ height: '200px' }}>
          <img
            src={item.image}
            alt={item.name}
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

      {/* Content */}
      <div className="p-4">
        {/* Top row: Name + Price */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {(!item.image || imgError) && item.is_featured === 1 && (
              <span className="badge-featured mt-0.5 flex-shrink-0">
                <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
            <h3 className="text-white font-semibold text-base leading-snug">
              {item.name}
            </h3>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="price-tag text-lg">
              {currency}{Number(item.price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-gray-400 text-sm leading-relaxed">
            {item.description}
          </p>
        )}

        {item.allergens?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800/80">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">{t('public.allergens')}</p>
            <AllergenIconRow allergens={item.allergens} />
          </div>
        )}
      </div>
    </div>
  );
}
