import React, { useEffect, useState } from 'react';
import { CheckCircle2, Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { apiRequest, formatBDT } from '../lib/api';
import type { Product, ProductVariant } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, toggleWishlist, wishlistIds, user, showToast } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadProduct = () => {
    if (!slug) return;
    apiRequest<{ product: Product; related: Product[] }>(`/products/${slug}`)
      .then((res) => {
        setProduct(res.product);
        setRelated(res.related);
        setSelectedVariant(res.product.variants?.[0] ?? null);
        setSelectedImage(0);
      })
      .catch(() => setProduct(null));
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">
        Loading product details...
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'];
  const activePrice = Number(product.price) + Number(selectedVariant?.price_adjustment ?? 0);
  const availableStock = selectedVariant ? selectedVariant.stock_qty : product.stock_qty;
  const isWishlisted = wishlistIds.includes(product.id);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to write a review.');
      return;
    }
    try {
      await apiRequest(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      setReviewComment('');
      showToast('Review submitted!');
      loadProduct();
    } catch {
      showToast('Failed to submit review.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery with Zoom */}
        <div className="space-y-4">
          <div
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <img
              src={images[selectedImage] || images[0]}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-500 ${
                zoomed ? 'scale-125 cursor-zoom-in' : 'scale-100'
              }`}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    selectedImage === i ? 'border-teal-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Actions */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              {product.category?.name} {product.brand ? `• ${product.brand.name}` : ''}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                <Star className="h-4 w-4 fill-amber-400" />
                {Number(product.rating_avg || 0).toFixed(1)}
              </span>
              <span className="text-slate-500">({product.rating_count} reviews)</span>
              <span className="text-slate-400">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-teal-700 dark:text-teal-400">
              {formatBDT(activePrice)}
            </span>
            {product.compare_at_price && product.compare_at_price > activePrice && (
              <span className="text-lg text-slate-400 line-through">
                {formatBDT(product.compare_at_price)}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {product.description || product.short_description}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Variant
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                      selectedVariant?.id === v.id
                        ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {v.color_hex && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: v.color_hex }}
                      />
                    )}
                    <span>{[v.size, v.color].filter(Boolean).join(' - ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className={`h-4 w-4 ${availableStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`} />
            <span>
              {availableStock > 0 ? `In Stock (${availableStock} available)` : 'Out of Stock'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 text-sm font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(availableStock || 1, q + 1))}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={availableStock <= 0}
              onClick={() => addToCart(product, selectedVariant, qty)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-teal-600 disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="rounded-xl border border-slate-300 p-3.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="grid gap-8 border-t border-slate-200 pt-10 lg:grid-cols-2 dark:border-slate-800">
        <div>
          <h2 className="mb-4 text-xl font-extrabold">Customer Reviews ({product.reviews?.length || 0})</h2>
          <div className="space-y-4">
            {(product.reviews || []).map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{rev.user?.name || 'Customer'}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleReviewSubmit}
          className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-lg font-bold">Write a Review</h3>
          <select
            value={reviewRating}
            onChange={(e) => setReviewRating(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value={5}>5 Stars — Excellent</option>
            <option value={4}>4 Stars — Very Good</option>
            <option value={3}>3 Stars — Good</option>
            <option value={2}>2 Stars — Fair</option>
            <option value={1}>1 Star — Poor</option>
          </select>
          <textarea
            required
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 dark:bg-teal-600"
          >
            Submit Review
          </button>
        </form>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 pt-10 dark:border-slate-800">
          <h2 className="mb-6 text-2xl font-extrabold">Related Products</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
