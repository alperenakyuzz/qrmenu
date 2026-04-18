import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSwitcher({ variant = 'public' }) {
  const { languages, currentLang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLanguage = languages.find(l => l.code === currentLang);

  if (languages.length <= 1) return null;

  if (variant === 'admin') {
    return (
      <div className="flex items-center gap-1">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLang(lang.code)}
            className={`px-2.5 py-1 rounded text-xs font-semibold uppercase transition-colors ${
              currentLang === lang.code
                ? 'bg-gold-500 text-black'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {lang.code}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 hover:border-gold-500/40 text-white px-3 py-2 rounded-lg transition-all duration-200"
      >
        <span className="text-sm font-semibold uppercase">{currentLang}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden min-w-[120px]">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLang(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-800 transition-colors ${
                  currentLang === lang.code ? 'text-gold-400 bg-gray-800' : 'text-gray-300'
                }`}
              >
                <span className="uppercase font-semibold text-xs text-gray-500">{lang.code}</span>
                <span>{lang.name}</span>
                {currentLang === lang.code && (
                  <svg className="w-3 h-3 ml-auto text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
