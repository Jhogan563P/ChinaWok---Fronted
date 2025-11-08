import { useState } from 'react';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-6 py-10 lg:grid-cols-2">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-dark-text">Crea tu cuenta China Wok</h1>
        <p className="mt-2 text-sm text-gray-600">
          Disfruta de beneficios exclusivos y guarda tus direcciones favoritas. No es obligatorio
          iniciar sesión para ordenar, pero te hará la vida más fácil.
        </p>
        <form className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-dark-text" htmlFor="name">
              Nombres y apellidos
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-dark-text" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
              placeholder="nombre@correo.com"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-dark-text" htmlFor="phone">
                Teléfono de contacto
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
                placeholder="999 999 999"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark-text" htmlFor="password">
                Crea tu contraseña
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="mt-1 w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
                placeholder="********"
              />
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs text-gray-500">
            <input type="checkbox" className="mt-1" />
            <p>
              Acepto la política de privacidad y autorizo el uso de mis datos para recibir promociones
              y novedades de China Wok.
            </p>
          </div>
          <button className="w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90">
            Crear cuenta
          </button>
        </form>
      </section>

      <aside className="rounded-3xl bg-secondary/10 p-8 text-secondary">
        <h2 className="text-2xl font-semibold">Beneficios de registrarte</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <li>• Guarda tus direcciones favoritas y pídelo más rápido.</li>
          <li>• Accede a promociones exclusivas y preventas.</li>
          <li>• Haz seguimiento a tus pedidos en tiempo real.</li>
        </ul>
        <div className="mt-8 rounded-3xl bg-white p-6 text-dark-text shadow-sm">
          <h3 className="text-lg font-semibold">¿Prefieres pedir sin registrarte?</h3>
          <p className="mt-2 text-sm text-gray-600">
            Solo necesitaremos tus datos de contacto al finalizar la compra. ¡Así de fácil!
          </p>
        </div>
      </aside>
    </div>
  );
};

export default RegisterPage;
