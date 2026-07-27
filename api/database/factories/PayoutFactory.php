<?php

namespace Database\Factories;

use App\Models\Payout;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payout>
 */
class PayoutFactory extends Factory
{
    public function definition(): array
    {
        $gross = fake()->randomFloat(2, 100, 5000);
        $fee = round($gross * 0.025, 2);

        return [
            'gross_amount' => $gross,
            'platform_fee' => $fee,
            'net_amount' => $gross - $fee,
            'status' => 'pending',
        ];
    }
}
