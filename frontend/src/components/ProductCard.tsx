import React from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../lib/api';
import { t } from '../lib/i18n';
import type { Product } from '../types';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, wishlistIds, toggleWishlist, lang } = useStore();
  const isWishlisted = wishlistIds.includes(product.id);
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
  const discountPct =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discountPct > 0 && (
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
              -{discountPct}%
            </span>
          )}
          {product.is_flash_sale && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-slate-950 shadow">
              Flash
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:text-rose-600 dark:bg-slate-900/90 dark:text-slate-200"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            {product.category.name}
          </span>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {Number(product.rating_avg || 0).toFixed(1)}
          </span>
          <span className="text-slate-400">({product.rating_count})</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {formatBDT(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatBDT(product.compare_at_price)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={product.stock_qty <= 0}
            onClick={() => addToCart(product, product.variants?.[0] ?? null, 1)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            <ShoppingBag className="h-4 w-4" />
            {product.stock_qty > 0 ? t(lang, 'addToCart') : t(lang, 'outOfStock')}
          </button>
        </div>
      </div>
    </div>
  );
};
