// =====================================================
// TIPOS PARA ENTIDADES DEL SISTEMA
// =====================================================

// =====================================================
// USUARIO
// =====================================================
export interface User {
  correo: string;
  nombre: string;
  role: 'Cliente' | 'Admin';
  informacion_bancaria?: BankingInfo;
  historial_pedidos_resumen?: OrderSummary[];
}

export interface OrderSummary {
  pedido_id: string;
  local_id: string;
  fecha: string;
  total: number;
  estado: string;
}

export interface BankingInfo {
  numero_tarjeta: string;
  cvv: string;
  fecha_vencimiento: string;
  direccion_delivery: string;
}

export interface Address {
  street: string;
  district: string;
  city: string;
  reference?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface AuthResponse {
  usuario: User;
  token: string;
  message?: string;
}

// =====================================================
// LOCAL / TIENDA
// =====================================================
export interface Store {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  deliveryTypes: DeliveryType[];
  isActive: boolean;
  openingHours?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DeliveryType = 'delivery' | 'pickup';

export interface DeliveryOption {
  type: DeliveryType;
  label: string;
  icon: string;
  description: string;
}

// =====================================================
// PRODUCTO
// =====================================================
export interface Product {
  local_id: string;
  nombre: string;
  precio: number;
  categoria: string;
  stock: number;
  descripcion?: string;
  imagen?: string;
}

export type ProductCategory =
  | "Arroces" | "Tallarines" | "Pollo al wok" | "Carne de res" | "Cerdo"
  | "Mariscos" | "Entradas" | "Guarniciones" | "Sopas" | "Combos" | "Bebidas" | "Postres";

// =====================================================
// OFERTA
// =====================================================
export interface Offer {
  local_id: string;
  oferta_id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  descuento: number; // Porcentaje de descuento (ej. 0.15 para 15%)
  producto_nombre?: string; // Nombre del producto al que aplica la oferta
  tipo: 'producto' | 'combo'; // Indica si la oferta aplica a un producto o un combo
  precio_original?: number; // Precio original del producto o combo
  precio_con_descuento?: number; // Precio final después de aplicar el descuento
}

// =====================================================
// COMBO
// =====================================================
export interface Combo {
  local_id: string;
  combo_id: string;
  nombre: string;
  descripcion: string;
  imagen_url?: string;
  precio?: number;
  productos_nombres?: string[];
  productos_incluidos?: ComboProduct[];
}

export interface ComboProduct {
  productId: string;
  productName: string;
  quantity: number;
}

// =====================================================
// PEDIDO
// =====================================================
export interface Order {
  id: string;
  userId: string;
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: DeliveryType;
  deliveryAddress?: Address;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDeliveryTime?: string;
  hasReview?: boolean;  // indica si el pedido ya tiene reseña
  userReview?: Review;  // reseña del usuario si existe
}

// =====================================================
// RESEÑA
// =====================================================
export interface Review {
  resena_id: string;
  local_id: string;
  pedido_id: string;
  cocinero_dni: string;
  despachador_dni: string;
  repartidor_dni: string;
  resena: string;  // comentario
  calificacion: number;  // 0-5
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
  type: 'product' | 'combo' | 'offer';
}

export type OrderStatus =
  | 'pending'      // Pendiente/Procesando
  | 'confirmed'    // Confirmado
  | 'preparing'    // En preparación (cocinando/empacando)
  | 'ready'        // Listo para recoger/entregar
  | 'delivering'   // En camino (solo delivery)
  | 'delivered'    // Entregado/Recibido
  | 'cancelled';   // Cancelado

// Estados del backend (para referencia)
export type BackendOrderStatus =
  | 'procesando'
  | 'cocinando'
  | 'empacando'
  | 'enviando'
  | 'entregado'   // Pedido entregado, esperando confirmación
  | 'recibido'    // Confirmado por el usuario
  | 'cancelado';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'yape'
  | 'plin';

export interface CreateOrderData {
  userId: string;
  storeId: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// =====================================================
// CARRITO DE COMPRAS (Estado Local)
// =====================================================
export interface CartItem {
  id: string; // ID del producto, combo u oferta
  name: string;
  image: string;
  price: number;
  quantity: number;
  type: 'product' | 'combo' | 'offer';
  category?: ProductCategory | 'Oferta' | 'Combo'; // Añadir categoría
  maxQuantity?: number;
  includedProducts?: string[]; // Para combos
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// =====================================================
// FILTROS Y BÚSQUEDA
// =====================================================
export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
}

export interface StoreFilters {
  city?: string;
  district?: string;
  deliveryType?: DeliveryType;
  isActive?: boolean;
}

// =====================================================
// RESPUESTAS DE API
// =====================================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// =====================================================
// WEBSOCKET NOTIFICATIONS
// =====================================================
export interface WebSocketNotification {
  tipo: 'ESTADO_ACTUALIZADO' | 'ESTADO_CAMBIADO' | 'PEDIDO_ENTREGADO' | 'PEDIDO_COMPLETADO';
  pedido_id: string;
  timestamp: string;
  datos: NotificationData;
}

export interface NotificationData {
  estado: string;
  empleado?: EmployeeInfo;
  mensaje: string;
  accion_requerida?: 'CONFIRMAR_RECEPCION';
  texto_boton?: string;
  repartidor_dni?: string;
}

export interface EmployeeInfo {
  dni: string;
  nombre: string;
  role: 'Cocinero' | 'Despachador' | 'Repartidor';
}

// =====================================================
// ORDER HISTORY & DETAILS
// =====================================================
export interface OrderStateHistory {
  estado: string;
  hora_inicio: string;
  hora_fin?: string;
  activo: boolean;
  empleado_dni?: string;
}

export interface OrderDetails extends Order {
  estado: BackendOrderStatus; // Estado actual del pedido del backend
  costo: number; // Costo total del pedido, como lo usa el backend
  fecha_entrega_aproximada?: string; // Fecha de entrega aproximada
  historial_estados: OrderStateHistory[];
  direccion?: string;
  productos?: Array<{ nombre: string; cantidad: number }>;
  combos?: Array<{ combo_id: string; cantidad: number }>;
}
