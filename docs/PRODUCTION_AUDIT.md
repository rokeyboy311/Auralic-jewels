# Aurelic Jewels / Aurelic Jewels — MASTER PRODUCTION AUDIT REPORT

**Date of Audit**: August 20, 2026  
**Auditor**: Lead Software Architect, Senior Full-Stack & Security Engineer  
**System Scope**: Next.js 15+ Frontend (Vercel), Express REST API Backend (Render), PostgreSQL (Neon), Authentication, Stripe Payments, Atelier Concierge Chat Desk, International Currency & Logistics, SEO, Security, and Future 3D GLB Integration.

---

## EXECUTIVE SUMMARY & AUDIT SCORECARD

| Dimension | Initial State | Production Severity | Target Post-Fix State |
| :--- | :--- | :--- | :--- |
| **Architecture & Separation** | Partial Express API with Next.js in-memory route duplicates | **HIGH** | Single authoritative Express REST API with full Next.js client integration |
| **Database & Persistence** | DDL schema exists; several runtime flows fallback to in-memory store | **CRITICAL** | 100% PostgreSQL-backed with ACID transactions, row locking, and migration scripts |
| **Authentication & Tokens** | Google OAuth simulated on client; password tokens lack server verify | **CRITICAL** | Real Google OAuth server token verification, bcrypt hashing, and HttpOnly JWT sessions |
| **Role-Based Access Control** | Client checks `user.role === 'admin'`; backend missing granular RBAC | **CRITICAL** | Strict server-side RBAC (SUPER_ADMIN, ADMIN, ATELIER_STAFF, CUSTOMER) + resource ownership |
| **Payments & Order Integrity** | Client creates simulated PaymentIntent; amounts not server-recalculated | **CRITICAL** | Server-side price recalculation, Stripe Payment Element, webhook signatures & idempotency |
| **Atelier Concierge Chat Desk** | UI exists; messages and tickets stored in memory without ownership checks | **HIGH** | PostgreSQL-backed conversations, participant verification, staff assignment, attachments |
| **International Commerce** | Multi-currency matrix exists; historical exchange rates not locked in orders | **HIGH** | Historical rate snapshots on orders, multi-tier tax & duties engine, armored courier logistics |
| **Brand Identity** | Inconsistencies between Aurelic Jewels, Aurelic Jewels, and domainname.com | **MEDIUM** | Single canonical brand configuration (`Aurelic Jewels / Aurelic Jewels`) |
| **Future 3D Compatibility** | Schema columns exist; no WebGL bloat before required | **LOW** (Compliant) | Clean schema and TypeScript interfaces ready for Three.js/GLB model URLs |

---

## A. WORKING FEATURES
1. **Curated Luxury Editorial UI (`/`, `/shop`, `/collections`, `/product/[slug]`)**:
   - High-jewellery aesthetic, typography, and responsive layout.
   - Dynamic variant selection (metal alloy, purity, size, stone).
   - Multi-currency switcher with live calculation.
2. **Dynamic Cart & Drawer (`context/CartContext.tsx`, `components/CartDrawer.tsx`)**:
   - Client-side state persistence, slide-out drawer, coupon discount computation.
3. **Wishlist Context (`context/WishlistContext.tsx`)**:
   - Wishlist toggling and transfer to shopping bag.
4. **Policy & Educational Dossiers**:
   - `/jewellery-guide` (GIA 4Cs & untreated gemstone guide).
   - `/size-guide` (International ring and collar sizing).
   - `/materials-care` (18K/22K gold and platinum maintenance).
   - `/shipping-policy`, `/returns-refunds`, `/privacy-policy`, `/terms-conditions`, `/contact`, `/faq`.

---

## B. PARTIALLY IMPLEMENTED FEATURES
1. **Google OAuth Authentication (`context/AuthContext.tsx`, `app/api/auth/google`)**:
   - *Current Behavior*: Client sends simulated payload or email to backend without server-side verification of Google ID token.
   - *Why Problem*: Anyone can impersonate any email address by issuing arbitrary POST requests.
2. **Atelier Concierge Chat Desk (`components/AtelierConciergeChat.tsx`, `/admin`)**:
   - *Current Behavior*: UI is feature-rich, but messages are stored in memory or non-relational store without foreign-key constraints and participant ownership enforcement.
3. **Bespoke Commissions Brief Generator (`/custom-jewellery`)**:
   - *Current Behavior*: Submits form data, sends email if configured, but lacks persistent database record linking to customer ID and ticket sequence.
4. **Armored Valuables Logistics Tracker (`/track-order`)**:
   - *Current Behavior*: Looks up orders in in-memory store; fails when connecting to external Render database.

---

## C. BROKEN FEATURES
1. **Duplicate Business Logic Between Next.js API Routes & Express Backend**:
   - *Current Behavior*: `/app/api/orders`, `/app/api/conversations`, and `/app/api/admin` contain legacy fallback code relying on `lib/db/store.ts` instead of routing through the authoritative PostgreSQL backend.
   - *Severity*: **CRITICAL**.
2. **Order Payment Verification Without Server Price Validation**:
   - *Current Behavior*: Total order amount calculated on the client can be manipulated prior to checkout payload dispatch.
   - *Severity*: **CRITICAL**.

---

## D. MISSING FEATURES
1. **Granular Staff Permissions (SUPER_ADMIN vs ADMIN vs ATELIER_STAFF)**:
   - Atelier staff should only have access to customer chat conversations, bespoke consultation briefs, and relevant order details, not financial coupon settings or destructive user operations.
2. **Verified Buyer Review Enforcement**:
   - Server must check if the authenticated user has a completed order containing the reviewed product SKU.
3. **Audit Log Table & Logger Middleware**:
   - Administrative mutations (status updates, price changes, role assignments) must be recorded in an `audit_logs` table.
