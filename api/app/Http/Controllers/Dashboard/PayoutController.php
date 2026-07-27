<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payout;

class PayoutController extends Controller
{
    public function index()
    {
        return Payout::query()->with('order')->latest()->paginate();
    }
}
