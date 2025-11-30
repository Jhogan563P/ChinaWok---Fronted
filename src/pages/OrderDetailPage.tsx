import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderByIdDetailed, confirmOrderDelivery } from '../services/orderService';
import { getReviewByOrder, createReview, updateReview, deleteReview } from '../services/reviewService';
import { useWebSocket } from '../hooks/useWebSocket';
import type { WebSocketNotification, OrderDetails, BackendOrderStatus, Review } from '../types';

const OrderDetailPage = () => {
    const { localId, pedidoId } = useParams<{ localId: string; pedidoId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orderData, setOrderData] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
    const [orderReview, setOrderReview] = useState<Review | null>(null);
    const [isLoadingReview, setIsLoadingReview] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Cargar detalles del pedido
    const fetchOrderDetails = async () => {
        if (!localId || !pedidoId) return;

        try {
            setIsLoading(true);
            const data = await getOrderByIdDetailed(localId, pedidoId);
            setOrderData(data);

            // Verificar si el pedido está esperando confirmación (flag del backend)
            if (data.esperando_confirmacion) {
                setShowConfirmButton(true);
            }

            setError(null);
        } catch (err: any) {
            console.error('Error al cargar pedido:', err);
            setError('No se pudo cargar los detalles del pedido');
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar notificaciones del WebSocket
    const handleWebSocketMessage = useCallback((notification: WebSocketNotification) => {
        console.log('--- Notificación WebSocket Recibida ---');
        console.log('Tipo:', notification.tipo);
        console.log('Datos:', notification.datos);
        console.log('Timestamp:', notification.timestamp);
        console.log('------------------------------------');

        // Agregar notificación al historial
        setNotifications(prev => [notification, ...prev]);

        // Actualizar datos del pedido con la notificación
        setOrderData(prevOrder => {
            if (!prevOrder) return prevOrder;

            // Actualizar el estado del pedido
            const nuevoEstado: BackendOrderStatus = notification.datos.estado as BackendOrderStatus; // Aseguramos el tipo BackendOrderStatus
            const nuevoHistorial = [...(prevOrder.historial_estados || [])];

            // Buscar el último estado activo y finalizarlo si es diferente al nuevo estado
            const ultimoEstadoActivoIndex = nuevoHistorial.findIndex((s: any) => s.activo);
            if (ultimoEstadoActivoIndex !== -1 && nuevoHistorial[ultimoEstadoActivoIndex].estado !== nuevoEstado) {
                nuevoHistorial[ultimoEstadoActivoIndex] = {
                    ...nuevoHistorial[ultimoEstadoActivoIndex],
                    activo: false,
                    hora_fin: notification.timestamp // Usar el timestamp de la notificación
                };
            }

            // Añadir el nuevo estado si no existe o si es un cambio de estado
            if (!nuevoHistorial.some((s: any) => s.estado === nuevoEstado && s.activo)) {
                nuevoHistorial.push({
                    estado: nuevoEstado,
                    hora_inicio: notification.timestamp,
                    hora_fin: undefined,
                    activo: true,
                    empleado_dni: notification.datos.empleado?.dni || undefined
                });
            }

            // Asegurarse de que solo el último estado sea activo
            const estadosOrdenados = nuevoHistorial.sort((a: any, b: any) => new Date(a.hora_inicio).getTime() - new Date(b.hora_inicio).getTime());
            estadosOrdenados.forEach((estado: any, index: number) => {
                estado.activo = (index === estadosOrdenados.length - 1);
            });

            return {
                ...prevOrder,
                estado: nuevoEstado,
                historial_estados: estadosOrdenados,
                // `fecha_entrega_aproximada` no viene en la notificación, mantener el valor existente.
                // Si en el futuro viniera, se podría añadir aquí.
                fecha_entrega_aproximada: prevOrder.fecha_entrega_aproximada,
            };
        });

        // Verificar si se debe mostrar botón de confirmar
        if (notification.datos.accion_requerida === 'CONFIRMAR_RECEPCION') {
            setShowConfirmButton(true);
        }

        // Si el pedido se completó, ocultar botón
        if (notification.tipo === 'PEDIDO_COMPLETADO') {
            setShowConfirmButton(false);
        }
    }, [setNotifications, setOrderData, setShowConfirmButton]); // Dependencias estables

    // Asegurar que pedidoId y user?.correo siempre sean strings no vacíos
    const wsPedidoId = pedidoId ?? '';
    const wsUsuarioCorreo = user?.correo ?? '';

    // Conectar al WebSocket
    const { isConnected, error: wsError } = useWebSocket({
        usuarioCorreo: wsUsuarioCorreo,
        pedidoId: wsPedidoId,
        onMessage: handleWebSocketMessage,
        autoReconnect: true
    });

    // Cargar datos iniciales
    useEffect(() => {
        fetchOrderDetails();
    }, [localId, pedidoId]);

    // Cargar reseña del pedido cuando tengamos localId y pedidoId
    useEffect(() => {
        const loadReview = async () => {
            if (!localId || !pedidoId) return;
            setIsLoadingReview(true);
            try {
                const rev = await getReviewByOrder(localId, pedidoId);
                setOrderReview(rev);
            } catch (err) {
                console.error('Error cargando reseña del pedido:', err);
                setOrderReview(null);
            } finally {
                setIsLoadingReview(false);
            }
        };

        loadReview();
    }, [localId, pedidoId]);

    // Confirmar recepción del pedido
    const handleConfirmDelivery = async () => {
        console.log('Intentando confirmar entrega. Valores actuales:');
        console.log('pedidoId:', pedidoId);
        console.log('localId:', localId);
        console.log('user.correo:', user?.correo);

        if (!pedidoId || !user?.correo || !localId) {
            console.error('Faltan datos para confirmar el pedido.');
            return;
        }

        setIsConfirming(true);
        try {
            await confirmOrderDelivery(pedidoId, user.correo, localId);
            // La notificación de confirmación llegará por WebSocket
        } catch (err: any) {
            console.error('Error al confirmar recepción:', err);
            const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
            alert(backendMsg ? `Error: ${backendMsg}` : 'Error al confirmar la recepción del pedido');
        } finally {
            setIsConfirming(false);
        }
    };

    // Review handlers
    const startCreateReview = () => {
        setReviewRating(5);
        setReviewComment('');
        setIsEditingReview(true);
    };

    const startEditReview = () => {
        if (!orderReview) return;
        setReviewRating(orderReview.calificacion || 5);
        setReviewComment(orderReview.resena || '');
        setIsEditingReview(true);
    };

    const cancelEditReview = () => {
        setIsEditingReview(false);
        setReviewRating(5);
        setReviewComment('');
    };

    const handleSaveReview = async () => {
        if (!localId || !pedidoId || !user) return;

        setIsSubmittingReview(true);
        try {
            if (orderReview) {
                // update
                const updated = await updateReview(localId, orderReview.resena_id, reviewRating, reviewComment);
                setOrderReview(updated);
                alert('Reseña actualizada');
            } else {
                // create
                const created = await createReview(localId, pedidoId, reviewRating, reviewComment);
                setOrderReview(created);
                alert('Reseña creada');
            }
            setIsEditingReview(false);
        } catch (err: any) {
            console.error('Error guardando reseña:', err);
            alert(err.message || 'Error al guardar reseña');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!localId || !orderReview) return;

        if (!confirm('¿Eliminar reseña? Esta acción no se puede deshacer.')) return;

        try {
            await deleteReview(localId, orderReview.resena_id);
            setOrderReview(null);
            alert('Reseña eliminada');
        } catch (err: any) {
            console.error('Error eliminando reseña:', err);
            alert(err.message || 'Error al eliminar reseña');
        }
    };

    // Mapear estados a configuración visual
    const getStatusConfig = (estado: string) => {
        const configs: Record<string, { bg: string; text: string; label: string; icon: string }> = {
            'procesando': { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Procesando', icon: '🕐' },
            'cocinando': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Cocinando', icon: '👨‍🍳' },
            'empacando': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Empacando', icon: '📦' },
            'enviando': { bg: 'bg-teal-50', text: 'text-teal-700', label: 'En camino', icon: '🚚' },
            'entregado': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Entregado', icon: '📍' },
            'recibido': { bg: 'bg-green-50', text: 'text-green-700', label: 'Recibido', icon: '✅' },
            'cancelado': { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelado', icon: '❌' }
        };
        return configs[estado] || configs['procesando'];
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando detalles del pedido...</p>
                </div>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-dark-text mb-2">Error al cargar pedido</h2>
                    <p className="text-gray-600 mb-6">{error || 'No se encontró el pedido'}</p>
                    <button
                        onClick={() => navigate('/me')}
                        className="rounded-full bg-secondary px-6 py-3 text-white font-semibold hover:bg-secondary/90 transition"
                    >
                        Volver al perfil
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(orderData.estado);
    const fechaCreacion = orderData.historial_estados?.[0]?.hora_inicio
        ? new Date(orderData.historial_estados[0].hora_inicio).toLocaleString('es-PE')
        : 'N/A';

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/me')}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al perfil
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text">Pedido #{pedidoId?.slice(0, 8)}</h1>
                        <p className="text-sm text-gray-600 mt-1">{fechaCreacion}</p>
                    </div>

                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className="text-xl">{statusConfig.icon}</span>
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Reseña del pedido (cliente) */}
            <div className="mt-6">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Tu reseña</h2>

                    {isLoadingReview ? (
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
                            <span className="text-sm text-gray-600">Cargando reseña...</span>
                        </div>
                    ) : (
                        <div>
                            {orderReview && !isEditingReview ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} className={i < (orderReview?.calificacion || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600">{(orderReview?.calificacion || 0).toFixed(1)} / 5</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={startEditReview} className="rounded-full border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Editar</button>
                                            <button onClick={handleDeleteReview} className="rounded-full border border-red-600 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Eliminar</button>
                                        </div>
                                    </div>

                                    {orderReview?.resena && (
                                        <div className="mt-2 text-sm text-gray-700">{orderReview.resena}</div>
                                    )}
                                </div>
                            ) : isEditingReview ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-dark-text">Calificación</label>
                                        <div className="mt-2 flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setReviewRating(star)} className="text-3xl transition hover:scale-110">
                                                    <span className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-dark-text">Comentario (opcional)</label>
                                        <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary" placeholder="Cuéntanos sobre tu experiencia..." />
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={handleSaveReview} disabled={isSubmittingReview} className="flex-1 rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:opacity-50">{isSubmittingReview ? 'Guardando...' : 'Guardar'}</button>
                                        <button onClick={cancelEditReview} disabled={isSubmittingReview} className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-700">Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {orderData.estado === 'recibido' ? (
                                        <button onClick={startCreateReview} className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white">Dejar reseña</button>
                                    ) : (
                                        <p className="text-sm text-gray-600">Puedes dejar una reseña una vez que hayas confirmado la recepción del pedido.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* WebSocket Connection Status */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700">
                            {isConnected ? 'Conectado - Actualizaciones en tiempo real' : 'Desconectado'}
                        </span>
                    </div>
                    {wsError && <span className="text-xs text-red-600">{wsError}</span>}
                </div>
            </div>

            {/* Notificaciones recientes */}
            {notifications.length > 0 && (
                <div className="mb-6 space-y-3">
                    {notifications.slice(0, 3).map((notif, idx) => (
                        <div key={idx} className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📢</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-dark-text">{notif.datos.mensaje}</p>
                                    {notif.datos.empleado && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {notif.datos.empleado.role}: {notif.datos.empleado.nombre}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.timestamp).toLocaleTimeString('es-PE')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Botón de confirmar recepción */}
            {showConfirmButton && (
                <div className="mb-6 rounded-2xl border-2 border-secondary bg-secondary/5 p-6 text-center">
                    <h3 className="text-lg font-bold text-dark-text mb-2">¡Tu pedido ha llegado! 🎉</h3>
                    <p className="text-sm text-gray-600 mb-4">Por favor, confirma que has recibido tu pedido</p>
                    <button
                        onClick={handleConfirmDelivery}
                        disabled={isConfirming}
                        className="rounded-full bg-secondary px-8 py-3 text-white font-semibold hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConfirming ? 'Confirmando...' : 'Confirmar Recepción'}
                    </button>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Información del pedido */}
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Información del Pedido</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">ID del Pedido</span>
                            <span className="text-sm font-medium text-dark-text">{pedidoId?.slice(0, 13)}...</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Local</span>
                            <span className="text-sm font-medium text-dark-text">{localId}</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Dirección</span>
                            <span className="text-sm font-medium text-dark-text text-right">{orderData.direccion || 'N/A'}</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Costo Total</span>
                            <span className="text-lg font-bold text-primary">S/ {Number(orderData.costo || 0).toFixed(2)}</span>
                        </div>

                        {orderData.fecha_entrega_aproximada && (
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-600">Entrega Estimada</span>
                                <span className="text-sm font-medium text-dark-text">
                                    {new Date(orderData.fecha_entrega_aproximada).toLocaleString('es-PE')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items del pedido */}
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Productos</h2>

                    <div className="space-y-3">
                        {orderData.productos && orderData.productos.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Productos</h3>
                                {orderData.productos.map((prod: any, idx: number) => (
                                    <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">{prod.nombre}</span>
                                        <span className="text-sm font-medium text-dark-text">x{prod.cantidad}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {orderData.combos && orderData.combos.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Combos</h3>
                                {orderData.combos.map((combo: any, idx: number) => (
                                    <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">{combo.combo_id}</span>
                                        <span className="text-sm font-medium text-dark-text">x{combo.cantidad}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Historial de estados */}
            {orderData.historial_estados && orderData.historial_estados.length > 0 && (
                <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-dark-text mb-4">Historial del Pedido</h2>

                    <div className="relative">
                        {/* Timeline vertical */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                        <div className="space-y-4">
                            {orderData.historial_estados.map((estado: any, idx: number) => {
                                const config = getStatusConfig(estado.estado);
                                const isActive = estado.activo;

                                return (
                                    <div key={idx} className="relative flex items-start gap-4 pl-10">
                                        {/* Timeline dot */}
                                        <div className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center ${isActive ? config.bg : 'bg-gray-100'}`}>
                                            <span className={isActive ? '' : 'grayscale opacity-50'}>{config.icon}</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-semibold ${isActive ? config.text : 'text-gray-500'}`}>
                                                    {config.label}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(estado.hora_inicio).toLocaleString('es-PE')}
                                                </span>
                                            </div>

                                            {estado.empleado_dni && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Empleado: {estado.empleado_dni}
                                                </p>
                                            )}

                                            {estado.hora_fin && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Finalizado: {new Date(estado.hora_fin).toLocaleString('es-PE')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailPage;
