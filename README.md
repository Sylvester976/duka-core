# duka-core 🛒

> A multi-tenant SaaS commerce platform built for the Kenyan market.
> Businesses get their own branded online store, M-Pesa payments, and KRA eTIMS-compliant receipts — all from one platform.

---

## Why This Exists

I built duka-core to deeply understand how **real money moves through software**.

Not fake Stripe test cards. Not tutorial demos. Real M-Pesa. Real KRA tax invoices. Real async payment flows where a customer taps confirm on their phone and your system has to wait, verify, split, and remit — all without losing a single shilling.

This project is intentionally about learning. Every part of it — the multi-tenancy, the payment splits, the webhook security, the eTIMS integration — was chosen because it represents a real-world engineering problem worth solving properly.

If you're a Kenyan developer who wants to understand how commerce platforms actually work under the hood, this is for you.

---

## What It Does

duka-core is a platform where you can add multiple businesses (tenants), each getting:

- 🏪 **Their own branded storefront** — logo, colors, custom URL slug
- 🛍️ **Product management** — add, edit, remove products/services
- 💳 **M-Pesa STK Push payments** — customer pays, system waits for confirmation
- 💸 **Automatic payouts** — platform takes its cut, business gets the rest via M-Pesa B2C
- 🧾 **KRA eTIMS receipts** — every sale generates a KRA-compliant tax invoice with QR code
- 📊 **Business dashboard** — orders, payout history, tax invoice log

The platform owner earns a monthly fee per business and a percentage of every transaction — collected and remitted automatically.

---

## What You'll Learn From This Codebase

| Concept | Where It Lives |
|---|---|
| Multi-tenancy (shared DB, isolated data) | `BelongsToTenant` trait + Global Scopes |
| Async payment flow (STK Push → callback) | `PaymentController` + `ProcessRemittance` job |
| Money splitting and auto-remittance | `PaymentSplitService` + M-Pesa B2C |
| Idempotency (preventing double charges) | `mpesa_txn_id` UNIQUE constraint + status checks |
| Webhook security | Callback validation logic |
| KRA eTIMS tax invoice generation | `EtimsService` + `SubmitEtimsInvoice` job |
| Background job queues and retry logic | Laravel Queues + Redis |
| Per-tenant branding via CSS variables | `storefront/layout.blade.php` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 (PHP 8.3) |
| Database | PostgreSQL |
| Cache + Queues | Redis |
| Frontend | Blade templates + Bootstrap 5 |
| Payments | M-Pesa Daraja API (STK Push + B2C) |
| Tax Compliance | KRA eTIMS OSCU API |
| Deployment | Render |

---

## Architecture

```
[ Customer Browser ]
        |
  /shop/{business-slug}
        |
[ Laravel App ]
   |        |        |
[PostgreSQL] [Redis] [M-Pesa Daraja]
                          |
                   [KRA eTIMS OSCU]
```

Every payment goes through two async flows:
1. **STK Push → Callback** — customer confirms, your server is notified
2. **B2C Payout → Callback** — business receives their share automatically

---

## Running It Yourself

### Requirements
- PHP 8.3+
- PostgreSQL
- Redis
- Composer
- ngrok (for local M-Pesa callback testing)

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/duka-core.git
cd duka-core

composer install        # installs all dependencies from composer.json
cp .env.example .env    # copy the environment template
php artisan key:generate

# Fill in your .env — see the credentials sections below

php artisan migrate
php artisan db:seed     # creates a test business

php artisan serve
php artisan queue:work  # run in a separate terminal — processes background jobs
```

Visit `http://localhost:8000/shop/test-business` to see the first storefront.

---

## Getting Your Credentials

### M-Pesa Daraja API (Sandbox)

You need four values for your `.env`:
`MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`

**Step 1 — Create a developer account**
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Click **Sign Up** — register as an individual or company
3. Verify your email address and log in

**Step 2 — Create a sandbox app**
1. Click **My Apps** in the top navigation
2. Click **Add a New App**
3. Give it a name (e.g. `duka-core-dev`)
4. Check both APIs:
   - ✅ **Lipa Na M-Pesa Sandbox**
   - ✅ **M-Pesa Sandbox**
5. Click **Create App**

**Step 3 — Copy your Consumer Key and Secret**
1. Click on your newly created app
2. You will see **Consumer Key** and **Consumer Secret** displayed
3. Copy both into your `.env`:
   ```env
   MPESA_CONSUMER_KEY=xxxxxxxxxxxxxxxx
   MPESA_CONSUMER_SECRET=xxxxxxxxxxxxxxxx
   ```

