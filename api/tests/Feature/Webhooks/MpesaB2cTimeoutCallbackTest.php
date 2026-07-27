<?php

namespace Tests\Feature\Webhooks;

use App\Models\Order;
use App\Models\Payout;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MpesaB2cTimeoutCallbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_timeout_marks_a_processing_payout_failed(): void
    {
        $tenant = Tenant::factory()->create();
        $order = Order::factory()->for($tenant)->create(['status' => 'paid']);
        $payout = Payout::factory()->for($order)->for($tenant)->create([
            'status' => 'processing',
            'mpesa_b2c_conversation_id' => 'conv-1',
        ]);

        $response = $this->postJson('/api/webhooks/mpesa/b2c/timeout', [
            'Result' => ['ConversationID' => 'conv-1'],
        ]);

        $response->assertOk();

        $payout->refresh();
        $this->assertSame('failed', $payout->status);
    }

    public function test_timeout_for_an_unknown_conversation_is_acknowledged_without_error(): void
    {
        $response = $this->postJson('/api/webhooks/mpesa/b2c/timeout', [
            'Result' => ['ConversationID' => 'conv-unknown'],
        ]);

        $response->assertOk();
    }
}
