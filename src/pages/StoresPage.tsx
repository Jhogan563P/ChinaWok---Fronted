import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getDeliveryOptions } from '../services/storeService';

const StoresPage = () => {
  const { stores, loading, selectStore } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>('all');
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-dark-text">Encuentra tu China Wok más cercano</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa tu distrito o centro comercial preferido para ubicar el local ideal.
        </p>

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
            {deliveryOptions.map((option) => (
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
          <div className="grid gap-4 md:grid-cols-2">
            {filteredStores.map((store) => (
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
                    </div>
                  </div>

                  {/* Tipos de despacho del local */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {deliveryOptions.map((option) => {
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
        )}
      </section>
    </div>
  );
};

export default StoresPage;