**Step 4 — Get your Shortcode and Passkey**
1. Go to [developer.safaricom.co.ke/test_credentials](https://developer.safaricom.co.ke/test_credentials) while logged in
2. You will see a full list of sandbox test values. Find:
   - **Business Short Code** → use as `MPESA_SHORTCODE` (typically `174379`)
   - **Lipa Na Mpesa Online Passkey** → use as `MPESA_PASSKEY`
   - **Initiator Name (Shortcode 1)** → use as `MPESA_B2C_INITIATOR`
   - **Security Credential (Shortcode 1)** → use as `MPESA_B2C_SECURITY_CREDENTIAL`

> All sandbox credentials are pre-set by Safaricom. You do not create them yourself — you just copy them from this page.

**Step 5 — Set up ngrok**

M-Pesa sends payment results to a public URL. ngrok gives your local machine one temporarily:

```bash
# Download from https://ngrok.com/download then:
ngrok http 8000
```

Copy the `https://xxxx.ngrok.io` URL and update your `.env`:
```env
MPESA_CALLBACK_URL=https://xxxx.ngrok.io/api/payments/callback
MPESA_B2C_RESULT_URL=https://xxxx.ngrok.io/api/payments/b2c/result
MPESA_B2C_TIMEOUT_URL=https://xxxx.ngrok.io/api/payments/b2c/timeout
```

> ngrok gives a new URL every time you restart it. Remember to update `.env` each session.

**Your final M-Pesa `.env` block:**
```env
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=xxxxxxxxxxxxxxxx
MPESA_CONSUMER_SECRET=xxxxxxxxxxxxxxxx
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://xxxx.ngrok.io/api/payments/callback
MPESA_B2C_INITIATOR=testapi
MPESA_B2C_SECURITY_CREDENTIAL=xxxxxxxxxxxxxxxx
MPESA_B2C_RESULT_URL=https://xxxx.ngrok.io/api/payments/b2c/result
MPESA_B2C_TIMEOUT_URL=https://xxxx.ngrok.io/api/payments/b2c/timeout
```

---

### KRA eTIMS (Sandbox)

eTIMS is Kenya Revenue Authority's electronic tax invoice system. Every sale must be reported to KRA in real time. Each business on the platform needs their own eTIMS credentials registered under their KRA PIN.

**Step 1 — Sign up on the eTIMS sandbox portal**
1. Go to [etims-sbx.kra.go.ke](https://etims-sbx.kra.go.ke)
2. Click **Sign Up**
3. Select **PIN** as the registration method
4. Enter your test KRA PIN and complete the registration form
5. Verify your phone number and email

> For sandbox testing, you can use any properly formatted test PIN. For production, each business uses their actual registered KRA PIN.

**Step 2 — Submit an OSCU Service Request**
1. Log in to the sandbox portal
2. Click **Service Request** (top right corner)
3. Click **eTIMS** on the dialog that appears
4. The service request form opens. Fill in:
   - **eTIMS Type:** select **OSCU (Online Sales Control Unit)**
   - OSCU is correct for duka-core — it is KRA-hosted and designed for online/API-based systems
5. Submit the form and wait for approval (usually same day in sandbox)

**Step 3 — Email KRA to request sandbox credentials**

After submitting the service request, send this email:

- **To:** timsupport@kra.go.ke
- **Subject:** `Request for OSCU Sandbox Test Credentials - duka-core - PIN: [your PIN]`
- **Body:**
  > I am a developer building a multi-tenant e-commerce platform and need OSCU sandbox credentials to test eTIMS integration. I have submitted a service request on the eTIMS sandbox portal under PIN [your PIN]. Please provide sandbox test credentials and device serial.

KRA will reply with a **device serial number** (e.g. `dvcv1130`) and authentication details. Store the device serial in the `etims_device_serial` column of the `businesses` table for the test business.

**Step 4 — Initialize the OSCU device**

Once you have credentials, run OSCU initialization. The app handles this via `EtimsService::initialize()`:

```bash
php artisan tinker
>>> $business = \App\Models\Business::where('slug', 'test-business')->first();
>>> app(\App\Services\EtimsService::class)->initialize($business);
```

This calls KRA's initialization endpoint and stores the returned `cmc_key` (encrypted) against the business record. This key is required in all subsequent eTIMS API calls.

**Step 5 — Set your eTIMS environment**
```env
ETIMS_ENV=sandbox
```

The app maps this to:
- Sandbox: `https://etims-api-sbx.kra.go.ke`
- Production: `https://etims-api.kra.go.ke`

> **Going to production with eTIMS** requires a 6-phase KRA certification process: Sign Up → Simulation → Automated Testing → KYC Documentation → Verification Meeting → Go Live. For learning purposes, sandbox is sufficient.

---

## Environment Variables Reference

```env
# Application
APP_NAME=duka-core
APP_ENV=local
APP_KEY=                          # generated by: php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dukacore
DB_USERNAME=postgres
DB_PASSWORD=

# Redis (sessions, cache, queues)
REDIS_URL=redis://127.0.0.1:6379
SESSION_DRIVER=redis
SESSION_LIFETIME=120
CACHE_STORE=redis
QUEUE_CONNECTION=redis

# M-Pesa Daraja API
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
MPESA_B2C_INITIATOR=
MPESA_B2C_SECURITY_CREDENTIAL=
MPESA_B2C_RESULT_URL=
MPESA_B2C_TIMEOUT_URL=

# KRA eTIMS
ETIMS_ENV=sandbox

# Platform Admin
PLATFORM_ADMIN_TOKEN=
```

---

## Want to Build Your Own Version?

Fork this repo and adapt it. Some ideas:

- 🚗 **A ride-hailing backend** — replace products with ride requests, payments stay the same
- 🏥 **A clinic booking system** — services instead of products, M-Pesa for deposits
- 🎓 **A school fees platform** — multi-school tenancy, eTIMS for fee receipts
- 🏠 **A property listings platform** — landlords as tenants, viewing fees via M-Pesa

The core patterns — multi-tenancy, async M-Pesa payments, eTIMS compliance, automatic splits — apply to almost any Kenyan SaaS product. The commerce layer is just the implementation.

---

## Project Status

This project is being built in public as a learning exercise. See [BUILD_LOG.md](./BUILD_LOG.md) for a day-by-day account of what was built, what broke, and what was learned — written for a non-technical audience.

---

## License

MIT — use it, fork it, build on it. Credit appreciated but not required.

---

*Built in Nairobi. Inspired by the gap between what Kenyan developers learn in tutorials and what real production systems look like.*
