import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling global API responses and failures
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skeletons for future auth token refresh logic or redirect interceptors
    return Promise.reject(error);
  }
);

export default apiClient;
