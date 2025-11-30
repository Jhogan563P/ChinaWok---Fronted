import type { Product } from '../../types';

interface ProductFiltersProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
  onViewAll?: () => void;
}

const ProductFilters = ({ categories, active, onSelect, onViewAll }: ProductFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active === category
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 bg-white text-dark-text hover:border-primary'
            }`}
        >
          {category}
        </button>
      ))}
      <button
        onClick={onViewAll}
        className="text-sm font-semibold text-secondary hover:text-primary transition"
      >
        Ver todos
      </button>
    </div>
  );
};

export default ProductFilters;
