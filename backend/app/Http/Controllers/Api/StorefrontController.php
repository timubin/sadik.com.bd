<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\Newsletter;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\SiteSetting;
use App\Services\Payment\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StorefrontController extends Controller
{
    public function settings(): JsonResponse
    {
        return response()->json([
            'settings' => SiteSetting::getAllKeyed(),
        ]);
    }

    public function home(): JsonResponse
    {
        $featuredCategories = Category::where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->take(8)
            ->get();

        $baseQuery = fn () => Product::with(['category:id,name,slug', 'brand:id,name,slug', 'variants'])
            ->where('is_active', true);

        $newArrivals = $baseQuery()->where('is_new_arrival', true)->latest()->take(8)->get();
        $bestSellers = $baseQuery()->where('is_best_seller', true)->orderByDesc('rating_avg')->take(8)->get();
        $flashSales = $baseQuery()->where('is_flash_sale', true)->take(8)->get();

        $testimonials = Review::with(['user:id,name', 'product:id,name,slug'])
            ->where('is_approved', true)
            ->where('rating', '>=', 4)
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'featured_categories' => $featuredCategories,
            'new_arrivals' => $newArrivals,
            'best_sellers' => $bestSellers,
            'flash_sales' => $flashSales,
            'testimonials' => $testimonials,
            'settings' => SiteSetting::getAllKeyed(),
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    public function brands(): JsonResponse
    {
        $brands = Brand::where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name')
            ->get();

        return response()->json(['brands' => $brands]);
    }

    public function products(Request $request): JsonResponse
    {
        $query = Product::with(['category:id,name,slug', 'brand:id,name,slug', 'variants'])
            ->where('is_active', true);

        if ($category = $request->string('category')->toString()) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category)->orWhere('id', $category));
        }

        if ($brand = $request->string('brand')->toString()) {
            $query->whereHas('brand', fn ($q) => $q->where('slug', $brand)->orWhere('id', $brand));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        if ($request->filled('rating')) {
            $query->where('rating_avg', '>=', (float) $request->input('rating'));
        }

        if ($request->boolean('flash_sale')) {
            $query->where('is_flash_sale', true);
        }

        if ($search = trim($request->string('search')->toString())) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        match ($request->string('sort')->toString()) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'rating' => $query->orderByDesc('rating_avg'),
            'best_seller' => $query->orderByDesc('is_best_seller')->orderByDesc('rating_count'),
            default => $query->latest(),
        };

        $perPage = min(max((int) $request->input('per_page', 12), 1), 48);

        return response()->json($query->paginate($perPage));
    }

    public function searchSuggestions(Request $request): JsonResponse
    {
        $q = trim($request->string('q')->toString());
        if (strlen($q) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $suggestions = Product::where('is_active', true)
            ->where('name', 'like', "%{$q}%")
            ->select('id', 'name', 'slug', 'price', 'images')
            ->take(6)
            ->get();

        return response()->json(['suggestions' => $suggestions]);
    }

    public function productDetail(string $slug): JsonResponse
    {
        $product = Product::with([
            'category:id,name,slug',
            'brand:id,name,slug',
            'variants',
            'reviews' => fn ($q) => $q->where('is_approved', true)->with('user:id,name')->latest(),
        ])->where('slug', $slug)->where('is_active', true)->firstOrFail();

        $related = Product::with(['category:id,name,slug', 'brand:id,name,slug'])
            ->where('is_active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        return response()->json([
            'product' => $product,
            'related' => $related,
        ]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::where('code', strtoupper(trim($data['code'])))->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid coupon code.'], 404);
        }

        $discount = $coupon->calculateDiscount((float) $data['subtotal']);
        if ($discount <= 0) {
            return response()->json([
                'message' => 'Coupon is expired, inactive, or minimum order amount not met.',
            ], 422);
        }

        return response()->json([
            'coupon' => $coupon,
            'discount' => $discount,
        ]);
    }

    public function checkout(Request $request, PaymentManager $paymentManager): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['nullable', 'email', 'max:190'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'shipping_zone' => ['required', 'in:inside_dhaka,outside_dhaka'],
            'payment_method' => ['required', 'in:cod,bkash,nagad'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $settings = SiteSetting::getAllKeyed();
        $deliveryInside = (float) ($settings['delivery_charge_inside_dhaka'] ?? 70);
        $deliveryOutside = (float) ($settings['delivery_charge_outside_dhaka'] ?? 130);
        $deliveryCharge = $data['shipping_zone'] === 'inside_dhaka' ? $deliveryInside : $deliveryOutside;

        $order = DB::transaction(function () use ($request, $data, $deliveryCharge, $paymentManager) {
            $subtotal = 0.0;
            $preparedItems = [];

            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $variant = null;
                $unitPrice = (float) $product->price;
                $variantLabel = null;

                if (!empty($item['variant_id'])) {
                    $variant = ProductVariant::where('product_id', $product->id)
                        ->lockForUpdate()
                        ->findOrFail($item['variant_id']);
                    if ($variant->stock_qty < $item['quantity']) {
                        abort(422, "Insufficient stock for {$product->name} variant.");
                    }
                    $unitPrice += (float) $variant->price_adjustment;
                    $variantLabel = trim(($variant->size ?? '') . ' ' . ($variant->color ?? ''));
                    $variant->decrement('stock_qty', $item['quantity']);
                } else {
                    if ($product->stock_qty < $item['quantity']) {
                        abort(422, "Insufficient stock for {$product->name}.");
                    }
                }

                $product->decrement('stock_qty', min($product->stock_qty, $item['quantity']));
                $lineTotal = round($unitPrice * $item['quantity'], 2);
                $subtotal += $lineTotal;

                $preparedItems[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'variant_label' => $variantLabel ?: null,
                    'unit_price' => $unitPrice,
                    'quantity' => $item['quantity'],
                    'total_price' => $lineTotal,
                ];
            }

            $discount = 0.0;
            $couponCode = null;
            if (!empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper(trim($data['coupon_code'])))->lockForUpdate()->first();
                if ($coupon) {
                    $discount = $coupon->calculateDiscount($subtotal);
                    if ($discount > 0) {
                        $couponCode = $coupon->code;
                        $coupon->increment('used_count');
                    }
                }
            }

            $total = max(0, round($subtotal - $discount + $deliveryCharge, 2));

            $order = Order::create([
                'order_number' => 'SDK-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                'user_id' => $request->user()?->id,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'] ?? null,
                'customer_phone' => $data['customer_phone'],
                'shipping_address' => $data['shipping_address'],
                'city' => $data['city'],
                'shipping_zone' => $data['shipping_zone'],
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'delivery_charge' => $deliveryCharge,
                'total' => $total,
                'coupon_code' => $couponCode,
                'payment_method' => $data['payment_method'],
                'payment_status' => 'pending',
                'status' => 'pending',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($preparedItems as $prepared) {
                OrderItem::create(['order_id' => $order->id, ...$prepared]);
            }

            $paymentResult = $paymentManager->driver($data['payment_method'])->process($order, [
                'payment_reference' => $data['payment_reference'] ?? null,
            ]);

            $order->update([
                'payment_status' => $paymentResult['status'],
                'payment_reference' => $paymentResult['reference'],
            ]);

            return $order->load('items');
        });

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => $order,
        ], 201);
    }

    public function trackOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_number' => ['required', 'string'],
            'phone' => ['required', 'string'],
        ]);

        $order = Order::with('items')
            ->where('order_number', trim($data['order_number']))
            ->where('customer_phone', trim($data['phone']))
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found. Please verify order number and phone.'], 404);
        }

        return response()->json(['order' => $order]);
    }

    public function subscribeNewsletter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:190'],
        ]);

        Newsletter::firstOrCreate(['email' => $data['email']]);

        return response()->json(['message' => 'Subscribed to Sadik newsletter successfully!']);
    }

    public function submitContact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:3000'],
        ]);

        ContactMessage::create($data);

        return response()->json(['message' => 'Thank you for contacting us. We will respond shortly.'], 201);
    }
}
