<?php

namespace App\Http\Controllers\Webhooks;

use Illuminate\Http\JsonResponse;

trait AcknowledgesMpesaCallback
{
    private function accepted(): JsonResponse
    {
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }
}
