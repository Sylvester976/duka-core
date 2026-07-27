<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Tenant;

class StorefrontController extends Controller
{
    public function show()
    {
        /** @var Tenant $tenant */
        $tenant = app('currentTenant');

        return response()->json([
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'brand_primary' => $tenant->brand_primary,
            'brand_logo_url' => $tenant->brand_logo_url,
            'products' => Product::query()->where('is_active', true)->latest()->get(),
        ]);
    }
}
