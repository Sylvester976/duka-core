# duka-core — Build Log

> Day-by-day account of building duka-core.
> Each entry has what was built (technical) and what it means (plain English).
> Updated daily throughout the build.

---

## How to Read This

Every entry has two parts:
- **What we did** — the actual technical tasks completed
- **What it means** — a plain-English explanation of what was built and why it matters

This is intentionally written so that someone with no coding background can follow along and understand what a real software project looks like from the inside.

---

## 📅 Timeline Overview

| Phase | Dates | What's Being Built |
|---|---|---|
| Setup | Apr 20–21 | Repo, README, Laravel installation |
| Foundation | Apr 22–26 | Database structure, core models, tenant system |
| Commerce | Apr 27 – May 1 | Shopping cart, checkout, orders |
| Payments | May 4–9 | Real M-Pesa integration, automatic payouts |
| Tax + Admin | May 11–15 | KRA eTIMS receipts, dashboards, final polish |

---

## PRE-START

---

### Monday, April 21 — Project Setup

**Tasks**
- [ ] Install Laravel 12: `composer create-project laravel/laravel duka-core`
- [ ] Configure PostgreSQL database in `.env`
- [ ] Install Redis and test connection
- [ ] Install required packages:
  - `composer require predis/predis` (Redis client)
- [ ] Push initial project to GitHub
- [ ] Create `BUILD_LOG.md` and `GUIDE.md` in repo

**What it means**
> Before any features exist, we set up the kitchen. This is like renting a workspace, buying the tools, and laying out the counter before you start cooking. Laravel is the framework (the recipe book), PostgreSQL is where all the data lives (the storage room), and Redis is a fast scratchpad used for things like shopping carts and background tasks. None of this is visible to anyone yet — it's purely preparation.

---

## WEEK 1 — Foundation (Apr 22–26)

---

### Wednesday, April 22 — The Database Blueprint

**Tasks**
- [ ] Write migrations for all core tables:
  - `businesses` — stores each tenant (business on the platform)
  - `platform_fee_configs` — how much the platform charges each business
  - `products` — each business's products/services
  - `orders` — customer purchases
  - `order_items` — line items on each order
  - `payments` — M-Pesa transaction records
  - `remittances` — payouts to businesses
  - `tax_invoices` — KRA eTIMS records
  - `business_invoice_sequences` — sequential invoice numbering per business
  - `subscription_payments` — monthly platform billing
- [ ] Run `php artisan migrate` — confirm all tables created
- [ ] Commit: `"feat: initial database schema"`

**What it means**
> Today we drew the floor plan of the entire system. Before any data can be stored — no customers, no orders, no payments — we have to define exactly what kind of information the system will remember and how it's all connected. Think of it like designing the filing cabinets and folders before you start collecting documents. Every business on the platform, every product they sell, every order a customer places, and every shilling that moves through the system has a defined home from today.

---

### Thursday, April 23 — Models and Tenant Isolation

**Tasks**
- [ ] Create Eloquent models for all tables
- [ ] Create `BelongsToTenant` trait
- [ ] Apply trait to: `Product`, `Order`, `Payment`, `Remittance`, `TaxInvoice`
- [ ] Write a test query to confirm scoping works:
  - Create two test businesses manually in DB
  - Add a product for each
  - Confirm `Product::all()` without tenant context returns nothing (or all)
  - Confirm `Product::all()` with tenant A in context returns only A's products
- [ ] Commit: `"feat: models and tenant global scope"`

**What it means**
> Today we built the walls between tenants. If Business A and Business B are both on the platform, they must never see each other's products, orders, or customer data. This is non-negotiable — a data leak between tenants would be a serious breach of trust. We implemented this using a system where every database query automatically adds "only show records belonging to the current business" before it runs. The developer doesn't have to remember to do this every time — the system enforces it automatically.

---

### Friday, April 24 — Tenant Middleware + Business Onboarding

**Tasks**
- [ ] Create `ResolveTenant` middleware
  - Reads `{slug}` from URL
  - Looks up the business in DB (caches result in Redis for 5 minutes)
  - Injects `tenant` into the application context
  - Returns 404 if slug not found
