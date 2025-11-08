import { NavLink } from 'react-router-dom';
import LocationDropdown from '../common/LocationDropdown';
import NavActions from '../common/NavActions';

const navLinks = [
  { to: '/menu', label: 'Menú' },
  { to: '/promociones', label: 'Promos exclusivas' },
  { to: '/locales', label: 'Locales' }
];

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      <div className="bg-secondary py-2 text-center text-sm font-medium text-white">
        Comunícate con nosotros: (01) 652 - 8000
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <NavLink to="/promociones" className="flex items-center gap-2">
          <img src="https://www.chinawok.com.pe/img/logo.svg" alt="China Wok logo" className="h-10" />
        </NavLink>
        <LocationDropdown />
        <nav className="hidden items-center gap-6 text-sm font-medium text-dark-text md:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative transition-colors duration-150 hover:text-primary ${
                  isActive ? 'text-primary' : 'text-dark-text'
                }`
              }
            >
              {({ isActive }) => (
                <span>
                  {label}
                  {isActive && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <NavActions />
      </div>
    </header>
  );
};

export default Header;
