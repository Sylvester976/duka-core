<?php

namespace Tests\Feature\Jobs;

use App\Jobs\ProcessRemittance;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Tenant;
use App\Services\Mpesa\DarajaClient;
use App\Services\Mpesa\DarajaRequestException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ProcessRemittanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_payout_and_sends_a_b2c_request_for_a_paid_order(): void
    {
        $tenant = Tenant::factory()->create([
            'platform_fee_percent' => 2.5,
            'mpesa_b2c_msisdn' => '254712345678',
        ]);
        $order = Order::factory()->for($tenant)->create(['status' => 'paid', 'amount' => 1000]);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldReceive('b2c')
            ->once()
            ->withArgs(fn (string $phone, float $amount) => $phone === '254712345678' && $amount === 975.0)
            ->andReturn(['ConversationID' => 'conv-1', 'ResponseCode' => '0']);
        $this->app->instance(DarajaClient::class, $daraja);

        ProcessRemittance::dispatchSync($order);

        $payout = Payout::where('order_id', $order->id)->first();

        $this->assertNotNull($payout);
        $this->assertSame('processing', $payout->status);
        $this->assertSame('25.00', $payout->platform_fee);
        $this->assertSame('975.00', $payout->net_amount);
        $this->assertSame('conv-1', $payout->mpesa_b2c_conversation_id);
    }

    public function test_it_does_nothing_for_an_order_that_is_not_paid(): void
    {
        $tenant = Tenant::factory()->create();
        $order = Order::factory()->for($tenant)->create(['status' => 'pending']);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldNotReceive('b2c');
        $this->app->instance(DarajaClient::class, $daraja);

        ProcessRemittance::dispatchSync($order);

        $this->assertDatabaseCount('payouts', 0);
    }

    public function test_it_does_not_create_a_second_payout_for_an_already_paid_out_order(): void
    {
        $tenant = Tenant::factory()->create();
        $order = Order::factory()->for($tenant)->create(['status' => 'paid']);
        Payout::factory()->for($order)->for($tenant)->create(['status' => 'paid']);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldNotReceive('b2c');
        $this->app->instance(DarajaClient::class, $daraja);

        ProcessRemittance::dispatchSync($order);

        $this->assertDatabaseCount('payouts', 1);
    }

    public function test_it_resumes_a_stuck_processing_payout_instead_of_duplicating_it(): void
    {
        $tenant = Tenant::factory()->create(['mpesa_b2c_msisdn' => '254712345678']);
        $order = Order::factory()->for($tenant)->create(['status' => 'paid', 'amount' => 1000]);
        $existing = Payout::factory()->for($order)->for($tenant)->create([
            'status' => 'processing',
            'gross_amount' => 1000,
            'platform_fee' => 25,
            'net_amount' => 975,
        ]);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldReceive('b2c')->once()->andReturn(['ConversationID' => 'conv-2', 'ResponseCode' => '0']);
        $this->app->instance(DarajaClient::class, $daraja);

        ProcessRemittance::dispatchSync($order);

        $this->assertDatabaseCount('payouts', 1);
        $existing->refresh();
        $this->assertSame('conv-2', $existing->mpesa_b2c_conversation_id);
    }

    public function test_it_marks_the_payout_failed_when_daraja_rejects_the_b2c_request(): void
    {
        $tenant = Tenant::factory()->create(['mpesa_b2c_msisdn' => '254712345678']);
        $order = Order::factory()->for($tenant)->create(['status' => 'paid']);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldReceive('b2c')->once()->andThrow(new DarajaRequestException('boom'));
        $this->app->instance(DarajaClient::class, $daraja);

        ProcessRemittance::dispatchSync($order);

        $payout = Payout::where('order_id', $order->id)->first();
        $this->assertSame('failed', $payout->status);
    }

    public function test_it_fails_without_calling_daraja_when_tenant_has_no_payout_number(): void
    {
        $tenant = Tenant::factory()->create(['mpesa_b2c_msisdn' => null]);
        $order = Order::factory()->for($tenant)->create(['status' => 'paid']);

        $daraja = Mockery::mock(DarajaClient::class);
        $daraja->shouldNotReceive('b2c');
        $this->app->instance(DarajaClient::class, $daraja);

        ProcessRemittance::dispatchSync($order);

        $payout = Payout::where('order_id', $order->id)->first();
        $this->assertSame('failed', $payout->status);
    }
}
