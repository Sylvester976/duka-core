<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\Tenant;

class PlatformOverviewController extends Controller
{
    public function index()
    {
        $platformEarnings = Payout::query()->where('status', 'paid')->sum('platform_fee');

        return response()->json([
            'tenants_total' => Tenant::query()->count(),
            'tenants_active' => Tenant::query()->where('status', 'active')->count(),
            'tenants_suspended' => Tenant::query()->where('status', 'suspended')->count(),
            'platform_earnings_total' => number_format((float) $platformEarnings, 2, '.', ''),
            'pending_payouts' => Payout::query()->whereIn('status', ['pending', 'processing'])->count(),
        ]);
    }
}
