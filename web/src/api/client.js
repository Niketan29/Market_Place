import axios from 'axios'

const api = axios.create({
  baseURL: 'https://market-place-1-bo3z.onrender.com'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password })

export const getProducts = (params) =>
  api.get('/products', { params })

export const getProductById = (id) =>
  api.get(`/products/${id}`)

export const addFavorite = (id) =>
  api.post(`/products/${id}/favorite`)

export const removeFavorite = (id) =>
  api.delete(`/products/${id}/favorite`)

export default api
