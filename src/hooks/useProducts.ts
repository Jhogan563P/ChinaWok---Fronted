import { useEffect, useState, useMemo } from 'react';
import type { Product } from '../types';
import { listProducts } from '../services/productService';

interface UseProductsOptions {
  localId?: string;
  categoria?: string;
}

export const useProducts = ({ localId = "b72f395a-38c0-4b02-bf08-2c1b2da5834b", categoria }: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (localId) {
      listProducts(localId)
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
    }

    return () => {
      isMounted = false;
    };
  }, [localId]);

  const filteredProducts = useMemo(() => {
    if (categoria && categoria !== 'Para compartir') {
      return products.filter(product => product.categoria === categoria);
    }
    return products;
  }, [products, categoria]);

  return { products: filteredProducts, loading };
};
