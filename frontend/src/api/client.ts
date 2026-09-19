import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getLogs = () => api.get('/logs').then(res => res.data);
export const getMetrics = () => api.get('/metrics').then(res => res.data);
export const getPolicies = () => api.get('/policies').then(res => res.data);
export const updatePolicies = (policies: any) => api.post('/policies', policies).then(res => res.data);

export default api;
