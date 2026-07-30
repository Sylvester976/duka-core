# duka-core — Design System & UI Direction

> **Design brief for Claude Code.** Adopt this persona while building every screen:
>
> *You are the most ruthless, conversion-obsessed startup founder and UI/UX designer alive. You've scaled 3 SaaS products past $10M ARR. You've studied every pixel of Stripe, Linear, Vercel, and Raycast — Stripe above all: clean whites, soft gradients, geometric rounded accents, effortless trust. You can spot a vibe-coded AI project from 50 feet away. Your only goal: make every single visitor start a free trial.*
>
> Every pixel earns its place or gets cut. No default Bootstrap look. No emoji-as-design. If it looks like a template, it's wrong.

There are **three distinct surfaces** with different jobs. Do not blur them.

1. **The public marketing site** (`/`) — job: convert a cold visitor into a signup. Stripe-grade polish: hero, clear product story, the 2-plan pricing section.
2. **The storefront** (public, customer-facing per tenant) — job: get a stranger from landing to *M-Pesa confirmed* in the fewest taps. Mobile-first, thumb-reachable, trust-signalling.
3. **The dashboard / platform admin** (private, business-owner-facing) — job: dense, fast, keyboard-friendly control panel. Stripe-grade clarity.

---

## 1. Design principles (non-negotiable)

1. **One primary action per screen.** The eye should land on it in under one second. Everything else is quieter.
2. **Speed is a feature you can see.** Optimistic UI, skeletons over spinners, instant feedback on tap. Nothing feels like it's "loading a page."
3. **Trust or die.** This is real money in Kenya. Show the M-Pesa mark, the exact amount, the business name, and a clear state at every step. Ambiguity kills conversion.
4. **Mobile is the product, not a breakpoint.** Most storefront traffic is a phone on mobile data. Design the 375px view first, then let it breathe on desktop.
5. **No decoration without a job.** Every border, shadow, and color communicates state or hierarchy. If you can't name its job, delete it.
6. **Restraint reads as premium.** Lots of whitespace, one accent color, tight type. Confidence, not clutter.

---

## 2. Visual language

### Color
A clean, Stripe-inspired palette: cool-white/light-blue backgrounds, plenty of negative space, one confident indigo accent. The accent on the **storefront** is the tenant's brand color (dynamic, chosen in Settings). The accent on the **dashboard/platform admin/marketing site** is a fixed indigo — so an arbitrary tenant hex never has to carry an entire dense admin UI.

```
/* Unified tokens (dashboard, platform admin, marketing site, storefront chrome) */
--bg:            #F6F9FC
--surface:       #FFFFFF
--surface-2:     #F3F6FA
--border:        #E3E8EE
--text:          #0A2540
--text-muted:    #425466
--text-subtle:   #8792A2
--brand:         #635BFF   /* fixed indigo accent */
--brand-hover:   #514AE0
--brand-contrast: #FFFFFF
--danger:        #DF1B41
--warning:       #FF9E2C
--success:       #24B47E
--radius:        8px       /* buttons, cards, inputs */
--radius-lg:     16px      /* modals, sheets, slide-overs */
```

```
/* Storefront only — brand is injected per-tenant at runtime, overriding the indigo default */
:root {
  --brand: <tenant.brand_primary>;   /* set via JS on load */
  --brand-contrast: <computed>;      /* white or near-black for legibility on brand */
}
```

Tailwind reads these via `@theme inline` in `web/src/index.css` (Tailwind v4, no separate config file):
```css
@theme inline {
  --color-brand: var(--brand);
  --color-surface: var(--surface);
  /* ... */
}
```

**Rules:** exactly one accent in view at a time. On the dashboard/platform/marketing site it's always indigo — never the tenant color. On the storefront it's the tenant's brand color, reserved for the primary CTA and success states — never for decoration. Backgrounds stay cool and light (a soft vertical gradient on `body`, not a flat fill); danger/warning/success stay clear and legible, never muddy.

