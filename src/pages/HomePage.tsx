import PromoCarousel from '../components/common/PromoCarousel';
import ProductFilters from '../components/products/ProductFilters';
import ProductCard from '../components/products/ProductCard';
import ComboCarousel from '../components/products/ComboCarousel';
import SkeletonGrid from '../components/shared/SkeletonGrid';
import { useProducts } from '../hooks/useProducts';
import { useCombos } from '../hooks/useCombos';
import { listCategories } from '../services/productService';
import type { Product } from '../types';
import { useMemo, useState, useEffect } from 'react';

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('Para compartir');
  const [categories, setCategories] = useState<string[]>(['Para compartir']);
  const [showAll, setShowAll] = useState(false);

  // ------------ PAGINACIÓN ------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Ajustable

  const { products, loading: loadingProducts } = useProducts({ categoria: activeCategory });
  const { combos, loading: loadingCombos } = useCombos();

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await listCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Reset a página 1 al cambiar categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, showAll]);

  // Filtrado por categoría (manteniendo tu lógica)
  const filteredProducts = useMemo(() => {
    // Si "Ver todos" está activo, mostrar todos los productos
    if (showAll) {
      return products;
    }
    // Si la categoría es "Para compartir", mostrar todos
    if (activeCategory === 'Para compartir') {
      return products;
    }
    // Filtrar por categoría específica
    return products.filter((product) => product.categoria === activeCategory);
  }, [activeCategory, products, showAll]);

  // ------------ PAGINACIÓN: CÁLCULO ------------
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.slice(start, end);
  }, [currentPage, filteredProducts]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Determinar el título de la sección
  const sectionTitle = showAll ? 'Todos los productos' : activeCategory;

  // Manejar click en "Ver todos"
  const handleViewAll = () => {
    setShowAll(true);
    setActiveCategory('Para compartir');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      {/* ------------------- PROMOCIONES ------------------- */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-text">Promociones destacadas</h1>
            <p className="text-sm text-gray-600">
              Elige tus favoritos para disfrutar en pareja, familia o con amigos.
            </p>
          </div>

          <ProductFilters
            categories={categories}
            active={activeCategory}
            onSelect={(categoria) => {
              setActiveCategory(categoria);
              setShowAll(false);
            }}
            onViewAll={handleViewAll}
          />
        </div>

        <PromoCarousel />
      </section>

      {/* ------------------- SECCIÓN PRODUCTOS ------------------- */}
      <section id="products-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-dark-text">{sectionTitle}</h2>
        </div>

        {loadingProducts ? (
          <SkeletonGrid />
        ) : (
          <>
            {/* GRID PAGINADO */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.nombre} product={product} />
              ))}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>

                <span className="px-4 py-2 font-semibold text-dark-text">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ------------------- SECCIÓN COMBOS ------------------- */}
      <section id="combos-section" className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase text-secondary">Combos</p>
          <h2 className="text-2xl font-semibold text-dark-text">Nuestros Combos</h2>
        </div>
        {loadingCombos ? (
          <SkeletonGrid />
        ) : combos.length === 0 ? (
          <div className="rounded-3xl bg-gray-50 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-dark-text">No hay combos disponibles</h3>
            <p className="mt-2 text-sm text-gray-600">
              Este local no tiene combos activos en este momento.
            </p>
          </div>
        ) : (
          <ComboCarousel combos={combos} />
        )}
      </section>
    </div>
  );
};

export default HomePage;
