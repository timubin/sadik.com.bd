import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../lib/api';

export const CartPage: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, cartSubtotal } = useStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-lg font-semibold text-slate-500">Your cart is empty.</p>
          <Link
            to="/shop"
            className="mt-4 inline-block rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => {
              const unit = Number(item.product.price) + Number(item.variant?.price_adjustment ?? 0);
              return (
                <div
                  key={`${item.product.id}-${item.variant?.id ?? 'base'}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <img
                    src={item.product.images?.[0] || ''}
                    alt={item.product.name}
                    className="h-20 w-20 rounded-xl object-cover bg-slate-100"
                  />
                  <div className="flex-1">
                    <Link to={`/product/${item.product.slug}`} className="font-bold hover:text-teal-600">
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-slate-500">
                        {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-teal-700">{formatBDT(unit)}</p>
                  </div>
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.product.id, item.variant?.id, item.quantity - 1)}
                      className="p-2"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.product.id, item.variant?.id, item.quantity + 1)}
                      className="p-2"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold">{formatBDT(cartSubtotal)}</span>
            </div>
            <p className="text-xs text-slate-500">
              Delivery charge (Inside/Outside Dhaka) & coupons are applied at checkout.
            </p>
            <Link
              to="/checkout"
              className="block w-full rounded-xl bg-teal-700 py-3 text-center text-sm font-bold text-white hover:bg-teal-600"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
