<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder): void {
            if ($tenantId = static::resolveTenantId()) {
                $builder->where($builder->qualifyColumn('tenant_id'), $tenantId);
            }
        });

        static::creating(function ($model): void {
            if (is_null($model->tenant_id) && $tenantId = static::resolveTenantId()) {
                $model->tenant_id = $tenantId;
            }
        });
    }

    protected static function resolveTenantId(): ?string
    {
        if (app()->bound('currentTenant')) {
            return app('currentTenant')?->id;
        }

        return Auth::user()?->tenant_id;
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
