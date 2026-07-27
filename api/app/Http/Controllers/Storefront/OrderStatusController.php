<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;

class OrderStatusController extends Controller
{
    public function show(Order $order)
    {
        return response()->json([
            'id' => $order->id,
            'status' => $order->status,
            'amount' => $order->amount,
            'paid_at' => $order->paid_at,
        ]);
    }
}
