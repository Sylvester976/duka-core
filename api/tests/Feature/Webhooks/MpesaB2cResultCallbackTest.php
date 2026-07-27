<?php

namespace Tests\Feature\Webhooks;

use App\Models\Order;
use App\Models\Payout;
use App\Models\Tenant;
use App\Models\WebhookEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MpesaB2cResultCallbackTest extends TestCase
{
    use RefreshDatabase;

    private function successPayload(string $conversationId): array
    {
        return [
            'Result' => [
                'ResultType' => 0,
                'ResultCode' => 0,
                'ResultDesc' => 'The service request is processed successfully.',
                'OriginatorConversationID' => '10571-7910404-1',
                'ConversationID' => $conversationId,
                'TransactionID' => 'NLJ41HAY6Q',
                'ResultParameters' => [
                    'ResultParameter' => [
                        ['Key' => 'TransactionAmount', 'Value' => 975],
                        ['Key' => 'TransactionReceipt', 'Value' => 'NLJ41HAY6Q'],
                    ],
                ],
            ],
        ];
    }

    private function failurePayload(string $conversationId): array
    {
        return [
            'Result' => [
                'ResultType' => 0,
                'ResultCode' => 1,
                'ResultDesc' => 'Insufficient Funds.',
                'OriginatorConversationID' => '10571-7910404-1',
                'ConversationID' => $conversationId,
            ],
        ];
    }

    private function processingPayout(): Payout
    {
        $tenant = Tenant::factory()->create();
        $order = Order::factory()->for($tenant)->create(['status' => 'paid']);

        return Payout::factory()->for($order)->for($tenant)->create([
            'status' => 'processing',
            'mpesa_b2c_conversation_id' => 'conv-1',
        ]);
    }

    public function test_successful_result_marks_the_payout_paid(): void
    {
        $payout = $this->processingPayout();

        $response = $this->postJson('/api/webhooks/mpesa/b2c/result', $this->successPayload('conv-1'));

        $response->assertOk();

        $payout->refresh();
        $this->assertSame('paid', $payout->status);
        $this->assertSame('NLJ41HAY6Q', $payout->mpesa_b2c_txn_id);
        $this->assertNotNull($payout->paid_at);
    }

    public function test_failed_result_marks_the_payout_failed(): void
    {
        $payout = $this->processingPayout();

        $response = $this->postJson('/api/webhooks/mpesa/b2c/result', $this->failurePayload('conv-1'));

        $response->assertOk();

        $payout->refresh();
        $this->assertSame('failed', $payout->status);
        $this->assertNull($payout->mpesa_b2c_txn_id);
    }

    public function test_replayed_result_does_not_double_process(): void
    {
        $payout = $this->processingPayout();
        $payload = $this->successPayload('conv-1');

        $this->postJson('/api/webhooks/mpesa/b2c/result', $payload)->assertOk();
        $this->postJson('/api/webhooks/mpesa/b2c/result', $payload)->assertOk();

        $this->assertSame(
            1,
            WebhookEvent::where('source', 'mpesa_b2c')->where('external_id', 'conv-1')->count(),
        );

        $payout->refresh();
        $this->assertSame('paid', $payout->status);
    }

    public function test_result_for_an_unknown_payout_is_acknowledged_without_error(): void
    {
        $response = $this->postJson('/api/webhooks/mpesa/b2c/result', $this->successPayload('conv-unknown'));

        $response->assertOk();
        $this->assertDatabaseHas('webhook_events', [
            'source' => 'mpesa_b2c',
            'external_id' => 'conv-unknown',
        ]);
    }
}
