export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'staff' | 'admin';
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  is_active: boolean;
  products_count?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size?: string | null;
  color?: string | null;
  color_hex?: string | null;
  sku?: string | null;
  price_adjustment: number;
  stock_qty: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string | null;
  comment: string;
  is_approved: boolean;
  created_at: string;
  user?: { id: number; name: string };
  product?: { id: number; name: string; slug: string };
}

export interface Product {
  id: number;
  category_id: number;
  brand_id?: number | null;
  name: string;
  slug: string;
  sku: string;
  short_description?: string | null;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  stock_qty: number;
  images: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_flash_sale: boolean;
  flash_sale_ends_at?: string | null;
  rating_avg: number;
  rating_count: number;
  meta_title?: string | null;
  meta_description?: string | null;
  is_active: boolean;
  category?: { id: number; name: string; slug: string };
  brand?: { id: number; name: string; slug: string };
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id?: number | null;
  variant_id?: number | null;
  product_name: string;
  variant_label?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  shipping_address: string;
  city: string;
  shipping_zone: 'inside_dhaka' | 'outside_dhaka';
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  total: number;
  coupon_code?: string | null;
  payment_method: 'cod' | 'bkash' | 'nagad';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_reference?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  zone: 'inside_dhaka' | 'outside_dhaka';
  is_default: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_amount: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  badge?: string;
  image: string;
}

export interface SiteSettings {
  brand_name?: string;
  domain?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  font_family?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp_number?: string;
  delivery_charge_inside_dhaka?: string | number;
  delivery_charge_outside_dhaka?: string | number;
  seo_title?: string;
  seo_description?: string;
  google_map_embed_url?: string;
  hero_slides?: HeroSlide[];
  header_menu?: { label: string; path: string }[];
  social_links?: { facebook?: string; instagram?: string; youtube?: string };
  [key: string]: unknown;
}
