import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';
import * as userService from '../services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      const savedUser = userService.getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Inicia sesión
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await userService.login(credentials);
      setUser(response.usuario);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   */
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await userService.register(data);
      setUser(response.usuario);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierra sesión
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await userService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar el estado aunque haya error
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualiza los datos del usuario
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};
