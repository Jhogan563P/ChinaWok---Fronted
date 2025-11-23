import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Store } from '../types';
import { listStores, getStoreById } from '../services/storeService';

interface StoreContextType {
  selectedStore: Store | null;
  stores: Store[];
  loading: boolean;
  selectStore: (storeId: string) => Promise<void>;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// ID por defecto para mantener compatibilidad inicial
const DEFAULT_STORE_ID = '4ed35112-f906-453f-a22a-d9055ee86ba3';

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStores = async () => {
    try {
      setLoading(true);
      const data = await listStores();
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectStore = async (storeId: string) => {
    try {
      // Intentar encontrar en la lista actual primero
      const store = stores.find(s => s.id === storeId);

      if (store) {
        setSelectedStore(store);
        localStorage.setItem('selectedStoreId', storeId);
      } else {
        // Si no está en la lista, buscarlo individualmente
        const fetchedStore = await getStoreById(storeId);
        if (fetchedStore) {
          setSelectedStore(fetchedStore);
          localStorage.setItem('selectedStoreId', storeId);
        }
      }
    } catch (error) {
      console.error('Error selecting store:', error);
      // Si falla la selección (ej. ID inválido), limpiar localStorage para evitar bucle
      if (storeId === localStorage.getItem('selectedStoreId')) {
        localStorage.removeItem('selectedStoreId');
      }
    }
  };

  // Carga inicial
  useEffect(() => {
    const initStore = async () => {
      await refreshStores();

      // Recuperar selección previa o usar default
      const savedStoreId = localStorage.getItem('selectedStoreId') || DEFAULT_STORE_ID;
      await selectStore(savedStoreId);
    };

    initStore();
  }, []);

  return (
    <StoreContext.Provider value={{ selectedStore, stores, loading, selectStore, refreshStores }}>
      {children}
    </StoreContext.Provider>
  );
};
