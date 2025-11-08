import { products } from '../data/products';
import type { Product } from '../data/products';

export const listProducts = async (category?: Product['category']) => {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(300);

  if (!category || category === 'Para compartir') {
    return products;
  }

  return products.filter((product) => product.category === category);
};

export const listCategories = () => {
  const categories = Array.from(new Set(products.map((product) => product.category)));
  return ['Para compartir', ...categories.filter((category) => category !== 'Para compartir')];
};
