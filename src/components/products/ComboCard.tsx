import type { Combo } from '../../types';

interface Props {
  combo: Combo;
}

const ComboCard = ({ combo }: Props) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="overflow-hidden">
        <img
          src={combo.imagen_url}
          alt={combo.nombre}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-dark-text">{combo.nombre}</h3>
        <p className="mt-1 text-sm text-gray-600">{combo.descripcion}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">S/.{Number(combo.precio).toFixed(2)}</span>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary-dark">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboCard;
