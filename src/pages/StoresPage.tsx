import { useMemo, useState } from 'react';
import { stores } from '../data/stores';

const StoresPage = () => {
  const [search, setSearch] = useState('');
  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      `${store.name} ${store.address}`.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-dark-text">Encuentra tu China Wok más cercano</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa tu distrito o centro comercial preferido para ubicar el local ideal.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
            placeholder="Buscar por distrito, tienda o peaje"
          />
          <button className="rounded-full bg-secondary px-6 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90">
            Ir a menú
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-dark-text">Locales disponibles</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredStores.map((store) => (
            <article
              key={store.id}
              className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <p className="text-xs font-semibold uppercase text-secondary">{store.deliveryType}</p>
                <h3 className="mt-2 text-xl font-semibold text-dark-text">{store.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{store.address}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-secondary transition hover:border-secondary hover:bg-secondary hover:text-white">
                  Ver local
                </button>
                <span className="text-xs font-semibold uppercase text-gray-400">Tipo de despacho</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StoresPage;
