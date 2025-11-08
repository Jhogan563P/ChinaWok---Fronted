import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://api.chinawok.local',
  timeout: 10000
});

export default apiClient;
