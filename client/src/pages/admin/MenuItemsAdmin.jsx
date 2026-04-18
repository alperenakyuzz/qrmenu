import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { menuItemsApi, categoriesApi, languagesApi, allergensApi } from '../../api/index.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function MenuItemsAdmin() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [menuItems, cats, langs] = await Promise.all([
        menuItemsApi.getAllMenuItems(filterCategory || undefined),
        categoriesApi.getAllCategories(),
        languagesApi.getAllLanguages(),
      ]);
      setItems(menuItems);
      setCategories(cats);
      setLanguages(langs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await menuItemsApi.deleteMenuItem(id);
      showToast(t('admin.deletedSuccessfully'));
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const defaultLang = languages.find(l => l.is_default);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-900/90 text-red-200 border border-red-700' : 'bg-emerald-900/90 text-emerald-200 border border-emerald-700'}`}>
          {toast.type === 'error' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.menuItems')}</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} ürün</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">{t('admin.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('admin.add')}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-gray-500">{t('admin.noItems')}</p>
          <button onClick={handleAdd} className="btn-primary mt-4">{t('admin.add')}</button>
        </div>
      ) : (
        <div className="admin-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">Görsel</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.name')}</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">{t('admin.category')}</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.price')}</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">{t('admin.featured')}</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">{t('admin.active')}</th>
                  <th className="text-right px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.map((item) => {
                  const catName = item.category_name || categories.find(c => c.id === item.category_id)?.name || '-';

                  return (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium text-sm">{item.name || '(İsimsiz)'}</p>
                        {item.description && (
                          <p className="text-gray-500 text-xs truncate max-w-[150px]">{item.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-400 text-sm">{catName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gold-400 font-semibold text-sm">
                          ₺{Number(item.price).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {item.is_featured ? (
                          <span className="badge-featured">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Öne Çıkan
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-gray-800 text-gray-500 border border-gray-700'
                        }`}>
                          {item.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            title={t('admin.edit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                            title={t('admin.delete')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Ürünü Sil</h3>
                <p className="text-gray-400 text-sm">Bu işlem geri alınamaz</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-5">{t('admin.confirmDelete')}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">{t('admin.cancel')}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger">{t('admin.delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <MenuItemModal
          key={editingItem?.id ?? 'new'}
          item={editingItem}
          categories={categories}
          languages={languages}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            fetchData();
            showToast(t('admin.savedSuccessfully'));
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  );
}

function MenuItemModal({ item, categories, languages, onClose, onSave, onError }) {
  const { t } = useTranslation();
  const [allergenList, setAllergenList] = useState([]);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState(() => item?.allergens?.map((a) => a.id) || []);
  const [categoryId, setCategoryId] = useState(item?.category_id || categories[0]?.id || '');
  const [image, setImage] = useState(item?.image || '');
  const [price, setPrice] = useState(item?.price ?? '');
  const [isFeatured, setIsFeatured] = useState(item?.is_featured === 1);
  const [isActive, setIsActive] = useState(item?.is_active !== 0);
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [translations, setTranslations] = useState(() => {
    const trans = {};
    languages.forEach(lang => {
      const existing = item?.translations?.find(t => t.language_code === lang.code);
      trans[lang.code] = {
        name: existing?.name || '',
        description: existing?.description || '',
      };
    });
    return trans;
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(languages[0]?.code || 'tr');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await allergensApi.getAllergens();
        if (!cancelled) setAllergenList(list);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    const hasAnyName = Object.values(translations).some(t => t.name?.trim());
    if (!hasAnyName) {
      onError('En az bir dilde ürün adı girilmelidir');
      return;
    }
    if (!categoryId) {
      onError('Kategori seçilmelidir');
      return;
    }
    if (price === '' || isNaN(parseFloat(price))) {
      onError('Geçerli bir fiyat girilmelidir');
      return;
    }

    setSaving(true);
    try {
      const data = {
        category_id: parseInt(categoryId),
        image: image || null,
        price: parseFloat(price),
        is_featured: isFeatured,
        is_active: isActive,
        sort_order: parseInt(sortOrder) || 0,
        translations,
        allergen_ids: selectedAllergenIds,
      };

      if (item) {
        await menuItemsApi.updateMenuItem(item.id, data);
      } else {
        await menuItemsApi.createMenuItem(data);
      }
      onSave();
    } catch (err) {
      onError(err.response?.data?.error || t('admin.errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">
            {item ? `${t('admin.edit')} Ürün` : `${t('admin.add')} Ürün`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Image */}
          <div>
            <label className="form-label">{t('admin.image')}</label>
            <ImageUpload value={image} onChange={setImage} />
          </div>

          {/* Category */}
          <div>
            <label className="form-label">{t('admin.category')}</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="form-input"
            >
              <option value="">{t('admin.selectCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Allergens */}
          <div>
            <label className="form-label">{t('admin.menuItemAllergens')}</label>
            <p className="text-gray-500 text-xs mb-2">{t('admin.menuItemAllergensHint')}</p>
            {allergenList.length === 0 ? (
              <p className="text-gray-500 text-sm">
                <Link to="/admin/allergens" className="text-gold-400 hover:underline" onClick={onClose}>
                  {t('admin.goToAllergensPage')}
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allergenList.map((a) => {
                  const on = selectedAllergenIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      title={a.title}
                      onClick={() => {
                        setSelectedAllergenIds((prev) =>
                          prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]
                        );
                      }}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border text-xl transition-all
                        ${on
                          ? 'border-gold-500 bg-gold-500/15 ring-1 ring-gold-500/40'
                          : 'border-gray-700 bg-gray-800/60 hover:border-gray-600'}`}
                    >
                      <span aria-hidden>{a.icon}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="form-label">{t('admin.price')} (₺)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Translations */}
          <div>
            <label className="form-label">{t('admin.translations')}</label>

            {/* Language Tabs */}
            {languages.length > 1 && (
              <div className="flex gap-1 mb-3">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveTab(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                      activeTab === lang.code
                        ? 'bg-gold-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {lang.code}
                    {lang.is_default ? ' ★' : ''}
                  </button>
                ))}
              </div>
            )}

            {languages.map(lang => (
              <div key={lang.code} className={activeTab === lang.code ? 'space-y-3' : 'hidden'}>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('admin.name')} ({lang.name})</label>
                  <input
                    type="text"
                    value={translations[lang.code]?.name || ''}
                    onChange={e => setTranslations(prev => ({
                      ...prev,
                      [lang.code]: { ...prev[lang.code], name: e.target.value }
                    }))}
                    className="form-input"
                    placeholder={`${lang.name} dilinde ürün adı`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{t('admin.description')} ({lang.name})</label>
                  <textarea
                    value={translations[lang.code]?.description || ''}
                    onChange={e => setTranslations(prev => ({
                      ...prev,
                      [lang.code]: { ...prev[lang.code], description: e.target.value }
                    }))}
                    className="form-input resize-none"
                    rows={3}
                    placeholder={`${lang.name} dilinde ürün açıklaması`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">{t('admin.sortOrder')}</label>
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="form-input"
                min="0"
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">{t('admin.featured')}</label>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-1 ${
                  isFeatured ? 'bg-gold-500' : 'bg-gray-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isFeatured ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex flex-col">
              <label className="form-label">{t('admin.active')}</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-1 ${
                  isActive ? 'bg-gold-500' : 'bg-gray-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-800">
          <button onClick={onClose} className="flex-1 btn-secondary">{t('admin.cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
            {saving && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
            {t('admin.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
