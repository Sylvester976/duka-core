<?php

namespace App\Providers;

use App\Services\Mpesa\DarajaClient;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(DarajaClient::class, fn () => new DarajaClient(
            env: config('services.mpesa.env'),
            consumerKey: config('services.mpesa.consumer_key'),
            consumerSecret: config('services.mpesa.consumer_secret'),
            shortcode: config('services.mpesa.shortcode'),
            passkey: config('services.mpesa.passkey'),
            callbackUrl: config('services.mpesa.callback_url'),
            b2cInitiator: config('services.mpesa.b2c_initiator'),
            b2cSecurityCredential: config('services.mpesa.b2c_security_credential'),
            b2cResultUrl: config('services.mpesa.b2c_result_url'),
            b2cTimeoutUrl: config('services.mpesa.b2c_timeout_url'),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip().'|'.$request->input('email'));
        });

        RateLimiter::for('leads', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });
    }
}
