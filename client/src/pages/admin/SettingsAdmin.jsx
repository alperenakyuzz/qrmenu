import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsApi } from '../../api/index.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function SettingsAdmin() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [currency, setCurrency] = useState('₺');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsApi.getSettings();
        setCompanyName(settings.company_name || '');
        setPhone(settings.phone || '');
        setAddress(settings.address || '');
        setLogo(settings.logo || '');
        setHeroImage(settings.hero_image || '');
        setCurrency(settings.currency || '₺');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!companyName.trim()) {
      showToast('İşletme adı zorunludur', 'error');
      return;
    }

    setSaving(true);
    try {
      await settingsApi.updateSettings({
        company_name: companyName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        logo: logo || '',
        hero_image: heroImage || '',
        currency: currency.trim() || '₺',
      });
      showToast(t('admin.savedSuccessfully'));
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{t('admin.settings')}</h1>
        <p className="text-gray-500 text-sm mt-1">İşletme bilgilerini ve görünüm ayarlarını yapılandırın</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Logo Section */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('admin.logo')}
          </h3>
          <div className="space-y-3">
            <ImageUpload value={logo} onChange={setLogo} />
            <p className="text-gray-600 text-xs">
              Logo yüklenmezse işletme adı metin olarak gösterilir. Önerilen: şeffaf arka plan, PNG formatı.
            </p>
          </div>
        </div>

        {/* Hero image (home) */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            {t('admin.heroImage')}
          </h3>
          <div className="space-y-3">
            <ImageUpload value={heroImage} onChange={setHeroImage} />
            <p className="text-gray-600 text-xs">{t('admin.heroImageHint')}</p>
          </div>
        </div>

        {/* Business Info Section */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            İşletme Bilgileri
          </h3>
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="form-label">
                {t('admin.companyName')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="form-input"
                placeholder="Cafe QRMenu"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">{t('admin.phone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="form-input"
                placeholder="+90 555 000 0000"
              />
            </div>

            {/* Address */}
            <div>
              <label className="form-label">{t('admin.address')}</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="form-input resize-none"
                rows={3}
                placeholder="İstanbul, Türkiye"
              />
            </div>
          </div>
        </div>

        {/* Currency Section */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('admin.currency')}
          </h3>
          <div>
            <label className="form-label">Para Birimi Sembolü</label>
            <input
              type="text"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="form-input max-w-[120px]"
              placeholder="₺"
              maxLength={5}
            />
            <p className="text-gray-600 text-xs mt-1.5">
              Fiyatların önünde gösterilecek para birimi sembolü (ör: ₺, $, €, £)
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t('admin.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
