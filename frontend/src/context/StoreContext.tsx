import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { Lang } from '../lib/i18n';
import type { CartItem, Product, ProductVariant, SiteSettings, User } from '../types';

interface StoreContextValue {
  settings: SiteSettings;
  refreshSettings: () => Promise<void>;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, phone: string, password: string, password_confirmation: string) => Promise<User>;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant | null, qty?: number) => void;
  updateCartQty: (productId: number, variantId: number | null | undefined, qty: number) => void;
  removeFromCart: (productId: number, variantId?: number | null) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlistIds: number[];
  toggleWishlist: (productId: number) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const defaultSettings: SiteSettings = {
  brand_name: 'Sadik',
  domain: 'sadik.com.bd',
  address: '58, Satmasjid Road, Level 7, Green City Center, Dhanmondi, Dhaka, Bangladesh',
  phone: '01617-723455',
  email: 'support@sadik.com.bd',
  whatsapp_number: '8801617723455',
  primary_color: '#0f766e',
  delivery_charge_inside_dhaka: 70,
  delivery_charge_outside_dhaka: 130,
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sadik_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sadik_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sadik_theme') as 'light' | 'dark') || 'light';
  });
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('sadik_lang') as Lang) || 'en';
  });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const refreshSettings = async () => {
    try {
      const res = await apiRequest<{ settings: SiteSettings }>('/settings');
      const merged = { ...defaultSettings, ...res.settings };
      setSettings(merged);
      if (merged.primary_color) {
        document.documentElement.style.setProperty('--brand-primary', String(merged.primary_color));
      }
      if (merged.seo_title) {
        document.title = String(merged.seo_title);
      }
    } catch {
      // Keep defaults when backend is offline
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('sadik_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sadik_theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('sadik_token');
    if (!token) return;
    apiRequest<{ user: User }>('/auth/me')
      .then((res) => {
        setUser(res.user);
        localStorage.setItem('sadik_user', JSON.stringify(res.user));
        return apiRequest<{ wishlist: Product[] }>('/customer/wishlist');
      })
      .then((res) => setWishlistIds(res.wishlist.map((p) => p.id)))
      .catch(() => {
        localStorage.removeItem('sadik_token');
        localStorage.removeItem('sadik_user');
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('sadik_token', res.token);
    localStorage.setItem('sadik_user', JSON.stringify(res.user));
    setUser(res.user);
    showToast(`Welcome back, ${res.user.name}!`);
    return res.user;
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    password_confirmation: string
  ): Promise<User> => {
    const res = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, password_confirmation }),
    });
    localStorage.setItem('sadik_token', res.token);
    localStorage.setItem('sadik_user', JSON.stringify(res.user));
    setUser(res.user);
    showToast('Account created successfully!');
    return res.user;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('sadik_token');
    localStorage.removeItem('sadik_user');
    setUser(null);
    setWishlistIds([]);
    showToast('Signed out.');
  };

  const addToCart = (product: Product, variant?: ProductVariant | null, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && (item.variant?.id ?? null) === (variant?.id ?? null)
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product, variant: variant ?? null, quantity: qty }];
    });
    showToast(`${product.name} added to cart`);
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: number, variantId: number | null | undefined, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && (item.variant?.id ?? null) === (variantId ?? null)
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (productId: number, variantId?: number | null) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && (item.variant?.id ?? null) === (variantId ?? null))
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      showToast('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      const res = await apiRequest<{ wishlisted: boolean }>('/customer/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      });
      setWishlistIds((prev) =>
        res.wishlisted ? [...new Set([...prev, productId])] : prev.filter((id) => id !== productId)
      );
      showToast(res.wishlisted ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch {
      showToast('Could not update wishlist');
    }
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem('sadik_lang', next);
  };

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((acc, item) => {
        const unit = Number(item.product.price) + Number(item.variant?.price_adjustment ?? 0);
        return acc + unit * item.quantity;
      }, 0),
    [cart]
  );

  return (
    <StoreContext.Provider
      value={{
        settings,
        refreshSettings,
        user,
        setUser,
        login,
        register,
        logout,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        wishlistIds,
        toggleWishlist,
        theme,
        toggleTheme,
        lang,
        setLang,
        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
