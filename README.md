# duka-core 🛒

A multi-tenant SaaS commerce platform built for the Kenyan market. Businesses get their own branded online store, M-Pesa payments (money in via STK Push, money out via B2C), and automatic revenue splitting — all from one platform.

Built in public as a learning project about **how real money actually moves through software**. Not fake Stripe test cards. Real M-Pesa. Real async payment flows where a customer taps confirm on their phone and the system has to wait, verify, split, and remit — without losing a single shilling.

---

## What it does

Each business (tenant) on the platform gets:

- **A branded storefront** — logo, brand color, custom URL slug
- **Product management** — add, edit, remove products/services
- **M-Pesa STK Push checkout** — customer pays, system waits for confirmation
- **Automatic payouts** — platform takes its cut, business receives the rest via M-Pesa B2C
- **A business dashboard** — orders, payout ledger, revenue at a glance

The platform owner earns a monthly fee per business plus a percentage of every transaction — split and remitted automatically.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Data fetching | TanStack Query + Axios |
| Backend | Laravel 12 (PHP 8.3), API-only |
| Auth | Laravel Sanctum |
| Database | PostgreSQL |
| Cache + Queues | Redis |
| Payments | M-Pesa Daraja API (STK Push + B2C) |
| Deployment | Render |

> **Note:** This is a rewritten stack. The frontend is now a decoupled React SPA (previously Blade). KRA eTIMS tax invoicing has been removed and is out of scope. See `ARCHITECTURE.md` and `DESIGN.md` for the full spec.

---

## Architecture at a glance

```
[ React SPA ]  ──JSON──▶  [ Laravel API ]  ──▶  [ PostgreSQL ]
  storefront                   │                 [ Redis (queues) ]
  dashboard                    │                 [ M-Pesa Daraja ]
```

Two async round trips define the system:

1. **Collect:** STK Push → customer confirms on phone → Daraja callback → order marked paid.
2. **Payout:** split computed → B2C request → Daraja result callback → payout marked complete.

Full detail in **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**. Visual system in **[`DESIGN.md`](./DESIGN.md)**.

---

## Running it yourself

### Requirements
- PHP 8.3+, Composer
- Node.js 20+
- PostgreSQL
- Redis
- ngrok (for local M-Pesa callback testing)

### Backend

```bash
git clone https://github.com/YOUR_USERNAME/duka-core.git
cd duka-core/api

composer install
cp .env.example .env
php artisan key:generate

# Fill in your .env — DB, Redis, M-Pesa (see below)

php artisan migrate
php artisan db:seed          # creates a platform admin + a test business

php artisan serve            # API on http://localhost:8000
php artisan queue:work       # separate terminal — processes payout jobs
```

### Frontend

```bash
cd duka-core/web

npm install
cp .env.example .env         # set VITE_API_BASE_URL=http://localhost:8000/api

npm run dev                  # SPA on http://localhost:5173
```

Visit `http://localhost:5173/shop/test-business` to see the first storefront.

### M-Pesa credentials (sandbox)

You need Daraja sandbox values in your API `.env`:

1. Create an account at **developer.safaricom.co.ke** and add a new app (check *Lipa Na M-Pesa Sandbox* + *M-Pesa Sandbox*).
2. Copy the **Consumer Key** and **Consumer Secret**.
3. From **developer.safaricom.co.ke/test_credentials**, copy the sandbox **Shortcode** (typically `174379`), **Passkey**, and the B2C **Initiator** + **Security Credential**.
4. Run ngrok so Daraja can reach your local callbacks:

```bash
ngrok http 8000
```

Then set the callback URLs in `.env` to your ngrok URL:

```
MPESA_CALLBACK_URL=https://xxxx.ngrok.io/api/webhooks/mpesa/stk
MPESA_B2C_RESULT_URL=https://xxxx.ngrok.io/api/webhooks/mpesa/b2c/result
MPESA_B2C_TIMEOUT_URL=https://xxxx.ngrok.io/api/webhooks/mpesa/b2c/timeout
```

> ngrok issues a new URL each session — update `.env` when it changes.

Full env reference is in `ARCHITECTURE.md`.

---

## Repo layout

```
duka-core/
  api/          Laravel 12 API
  web/          React + Vite frontend
  ARCHITECTURE.md
  DESIGN.md
  README.md
```

---

## Contributing

Contributions are welcome — this is a learning project, so clear, well-explained PRs are valued as much as clever ones.

### Ground rules

1. **Read `ARCHITECTURE.md` and `DESIGN.md` first.** They are the source of truth. PRs that contradict the architecture (e.g. re-adding eTIMS, moving totals to the client, bypassing tenant scoping) will be asked to change.
2. **Money code gets extra scrutiny.** Anything touching payments, splits, or callbacks must preserve the invariants below and ship with tests.
3. **Small, focused PRs.** One concern per PR. A payout bugfix and a UI refactor are two PRs.

### The invariants (do not break these)

- **Tenant isolation:** no query in a tenant context may return another tenant's rows. Don't sidestep the `BelongsToTenant` global scope without an explicit, reviewed reason.
- **Idempotency:** `mpesa_txn_id` and `mpesa_b2c_txn_id` are UNIQUE. A replayed callback must never double-pay or double-remit.
- **Server-authoritative amounts:** order totals are always recomputed from product prices on the server. Never trust client-sent prices.
- **One payout per paid order.**
- **Callbacks are untrusted input** — validate before acting.

### Workflow

1. Fork the repo and create a branch: `feat/short-description` or `fix/short-description`.
2. Make your change. Keep the diff tight.
3. **Add or update tests** for anything money-related. Idempotency tests (replay each callback twice, assert no double-effect) are mandatory for callback changes.
4. Run the checks locally before pushing:
   ```bash
   # api/
   php artisan test
   ./vendor/bin/pint          # PHP formatting (Laravel Pint)

   # web/
   npm run lint
   npm run test               # if tests present
   npm run build              # must build clean
   ```
5. Open a PR against `main`. Fill in the PR description: what changed, why, and how you tested it.

### Commit style

Conventional commits keep the history readable:

```
feat: add B2C timeout handling to ProcessRemittance
fix: dedupe STK callbacks on webhook_events before status update
docs: clarify tenant resolution in ARCHITECTURE
refactor: extract split math into PaymentSplitService
test: add idempotency test for replayed B2C result
```

### Code style

- **PHP:** PSR-12 via Laravel Pint. Thin controllers, logic in services/jobs. Type-hint everything.
- **TypeScript:** strict mode on. No `any` without a comment justifying it. Server state through TanStack Query, not ad-hoc `useEffect` fetches.
- **UI:** follow `DESIGN.md`. One primary CTA per screen, tabular money, designed states for every async wait. PRs that reintroduce the anti-patterns listed there will be flagged.

### What makes a great PR here

Because this is a learning project, a strong PR explains its reasoning. If you fixed a subtle race in the payout flow, say what the race was and how you closed it. That write-up is part of the value.

### Reporting issues

Open an issue with: what you expected, what happened, steps to reproduce, and (for payment issues) the relevant `webhook_events` / order / payout state with any secrets redacted. **Never paste real credentials, live M-Pesa transaction data, or customer phone numbers into an issue.**

---

## Project status

Built in public as a learning exercise. The core patterns — multi-tenancy, async M-Pesa collect + payout, automatic splits — apply to almost any Kenyan SaaS product (ride-hailing, clinic bookings, school fees, property fees). The commerce layer is just the implementation.

## Security

If you find a vulnerability — especially anything that could misroute money or leak another tenant's data — please report it privately to the maintainer rather than opening a public issue.
