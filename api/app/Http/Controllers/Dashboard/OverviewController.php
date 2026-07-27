<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payout;
use Illuminate\Support\Carbon;

class OverviewController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        $todayRevenue = Order::query()
            ->where('status', 'paid')
            ->whereDate('paid_at', $today)
            ->sum('amount');

        $ordersToday = Order::query()
            ->whereDate('created_at', $today)
            ->count();

        $pendingPayouts = Payout::query()
            ->whereIn('status', ['pending', 'processing'])
            ->count();

        $netToday = Payout::query()
            ->where('status', 'paid')
            ->whereDate('paid_at', $today)
            ->sum('net_amount');

        return response()->json([
            'today_revenue' => number_format((float) $todayRevenue, 2, '.', ''),
            'orders_today' => $ordersToday,
            'pending_payouts' => $pendingPayouts,
            'net_today' => number_format((float) $netToday, 2, '.', ''),
        ]);
    }
}
