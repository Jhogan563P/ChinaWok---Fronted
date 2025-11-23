import { Navigate, Route, Routes } from 'react-router-dom';
import BaseLayout from '../components/layout/BaseLayout';
import CartPage from '../pages/CartPage';
import HomePage from '../pages/HomePage';
import PromotionsPage from '../pages/PromotionsPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import StoresPage from '../pages/StoresPage';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes = () => (
  <Routes>
    <Route element={<BaseLayout />}>
      <Route path="/" element={<Navigate to="/promociones" replace />} />
      <Route path="/menu" element={<HomePage />} />
      <Route path="/promociones" element={<PromotionsPage />} />
      <Route path="/locales" element={<StoresPage />} />
      <Route path="/mi-carrito" element={<CartPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/me" element={<ProfilePage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
