import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterData } from '../types';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmPassword: ''
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!form.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(form.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (!form.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (form.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (form.contrasena !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        nombre: form.nombre,
        correo: form.correo,
        contrasena: form.contrasena,
      };

      await register(registerData);

      // Redirigir según de dónde vino el usuario
      const from = (location.state as any)?.from || '/';
      navigate(from);
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-6 py-10 lg:grid-cols-2">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-dark-text">Crea tu cuenta China Wok</h1>
        <p className="mt-2 text-sm text-gray-600">
          Disfruta de beneficios exclusivos y guarda tus direcciones favoritas.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {errors.submit && (
            <div className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-dark-text" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${
                errors.nombre ? 'border-red-500' : 'border-gray-200 focus:border-primary'
              }`}
              placeholder="Tu nombre"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-dark-text" htmlFor="correo">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${
                errors.correo ? 'border-red-500' : 'border-gray-200 focus:border-primary'
              }`}
              placeholder="nombre@correo.com"
            />
            {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-dark-text" htmlFor="contrasena">
                Crea tu contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                value={form.contrasena}
                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${
                  errors.contrasena ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                }`}
                placeholder="********"
              />
              {errors.contrasena && <p className="mt-1 text-xs text-red-500">{errors.contrasena}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-dark-text" htmlFor="confirmPassword">
                Confirma tu contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                }`}
                placeholder="********"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
            />
            <p>
              Acepto la política de privacidad y autorizo el uso de mis datos para recibir promociones
              y novedades de China Wok.
            </p>
          </div>
          {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-secondary hover:text-primary">
              Inicia sesión
            </Link>
          </p>
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
