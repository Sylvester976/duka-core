<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\Tenant;
use App\Services\Mpesa\DarajaClient;
use App\Services\Mpesa\DarajaRequestException;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(CheckoutRequest $request, DarajaClient $daraja)
    {
        /** @var Tenant $tenant */
        $tenant = app('currentTenant');

        $items = collect($request->validated('items'));

        $products = Product::query()
            ->whereIn('id', $items->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $amount = $items->sum(fn (array $item) => $products[$item['product_id']]->price * $item['quantity']);

        $order = DB::transaction(function () use ($request, $items, $products, $amount) {
            $order = Order::create([
                'customer_msisdn' => $request->validated('customer_msisdn'),
                'amount' => $amount,
                'status' => 'pending',
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $products[$item['product_id']]->price,
                ]);
            }

            return $order;
        });

        try {
            $response = $daraja->stkPush(
                phone: $order->customer_msisdn,
                amount: (float) $order->amount,
                accountReference: $this->accountReference($order),
                transactionDesc: "Payment to {$tenant->name}",
            );
        } catch (DarajaRequestException $e) {
            $order->update(['status' => 'failed']);
            report($e);

            return response()->json([
                'message' => 'Unable to reach M-Pesa right now. Please try again.',
            ], 502);
        }

        $order->update(['mpesa_checkout_request_id' => $response['CheckoutRequestID']]);

        return response()->json([
            'order_id' => $order->id,
            'status' => $order->status,
        ], 201);
    }

    private function accountReference(Order $order): string
    {
        return strtoupper(substr(str_replace('-', '', (string) $order->id), 0, 12));
    }
}
