import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Boxes,
  FolderTree,
  MessageSquare,
  Package,
  Printer,
  Settings,
  Tag,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { apiRequest, formatBDT } from '../lib/api';
import type { Brand, Category, Coupon, Order, Product, Review, SiteSettings, User } from '../types';

type AdminTab = 'dashboard' | 'products' | 'catalog' | 'orders' | 'coupons' | 'customers' | 'reviews' | 'settings';

interface DashboardData {
  metrics: {
    total_sales: number;
    total_orders: number;
    pending_orders: number;
    total_customers: number;
    total_products: number;
  };
  sales_chart: { date: string; sales: number; orders: number }[];
  top_products: { product_name: string; total_sold: number; revenue: number }[];
  recent_orders: Order[];
  low_stock_products: Product[];
}

export const AdminPage: React.FC = () => {
  const { user, showToast, refreshSettings } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('dashboard');

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Forms
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    category_id: '',
    brand_id: '',
    price: '',
    compare_at_price: '',
    stock_qty: '10',
    image: '',
    short_description: '',
    is_new_arrival: true,
    is_featured: false,
    is_flash_sale: false,
  });
  const [bulkJson, setBulkJson] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percent', value: '10', min_order_amount: '500' });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      navigate('/login');
      return;
    }
    loadTab(tab);
  }, [user, tab]);

  const loadTab = async (activeTab: AdminTab) => {
    try {
      if (activeTab === 'dashboard') {
        setDashboard(await apiRequest<DashboardData>('/admin/dashboard'));
      } else if (activeTab === 'products') {
        const [p, c, b] = await Promise.all([
          apiRequest<{ data: Product[] }>('/admin/products'),
          apiRequest<{ categories: Category[] }>('/admin/categories'),
          apiRequest<{ brands: Brand[] }>('/admin/brands'),
        ]);
        setProducts(p.data);
        setCategories(c.categories);
        setBrands(b.brands);
      } else if (activeTab === 'catalog') {
        const [c, b] = await Promise.all([
          apiRequest<{ categories: Category[] }>('/admin/categories'),
          apiRequest<{ brands: Brand[] }>('/admin/brands'),
        ]);
        setCategories(c.categories);
        setBrands(b.brands);
      } else if (activeTab === 'orders') {
        const res = await apiRequest<{ data: Order[] }>('/admin/orders');
        setOrders(res.data);
      } else if (activeTab === 'coupons') {
        const res = await apiRequest<{ coupons: Coupon[] }>('/admin/coupons');
        setCoupons(res.coupons);
      } else if (activeTab === 'customers') {
        const res = await apiRequest<{ data: User[] }>('/admin/customers');
        setCustomers(res.data);
      } else if (activeTab === 'reviews') {
        const res = await apiRequest<{ data: Review[] }>('/admin/reviews');
        setReviews(res.data);
      } else if (activeTab === 'settings' && user?.role === 'admin') {
        const res = await apiRequest<{ settings: SiteSettings }>('/admin/settings');
        setSiteSettings(res.settings);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProd,
          category_id: Number(newProd.category_id),
          brand_id: newProd.brand_id ? Number(newProd.brand_id) : null,
          price: Number(newProd.price),
          compare_at_price: newProd.compare_at_price ? Number(newProd.compare_at_price) : null,
          stock_qty: Number(newProd.stock_qty),
          images: newProd.image ? [newProd.image] : [],
        }),
      });
      showToast('Product created!');
      setNewProd({ ...newProd, name: '', sku: '', price: '', compare_at_price: '', image: '', short_description: '' });
      loadTab('products');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const handleBulkUpload = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      const res = await apiRequest<{ message: string }>('/admin/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ products: parsed }),
      });
      showToast(res.message);
      setBulkJson('');
      loadTab('products');
    } catch {
      showToast('Invalid JSON format for bulk upload.');
    }
  };

  const handleUpdateOrder = async (orderId: number, status: string, payment_status?: string) => {
    await apiRequest(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...(payment_status ? { payment_status } : {}) }),
    });
    showToast('Order updated');
    loadTab('orders');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: siteSettings }),
      });
      await refreshSettings();
      showToast('Site settings saved & applied live!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  if (!user) return null;

  const navTabs: { id: AdminTab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'catalog', label: 'Categories & Brands', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: Boxes },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'customers', label: 'Customers & Roles', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'settings', label: 'Site Settings', icon: Settings, adminOnly: true },
  ];

  const maxChartSales = Math.max(1, ...(dashboard?.sales_chart.map((d) => d.sales) || [1]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Printable Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-extrabold">SADIK INVOICE</h2>
                <p className="text-xs text-slate-500">Order #{invoiceOrder.order_number}</p>
              </div>
              <div className="no-print flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p><strong>Customer:</strong> {invoiceOrder.customer_name} ({invoiceOrder.customer_phone})</p>
              <p><strong>Address:</strong> {invoiceOrder.shipping_address}, {invoiceOrder.city}</p>
            </div>
            <div className="mt-4 space-y-1 border-t pt-3 text-sm">
              {invoiceOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.product_name} × {it.quantity}</span>
                  <span>{formatBDT(it.total_price)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-extrabold">
                <span>Total</span>
                <span>{formatBDT(invoiceOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Admin Control Center</h1>
          <p className="text-xs text-slate-500">Signed in as {user.name} ({user.role})</p>
        </div>
      </div>

      <div className="no-print mb-6 flex flex-wrap gap-2">
        {navTabs
          .filter((tItem) => !tItem.adminOnly || user.role === 'admin')
          .map((tItem) => (
            <button
              key={tItem.id}
              type="button"
              onClick={() => setTab(tItem.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                tab === tItem.id
                  ? 'bg-teal-700 text-white shadow'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <tItem.icon className="h-4 w-4" />
              {tItem.label}
            </button>
          ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && dashboard && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Total Sales', val: formatBDT(dashboard.metrics.total_sales) },
              { label: 'Total Orders', val: dashboard.metrics.total_orders },
              { label: 'Pending Orders', val: dashboard.metrics.pending_orders },
              { label: 'Customers', val: dashboard.metrics.total_customers },
              { label: 'Products', val: dashboard.metrics.total_products },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-xs font-semibold text-slate-500">{m.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{m.val}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-sm font-bold">7-Day Sales Overview</h3>
              <div className="flex h-44 items-end gap-3">
                {dashboard.sales_chart.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-teal-600 transition-all"
                      style={{ height: `${Math.max(8, (d.sales / maxChartSales) * 140)}px` }}
                      title={formatBDT(d.sales)}
                    />
                    <span className="text-[10px] font-semibold text-slate-500">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-sm font-bold">Top Selling Products</h3>
              <div className="space-y-3 text-sm">
                {dashboard.top_products.map((tp, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="font-medium">{tp.product_name}</span>
                    <span className="font-bold text-teal-600">{tp.total_sold} sold</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {tab === 'products' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <form
              onSubmit={handleCreateProduct}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold">Add Product</h3>
              <input required value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} placeholder="Product Name" className="w-full rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input required value={newProd.sku} onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })} placeholder="SKU (e.g. SDK-109)" className="w-full rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <select required value={newProd.category_id} onChange={(e) => setNewProd({ ...newProd, category_id: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={newProd.brand_id} onChange={(e) => setNewProd({ ...newProd, brand_id: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="">Select Brand (Optional)</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input required type="number" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} placeholder="Price (৳)" className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <input required type="number" value={newProd.stock_qty} onChange={(e) => setNewProd({ ...newProd, stock_qty: e.target.value })} placeholder="Stock Qty" className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <input value={newProd.image} onChange={(e) => setNewProd({ ...newProd, image: e.target.value })} placeholder="Image URL" className="w-full rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <button type="submit" className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-bold text-white">Create Product</button>
            </form>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="flex items-center gap-2 font-bold"><Upload className="h-4 w-4 text-teal-600" /> Bulk Upload (JSON)</h3>
              <textarea
                rows={4}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder='[{"name":"Demo Tee","sku":"SDK-BULK-1","category_id":1,"price":990,"stock_qty":20}]'
                className="w-full rounded-xl border p-2.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
              />
              <button type="button" onClick={handleBulkUpload} className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white dark:bg-teal-600">
                Import Products
              </button>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0] || ''} alt="" className="h-12 w-12 rounded-lg object-cover bg-slate-100" />
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">SKU: {p.sku} • Stock: {p.stock_qty} • {formatBDT(p.price)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await apiRequest(`/admin/products/${p.id}`, { method: 'DELETE' });
                    showToast('Product deleted');
                    loadTab('products');
                  }}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATALOG */}
      {tab === 'catalog' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold">Categories</h3>
            <div className="flex gap-2">
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New Category Name" className="flex-1 rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <button
                type="button"
                onClick={async () => {
                  if (!newCatName.trim()) return;
                  await apiRequest('/admin/categories', { method: 'POST', body: JSON.stringify({ name: newCatName, is_featured: true }) });
                  setNewCatName('');
                  loadTab('catalog');
                }}
                className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white"
              >
                Add
              </button>
            </div>
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span>{c.name} ({c.products_count ?? 0})</span>
                <button type="button" onClick={async () => { await apiRequest(`/admin/categories/${c.id}`, { method: 'DELETE' }); loadTab('catalog'); }} className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold">Brands</h3>
            <div className="flex gap-2">
              <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="New Brand Name" className="flex-1 rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <button
                type="button"
                onClick={async () => {
                  if (!newBrandName.trim()) return;
                  await apiRequest('/admin/brands', { method: 'POST', body: JSON.stringify({ name: newBrandName }) });
                  setNewBrandName('');
                  loadTab('catalog');
                }}
                className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white"
              >
                Add
              </button>
            </div>
            {brands.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span>{b.name} ({b.products_count ?? 0})</span>
                <button type="button" onClick={async () => { await apiRequest(`/admin/brands/${b.id}`, { method: 'DELETE' }); loadTab('catalog'); }} className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="font-bold">{o.order_number} — {formatBDT(o.total)}</p>
                <p className="text-xs text-slate-500">{o.customer_name} • {o.customer_phone} • {o.payment_method.toUpperCase()} ({o.payment_status})</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={o.status}
                  onChange={(e) => handleUpdateOrder(o.id, e.target.value)}
                  className="rounded-xl border px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(o)}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold hover:bg-slate-100 dark:border-slate-700"
                >
                  <Printer className="h-3.5 w-3.5" /> Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COUPONS */}
      {tab === 'coupons' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold">Create Coupon</h3>
            <input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} placeholder="Code (e.g. EID20)" className="w-full rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-2">
              <select value={newCoupon.type} onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed (৳)</option>
              </select>
              <input type="number" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })} placeholder="Value" className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <button
              type="button"
              onClick={async () => {
                await apiRequest('/admin/coupons', { method: 'POST', body: JSON.stringify(newCoupon) });
                setNewCoupon({ ...newCoupon, code: '' });
                loadTab('coupons');
              }}
              className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-bold text-white"
            >
              Create Coupon
            </button>
          </div>

          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="font-bold">{c.code}</p>
                  <p className="text-xs text-slate-500">{c.type === 'percent' ? `${c.value}% off` : `${formatBDT(c.value)} off`} • Used: {c.used_count}</p>
                </div>
                <button type="button" onClick={async () => { await apiRequest(`/admin/coupons/${c.id}`, { method: 'DELETE' }); loadTab('coupons'); }} className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMERS */}
      {tab === 'customers' && (
        <div className="space-y-3">
          {customers.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="font-bold">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email} • {u.phone || 'No phone'}</p>
              </div>
              {user.role === 'admin' ? (
                <select
                  value={u.role}
                  onChange={async (e) => {
                    await apiRequest(`/admin/customers/${u.id}/role`, { method: 'PUT', body: JSON.stringify({ role: e.target.value }) });
                    showToast('Role updated');
                    loadTab('customers');
                  }}
                  className="rounded-xl border px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span className="text-xs font-bold uppercase">{u.role}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REVIEWS */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-sm font-bold">{r.product?.name} ({r.rating}★)</p>
                <p className="text-xs text-slate-500">{r.comment}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await apiRequest(`/admin/reviews/${r.id}/toggle`, { method: 'PATCH' });
                    loadTab('reviews');
                  }}
                  className="rounded-lg border px-3 py-1 text-xs font-bold dark:border-slate-700"
                >
                  {r.is_approved ? 'Approved' : 'Hidden'}
                </button>
                <button type="button" onClick={async () => { await apiRequest(`/admin/reviews/${r.id}`, { method: 'DELETE' }); loadTab('reviews'); }} className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SITE SETTINGS */}
      {tab === 'settings' && user.role === 'admin' && (
        <form onSubmit={handleSaveSettings} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          {[
            { key: 'brand_name', label: 'Brand Name' },
            { key: 'domain', label: 'Domain' },
            { key: 'tagline', label: 'Tagline' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'email', label: 'Support Email' },
            { key: 'whatsapp_number', label: 'WhatsApp Number (with country code)' },
            { key: 'address', label: 'Office Address' },
            { key: 'primary_color', label: 'Theme Primary Color (Hex)' },
            { key: 'logo_url', label: 'Logo URL (optional)' },
            { key: 'favicon_url', label: 'Favicon URL (optional)' },
            { key: 'delivery_charge_inside_dhaka', label: 'Delivery Charge Inside Dhaka (৳)' },
            { key: 'delivery_charge_outside_dhaka', label: 'Delivery Charge Outside Dhaka (৳)' },
            { key: 'seo_title', label: 'SEO Meta Title' },
            { key: 'seo_description', label: 'SEO Meta Description' },
          ].map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-bold text-slate-500">{field.label}</label>
              <input
                value={String(siteSettings[field.key] ?? '')}
                onChange={(e) => setSiteSettings({ ...siteSettings, [field.key]: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-600">
              Save All Site Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
