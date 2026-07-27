<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaB2cTimeoutController extends Controller
{
    use AcknowledgesMpesaCallback;

    public function __invoke(Request $request)
    {
        $conversationId = $request->input('Result.ConversationID');

        if (! $conversationId) {
            Log::warning('Malformed M-Pesa B2C timeout callback received', $request->all());

            return $this->accepted();
        }

        $event = WebhookEvent::firstOrCreate(
            ['source' => 'mpesa_b2c', 'external_id' => $conversationId],
            ['payload' => $request->all()],
        );

        if ($event->processed_at === null) {
            $payout = Payout::withoutGlobalScopes()
                ->where('mpesa_b2c_conversation_id', $conversationId)
                ->first();

            if ($payout && $payout->status === 'processing') {
                $payout->update(['status' => 'failed']);
            }

            $event->update(['processed_at' => now()]);
        }

        return $this->accepted();
    }
}