- [ ] Register middleware in `bootstrap/app.php`
- [ ] Create `Platform\BusinessController`:
  - `POST /admin/platform/businesses` — create a new business
  - `GET /admin/platform/businesses` — list all businesses
- [ ] Create `Business` model with `api_key` auto-generation on creation
- [ ] Test: create 2 businesses via Postman, verify slugs resolve correctly
- [ ] Commit: `"feat: tenant middleware and business onboarding"`

**What it means**
> Today we built the front door of the platform. When someone visits `/shop/mama-mbogas-store`, the system needs to figure out: does this business exist? What are their colors and logo? Who are they? The middleware is the bouncer — it reads the name in the URL, checks the database, and if the business is real, it sets the context for everything else to work. We also built the ability to add new businesses to the platform, which for now is done by the platform owner through a protected admin endpoint.

---

### Saturday, April 25 — Product Management (Business Admin)

**Tasks**
- [ ] Create `AuthenticateBusiness` middleware (validates `X-API-Key` header)
- [ ] Create `Business\ProductController` with full CRUD:
  - `GET /admin/biz/products` — list products
  - `POST /admin/biz/products` — create product (with `tax_type`, `etims_item_code`)
  - `PUT /admin/biz/products/{id}` — update
  - `DELETE /admin/biz/products/{id}` — delete
- [ ] Test all endpoints via Postman with two different business API keys
- [ ] Confirm: Business A cannot see or edit Business B's products
- [ ] Commit: `"feat: product CRUD with tenant auth"`

**What it means**
> Today each business can manage their own catalogue. Like a shop owner logging into their POS system and adding items to sell — except here it's done through an API using their unique key. We also verified the most important security property: if you have Business A's key, you cannot touch Business B's products. The walls we built on Thursday are doing their job.

---

### Sunday, April 26 — Customer-Facing Storefront

**Tasks**
- [ ] Create Blade layout `storefront/layout.blade.php`:
  - Injects tenant `primary_color` as CSS variable
  - Shows tenant logo and name in navbar
  - Cart item count in header
- [ ] Create `Storefront\ProductController`:
  - `GET /shop/{slug}` → product listing page
  - `GET /shop/{slug}/products/{id}` → single product page
- [ ] Style with Bootstrap 5 — clean, functional, not fancy
- [ ] Test: visit two different slugs, confirm different branding renders
- [ ] Commit: `"feat: storefront product listing with tenant branding"`

**What it means**
> Today duka-core became visible for the first time. Before today, everything was plumbing. Today, a real person can open a browser, visit a URL, and see a business's products with their logo and colors. Each business looks different — different colors, different name, different products — even though they all run on the same underlying platform. This is the same magic that makes Shopify work: one system, many different-looking stores.

---

## WEEK 2 — Cart, Orders, and Fake Payments (Apr 27 – May 1)

---

### Monday, April 27 — Shopping Cart

**Tasks**
- [ ] Create `CartService`:
  - Cart stored in Redis, key scoped to `tenant_id + session_id`
  - Methods: `add()`, `remove()`, `get()`, `total()`, `clear()`
- [ ] Create `Storefront\CartController`:
  - `GET /shop/{slug}/cart`
  - `POST /shop/{slug}/cart/add`
  - `POST /shop/{slug}/cart/remove`
  - `DELETE /shop/{slug}/cart`
- [ ] Create cart Blade view with item list and total
- [ ] Test: add items from two different businesses, confirm carts don't mix
- [ ] Commit: `"feat: Redis-backed tenant-scoped cart"`

**What it means**
> Today customers can pick things up and put them in a basket. The cart is stored in Redis (the fast scratchpad) so it's quick and doesn't clog the main database. Importantly, each cart is tied to both the specific business store you're shopping at AND your browsing session — so if you have items in Business A's cart, visiting Business B's store shows an empty cart. Just like how your Jumia cart and your Glovo cart are separate things.

---

### Tuesday, April 28 — Checkout and Order Creation

**Tasks**
- [ ] Create `Storefront\CheckoutController`:
  - `GET /shop/{slug}/checkout` → checkout form (phone number input)
  - `POST /shop/{slug}/orders` → creates order from cart
