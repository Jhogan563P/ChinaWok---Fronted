import { ordersClient } from './apiClient';
import type {
  Order,
  CreateOrderData,
  OrderStatus,
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
 */
export const listUserOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<Order[]> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockOrders.filter((o) => o.userId === userId);
  }

  try {
    const response = await ordersClient.get<PaginatedResponse<Order>>(`/orders`, {
      params: { userId, page, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
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
