<?php

namespace Tests\Unit\Services\Mpesa;

use App\Services\Mpesa\DarajaClient;
use App\Services\Mpesa\DarajaRequestException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DarajaClientTest extends TestCase
{
    private function client(): DarajaClient
    {
        return new DarajaClient(
            env: 'sandbox',
            consumerKey: 'test-key',
            consumerSecret: 'test-secret',
            shortcode: '174379',
            passkey: 'test-passkey',
            callbackUrl: 'https://example.test/callbacks/stk',
            b2cInitiator: 'test-initiator',
            b2cSecurityCredential: 'test-credential',
            b2cResultUrl: 'https://example.test/callbacks/b2c/result',
            b2cTimeoutUrl: 'https://example.test/callbacks/b2c/timeout',
        );
    }

    public function test_access_token_is_fetched_once_and_cached(): void
    {
        Http::fake([
            'sandbox.safaricom.co.ke/oauth/v1/generate*' => Http::response([
                'access_token' => 'abc123',
                'expires_in' => '3599',
            ]),
        ]);

        $client = $this->client();

        $this->assertSame('abc123', $client->accessToken());
        $this->assertSame('abc123', $client->accessToken());

        Http::assertSentCount(1);
    }

    public function test_access_token_throws_when_daraja_rejects_the_request(): void
    {
        Http::fake([
            'sandbox.safaricom.co.ke/oauth/v1/generate*' => Http::response(['error' => 'invalid_client'], 400),
        ]);

        $this->expectException(DarajaRequestException::class);

        $this->client()->accessToken();
    }

    public function test_stk_push_sends_the_expected_payload_and_returns_the_response(): void
    {
        Http::fake([
            'sandbox.safaricom.co.ke/oauth/v1/generate*' => Http::response(['access_token' => 'abc123']),
            'sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest' => Http::response([
                'MerchantRequestID' => '123-456',
                'CheckoutRequestID' => 'ws_CO_1',
                'ResponseCode' => '0',
                'ResponseDescription' => 'Success. Request accepted for processing',
                'CustomerMessage' => 'Success. Request accepted for processing',
            ]),
        ]);

        $result = $this->client()->stkPush('254712345678', 1500, 'ORDER-1', 'Order #1');

        $this->assertSame('ws_CO_1', $result['CheckoutRequestID']);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
                && $request['BusinessShortCode'] === '174379'
                && $request['PartyA'] === '254712345678'
                && $request['Amount'] === 1500
                && $request->hasHeader('Authorization', 'Bearer abc123');
        });
    }

    public function test_stk_push_throws_when_daraja_rejects_the_request(): void
    {
        Http::fake([
            'sandbox.safaricom.co.ke/oauth/v1/generate*' => Http::response(['access_token' => 'abc123']),
            'sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest' => Http::response(['errorMessage' => 'Bad request'], 400),
        ]);

        $this->expectException(DarajaRequestException::class);

        $this->client()->stkPush('254712345678', 1500, 'ORDER-1', 'Order #1');
    }

    public function test_b2c_sends_the_expected_payload_and_returns_the_response(): void
    {
        Http::fake([
            'sandbox.safaricom.co.ke/oauth/v1/generate*' => Http::response(['access_token' => 'abc123']),
            'sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest' => Http::response([
                'ConversationID' => 'conv-1',
                'OriginatorConversationID' => 'orig-1',
                'ResponseCode' => '0',
                'ResponseDescription' => 'Accept the service request successfully.',
            ]),
        ]);

        $result = $this->client()->b2c('254712345678', 1450, 'Payout for order #1');

        $this->assertSame('conv-1', $result['ConversationID']);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'
                && $request['PartyB'] === '254712345678'
                && $request['Amount'] === 1450
                && $request['InitiatorName'] === 'test-initiator';
        });
    }
}
