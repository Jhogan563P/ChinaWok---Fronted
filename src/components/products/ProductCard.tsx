import type { Product } from '../../data/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img src={product.image} alt={product.title} className="h-48 w-full object-cover" />
        {product.discount && (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-dark-text">
            {product.discount}% OFF
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold text-dark-text">{product.title}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              S/ {product.price.toFixed(2)}
            </p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">S/ {product.originalPrice.toFixed(2)}</p>
            )}
          </div>
          <button className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90">
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
