<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaB2cResultController extends Controller
{
    use AcknowledgesMpesaCallback;

    public function __invoke(Request $request)
    {
        $result = $request->input('Result');

        if (! is_array($result) || ! isset($result['ConversationID'], $result['ResultCode'])) {
            Log::warning('Malformed M-Pesa B2C result callback received', $request->all());

            return $this->accepted();
        }

        $conversationId = $result['ConversationID'];

        $event = WebhookEvent::firstOrCreate(
            ['source' => 'mpesa_b2c', 'external_id' => $conversationId],
            ['payload' => $request->all()],
        );

        if ($event->processed_at !== null) {
            return $this->accepted();
        }

        $payout = Payout::withoutGlobalScopes()
            ->where('mpesa_b2c_conversation_id', $conversationId)
            ->first();

        if (! $payout) {
            Log::warning('M-Pesa B2C result for unknown payout', ['conversation_id' => $conversationId]);
            $event->update(['processed_at' => now()]);

            return $this->accepted();
        }

        if ($payout->status === 'processing') {
            if ((int) $result['ResultCode'] === 0) {
                $params = collect($result['ResultParameters']['ResultParameter'] ?? [])->pluck('Value', 'Key');

                $payout->update([
                    'status' => 'paid',
                    'mpesa_b2c_txn_id' => $result['TransactionID'] ?? $params->get('TransactionReceipt'),
                    'paid_at' => now(),
                ]);
            } else {
                $payout->update(['status' => 'failed']);
            }
        }

        $event->update(['processed_at' => now()]);

        return $this->accepted();
    }
}
