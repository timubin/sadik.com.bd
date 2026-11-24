<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\StorefrontController;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public Storefront Routes
Route::get('/settings', [StorefrontController::class, 'settings']);
Route::get('/home', [StorefrontController::class, 'home']);
Route::get('/categories', [StorefrontController::class, 'categories']);
Route::get('/brands', [StorefrontController::class, 'brands']);
Route::get('/products', [StorefrontController::class, 'products']);
Route::get('/products/suggestions', [StorefrontController::class, 'searchSuggestions']);
Route::get('/products/{slug}', [StorefrontController::class, 'productDetail']);
Route::post('/coupons/validate', [StorefrontController::class, 'validateCoupon']);
Route::post('/checkout', [StorefrontController::class, 'checkout']);
Route::post('/orders/track', [StorefrontController::class, 'trackOrder']);
Route::post('/newsletter', [StorefrontController::class, 'subscribeNewsletter']);
Route::post('/contact', [StorefrontController::class, 'submitContact']);

// Authenticated User Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Checkout can also attach authenticated user if Bearer token is sent
    Route::post('/customer/checkout', [StorefrontController::class, 'checkout']);

    Route::get('/customer/orders', [CustomerController::class, 'orders']);
    Route::get('/customer/orders/{orderNumber}', [CustomerController::class, 'orderDetail']);
    Route::get('/customer/wishlist', [CustomerController::class, 'wishlist']);
    Route::post('/customer/wishlist/toggle', [CustomerController::class, 'toggleWishlist']);
    Route::get('/customer/addresses', [CustomerController::class, 'addresses']);
    Route::post('/customer/addresses', [CustomerController::class, 'storeAddress']);
    Route::put('/customer/addresses/{id}', [CustomerController::class, 'updateAddress']);
    Route::delete('/customer/addresses/{id}', [CustomerController::class, 'deleteAddress']);
    Route::post('/products/{productId}/reviews', [CustomerController::class, 'submitReview']);
});

// Admin & Staff Routes
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    Route::get('/products', [AdminController::class, 'products']);
    Route::post('/products', [AdminController::class, 'storeProduct']);
    Route::post('/products/bulk', [AdminController::class, 'bulkUploadProducts']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);

    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

    Route::get('/brands', [AdminController::class, 'brands']);
    Route::post('/brands', [AdminController::class, 'storeBrand']);
    Route::put('/brands/{id}', [AdminController::class, 'updateBrand']);
    Route::delete('/brands/{id}', [AdminController::class, 'deleteBrand']);

    Route::get('/orders', [AdminController::class, 'orders']);
    Route::put('/orders/{id}', [AdminController::class, 'updateOrderStatus']);

    Route::get('/coupons', [AdminController::class, 'coupons']);
    Route::post('/coupons', [AdminController::class, 'storeCoupon']);
    Route::delete('/coupons/{id}', [AdminController::class, 'deleteCoupon']);

    Route::get('/customers', [AdminController::class, 'customers']);
    Route::get('/reviews', [AdminController::class, 'reviews']);
    Route::patch('/reviews/{id}/toggle', [AdminController::class, 'toggleReviewApproval']);
    Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);

    Route::get('/messages', [AdminController::class, 'contactMessages']);
    Route::patch('/messages/{id}/read', [AdminController::class, 'markMessageRead']);

    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        Route::put('/customers/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::put('/settings', [AdminController::class, 'updateSettings']);
    });
});
