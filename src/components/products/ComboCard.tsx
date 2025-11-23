import type { Combo } from '../../types';

import { useCart } from '../../contexts/CartContext';

interface Props {
  combo: Combo;
}

const ComboCard = ({ combo }: Props) => {
  const { addItem } = useCart();
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={combo.imagen_url || 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
          alt={combo.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex-1">
          <h3 className="text-xl font-bold text-dark-text group-hover:text-secondary">{combo.nombre}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">{combo.descripcion}</p>

          {/* Lista de productos incluidos */}
          {(combo.productos_nombres && combo.productos_nombres.length > 0) && (
            <div className="mt-4 rounded-xl bg-light-gray p-3">
              <p className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Incluye:</p>
              <ul className="space-y-1">
                {combo.productos_nombres.map((prod, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary" />
                    <span>{prod}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Precio</span>
            <span className="text-2xl font-bold text-primary">
              {combo.precio ? `S/.${Number(combo.precio).toFixed(2)}` : 'Consultar'}
            </span>
          </div>
          <button
            onClick={() => {
              if (!combo.precio) return;
              addItem({
                id: combo.combo_id,
                name: combo.nombre,
                image: combo.imagen_url || 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                price: Number(combo.precio),
                type: 'combo',
                includedProducts: combo.productos_nombres
              });
            }}
            disabled={!combo.precio}
            className={`rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${combo.precio
              ? 'bg-secondary shadow-secondary/30 hover:bg-secondary/90 hover:shadow-secondary/50'
              : 'cursor-not-allowed bg-gray-300'
              }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboCard;
