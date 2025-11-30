import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { updateMyProfile, deleteUser } from '../services/userService';
import { createReview, updateReview, deleteReview } from '../services/reviewService';
import type { BankingInfo, Review, OrderSummary } from '../types';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { selectedStore } = useStore();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const [form, setForm] = useState({
        nombre: '',
        numero_tarjeta: '',
        cvv: '',
        fecha_vencimiento: '',
        direccion_delivery: ''
    });

    // Estado para pedidos
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // Función para cargar pedidos (extraída de useEffect para poder reutilizarla)
    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            // Importar dinámicamente para evitar ciclos si fuera necesario
            const { listUserOrders, getOrderByIdDetailed } = await import('../services/orderService');
            const userOrders = await listUserOrders();

            // Mapear Order[] a OrderSummary[] (parciales)
            const summaries: OrderSummary[] = userOrders.map(o => ({
                pedido_id: o.id,
                local_id: o.storeId || '', // Nota: esto vendrá vacío si solo tenemos IDs desde el endpoint
                fecha: o.createdAt,
                total: o.total,
                // Mapeo inicial basado en el status del objeto Order
                estado: o.status === 'pending' ? 'procesando' :
                    o.status === 'preparing' ? 'cocinando' :
                        o.status === 'delivering' ? 'enviando' :
                            o.status === 'delivered' ? 'recibido' :
                                o.status === 'cancelled' ? 'cancelado' : 'procesando'
            }));

            setOrders(summaries);

            // Obtener detalles por cada pedido usando su propio local_id
            const withDetails = await Promise.all(summaries.map(async (s) => {
                try {
                    if (!s.local_id) return s;

                    const detalle = await getOrderByIdDetailed(s.local_id, s.pedido_id);
                    return {
                        ...s,
                        local_id: detalle?.local_id || s.local_id,
                        total: detalle?.costo ?? s.total,
                        // Mantener el estado del backend si está disponible
                        estado: detalle?.estado || s.estado
                    } as OrderSummary;
                } catch (e) {
                    return s;
                }
            }));

            setOrders(withDetails);
        } catch (error) {
            console.error('Error cargando pedidos:', error);
        } finally {
            setIsLoadingOrders(false);
        }
    };

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

        fetchOrders();
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
                correo: user.correo,
                nombre: form.nombre
            };

            if (form.numero_tarjeta || form.cvv || form.fecha_vencimiento || form.direccion_delivery) {
                updateData.informacion_bancaria = {
                    numero_tarjeta: form.numero_tarjeta.replace(/\s/g, ''),
                    cvv: form.cvv,
                    fecha_vencimiento: form.fecha_vencimiento,
                    direccion_delivery: form.direccion_delivery
                };
            }

            await updateMyProfile(updateData);
            setIsEditing(false);
            alert('Perfil actualizado exitosamente');
        } catch (error: any) {
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

    // Review handlers (simplificados para trabajar con resumen)
    const openReviewModal = (order: OrderSummary) => {
        setSelectedOrder(order);
        setReviewRating(5);
        setReviewComment('');
        setReviewError('');
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedOrder(null);
        setReviewRating(5);
        setReviewComment('');
        setReviewError('');
    };

    const handleSubmitReview = async () => {
        if (!selectedOrder) return;

        setIsSubmittingReview(true);
        setReviewError('');

        try {
            // Crear nueva reseña
            await createReview(
                selectedOrder.local_id,
                selectedOrder.pedido_id,
                reviewRating,
                reviewComment
            );

            closeReviewModal();
            alert('Reseña guardada exitosamente');
        } catch (error: any) {
            setReviewError(error.message || 'Error al guardar la reseña');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (order: OrderSummary) => {
        // Por ahora deshabilitado - necesita cargar detalles del pedido primero
        alert('Funcionalidad de eliminar reseña próximamente');
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

                {/* Historial de Pedidos */}
                <section className="mt-8 border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-dark-text">Historial de Pedidos</h2>
                        <button
                            onClick={fetchOrders}
                            disabled={isLoadingOrders}
                            className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80 disabled:opacity-50"
                        >
                            <svg
                                className={`h-4 w-4 ${isLoadingOrders ? 'animate-spin' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Actualizar
                        </button>
                    </div>

                    {isLoadingOrders ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
                            <span className="ml-3 text-sm text-gray-600">Cargando pedidos...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
                            <svg
                                className="mx-auto h-16 w-16 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <p className="mt-4 text-sm font-medium text-gray-600">Aún no tienes pedidos</p>
                            <p className="mt-1 text-xs text-gray-500">Tus pedidos aparecerán aquí una vez que realices tu primera compra</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                // Mostrar estados granulares
                                const getStatusConfig = (estado: string) => {
                                    const normalized = estado.toLowerCase();
                                    if (normalized === 'recibido' || normalized === 'entregado' || normalized === 'delivered') {
                                        return { bg: 'bg-green-50', text: 'text-green-700', label: 'Entregado', icon: '✅' };
                                    }
                                    if (normalized === 'enviando' || normalized === 'delivering') {
                                        return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'En camino', icon: '🛵' };
                                    }
                                    if (normalized === 'cocinando' || normalized === 'preparing') {
                                        return { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Cocinando', icon: '👨‍🍳' };
                                    }
                                    if (normalized === 'empacando') {
                                        return { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Empacando', icon: '🥡' };
                                    }
                                    if (normalized === 'cancelado' || normalized === 'cancelled') {
                                        return { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelado', icon: '❌' };
                                    }
                                    // Default: Procesando / Pending
                                    return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Procesando', icon: '🕐' };
                                };

                                const statusConfig = getStatusConfig(order.estado);
                                const orderDate = new Date(order.fecha).toLocaleDateString('es-PE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                return (
                                    <div
                                        key={order.pedido_id}
                                        onClick={() => {
                                            // Usar el local_id del pedido
                                            if (order.local_id) {
                                                navigate(`/orders/${order.local_id}/${order.pedido_id}`);
                                            } else {
                                                console.error('No local_id for order:', order);
                                            }
                                        }}
                                        className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-secondary/30"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-dark-text">Pedido #{order.pedido_id?.slice(0, 8) || '???'}</h3>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                        <span>{statusConfig.icon}</span>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{orderDate}</p>

                                                {/* Indicador de click para ver detalles */}
                                                <p className="mt-3 text-sm text-secondary font-medium flex items-center gap-1">
                                                    Ver detalles del pedido
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">S/ {Number(order.total).toFixed(2)}</p>

                                                {/* Botón para dejar reseña (solo para pedidos entregados) */}
                                                {order.estado === 'recibido' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openReviewModal(order);
                                                        }}
                                                        className="mt-3 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary/90"
                                                    >
                                                        Dejar reseña
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

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

            {/* Review Modal */}
            {showReviewModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-dark-text">
                            Dejar Reseña
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">Pedido #{selectedOrder.pedido_id.slice(0, 8)}</p>

                        <div className="mt-6 space-y-4">
                            {/* Star Rating */}
                            <div>
                                <label className="text-sm font-semibold text-dark-text">Calificación</label>
                                <div className="mt-2 flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="text-3xl transition hover:scale-110"
                                        >
                                            <span className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}>
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="text-sm font-semibold text-dark-text" htmlFor="review-comment">
                                    Comentario (opcional)
                                </label>
                                <textarea
                                    id="review-comment"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary"
                                    placeholder="Cuéntanos sobre tu experiencia..."
                                />
                            </div>

                            {reviewError && (
                                <div className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-600">
                                    {reviewError}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="flex-1 rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmittingReview ? 'Guardando...' : 'Guardar Reseña'}
                            </button>
                            <button
                                onClick={closeReviewModal}
                                disabled={isSubmittingReview}
                                className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
