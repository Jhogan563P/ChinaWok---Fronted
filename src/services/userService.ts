import { usersClient } from './apiClient';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse
} from '../types';

// Flag para usar mock data o API real
const USE_MOCK_DATA = false;


/**
 * Registra un nuevo usuario
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await usersClient.post<AuthResponse>('/usuario/registrar', data);

    // Guardar token y usuario
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.usuario));

    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Inicia sesión
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await usersClient.post<AuthResponse>('/usuario/login', credentials);

    // Guardar token y usuario
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.usuario));

    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Cierra sesión
 */
export const logout = async (): Promise<void> => {
  // Limpiar localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  if (!USE_MOCK_DATA) {
    try {
      await usersClient.post('/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
};

/**
 * Obtiene el usuario actual desde localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};
