import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { settingsApi } from './api/index.js';

// Public pages
import Home from './pages/Home.jsx';
import CategoryMenu from './pages/CategoryMenu.jsx';

// Admin pages
import Login from './pages/admin/Login.jsx';
import AdminLayout from './pages/admin/Layout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import CategoriesAdmin from './pages/admin/CategoriesAdmin.jsx';
import MenuItemsAdmin from './pages/admin/MenuItemsAdmin.jsx';
import AllergensAdmin from './pages/admin/AllergensAdmin.jsx';
import LanguagesAdmin from './pages/admin/LanguagesAdmin.jsx';
import SettingsAdmin from './pages/admin/SettingsAdmin.jsx';

export default function App() {
  useEffect(() => {
    const applyTheme = (settings) => {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', settings.theme_primary_color || '#d4a017');
      root.style.setProperty('--theme-background', settings.theme_background_color || '#0a0a0a');
      root.style.setProperty('--theme-surface', settings.theme_surface_color || '#111827');
      root.style.setProperty('--theme-text', settings.theme_text_color || '#f3f4f6');
    };

    settingsApi
      .getSettings()
      .then(applyTheme)
      .catch(() => {
        applyTheme({});
      });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/menu/:categoryId" element={<CategoryMenu />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="menu-items" element={<MenuItemsAdmin />} />
              <Route path="allergens" element={<AllergensAdmin />} />
              <Route path="languages" element={<LanguagesAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            {/* Catch-all: redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
