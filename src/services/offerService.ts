import { ordersClient } from './apiClient';
import type { Offer, ApiResponse } from '../types';

/**
 * Lista todas las ofertas de un local
 */
export const listOffers = async (localId: string): Promise<Offer[]> => {
  try {
    const response = await ordersClient.get<ApiResponse<Offer[]>>('/ofertas', {
      params: { local_id: localId }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};
