<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'slug',
    'status',
    'mpesa_shortcode',
    'mpesa_b2c_msisdn',
    'brand_primary',
    'brand_logo_url',
    'platform_fee_percent',
    'monthly_fee',
])]
class Tenant extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'platform_fee_percent' => 'decimal:2',
            'monthly_fee' => 'decimal:2',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }
}
