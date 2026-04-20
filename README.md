# duka-core 🛒

> A multi-tenant SaaS commerce platform built for the Kenyan market.
> Businesses get their own branded online store, M-Pesa payments, and KRA eTIMS-compliant receipts — all from one platform.

---

## Why This Exists

I built duka-core to deeply understand how **real money moves through software**.

Not fake stripe test cards. Not tutorial demos. Real M-Pesa. Real KRA tax invoices. Real async payment flows where a customer taps confirm on their phone and your system has to wait, verify, split, and remit — all without losing a single shilling.

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

composer install
cp .env.example .env
php artisan key:generate

# Configure your .env with DB, Redis, M-Pesa, and eTIMS credentials

php artisan migrate
php artisan db:seed   # creates a test business

php artisan serve
php artisan queue:work  # run in a separate terminal
```

Visit `http://localhost:8000/shop/test-business` to see the first storefront.

---

## M-Pesa Setup (Daraja Sandbox)

1. Sign up at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app and get `Consumer Key` + `Consumer Secret`
3. Use the sandbox shortcode `174379` and passkey from the portal
4. Run ngrok: `ngrok http 8000` — use the HTTPS URL as your callback base URL
5. Set `MPESA_ENV=sandbox` in `.env`

---

## eTIMS Setup (KRA Sandbox)

1. Sign up at [etims-sbx.kra.go.ke](https://etims-sbx.kra.go.ke) with a test KRA PIN
2. Submit a Service Request for OSCU device registration
3. Email `timsupport@kra.go.ke` — Subject: `"Request for OSCU Sandbox Test Credentials - [Company] - PIN: [PIN]"`
4. Store the returned device serial and credentials in your business record
5. Set `ETIMS_ENV=sandbox` in `.env`

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
