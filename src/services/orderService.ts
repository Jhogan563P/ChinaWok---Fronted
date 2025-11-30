import { ordersClient, usersClient } from './apiClient';
import type {
  Order,
  CreateOrderData,
  OrderStatus,
  OrderItem,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Flag para usar mock data o API real
const USE_MOCK_DATA = false;

/**
 * Mock orders para desarrollo
 */
const mockOrders: Order[] = [];

/**
 * Crea un nuevo pedido
 */
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  // Separar productos y combos según el formato del backend
  const productos: any[] = [];
  const combos: any[] = [];

  orderData.items.forEach(item => {
    if (item.type === 'combo') {
      // Es un combo - agregar al array de combos
      combos.push({
        combo_id: item.productId,
        cantidad: item.quantity
      });
    } else {
      // Es un producto normal u oferta - agregar al array de productos
      productos.push({
        nombre: item.productName,
        cantidad: item.quantity
      });
    }
  });

  // Calcular total
  const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = orderData.deliveryType === 'delivery' ? 5.0 : 0;
  const total = subtotal + deliveryFee;

  // Formatear dirección como string si es objeto
  let direccionStr = '';
  if (orderData.deliveryAddress) {
    const addr = orderData.deliveryAddress;
    direccionStr = `${addr.street}, ${addr.district}, ${addr.city}`;
    if (addr.reference) direccionStr += ` (Ref: ${addr.reference})`;
  }

  // Payload para el backend - estructura según ejemplo de Postman
  const payload: any = {
    local_id: orderData.storeId,
    usuario_correo: orderData.userId,
    costo: total,
    direccion: direccionStr || 'Dirección no especificada'
  };

  // Solo agregar arrays si tienen elementos
  if (productos.length > 0) {
    payload.productos = productos;
  }

  if (combos.length > 0) {
    payload.combos = combos;
  }

  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      ...orderData,
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    mockOrders.push(newOrder);
    return newOrder;
  }

  try {
    const response = await ordersClient.post<any>('/pedidos', payload);

    // Mapear respuesta del backend a Order frontend
    const backendOrder = response.data.data;

    return {
      id: backendOrder.pedido_id || backendOrder.id,
      userId: backendOrder.usuario_correo,
      storeId: backendOrder.local_id,
      items: orderData.items, // Mantenemos los items originales para el frontend
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: backendOrder.costo,
      status: backendOrder.estado,
      deliveryType: orderData.deliveryType,
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Obtiene un pedido por ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const order = mockOrders.find((o) => o.id === orderId);
    return order || null;
  }

  try {
    const response = await ordersClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Lista los pedidos del usuario actual
 * Usa el endpoint dedicado del backend que consulta por usuario_correo
 */
export const listUserOrders = async (): Promise<Order[]> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockOrders;
  }

  try {
    console.log(`[${new Date().toISOString()}] orderService: Obteniendo historial de pedidos`);

    // Usar endpoint correcto del microservicio de usuarios
    // GET /usuario/me/historial-pedidos
    // No enviamos detallado=true porque el backend falla.
    // Solo obtenemos los IDs y el frontend usará el local seleccionado para ver detalles.
    const response = await usersClient.get<any>('/usuario/me/historial-pedidos');

    // El backend devuelve { message, correo, total_pedidos, pedidos_ids: [] }
    const pedidosIds = response.data.pedidos_ids || [];
    console.log(`orderService: ${pedidosIds.length} IDs de pedidos encontrados`);

    if (pedidosIds.length === 0) return [];

    // Mapeamos los IDs a objetos parciales de Order
    // La información detallada se obtendrá en la página de detalles
    const orders = pedidosIds.map((id: any) => mapBackendOrderToFrontend(id));

    return orders;
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    };

    console.error('orderService: Error al obtener pedidos del usuario:', errorDetails);
    return [];
  }
};

/**
 * Mapea un pedido del backend al formato Order del frontend
 */
