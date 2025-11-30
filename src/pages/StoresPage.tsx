import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getDeliveryOptions, getStoreStats } from '../services/storeService';
import type { Store, DeliveryOption } from '../types';

const ITEMS_PER_PAGE = 6;

const StoresPage = () => {
  const { stores, loading, selectStore } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [storeRatings, setStoreRatings] = useState<Record<string, { rating: number; reviews: number }>>({}); // Estado para calificaciones y conteo de reseñas
  const deliveryOptions = getDeliveryOptions();

  

  const handleSelectStore = async (storeId: string) => {
    await selectStore(storeId);
    navigate('/menu');
  };

  const filteredStores = useMemo(() => {
    let filtered = stores;

    // Filtrar por búsqueda
    if (search.trim()) {
      filtered = filtered.filter((store) =>
        `${store.name} ${store.address}`.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    // Filtrar por tipo de despacho
    if (selectedDeliveryType !== 'all') {
      filtered = filtered.filter((store) =>
        store.deliveryTypes.includes(selectedDeliveryType as any)
      );
    }

    return filtered;
  }, [stores, search, selectedDeliveryType]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  // Memoizar currentStores para que su referencia no cambie en cada render
  const currentStores = useMemo(() => filteredStores.slice(startIndex, endIndex), [filteredStores, startIndex, endIndex]);

  // Cargar calificaciones para todos los locales filtrados (rápido al hacer todas las requests),
  // usando concurrencia limitada, cache e in-flight reuse.
  useEffect(() => {
    // Mejoras de rendimiento:
    // - limitar concurrencia de peticiones (para evitar throttling del backend)
    // - reutilizar promesas en vuelo (inFlight) para evitar peticiones duplicadas
    // - cache en memoria (cacheRef) para respuestas ya obtenidas
    let cancelled = false;

    const inFlightRef = (window as any).__cw_inflight__ || {};
    // Guardar referencia global temporal para reutilizar promesas entre renders rápidos
    (window as any).__cw_inflight__ = inFlightRef;

    const cacheRef = (window as any).__cw_cache__ || {};
    (window as any).__cw_cache__ = cacheRef;

    const concurrency = 6; // Ajustable: más concurrencia para acelerar (ajusta si hay throttling)
    let index = 0;

    // Target: pedir para todos los locales filtrados
    const targetStores = filteredStores;

    const runNext = async () => {
      if (cancelled) return;
      const i = index++;
      if (i >= targetStores.length) return;
      const store = targetStores[i];

      // Si ya tenemos en cache, usarlo inmediatamente
      if (cacheRef[store.id]) {
        if (!cancelled) setStoreRatings((prev) => ({ ...prev, [store.id]: cacheRef[store.id] }));
        await runNext();
        return;
      }

      // Si ya hay una promesa en vuelo para este id, reutilizarla
      if (!inFlightRef[store.id]) {
        inFlightRef[store.id] = (async () => {
          try {
            const stats = await getStoreStats(store.id);
            const data = stats && (stats.estadisticas || stats);
            const rating = data?.calificacion_cliente !== undefined
              ? parseFloat(data.calificacion_cliente)
              : 0;
            const reviews = data?.total_resenas !== undefined
              ? parseInt(data.total_resenas, 10) || 0
              : 0;
            const payload = { rating, reviews };
            cacheRef[store.id] = payload; // cachear
            return payload;
          } catch (err) {
            cacheRef[store.id] = { rating: 0, reviews: 0 };
            throw err;
          } finally {
            // no eliminar inFlight aquí para permitir que otras referencias lean la promesa concluida
          }
        })();
      }

      try {
        const payload = await inFlightRef[store.id];
        if (!cancelled) {
          setStoreRatings((prev) => ({ ...prev, [store.id]: payload }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Error fetching rating for store ${store.id}:`, err);
          setStoreRatings((prev) => ({ ...prev, [store.id]: { rating: 0, reviews: 0 } }));
        }
      }

      // continuar con la siguiente tarea en la cola
      await runNext();
    };

    // iniciar un pool de trabajo
    const starters = Math.min(concurrency, targetStores.length);
    for (let s = 0; s < starters; s++) runNext();

    return () => {
      cancelled = true;
    };
  }, [currentStores]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDeliveryType]);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Número de calificaciones cargadas para la página visible
  const loadedCount = currentStores.reduce((acc, s) => acc + (storeRatings[s.id] ? 1 : 0), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-dark-text">Encuentra tu China Wok más cercano</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa tu distrito o centro comercial preferido para ubicar el local ideal.
        </p>
        {/* (Debug) indicador removido; ahora se muestra por página más abajo */}

        {/* Tipo de Despacho */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-dark-text mb-3">Tipo de Despacho</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedDeliveryType('all')}
              className={`flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${selectedDeliveryType === 'all'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
                }`}
            >
              <span className="text-lg">🌟</span>
              Todos
            </button>
            {deliveryOptions.map((option: DeliveryOption) => (
              <button
                key={option.type}
                onClick={() => setSelectedDeliveryType(option.type)}
                className={`flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${selectedDeliveryType === option.type
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-secondary'
                  }`}
              >
                <span className="text-lg">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
            placeholder="Buscar por distrito, tienda o peaje"
          />
          <Link
            to="/menu"
            className="rounded-full bg-secondary px-6 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90"
          >
            Ir a menú
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-dark-text">
            Locales disponibles ({filteredStores.length})
          </h2>
          <div className="text-sm text-gray-500">Calificaciones en página: {loadedCount} / {currentStores.length}</div>
        </div>

        {filteredStores.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">No se encontraron locales con los filtros seleccionados</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedDeliveryType('all');
              }}
              className="mt-4 text-sm font-semibold text-secondary hover:text-primary"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {currentStores.map((store) => (
                <article
                  key={store.id}
                  className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-dark-text">{store.address}</h3>
                        <p className="mt-1 text-sm text-gray-600">🕒 {store.openingHours}</p>
                        {store.phone && (
                          <p className="mt-2 text-sm font-semibold text-primary">
                            📞 {store.phone}
                          </p>
                        )}
                        {/* Mostrar calificación del cliente y conteo de reseñas si está disponible, o "N/A" si no lo está */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-yellow-400">★</span>
                          <span>
                            {(() => {
                              const stats = storeRatings[store.id];
                              if (stats && typeof stats.rating === 'number' && stats.rating > 0) {
                                const reviewsText = stats.reviews > 0 ? ` (${stats.reviews} reseñas)` : '';
                                return `${stats.rating.toFixed(2)} / 5${reviewsText}`;
                              }
                              return 'N/A';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tipos de despacho del local */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {deliveryOptions.map((option: DeliveryOption) => {
                        const hasDeliveryType = store.deliveryTypes.includes(option.type);
                        return (
                          <span
                            key={option.type}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${hasDeliveryType
                              ? 'bg-secondary/10 text-secondary'
                              : 'bg-gray-100 text-gray-400'
                              }`}
                          >
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        store.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-secondary transition hover:border-secondary hover:bg-secondary hover:text-white"
                    >
                      Ver dirección
                    </a>
                    <button
                      onClick={() => handleSelectStore(store.id)}
                      className="text-sm font-semibold text-primary hover:text-secondary"
                    >
                      Ordenar aquí →
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-6">
                <div className="flex items-center gap-2">
                  {/* First Page Button */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                    aria-label="Primera página"
                  >
                    ««
                  </button>

                  {/* Previous Page Button */}
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                    aria-label="Página anterior"
                  >
                    «
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {getPageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNumber = page as number;
                      const isActive = pageNumber === currentPage;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`min-w-[2.5rem] rounded-full px-3 py-2 text-sm font-semibold transition ${isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'border border-gray-200 text-gray-700 hover:border-primary hover:bg-primary hover:text-white'
                            }`}
                          aria-label={`Página ${pageNumber}`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page Button */}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                    aria-label="Página siguiente"
                  >
                    »
                  </button>

                  {/* Last Page Button */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                    aria-label="Última página"
                  >
                    »»
                  </button>
                </div>

                {/* Page Info */}
                <p className="text-sm text-gray-600">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredStores.length)} de {filteredStores.length} locales
                  {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default StoresPage;
