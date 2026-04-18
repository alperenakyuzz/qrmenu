import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { languagesApi } from '../../api/index.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function LanguagesAdmin() {
  const { t } = useTranslation();
  const { refreshLanguages } = useLanguage();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  // New language form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLanguages = useCallback(async () => {
    try {
      const langs = await languagesApi.getAllLanguages();
      setLanguages(langs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleAddLanguage = async () => {
    if (!newCode.trim() || !newName.trim()) {
      showToast('Dil kodu ve adı zorunludur', 'error');
      return;
    }

    if (newCode.length > 5) {
      showToast('Dil kodu en fazla 5 karakter olabilir', 'error');
      return;
    }

    setSaving(true);
    try {
      await languagesApi.createLanguage({
        code: newCode.toLowerCase().trim(),
        name: newName.trim(),
        is_active: 1,
      });
      setNewCode('');
      setNewName('');
      setShowAddForm(false);
      showToast(t('admin.savedSuccessfully'));
      fetchLanguages();
      refreshLanguages();
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (lang) => {
    if (lang.is_default) return;
    try {
      await languagesApi.updateLanguage(lang.id, { ...lang, is_default: true, is_active: 1 });
      showToast(t('admin.savedSuccessfully'));
      fetchLanguages();
      refreshLanguages();
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    }
  };

  const handleToggleActive = async (lang) => {
    if (lang.is_default && lang.is_active) {
      showToast('Varsayılan dil deaktive edilemez', 'error');
      return;
    }
    try {
      await languagesApi.updateLanguage(lang.id, {
        ...lang,
        is_active: lang.is_active ? 0 : 1,
      });
      showToast(t('admin.savedSuccessfully'));
      fetchLanguages();
      refreshLanguages();
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await languagesApi.deleteLanguage(id);
      showToast(t('admin.deletedSuccessfully'));
      fetchLanguages();
      refreshLanguages();
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.languages')}</h1>
          <p className="text-gray-500 text-sm mt-1">{languages.length} dil</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAddForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {showAddForm ? t('admin.cancel') : t('admin.add')}
        </button>
      </div>

      {/* Add Language Form */}
      {showAddForm && (
        <div className="admin-card mb-6 border-gold-500/20">
          <h3 className="text-white font-semibold mb-4">Yeni Dil Ekle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">
                {t('admin.code')} <span className="text-gray-600 font-normal">(ör: fr, de, es)</span>
              </label>
              <input
                type="text"
                value={newCode}
                onChange={e => setNewCode(e.target.value.toLowerCase().slice(0, 5))}
                className="form-input"
                placeholder="fr"
                maxLength={5}
              />
            </div>
            <div>
              <label className="form-label">
                {t('admin.name')} <span className="text-gray-600 font-normal">(ör: Français)</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="form-input"
                placeholder="Français"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAddForm(false); setNewCode(''); setNewName(''); }}
              className="btn-secondary"
            >
              {t('admin.cancel')}
            </button>
            <button
              onClick={handleAddLanguage}
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
              {t('admin.save')}
            </button>
          </div>
        </div>
      )}

      {/* Warning about deletion */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
        <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-amber-400/80 text-sm">
          Bir dili silmek, o dile ait tüm çevirileri de kalıcı olarak siler. Varsayılan dil silinemez.
        </p>
      </div>

      {/* Languages List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="admin-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.code')}</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.name')}</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.default')}</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.active')}</th>
                <th className="text-right px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {languages.map((lang) => (
                <tr key={lang.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-gray-800 text-white font-bold text-sm uppercase tracking-wider">
                      {lang.code}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-white font-medium">{lang.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    {lang.is_default ? (
                      <span className="inline-flex items-center gap-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {t('admin.default')}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(lang)}
                        className="text-gray-500 hover:text-gold-400 text-xs font-medium transition-colors hover:underline"
                      >
                        {t('admin.setAsDefault')}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleActive(lang)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        lang.is_active ? 'bg-gold-500' : 'bg-gray-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        lang.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setDeleteConfirm(lang.id)}
                      disabled={lang.is_default || languages.length <= 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={lang.is_default ? 'Varsayılan dil silinemez' : t('admin.delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <h3 className="text-white font-semibold">Dili Sil</h3>
                <p className="text-gray-400 text-sm">Tüm çeviriler de silinecek!</p>
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
    </div>
  );
}
