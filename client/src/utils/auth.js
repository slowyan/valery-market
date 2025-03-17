import axios from 'axios';
import config from '../config';

// Добавляем интерцептор для всех запросов
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерцептор для обработки ответов
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Если получаем 401, очищаем токен и перенаправляем на страницу входа
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

export const isAdmin = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return false;

  try {
    // Декодируем JWT токен
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.isAdmin === true;
  } catch (error) {
    console.error('Ошибка при проверке прав администратора:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('user');
  window.location.href = '/admin/login';
};

export default {
  isAuthenticated,
  isAdmin,
  logout
}; 
 