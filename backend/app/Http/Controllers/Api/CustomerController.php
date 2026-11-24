<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function orders(Request $request): JsonResponse
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function orderDetail(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json(['order' => $order]);
    }

    public function wishlist(Request $request): JsonResponse
    {
        $items = Wishlist::with('product.category:id,name,slug')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->pluck('product')
            ->filter()
            ->values();

        return response()->json(['wishlist' => $items]);
    }

    public function toggleWishlist(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['wishlisted' => false]);
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $data['product_id'],
        ]);

        return response()->json(['wishlisted' => true], 201);
    }

    public function addresses(Request $request): JsonResponse
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return response()->json(['addresses' => $addresses]);
    }

    public function storeAddress(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:50'],
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'zone' => ['required', 'in:inside_dhaka,outside_dhaka'],
            'is_default' => ['boolean'],
        ]);

        if (!empty($data['is_default'])) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address = Address::create([
            'user_id' => $request->user()->id,
            ...$data,
        ]);

        return response()->json(['address' => $address], 201);
    }

    public function updateAddress(Request $request, int $id): JsonResponse
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'label' => ['required', 'string', 'max:50'],
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'zone' => ['required', 'in:inside_dhaka,outside_dhaka'],
            'is_default' => ['boolean'],
        ]);

        if (!empty($data['is_default'])) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json(['address' => $address]);
    }

    public function deleteAddress(Request $request, int $id): JsonResponse
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);
        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }

    public function submitReview(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:150'],
            'comment' => ['required', 'string', 'max:2000'],
        ]);

        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => $request->user()->id,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'comment' => $data['comment'],
            'is_approved' => true,
        ]);

        $avg = Review::where('product_id', $product->id)->where('is_approved', true)->avg('rating') ?? 0;
        $count = Review::where('product_id', $product->id)->where('is_approved', true)->count();
        $product->update([
            'rating_avg' => round((float) $avg, 2),
            'rating_count' => $count,
        ]);

        return response()->json(['review' => $review->load('user:id,name')], 201);
    }
}
