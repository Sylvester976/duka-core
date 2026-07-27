# duka-core — Architecture

A multi-tenant SaaS commerce platform for the Kenyan market. Businesses get a branded storefront, M-Pesa payments (STK Push in, B2C payout out), and automatic revenue splitting. Built as a learning project focused on how real money actually moves through software.

> This document is the source of truth for Claude Code. Read it fully before generating code. It defines the stack, the boundaries between services, the data model, the money flows, and the non-negotiable invariants.

---

## 1. Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **React 18 + Vite + TypeScript** | SPA, no SSR needed for v1 |
| Styling | **Tailwind CSS** | Design tokens per-tenant via CSS variables |
| State/Data | **TanStack Query** + Axios | Server state via Query; minimal client state |
| Routing | **React Router v6** | Public storefront routes + authed dashboard routes |
| Backend | **Laravel 12 (PHP 8.3)** | API-only. No Blade. Serves JSON. |
| Auth | **Laravel Sanctum** | SPA token auth for dashboard; storefront is public |
| Database | **PostgreSQL** | Shared DB, row-level tenant isolation |
| Cache + Queues | **Redis** | Sessions, cache, and background job queue |
| Payments | **M-Pesa Daraja API** | STK Push (collect) + B2C (payout) |
| Deployment | **Render** | API + Postgres + Redis; static frontend on Render or Vercel |

**Removed from previous version:** KRA eTIMS integration and all associated services, jobs, columns, and env vars. Tax invoicing is out of scope. Do not scaffold it.

**Changed from previous version:** Frontend is now a decoupled React SPA that consumes a JSON API. Laravel no longer renders Blade storefronts.

---

## 2. High-level shape

```
                    ┌─────────────────────────────┐
                    │  React SPA (Vite build)     │
                    │  - Public storefront        │
                    │  - Business dashboard       │
                    └──────────────┬──────────────┘
                                   │ JSON over HTTPS
                                   │ (Sanctum bearer token for dashboard)
                    ┌──────────────▼──────────────┐
                    │  Laravel 12 API             │
                    │  - Tenant resolution        │
                    │  - Orders / Payments        │
                    │  - Split + Payout logic     │
                    └───┬──────────┬──────────┬───┘
                        │          │          │
                 ┌──────▼───┐ ┌────▼───┐ ┌────▼────────┐
                 │PostgreSQL│ │ Redis  │ │ M-Pesa      │
                 │          │ │(queue) │ │ Daraja API  │
                 └──────────┘ └────────┘ └─────────────┘
```

Two async round trips define the system:

1. **Collect:** STK Push → customer confirms on phone → Daraja calls our callback → order marked paid.
2. **Payout:** Split computed → B2C request → Daraja calls our result URL → payout marked complete.

Everything between those callbacks runs on Redis-backed queues so the HTTP request that starts a payment returns immediately.

---

## 3. Multi-tenancy

**Model:** Shared database, shared schema, row-level isolation.

- Every tenant-owned table has a `tenant_id` foreign key.
- A `BelongsToTenant` trait applies a global Eloquent scope so queries are automatically filtered to the current tenant. New records auto-stamp `tenant_id`.
- Tenant is resolved two ways:
  - **Public storefront:** from the URL slug (`/api/shop/{slug}/...`). Resolves the tenant, does *not* require auth.
  - **Dashboard:** from the authenticated user's `tenant_id` (Sanctum). A user belongs to exactly one tenant.
- The **platform owner** (super admin) is not a tenant. Platform-level routes bypass the tenant scope and are gated by an admin ability/token.

**Invariant:** No query in a tenant context may ever return another tenant's rows. The global scope is the enforcement point; never write raw queries that sidestep it without an explicit, reviewed `withoutGlobalScope` call.

---

## 4. Data model

Tables (Postgres). Timestamps (`created_at`, `updated_at`) on all; soft deletes where noted.

