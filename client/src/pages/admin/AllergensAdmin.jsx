import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { allergensApi } from '../../api/index.js';
import IconPickerModal from '../../components/IconPickerModal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AllergensAdmin() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRows = useCallback(async () => {
    try {
      const data = await allergensApi.getAllergens();
      setRows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await allergensApi.deleteAllergen(id);
      showToast(t('admin.deletedSuccessfully'));
      fetchRows();
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-900/90 text-red-200 border border-red-700' : 'bg-emerald-900/90 text-emerald-200 border border-emerald-700'}`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.allergens')}</h1>
          <p className="text-gray-500 text-sm mt-1">{rows.length} {t('admin.allergenCount')}</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('admin.addAllergen')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : rows.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-gray-500">{t('admin.noAllergens')}</p>
          <button type="button" onClick={openAdd} className="btn-primary mt-4">
            {t('admin.addAllergen')}
          </button>
        </div>
      ) : (
        <div className="admin-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {t('admin.icon')}
                  </th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {t('admin.name')}
                  </th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                    {t('admin.sortOrder')}
                  </th>
                  <th className="text-right px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-2xl leading-none" title={row.title}>
                        {row.icon}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium text-sm">{row.title}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">{row.sort_order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                          title={t('admin.edit')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(row.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                          title={t('admin.delete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-2">{t('admin.deleteAllergenTitle')}</h3>
            <p className="text-gray-400 text-sm mb-5">{t('admin.confirmDelete')}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">
                {t('admin.cancel')}
              </button>
              <button type="button" onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger">
                {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <AllergenFormModal
          editing={editing}
          onClose={() => setModalOpen(false)}
          iconPickerOpen={iconPickerOpen}
          setIconPickerOpen={setIconPickerOpen}
          onSaved={() => {
            setModalOpen(false);
            fetchRows();
            showToast(t('admin.savedSuccessfully'));
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  );
}

function AllergenFormModal({ editing, onClose, iconPickerOpen, setIconPickerOpen, onSaved, onError }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(editing?.title || '');
  const [icon, setIcon] = useState(editing?.icon || '🌾');
  const [sortOrder, setSortOrder] = useState(editing?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      onError(t('admin.allergenTitleRequired'));
      return;
    }
    if (!icon.trim()) {
      onError(t('admin.allergenIconRequired'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        icon: icon.trim(),
        sort_order: parseInt(sortOrder, 10) || 0,
      };
      if (editing) {
        await allergensApi.updateAllergen(editing.id, payload);
      } else {
        await allergensApi.createAllergen(payload);
      }
      onSaved();
    } catch (err) {
      onError(err.response?.data?.error || t('admin.errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop z-50" onClick={onClose}>
        <div
          className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">
              {editing ? t('admin.editAllergen') : t('admin.addAllergen')}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="form-label">{t('admin.name')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder={t('admin.allergenTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="form-label">{t('admin.icon')}</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-3xl">
                  {icon || '—'}
                </div>
                <button type="button" onClick={() => setIconPickerOpen(true)} className="btn-secondary text-sm">
                  {t('admin.chooseIcon')}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">{t('admin.sortOrder')}</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-3 p-5 border-t border-gray-800">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              {t('admin.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              )}
              {t('admin.save')}
            </button>
          </div>
        </div>
      </div>

      <IconPickerModal
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={setIcon}
        selectedIcon={icon}
      />
    </>
  );
}
