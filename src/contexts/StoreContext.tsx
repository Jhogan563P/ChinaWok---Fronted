import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Store } from '../types';
import { listStores, getStoreById } from '../services/storeService';

interface StoreContextType {
  selectedStore: Store | null;
  stores: Store[];
  loading: boolean;
  selectStore: (storeId: string) => Promise<void>;
  refreshStores: () => Promise<Store[]>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStores = async () => {
    try {
      setLoading(true);
      const data = await listStores();
      setStores(data);
      return data; // Return the data for use in initStore
    } catch (error) {
      console.error('Error loading stores:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const selectStore = async (storeId: string) => {
    try {
      const previousStoreId = selectedStore?.id || null;

      // Intentar encontrar en la lista actual primero
      const store = stores.find(s => s.id === storeId);

      if (store) {
        setSelectedStore(store);
        localStorage.setItem('selectedStoreId', storeId);

        // Emitir evento de cambio de local
        if (previousStoreId && previousStoreId !== storeId) {
          const event = new CustomEvent('storeChanged', {
            detail: { newStoreId: storeId, oldStoreId: previousStoreId }
          });
          window.dispatchEvent(event);
        }
      } else {
        // Si no está en la lista, buscarlo individualmente
        const fetchedStore = await getStoreById(storeId);
        if (fetchedStore) {
          setSelectedStore(fetchedStore);
          localStorage.setItem('selectedStoreId', storeId);

          // Emitir evento de cambio de local
          if (previousStoreId && previousStoreId !== storeId) {
            const event = new CustomEvent('storeChanged', {
              detail: { newStoreId: storeId, oldStoreId: previousStoreId }
            });
            window.dispatchEvent(event);
          }
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
      // Primero obtener los locales
      const storesList = await refreshStores();

      if (storesList.length === 0) {
        console.warn('No stores available');
        return;
      }

      // Intentar recuperar selección previa del localStorage
      const savedStoreId = localStorage.getItem('selectedStoreId');

      if (savedStoreId) {
        // Verificar si el ID guardado existe en la lista actual
        const storeExists = storesList.some(s => s.id === savedStoreId);
        if (storeExists) {
          await selectStore(savedStoreId);
        } else {
          // Si el ID guardado no existe, seleccionar el primer local disponible
          console.log('Saved store not found, selecting first available store');
          await selectStore(storesList[0].id);
        }
      } else {
        // Si no hay ID guardado, seleccionar el primer local disponible
        console.log('No saved store, selecting first available store:', storesList[0].name);
        await selectStore(storesList[0].id);
      }
    };

    initStore();
  }, []);

  return (
    <StoreContext.Provider value={{ selectedStore, stores, loading, selectStore, refreshStores }}>
      {children}
    </StoreContext.Provider>
  );
};
