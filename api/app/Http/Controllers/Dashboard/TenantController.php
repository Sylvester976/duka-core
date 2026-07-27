<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTenantRequest;
use Illuminate\Support\Facades\Auth;

class TenantController extends Controller
{
    public function show()
    {
        return response()->json(Auth::user()->tenant);
    }

    public function update(UpdateTenantRequest $request)
    {
        $tenant = Auth::user()->tenant;
        $tenant->update($request->validated());

        return response()->json($tenant);
    }
}
