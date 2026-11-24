import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useStore } from '../context/StoreContext';
import { apiRequest } from '../lib/api';
import { t } from '../lib/i18n';
import type { Brand, Category, Product } from '../types';

interface PaginatedProducts {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
}

export const ShopPage: React.FC = () => {
  const { lang } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<PaginatedProducts>({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const flashSale = searchParams.get('flash_sale') || '';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    apiRequest<{ categories: Category[] }>('/categories').then((r) => setCategories(r.categories)).catch(() => {});
    apiRequest<{ brands: Brand[] }>('/brands').then((r) => setBrands(r.brands)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (brand) qs.set('brand', brand);
    if (minPrice) qs.set('min_price', minPrice);
    if (maxPrice) qs.set('max_price', maxPrice);
    if (rating) qs.set('rating', rating);
    if (sort) qs.set('sort', sort);
    if (search) qs.set('search', search);
    if (flashSale) qs.set('flash_sale', flashSale);
    qs.set('page', page);

    apiRequest<PaginatedProducts>(`/products?${qs.toString()}`)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, brand, minPrice, maxPrice, rating, sort, search, flashSale, page]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, 'allProducts')}</h1>
          <p className="text-sm text-slate-500">Showing {products.total} curated products</p>
        </div>
        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="best_seller">Best Sellers</option>
        </select>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filter Sidebar */}
        <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 h-fit dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="h-4 w-4 text-teal-600" />
              {t(lang, 'filters')}
            </span>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              {t(lang, 'clearFilters')}
            </button>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Category</h3>
            <select
              value={category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Brand</h3>
            <select
              value={brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Price Range (৳)</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilter('min_price', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilter('max_price', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Minimum Rating</h3>
            <select
              value={rating}
              onChange={(e) => updateFilter('rating', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Any Rating</option>
              <option value="4">4★ & above</option>
              <option value="4.5">4.5★ & above</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <p className="text-lg font-bold">No products matched your filters</p>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="mt-4 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {products.last_page > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: products.last_page }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams(searchParams);
                          next.set('page', String(pNum));
                          setSearchParams(next);
                        }}
                        className={`h-9 w-9 rounded-lg text-sm font-bold ${
                          products.current_page === pNum
                            ? 'bg-teal-700 text-white'
                            : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
