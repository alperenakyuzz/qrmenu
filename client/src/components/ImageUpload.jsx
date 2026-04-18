import React, { useState, useRef } from 'react';
import { uploadsApi } from '../api/index.js';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ImageUpload({ value, onChange, className = '' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece resim dosyaları yüklenebilir (jpeg, png, gif, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await uploadsApi.uploadImage(file);
      onChange(result.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Görsel yüklenirken hata oluştu');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        const filename = value.split('/').pop();
        await uploadsApi.deleteImage(filename);
      } catch (err) {
        // Ignore deletion errors
      }
    }
    onChange('');
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id={`image-upload-${Math.random().toString(36).substr(2, 9)}`}
      />

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border border-gray-700"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gold-500 text-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gold-600 transition-colors"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              Kaldır
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-gray-700 hover:border-gold-500/50 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
        >
          {uploading ? (
            <LoadingSpinner size="md" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gold-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Görsel yüklemek için tıklayın
                </p>
                <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF, WEBP (maks. 5MB)</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
