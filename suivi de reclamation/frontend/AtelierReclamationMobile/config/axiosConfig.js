import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration globale d'axios avec la bonne IP
const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.18:8000/api', 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout de connexion');
    } else if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userRole');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
