import React, { useState } from 'react';
import { CheckCircle2, Printer, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { apiRequest, formatBDT } from '../lib/api';
import type { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const { cart, cartSubtotal, clearCart, settings, user, showToast } = useStore();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [shippingZone, setShippingZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const deliveryInside = Number(settings.delivery_charge_inside_dhaka ?? 70);
  const deliveryOutside = Number(settings.delivery_charge_outside_dhaka ?? 130);
  const deliveryCharge = shippingZone === 'inside_dhaka' ? deliveryInside : deliveryOutside;
  const total = Math.max(0, cartSubtotal - discount + deliveryCharge);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const res = await apiRequest<{ coupon: { code: string }; discount: number }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponInput.trim(), subtotal: cartSubtotal }),
      });
      setAppliedCoupon(res.coupon.code);
      setDiscount(res.discount);
      showToast(`Coupon ${res.coupon.code} applied (-${formatBDT(res.discount)})`);
    } catch (err) {
      setAppliedCoupon(null);
      setDiscount(0);
      showToast(err instanceof Error ? err.message : 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const endpoint = user ? '/customer/checkout' : '/checkout';
      const res = await apiRequest<{ order: Order }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail || null,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          city,
          shipping_zone: shippingZone,
          payment_method: paymentMethod,
          payment_reference: paymentReference || null,
          coupon_code: appliedCoupon,
          notes,
          items: cart.map((item) => ({
            product_id: item.product.id,
            variant_id: item.variant?.id ?? null,
            quantity: item.quantity,
          })),
        }),
      });
      setPlacedOrder(res.order);
      clearCart();
      showToast('Order placed successfully!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-extrabold">Order Confirmed!</h1>
                <p className="text-sm text-slate-500">Order #{placedOrder.order_number}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </button>
          </div>

          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Customer</p>
              <p className="font-semibold">{placedOrder.customer_name}</p>
              <p>{placedOrder.customer_phone}</p>
              <p className="text-slate-500">{placedOrder.shipping_address}, {placedOrder.city}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Payment</p>
              <p className="font-semibold uppercase">{placedOrder.payment_method}</p>
              <p className="capitalize">Status: {placedOrder.payment_status}</p>
              {placedOrder.payment_reference && (
                <p className="text-xs text-slate-500">Ref: {placedOrder.payment_reference}</p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
            {placedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span className="font-semibold">{formatBDT(item.total_price)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-slate-500">
              <span>Delivery Charge</span>
              <span>{formatBDT(placedOrder.delivery_charge)}</span>
            </div>
            {placedOrder.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatBDT(placedOrder.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold dark:border-slate-800">
              <span>Total</span>
              <span>{formatBDT(placedOrder.total)}</span>
            </div>
          </div>

          <div className="no-print mt-8 flex gap-3">
            <Link
              to="/shop"
              className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white"
            >
              Continue Shopping
            </Link>
            <Link
              to="/track-order"
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold dark:border-slate-700"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold">Checkout {user ? '' : '(Guest Checkout)'}</h1>

      <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping Info */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">Shipping Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name *"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number (e.g. 01617-723455) *"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email (optional)"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City *"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Full Street Address, House, Road, Area *"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-sm font-semibold ${
                  shippingZone === 'inside_dhaka'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="zone"
                    checked={shippingZone === 'inside_dhaka'}
                    onChange={() => setShippingZone('inside_dhaka')}
                  />
                  Inside Dhaka
                </span>
                <span>{formatBDT(deliveryInside)}</span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-sm font-semibold ${
                  shippingZone === 'outside_dhaka'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="zone"
                    checked={shippingZone === 'outside_dhaka'}
                    onChange={() => setShippingZone('outside_dhaka')}
                  />
                  Outside Dhaka
                </span>
                <span>{formatBDT(deliveryOutside)}</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered' },
                { id: 'bkash', label: 'bKash', desc: 'Instant mobile pay (Mock)' },
                { id: 'nagad', label: 'Nagad', desc: 'Instant mobile pay (Mock)' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`cursor-pointer rounded-xl border p-3.5 ${
                    paymentMethod === m.id
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id as 'cod' | 'bkash' | 'nagad')}
                    />
                    {m.label}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{m.desc}</p>
                </label>
              ))}
            </div>

            {paymentMethod !== 'cod' && (
              <input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Optional Transaction ID (leave blank for auto mock verification)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            )}

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Order notes (optional)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.variant?.id ?? 'base'}`}
                className="flex justify-between"
              >
                <span className="line-clamp-1">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatBDT(
                    (Number(item.product.price) + Number(item.variant?.price_adjustment ?? 0)) *
                      item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon (e.g. SADIK10)"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white dark:bg-slate-700"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatBDT(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Charge</span>
              <span>{formatBDT(deliveryCharge)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({appliedCoupon})</span>
                <span>-{formatBDT(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold dark:border-slate-800">
              <span>Total</span>
              <span>{formatBDT(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || cart.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-teal-600 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting ? 'Placing Order...' : `Confirm Order (${formatBDT(total)})`}
          </button>
        </div>
      </form>
    </div>
  );
};
