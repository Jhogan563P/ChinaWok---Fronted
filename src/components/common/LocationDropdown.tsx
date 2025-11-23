import { useMemo, useState } from 'react';
import { useStore } from '../../contexts/StoreContext';

const LocationDropdown = () => {
  const { stores, selectedStore, selectStore } = useStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      store.name?.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [stores, search]);

  const handleSelect = async (storeId: string) => {
    await selectStore(storeId);
    setIsOpen(false);
  };

  return (
    <div className="relative hidden min-w-[240px] lg:block">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-light-gray px-4 py-2 text-left text-sm font-medium text-dark-text shadow-sm transition hover:border-primary"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate">
          {selectedStore ? selectedStore.address : 'Elige tu dirección'}
        </span>
        <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-12 z-50 w-[420px] rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-dark-text">Encuentra nuestra tienda</h3>
          <p className="mb-4 text-sm text-gray-500">
            Ingresa tu distrito, tienda especial o peaje para encontrar tu China Wok.
          </p>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
            placeholder="Buscar tienda"
          />
          <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
            {filteredStores.length === 0 ? (
              <p className="text-sm text-gray-500">No se encontraron tiendas.</p>
            ) : (
              filteredStores.map((store) => (
                <button
                  type="button"
                  key={store.id}
                  onClick={() => handleSelect(store.id)}
                  className={`flex w-full items-start justify-between rounded-xl border px-3 py-2 text-left transition hover:border-secondary hover:bg-light-gray ${selectedStore?.id === store.id ? 'border-secondary bg-secondary/5' : 'border-transparent'
                    }`}
                >
                  <div>
                    <p className="font-semibold text-dark-text">{store.address}</p>
                    <div className="mt-1 flex flex-col gap-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span>📞</span> {store.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🕒</span> {store.openingHours}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">
                    {store.deliveryTypes.includes('delivery') ? 'Delivery' : 'Pickup'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