const mapBackendOrderToFrontend = (backendOrder: any): Order => {
  // Si backendOrder es un string, asumimos que es el ID del pedido
  if (typeof backendOrder === 'string') {
    return {
      id: backendOrder,
      userId: '', // No disponible
      storeId: '', // No disponible
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      status: 'pending',
      deliveryType: 'delivery',
      createdAt: new Date().toISOString()
    };
  }

  // Mapear estados del backend a estados del frontend
  const statusMap: Record<string, OrderStatus> = {
    'procesando': 'pending',
    'cocinando': 'preparing',
    'empacando': 'preparing',
    'enviando': 'delivering',
    'entregado': 'delivered',  // Pedido entregado, esperando confirmación
    'recibido': 'delivered',
    'cancelado': 'cancelled'
  };

  // Construir items del pedido
  const items: OrderItem[] = [];

  // Agregar productos
  if (backendOrder.productos && Array.isArray(backendOrder.productos)) {
    backendOrder.productos.forEach((producto: any) => {
      items.push({
        productId: producto.nombre,
        productName: producto.nombre,
        productImage: '', // No disponible en el backend
        quantity: producto.cantidad,
        price: 0, // No disponible directamente
        subtotal: 0,
        type: 'product'
      });
    });
  }

  // Agregar combos
  if (backendOrder.combos && Array.isArray(backendOrder.combos)) {
    backendOrder.combos.forEach((combo: any) => {
      items.push({
        productId: combo.combo_id,
        productName: combo.combo_id,
        productImage: '',
        quantity: combo.cantidad,
        price: 0,
        subtotal: 0,
        type: 'combo'
      });
    });
  }

  // Obtener la fecha de creación del primer estado del historial
  const createdAt = backendOrder.historial_estados?.[0]?.hora_inicio || new Date().toISOString();

  return {
    id: backendOrder.pedido_id,
    userId: backendOrder.usuario_correo,
    storeId: backendOrder.local_id,
    items,
    subtotal: backendOrder.costo || 0,
    deliveryFee: 5.0, // Valor por defecto
    total: backendOrder.costo || 0,
    status: statusMap[backendOrder.estado] || 'pending',
    deliveryType: 'delivery',
    createdAt,
    estimatedDeliveryTime: backendOrder.fecha_entrega_aproximada
  };
};

/**
 * Actualiza el estado de un pedido
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Pedido no encontrado');
    }

    mockOrders[orderIndex].status = status;
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    return mockOrders[orderIndex];
  }

  try {
    const response = await ordersClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, {
      status
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Cancela un pedido
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  return updateOrderStatus(orderId, 'cancelled');
};

/**
 * Obtiene los detalles completos de un pedido específico
 * Incluye historial de estados completo
 */
export const getOrderByIdDetailed = async (localId: string, pedidoId: string): Promise<any> => {
  try {
    console.log(`orderService: Obteniendo detalles del pedido ${pedidoId} en local ${localId}`);

    const response = await ordersClient.get<any>('/pedidos', {
      params: {
        local_id: localId,
        pedido_id: pedidoId
      }
    });

    const pedido = response.data.data;
    console.log('orderService: Detalles del pedido obtenidos:', pedido);

    return pedido;
  } catch (error) {
    console.error('orderService: Error al obtener detalles del pedido:', error);
    throw error;
  }
};

/**
 * Confirma la recepción de un pedido entregado
 */
export const confirmOrderDelivery = async (
  pedidoId: string,
  usuarioCorreo: string,
  localId?: string
): Promise<any> => {
  try {
    console.log(`orderService: Confirmando recepción del pedido ${pedidoId} en local ${localId}`);

    // Payload expected by backend (see Postman): { local_id, pedido_id, confirmado }
    const payload: any = {
      pedido_id: pedidoId,
      confirmado: true
    };

    if (localId) payload.local_id = localId;
    if (usuarioCorreo) payload.usuario_correo = usuarioCorreo;

    const response = await ordersClient.post<any>('/workflow/confirmar', payload);

    console.log('orderService: Recepción confirmada exitosamente');
    return response.data;
  } catch (error: any) {
    // Mejorar logging para mostrar mensaje del backend cuando exista
    const resp = error?.response?.data;
    console.error('orderService: Error al confirmar recepción:', {
      message: error.message,
      status: error?.response?.status,
      response: resp
    });
    throw error;
  }
};