### `tenants` (the businesses)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | string | |
| slug | string UNIQUE | storefront URL segment |
| status | enum | `active`, `suspended` |
| mpesa_shortcode | string nullable | business till/paybill for payouts context |
| mpesa_b2c_msisdn | string nullable | phone that receives B2C payout |
| brand_primary | string | hex, drives CSS var |
| brand_logo_url | string nullable | |
| platform_fee_percent | decimal(5,2) | platform's cut per transaction, e.g. 2.50 |
| monthly_fee | decimal(10,2) | fixed monthly platform fee |

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | null for platform super admin |
| name | string | |
| email | string UNIQUE | |
| password | string | |
| role | enum | `owner`, `staff`, `platform_admin` |

### `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | scoped |
| name | string | |
| description | text nullable | |
| price | decimal(10,2) | KES |
| image_url | string nullable | |
| is_active | boolean | |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | scoped |
| customer_msisdn | string | payer phone |
| amount | decimal(10,2) | total |
| status | enum | `pending`, `paid`, `failed`, `expired` |
| mpesa_checkout_request_id | string nullable | from STK Push response |
| mpesa_txn_id | string UNIQUE nullable | from callback; **idempotency key** |
| paid_at | timestamp nullable | |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| product_id | uuid FK | |
| quantity | int | |
| unit_price | decimal(10,2) | snapshot at purchase time |

### `payouts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | scoped |
| order_id | uuid FK | one payout per paid order |
| gross_amount | decimal(10,2) | = order amount |
| platform_fee | decimal(10,2) | computed |
| net_amount | decimal(10,2) | what the business receives |
| status | enum | `pending`, `processing`, `paid`, `failed` |
| mpesa_b2c_txn_id | string UNIQUE nullable | from B2C result |
| paid_at | timestamp nullable | |

### `webhook_events` (audit + idempotency)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| source | enum | `mpesa_stk`, `mpesa_b2c` |
| external_id | string | txn id / request id |
| payload | jsonb | raw callback body |
| processed_at | timestamp nullable | |
| UNIQUE(source, external_id) | | prevents double-processing |

---

## 5. Money flow (the core)

### Collect (STK Push)
1. `POST /api/shop/{slug}/checkout` with cart + payer MSISDN.
2. Create `order` (status `pending`), compute `amount` from item snapshots server-side. **Never trust client-sent prices.**
3. Call Daraja STK Push. Store `mpesa_checkout_request_id`. Return `{ order_id, status: pending }`.
4. Customer confirms on phone. Daraja `POST`s to `MPESA_CALLBACK_URL`.
5. Callback handler:
   - Validate + record in `webhook_events` (dedupe on `source + external_id`).
   - Look up order by `checkout_request_id`.
   - If result code = success and `mpesa_txn_id` not already used → set order `paid`, store `mpesa_txn_id`, set `paid_at`.
   - Dispatch `ProcessRemittance` job.
6. Frontend polls `GET /api/shop/{slug}/orders/{id}/status` (or SSE later) until `paid`/`failed`.

### Payout (B2C split)
`ProcessRemittance` job (queued, retryable):
1. Guard: order is `paid`, no existing `payouts` row (idempotent).
2. Compute split:
   - `platform_fee = round(amount * tenant.platform_fee_percent / 100, 2)`
   - `net_amount = amount - platform_fee`
3. Create `payout` (status `processing`).
4. Call Daraja B2C to `tenant.mpesa_b2c_msisdn` for `net_amount`.
5. Daraja `POST`s to `MPESA_B2C_RESULT_URL`. Handler records event, marks payout `paid`, stores `mpesa_b2c_txn_id`, `paid_at`.
6. On timeout URL or failure result → mark `failed`, leave for retry/manual review.

### Non-negotiable invariants
- **Idempotency:** `mpesa_txn_id` and `mpesa_b2c_txn_id` are UNIQUE. A replayed callback must never double-pay or double-remit. Check `webhook_events` first, then column uniqueness as the backstop.
- **Server-authoritative amounts:** order totals are always recomputed from product prices on the server.
- **One payout per paid order.** Enforced by guard + unique `order_id` on `payouts`.
- **No money math in floats in a way that drifts:** use decimal columns and round explicitly to 2dp at each split.
- **Callbacks are untrusted input:** validate structure, never act on a callback that doesn't map to a known pending order.

---

## 6. Backend structure (Laravel)

