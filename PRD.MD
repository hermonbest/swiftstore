# PRD: SwiftStore — Multi‑Tenant E‑commerce Platform

## 1. Overview
SwiftStore is a SaaS e‑commerce platform enabling merchants to launch hosted storefronts (merchantname.swiftstore.com) with inventory, payments, and real‑time features.

## 2. Goals & Success Metrics
- Goal: Enable merchants to create a live store in < 10 minutes.
- Goal: Reliable multi‑tenant routing (subdomain per store).
- Success metrics: Time-to-first-product, conversion rate, avg. page load < 200ms.

## 3. Personas
- Merchant: small/medium business owner who lists products and manages orders.
- Customer: shopper who browses storefronts and completes purchases.

## 4. Core Features (High Level)
- Merchant Dashboard: onboarding, product CRUD, inventory, discounts, analytics, order management, PDF receipts.
- Storefront: subdomain routing, product catalog, cart, checkout (Startbutton), persistent cart, real‑time chat.
- Admin/Platform: RBAC via Clerk, multi‑tenant middleware, file storage integration.

## 5. User Flows (Key Paths)
- Merchant Onboarding: Sign up (Clerk) → Create Store (name, subdomain, currency) → Dashboard.
- Add Product: Create product with images, variants, stock → Publish.
- Customer Purchase: Visit subdomain → Add to cart → Checkout → Pay via Startbutton → Thank You + PDF receipt.
- Merchant Notification: Real‑time notification on successful sale.

## 6. Tech Stack
- Frontend: Next.js 14+ (App Router), Tailwind CSS, Shadcn UI
- Auth: Clerk (Google/social + RBAC)
- Database: PostgreSQL (Neon/Supabase)
- ORM: Prisma
- Payments: Startbutton Africa
- Realtime: Pusher / Socket.IO
- Files: UploadThing or Cloudinary

## 7. Data Model (summary)
All tenant data includes `storeId` except `User`.
- User, Store, Product, ProductVariant, Discount, Customer, Order, OrderItem, ChatMessage.

## 8. Architecture Notes
- Middleware (`middleware.ts`) handles subdomain routing and rewrites to storefront or dashboard.
- Use a single Postgres DB with `storeId` scoping and database indexes for tenant queries.
- Prisma as the single source of truth for schema and migrations.

## 9. Development Roadmap — Phases, Deliverables and Steps

**Phase 1 — Foundation (env, auth, db)**
- Deliverables: Next.js app, Clerk integration (dev keys), Prisma schema & DB connection, Tailwind setup.
- Steps:
	1. Initialize Next.js app with App Router and TypeScript.
	2. Add Clerk auth skeleton and test sign-in flows.
	3. Finalize Prisma schema and create initial migration.
	4. Add Tailwind + global styles.
	5. Provide `.env.example` and README run steps.
- Acceptance: Merchant can sign up and see a placeholder dashboard; DB migrations succeed.

**Phase 2 — Merchant Dashboard (product & store management)**
- Deliverables: Create store flow, product CRUD, variant support, imag e uploads (dev stub).
- Steps:
	1. Build multi‑step Create Store UI and subdomain availability check.
	2. Implement Product model pages (list, create, edit, delete).
	3. Add ProductVariant CRUD and stock field updates.
	4. Wire image upload integration (UploadThing or stubbed S3/Cloudinary).
	5. Implement inventory decrement on order (stub order flow).
- Acceptance: Merchant creates store and product with variants; product appears in storefront dev route.

**Phase 3 — Multi‑tenancy & Routing**
- Deliverables: Middleware routing, tenant context, per‑store data isolation pattern.
- Steps:
	1. Implement `middleware.ts` to detect subdomain and rewrite requests.
	2. Create tenant context provider (server + client) to resolve `storeId` from host.
	3. Secure API routes to require matching `storeId` scopes.
	4. Add tests for routing and data isolation.
- Acceptance: Requests to `aisha.swiftstore.com` return Aisha's storefront; dashboard under app domain.

**Phase 4 — Storefront & Checkout**
- Deliverables: Public catalog, cart persistence, checkout integration with Startbutton.
- Steps:
	1. Build storefront product listing and product detail pages.
	2. Implement persistent cart (LocalStorage + server fallback).
	3. Integrate Startbutton payment flow and webhook handler.
	4. Generate order record on payment success and show Thank You page.
- Acceptance: End-to-end purchase flow completes in staging (test payments), orders created.

**Phase 5 — Payments, Receipts & Notifications**
- Deliverables: PDF receipts, merchant notifications, order lifecycle updates.
- Steps:
	1. Generate PDF receipts using `react-pdf` or server-side renderer.
	2. Send transactional emails (receipt) and show in-app notifications.
	3. Implement order status updates (Pending → Shipped → Delivered).
- Acceptance: Customer receives PDF receipt; merchant sees real‑time sale notification.

**Phase 6 — Real‑time Chat & Analytics**
- Deliverables: Floating chat, analytics dashboard (basic charts).
- Steps:
	1. Implement chat messaging using Pusher or Socket.IO; persist messages.
	2. Add analytics endpoints (daily revenue, orders) and basic chart components.
	3. Optimize for scale and add rate limits where needed.
- Acceptance: Chat works in staging; analytics renders accurate trends for sample data.

**Phase 7 — Hardening & Launch**
- Deliverables: Observability, backups, secrets rotation, domain setup flow, billing.
- Steps:
	1. Add logging, metrics, and error tracking (Sentry/Datadog).
	2. Add DB backups and migrations runbook.
	3. Implement custom domain onboarding and SSL provisioning.
	4. Prepare billing and pricing plans for merchants.
- Acceptance: Platform ready for alpha merchants; runbook validated.

## 10. Milestones & Timeline (example)
- Month 0–1: Phase 1 complete
- Month 1–2: Phase 2 complete
- Month 2–3: Phase 3 & 4 (alpha)
- Month 3–4: Phase 5 & 6 (beta)
- Month 4–5: Phase 7 (launch readiness)

## 11. Risks & Mitigations
- Risk: Tenant data leakage — Mitigation: strict `storeId` scoping and integration tests.
- Risk: Payment edge cases per region — Mitigation: test Startbutton webhooks and error handling.
- Risk: Image storage costs — Mitigation: optional CDN + compressed images + usage quotas.

## 12. Next Actions (short term)
1. Confirm priority MVP features (minimum product set for merchant onboarding + checkout).
2. Finalize Prisma schema and run initial migration in dev.
3. Implement middleware and basic tenant context.

---
Updated PRD with phases and actionable steps. Use this as the roadmap for sprints and tickets.