import type { Offer } from '../../types';
import { getEmojiForCategory } from '../../utils/emojiMapping';

interface Props {
  offer: Offer;
}

const OfferCard = ({ offer }: Props) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative flex h-48 w-full items-center justify-center bg-gray-50 text-6xl">
        <span role="img" aria-label={offer.nombre}>
          {getEmojiForCategory("Oferta")}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-dark-text">{offer.nombre}</h3>
        <p className="mt-1 text-sm text-gray-600">{offer.descripcion}</p>
        <div className="mt-4 flex items-center justify-between">
          {offer.precio_original && (
            <span className="text-sm text-gray-500 line-through mr-2">S/.{Number(offer.precio_original).toFixed(2)}</span>
          )}
          <span className="text-xl font-bold text-primary">S/.{Number(offer.precio_con_descuento).toFixed(2)}</span>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary-dark">
            Ver oferta
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
