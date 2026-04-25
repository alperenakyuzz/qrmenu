import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qrmenu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isAuthRoute = error.config?.url?.includes('/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('qrmenu_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- AUTH ----
export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then(r => r.data),

  getMe: () =>
    api.get('/auth/me').then(r => r.data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then(r => r.data),
};

// ---- LANGUAGES ----
export const languagesApi = {
  getLanguages: () =>
    api.get('/languages').then(r => r.data),

  getAllLanguages: () =>
    api.get('/languages/all').then(r => r.data),

  createLanguage: (data) =>
    api.post('/languages', data).then(r => r.data),

  updateLanguage: (id, data) =>
    api.put(`/languages/${id}`, data).then(r => r.data),

  deleteLanguage: (id) =>
    api.delete(`/languages/${id}`).then(r => r.data),
};

// ---- CATEGORIES ----
export const categoriesApi = {
  getCategories: (lang) =>
    api.get('/categories', { params: { lang } }).then(r => r.data),

  getAllCategories: (lang) =>
    api.get('/categories/all', { params: { lang } }).then(r => r.data),

  createCategory: (data) =>
    api.post('/categories', data).then(r => r.data),

  updateCategory: (id, data) =>
    api.put(`/categories/${id}`, data).then(r => r.data),

  deleteCategory: (id) =>
    api.delete(`/categories/${id}`).then(r => r.data),

  reorderCategories: (items) =>
    api.put('/categories/reorder', { items }).then(r => r.data),
};

// ---- ALLERGENS ----
export const allergensApi = {
  getAllergens: () => api.get('/allergens').then((r) => r.data),

  createAllergen: (data) => api.post('/allergens', data).then((r) => r.data),

  updateAllergen: (id, data) => api.put(`/allergens/${id}`, data).then((r) => r.data),

  deleteAllergen: (id) => api.delete(`/allergens/${id}`).then((r) => r.data),
};

// ---- MENU ITEMS ----
export const menuItemsApi = {
  /** Tüm aktif ürünler (kategori filtresi yok); public */
  getPublicMenuCatalog: (lang) =>
    api.get('/menu-items', { params: { lang } }).then((r) => r.data),

  getMenuItems: (categoryId, lang) =>
    api.get('/menu-items', { params: { category_id: categoryId, lang } }).then(r => r.data),

  getAllMenuItems: (categoryId, lang) =>
    api.get('/menu-items/all', { params: { category_id: categoryId, lang } }).then(r => r.data),

  getFeaturedItems: (lang) =>
    api.get('/menu-items/featured', { params: { lang } }).then(r => r.data),

  createMenuItem: (data) =>
    api.post('/menu-items', data).then(r => r.data),

  updateMenuItem: (id, data) =>
    api.put(`/menu-items/${id}`, data).then(r => r.data),

  deleteMenuItem: (id) =>
    api.delete(`/menu-items/${id}`).then(r => r.data),
};

// ---- SETTINGS ----
export const settingsApi = {
  getSettings: () =>
    api.get('/settings').then(r => r.data),

  updateSettings: (data) =>
    api.put('/settings', data).then(r => r.data),
};

// ---- UPLOADS ----
export const uploadsApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },

  deleteImage: (filename) =>
    api.delete('/uploads/image', { data: { filename } }).then(r => r.data),
};

export default api;
