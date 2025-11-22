import { ordersClient } from './apiClient';
import type {
  Order,
  CreateOrderData,
  OrderStatus,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Flag para usar mock data o API real
const USE_MOCK_DATA = true;

/**
 * Mock orders para desarrollo
 */
const mockOrders: Order[] = [];

/**
 * Crea un nuevo pedido
 */
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = orderData.deliveryType === 'delivery' ? 5.0 : 0;
    const total = subtotal + deliveryFee;

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
    const response = await ordersClient.post<ApiResponse<Order>>('/orders', orderData);
    return response.data.data;
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
