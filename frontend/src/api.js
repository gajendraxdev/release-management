import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getReleases = () => api.get('/releases');
export const getRelease = (id) => api.get(`/releases/${id}`);
export const createRelease = (data) => api.post('/releases', data);
export const updateRelease = (id, data) => api.patch(`/releases/${id}`, data);
export const toggleStep = (id, stepIndex) => api.patch(`/releases/${id}/toggle-step`, { stepIndex });
export const deleteRelease = (id) => api.delete(`/releases/${id}`);

export default api;
