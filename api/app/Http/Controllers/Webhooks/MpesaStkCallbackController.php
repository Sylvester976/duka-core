<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessRemittance;
use App\Models\Order;
use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaStkCallbackController extends Controller
{
    use AcknowledgesMpesaCallback;

    public function __invoke(Request $request)
    {
        $callback = $request->input('Body.stkCallback');

        if (! is_array($callback) || ! isset($callback['CheckoutRequestID'], $callback['ResultCode'])) {
            Log::warning('Malformed M-Pesa STK callback received', $request->all());

            return $this->accepted();
        }

        $checkoutRequestId = $callback['CheckoutRequestID'];

        $event = WebhookEvent::firstOrCreate(
            ['source' => 'mpesa_stk', 'external_id' => $checkoutRequestId],
            ['payload' => $request->all()],
        );

        if ($event->processed_at !== null) {
            return $this->accepted();
        }

        $order = Order::withoutGlobalScopes()
            ->where('mpesa_checkout_request_id', $checkoutRequestId)
            ->first();

        if (! $order) {
            Log::warning('M-Pesa STK callback for unknown order', ['checkout_request_id' => $checkoutRequestId]);
            $event->update(['processed_at' => now()]);

            return $this->accepted();
        }

        if ($order->status === 'pending') {
            if ((int) $callback['ResultCode'] === 0) {
                $metadata = collect($callback['CallbackMetadata']['Item'] ?? [])->pluck('Value', 'Name');

                $order->update([
                    'status' => 'paid',
                    'mpesa_txn_id' => $metadata->get('MpesaReceiptNumber'),
                    'paid_at' => now(),
                ]);

                ProcessRemittance::dispatch($order);
            } else {
                $order->update(['status' => 'failed']);
            }
        }

        $event->update(['processed_at' => now()]);

        return $this->accepted();
    }
}
