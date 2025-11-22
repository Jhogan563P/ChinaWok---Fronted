import axios, { AxiosInstance, AxiosError } from 'axios';

// Timeout por defecto
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Headers comunes para todas las APIs
const commonHeaders = {
  'Content-Type': 'application/json'
};

// =====================================================
// CLIENTE PARA MICROSERVICIO DE USUARIOS
// =====================================================
// Endpoints: /register, /login, /users, /users/{id}
export const usersClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_USUARIOS_URL || '',
  timeout,
  headers: commonHeaders
});

// =====================================================
// CLIENTE PARA MICROSERVICIO DE LOCALES
// =====================================================
// Endpoints: /stores, /stores/{id}, /delivery-types
export const storesClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_LOCALES_URL || '',
  timeout,
  headers: commonHeaders
});

// =====================================================
// CLIENTE PARA MICROSERVICIO DE PEDIDOS
// =====================================================
// Endpoints: /products, /orders, /offers, /combos
export const ordersClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PEDIDOS_URL || '',
  timeout,
  headers: commonHeaders
});

// =====================================================
// INTERCEPTORES GLOBALES
// =====================================================

// Función para agregar token de autenticación si existe
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Función para manejar errores de respuesta
const handleResponseError = (error: AxiosError) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    console.error('Error de respuesta:', {
      status: error.response.status,
      data: error.response.data,
      url: error.config?.url
    });

    // Manejar errores específicos
    if (error.response.status === 401) {
      // Token expirado o inválido - limpiar storage y redirigir
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Aquí podrías redirigir al login si es necesario
    }
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    console.error('Error de red - sin respuesta:', error.request);
  } else {
    // Algo sucedió al configurar la petición
    console.error('Error de configuración:', error.message);
  }

  return Promise.reject(error);
};

// Aplicar interceptores a todos los clientes
[usersClient, storesClient, ordersClient].forEach(client => {
  // Interceptor de request para agregar token
  client.interceptors.request.use(addAuthToken, error => Promise.reject(error));

  // Interceptor de response para manejar errores
  client.interceptors.response.use(
    response => response,
    handleResponseError
  );
});

// Exportar cliente por defecto (ordersClient) para compatibilidad
export default ordersClient;
