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
