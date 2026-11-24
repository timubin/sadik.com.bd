<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EcommerceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_home_endpoint_returns_storefront_data(): void
    {
        $response = $this->getJson('/api/home');

        $response->assertOk()
            ->assertJsonStructure([
                'featured_categories',
                'new_arrivals',
                'best_sellers',
                'flash_sales',
                'testimonials',
                'settings' => ['brand_name', 'domain', 'address', 'phone'],
            ]);
    }

    public function test_guest_checkout_with_coupon_and_bkash_mock(): void
    {
        $product = Product::firstOrFail();

        $response = $this->postJson('/api/checkout', [
            'customer_name' => 'Tanvir Ahmed',
            'customer_email' => 'tanvir@example.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Road 12, Dhanmondi',
            'city' => 'Dhaka',
            'shipping_zone' => 'inside_dhaka',
            'payment_method' => 'bkash',
            'coupon_code' => 'SADIK10',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('order.payment_status', 'paid')
            ->assertJsonPath('order.delivery_charge', 70);
    }

    public function test_admin_dashboard_enforces_role_based_access(): void
    {
        $customer = User::where('role', 'customer')->firstOrFail();
        $admin = User::where('role', 'admin')->firstOrFail();

        $this->actingAs($customer)->getJson('/api/admin/dashboard')->assertForbidden();
        $this->actingAs($admin)->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure(['metrics', 'sales_chart', 'top_products', 'recent_orders']);
    }
}
