import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsApi, authApi } from '../../api/index.js';
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
  const [menuDescription, setMenuDescription] = useState('');
  const [currency, setCurrency] = useState('₺');
  const [primaryColor, setPrimaryColor] = useState('#d4a017');
  const [backgroundColor, setBackgroundColor] = useState('#0a0a0a');
  const [surfaceColor, setSurfaceColor] = useState('#111827');
  const [textColor, setTextColor] = useState('#f3f4f6');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const normalizeHex = (value, fallback) => {
    const v = value.trim();
    return /^#([A-Fa-f0-9]{6})$/.test(v) ? v : fallback;
  };

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
        setMenuDescription(settings.menu_description || '');
        setCurrency(settings.currency || '₺');
        setPrimaryColor(settings.theme_primary_color || '#d4a017');
        setBackgroundColor(settings.theme_background_color || '#0a0a0a');
        setSurfaceColor(settings.theme_surface_color || '#111827');
        setTextColor(settings.theme_text_color || '#f3f4f6');
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
        menu_description: menuDescription.trim(),
        currency: currency.trim() || '₺',
        theme_primary_color: normalizeHex(primaryColor, '#d4a017'),
        theme_background_color: normalizeHex(backgroundColor, '#0a0a0a'),
        theme_surface_color: normalizeHex(surfaceColor, '#111827'),
        theme_text_color: normalizeHex(textColor, '#f3f4f6'),
      });
      showToast(t('admin.savedSuccessfully'));
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword || !confirmPassword) {
      showToast(t('admin.passwordFieldsRequired'), 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('admin.passwordMismatch'), 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast(t('admin.passwordTooShort'), 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      showToast(t('admin.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.error || t('admin.errorOccurred'), 'error');
    } finally {
      setPasswordSaving(false);
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

        {/* Home description */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4">Ana Sayfa Aciklama Metni</h3>
          <div>
            <label className="form-label">Menu basliginin altinda gosterilecek metin</label>
            <textarea
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
              className="form-input resize-none"
              rows={3}
              placeholder="Lezzetli secimlerimizi kesfedin."
            />
            <p className="text-gray-600 text-xs mt-1.5">
              Bos birakirsaniz varsayilan ceviri metni kullanilir.
            </p>
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

        {/* Admin password */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t('admin.changePasswordTitle')}
          </h3>
          <p className="text-gray-600 text-xs mb-4">{t('admin.passwordChangeHint')}</p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="form-label">{t('admin.currentPassword')}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="form-label">{t('admin.newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="form-label">{t('admin.confirmNewPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              {passwordSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {t('admin.changePasswordButton')}
            </button>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4">Tema Renkleri (Hex)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Ana Renk</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={normalizeHex(primaryColor, '#d4a017')}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 rounded border border-gray-700 bg-transparent p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="form-input"
                  placeholder="#d4a017"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Arka Plan Rengi</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={normalizeHex(backgroundColor, '#0a0a0a')}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-12 rounded border border-gray-700 bg-transparent p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="form-input"
                  placeholder="#0a0a0a"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Kart/Panel Rengi</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={normalizeHex(surfaceColor, '#111827')}
                  onChange={(e) => setSurfaceColor(e.target.value)}
                  className="h-10 w-12 rounded border border-gray-700 bg-transparent p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={surfaceColor}
                  onChange={(e) => setSurfaceColor(e.target.value)}
                  className="form-input"
                  placeholder="#111827"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Ana Metin Rengi</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={normalizeHex(textColor, '#f3f4f6')}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-12 rounded border border-gray-700 bg-transparent p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="form-input"
                  placeholder="#f3f4f6"
                />
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-3">
            Sadece 6 haneli hex format desteklenir (ornek: #d4a017). Gecersiz giriste varsayilan renk kaydedilir.
          </p>
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