4. **Password Reset Flow with Secure Token Hashing**:
   - Dedicated password reset endpoints with time-limited hashed tokens.

---

## E. SECURITY VULNERABILITIES

### 1. Insecure Google Sign-In Simulation
- **File**: `context/AuthContext.tsx` & `app/api/auth/google/route.ts`
- **Classification**: **CRITICAL**
- **Current Behavior**: Client defaults email to `customer@domain.com` or takes raw email from request body and generates a session.
- **Why Problem**: Allows full account takeover by submitting any victim's email address.
- **Required Correction**: Server-side Google ID Token verification via Google API / tokeninfo endpoint, ensuring token signature and audience match `GOOGLE_CLIENT_ID`.
- **Verification**: Attempt login with forged Google token payload; confirm server rejects request with 401 Unauthorized.

### 2. Client-Trust Price & Tax Vulnerability
- **File**: `app/api/orders/route.ts` & `backend/src/routes/api.routes.ts`
- **Classification**: **CRITICAL**
- **Current Behavior**: The order total is accepted from `req.body.totalUSD` without server-side recalculation against database product prices.
- **Why Problem**: Malicious client can modify product prices or tax to $0.01 in the payload.
- **Required Correction**: Server must fetch product SKU from PostgreSQL, multiply by quantity, apply validated coupon, calculate taxes/shipping based on shipping address, and compute the definitive authoritative total.
- **Verification**: Send order payload with modified unit price; verify server overwrites client total with database-backed recalculated total.

### 3. Missing Conversation Ownership Check (IDOR)
- **File**: `app/api/conversations/[id]/route.ts`
- **Classification**: **HIGH**
- **Current Behavior**: Any user providing a conversation ID can view or post messages to that ticket.
- **Why Problem**: Customers can view other customers' private bespoke jewelry designs, addresses, and chat threads.
- **Required Correction**: Server must verify `conversation.user_id === authenticatedUser.id` OR `authenticatedUser.role IN ('admin', 'superadmin', 'atelier_staff')`.
- **Verification**: Query conversation ID belonging to User A while authenticated as User B; verify HTTP 403 Forbidden.

---

## F. ARCHITECTURE PROBLEMS
1. **Single Source of Truth Violation**:
   - *Problem*: Simultaneous existence of `lib/db/store.ts` (in-memory) and `backend/src/db/connection.ts` (PostgreSQL).
   - *Correction*: Lock all production workflows to PostgreSQL via the Express REST API; update `lib/api.ts` to seamlessly route all calls through `NEXT_PUBLIC_API_URL` (or proxy in development).

---

## G. DATABASE PROBLEMS
1. **Missing Inventory Concurrency Locking**:
   - *Problem*: High-value bespoke items with limited stock (e.g. 1-of-1 Solitaire Emerald Ring) can be double-purchased during simultaneous checkout.
   - *Correction*: Wrap order creation in a PostgreSQL transaction with `SELECT stock FROM products WHERE id = $1 FOR UPDATE` to decrement inventory safely.
2. **Missing Historical Order Snapshot**:
   - *Problem*: If an admin updates a product price from $12,000 to $15,000, previously placed orders should not recalculate or reflect the new price.
   - *Correction*: Ensure `order_items` stores frozen immutable snapshots of `unit_price_usd`, `metal_type`, `purity`, `stone_type`, and `size`.

---

## H. AUTHENTICATION & I. AUTHORIZATION PROBLEMS
1. **Role Verification on Client Only**:
   - *Problem*: Front-end redirects users based on `user?.role === 'admin'`, but the API endpoints did not enforce role-based middleware universally.
   - *Correction*: Implement `requireAuth`, `requireAdmin`, and `requireStaff` middleware on all backend Express endpoints.

---

## J. PAYMENT PROBLEMS
1. **Unverified Payment Status Update**:
   - *Problem*: Order marked as `paid` if client redirected to success page without checking Stripe webhook or PaymentIntent status.
   - *Correction*: Orders remain in `pending` or `payment_pending` state until Stripe Webhook signature is validated or server confirms `intent.status === 'succeeded'`.

---

## K. DEPLOYMENT BLOCKERS
1. **CORS Whitelist & API URL Misconfiguration**:
   - *Problem*: Hardcoded localhost or misconfigured headers preventing Vercel frontend from communicating with Render backend.
   - *Correction*: Configure dynamic CORS in `backend/src/app.ts` reading `FRONTEND_URL` and allow Vercel preview domains (`https://*.vercel.app`).

---

## L. INTERNATIONAL JEWELLERY REQUIREMENTS
1. **Currency Exchange Rate Freezing**:
   - *Problem*: Historical order totals must store the exchange rate used at the exact moment of acquisition.
   - *Correction*: Add `exchange_rate_used` and `currency` columns in `orders` table.

---

## M. PERFORMANCE & N. SEO
1. **JSON-LD Structured Data**:
   - *Problem*: Product pages lacked comprehensive Schema.org `Product`, `Offer`, `Brand`, and `BreadcrumbList` structured data.
   - *Correction*: Inject JSON-LD microdata into `app/product/[slug]/page.tsx` for Google Rich Snippets.

---

## O. UX & P. DATA CLEANUP
1. **Canonical Brand Standardization**:
   - Standardize all references to **Aurelic Jewels** / **Aurelic Jewels** across `brandConfig.ts`, navigation, meta tags, and transactional emails.

---

## Q. FUTURE 3D SHOWROOM COMPATIBILITY
1. **Database & Schema Readiness**:
   - Keep `model_url`, `model_thumbnail`, and `has_3d_model` fields in the schema and TypeScript types, ready for future Three.js / `@react-three/fiber` integration without altering the database schema.
