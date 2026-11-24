<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $totalSales = (float) Order::where('status', '!=', 'cancelled')->sum('total');
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::count();

        $salesChart = collect(range(6, 0))->map(function (int $daysAgo) {
            $date = now()->subDays($daysAgo)->toDateString();
            $amount = (float) Order::whereDate('created_at', $date)
                ->where('status', '!=', 'cancelled')
                ->sum('total');
            $orders = Order::whereDate('created_at', $date)->count();

            return [
                'date' => now()->subDays($daysAgo)->format('M d'),
                'sales' => $amount,
                'orders' => $orders,
            ];
        })->values();

        $topProducts = OrderItem::select('product_id', 'product_name', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(total_price) as revenue'))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        $recentOrders = Order::latest()->take(6)->get();
        $lowStockProducts = Product::where('stock_qty', '<=', 5)->orderBy('stock_qty')->take(5)->get();

        return response()->json([
            'metrics' => [
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'total_customers' => $totalCustomers,
                'total_products' => $totalProducts,
            ],
            'sales_chart' => $salesChart,
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
            'low_stock_products' => $lowStockProducts,
        ]);
    }

    // ---------------- Products ----------------
    public function products(Request $request): JsonResponse
    {
        $query = Product::with(['category:id,name', 'brand:id,name', 'variants'])->latest();

        if ($search = trim($request->string('search')->toString())) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:200'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock_qty' => ['required', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'is_featured' => ['boolean'],
            'is_new_arrival' => ['boolean'],
            'is_best_seller' => ['boolean'],
            'is_flash_sale' => ['boolean'],
            'flash_sale_ends_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'variants' => ['nullable', 'array'],
        ]);

        $slug = Str::slug($data['name']) . '-' . strtolower(Str::random(4));

        $product = DB::transaction(function () use ($data, $slug) {
            $variants = $data['variants'] ?? [];
            unset($data['variants']);

            $product = Product::create([...$data, 'slug' => $slug]);

            foreach ($variants as $v) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'size' => $v['size'] ?? null,
                    'color' => $v['color'] ?? null,
                    'color_hex' => $v['color_hex'] ?? null,
                    'sku' => $v['sku'] ?? null,
                    'price_adjustment' => $v['price_adjustment'] ?? 0,
                    'stock_qty' => $v['stock_qty'] ?? 0,
                ]);
            }

            return $product->load(['category', 'brand', 'variants']);
        });

        return response()->json(['product' => $product], 201);
    }

    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'name' => ['sometimes', 'string', 'max:200'],
            'sku' => ['sometimes', 'string', 'max:100', "unique:products,sku,{$id}"],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock_qty' => ['sometimes', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'is_featured' => ['boolean'],
            'is_new_arrival' => ['boolean'],
            'is_best_seller' => ['boolean'],
            'is_flash_sale' => ['boolean'],
            'flash_sale_ends_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'variants' => ['nullable', 'array'],
        ]);

        DB::transaction(function () use ($product, $data) {
            $variants = $data['variants'] ?? null;
            unset($data['variants']);

            $product->update($data);

            if (is_array($variants)) {
                $product->variants()->delete();
                foreach ($variants as $v) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'size' => $v['size'] ?? null,
                        'color' => $v['color'] ?? null,
                        'color_hex' => $v['color_hex'] ?? null,
                        'sku' => $v['sku'] ?? null,
                        'price_adjustment' => $v['price_adjustment'] ?? 0,
                        'stock_qty' => $v['stock_qty'] ?? 0,
                    ]);
                }
            }
        });

        return response()->json(['product' => $product->fresh(['category', 'brand', 'variants'])]);
    }

    public function deleteProduct(int $id): JsonResponse
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted.']);
    }

    public function bulkUploadProducts(Request $request): JsonResponse
    {
        $data = $request->validate([
            'products' => ['required', 'array', 'min:1', 'max:200'],
            'products.*.name' => ['required', 'string', 'max:200'],
            'products.*.sku' => ['required', 'string', 'max:100'],
            'products.*.category_id' => ['required', 'integer', 'exists:categories,id'],
            'products.*.brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'products.*.price' => ['required', 'numeric', 'min:0'],
            'products.*.compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'products.*.stock_qty' => ['required', 'integer', 'min:0'],
            'products.*.short_description' => ['nullable', 'string', 'max:500'],
            'products.*.image' => ['nullable', 'string'],
        ]);

        $created = 0;
        DB::transaction(function () use ($data, &$created) {
            foreach ($data['products'] as $row) {
                if (Product::where('sku', $row['sku'])->exists()) {
                    continue;
                }
                Product::create([
                    'category_id' => $row['category_id'],
                    'brand_id' => $row['brand_id'] ?? null,
                    'name' => $row['name'],
                    'slug' => Str::slug($row['name']) . '-' . strtolower(Str::random(4)),
                    'sku' => $row['sku'],
                    'short_description' => $row['short_description'] ?? null,
                    'price' => $row['price'],
                    'compare_at_price' => $row['compare_at_price'] ?? null,
                    'stock_qty' => $row['stock_qty'],
                    'images' => !empty($row['image']) ? [$row['image']] : [],
                    'is_active' => true,
                ]);
                $created++;
            }
        });

        return response()->json(['message' => "{$created} products imported successfully.", 'created' => $created], 201);
    }

    // ---------------- Categories ----------------
    public function categories(): JsonResponse
    {
        return response()->json(['categories' => Category::withCount('products')->orderBy('sort_order')->get()]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);
        $data['slug'] = Str::slug($data['name']) . '-' . strtolower(Str::random(3));

        return response()->json(['category' => Category::create($data)], 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);
        $category->update($data);

        return response()->json(['category' => $category]);
    }

    public function deleteCategory(int $id): JsonResponse
    {
        Category::findOrFail($id)->delete();
        return response()->json(['message' => 'Category deleted.']);
    }

    // ---------------- Brands ----------------
    public function brands(): JsonResponse
    {
        return response()->json(['brands' => Brand::withCount('products')->orderBy('name')->get()]);
    }

    public function storeBrand(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'logo' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
        $data['slug'] = Str::slug($data['name']) . '-' . strtolower(Str::random(3));

        return response()->json(['brand' => Brand::create($data)], 201);
    }

    public function updateBrand(Request $request, int $id): JsonResponse
    {
        $brand = Brand::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'logo' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
        $brand->update($data);

        return response()->json(['brand' => $brand]);
    }

    public function deleteBrand(int $id): JsonResponse
    {
        Brand::findOrFail($id)->delete();
        return response()->json(['message' => 'Brand deleted.']);
    }

    // ---------------- Orders ----------------
    public function orders(Request $request): JsonResponse
    {
        $query = Order::with('items')->latest();
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate(20));
    }

    public function updateOrderStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $data = $request->validate([
            'status' => ['sometimes', 'in:pending,processing,shipped,delivered,cancelled'],
            'payment_status' => ['sometimes', 'in:pending,paid,failed,refunded'],
        ]);
        $order->update($data);

        return response()->json(['order' => $order->load('items')]);
    }

    // ---------------- Coupons ----------------
    public function coupons(): JsonResponse
    {
        return response()->json(['coupons' => Coupon::latest()->get()]);
    }

    public function storeCoupon(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_order_amount' => ['numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);
        $data['code'] = strtoupper(trim($data['code']));

        return response()->json(['coupon' => Coupon::create($data)], 201);
    }

    public function deleteCoupon(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Coupon deleted.']);
    }

    // ---------------- Customers, Reviews & Messages ----------------
    public function customers(): JsonResponse
    {
        $users = User::withCount('orders')->latest()->paginate(20);
        return response()->json($users);
    }

    public function updateUserRole(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'role' => ['sometimes', 'in:customer,staff,admin'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $user->update($data);

        return response()->json(['user' => $user]);
    }

    public function reviews(): JsonResponse
    {
        return response()->json(Review::with(['user:id,name', 'product:id,name,slug'])->latest()->paginate(20));
    }

    public function toggleReviewApproval(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => !$review->is_approved]);

        return response()->json(['review' => $review]);
    }

    public function deleteReview(int $id): JsonResponse
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Review deleted.']);
    }

    public function contactMessages(): JsonResponse
    {
        return response()->json(ContactMessage::latest()->paginate(20));
    }

    public function markMessageRead(int $id): JsonResponse
    {
        $msg = ContactMessage::findOrFail($id);
        $msg->update(['is_read' => true]);
        return response()->json(['message' => $msg]);
    }

    // ---------------- Site Settings ----------------
    public function getSettings(): JsonResponse
    {
        return response()->json(['settings' => SiteSetting::getAllKeyed()]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => (string) $key],
                [
                    'value' => is_array($value) ? json_encode($value) : (string) $value,
                    'group' => 'general',
                ]
            );
        }

        return response()->json(['settings' => SiteSetting::getAllKeyed()]);
    }
}
