import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Cart } from '../types';

interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'chinawok_cart';
const DELIVERY_FEE = 5.0; // Costo de delivery por defecto

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  // Inicializar carrito desde localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Calcular totales
  const calculateTotals = (items: CartItem[]): Cart => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;

    return {
      items,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee,
      total: Number(total.toFixed(2))
    };
  };

  const cart = calculateTotals(cartItems);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Agrega un item al carrito o incrementa su cantidad si ya existe
   */
  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);

      if (existingItemIndex > -1) {
        // Item ya existe, incrementar cantidad
        const newItems = [...prevItems];
        const newQuantity = newItems[existingItemIndex].quantity + quantity;

        // Verificar límite máximo si existe
        const maxQuantity = newItems[existingItemIndex].maxQuantity;
        if (maxQuantity && newQuantity > maxQuantity) {
          console.warn(`Cantidad máxima alcanzada para ${item.name}`);
          return prevItems;
        }

        newItems[existingItemIndex].quantity = newQuantity;
        return newItems;
      } else {
        // Item nuevo, agregarlo
        const newItem: CartItem = {
          ...item,
          quantity
        };
        return [...prevItems, newItem];
      }
    });
  };

  /**
   * Elimina un item completamente del carrito
   */
  const removeItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  /**
   * Actualiza la cantidad de un item específico
   */
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems((prevItems) => {
      const newItems = [...prevItems];
      const itemIndex = newItems.findIndex((item) => item.id === itemId);

      if (itemIndex > -1) {
        // Verificar límite máximo si existe
        const maxQuantity = newItems[itemIndex].maxQuantity;
        if (maxQuantity && quantity > maxQuantity) {
          console.warn(`Cantidad máxima es ${maxQuantity}`);
          newItems[itemIndex].quantity = maxQuantity;
        } else {
          newItems[itemIndex].quantity = quantity;
        }
      }

      return newItems;
    });
  };

  /**
   * Vacía el carrito completamente
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  /**
   * Obtiene la cantidad de un item específico en el carrito
   */
  const getItemQuantity = (itemId: string): number => {
    const item = cartItems.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  /**
   * Cantidad total de items en el carrito
   */
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getItemQuantity,
    itemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook personalizado para usar el contexto del carrito
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }

  return context;
};
