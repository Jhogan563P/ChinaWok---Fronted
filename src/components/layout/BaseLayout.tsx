import { Outlet } from 'react-router-dom';
import Footer from '../shared/Footer';
import Header from '../shared/Header';

const BaseLayout = () => (
  <div className="flex min-h-screen flex-col bg-white">
    <Header />
    <main className="flex-1 bg-light-gray">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default BaseLayout;
