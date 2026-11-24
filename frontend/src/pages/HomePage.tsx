import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Quote, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useStore } from '../context/StoreContext';
import { apiRequest } from '../lib/api';
import { t } from '../lib/i18n';
import type { Category, Product, Review, SiteSettings } from '../types';

interface HomeResponse {
  featured_categories: Category[];
  new_arrivals: Product[];
  best_sellers: Product[];
  flash_sales: Product[];
  testimonials: Review[];
  settings: SiteSettings;
}

export const HomePage: React.FC = () => {
  const { settings, lang, showToast } = useStore();
  const [data, setData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });

  useEffect(() => {
    apiRequest<HomeResponse>('/home')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const slides = settings.hero_slides?.length
    ? settings.hero_slides
    : [
        {
          title: 'Curated Lifestyle. Delivered Across Bangladesh.',
          subtitle: 'Discover premium electronics, modern apparel, and home essentials at sadik.com.bd.',
          cta_text: 'Shop Collection',
          cta_link: '/shop',
          badge: 'Sadik Exclusive',
          image:
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
        },
      ];

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      const res = await apiRequest<{ message: string }>('/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email: newsletterEmail }),
      });
      showToast(res.message);
      setNewsletterEmail('');
    } catch {
      showToast('Please enter a valid email address.');
    }
  };

  const activeSlide = slides[slideIdx] || slides[0];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Slider */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="z-10 animate-fade-up space-y-5">
            {activeSlide.badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-300 ring-1 ring-teal-400/30">
                <Sparkles className="h-3.5 w-3.5" />
                {activeSlide.badge}
              </span>
            )}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {activeSlide.title}
            </h1>
            <p className="max-w-lg text-sm text-slate-300 sm:text-base">{activeSlide.subtitle}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={activeSlide.cta_link || '/shop'}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-teal-500"
              >
                {activeSlide.cta_text || t(lang, 'shopNow')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/track-order"
                className="inline-flex items-center rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                {t(lang, 'trackOrder')}
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="h-full w-full object-cover transition-all duration-700"
            />
            {slides.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSlideIdx((slideIdx - 1 + slides.length) % slides.length)}
                  className="rounded-full bg-slate-950/70 p-2 text-white backdrop-blur hover:bg-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIdx((slideIdx + 1) % slides.length)}
                  className="rounded-full bg-slate-950/70 p-2 text-white backdrop-blur hover:bg-slate-900"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">{t(lang, 'featuredCategories')}</h2>
          <Link to="/shop" className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(data?.featured_categories || []).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 text-center transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={cat.image || ''}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm font-bold">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Flame className="h-7 w-7" />
            <div>
              <h2 className="text-xl font-extrabold">{t(lang, 'flashSale')}</h2>
              <p className="text-xs text-rose-100">Limited-time deals ending soon</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="rounded-lg bg-slate-950/30 px-2.5 py-1.5">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span>:</span>
            <span className="rounded-lg bg-slate-950/30 px-2.5 py-1.5">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span>:</span>
            <span className="rounded-lg bg-slate-950/30 px-2.5 py-1.5">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : (data?.flash_sales || []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">{t(lang, 'newArrivals')}</h2>
          <Link to="/shop?sort=newest" className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400">
            Explore New →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : (data?.new_arrivals || []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">{t(lang, 'bestSellers')}</h2>
          <Link to="/shop?sort=best_seller" className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400">
            Shop Top Rated →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : (data?.best_sellers || []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Testimonials */}
      {(data?.testimonials?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-2xl font-extrabold tracking-tight">
            Loved by Customers Across Bangladesh
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {data!.testimonials.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <Quote className="h-6 w-6 text-teal-600 opacity-50" />
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  "{rev.comment}"
                </p>
                <p className="mt-4 text-xs font-bold text-slate-900 dark:text-white">
                  {rev.user?.name || 'Verified Buyer'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center text-white shadow-xl dark:bg-slate-900">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t(lang, 'newsletterTitle')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">{t(lang, 'newsletterDesc')}</p>
          <form onSubmit={handleNewsletter} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-500"
            >
              {t(lang, 'subscribe')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
