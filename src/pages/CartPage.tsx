import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react'; // Añadir useEffect y useState
import { getCurrentUser } from '../services/userService'; // Añadir getCurrentUser

const CartPage = () => {
  const { cart, removeItem, updateItemQuantity, clearCart, itemCount } = useCart();
  const { isAuthenticated, user } = useAuth(); // Añadir user al desestructurar
  const navigate = useNavigate();

  // Estados para manejar los datos del formulario de entrega y pago
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isEditingBankingInfo, setIsEditingBankingInfo] = useState(false); // Nuevo estado

  // Cargar información bancaria del usuario al montar o cuando el usuario cambia
  useEffect(() => {
    if (isAuthenticated && user?.informacion_bancaria && !isEditingBankingInfo) {
      setAddress(user.informacion_bancaria.direccion_delivery || '');
      setCardNumber(user.informacion_bancaria.numero_tarjeta || '');
      setExpiry(user.informacion_bancaria.fecha_vencimiento || '');
      setCvv(user.informacion_bancaria.cvv || '');
    } else if (!isAuthenticated || !user?.informacion_bancaria) {
      // Limpiar campos si no está autenticado o no tiene info bancaria
      setAddress('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }
  }, [isAuthenticated, user, isEditingBankingInfo]);


  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/registro', { state: { from: '/mi-carrito' } });
      return;
    }

    if (!user || !user.correo) {
      alert('Error: No se pudo identificar al usuario.');
      return;
    }

    // Validar que todos los campos requeridos estén llenos antes de proceder
    if (!address.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      alert('Por favor, completa todos los campos de Dirección de Entrega, Número de Tarjeta, Vencimiento y CVV.');
      return;
    }

    try {
      const { createOrder } = await import('../services/orderService');
      const { updateMyProfile } = await import('../services/userService');

      // 1. Actualizar información del usuario (información bancaria y dirección de entrega)
      // Siempre se intentará actualizar con los valores actuales del formulario
      await updateMyProfile({
        correo: user.correo, // Añadir el correo del usuario
        nombre: user.nombre, // Añadir el nombre del usuario
        informacion_bancaria: {
          numero_tarjeta: cardNumber,
          cvv: cvv,
          fecha_vencimiento: expiry,
          direccion_delivery: address
        }
      });
      // Después de una actualización exitosa, la info del user en el AuthContext se refrescará con los nuevos datos.
      // Por lo tanto, no necesitamos una lógica condicional (isEditingBankingInfo || !user.informacion_bancaria)
      // ya que la actualización siempre se intenta con los datos del formulario.


      // 2. Crear el pedido
      const storeId = localStorage.getItem('selectedStoreId');
      if (!storeId) {
        alert('Error: No hay una tienda seleccionada.');
        return;
      }

      await createOrder({
        userId: user.correo,
        storeId: storeId,
        items: cart.items.map(item => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          type: item.type,
          includedProducts: item.includedProducts
        })),
        deliveryType: 'delivery',
        deliveryAddress: {
          street: address,
          district: 'Lima', // Simplificado
          city: 'Lima'
        },
        paymentMethod: 'card'
      });

      alert('¡Pedido creado exitosamente!');
      clearCart();
      navigate('/perfil'); // Redirigir al perfil para que el usuario vea los cambios
    } catch (error: any) {
      console.error('Error al procesar el pedido:', error);
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Hubo un error al procesar tu pedido: ${msg}`);
    }
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

  const hasBankingInfo = !!user?.informacion_bancaria?.numero_tarjeta;

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

        {/* Paso 1: Resumen de Costos */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
            <span>S/ {cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>S/ {cart.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-lg font-semibold text-dark-text">Total</span>
            <span className="text-xl font-bold text-primary">S/ {cart.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Paso 2: Datos de Entrega y Pago */}
        {isAuthenticated ? (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="mb-4 font-semibold text-dark-text">Datos de Entrega y Pago</h3>
            <form id="checkout-form" className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Dirección de Entrega</label>
                <input
                  type="text"
                  id="address"
                  placeholder="Av. Principal 123, Distrito"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={hasBankingInfo && !isEditingBankingInfo}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-700">Número de Tarjeta</label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="4557 8800 1234 5678"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    disabled={hasBankingInfo && !isEditingBankingInfo}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Vencimiento (MM/YY)</label>
                  <input
                    type="text"
                    id="expiry"
                    placeholder="12/25"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    disabled={hasBankingInfo && !isEditingBankingInfo}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    disabled={hasBankingInfo && !isEditingBankingInfo}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>
            </form>

            {hasBankingInfo && (
              <p className="mt-4 text-sm text-gray-600">
                Ya tienes información de pago guardada.
                {isEditingBankingInfo ? (
                  <button
                    onClick={() => setIsEditingBankingInfo(false)}
                    className="ml-2 text-primary hover:underline font-semibold"
                  >
                    Cancelar edición
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingBankingInfo(true)}
                    className="ml-2 text-primary hover:underline font-semibold"
                  >
                    Editar
                  </button>
                )}
              </p>
            )}

            <button
              onClick={handleCheckout}
              className="mt-6 w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 active:scale-95"
            >
              Finalizar Compra
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Al finalizar, tus datos de entrega y pago se actualizarán en tu perfil.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <button
              onClick={() => navigate('/login', { state: { from: '/mi-carrito' } })}
              className="w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 active:scale-95"
            >
              Inicia sesión para continuar
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Debes iniciar sesión para completar tu pedido
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartPage;
