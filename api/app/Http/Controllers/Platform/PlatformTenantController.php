<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTenantStatusRequest;
use App\Models\Payout;
use App\Models\Tenant;

class PlatformTenantController extends Controller
{
    public function index()
    {
        return Tenant::query()
            ->withCount('orders')
            ->withSum(['payouts as net_remitted' => fn ($query) => $query->where('status', 'paid')], 'net_amount')
            ->latest()
            ->paginate();
    }

    public function show(Tenant $tenant)
    {
        $remittance = Payout::query()
            ->where('tenant_id', $tenant->id)
            ->selectRaw('status, count(*) as count, sum(net_amount) as net_total, sum(platform_fee) as fee_total')
            ->groupBy('status')
            ->get();

        return response()->json([
            'tenant' => $tenant,
            'orders_count' => $tenant->orders()->count(),
            'remittance' => $remittance,
        ]);
    }

    public function updateStatus(UpdateTenantStatusRequest $request, Tenant $tenant)
    {
        $tenant->update($request->validated());

        return response()->json($tenant);
    }
}
