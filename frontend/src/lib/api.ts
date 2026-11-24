import {
  demoBrands,
  demoCategories,
  demoProducts,
  demoSettings,
  demoTestimonials,
} from './demoData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(message: string, status: number, data: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function isStaticDemoMode(): boolean {
  return (
    import.meta.env.VITE_DEMO_MODE === 'true' ||
    (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io'))
  );
}

function handleDemoRequest<T>(path: string, options: RequestInit = {}): T {
  const [pathname, qs] = path.split('?');
  const params = new URLSearchParams(qs || '');
  const body = options.body ? JSON.parse(String(options.body)) : {};

  if (pathname === '/settings') {
    return { settings: demoSettings } as T;
  }
  if (pathname === '/home') {
    return {
      featured_categories: demoCategories,
      new_arrivals: demoProducts.filter((p) => p.is_new_arrival),
      best_sellers: demoProducts.filter((p) => p.is_best_seller),
      flash_sales: demoProducts.filter((p) => p.is_flash_sale),
      testimonials: demoTestimonials,
      settings: demoSettings,
    } as T;
  }
  if (pathname === '/categories') {
    return { categories: demoCategories } as T;
  }
  if (pathname === '/brands') {
    return { brands: demoBrands } as T;
  }
  if (pathname === '/products/suggestions') {
    const q = (params.get('q') || '').toLowerCase();
    return {
      suggestions: demoProducts.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6),
    } as T;
  }
  if (pathname === '/products') {
    let list = [...demoProducts];
    const cat = params.get('category');
    const brand = params.get('brand');
    const minPrice = params.get('min_price');
    const maxPrice = params.get('max_price');
    const rating = params.get('rating');
    const search = (params.get('search') || '').toLowerCase();
    const flash = params.get('flash_sale');
    const sort = params.get('sort');

    if (cat) list = list.filter((p) => p.category?.slug === cat);
    if (brand) list = list.filter((p) => p.brand?.slug === brand);
    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (rating) list = list.filter((p) => p.rating_avg >= Number(rating));
    if (flash) list = list.filter((p) => p.is_flash_sale);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating_avg - a.rating_avg);

    return { data: list, current_page: 1, last_page: 1, total: list.length } as T;
  }
  if (pathname.startsWith('/products/')) {
    const slug = pathname.replace('/products/', '');
    const product = demoProducts.find((p) => p.slug === slug) || demoProducts[0];
    const related = demoProducts.filter((p) => p.id !== product.id).slice(0, 4);
    return { product: { ...product, reviews: demoTestimonials }, related } as T;
  }
  if (pathname === '/coupons/validate') {
    const code = String(body.code || '').toUpperCase();
    const subtotal = Number(body.subtotal || 0);
    if (code === 'SADIK10') {
      return { coupon: { code: 'SADIK10' }, discount: Math.round(subtotal * 0.1) } as T;
    }
    if (code === 'WELCOME200') {
      return { coupon: { code: 'WELCOME200' }, discount: Math.min(200, subtotal) } as T;
    }
    throw new ApiError('Invalid coupon code. Try SADIK10 or WELCOME200.', 404);
  }
  if (pathname === '/checkout' || pathname === '/customer/checkout') {
    const items = (body.items || []).map((it: { product_id: number; quantity: number }, idx: number) => {
      const p = demoProducts.find((x) => x.id === it.product_id) || demoProducts[0];
      return {
        id: idx + 1,
        product_id: p.id,
        product_name: p.name,
        unit_price: p.price,
        quantity: it.quantity,
        total_price: p.price * it.quantity,
      };
    });
    const subtotal = items.reduce((s: number, i: { total_price: number }) => s + i.total_price, 0);
    const delivery = body.shipping_zone === 'outside_dhaka' ? 130 : 70;
    const discount = body.coupon_code === 'SADIK10' ? Math.round(subtotal * 0.1) : body.coupon_code === 'WELCOME200' ? 200 : 0;
    const order = {
      id: Date.now(),
      order_number: `SDK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-DEMO`,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      shipping_address: body.shipping_address,
      city: body.city,
      shipping_zone: body.shipping_zone,
      subtotal,
      discount_amount: discount,
      delivery_charge: delivery,
      total: Math.max(0, subtotal - discount + delivery),
      payment_method: body.payment_method,
      payment_status: body.payment_method === 'cod' ? 'pending' : 'paid',
      payment_reference: body.payment_method === 'cod' ? 'COD-DEMO' : `${String(body.payment_method).toUpperCase()}-MOCK-DEMO`,
      status: 'pending',
      created_at: new Date().toISOString(),
      items,
    };
    return { message: 'Order placed successfully (Demo Mode).', order } as T;
  }
  if (pathname === '/orders/track') {
    return {
      order: {
        id: 1,
        order_number: body.order_number || 'SDK-20261124-1001',
        customer_name: 'Ayesha Rahman',
        customer_phone: body.phone || '01617-723455',
        shipping_address: '58, Satmasjid Road, Dhanmondi',
        city: 'Dhaka',
        shipping_zone: 'inside_dhaka',
        subtotal: 4850,
        discount_amount: 0,
        delivery_charge: 70,
        total: 4920,
        payment_method: 'bkash',
        payment_status: 'paid',
        status: 'shipped',
        created_at: new Date().toISOString(),
        items: [{ id: 1, product_name: demoProducts[0].name, unit_price: 4850, quantity: 1, total_price: 4850 }],
      },
    } as T;
  }
  if (pathname === '/newsletter') {
    return { message: 'Subscribed to Sadik newsletter!' } as T;
  }
  if (pathname === '/contact') {
    return { message: 'Thank you for contacting Sadik. We will reply shortly!' } as T;
  }
  if (pathname === '/auth/login') {
    const isAdmin = String(body.email || '').includes('admin');
    return {
      user: {
        id: isAdmin ? 1 : 3,
        name: isAdmin ? 'Sadik Admin' : 'Ayesha Rahman',
        email: body.email,
        phone: '01617-723455',
        role: isAdmin ? 'admin' : 'customer',
        is_active: true,
      },
      token: 'demo-token',
    } as T;
  }
  if (pathname === '/auth/me') {
    const saved = localStorage.getItem('sadik_user');
    return { user: saved ? JSON.parse(saved) : null } as T;
  }
  if (pathname === '/admin/dashboard') {
    return {
      metrics: { total_sales: 148500, total_orders: 38, pending_orders: 5, total_customers: 24, total_products: demoProducts.length },
      sales_chart: [
        { date: 'Nov 18', sales: 14200, orders: 4 },
        { date: 'Nov 19', sales: 19800, orders: 5 },
        { date: 'Nov 20', sales: 16500, orders: 4 },
        { date: 'Nov 21', sales: 24300, orders: 7 },
        { date: 'Nov 22', sales: 21900, orders: 6 },
        { date: 'Nov 23', sales: 28400, orders: 7 },
        { date: 'Nov 24', sales: 23400, orders: 5 },
      ],
      top_products: demoProducts.slice(0, 4).map((p, idx) => ({ product_name: p.name, total_sold: 18 - idx * 3, revenue: p.price * (18 - idx * 3) })),
      recent_orders: [],
      low_stock_products: [],
    } as T;
  }
  if (pathname === '/admin/products') return { data: demoProducts } as T;
  if (pathname === '/admin/categories') return { categories: demoCategories } as T;
  if (pathname === '/admin/brands') return { brands: demoBrands } as T;
  if (pathname === '/admin/settings') return { settings: demoSettings } as T;
  if (pathname === '/customer/wishlist') return { wishlist: [] } as T;
  if (pathname === '/customer/orders') return { data: [] } as T;
  if (pathname === '/customer/addresses') return { addresses: [] } as T;

  return {} as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (isStaticDemoMode()) {
    return handleDemoRequest<T>(path, options);
  }

  const token = localStorage.getItem('sadik_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      (data as { message?: string }).message || 'Something went wrong',
      res.status,
      data
    );
  }

  return data as T;
}

export function formatBDT(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString('en-BD', {
    maximumFractionDigits: 0,
  })}`;
}
