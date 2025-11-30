import { useState } from 'react';
import type { Offer } from '../../types';
import { getEmojiForText } from '../../utils/emojiMapping';
import { useCart } from '../../contexts/CartContext';

interface Props {
  offer: Offer;
}

const OfferCard = ({ offer }: Props) => {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!offer.precio_con_descuento) return;

    setIsAdding(true);

    // Agregar la oferta al carrito con el precio con descuento
    addItem({
      id: offer.oferta_id,
      name: offer.nombre,
      image: offer.imagen_url || '',
      price: offer.precio_con_descuento, // Usar precio con descuento
      type: 'offer',
      category: 'Oferta'
    }, 1);

    // Feedback visual
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative flex h-48 w-full items-center justify-center bg-gray-50 text-6xl">
        <span role="img" aria-label={offer.nombre} className="text-6xl">
          {getEmojiForText(offer.nombre)}
        </span>
        {/* Badge de descuento */}
        {offer.descuento > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            -{Math.round(offer.descuento * 100)}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-dark-text">{offer.nombre}</h3>
        <p className="mt-1 text-sm text-gray-600">{offer.descripcion}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {offer.precio_original && (
              <span className="text-sm text-gray-500 line-through">S/.{Number(offer.precio_original).toFixed(2)}</span>
            )}
            <span className="text-xl font-bold text-primary">S/.{Number(offer.precio_con_descuento).toFixed(2)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ${isAdding
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
              }`}
          >
            {isAdding ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
