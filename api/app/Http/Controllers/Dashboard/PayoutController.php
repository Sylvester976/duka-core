<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    private const SORTABLE = ['gross_amount', 'net_amount', 'platform_fee', 'status', 'created_at'];

    public function index(Request $request)
    {
        return $this->applySort(Payout::query()->with('order'), $request, self::SORTABLE)->paginate();
    }
}
