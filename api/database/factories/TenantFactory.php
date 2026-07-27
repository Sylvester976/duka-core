<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'slug' => fake()->unique()->slug(2),
            'status' => 'active',
            'brand_primary' => fake()->hexColor(),
            'platform_fee_percent' => 2.5,
            'monthly_fee' => 1000,
        ];
    }
}
