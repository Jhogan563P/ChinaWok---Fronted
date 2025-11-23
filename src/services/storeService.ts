import { storesClient } from './apiClient';
import { stores as mockStores } from '../data/stores';
import type { Store, DeliveryOption, StoreFilters, ApiResponse } from '../types';

// Flag para usar mock data o API real
const USE_MOCK_DATA = false;

/**
 * Opciones de despacho disponibles
 */
export const deliveryOptions: DeliveryOption[] = [
  {
    type: 'delivery',
    label: 'Delivery',
    icon: '🚴',
    description: 'Entrega a domicilio'
  },
  {
    type: 'pickup',
    label: 'Retiro en Tienda',
    icon: '🏪',
    description: 'Recoge tu pedido en local'
  }
];

/**
 * Convierte tienda mock al formato de la API
 */
const convertMockStore = (mockStore: any): Store => ({
  id: mockStore.id.toString(),
  name: mockStore.name,
  address: mockStore.address,
  district: mockStore.district || '',
  city: mockStore.city || 'Lima',
  phone: mockStore.phone || '612-8000',
  deliveryTypes: ['delivery', 'pickup'],
  isActive: true
});

/**
 * Lista todas las tiendas con filtros opcionales
 */
/**
 * Mapea la respuesta del backend al tipo Store del frontend
 */
const mapBackendStoreToFrontend = (data: any): Store => {
  return {
    ...data,
    id: data.local_id || data.id,
    name: data.direccion || 'Tienda China Wok', // Usar dirección como nombre
    address: data.direccion || '',
    phone: data.telefono || '',
    openingHours: data.hora_apertura && data.hora_finalizacion
      ? `${data.hora_apertura} - ${data.hora_finalizacion}`
      : '08:00 - 22:00',
    deliveryTypes: ['delivery', 'pickup'], // Default hardcoded
    isActive: true
  };
};

/**
 * Lista todas las tiendas con filtros opcionales
 */
export const listStores = async (filters?: StoreFilters): Promise<Store[]> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredStores = mockStores;

    if (filters?.district) {
      filteredStores = filteredStores.filter((store) =>
        store.name.toLowerCase().includes(filters.district!.toLowerCase())
      );
    }

    return filteredStores.map(convertMockStore);
  }

  try {
    // La API Lambda devuelve directamente la lista de items en el body
    const response = await storesClient.get<any[]>('/local/listar', {
      params: filters
    });

    // Verificamos si es un array directamente o si viene envuelto
    const data = response.data;
    let storesList: any[] = [];

    if (Array.isArray(data)) {
      storesList = data;
    } else if ((data as any).data && Array.isArray((data as any).data)) {
      storesList = (data as any).data;
    }

    return storesList.map(mapBackendStoreToFrontend);
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

/**
 * Obtiene una tienda por ID
 */
export const getStoreById = async (id: string): Promise<Store | null> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockStore = mockStores.find((s) => s.id.toString() === id);
    return mockStore ? convertMockStore(mockStore) : null;
  }

  try {
    const response = await storesClient.get<any>(`/local/obtener/${id}`);
    const data = response.data;

    let storeData = data;
    if ((data as any).data) {
      storeData = (data as any).data;
    }

    return mapBackendStoreToFrontend(storeData);
  } catch (error) {
    console.error('Error fetching store:', error);
    throw error;
  }
};

/**
 * Busca tiendas por distrito o ciudad
 */
export const searchStores = async (query: string): Promise<Store[]> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const filteredStores = mockStores.filter(
      (store) =>
        store.name.toLowerCase().includes(query.toLowerCase()) ||
        (store.address && store.address.toLowerCase().includes(query.toLowerCase()))
    );

    return filteredStores.map(convertMockStore);
  }

  try {
    const response = await storesClient.get<ApiResponse<Store[]>>('/stores/search', {
      params: { q: query }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
};

/**
 * Obtiene las opciones de despacho
 */
export const getDeliveryOptions = (): DeliveryOption[] => {
  return deliveryOptions;
};
