import { ordersClient } from './apiClient';
import type { Product, ApiResponse, PaginatedResponse } from '../types';

/**
 * Lista todos los productos de un local
 */
export const listProducts = async (localId: string): Promise<Product[]> => {
  try {
    const response = await ordersClient.get<Product[]>('/productos', {
      params: { local_id: localId }
    });

    const data = response.data;
    if (Array.isArray(data)) return data;
    if ((data as any).data && Array.isArray((data as any).data)) return (data as any).data;
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Obtiene un producto por su nombre y local_id
 */
export const getProductByNameAndLocalId = async (localId: string, productName: string): Promise<Product | null> => {
  try {
    console.log(`Buscando producto: ${productName} para local: ${localId}`); // DEBUG

    // Cambiar el tipo genérico a 'any' para manejar las respuestas de la API de forma más flexible.
    const response = await ordersClient.get<any>('/productos', {
      params: { local_id: localId, nombre: productName }
    });

    console.log(`Respuesta RAW de la API de productos para ${productName}:`, response.data); // DEBUG
    
    let productResult: Product | null = null;

    if (response.data && response.data.data) {
        // Caso 1: La respuesta es { data: Product } o { data: Product[] }
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
            productResult = response.data.data[0];
        } else if (!Array.isArray(response.data.data) && typeof response.data.data === 'object') {
            productResult = response.data.data;
        }
    } else if (response.data && !response.data.data && typeof response.data === 'object' && response.data.nombre === productName) {
        // Caso 2: La respuesta es directamente el objeto Product
        productResult = response.data;
    }


    if (productResult) {
        console.log(`Producto encontrado:`, productResult); // DEBUG
        // Asegurarse de que el precio sea un número
        if (typeof productResult.precio === 'string') {
            productResult.precio = parseFloat(productResult.precio);
        }
        return productResult;
    }
    
    console.log(`No se encontró el producto ${productName} para el local ${localId}.`); // DEBUG
    return null;
  } catch (error) {
    console.error(`Error fetching product with name ${productName} for local ${localId}:`, error);
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
