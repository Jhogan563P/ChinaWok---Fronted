import ChinaWokLogo from '../../../assets/logo_chinawok.png';

const links = [
  'Promociones',
  'Carta',
  'Locales',
  'Trabaja con nosotros',
  'Términos y condiciones',
  'Política de privacidad'
];

const Footer = () => (
  <footer className="border-t border-gray-200 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
      <div className="max-w-sm space-y-3 text-sm text-gray-600">
        <img src={ChinaWokLogo} alt="China Wok" className="h-10" />
        <p>
          El sabor único de la cocina peruana y oriental con ingredientes frescos y preparados al
          momento. ¡Ordena hoy y disfruta de la experiencia China Wok!
        </p>
      </div>
      <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
        {links.map((link) => (
          <a key={link} href="#" className="hover:text-primary">
            {link}
          </a>
        ))}
      </div>
      <div className="text-sm text-gray-600">
        <p className="font-semibold text-dark-text">Contáctanos</p>
        <p>Delivery: (01) 652 - 8000</p>
        <p>Atención: 11:00 am - 11:00 pm</p>
        <p className="mt-4 text-xs text-gray-400">
          © {new Date().getFullYear()} China Wok. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
