<?php

namespace App\Services\Mpesa;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DarajaClient
{
    public function __construct(
        private readonly string $env,
        private readonly string $consumerKey,
        private readonly string $consumerSecret,
        private readonly string $shortcode,
        private readonly string $passkey,
        private readonly string $callbackUrl,
        private readonly string $b2cInitiator,
        private readonly string $b2cSecurityCredential,
        private readonly string $b2cResultUrl,
        private readonly string $b2cTimeoutUrl,
    ) {}

    /**
     * Initiate an STK Push prompt on the payer's phone.
     */
    public function stkPush(string $phone, float $amount, string $accountReference, string $transactionDesc): array
    {
        $timestamp = now()->format('YmdHis');

        $response = $this->client()->post('/mpesa/stkpush/v1/processrequest', [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $this->password($timestamp),
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => (int) round($amount),
            'PartyA' => $phone,
            'PartyB' => $this->shortcode,
            'PhoneNumber' => $phone,
            'CallBackURL' => $this->callbackUrl,
            'AccountReference' => $accountReference,
            'TransactionDesc' => $transactionDesc,
        ]);

        return $this->handle($response);
    }

    /**
     * Send a B2C payout to the given phone number.
     */
    public function b2c(string $phone, float $amount, string $remarks, ?string $occasion = null): array
    {
        $response = $this->client()->post('/mpesa/b2c/v1/paymentrequest', [
            'InitiatorName' => $this->b2cInitiator,
            'SecurityCredential' => $this->b2cSecurityCredential,
            'CommandID' => 'BusinessPayment',
            'Amount' => (int) round($amount),
            'PartyA' => $this->shortcode,
            'PartyB' => $phone,
            'Remarks' => $remarks,
            'QueueTimeOutURL' => $this->b2cTimeoutUrl,
            'ResultURL' => $this->b2cResultUrl,
            'Occasion' => $occasion ?? '',
        ]);

        return $this->handle($response);
    }

    /**
     * Fetch (and cache) an OAuth access token, valid ~1hr on Daraja.
     */
    public function accessToken(): string
    {
        return Cache::remember("mpesa:{$this->env}:access_token", now()->addMinutes(55), function () {
            $response = Http::baseUrl($this->baseUrl())
                ->withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->get('/oauth/v1/generate', ['grant_type' => 'client_credentials']);

            if ($response->failed() || ! $response->json('access_token')) {
                throw new DarajaRequestException('Failed to obtain Daraja access token: '.$response->body());
            }

            return $response->json('access_token');
        });
    }

    private function client()
    {
        return Http::baseUrl($this->baseUrl())
            ->acceptJson()
            ->withToken($this->accessToken());
    }

    private function baseUrl(): string
    {
        return $this->env === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    private function password(string $timestamp): string
    {
        return base64_encode($this->shortcode.$this->passkey.$timestamp);
    }

    private function handle(Response $response): array
    {
        if ($response->failed()) {
            throw new DarajaRequestException('Daraja request failed: '.$response->body());
        }

        return $response->json();
    }
}
