<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:tenants,slug'],
            'brand_primary' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'platform_fee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'monthly_fee' => ['required', 'numeric', 'min:0'],
            'mpesa_shortcode' => ['nullable', 'string', 'max:20'],
            'mpesa_b2c_msisdn' => ['nullable', 'regex:/^254[71]\d{8}$/'],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'email', 'unique:users,email'],
            'owner_password' => ['required', 'string', 'min:8'],
        ];
    }
}
