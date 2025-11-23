import { ordersClient } from './apiClient';
import type { Combo, ApiResponse } from '../types';

/**
 * Lista todos los combos de un local
 */
export const listCombos = async (localId: string): Promise<Combo[]> => {
  try {
    const response = await ordersClient.get<any[]>('/combos', {
      params: { local_id: localId }
    });

    const data = response.data;
    let combosList: any[] = [];

    if (Array.isArray(data)) {
      combosList = data;
    } else if ((data as any).data && Array.isArray((data as any).data)) {
      combosList = (data as any).data;
    }

    return combosList.map((item: any) => ({
      ...item,
      id: item.combo_id, // Ensure ID availability if needed
      // Map backend fields if necessary, though interface now matches
    }));
  } catch (error) {
    console.error('Error fetching combos:', error);
    throw error;
  }
};
