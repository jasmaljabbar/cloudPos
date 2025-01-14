// src/services/auth.js
import api from './api';

export const authService = {
  async login(username, password) {
    try {
      const csrfToken = await getCSRFToken();
      api.defaults.headers.common['X-Frappe-CSRF-Token'] = csrfToken;
      
      const response = await api.post('/api/method/login', {
        usr: username,
        pwd: password
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await api.get('/api/method/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async checkAuthStatus() {
    try {
      const response = await api.get('/api/method/frappe.auth.get_logged_user');
      return response.data.message;
    } catch (error) {
      return null;
    }
  }
};