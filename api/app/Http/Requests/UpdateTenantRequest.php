<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Deliberately excludes platform_fee_percent, monthly_fee, and status —
     * those are platform-admin-only levers. A tenant owner must never be able
     * to change their own take-rate or unsuspend themselves via this endpoint.
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'brand_primary' => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'brand_logo_url' => ['nullable', 'url'],
            'mpesa_shortcode' => ['nullable', 'string', 'max:20'],
            'mpesa_b2c_msisdn' => ['nullable', 'regex:/^254[71]\d{8}$/'],
        ];
    }
}
