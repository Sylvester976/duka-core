<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Payout;
use App\Services\Mpesa\DarajaClient;
use App\Services\Mpesa\DarajaRequestException;
use App\Services\PaymentSplitService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessRemittance implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    /** @var array<int, int> */
    public array $backoff = [10, 30, 60, 300];

    public function __construct(public Order $order) {}

    public function handle(PaymentSplitService $splitService, DarajaClient $daraja): void
    {
        if ($this->order->status !== 'paid') {
            return;
        }

        $payout = $this->order->payout;

        if ($payout && $payout->status !== 'processing') {
            return;
        }

        $tenant = $this->order->tenant;

        if (! $payout) {
            $split = $splitService->split((float) $this->order->amount, (float) $tenant->platform_fee_percent);

            try {
                $payout = Payout::create([
                    'order_id' => $this->order->id,
                    'gross_amount' => $split['gross_amount'],
                    'platform_fee' => $split['platform_fee'],
                    'net_amount' => $split['net_amount'],
                    'status' => 'processing',
                ]);
            } catch (QueryException) {
                // order_id is unique: another worker already claimed this remittance.
                return;
            }
        }

        if (! $tenant->mpesa_b2c_msisdn) {
            $payout->update(['status' => 'failed']);
            Log::error('Cannot process remittance: tenant has no B2C payout number', [
                'tenant_id' => $tenant->id,
                'order_id' => $this->order->id,
            ]);

            return;
        }

        try {
            $response = $daraja->b2c(
                phone: $tenant->mpesa_b2c_msisdn,
                amount: (float) $payout->net_amount,
                remarks: "Payout for order {$this->order->id}",
            );
        } catch (DarajaRequestException $e) {
            $payout->update(['status' => 'failed']);
            report($e);

            return;
        }

        $payout->update(['mpesa_b2c_conversation_id' => $response['ConversationID'] ?? null]);
    }
}
