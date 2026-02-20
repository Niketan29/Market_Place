import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 10.0.2.2 for Android emulator; for physical device use your machine's LAN IP
const BASE_URL = 'http://192.168.1.41:3000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if present
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (name, email, password) =>
  client.post('/auth/register', { name, email, password });

export const login = (email, password) =>
  client.post('/auth/login', { email, password });

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (page = 1, limit = 6, search = '') =>
  client.get('/products', { params: { page, limit, search } });

export const getProductById = (id) => client.get(`/products/${id}`);

// ── Favorites ─────────────────────────────────────────────────────────────────
export const addFavorite = (productId) =>
  client.post(`/products/${productId}/favorite`);

export const removeFavorite = (productId) =>
  client.delete(`/products/${productId}/favorite`);

export default client;
