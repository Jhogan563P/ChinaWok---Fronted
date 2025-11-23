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
  | 'pending'      // Pendiente de confirmación
  | 'confirmed'    // Confirmado
  | 'preparing'    // En preparación
  | 'ready'        // Listo para recoger/entregar
  | 'delivering'   // En camino (solo delivery)
  | 'delivered'    // Entregado
  | 'cancelled';   // Cancelado

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
