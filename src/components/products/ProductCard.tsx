import { useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import type { CartItem } from '../../types';
import { getEmojiForCategory } from '../../utils/emojiMapping';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, getItemQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const currentQuantity = getItemQuantity(product.nombre);

  const handleAddToCart = () => {
    setIsAdding(true);

    // Crear item del carrito desde el producto
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: product.nombre,
      name: product.nombre,
      image: product.imagen || '',
      price: product.precio,
      type: 'product'
    };

    addItem(cartItem, 1);

    // Animación visual
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-48 w-full items-center justify-center bg-gray-50 text-6xl">
        <span role="img" aria-label={product.categoria}>
          {getEmojiForCategory(product.categoria)}
        </span>
        {currentQuantity > 0 && (
          <span className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            {currentQuantity}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold text-dark-text">{product.nombre}</h3>
        <p className="text-sm text-gray-600">{product.descripcion}</p>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              S/ {Number(product.precio).toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90 active:scale-95 disabled:opacity-50 ${
              isAdding ? 'scale-110' : ''
            }`}
          >
            {isAdding ? 'Agregado!' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
