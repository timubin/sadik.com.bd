import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../lib/api';
import { t } from '../lib/i18n';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    cartCount,
    lang,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={() => setIsCartOpen(false)}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-bold">{t(lang, 'cart')} ({cartCount})</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <ShoppingBag className="mb-3 h-12 w-12 opacity-30" />
              <p className="font-medium">Your cart is empty</p>
              <Link
                to="/shop"
                onClick={() => setIsCartOpen(false)}
                className="mt-4 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
              >
                {t(lang, 'shopNow')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const unitPrice =
                  Number(item.product.price) + Number(item.variant?.price_adjustment ?? 0);
                const img =
                  item.product.images?.[0] ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';
                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id ?? 'base'}`}
                    className="flex gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <img
                      src={img}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="line-clamp-1 text-sm font-semibold hover:text-teal-600"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <span className="text-xs text-slate-500">
                          {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                        </span>
                      )}
                      <span className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-400">
                        {formatBDT(unitPrice)}
                      </span>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(item.product.id, item.variant?.id, item.quantity - 1)
                            }
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(item.product.id, item.variant?.id, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center justify-between text-base font-bold">
              <span>{t(lang, 'subtotal')}</span>
              <span>{formatBDT(cartSubtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Delivery & coupon discounts calculated at checkout.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl border border-slate-300 py-2.5 text-center text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl bg-teal-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-600"
              >
                {t(lang, 'checkout')}
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
