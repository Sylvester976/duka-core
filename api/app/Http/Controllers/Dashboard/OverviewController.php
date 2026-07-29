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
        $yesterday = Carbon::yesterday();

        $todayRevenue = (float) Order::query()
            ->where('status', 'paid')
            ->whereDate('paid_at', $today)
            ->sum('amount');

        $yesterdayRevenue = (float) Order::query()
            ->where('status', 'paid')
            ->whereDate('paid_at', $yesterday)
            ->sum('amount');

        $ordersToday = Order::query()
            ->whereDate('created_at', $today)
            ->count();

        $ordersYesterday = Order::query()
            ->whereDate('created_at', $yesterday)
            ->count();

        $pendingPayouts = Payout::query()
            ->whereIn('status', ['pending', 'processing'])
            ->count();

        $netToday = (float) Payout::query()
            ->where('status', 'paid')
            ->whereDate('paid_at', $today)
            ->sum('net_amount');

        $netYesterday = (float) Payout::query()
            ->where('status', 'paid')
            ->whereDate('paid_at', $yesterday)
            ->sum('net_amount');

        return response()->json([
            'today_revenue' => number_format($todayRevenue, 2, '.', ''),
            'orders_today' => $ordersToday,
            'pending_payouts' => $pendingPayouts,
            'net_today' => number_format($netToday, 2, '.', ''),
            'today_revenue_change_pct' => $this->percentChange($todayRevenue, $yesterdayRevenue),
            'orders_today_change_pct' => $this->percentChange((float) $ordersToday, (float) $ordersYesterday),
            'net_today_change_pct' => $this->percentChange($netToday, $netYesterday),
        ]);
    }

    /**
     * Day-over-day percent change, or null when it can't be expressed
     * meaningfully (growth from a zero baseline) — never a fabricated number.
     */
    private function percentChange(float $current, float $previous): ?float
    {
        if ($previous === 0.0) {
            return $current === 0.0 ? 0.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
