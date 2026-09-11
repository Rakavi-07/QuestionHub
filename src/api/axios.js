import axios from 'axios';
import { getToken, logout } from '@/utils/auth';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto logout only for protected requests.
// Do not redirect while login itself is failing.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (status === 401 && !isAuthRequest && getToken()) {
      logout({ redirect: true });
    }

    return Promise.reject(error);
  }
);

export default api;