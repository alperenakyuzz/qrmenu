import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { menuItemsApi, categoriesApi, settingsApi } from '../api/index.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import MenuItemCard from '../components/MenuItemCard.jsx';
import MenuItemDetailModal from '../components/MenuItemDetailModal.jsx';

export default function CategoryMenu() {
  const { categoryId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLang } = useLanguage();

  const [allCatalogItems, setAllCatalogItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [categoryImgErrors, setCategoryImgErrors] = useState({});
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState(null);
  const [itemSearch, setItemSearch] = useState('');
  const headerRef = useRef(null);
  const categorySectionRefs = useRef({});
  const categoryTabsContainerRef = useRef(null);
  const categoryTabRefs = useRef({});
  const shouldScrollToRouteRef = useRef(true);
  const isRouteScrollingRef = useRef(false);

  const showingGlobalSearch = !!itemSearch.trim();

  const displayItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return allCatalogItems;
    return allCatalogItems.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.description && String(item.description).toLowerCase().includes(q))
    );
  }, [allCatalogItems, itemSearch]);

  const sectionedCategories = useMemo(() => {
    const itemsByCategory = new Map();

    for (const item of allCatalogItems) {
      if (!itemsByCategory.has(item.category_id)) {
        itemsByCategory.set(item.category_id, []);
      }
      itemsByCategory.get(item.category_id).push(item);
    }

    return categories
      .map((category) => ({
        ...category,
        items: itemsByCategory.get(category.id) || [],
      }))
      .filter((category) => category.items.length > 0);
  }, [allCatalogItems, categories]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, sett, catalog] = await Promise.all([
        categoriesApi.getCategories(currentLang),
        settingsApi.getSettings(),
        menuItemsApi.getMenuItems(null, currentLang),
      ]);

      setAllCatalogItems(catalog);
      setCategories(cats);
      setCategoryImgErrors({});
      setSettings(sett);

      setActiveCategoryId((prev) => prev || cats[0]?.id || null);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scrollToCategory = useCallback((targetCategoryId, behavior = 'smooth') => {
    const section = categorySectionRefs.current[targetCategoryId];
    if (!section) return;

    const headerHeight = headerRef.current?.getBoundingClientRect().height || 0;
    const targetTop = window.scrollY + section.getBoundingClientRect().top - headerHeight - 12;
    window.scrollTo({ top: Math.max(0, targetTop), behavior });
  }, []);

  useEffect(() => {
    setDetailItem(null);
    setItemSearch('');
  }, [categoryId]);

  useEffect(() => {
    if (!itemSearch.trim()) setDetailItem(null);
  }, [itemSearch]);

  useEffect(() => {
    if (loading || showingGlobalSearch || sectionedCategories.length === 0) return;

    const requestedCategoryId = parseInt(categoryId, 10);
    const targetCategory =
      sectionedCategories.find((category) => category.id === requestedCategoryId) ||
      sectionedCategories[0];

    setActiveCategoryId(targetCategory.id);

    if (!shouldScrollToRouteRef.current) {
      shouldScrollToRouteRef.current = true;
      return;
    }

    isRouteScrollingRef.current = true;

    const timer = window.setTimeout(() => {
      scrollToCategory(targetCategory.id, 'auto');
      window.setTimeout(() => {
        isRouteScrollingRef.current = false;
      }, 100);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      isRouteScrollingRef.current = false;
    };
  }, [categoryId, loading, scrollToCategory, sectionedCategories, showingGlobalSearch]);

  useEffect(() => {
    if (loading || showingGlobalSearch || sectionedCategories.length === 0) return undefined;

    const updateActiveCategory = () => {
      if (isRouteScrollingRef.current) return;

      const headerBottom = headerRef.current?.getBoundingClientRect().bottom || 0;
      const activationOffset = headerBottom + 16;
      let nextActiveId = sectionedCategories[0].id;

      for (const category of sectionedCategories) {
        const section = categorySectionRefs.current[category.id];
        if (!section) continue;

        if (section.getBoundingClientRect().top <= activationOffset) {
          nextActiveId = category.id;
        } else {
          break;
        }
      }

      setActiveCategoryId((prev) => (prev === nextActiveId ? prev : nextActiveId));

      if (nextActiveId !== parseInt(categoryId, 10)) {
        shouldScrollToRouteRef.current = false;
        navigate(`/menu/${nextActiveId}`, { replace: true });
      }
    };

    updateActiveCategory();
    window.addEventListener('scroll', updateActiveCategory, { passive: true });
    window.addEventListener('resize', updateActiveCategory);

    return () => {
      window.removeEventListener('scroll', updateActiveCategory);
      window.removeEventListener('resize', updateActiveCategory);
    };
  }, [categoryId, loading, navigate, sectionedCategories, showingGlobalSearch]);

  useEffect(() => {
    if (!activeCategoryId || showingGlobalSearch) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const container = categoryTabsContainerRef.current;
      const activeTab = categoryTabRefs.current[activeCategoryId];
      if (!container || !activeTab) return;

      const containerRect = container.getBoundingClientRect();
      const activeTabRect = activeTab.getBoundingClientRect();
      const centeredLeft =
        container.scrollLeft +
        activeTabRect.left -
        containerRect.left -
        (container.clientWidth - activeTabRect.width) / 2;

      container.scrollTo({
        left: Math.max(0, Math.min(centeredLeft, container.scrollWidth - container.clientWidth)),
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeCategoryId, sectionedCategories.length, showingGlobalSearch]);

  const currency = settings.currency || '₺';
  const currentCategoryId = activeCategoryId || parseInt(categoryId, 10);
  const activeCategory = categories.find((cat) => cat.id === currentCategoryId);

  const handleCategoryClick = (targetCategoryId) => {
    shouldScrollToRouteRef.current = false;
    isRouteScrollingRef.current = true;
    setItemSearch('');
    setActiveCategoryId(targetCategoryId);
    navigate(`/menu/${targetCategoryId}`);
    scrollToCategory(targetCategoryId);
    window.setTimeout(() => {
      isRouteScrollingRef.current = false;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800/50"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
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
                  {activeCategory?.name || settings.company_name || 'QRMenu'}
                </span>
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
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder={t('public.searchGlobalPlaceholder')}
              aria-label={t('nav.search')}
              className="w-full rounded-lg bg-gray-900/80 border border-gray-700 text-white text-sm pl-10 pr-3 py-2.5 placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-colors"
            />
          </div>
          {sectionedCategories.length > 1 && !showingGlobalSearch && (
            <div
              ref={categoryTabsContainerRef}
              className="flex items-center gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide"
            >
              {sectionedCategories.map((cat) => {
                const isActive = cat.id === currentCategoryId;
                const hasCategoryImage = cat.image && !categoryImgErrors[cat.id];
                return (
                  <button
                    key={cat.id}
                    ref={(node) => {
                      categoryTabRefs.current[cat.id] = node;
                    }}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-2.5 py-2 rounded-lg text-sm border transition-all inline-flex items-center gap-2 min-w-max snap-start ${
                      isActive
                        ? 'border-gold-500/70 text-gold-400 bg-gold-500/10'
                        : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {hasCategoryImage && (
                      <span className="w-7 h-7 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          onError={() =>
                            setCategoryImgErrors((prev) => ({ ...prev, [cat.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      </span>
                    )}
                    <span className="truncate max-w-[140px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {showingGlobalSearch && (
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gold-500 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold text-white">{t('public.searchResultsTitle')}</h1>
              <p className="text-gray-500 text-sm mt-1">{t('public.searchGlobalHint')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 text-sm">{t('public.loading')}</p>
          </div>
        ) : sectionedCategories.length === 0 && !showingGlobalSearch ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500">{t('public.noItems')}</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">{t('public.noSearchResults')}</p>
          </div>
        ) : showingGlobalSearch ? (
          <div className="flex flex-col gap-4">
            {displayItems.map((item) => (
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
        ) : (
          <div className="flex flex-col gap-8">
            {sectionedCategories.map((category) => (
              <section
                key={category.id}
                ref={(node) => {
                  categorySectionRefs.current[category.id] = node;
                }}
                className="scroll-mt-44"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-7 bg-gold-500 rounded-full" />
                  <h2 className="text-xl font-bold text-white">{category.name}</h2>
                </div>
                <div className="flex flex-col gap-4">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={currency}
                      t={t}
                      onOpenDetail={setDetailItem}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <button
            type="button"
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

      <MenuItemDetailModal
        item={detailItem}
        currency={currency}
        t={t}
        onClose={() => setDetailItem(null)}
      />
    </div>
  );
}
