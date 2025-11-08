import { NavLink } from 'react-router-dom';

const NavActions = () => {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      <NavLink
        to="/mi-carrito"
        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-primary"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">3</span>
        <span>S/ 99.80</span>
      </NavLink>
      <NavLink
        to="/registro"
        className="hidden items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-secondary transition hover:border-secondary hover:bg-secondary hover:text-white md:flex"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 12c2.485 0 4.5-2.239 4.5-5S14.485 2 12 2 7.5 4.239 7.5 7s2.015 5 4.5 5zm0 2c-3.003 0-9 1.51-9 4.5V21h18v-2.5c0-2.99-5.997-4.5-9-4.5z" />
        </svg>
        Inicia sesión
      </NavLink>
    </div>
  );
};

export default NavActions;
