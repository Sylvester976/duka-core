<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    private const VALID_STATUSES = ['pending', 'paid', 'failed', 'expired'];

    public function index(Request $request)
    {
        return Order::query()
            ->when(
                in_array($request->query('status'), self::VALID_STATUSES, true),
                fn ($query) => $query->where('status', $request->query('status')),
            )
            ->latest()
            ->paginate();
    }

    public function show(Order $order)
    {
        return response()->json($order->load('items.product', 'payout'));
    }
}
