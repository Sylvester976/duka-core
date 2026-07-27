<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantFromSlug
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Tenant::where('slug', $request->route('slug'))->firstOrFail();

        app()->instance('currentTenant', $tenant);

        return $next($request);
    }
}
