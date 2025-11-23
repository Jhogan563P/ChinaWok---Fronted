import { useEffect, useState, useMemo } from 'react';
import type { Product } from '../types';
import { listProducts } from '../services/productService';
import { useStore } from '../contexts/StoreContext';

interface UseProductsOptions {
  localId?: string;
  categoria?: string;
}

export const useProducts = ({ localId, categoria }: UseProductsOptions = {}) => {
  const { selectedStore } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Usar ID proporcionado o el del contexto
  const targetLocalId = localId || selectedStore?.id;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (targetLocalId) {
      listProducts(targetLocalId)
        .then((items) => {
          if (isMounted) {
            setProducts(items);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [targetLocalId]);

  const filteredProducts = useMemo(() => {
    if (categoria && categoria !== 'Para compartir') {
      return products.filter(product => product.categoria === categoria);
    }
    return products;
  }, [products, categoria]);

  return { products: filteredProducts, loading };
};
