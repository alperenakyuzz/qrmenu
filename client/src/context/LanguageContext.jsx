import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { languagesApi } from '../api/index.js';
import i18n from '../i18n/index.js';

const LanguageContext = createContext(null);
const SUPPORTED_TRANSLATION_LANGS = ['tr', 'en'];
const normalizeSupportedLang = (code, fallback = 'tr') =>
  SUPPORTED_TRANSLATION_LANGS.includes(code) ? code : fallback;

export function LanguageProvider({ children }) {
  const [languages, setLanguages] = useState([]);
  const [currentLang, setCurrentLangState] = useState(
    () => normalizeSupportedLang(localStorage.getItem('qrmenu_lang'))
  );
  const [defaultLang, setDefaultLang] = useState('tr');
  const [loading, setLoading] = useState(true);

  const fetchLanguages = useCallback(async () => {
    try {
      const langs = await languagesApi.getLanguages();
      setLanguages(langs);

      const def = langs.find(l => l.is_default);
      const safeDefaultCode = normalizeSupportedLang(def?.code);
      if (def) {
        setDefaultLang(safeDefaultCode);
      }

      // If current lang is not in the active list, switch to default
      const currentExists = langs.find(l => l.code === currentLang);
      if (!currentExists && def) {
        setCurrentLangState(safeDefaultCode);
        localStorage.setItem('qrmenu_lang', safeDefaultCode);
        i18n.changeLanguage(safeDefaultCode);
      }
    } catch (err) {
      console.error('Failed to fetch languages:', err);
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const setLang = (code) => {
    const safeCode = normalizeSupportedLang(code);
    setCurrentLangState(safeCode);
    localStorage.setItem('qrmenu_lang', safeCode);
    i18n.changeLanguage(safeCode);
  };

  const refreshLanguages = () => {
    fetchLanguages();
  };

  return (
    <LanguageContext.Provider value={{
      languages,
      currentLang,
      setLang,
      defaultLang,
      loading,
      refreshLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