- [ ] In order creation:
  - Snapshot product prices into `order_items` (not a reference — a copy)
  - Calculate and store fee split (`platform_fee` + `business_amount`) using `PaymentSplitService`
  - Create `Payment` record with status `initiated`
  - Clear cart after order created
- [ ] Create `Storefront\OrderController`:
  - `GET /shop/{slug}/order/{id}` → order status page (pending/paid/failed)
- [ ] Commit: `"feat: checkout flow and order creation with fee split"`

**What it means**
> Today we connected the cart to a real order. When a customer clicks "Checkout" and enters their phone number, the system freezes the cart into a permanent record — an order. This is like a waiter writing down your food order and handing it to the kitchen. Two important things happen at this moment: (1) prices are copied exactly as they are right now into the order, so even if a product's price changes later, this order remembers what the customer was charged. (2) The platform calculates how much it will keep (its percentage cut) and how much the business will receive — and saves both numbers on the order. This prevents any disputes later about how the money was split.

---

### Wednesday, April 29 — Order Status Page

**Tasks**
- [ ] Polish the order status page:
  - Shows order items, total, and current status (pending / paid / failed)
  - Auto-refreshes every 5 seconds while status is `pending` (simple meta refresh)
  - Shows success message with order number when paid
  - Shows failure message with retry option when failed
- [ ] Add order history page for customers (by phone number lookup)
- [ ] Commit: `"feat: order status page with auto-refresh"`

**What it means**
> Today the order page becomes a live window into what's happening. After checkout, the customer lands on a page that says "Waiting for payment confirmation..." and silently checks every few seconds to see if the status has changed. This is crucial because M-Pesa payments are not instant — there's a gap between when the customer taps confirm on their phone and when the system finds out. The page needs to handle this waiting gracefully without confusing the customer.

---

### Thursday, April 30 — Fake Payment Simulation

**Tasks**
- [ ] Write `PaymentController::callback()` — the M-Pesa callback handler
- [ ] Add validation: check `ResultCode`, look up order, verify not already processed
- [ ] Implement the state change: `pending → paid` or `pending → failed`
- [ ] Test using Postman — manually send a fake M-Pesa callback payload:
  ```json
  {
    "Body": {
      "stkCallback": {
        "ResultCode": 0,
        "CheckoutRequestID": "ws_CO_...",
        "CallbackMetadata": {
          "Item": [
            {"Name": "MpesaReceiptNumber", "Value": "RGX123456"},
            {"Name": "Amount", "Value": 1000}
          ]
        }
      }
    }
  }
  ```
- [ ] Confirm: order status changes to `paid` in the database
- [ ] Test failure scenario: send `ResultCode: 1`, confirm order goes to `failed`
- [ ] Commit: `"feat: payment callback handler (simulated)"`

**What it means**
> Today we learned the most important flow in the entire system — without using real money. We manually sent a fake "payment confirmed" message to our own server (pretending to be M-Pesa) and watched the system respond correctly: finding the right order, marking it as paid, and all the downstream logic flowing from that. This is how every serious developer tests payment systems — you understand the flow completely in simulation before trusting it with real transactions. Think of it like a fire drill: you practice the response before there's an actual fire.

---

### Friday, May 1 — Labour Day (Public Holiday / Buffer Day)

**Use this day to:**
- [ ] Review everything built in Week 2
- [ ] Fix any bugs found during testing
- [ ] Write up the week in BUILD_LOG
- [ ] Make sure the Postman collection is saved and documented
- [ ] Rest if needed — the real complexity starts next week

**What it means**
> A planned pause. Real projects need breathing room — time to check that everything connects properly before adding the next layer. This is not wasted time. Finding a bug in the cart logic now costs 20 minutes. Finding it after real M-Pesa is connected costs hours of confusion about whether the bug is in the cart or in the payment.

---

## WEEK 3 — Real M-Pesa Payments + Auto-Remittance (May 4–9)

---

### Monday, May 4 — MpesaService + STK Push

