import { useState, useEffect } from 'react';
import { listCombos } from '../services/comboService';
import { useStore } from '../contexts/StoreContext';
import type { Combo } from '../types';

export const useCombos = () => {
  const { selectedStore } = useStore();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      if (!selectedStore?.id) return;

      try {
        setLoading(true);
        const data = await listCombos(selectedStore.id);
        setCombos(data);
      } catch (error) {
        console.error('Error fetching combos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, [selectedStore?.id]);

  return { combos, loading };
};
