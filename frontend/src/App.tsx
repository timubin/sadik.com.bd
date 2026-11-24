import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StoreProvider } from './context/StoreContext';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { HomePage } from './pages/HomePage';
import { AboutPage, ContactPage, FaqPage, PolicyPage } from './pages/InfoPages';
import { LoginPage } from './pages/LoginPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ShopPage } from './pages/ShopPage';
import { TrackOrderPage } from './pages/TrackOrderPage';

const isGhPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const Router = isGhPages ? HashRouter : BrowserRouter;

export function App() {
  return (
    <StoreProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route
              path="/privacy-policy"
              element={
                <PolicyPage
                  title="Privacy Policy"
                  body="Sadik (sadik.com.bd) respects your privacy. We collect only the contact and shipping details needed to fulfill orders, verify payments, and support your account. We never sell customer data to third parties."
                />
              }
            />
            <Route
              path="/terms"
              element={
                <PolicyPage
                  title="Terms & Conditions"
                  body="By placing an order on sadik.com.bd, you agree to provide accurate delivery information and honor Cash on Delivery or digital payment commitments. Prices and stock availability are subject to change without prior notice."
                />
              }
            />
            <Route
              path="/return-policy"
              element={
                <PolicyPage
                  title="Return & Refund Policy"
                  body="Products purchased from sadik.com.bd may be returned or exchanged within 7 days of delivery if unused, unwashed, and in original packaging with tags intact. Call 01617-723455 to initiate a return."
                />
              }
            />
          </Routes>
        </Layout>
      </Router>
    </StoreProvider>
  );
}

export default App;