**Tasks**
- [ ] Register on [developer.safaricom.co.ke](https://developer.safaricom.co.ke) sandbox
- [ ] Create `MpesaService`:
  - `getAccessToken()` — OAuth token from Daraja
  - `stkPush(phone, amount, orderId)` — send payment prompt to customer's phone
- [ ] Wire STK Push into the checkout flow:
  - After order is created → immediately call `stkPush()`
  - Store `CheckoutRequestID` on the payment record
- [ ] Set up ngrok: `ngrok http 8000` — update `MPESA_CALLBACK_URL` in `.env`
- [ ] Test: trigger STK Push to sandbox test phone, confirm prompt appears (simulator)
- [ ] Commit: `"feat: M-Pesa STK Push integration"`

**What it means**
> Today the payment system became real. When a customer clicks "Place Order," their phone now receives an actual M-Pesa prompt asking them to enter their PIN to pay. We're using Safaricom's sandbox (test environment) so no real money moves, but the technical flow is identical to production. ngrok is a tool that gives our laptop a temporary public internet address so that Safaricom's servers can reach our local development machine to send back the payment result — because Safaricom can't knock on the door of a computer sitting behind a home router.

---

### Tuesday, May 5 — Payment Callback Handler (Real)

**Tasks**
- [ ] Update `PaymentController::callback()` for production-level handling:
  - Extract `MpesaReceiptNumber` (the transaction ID)
  - Check UNIQUE constraint on `mpesa_txn_id` (idempotency)
  - Wrap all DB updates in a transaction
  - Dispatch `ProcessRemittance` job (don't await — just queue)
  - Dispatch `SubmitEtimsInvoice` job (don't await — just queue)
- [ ] Add `POST /api/payments/callback` to `routes/api.php` (exempt from CSRF)
- [ ] Test end-to-end with ngrok: place order → phone prompt → confirm → callback fires → order paid
- [ ] Commit: `"feat: production-ready callback handler with job dispatch"`

**What it means**
> Today the feedback loop closed. The customer confirms payment on their phone, M-Pesa sends a message to our server, our server processes it and marks the order paid — all within a few seconds. We also made sure that if M-Pesa sends the same message twice (which does happen in production), the system only processes it once. And we set up two background tasks that will run after the payment: one to pay the business their share, one to submit the tax invoice to KRA. These run separately so a delay in paying the business or submitting to KRA doesn't affect the customer's experience.

---

### Wednesday, May 6 — Full Payment Test + Edge Cases

**Tasks**
- [ ] Test full user journey end-to-end:
  1. Visit storefront → add to cart → checkout → phone prompt → confirm → order paid
- [ ] Test failure case: use sandbox number that simulates declined payment
- [ ] Test duplicate callback: send same callback twice, confirm second is ignored
- [ ] Test timeout: what happens if M-Pesa never sends the callback?
  - Add a 30-minute auto-fail for stuck `pending` orders (scheduled command)
- [ ] Commit: `"feat: edge case handling and timeout cleanup"`

**What it means**
> Today we tried to break what we built. A payment system that works in perfect conditions is not a payment system — it's a demo. Real systems have to handle when Safaricom is slow, when the customer ignores the prompt, when the same notification arrives twice, when the internet drops mid-transaction. Today we tested each of these scenarios and confirmed the system behaves correctly in all of them. This is the difference between software that works and software you can trust.

---

### Thursday, May 7 — B2C Auto-Remittance to Business

**Tasks**
- [ ] Add `b2c_initiator` and `b2c_credential` to `.env` + `config/services.php`
- [ ] Add `b2cPayout(phone, amount, remittanceId)` to `MpesaService`
- [ ] Create `ProcessRemittance` job:
  - Fetch the remittance record
  - Check it hasn't already been sent (idempotency)
  - Call `b2cPayout()` with business's `payout_phone` and `business_amount`
  - Update remittance status to `pending_callback`
  - On failure (3 attempts): mark as `failed`, log error
- [ ] Register queue worker configuration (Redis, `payments` queue)
- [ ] Test: trigger a payment → confirm B2C call fires → check Daraja sandbox logs
- [ ] Commit: `"feat: B2C auto-remittance job"`

**What it means**
> Today the platform starts automatically paying businesses. After every confirmed customer payment, a background task wakes up, calculates how much the business is owed (total minus the platform's cut), and sends that amount directly to the business's M-Pesa. The business doesn't have to request it, invoice it, or wait for a weekly batch transfer — it happens within minutes of every sale. This is the core value proposition of the platform from a business's perspective.

---

### Friday, May 8 — B2C Result Callback + Retry Logic

**Tasks**
- [ ] Create B2C result and timeout callback endpoints:
  - `POST /api/payments/b2c/result` — Safaricom sends payout confirmation here
  - `POST /api/payments/b2c/timeout` — fires if B2C times out
- [ ] Update remittance status to `sent` on success, `failed` on failure
- [ ] Create `RetryFailedRemittances` scheduled job:
  - Runs every 30 minutes
  - Finds remittances with `status = failed` and `attempts < 3`
  - Re-dispatches `ProcessRemittance` for each
- [ ] Register schedule in `routes/console.php`
- [ ] Commit: `"feat: B2C callbacks and retry scheduler"`

**What it means**
> Today we added a safety net under the payout system. B2C transfers can fail — the business's phone might be off, there could be a Safaricom API hiccup, or the network might time out. When that happens, the system doesn't give up. It records the failure and tries again every 30 minutes, up to 3 times. If all 3 attempts fail, the platform admin is alerted so they can investigate manually. No business loses their money silently.

---

### Saturday, May 9 — Full Payment → Remittance Flow Test

**Tasks**
- [ ] End-to-end test of the complete money flow:
  1. Place order
  2. STK Push fires
  3. Customer confirms
  4. Order marked paid
  5. `ProcessRemittance` job runs
  6. B2C fires to business phone
  7. B2C callback confirms
  8. Remittance marked `sent`
- [ ] Verify all records in DB are correct (amounts, statuses, timestamps)
- [ ] Document the flow with actual numbers (e.g. KES 1,000 in → KES 20 platform fee → KES 980 to business)
- [ ] Commit: `"test: full payment to remittance end-to-end verified"`

**What it means**
> Today we followed a single shilling (well, a thousand) from the moment a customer decides to buy something to the moment the business receives their money — and confirmed every step happened correctly. This is the moment the system earns the right to be called a payments platform. Not because the code compiles, but because real money (in sandbox) moved through it cleanly, was split correctly, and landed in the right place.

---

## WEEK 4 — eTIMS + Admin + Polish (May 11–15)

---

### Monday, May 11 — KRA eTIMS Setup + EtimsService

**Tasks**
- [ ] Sign up at `etims-sbx.kra.go.ke` with test KRA PIN
- [ ] Submit OSCU service request, email `timsupport@kra.go.ke`
- [ ] Once credentials received: store `etims_device_serial` on test business
- [ ] Create `EtimsService`:
  - `initialize(business)` — OSCU initialization, stores returned `cmc_key` (encrypted)
  - `submitSalesInvoice(order)` — builds payload, posts to `/trnsSales`
  - `calculateVat(totalInclusive)` — extract VAT from inclusive price
  - `getNextInvoiceNumber(businessId)` — locked DB increment
- [ ] Test initialization against sandbox
- [ ] Commit: `"feat: eTIMS service and OSCU initialization"`

**What it means**
> Today we started connecting to KRA's tax system. In Kenya, every business sale must generate a KRA-recognized receipt. The eTIMS system is how this happens digitally. Each business on our platform has their own KRA credentials, and our system uses those credentials to send invoice data to KRA in real time after every sale. KRA then returns a signed receipt with a QR code that customers can scan to verify the transaction is legitimate and the business is tax compliant. Today we set up the plumbing for this — tomorrow we make it fire automatically.

---

### Tuesday, May 12 — Automatic eTIMS Submission

**Tasks**
- [ ] Create `SubmitEtimsInvoice` job:
  - Checks `etims_enabled` on business before submitting
  - Calls `EtimsService::submitSalesInvoice()`
  - Creates `TaxInvoice` record with KRA response
  - Updates `order.etims_submitted = true` and `order.tax_invoice_no`
  - On failure: logs error, marks invoice as `rejected` — does NOT reverse the payment
  - Handles `cmc_key` rotation (check for new key in response headers)
- [ ] Test: trigger a payment → confirm eTIMS job fires → check `tax_invoices` table
- [ ] Commit: `"feat: async eTIMS invoice submission job"`

**What it means**
> Today tax compliance became automatic. The moment a payment is confirmed, a background task submits the sale to KRA without the business having to do anything. The key design decision: if KRA's system is slow or temporarily down, the payment is not reversed. The customer still gets their goods, and the eTIMS submission retries in the background. Tax compliance and payment confirmation are separate concerns — linking them together would mean a KRA API outage could block real sales, which is unacceptable.

---

### Wednesday, May 13 — KRA Receipt + Business Admin Dashboard

**Tasks**
- [ ] Update order status page to show:
  - KRA invoice number
  - KRA QR code image (from `qr_code_url`)
  - "Verified by KRA" badge when eTIMS submitted
- [ ] Create Business Admin dashboard (`/admin/biz`):
  - Orders list with status filters
  - Payout history (remittances)
  - eTIMS invoice log
  - Branding settings form (upload logo, change color)
- [ ] Protect with `AuthenticateBusiness` middleware
- [ ] Commit: `"feat: KRA receipt on order page and business admin dashboard"`

**What it means**
> Today the receipt became official. After a successful sale, the customer's order page now shows a QR code that, when scanned, connects to KRA's database and confirms the transaction is registered for tax purposes. This is the digital equivalent of the KRA-stamped receipts you get from formal businesses. We also gave businesses their own management window — they can now log in with their API key and see all their orders, payouts, and tax records without needing to contact the platform owner.

---

### Thursday, May 14 — Platform Admin Dashboard + Subscription Billing Stub

**Tasks**
- [ ] Create Platform Admin dashboard (`/admin/platform`):
  - List all businesses with status and subscription info
  - Total platform earnings (sum of all `platform_fee` on paid orders)
  - Remittance overview (sent vs failed)
  - Ability to suspend a business
- [ ] Create basic subscription billing flow:
  - `GET /admin/platform/businesses/{id}/bill` → trigger monthly fee STK Push
  - On payment: create `subscription_payments` record, update `subscription_status = active`
  - On non-payment after 7-day grace: `subscription_status = suspended`
- [ ] Commit: `"feat: platform admin dashboard and subscription billing"`

**What it means**
> Today the platform owner (you) got their own control room. You can see every business running on the platform, how much money has moved through the system, which payouts went through and which failed, and you can suspend a business that hasn't paid their monthly fee. The subscription billing is also wired in — the platform can now send a monthly M-Pesa prompt to each business to collect its fee, and automatically suspend access if they don't pay. This is how SaaS businesses sustain themselves.

---

### Friday, May 15 — Polish, Documentation, and Launch

**Tasks**
- [ ] Error handling audit:
  - What happens if Redis is down? (graceful fallback)
  - What happens if PostgreSQL is slow? (queue timeout handling)
  - What happens if a business's payout phone is invalid? (alert + log)
- [ ] Add rate limiting per tenant (Redis-backed, via middleware)
- [ ] Update `.env.example` with all required variables and comments
- [ ] Final README review — make sure it's clear enough for someone discovering this on GitHub
- [ ] Update BUILD_LOG with final entry
- [ ] Deploy to Render:
  - Web service: `php artisan serve`
  - Worker service: `php artisan queue:work`
  - Run `php artisan migrate --force` on deploy
- [ ] Tag release: `git tag v1.0.0`
- [ ] Commit: `"chore: v1.0.0 — production deploy"`

**What it means**
> Today we shipped. Not a demo, not a prototype — a working multi-tenant SaaS platform with real M-Pesa payments, automatic business payouts, and KRA-compliant tax receipts. The technical features are the obvious output, but the real achievement is more subtle: this project proves that a developer who understands async payment flows, tenant isolation, and regulatory compliance can build the infrastructure that Kenyan businesses run on. That's a different tier of understanding than building a CRUD app, and today we crossed that line.

---

## What Was Learned

*(Fill this in at the end)*

- [ ] Most surprising thing about M-Pesa integration
- [ ] Hardest bug encountered
- [ ] What eTIMS taught us about how tax systems work
- [ ] What multi-tenancy looks like in practice vs in theory
- [ ] What would be done differently in V2

---

*"Keep the system simple. Make the behavior realistic."*
