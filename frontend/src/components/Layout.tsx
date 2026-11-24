import React, { useEffect, useState } from 'react';
import {
  Globe,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Truck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { apiRequest, formatBDT } from '../lib/api';
import { t } from '../lib/i18n';
import type { Product } from '../types';
import { CartDrawer } from './CartDrawer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    settings,
    user,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    theme,
    toggleTheme,
    lang,
    setLang,
    toast,
  } = useStore();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const res = await apiRequest<{ suggestions: Product[] }>(
          `/products/suggestions?q=${encodeURIComponent(q)}`
        );
        setSuggestions(res.suggestions);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const navItems = settings.header_menu?.length
    ? settings.header_menu
    : [
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shop' },
        { label: 'Track Order', path: '/track-order' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Info Bar */}
      <div className="no-print bg-slate-900 text-xs text-slate-200 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-teal-400" />
              <a href={`tel:${settings.phone}`} className="hover:text-white">
                {settings.phone}
              </a>
            </span>
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <MapPin className="h-3.5 w-3.5 text-teal-400" />
              <span>{settings.address}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold hover:bg-slate-700"
            >
              <Globe className="h-3 w-3" />
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
            <Link to="/faq" className="hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="no-print sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.brand_name} className="h-9 w-auto" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-lg font-extrabold text-white shadow-sm">
                  S
                </div>
              )}
              <div>
                <span className="block text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {settings.brand_name || 'Sadik'}
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  {settings.domain || 'sadik.com.bd'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-semibold text-slate-700 transition hover:text-teal-700 dark:text-slate-200 dark:hover:text-teal-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Live Search Bar */}
          <div className="relative hidden flex-1 max-w-sm md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 180)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder={t(lang, 'searchPlaceholder')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-teal-500"
              />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <img
                      src={item.images?.[0] || ''}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs font-bold text-teal-600">{formatBDT(item.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user && (user.role === 'admin' || user.role === 'staff') && (
              <Link
                to="/admin"
                className="hidden items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 sm:inline-flex dark:bg-teal-950 dark:text-teal-300"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t(lang, 'adminPanel')}
              </Link>
            )}

            <Link
              to={user ? '/account' : '/login'}
              className="inline-flex items-center gap-1.5 rounded-xl p-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <UserIcon className="h-5 w-5" />
              <span className="hidden xl:inline">{user ? user.name.split(' ')[0] : t(lang, 'account')}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{formatBDT(cartSubtotal)}</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-extrabold text-slate-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Nav */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t(lang, 'searchPlaceholder')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </form>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              ))}
              {user && (user.role === 'admin' || user.role === 'staff') && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Trust Badges */}
      <section className="no-print border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-teal-600" />
            <div>
              <h4 className="text-sm font-bold">Fast Bangladesh Delivery</h4>
              <p className="text-xs text-slate-500">24-48h Dhaka, 2-4 days nationwide</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-teal-600" />
            <div>
              <h4 className="text-sm font-bold">100% Authentic Products</h4>
              <p className="text-xs text-slate-500">Verified quality & warranty</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-teal-600" />
            <div>
              <h4 className="text-sm font-bold">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-500">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-8 w-8 text-teal-600" />
            <div>
              <h4 className="text-sm font-bold">Dedicated Support</h4>
              <p className="text-xs text-slate-500">Call {settings.phone}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="no-print bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-extrabold text-white">{settings.brand_name || 'Sadik'}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {settings.tagline || 'Elevated Lifestyle & Everyday Essentials in Bangladesh.'}
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-teal-400" />
                <span>{settings.phone}</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-teal-400">All Products</Link></li>
              <li><Link to="/shop?flash_sale=1" className="hover:text-teal-400">Flash Sale</Link></li>
              <li><Link to="/track-order" className="hover:text-teal-400">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-teal-400">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Information</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-teal-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-teal-400">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-teal-400">FAQ</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-teal-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-teal-400">Terms & Conditions</Link></li>
              <li><Link to="/return-policy" className="hover:text-teal-400">Return Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Visit Our Office</h4>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <iframe
                title="Sadik Dhaka Location"
                src={
                  settings.google_map_embed_url ||
                  'https://www.google.com/maps?q=58+Satmasjid+Road+Dhanmondi+Dhaka+Bangladesh&output=embed'
                }
                className="h-36 w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {settings.brand_name || 'Sadik'} ({settings.domain || 'sadik.com.bd'}). All rights reserved.
        </div>
      </footer>

      {/* Sticky Mobile Cart Bar */}
      {cartCount > 0 && (
        <div className="no-print fixed bottom-3 left-4 right-20 z-30 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl dark:bg-teal-600"
          >
            <span>{cartCount} items in cart</span>
            <span>{formatBDT(cartSubtotal)} →</span>
          </button>
        </div>
      )}

      {/* WhatsApp Floating Chat Button */}
      <a
        href={`https://wa.me/${settings.whatsapp_number || '8801617723455'}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="no-print fixed bottom-4 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl transition hover:scale-110 hover:bg-emerald-600"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Toast Notification */}
      {toast && (
        <div className="no-print fixed bottom-20 right-4 z-50 animate-fade-up rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-teal-600">
          {toast}
        </div>
      )}

      <CartDrawer />
    </div>
  );
};
