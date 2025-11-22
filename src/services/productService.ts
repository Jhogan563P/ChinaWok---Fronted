import { ordersClient } from './apiClient';
import type { Product, ApiResponse } from '../types';

/**
 * Lista todos los productos de un local
 */
export const listProducts = async (localId: string): Promise<Product[]> => {
  try {
    const response = await ordersClient.get<ApiResponse<Product[]>>('/productos', {
      params: { local_id: localId }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Lista todas las categorías de productos
 */
export const listCategories = async (): Promise<string[]> => {
  try {
    // Simulando la obtención de categorías. Idealmente, esto vendría de un endpoint.
    const categories = ["Arroces", "Tallarines", "Pollo al wok", "Carne de res", "Cerdo", "Mariscos", "Entradas", "Guarniciones", "Sopas", "Combos", "Bebidas", "Postres"];
    return Promise.resolve(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
