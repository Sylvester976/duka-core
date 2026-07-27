<?php

namespace Tests\Feature\Webhooks;

use App\Models\Order;
use App\Models\Tenant;
use App\Models\WebhookEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MpesaStkCallbackTest extends TestCase
{
    use RefreshDatabase;

    private function successPayload(string $checkoutRequestId): array
    {
        return [
            'Body' => [
                'stkCallback' => [
                    'MerchantRequestID' => '29115-34620561-1',
                    'CheckoutRequestID' => $checkoutRequestId,
                    'ResultCode' => 0,
                    'ResultDesc' => 'The service request is processed successfully.',
                    'CallbackMetadata' => [
                        'Item' => [
                            ['Name' => 'Amount', 'Value' => 1000],
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'NLJ7RT61SV'],
                            ['Name' => 'TransactionDate', 'Value' => 20260727165451],
                            ['Name' => 'PhoneNumber', 'Value' => 254712345678],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function failurePayload(string $checkoutRequestId): array
    {
        return [
            'Body' => [
                'stkCallback' => [
                    'MerchantRequestID' => '29115-34620561-1',
                    'CheckoutRequestID' => $checkoutRequestId,
                    'ResultCode' => 1032,
                    'ResultDesc' => 'Request cancelled by user.',
                ],
            ],
        ];
    }

    public function test_successful_callback_marks_the_order_paid(): void
    {
        $tenant = Tenant::factory()->create();
        $order = Order::factory()->for($tenant)->create([
            'status' => 'pending',
            'amount' => 1000,
            'mpesa_checkout_request_id' => 'ws_CO_1',
        ]);

        $response = $this->postJson('/api/webhooks/mpesa/stk', $this->successPayload('ws_CO_1'));

        $response->assertOk();

        $order->refresh();
        $this->assertSame('paid', $order->status);
        $this->assertSame('NLJ7RT61SV', $order->mpesa_txn_id);
        $this->assertNotNull($order->paid_at);

        $this->assertDatabaseHas('webhook_events', [
            'source' => 'mpesa_stk',
            'external_id' => 'ws_CO_1',
        ]);
    }

    public function test_failed_callback_marks_the_order_failed(): void
    {
        $tenant = Tenant::factory()->create();
        $order = Order::factory()->for($tenant)->create([
            'status' => 'pending',
            'mpesa_checkout_request_id' => 'ws_CO_2',
        ]);

        $response = $this->postJson('/api/webhooks/mpesa/stk', $this->failurePayload('ws_CO_2'));

        $response->assertOk();

        $order->refresh();
        $this->assertSame('failed', $order->status);
        $this->assertNull($order->mpesa_txn_id);
    }

    public function test_replayed_callback_does_not_double_process(): void
    {
        $tenant = Tenant::factory()->create();
        $order = Order::factory()->for($tenant)->create([
            'status' => 'pending',
            'mpesa_checkout_request_id' => 'ws_CO_3',
        ]);

        $payload = $this->successPayload('ws_CO_3');

        $this->postJson('/api/webhooks/mpesa/stk', $payload)->assertOk();
        $this->postJson('/api/webhooks/mpesa/stk', $payload)->assertOk();

        $this->assertSame(
            1,
            WebhookEvent::where('source', 'mpesa_stk')->where('external_id', 'ws_CO_3')->count(),
        );

        $order->refresh();
        $this->assertSame('paid', $order->status);
    }

    public function test_callback_for_an_unknown_order_is_acknowledged_without_error(): void
    {
        $response = $this->postJson('/api/webhooks/mpesa/stk', $this->successPayload('ws_CO_unknown'));

        $response->assertOk();

        $this->assertDatabaseHas('webhook_events', [
            'source' => 'mpesa_stk',
            'external_id' => 'ws_CO_unknown',
        ]);
    }

    public function test_malformed_callback_is_acknowledged_without_error(): void
    {
        $response = $this->postJson('/api/webhooks/mpesa/stk', ['Body' => ['stkCallback' => ['foo' => 'bar']]]);

        $response->assertOk();
    }
}
