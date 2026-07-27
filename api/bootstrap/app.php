<?php

use App\Http\Middleware\EnsureUserHasTenant;
use App\Http\Middleware\ResolveTenantFromSlug;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // No login page exists (API-only). Without this, Laravel's default
        // guest-redirect middleware config falls back to route('login'),
        // which doesn't exist, turning every unauthenticated request into a
        // 500 instead of a 401 whenever the client omits an explicit
        // Accept: application/json header.
        $middleware->redirectGuestsTo(fn () => null);

        $middleware->throttleApi();

        $middleware->alias([
            'tenant.user' => EnsureUserHasTenant::class,
            'tenant.slug' => ResolveTenantFromSlug::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API-only app: there is no login page or Blade view to redirect to,
        // so every exception (including unauthenticated 401s) must render as
        // JSON — otherwise Laravel tries to redirect to a nonexistent 'login'
        // named route for any request that doesn't send Accept: application/json.
        $exceptions->shouldRenderJsonWhen(fn () => true);
    })->create();
