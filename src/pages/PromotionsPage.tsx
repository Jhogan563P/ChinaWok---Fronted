import SkeletonGrid from '../components/shared/SkeletonGrid';
import { useOffers } from '../hooks/useOffers';
import OfferCard from '../components/products/OfferCard';

const PromotionsPage = () => {
  const { offers, loading } = useOffers();

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-10">
      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase text-secondary">Promociones</p>
          <h1 className="text-3xl font-bold text-dark-text">Ofertas Especiales</h1>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-dark-text">Todas las ofertas</h2>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : offers.length === 0 ? (
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
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-dark-text">No hay ofertas disponibles</h3>
            <p className="mt-2 text-sm text-gray-600">
              Este local no tiene ofertas activas en este momento.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offers.map((offer) => (
              <OfferCard key={offer.oferta_id} offer={offer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PromotionsPage;
