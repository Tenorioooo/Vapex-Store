import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './components/layout/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import InfoPage from './pages/InfoPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-[#050505] text-white">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/lancamentos" element={<NewArrivalsPage />} />
            <Route path="/sobre" element={<InfoPage />} />
            <Route path="/privacidade" element={<InfoPage />} />
            <Route path="/termos" element={<InfoPage />} />
            <Route path="/trocas" element={<InfoPage />} />
            <Route path="/faq" element={<InfoPage />} />
            <Route path="/categoria/:slug" element={<ProductsPage />} />
            <Route path="/produto/:slug" element={<ProductDetailPage />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/conta" element={<AccountPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/busca" element={<SearchPage />} />
            <Route path="/admin/produtos" element={<AdminProductsPage />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
