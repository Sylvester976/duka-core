<?php

namespace Tests\Unit\Services;

use App\Services\PaymentSplitService;
use Tests\TestCase;

class PaymentSplitServiceTest extends TestCase
{
    public function test_it_splits_the_amount_by_the_platform_fee_percent(): void
    {
        $split = (new PaymentSplitService)->split(1000.00, 2.5);

        $this->assertSame(1000.00, $split['gross_amount']);
        $this->assertSame(25.00, $split['platform_fee']);
        $this->assertSame(975.00, $split['net_amount']);
    }

    public function test_it_rounds_the_fee_to_two_decimal_places(): void
    {
        $split = (new PaymentSplitService)->split(999.99, 2.5);

        $this->assertSame(25.0, $split['platform_fee']);
        $this->assertSame(974.99, $split['net_amount']);
    }

    public function test_gross_always_equals_fee_plus_net(): void
    {
        $split = (new PaymentSplitService)->split(1234.56, 3.33);

        $this->assertEqualsWithDelta(
            $split['gross_amount'],
            $split['platform_fee'] + $split['net_amount'],
            0.01,
        );
    }

    public function test_zero_fee_percent_sends_the_full_amount_to_net(): void
    {
        $split = (new PaymentSplitService)->split(500.00, 0);

        $this->assertSame(0.00, $split['platform_fee']);
        $this->assertSame(500.00, $split['net_amount']);
    }
}