```
app/
  Models/            Tenant, User, Product, Order, OrderItem, Payout, WebhookEvent
  Traits/            BelongsToTenant
  Http/
    Controllers/
      Storefront/    StorefrontController, CheckoutController, OrderStatusController
      Dashboard/     ProductController, OrderController, PayoutController, TenantController
      Platform/      PlatformTenantController (admin-gated)
      Webhooks/      MpesaStkCallbackController, MpesaB2cResultController
    Middleware/      ResolveTenantFromSlug, EnsurePlatformAdmin
    Requests/        CheckoutRequest, ProductRequest, ...
  Services/
    Mpesa/           DarajaClient (auth token, STK Push, B2C)
    PaymentSplitService
  Jobs/              ProcessRemittance
routes/
  api.php
```

**Route groups**
- `/api/shop/{slug}/*` → `ResolveTenantFromSlug` middleware, public.
- `/api/dashboard/*` → `auth:sanctum`, tenant from user.
- `/api/platform/*` → `auth:sanctum` + `EnsurePlatformAdmin`.
- `/api/webhooks/mpesa/*` → public, signature/structure validated in controller.

---

## 7. Frontend structure (React)

```
src/
  api/              axios instance, query hooks (useProducts, useCheckout, useOrderStatus)
  routes/
    storefront/     StorePage, ProductGrid, CartDrawer, CheckoutModal, OrderStatus
    dashboard/      Login, Overview, Products, Orders, Payouts, Settings
  components/        ui primitives (Button, Input, Card, Table, Badge, Toast)
  lib/              tenant theming (applyBrandTokens), formatKES, cn()
  App.tsx           router
  main.tsx
```

**Theming:** on storefront load, fetch `GET /api/shop/{slug}` → apply `brand_primary` and `brand_logo_url` by setting CSS custom properties on `:root` (`--brand`, etc.). Tailwind consumes them via `theme.extend.colors.brand = 'var(--brand)'`.

**Auth:** dashboard stores Sanctum token; Axios interceptor attaches it; 401 → redirect to login.

**Data fetching:** all server state through TanStack Query. Checkout kicks off a mutation, then the order-status screen uses a polling query (`refetchInterval`) until terminal state.

See `DESIGN.md` for the visual system.

---

## 8. Environment variables

```
# App
APP_NAME=duka-core
APP_ENV=local
APP_KEY=
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173     # for Sanctum + CORS

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dukacore
DB_USERNAME=postgres
DB_PASSWORD=

# Redis
REDIS_URL=redis://127.0.0.1:6379
SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis

# Sanctum / CORS
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# M-Pesa Daraja
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=174379
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
MPESA_B2C_INITIATOR=
MPESA_B2C_SECURITY_CREDENTIAL=
MPESA_B2C_RESULT_URL=
MPESA_B2C_TIMEOUT_URL=

# Platform admin
PLATFORM_ADMIN_TOKEN=
```

Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 9. Build order (for Claude Code)

Work in this sequence so each layer is testable before the next:

1. **Migrations + models + `BelongsToTenant` trait** — get the schema and tenant scoping right first.
2. **Seeder** — one platform admin, one test tenant (`test-business`), a few products.
3. **Storefront read API** — `GET /api/shop/{slug}`, product listing. Verify tenant isolation.
4. **Auth + dashboard read** — Sanctum login, list products/orders for the authed tenant.
5. **Dashboard product CRUD.**
6. **`DarajaClient` service** — OAuth token, STK Push, B2C. Unit-test with mocked HTTP.
7. **Checkout + STK callback** — the collect flow end to end (use ngrok for callbacks).
8. **`PaymentSplitService` + `ProcessRemittance` + B2C result** — the payout flow.
9. **React storefront** — store page, cart, checkout modal, order-status polling.
10. **React dashboard** — overview, products, orders, payouts, settings.
11. **Platform admin** — tenant management.

**Testing expectation:** every money-touching path gets a test. Idempotency tests are mandatory — replay each callback twice and assert no double-pay/double-remit.

---

## 10. Explicitly out of scope for v1
- KRA eTIMS / tax invoicing (removed).
- Multi-currency (KES only).
- SSR / SEO for storefronts.
- Refunds/reversals (design the schema to allow it later, don't build it).
