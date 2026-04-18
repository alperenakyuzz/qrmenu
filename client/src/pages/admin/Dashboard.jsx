import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoriesApi, menuItemsApi, languagesApi } from '../../api/index.js';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalMenuItems: 0,
    featuredItems: 0,
    activeLanguages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cats, items, langs] = await Promise.all([
          categoriesApi.getAllCategories(),
          menuItemsApi.getAllMenuItems(),
          languagesApi.getAllLanguages(),
        ]);

        setStats({
          totalCategories: cats.length,
          totalMenuItems: items.length,
          featuredItems: items.filter(i => i.is_featured).length,
          activeLanguages: langs.filter(l => l.is_active).length,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: t('admin.totalCategories'),
      value: stats.totalCategories,
      to: '/admin/categories',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-blue-600/20 to-blue-800/20 border-blue-700/30',
      iconColor: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: t('admin.totalMenuItems'),
      value: stats.totalMenuItems,
      to: '/admin/menu-items',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-emerald-600/20 to-emerald-800/20 border-emerald-700/30',
      iconColor: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: t('admin.featuredItems'),
      value: stats.featuredItems,
      to: '/admin/menu-items',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      color: 'from-gold-600/20 to-gold-800/20 border-gold-700/30',
      iconColor: 'text-gold-400',
      bg: 'bg-gold-500/10',
    },
    {
      title: t('admin.activeLanguages'),
      value: stats.activeLanguages,
      to: '/admin/languages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      color: 'from-purple-600/20 to-purple-800/20 border-purple-700/30',
      iconColor: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  const quickLinks = [
    {
      to: '/admin/categories',
      label: t('admin.categories'),
      desc: 'Kategori ekle, düzenle veya sil',
      icon: '📂',
    },
    {
      to: '/admin/menu-items',
      label: t('admin.menuItems'),
      desc: 'Menü öğelerini yönet',
      icon: '🍽️',
    },
    {
      to: '/admin/languages',
      label: t('admin.languages'),
      desc: 'Dil ayarlarını yapılandır',
      icon: '🌐',
    },
    {
      to: '/admin/settings',
      label: t('admin.settings'),
      desc: 'İşletme bilgilerini güncelle',
      icon: '⚙️',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('admin.dashboard')}</h1>
        <p className="text-gray-500 text-sm mt-1">QRMenu yönetim paneline hoş geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className={`admin-card bg-gradient-to-br ${card.color} hover:scale-105 transition-all duration-200 group`}
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3 ${card.iconColor}`}>
              {card.icon}
            </div>
            <div>
              {loading ? (
                <div className="w-12 h-7 shimmer rounded mb-1" />
              ) : (
                <p className="text-2xl font-bold text-white">{card.value}</p>
              )}
              <p className="text-gray-400 text-xs">{card.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="admin-card flex items-center gap-4 hover:border-gold-500/40 hover:bg-gray-800/50 transition-all duration-200 group"
            >
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="text-white font-medium group-hover:text-gold-400 transition-colors">{link.label}</p>
                <p className="text-gray-500 text-sm">{link.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-gold-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
