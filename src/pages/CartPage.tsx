const cartItems = [
  {
    id: 1,
    title: 'Cyber Familiar',
    price: 99.8,
    quantity: 1,
    image: 'https://www.chinawok.com.pe/img/menu/promos/cyber-familiar.webp'
  }
];

const CartPage = () => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl gap-8 px-6 py-10 lg:grid lg:grid-cols-[1fr,380px]">
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-dark-text">Mi carrito</h1>
          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <article key={item.id} className="flex items-center gap-4">
                <img src={item.image} alt={item.title} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-dark-text">{item.title}</h2>
                  <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                </div>
                <p className="text-lg font-semibold text-primary">S/ {item.price.toFixed(2)}</p>
              </article>
            ))}
          </div>
        </div>
        <a href="/promociones" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary">
          ← Seguir comprando
        </a>
      </section>

      <aside className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-sm lg:mt-0">
        <h2 className="text-xl font-semibold text-dark-text">Resumen del pedido</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>¿Tienes un código de descuento?</span>
            <button className="text-secondary hover:text-primary">Ingresar</button>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-lg font-semibold text-dark-text">Total Pedido</span>
          <span className="text-xl font-bold text-primary">S/ {subtotal.toFixed(2)}</span>
        </div>
        <button className="w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white transition hover:bg-secondary/90">
          Finalizar compra
        </button>
      </aside>
    </div>
  );
};

export default CartPage;
