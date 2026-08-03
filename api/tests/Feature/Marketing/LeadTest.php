<?php

namespace Tests\Feature\Marketing;

use App\Mail\LeadSubmitted;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_submitting_a_lead_persists_it_and_emails_platform_admins(): void
    {
        Mail::fake();

        $admin = User::factory()->platformAdmin()->create();

        $response = $this->postJson('/api/leads', [
            'name' => 'Jane Trader',
            'email' => 'jane@example.com',
            'company' => 'Jane Traders Ltd',
            'message' => 'We want a bespoke storefront for 50 branches.',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('leads', [
            'name' => 'Jane Trader',
            'email' => 'jane@example.com',
            'company' => 'Jane Traders Ltd',
        ]);

        Mail::assertQueued(LeadSubmitted::class, function (LeadSubmitted $mail) use ($admin) {
            return $mail->hasTo($admin->email) && $mail->lead->email === 'jane@example.com';
        });
    }

    public function test_lead_submission_requires_name_email_and_message(): void
    {
        $response = $this->postJson('/api/leads', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    public function test_no_mail_is_sent_when_there_are_no_platform_admins(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/leads', [
            'name' => 'Jane Trader',
            'email' => 'jane@example.com',
            'message' => 'We want a bespoke storefront.',
        ]);

        $response->assertCreated();
        Mail::assertNothingSent();
    }
}
