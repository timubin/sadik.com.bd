import React, { useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { apiRequest, formatBDT } from '../lib/api';
import type { Order } from '../types';

export const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    try {
      const res = await apiRequest<{ order: Order }>('/orders/track', {
        method: 'POST',
        body: JSON.stringify({ order_number: orderNumber, phone }),
      });
      setOrder(res.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <PackageSearch className="h-7 w-7 text-teal-600" />
          <h1 className="text-2xl font-extrabold">Track Your Order</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Enter your Sadik order number and phone number to view real-time status.
        </p>

        <form onSubmit={handleTrack} className="mt-6 space-y-4">
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order Number (e.g. SDK-20261124-1001)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number (e.g. 01800-123456)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-600"
          >
            Track Order
          </button>
        </form>

        {error && <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p>}

        {order && (
          <div className="mt-8 space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold">{order.order_number}</span>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase text-teal-800">
                {order.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Total: <strong className="text-slate-900 dark:text-white">{formatBDT(order.total)}</strong> • Payment:{' '}
              {order.payment_method.toUpperCase()} ({order.payment_status})
            </p>
            <div className="space-y-1 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatBDT(item.total_price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
