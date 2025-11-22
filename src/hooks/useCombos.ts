import { useState, useEffect } from 'react';
import { listCombos } from '../services/comboService';
import type { Combo } from '../types';

export const useCombos = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const data = await listCombos('b72f395a-38c0-4b02-bf08-2c1b2da5834b');
        setCombos(data);
      } catch (error) {
        console.error('Error fetching combos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  return { combos, loading };
};
