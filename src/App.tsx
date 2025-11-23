import AppRoutes from './router/AppRoutes';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';

const App = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
