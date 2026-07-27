<?php

namespace Tests\Feature\Storefront;

use App\Models\Product;
use App\Models\Tenant;
use App\Services\Mpesa\DarajaClient;
use App\Services\Mpesa\DarajaRequestException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_a_pending_order_and_computes_amount_server_side(): void
    {
        $tenant = Tenant::factory()->create();
        $product = Product::factory()->for($tenant)->create(['price' => 500]);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldReceive('stkPush')
            ->once()
            ->withArgs(fn (string $phone, float $amount) => $phone === '254712345678' && $amount === 1000.0)
            ->andReturn(['CheckoutRequestID' => 'ws_CO_1', 'ResponseCode' => '0']);
        $this->app->instance(DarajaClient::class, $daraja);

        $response = $this->postJson("/api/shop/{$tenant->slug}/checkout", [
            'customer_msisdn' => '254712345678',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ]);

        $response->assertCreated();
        $response->assertJson(['status' => 'pending']);

        $this->assertDatabaseHas('orders', [
            'id' => $response->json('order_id'),
            'tenant_id' => $tenant->id,
            'amount' => '1000.00',
            'status' => 'pending',
            'mpesa_checkout_request_id' => 'ws_CO_1',
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => '500.00',
        ]);
    }

    public function test_checkout_ignores_client_sent_price_and_uses_the_stored_product_price(): void
    {
        $tenant = Tenant::factory()->create();
        $product = Product::factory()->for($tenant)->create(['price' => 500]);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldReceive('stkPush')->once()->andReturn(['CheckoutRequestID' => 'ws_CO_1', 'ResponseCode' => '0']);
        $this->app->instance(DarajaClient::class, $daraja);

        $response = $this->postJson("/api/shop/{$tenant->slug}/checkout", [
            'customer_msisdn' => '254712345678',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'price' => 1],
            ],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('orders', ['amount' => '500.00']);
    }

    public function test_checkout_rejects_a_product_from_another_tenant(): void
    {
        $tenant = Tenant::factory()->create();
        $otherTenantProduct = Product::factory()->for(Tenant::factory())->create();

        $response = $this->postJson("/api/shop/{$tenant->slug}/checkout", [
            'customer_msisdn' => '254712345678',
            'items' => [
                ['product_id' => $otherTenantProduct->id, 'quantity' => 1],
            ],
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['items.0.product_id']);
    }

    public function test_checkout_rejects_an_inactive_product(): void
    {
        $tenant = Tenant::factory()->create();
        $product = Product::factory()->for($tenant)->create(['is_active' => false]);

        $response = $this->postJson("/api/shop/{$tenant->slug}/checkout", [
            'customer_msisdn' => '254712345678',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertUnprocessable();
    }

    public function test_checkout_marks_the_order_failed_when_daraja_rejects_the_stk_push(): void
    {
        $tenant = Tenant::factory()->create();
        $product = Product::factory()->for($tenant)->create(['price' => 500]);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldReceive('stkPush')->once()->andThrow(new DarajaRequestException('boom'));
        $this->app->instance(DarajaClient::class, $daraja);

        $response = $this->postJson("/api/shop/{$tenant->slug}/checkout", [
            'customer_msisdn' => '254712345678',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(502);
        $this->assertDatabaseHas('orders', ['status' => 'failed']);
    }
}
