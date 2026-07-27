<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->string('mpesa_shortcode')->nullable();
            $table->string('mpesa_b2c_msisdn')->nullable();
            $table->string('brand_primary');
            $table->string('brand_logo_url')->nullable();
            $table->decimal('platform_fee_percent', 5, 2);
            $table->decimal('monthly_fee', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
