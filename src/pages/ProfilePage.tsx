import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateMyProfile, deleteUser } from '../services/userService';
import type { BankingInfo } from '../types';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        nombre: '',
        numero_tarjeta: '',
        cvv: '',
        fecha_vencimiento: '',
        direccion_delivery: ''
    });

    // Cargar datos del usuario al montar
    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        setForm({
            nombre: user.nombre || '',
            numero_tarjeta: user.informacion_bancaria?.numero_tarjeta || '',
            cvv: user.informacion_bancaria?.cvv || '',
            fecha_vencimiento: user.informacion_bancaria?.fecha_vencimiento || '',
            direccion_delivery: user.informacion_bancaria?.direccion_delivery || ''
        });
    }, [user, isAuthenticated, navigate]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (form.numero_tarjeta && !/^[0-9]{13,19}$/.test(form.numero_tarjeta.replace(/\s/g, ''))) {
            newErrors.numero_tarjeta = 'El número de tarjeta debe tener entre 13 y 19 dígitos';
        }

        if (form.cvv && !/^[0-9]{3,4}$/.test(form.cvv)) {
            newErrors.cvv = 'El CVV debe tener 3 o 4 dígitos';
        }

        if (form.fecha_vencimiento && !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(form.fecha_vencimiento)) {
            newErrors.fecha_vencimiento = 'Formato inválido (MM/YY)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !user) {
            return;
        }

        setIsLoading(true);

        try {
            const updateData: any = {
                nombre: form.nombre
            };

            // Solo incluir información bancaria si hay al menos un campo completo
            if (form.numero_tarjeta || form.cvv || form.fecha_vencimiento || form.direccion_delivery) {
                updateData.informacion_bancaria = {
                    numero_tarjeta: form.numero_tarjeta.replace(/\s/g, ''),
                    cvv: form.cvv,
                    fecha_vencimiento: form.fecha_vencimiento,
                    direccion_delivery: form.direccion_delivery
                };
            }
            console.log("ProfilePage: Datos enviados para actualizar perfil:", updateData);

            await updateMyProfile(updateData);
            console.log("ProfilePage: Perfil actualizado exitosamente.");

            setIsEditing(false);
            alert('Perfil actualizado exitosamente');
        } catch (error: any) {
            console.error("ProfilePage: Error al actualizar el perfil:", error);
            setErrors({
                submit: error.response?.data?.message || 'Error al actualizar el perfil. Intenta nuevamente.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            return;
        }

        if (!confirm('Confirma nuevamente: ¿Realmente deseas eliminar tu cuenta permanentemente?')) {
            return;
        }

        setIsLoading(true);

        try {
            await deleteUser();
            await logout();
            navigate('/');
            alert('Tu cuenta ha sido eliminada exitosamente');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar la cuenta. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text">Hola, {user.nombre}</h1>
                        <p className="mt-1 text-sm text-gray-600">{user.correo}</p>
                        <span className="mt-2 inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                            {user.role}
                        </span>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="rounded-full bg-secondary px-6 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90"
                        >
                            Editar Perfil
                        </button>
                    )}
                </div>

                {errors.submit && (
                    <div className="mt-6 rounded-full bg-red-50 px-4 py-2 text-sm text-red-600">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Información Personal */}
                    <section>
                        <h2 className="mb-4 text-lg font-semibold text-dark-text">Información Personal</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-dark-text" htmlFor="nombre">
                                    Nombre
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    disabled={!isEditing}
                                    className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${isEditing
                                            ? errors.nombre
                                                ? 'border-red-500'
                                                : 'border-gray-200 focus:border-primary'
                                            : 'border-gray-100 bg-gray-50'
                                        }`}
                                    placeholder="Tu nombre"
                                />
                                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-dark-text">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={user.correo}
                                    disabled
                                    className="mt-1 w-full rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-500 outline-none"
                                />
                                <p className="mt-1 text-xs text-gray-500">El correo no se puede modificar</p>
                            </div>
                        </div>
                    </section>

                    {/* Información Bancaria */}
                    <section className="border-t border-gray-100 pt-6">
                        <h2 className="mb-4 text-lg font-semibold text-dark-text">Información de Pago y Entrega</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-dark-text" htmlFor="numero_tarjeta">
                                    Número de Tarjeta
                                </label>
                                <input
                                    id="numero_tarjeta"
                                    type="text"
                                    value={form.numero_tarjeta}
                                    onChange={(e) => setForm({ ...form, numero_tarjeta: e.target.value })}
                                    disabled={!isEditing}
                                    className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${isEditing
                                            ? errors.numero_tarjeta
                                                ? 'border-red-500'
                                                : 'border-gray-200 focus:border-primary'
                                            : 'border-gray-100 bg-gray-50'
                                        }`}
                                    placeholder="4557 8800 1234 5678"
                                    maxLength={19}
                                />
                                {errors.numero_tarjeta && <p className="mt-1 text-xs text-red-500">{errors.numero_tarjeta}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-dark-text" htmlFor="fecha_vencimiento">
                                        Vencimiento (MM/YY)
                                    </label>
                                    <input
                                        id="fecha_vencimiento"
                                        type="text"
                                        value={form.fecha_vencimiento}
                                        onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                                        disabled={!isEditing}
                                        className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${isEditing
                                                ? errors.fecha_vencimiento
                                                    ? 'border-red-500'
                                                    : 'border-gray-200 focus:border-primary'
                                                : 'border-gray-100 bg-gray-50'
                                            }`}
                                        placeholder="12/25"
                                        maxLength={5}
                                    />
                                    {errors.fecha_vencimiento && <p className="mt-1 text-xs text-red-500">{errors.fecha_vencimiento}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-dark-text" htmlFor="cvv">
                                        CVV
                                    </label>
                                    <input
                                        id="cvv"
                                        type="text"
                                        value={form.cvv}
                                        onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                                        disabled={!isEditing}
                                        className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${isEditing
                                                ? errors.cvv
                                                    ? 'border-red-500'
                                                    : 'border-gray-200 focus:border-primary'
                                                : 'border-gray-100 bg-gray-50'
                                            }`}
                                        placeholder="123"
                                        maxLength={4}
                                    />
                                    {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-dark-text" htmlFor="direccion_delivery">
                                    Dirección de Entrega
                                </label>
                                <input
                                    id="direccion_delivery"
                                    type="text"
                                    value={form.direccion_delivery}
                                    onChange={(e) => setForm({ ...form, direccion_delivery: e.target.value })}
                                    disabled={!isEditing}
                                    className={`mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none ${isEditing
                                            ? errors.direccion_delivery
                                                ? 'border-red-500'
                                                : 'border-gray-200 focus:border-primary'
                                            : 'border-gray-100 bg-gray-50'
                                        }`}
                                    placeholder="Av. Principal 123, Distrito"
                                />
                                {errors.direccion_delivery && <p className="mt-1 text-xs text-red-500">{errors.direccion_delivery}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Botones de acción */}
                    {isEditing && (
                        <div className="flex gap-4 border-t border-gray-100 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setErrors({});
                                    // Restaurar valores originales
                                    setForm({
                                        nombre: user.nombre || '',
                                        numero_tarjeta: user.informacion_bancaria?.numero_tarjeta || '',
                                        cvv: user.informacion_bancaria?.cvv || '',
                                        fecha_vencimiento: user.informacion_bancaria?.fecha_vencimiento || '',
                                        direccion_delivery: user.informacion_bancaria?.direccion_delivery || ''
                                    });
                                }}
                                disabled={isLoading}
                                className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </form>

                {/* Zona de peligro */}
                <section className="mt-8 border-t border-gray-100 pt-6">
                    <h2 className="mb-2 text-lg font-semibold text-red-600">Zona de Peligro</h2>
                    <p className="mb-4 text-sm text-gray-600">
                        Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="rounded-full border-2 border-red-600 px-6 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Eliminar mi cuenta
                    </button>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
