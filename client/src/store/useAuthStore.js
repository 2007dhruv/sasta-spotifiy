import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://192.168.1.14:3000';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      set({ user, token: access_token, isAuthenticated: true, loading: false, error: null });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
    }
  },

  signup: async (email, password, name, role = 'client') => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { email, password, name, role });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      set({ user, token: access_token, isAuthenticated: true, loading: false, error: null });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Signup failed', loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  isCheckingAuth: false,
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isCheckingAuth: true });
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isCheckingAuth: false 
      });
    } catch (err) {
      console.error('Session check failed:', err);
      localStorage.removeItem('token');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isCheckingAuth: false 
      });
    }
  },

  // Admin Actions
  artists: [],
  fetchArtists: async () => {
    const { token } = useAuthStore.getState();
    try {
      const response = await axios.get(`${API_URL}/admin/artists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ artists: response.data });
    } catch (err) {
      console.error('Failed to fetch artists:', err);
    }
  },

  verifyArtist: async (id) => {
    const { token, fetchArtists } = useAuthStore.getState();
    try {
      await axios.patch(`${API_URL}/admin/verify-artist/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchArtists(); // Refresh the list
    } catch (err) {
      console.error('Failed to verify artist:', err);
    }
  },

  blockUser: async (id) => {
    const { token, fetchArtists } = useAuthStore.getState();
    try {
      await axios.patch(`${API_URL}/admin/block-user/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchArtists(); // Refresh
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  }
}));
