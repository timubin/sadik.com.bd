<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        $admin = User::updateOrCreate(
            ['email' => 'admin@sadik.com.bd'],
            [
                'name' => 'Sadik Admin',
                'phone' => '01617-723455',
                'role' => 'admin',
                'is_active' => true,
                'password' => Hash::make('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'staff@sadik.com.bd'],
            [
                'name' => 'Sadik Staff',
                'phone' => '01700-000001',
                'role' => 'staff',
                'is_active' => true,
                'password' => Hash::make('password'),
            ]
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@sadik.com.bd'],
            [
                'name' => 'Ayesha Rahman',
                'phone' => '01800-123456',
                'role' => 'customer',
                'is_active' => true,
                'password' => Hash::make('password'),
            ]
        );

        // Site Settings
        $settings = [
            'brand_name' => 'Sadik',
            'domain' => 'sadik.com.bd',
            'tagline' => 'Elevated Lifestyle & Everyday Essentials in Bangladesh',
            'logo_url' => '',
            'favicon_url' => '',
            'primary_color' => '#0f766e',
            'font_family' => 'Plus Jakarta Sans',
            'address' => '58, Satmasjid Road, Level 7, Green City Center, Dhanmondi, Dhaka, Bangladesh',
            'phone' => '01617-723455',
            'email' => 'support@sadik.com.bd',
            'whatsapp_number' => '8801617723455',
            'delivery_charge_inside_dhaka' => '70',
            'delivery_charge_outside_dhaka' => '130',
            'seo_title' => 'Sadik — Premium Online Shopping in Bangladesh | sadik.com.bd',
            'seo_description' => 'Shop curated electronics, fashion, home living, and lifestyle products at sadik.com.bd with fast delivery across Bangladesh.',
            'google_map_embed_url' => 'https://www.google.com/maps?q=58+Satmasjid+Road+Dhanmondi+Dhaka+Bangladesh&output=embed',
            'hero_slides' => json_encode([
                [
                    'title' => 'Curated Lifestyle. Delivered Across Bangladesh.',
                    'subtitle' => 'Discover premium electronics, modern apparel, and home essentials backed by Sadik quality.',
                    'cta_text' => 'Shop Collection',
                    'cta_link' => '/shop',
                    'badge' => 'New Season 2026',
                    'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
                ],
                [
                    'title' => 'Flash Sale — Up to 35% Off Signature Tech',
                    'subtitle' => 'Limited-time deals on wireless audio, smartwatches, and everyday carry.',
                    'cta_text' => 'Explore Deals',
                    'cta_link' => '/shop?flash_sale=1',
                    'badge' => 'Flash Sale Live',
                    'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
                ],
                [
                    'title' => 'Minimalist Home & Living Collection',
                    'subtitle' => 'Elevate your space with handcrafted decor and warm lighting.',
                    'cta_text' => 'View Home Living',
                    'cta_link' => '/shop?category=home-living',
                    'badge' => 'Editor Pick',
                    'image' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80',
                ],
            ]),
            'header_menu' => json_encode([
                ['label' => 'Home', 'path' => '/'],
                ['label' => 'Shop', 'path' => '/shop'],
                ['label' => 'Track Order', 'path' => '/track-order'],
                ['label' => 'About', 'path' => '/about'],
                ['label' => 'Contact', 'path' => '/contact'],
            ]),
            'social_links' => json_encode([
                'facebook' => 'https://facebook.com/sadik.com.bd',
                'instagram' => 'https://instagram.com/sadik.com.bd',
                'youtube' => 'https://youtube.com/@sadik',
            ]),
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => 'general']);
        }

        // Categories
        $categoriesData = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'is_featured' => true, 'sort_order' => 1, 'image' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80'],
            ['name' => 'Fashion & Apparel', 'slug' => 'fashion-apparel', 'is_featured' => true, 'sort_order' => 2, 'image' => 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80'],
            ['name' => 'Home & Living', 'slug' => 'home-living', 'is_featured' => true, 'sort_order' => 3, 'image' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'],
            ['name' => 'Watches & Accessories', 'slug' => 'watches-accessories', 'is_featured' => true, 'sort_order' => 4, 'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
            ['name' => 'Beauty & Care', 'slug' => 'beauty-care', 'is_featured' => true, 'sort_order' => 5, 'image' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'],
            ['name' => 'Sports & Fitness', 'slug' => 'sports-fitness', 'is_featured' => true, 'sort_order' => 6, 'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['slug']] = Category::updateOrCreate(['slug' => $c['slug']], $c);
        }

        // Brands
        $brandsData = [
            ['name' => 'Sadik Signature', 'slug' => 'sadik-signature'],
            ['name' => 'Apex Tech', 'slug' => 'apex-tech'],
            ['name' => 'Aura Wear', 'slug' => 'aura-wear'],
            ['name' => 'ZenHome', 'slug' => 'zenhome'],
        ];

        $brands = [];
        foreach ($brandsData as $b) {
            $brands[$b['slug']] = Brand::updateOrCreate(['slug' => $b['slug']], $b);
        }

        // Products
        $productsData = [
            [
                'category_id' => $categories['electronics']->id,
                'brand_id' => $brands['apex-tech']->id,
                'name' => 'Apex Studio Wireless ANC Headphones',
                'slug' => 'apex-studio-wireless-anc-headphones',
                'sku' => 'SDK-EL-101',
                'short_description' => 'Active noise cancellation with 40-hour battery life and studio-grade acoustic drivers.',
                'description' => 'Engineered for immersive listening, the Apex Studio ANC Headphones deliver crisp highs, deep balanced bass, and all-day comfort with memory-foam ear cushions.',
                'price' => 4850,
                'compare_at_price' => 6200,
                'stock_qty' => 28,
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80',
                ],
                'is_featured' => true,
                'is_best_seller' => true,
                'is_flash_sale' => true,
                'flash_sale_ends_at' => now()->addDays(3),
                'rating_avg' => 4.9,
                'rating_count' => 18,
                'variants' => [
                    ['size' => 'Standard', 'color' => 'Matte Black', 'color_hex' => '#18181b', 'price_adjustment' => 0, 'stock_qty' => 15],
                    ['size' => 'Standard', 'color' => 'Silver Mist', 'color_hex' => '#d4d4d8', 'price_adjustment' => 150, 'stock_qty' => 13],
                ],
            ],
            [
                'category_id' => $categories['watches-accessories']->id,
                'brand_id' => $brands['sadik-signature']->id,
                'name' => 'Sadik Chronograph Minimalist Watch',
                'slug' => 'sadik-chronograph-minimalist-watch',
                'sku' => 'SDK-WT-201',
                'short_description' => 'Sapphire crystal glass, Japanese quartz movement, and genuine Italian leather strap.',
                'description' => 'A timeless dress-casual timepiece crafted with a brushed stainless steel case and water resistance up to 50 meters.',
                'price' => 3600,
                'compare_at_price' => 4500,
                'stock_qty' => 22,
                'images' => [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
                ],
                'is_featured' => true,
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'rating_avg' => 4.8,
                'rating_count' => 14,
                'variants' => [
                    ['size' => '40mm', 'color' => 'Midnight Black', 'color_hex' => '#111827', 'price_adjustment' => 0, 'stock_qty' => 12],
                    ['size' => '40mm', 'color' => 'Cognac Brown', 'color_hex' => '#92400e', 'price_adjustment' => 0, 'stock_qty' => 10],
                ],
            ],
            [
                'category_id' => $categories['fashion-apparel']->id,
                'brand_id' => $brands['aura-wear']->id,
                'name' => 'Aura Premium Cotton Oxford Shirt',
                'slug' => 'aura-premium-cotton-oxford-shirt',
                'sku' => 'SDK-FA-301',
                'short_description' => '100% breathable combed cotton tailored for Dhaka weather and smart-casual wear.',
                'description' => 'Cut in a modern tailored fit with reinforced mother-of-pearl buttons and pre-washed softness.',
                'price' => 1650,
                'compare_at_price' => 2100,
                'stock_qty' => 45,
                'images' => [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
                ],
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'rating_avg' => 4.7,
                'rating_count' => 24,
                'variants' => [
                    ['size' => 'M', 'color' => 'Sky Blue', 'color_hex' => '#38bdf8', 'price_adjustment' => 0, 'stock_qty' => 15],
                    ['size' => 'L', 'color' => 'Sky Blue', 'color_hex' => '#38bdf8', 'price_adjustment' => 0, 'stock_qty' => 15],
                    ['size' => 'XL', 'color' => 'Crisp White', 'color_hex' => '#f8fafc', 'price_adjustment' => 0, 'stock_qty' => 15],
                ],
            ],
            [
                'category_id' => $categories['home-living']->id,
                'brand_id' => $brands['zenhome']->id,
                'name' => 'ZenHome Nordic Ceramic Table Lamp',
                'slug' => 'zenhome-nordic-ceramic-table-lamp',
                'sku' => 'SDK-HL-401',
                'short_description' => 'Warm ambient linen shade with matte stoneware ceramic base.',
                'description' => 'Adds calm architectural warmth to bedrooms, study desks, and living rooms. Includes warm LED bulb.',
                'price' => 2450,
                'compare_at_price' => 2950,
                'stock_qty' => 16,
                'images' => [
                    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
                ],
                'is_new_arrival' => true,
                'is_flash_sale' => true,
                'flash_sale_ends_at' => now()->addDays(3),
                'rating_avg' => 4.9,
                'rating_count' => 9,
                'variants' => [],
            ],
            [
                'category_id' => $categories['electronics']->id,
                'brand_id' => $brands['apex-tech']->id,
                'name' => 'Apex Mechanical Keychron-Style Keyboard',
                'slug' => 'apex-mechanical-keyboard',
                'sku' => 'SDK-EL-102',
                'short_description' => 'Hot-swappable tactile switches with dual-mode Bluetooth & USB-C.',
                'description' => 'Compact 75% aluminum frame wireless mechanical keyboard built for developers and creators.',
                'price' => 5400,
                'compare_at_price' => 6500,
                'stock_qty' => 18,
                'images' => [
                    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
                ],
                'is_featured' => true,
                'is_new_arrival' => true,
                'rating_avg' => 4.8,
                'rating_count' => 11,
                'variants' => [],
            ],
            [
                'category_id' => $categories['fashion-apparel']->id,
                'brand_id' => $brands['sadik-signature']->id,
                'name' => 'Sadik Heritage Leather Backpack',
                'slug' => 'sadik-heritage-leather-backpack',
                'sku' => 'SDK-FA-302',
                'short_description' => 'Fits 16-inch laptops with water-resistant lining and full-grain leather trim.',
                'description' => 'Designed for daily Dhaka commutes and weekend travel with padded shoulder straps and hidden passport pocket.',
                'price' => 4200,
                'compare_at_price' => 5200,
                'stock_qty' => 14,
                'images' => [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
                ],
                'is_best_seller' => true,
                'is_flash_sale' => true,
                'flash_sale_ends_at' => now()->addDays(3),
                'rating_avg' => 4.9,
                'rating_count' => 19,
                'variants' => [],
            ],
            [
                'category_id' => $categories['beauty-care']->id,
                'brand_id' => $brands['sadik-signature']->id,
                'name' => 'Botanical Vitamin C Glow Serum 30ml',
                'slug' => 'botanical-vitamin-c-glow-serum',
                'sku' => 'SDK-BC-501',
                'short_description' => 'Lightweight brightening serum with hyaluronic acid and niacinamide.',
                'description' => 'Dermatologist-tested daily facial serum for radiant, hydrated skin.',
                'price' => 1150,
                'compare_at_price' => 1450,
                'stock_qty' => 40,
                'images' => [
                    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
                ],
                'is_new_arrival' => true,
                'rating_avg' => 4.6,
                'rating_count' => 15,
                'variants' => [],
            ],
            [
                'category_id' => $categories['sports-fitness']->id,
                'brand_id' => $brands['apex-tech']->id,
                'name' => 'ProFit Smart Fitness Band & Tracker',
                'slug' => 'profit-smart-fitness-band',
                'sku' => 'SDK-SF-601',
                'short_description' => 'AMOLED display, SpO2 & heart rate monitor, 14-day battery life.',
                'description' => 'Track workouts, sleep quality, and notifications effortlessly with 5ATM water resistance.',
                'price' => 2650,
                'compare_at_price' => 3300,
                'stock_qty' => 30,
                'images' => [
                    'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=900&q=80',
                ],
                'is_best_seller' => true,
                'is_flash_sale' => true,
                'flash_sale_ends_at' => now()->addDays(3),
                'rating_avg' => 4.7,
                'rating_count' => 21,
                'variants' => [],
            ],
        ];

        $createdProducts = [];
        foreach ($productsData as $p) {
            $variants = $p['variants'];
            unset($p['variants']);
            $product = Product::updateOrCreate(['slug' => $p['slug']], $p);
            if ($product->variants()->count() === 0) {
                foreach ($variants as $v) {
                    ProductVariant::create(['product_id' => $product->id, ...$v]);
                }
            }
            $createdProducts[] = $product;
        }

        // Coupons
        Coupon::updateOrCreate(
            ['code' => 'SADIK10'],
            [
                'type' => 'percent',
                'value' => 10,
                'min_order_amount' => 1000,
                'max_discount' => 1000,
                'is_active' => true,
            ]
        );
        Coupon::updateOrCreate(
            ['code' => 'WELCOME200'],
            [
                'type' => 'fixed',
                'value' => 200,
                'min_order_amount' => 1500,
                'is_active' => true,
            ]
        );

        // Sample Reviews
        if (Review::count() === 0 && count($createdProducts) > 0) {
            Review::create([
                'product_id' => $createdProducts[0]->id,
                'user_id' => $customer->id,
                'rating' => 5,
                'title' => 'Outstanding sound & fast Dhanmondi delivery',
                'comment' => 'Received within 24 hours in Dhaka. Build quality feels truly premium!',
                'is_approved' => true,
            ]);
            Review::create([
                'product_id' => $createdProducts[1]->id,
                'user_id' => $admin->id,
                'rating' => 5,
                'title' => 'Sleek everyday watch',
                'comment' => 'Minimalist dial looks great with both formal and casual outfits.',
                'is_approved' => true,
            ]);
        }

        // Sample Order
        if (Order::count() === 0 && count($createdProducts) > 0) {
            $order = Order::create([
                'order_number' => 'SDK-' . date('Ymd') . '-1001',
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone,
                'shipping_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
                'city' => 'Dhaka',
                'shipping_zone' => 'inside_dhaka',
                'subtotal' => 4850,
                'discount_amount' => 0,
                'delivery_charge' => 70,
                'total' => 4920,
                'payment_method' => 'bkash',
                'payment_status' => 'paid',
                'payment_reference' => 'BKASH-MOCK-DEMO01',
                'status' => 'delivered',
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $createdProducts[0]->id,
                'product_name' => $createdProducts[0]->name,
                'unit_price' => 4850,
                'quantity' => 1,
                'total_price' => 4850,
            ]);
        }
    }
}