### Typography
- **Everything:** `Inter` (weights 400/500/600/700) — one geometric sans family, no serif. Hierarchy comes from weight and size, not a font pairing.
- **Scale (dashboard):** 12 / 13 / 14 (base) / 16 / 20 / 24 / 32. Body is 14, not 16 — density matters.
- **Storefront/marketing** runs slightly larger (16 base) because it's touch, one-handed, and often in sunlight.
- **Weights:** 400 body, 500 UI labels, 600-700 headings (real weight contrast does the emphasis work a serif used to).
- **Numbers:** tabular figures for all money (`font-variant-numeric: tabular-nums`) so amounts don't jitter.
- **Money format:** always `KES 1,499.00` — currency prefix, thousands separators, 2 decimals, tabular.

### Spacing & layout
- 4px base grid. Use 8/12/16/24/32/48.
- Generous whitespace. Cramped = cheap.
- Max content width on dashboard tables ~1200px; storefront checkout column ~440px (one-thumb).

### Depth
- Soft and geometric. Cards, buttons, and elevated surfaces get a **subtle, low-opacity shadow** (`--shadow-sm`) plus a hairline border — depth is gentle, never heavy or skeuomorphic.
- Radius **8px** on cards/buttons/inputs, **16px** on modals/sheets/slide-overs — rounded, confident, consistent. Fully rounded (`rounded-full`) on pills/badges/switches.

### Motion
- Fast and functional: 120–180ms ease-out for most, spring for the cart/checkout sheet.
- Never animate for delight alone. Animate to show *where a thing came from* or *that state changed*.
- Respect `prefers-reduced-motion`.

---

## 3. Component standards

**Buttons**
- Primary: solid `--brand` fill, `--brand-contrast` text, 600 weight, `--radius`, subtle `--shadow-sm` lift, full-width on mobile CTAs. One per screen.
- Secondary: 1px `--border`, transparent, `--text` label.
- Ghost/tertiary: text only, for low-priority actions.
- Loading state: label swaps to a spinner + verb ("Sending STK Push…"), button stays same size (no layout shift), stays disabled.
- Min tap target 44px on storefront.

**Inputs**
- Shared `Input` component (`web/src/components/ui/Input.tsx`): label above field, 1px `--border`, `--radius`, focus switches border to `--brand` — hairline only, no glow/ring.
- Phone input for MSISDN: format/mask to `07XX XXX XXX`, validate to Safaricom format, show the error inline the moment it's wrong — not on submit.

**Cards** — `--surface` on `--bg`, 1px `--border`, `--radius`, subtle `--shadow-sm`; hover raises the shadow slightly (dashboard) or lifts further (storefront product).

**Tables (dashboard)** — dense rows (40–44px), tabular numbers, sticky header, row hover, right-aligned money columns, status as a `Badge`.

**Badges (status)** — soft-filled tinted pills (`rounded-full`, ~10% tint background of the status color, same color text, uppercase tracked label). Shared status vocabulary, same everywhere:
| State | Color | Label |
|---|---|---|
| pending / processing | `--warning` ochre | "Pending" / "Processing" |
| paid / success | `--success` sage | "Paid" |
| failed | `--danger` brick | "Failed" |
| expired | `--text-subtle` | "Expired" |

**Toasts** — bottom on mobile, top-right on desktop. Auto-dismiss success; persist errors until dismissed.

**Empty states** — never a blank screen. One line explaining what goes here + the primary action ("Add your first product").

**Skeletons** — for any list/table load. Match final layout so nothing jumps.

---

## 4. The storefront (conversion machine)

This is where the money is won or lost. Optimize ruthlessly.

**Store page**
- Above the fold on a phone: business logo + name, a trust line ("Pay securely with M-Pesa"), and product grid immediately visible. No hero carousel, no fluff.
- Product card: image, name, price (the price is the loudest thing after the image), single "Add" affordance. Tap adds to cart with a subtle count animation.

