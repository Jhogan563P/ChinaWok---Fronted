import { useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { listProducts } from '../services/productService';

interface UseProductsOptions {
  category?: Product['category'];
}

export const useProducts = ({ category }: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    listProducts(category)
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

    return () => {
      isMounted = false;
    };
  }, [category]);

  return { products, loading };
};
