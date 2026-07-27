<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->platformAdmin()->create([
            'name' => 'Platform Admin',
            'email' => 'admin@dukacore.test',
        ]);

        $tenant = Tenant::factory()->create([
            'name' => 'Test Business',
            'slug' => 'test-business',
            'brand_primary' => '#16A34A',
        ]);

        User::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Test Owner',
            'email' => 'owner@test-business.test',
            'role' => 'owner',
        ]);

        Product::factory()->count(6)->create([
            'tenant_id' => $tenant->id,
        ]);
    }
}
