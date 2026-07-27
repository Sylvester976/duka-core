<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Dashboard\OrderController;
use App\Http\Controllers\Dashboard\ProductController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\OrderStatusController;
use App\Http\Controllers\Storefront\StorefrontController;
use App\Http\Controllers\Webhooks\MpesaB2cResultController;
use App\Http\Controllers\Webhooks\MpesaB2cTimeoutController;
use App\Http\Controllers\Webhooks\MpesaStkCallbackController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['ok' => true]));

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::middleware('tenant.user')->prefix('dashboard')->name('dashboard.')->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::get('/orders', [OrderController::class, 'index']);
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
