<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Dashboard\OrderController;
use App\Http\Controllers\Dashboard\OverviewController;
use App\Http\Controllers\Dashboard\PayoutController;
use App\Http\Controllers\Dashboard\ProductController;
use App\Http\Controllers\Dashboard\TenantController;
use App\Http\Controllers\Platform\PlatformOverviewController;
use App\Http\Controllers\Platform\PlatformTenantController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\OrderStatusController;
use App\Http\Controllers\Storefront\StorefrontController;
use App\Http\Controllers\Webhooks\MpesaB2cResultController;
use App\Http\Controllers\Webhooks\MpesaB2cTimeoutController;
use App\Http\Controllers\Webhooks\MpesaStkCallbackController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['ok' => true]));

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::middleware('tenant.user')->prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/overview', [OverviewController::class, 'index']);
        Route::apiResource('products', ProductController::class);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::get('/payouts', [PayoutController::class, 'index']);
        Route::get('/settings', [TenantController::class, 'show']);
        Route::put('/settings', [TenantController::class, 'update']);
    });

    Route::middleware('platform.admin')->prefix('platform')->name('platform.')->group(function () {
        Route::get('/overview', [PlatformOverviewController::class, 'index']);
        Route::get('/tenants', [PlatformTenantController::class, 'index']);
        Route::post('/tenants', [PlatformTenantController::class, 'store']);
        Route::get('/tenants/{tenant}', [PlatformTenantController::class, 'show']);
        Route::patch('/tenants/{tenant}/status', [PlatformTenantController::class, 'updateStatus']);
    });
});

Route::prefix('shop/{slug}')->middleware('tenant.slug')->name('storefront.')->group(function () {
    Route::get('/', [StorefrontController::class, 'show']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/orders/{order}/status', [OrderStatusController::class, 'show']);
});

Route::post('/webhooks/mpesa/stk', MpesaStkCallbackController::class);
Route::post('/webhooks/mpesa/b2c/result', MpesaB2cResultController::class);
Route::post('/webhooks/mpesa/b2c/timeout', MpesaB2cTimeoutController::class);
