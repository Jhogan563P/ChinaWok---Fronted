import { ordersClient } from './apiClient';
import type { Combo, ApiResponse } from '../types';

/**
 * Lista todos los combos de un local
 */
export const listCombos = async (localId: string): Promise<Combo[]> => {
  try {
    const response = await ordersClient.get<ApiResponse<Combo[]>>('/combos', {
      params: { local_id: localId }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching combos:', error);
    throw error;
  }
};
