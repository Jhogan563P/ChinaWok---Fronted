import { useState, useEffect } from 'react';
import { listOffers } from '../services/offerService';
import type { Offer } from '../types';

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await listOffers('b72f395a-38c0-4b02-bf08-2c1b2da5834b');
        setOffers(data);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return { offers, loading };
};
