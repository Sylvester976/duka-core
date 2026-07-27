<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->tenant_id) {
            abort(403, 'This route requires a tenant-scoped user.');
        }

        return $next($request);
    }
}
