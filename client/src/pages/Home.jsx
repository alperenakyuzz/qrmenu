import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoriesApi, settingsApi, menuItemsApi } from '../api/index.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import MenuItemCard from '../components/MenuItemCard.jsx';
import MenuItemDetailModal from '../components/MenuItemDetailModal.jsx';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLang } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [allCatalogItems, setAllCatalogItems] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [heroImgError, setHeroImgError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailItem, setDetailItem] = useState(null);

  const showingSearch = !!searchQuery.trim();

  const globalSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allCatalogItems.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.description && String(item.description).toLowerCase().includes(q))
    );
  }, [allCatalogItems, searchQuery]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, sett, catalog] = await Promise.all([
        categoriesApi.getCategories(currentLang),
        settingsApi.getSettings(),
        menuItemsApi.getPublicMenuCatalog(currentLang),
      ]);
      setCategories(cats);
      setSettings(sett);
      setAllCatalogItems(catalog);
    } catch (err) {
      console.error('Failed to fetch home data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setHeroImgError(false);
  }, [settings.hero_image]);

  useEffect(() => {
    if (!searchQuery.trim()) setDetailItem(null);
  }, [searchQuery]);

  const homeMenuDescription = settings.menu_description?.trim() || t('public.menuDescription');
  const currency = settings.currency || '₺';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.company_name || 'Logo'}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-lg tracking-tight truncate">
                    {settings.company_name || 'QRMenu'}
                  </span>
                </div>
              )}
            </div>
            <LanguageSwitcher variant="public" />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('public.searchGlobalPlaceholder')}
              aria-label={t('nav.search')}
              className="w-full rounded-lg bg-gray-900/80 border border-gray-700 text-white text-sm pl-10 pr-3 py-2.5 placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-colors"
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        {!showingSearch && (
          <div className="text-center mb-8">
            {settings.hero_image && !heroImgError && (
              <div className="mb-6 rounded-2xl overflow-hidden">
                <div className="aspect-[21/9] max-h-[220px] sm:max-h-[260px] w-full">
                  <img
                    src={settings.hero_image}
                    alt={t('public.heroImageAlt')}
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">{t('public.ourMenu')}</h1>
            <p className="text-gray-500 text-sm">{homeMenuDescription}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent flex-1 max-w-24" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent flex-1 max-w-24" />
            </div>
          </div>
        )}

        {showingSearch && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">{t('public.searchResultsTitle')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('public.searchGlobalHint')}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 text-sm">{t('public.loading')}</p>
          </div>
        ) : showingSearch ? (
          globalSearchResults.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">{t('public.noSearchResults')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {globalSearchResults.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currency={currency}
                  t={t}
                  onOpenDetail={setDetailItem}
                  showCategoryLabel
                />
              ))}
            </div>
          )
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500">{t('public.noItems')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => navigate(`/menu/${category.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {(settings.phone || settings.address) && (
        <footer className="max-w-2xl mx-auto px-4 py-8 mt-8 border-t border-gray-800/50">
          <div className="flex flex-col items-center gap-2 text-center">
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 text-gray-500 hover:text-gold-400 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {settings.phone}
              </a>
            )}
            {settings.address && (
              <p className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {settings.address}
              </p>
            )}
          </div>
        </footer>
      )}

      <MenuItemDetailModal
        item={detailItem}
        currency={currency}
        t={t}
        onClose={() => setDetailItem(null)}
      />
    </div>
  );
}

function CategoryCard({ category, onClick }) {
  const [imgError, setImgError] = useState(false);

  const gradients = [
    'from-amber-900/80 to-stone-900/80',
    'from-teal-900/80 to-gray-900/80',
    'from-rose-900/80 to-gray-900/80',
    'from-indigo-900/80 to-gray-900/80',
    'from-emerald-900/80 to-gray-900/80',
    'from-violet-900/80 to-gray-900/80',
  ];
  const gradientClass = gradients[category.id % gradients.length];

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-xl cursor-pointer group"
      style={{ height: '200px' }}
    >
      {category.image && !imgError ? (
        <img
          src={category.image}
          alt={category.name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition-all duration-300 group-hover:from-black/70 group-hover:via-black/30" />

      <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-all duration-300" />

      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gold-500/30 transition-all duration-300" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-0.5 bg-gold-500/60 mb-3 transition-all duration-300 group-hover:w-16 group-hover:bg-gold-400" />
        <h2 className="text-white text-xl font-bold text-center tracking-wide drop-shadow-lg">{category.name}</h2>
        <div className="w-10 h-0.5 bg-gold-500/60 mt-3 transition-all duration-300 group-hover:w-16 group-hover:bg-gold-400" />
      </div>

      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <div className="w-7 h-7 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
