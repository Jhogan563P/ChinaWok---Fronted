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
 * Actualiza la información del usuario autenticado (propio perfil)
 */
export const updateMyProfile = async (data: Partial<User>): Promise<User> => {
  try {
    console.log("userService: Enviando datos para actualizar perfil:", data);
    // El backend usa /usuario/me para actualizar el perfil propio
    const response = await usersClient.put<any>('/usuario/me', data);
    console.log("userService: Respuesta de la API al actualizar perfil:", response.data);

    // El backend responde con un objeto { message: string, usuario: User } o { data: User }
    const updatedUser = response.data.usuario || response.data.data || response.data;
    
    if (updatedUser) {
      // Convertir a User si viene como un objeto que parece usuario (ej. sin role por defecto)
      // Asegurarse de que el objeto User tenga el mismo formato que la interfaz User
      const currentUser = getCurrentUser();
      const finalUser: User = {
        correo: updatedUser.correo || (currentUser?.correo || ''),
        nombre: updatedUser.nombre || (currentUser?.nombre || ''),
        role: updatedUser.role || (currentUser?.role || 'Cliente'),
        informacion_bancaria: updatedUser.informacion_bancaria || currentUser?.informacion_bancaria,
      };

      localStorage.setItem('user', JSON.stringify(finalUser));
      console.log("userService: Perfil actualizado en localStorage:", finalUser);
      return finalUser;
    }

    throw new Error('No se recibió la información actualizada del usuario.');
  } catch (error) {
    console.error('userService: Error al actualizar el perfil:', error);
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

/**
 * Elimina la cuenta del usuario autenticado
 */
export const deleteUser = async (): Promise<void> => {
  try {
    await usersClient.delete('/usuario/me');

    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
