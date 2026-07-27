<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_msisdn' => '2547'.fake()->numerify('########'),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'status' => 'pending',
        ];
    }
}
