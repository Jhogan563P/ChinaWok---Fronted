import { NavLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const NavActions = () => {
  const { cart, itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      <NavLink
        to="/mi-carrito"
        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-primary"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">
          {itemCount}
        </span>
        <span>S/ {cart.total.toFixed(2)}</span>
      </NavLink>

      {isAuthenticated && user ? (
        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-gray-600">
            Hola, {user.firstName}
          </span>
          <button
            onClick={handleLogout}
            className="items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-primary transition hover:border-primary hover:bg-primary hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <NavLink
          to="/registro"
          className="hidden items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-secondary transition hover:border-secondary hover:bg-secondary hover:text-white md:flex"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 12c2.485 0 4.5-2.239 4.5-5S14.485 2 12 2 7.5 4.239 7.5 7s2.015 5 4.5 5zm0 2c-3.003 0-9 1.51-9 4.5V21h18v-2.5c0-2.99-5.997-4.5-9-4.5z" />
          </svg>
          Inicia sesión
        </NavLink>
      )}
    </div>
  );
};

export default NavActions;
