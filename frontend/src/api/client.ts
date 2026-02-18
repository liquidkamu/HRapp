import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = 'http://100.85.35.9:3001';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

export const requestsApi = {
  getAll: () => apiClient.get('/requests'),
  create: (data: any) => apiClient.post('/requests', data),
  approve: (id: string) => apiClient.put(`/requests/${id}/approve`, {}),
  reject: (id: string) => apiClient.put(`/requests/${id}/reject`, {}),
};

export const balanceApi = {
  get: () => apiClient.get('/balance'),
};

export const reportsApi = {
  getSummary: () => apiClient.get('/reports/summary'),
};
