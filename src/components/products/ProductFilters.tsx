import type { Product } from '../../data/products';

interface ProductFiltersProps {
  categories: Product['category'][];
  active: Product['category'];
  onSelect: (category: Product['category']) => void;
}

const ProductFilters = ({ categories, active, onSelect }: ProductFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            active === category
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 bg-white text-dark-text hover:border-primary'
          }`}
        >
          {category}
        </button>
      ))}
      <a href="#" className="text-sm font-semibold text-secondary hover:text-primary">
        Ver todos
      </a>
    </div>
  );
};

export default ProductFilters;
