import PromoCarousel from '../components/common/PromoCarousel';
import ProductCard from '../components/products/ProductCard';
import SkeletonGrid from '../components/shared/SkeletonGrid';
import { useProducts } from '../hooks/useProducts';
import { listCategories } from '../services/productService';
import ProductFilters from '../components/products/ProductFilters';
import type { Product } from '../data/products';
import { useMemo, useState } from 'react';

const categories = listCategories();

const PromotionsPage = () => {
  const [activeCategory, setActiveCategory] = useState<Product['category']>('Para compartir');
  const { products, loading } = useProducts({ category: activeCategory });

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Para compartir') {
      return products;
    }
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory, products]);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-10">
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-secondary">Promociones</p>
            <h1 className="text-3xl font-bold text-dark-text">Para compartir</h1>
          </div>
          <ProductFilters
            categories={categories}
            active={activeCategory}
            onSelect={(category) => setActiveCategory(category)}
          />
        </div>
        <PromoCarousel />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-dark-text">Elige tu promo</h2>
          <button className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-secondary transition hover:border-secondary hover:bg-secondary hover:text-white">
            Filtrar
          </button>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PromotionsPage;
