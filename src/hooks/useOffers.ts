import { useState, useEffect } from 'react';
import { listOffers } from '../services/offerService';
import { useStore } from '../contexts/StoreContext';
import type { Offer } from '../types';

export const useOffers = () => {
  const { selectedStore } = useStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!selectedStore?.id) return;

      try {
        setLoading(true);
        console.log("Fetching offers for store ID:", selectedStore.id); // DEBUG
        const data = await listOffers(selectedStore.id);
        console.log("Offers received in hook:", data); // DEBUG
        setOffers(data);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [selectedStore?.id]);

  return { offers, loading };
};
