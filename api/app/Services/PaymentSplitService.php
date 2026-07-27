<?php

namespace App\Services;

class PaymentSplitService
{
    /**
     * @return array{gross_amount: float, platform_fee: float, net_amount: float}
     */
    public function split(float $amount, float $platformFeePercent): array
    {
        $platformFee = round($amount * $platformFeePercent / 100, 2);
        $netAmount = round($amount - $platformFee, 2);

        return [
            'gross_amount' => $amount,
            'platform_fee' => $platformFee,
            'net_amount' => $netAmount,
        ];
    }
}
