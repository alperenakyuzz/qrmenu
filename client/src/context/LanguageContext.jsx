import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { languagesApi } from '../api/index.js';
import i18n from '../i18n/index.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [languages, setLanguages] = useState([]);
  const [currentLang, setCurrentLangState] = useState(
    () => localStorage.getItem('qrmenu_lang') || 'tr'
  );
  const [defaultLang, setDefaultLang] = useState('tr');
  const [loading, setLoading] = useState(true);

  const fetchLanguages = useCallback(async () => {
    try {
      const langs = await languagesApi.getLanguages();
      setLanguages(langs);

      const def = langs.find(l => l.is_default);
      if (def) {
        setDefaultLang(def.code);
      }

      // If current lang is not in the active list, switch to default
      const currentExists = langs.find(l => l.code === currentLang);
      if (!currentExists && def) {
        setCurrentLangState(def.code);
        localStorage.setItem('qrmenu_lang', def.code);
        i18n.changeLanguage(def.code);
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
    setCurrentLangState(code);
    localStorage.setItem('qrmenu_lang', code);
    i18n.changeLanguage(code);
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
