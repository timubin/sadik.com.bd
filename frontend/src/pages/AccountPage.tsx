import React, { useEffect, useState } from 'react';
import { Heart, LogOut, MapPin, Package, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { apiRequest, formatBDT } from '../lib/api';
import type { Address, Order, Product } from '../types';

export const AccountPage: React.FC = () => {
  const { user, logout, showToast } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [zone, setZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    apiRequest<{ data: Order[] }>('/customer/orders').then((r) => setOrders(r.data)).catch(() => {});
    apiRequest<{ wishlist: Product[] }>('/customer/wishlist').then((r) => setWishlist(r.wishlist)).catch(() => {});
    apiRequest<{ addresses: Address[] }>('/customer/addresses').then((r) => setAddresses(r.addresses)).catch(() => {});
  }, [user, navigate]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ address: Address }>('/customer/addresses', {
        method: 'POST',
        body: JSON.stringify({
          label,
          full_name: fullName,
          phone,
          address_line: addressLine,
          city,
          zone,
          is_default: addresses.length === 0,
        }),
      });
      setAddresses((prev) => [res.address, ...prev]);
      setAddressLine('');
      showToast('Address saved!');
    } catch {
      showToast('Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    await apiRequest(`/customer/addresses/${id}`, { method: 'DELETE' });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('Address removed.');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email} • {user.role.toUpperCase()}</p>
        </div>
        <div className="flex gap-3">
          {(user.role === 'admin' || user.role === 'staff') && (
            <Link
              to="/admin"
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
            >
              Open Admin Panel
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {[
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'addresses', label: 'Address Book', icon: MapPin },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as 'orders' | 'wishlist' | 'addresses')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
              tab === item.id
                ? 'bg-slate-900 text-white dark:bg-teal-600'
                : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-slate-500">You have not placed any orders yet.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">{order.order_number}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()} • {order.payment_method.toUpperCase()} ({order.payment_status})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold capitalize text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      {order.status}
                    </span>
                    <p className="mt-1 font-extrabold">{formatBDT(order.total)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.length === 0 ? (
            <p className="text-slate-500">Your wishlist is empty.</p>
          ) : (
            wishlist.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      )}

      {tab === 'addresses' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold dark:bg-slate-800">
                    {addr.label}
                  </span>
                  <p className="mt-2 font-bold">{addr.full_name}</p>
                  <p className="text-sm text-slate-500">{addr.phone}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {addr.address_line}, {addr.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAddAddress}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-lg font-bold">Add New Address</h3>
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (Home / Office)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Recipient Name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <input
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Street Address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as 'inside_dhaka' | 'outside_dhaka')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="inside_dhaka">Inside Dhaka</option>
                <option value="outside_dhaka">Outside Dhaka</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-bold text-white"
            >
              Save Address
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
