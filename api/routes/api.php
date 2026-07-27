<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Dashboard\OrderController;
use App\Http\Controllers\Dashboard\ProductController;
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
