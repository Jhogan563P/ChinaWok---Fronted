import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { cart, removeItem, updateItemQuantity, clearCart, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirigir a registro/login si no está autenticado
      navigate('/registro', { state: { from: '/mi-carrito' } });
      return;
    }

    // TODO: Implementar flujo de checkout cuando tengas la API
    alert('Funcionalidad de checkout pendiente de implementación con API');
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      if (confirm('¿Deseas eliminar este producto del carrito?')) {
        removeItem(itemId);
      }
      return;
    }
    updateItemQuantity(itemId, newQuantity);
  };

  const handleClearCart = () => {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      clearCart();
    }
  };

  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="rounded-3xl bg-white p-12 shadow-sm">
          <svg
            className="mx-auto h-24 w-24 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h1 className="mt-6 text-2xl font-semibold text-dark-text">Tu carrito está vacío</h1>
          <p className="mt-2 text-gray-600">Agrega productos para comenzar tu pedido</p>
          <Link
            to="/promociones"
            className="mt-6 inline-block rounded-full bg-secondary px-8 py-3 text-sm font-semibold text-white transition hover:bg-secondary/90"
          >
            Ver promociones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl gap-8 px-6 py-10 lg:grid lg:grid-cols-[1fr,380px]">
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-dark-text">Mi carrito ({itemCount})</h1>
            {itemCount > 0 && (
              <button
                onClick={handleClearCart}
                className="text-sm text-gray-500 hover:text-primary"
              >
                Vaciar carrito
              </button>
            )}
          </div>
          <div className="mt-6 space-y-4">
            {cart.items.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4"
              >
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-dark-text">{item.name}</h2>
                  <p className="text-sm text-gray-500">
                    S/ {Number(item.price).toFixed(2)} c/u
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-primary hover:text-primary"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-primary hover:text-primary"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    S/ {(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-2 text-sm text-gray-400 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <Link
          to="/promociones"
          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
        >
          ← Seguir comprando
        </Link>
      </section>

      <aside className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-sm lg:mt-0 lg:self-start lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold text-dark-text">Resumen del pedido</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
            <span>S/ {cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>S/ {cart.deliveryFee.toFixed(2)}</span>
          </div>
          {cart.deliveryFee === 0 && itemCount > 0 && (
            <p className="text-xs text-gray-500">
              El costo de delivery se calculará al finalizar la compra
            </p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-lg font-semibold text-dark-text">Total</span>
          <span className="text-xl font-bold text-primary">S/ {cart.total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 active:scale-95"
        >
          {isAuthenticated ? 'Finalizar compra' : 'Inicia sesión para continuar'}
        </button>
        {!isAuthenticated && (
          <p className="text-center text-xs text-gray-500">
            Debes iniciar sesión para completar tu pedido
          </p>
        )}
      </aside>
    </div>
  );
};

export default CartPage;