**Cart → Checkout (the critical path)**
- Cart is a **bottom sheet**, not a new page — the customer never loses the store context.
- Checkout is **one screen, one field mentally:** confirm items, enter/confirm M-Pesa number, one giant primary button: **"Pay KES X,XXX with M-Pesa."**
- The amount is repeated on the button. No surprise totals. No hidden fees shown to the customer.
- Tapping pay → button enters loading ("Sending request to your phone…") → a clear, calm waiting state: *"Check your phone. Enter your M-Pesa PIN to confirm KES X,XXX to {Business}."* with an animated pulse, not a dead spinner.

**Order status (the async wait — where trust is made or broken)**
- Three explicit states, each unmistakable:
  - **Waiting** — "Waiting for your confirmation…" + reassurance it's safe to enter the PIN. Poll quietly.
  - **Paid** — big green check, "Payment received. Thank you!", the amount, business name, and an order reference. This is the dopamine moment — make it feel earned and clean.
  - **Failed / expired** — calm, non-alarming, one-tap "Try again" that returns them to the same cart.
- Never leave the customer staring at an ambiguous screen. Every second of the async wait has a designed state.

**Conversion rules for the storefront**
- Kill every step that isn't paying. No account creation to buy. No email capture before purchase.
- Reduce the checkout to: cart → phone number → pay. That's it.
- The M-Pesa green + the exact amount on the button do the persuasion. Trust signals over sales copy.

---

## 5. The dashboard (control panel)

Stripe-grade clarity. Fast, dense, keyboard-aware.

- **Shell:** slim left sidebar (Overview, Products, Orders, Payouts, Settings), tenant name + logo at top, minimal.
- **Overview:** a tight row of stat cards (Today's revenue, Orders, Pending payouts, Net after platform fee), then a recent-orders table. Numbers are the hero. Tabular, calm.
- **Products:** table + a slide-over panel to add/edit (not a full page nav). Inline active/inactive toggle.
- **Orders:** filterable table, status badges, drill into an order for its items + payment timeline.
- **Payouts:** the money-out ledger — gross, platform fee, net, status, M-Pesa B2C ref. This is the trust surface for the business owner; make the split legible at a glance.
- **Settings:** branding (color picker → live-preview the storefront theme), M-Pesa payout number, business profile.

**Dashboard rules**
- Density over decoration. A business owner checking takings on their phone wants the number in one glance.
- Every destructive action confirms. Every async action shows optimistic state + reconciles on response.
- `⌘K` command menu if time allows (Linear-style) — jump to any screen, search orders.

---

## 6. Anti-patterns (auto-reject in review)

- Gradient heroes with no restraint — a soft, subtle gradient is the house style now (Stripe-grade), but it must stay quiet: no loud rainbow meshes, no gradient text, no gradient on more than one hero surface per screen.
- Emoji used as iconography in the UI (fine in docs, never in product chrome).
- Dead spinners with no context during the M-Pesa wait.
- Bootstrap default components left unstyled.
- Money rendered without currency, separators, or as jittery non-tabular figures.
- More than one primary CTA competing in a viewport.
- Checkout that adds steps (accounts, upsells) between cart and pay.
- Full-page navigations where a sheet/slide-over would keep context.
- Layout shift on button loading states.

---

## 7. Accessibility & reality checks
- Contrast ≥ 4.5:1 for text; verify tenant brand colors against `--brand-contrast` at runtime and fall back if a chosen brand color fails.
- 44px minimum tap targets on storefront.
- Works on a mid-range Android in Chrome on 3G. Test the checkout path there mentally before shipping any screen.
- `prefers-reduced-motion` respected everywhere.

The bar: a first-time visitor on a cheap phone should understand *what to do*, *how much*, and *that it's safe* — and complete payment — without ever feeling uncertain. That's the whole design.
