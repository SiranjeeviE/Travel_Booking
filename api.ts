import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000, 
});

// Automatically attach JWT token to requests if it exists in localStorage
API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Storage access failed", e);
  }
  return config;
});

// Add a response interceptor for global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn("⚠️ Backend server (localhost:5000) is unreachable. The application is now running in Demo Mode.");
    }
    return Promise.reject(error);
  }
);

export default API;