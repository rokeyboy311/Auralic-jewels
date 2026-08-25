# MASTER PRODUCTION SAFETY AUDIT — Aurelic Jewels

## CRITICAL

1. **Unsecured Admin Backdoor (Hardcoded Passwords & Auto-Role Escalation)**
   - **File:** `backend/src/routes/api.routes.ts` (Lines 115-200)
   - **Problem:** Unconditional acceptance of 'admin123', 'password123', etc. for any user containing 'admin' or 'director' in their email. If 'admin' is in the email, their role in the database is automatically escalated to `admin`.
   - **Production impact:** Anyone can gain full admin access and database control just by using `admin@example.com` and `admin123`.
   - **Security impact:** Complete system compromise.
   - **Recommended fix:** Remove all hardcoded passwords and automatic role upgrades. Verify role and password strictly against PostgreSQL.

2. **Order Transactions Trust Frontend Data & Lack ACID Properties**
   - **File:** `backend/src/routes/api.routes.ts` (POST `/orders`)
   - **Problem:** No `BEGIN`/`COMMIT`/`ROLLBACK` block for order creation. Falls back to frontend-provided prices (`itm.unitPriceUSD`) if product isn't found.
   - **Production impact:** Partial orders can be created if insertion fails midway. Customers can submit orders with forged $0 prices or custom product IDs.
   - **Security impact:** Financial loss, data corruption.
   - **Recommended fix:** Wrap order creation in a PostgreSQL transaction. Reject order entirely if product IDs are invalid. Always use database-authoritative pricing.

3. **Database Unavailability Creates Fake Sessions (Silent Failure)**
   - **File:** `backend/src/routes/api.routes.ts` (Auth endpoints)
   - **Problem:** If `getDbPool()` is null/offline, the backend gracefully creates a signed JWT for a "fallbackUser".
   - **Production impact:** System pretends to be working while actually offline, allowing phantom users to navigate authenticated routes.
   - **Security impact:** Phantom sessions could bypass checks if not validated later.
   - **Recommended fix:** Return HTTP 503 strictly if the database is unavailable. Never issue fallback JWTs.

4. **Conversations and Admin Endpoints Lack Proper Authorization**
   - **File:** `backend/src/routes/api.routes.ts` (`/conversations`, etc.)
   - **Problem:** Many endpoints verify the user is logged in, but don't strictly enforce that customers can only view their own conversations or that staff privileges are required for admin routes.
   - **Production impact:** IDOR (Insecure Direct Object Reference) allowing users to see other users' private concierge chats.
   - **Security impact:** Data breach of customer inquiries.
   - **Recommended fix:** Enforce RBAC in Express middleware and specifically check `user.id` against resource ownership for customers.

## HIGH

5. **Fake Production Data (Fallback Products/Categories)**
   - **File:** `backend/src/routes/api.routes.ts`, `lib/api.ts`
   - **Problem:** If database fails or no data exists, the backend and frontend return massive static arrays of `FALLBACK_PRODUCTS`.
   - **Production impact:** Customers could see and try to purchase products that do not exist in the live database, leading to fulfillment failures.
   - **Security impact:** None, but severely damages brand reputation.
   - **Recommended fix:** Remove all `FALLBACK_*` constants. Return empty arrays or 503 errors if the DB fails.

6. **Payment & Email Fake Success**
   - **File:** `backend/src/services/payment.service.ts`, `email.service.ts` (and usage in `api.routes.ts`)
   - **Problem:** Order creation logic might still assume payment success or simulate it. 
   - **Production impact:** Orders might be marked as paid when payment is explicitly disabled.
   - **Security impact:** Financial accounting errors.
   - **Recommended fix:** Hardcode order status to `pending` or `direct_consignment`. Explicitly return 503 for payment endpoints.

7. **Inconsistent DB Schema vs Queries**
   - **File:** `backend/src/db/schema.sql`, `backend/src/routes/api.routes.ts`
   - **Problem:** Schema fields and backend query fields may misalign (e.g., `image_url` vs `image`, etc).
   - **Production impact:** SQL query errors crashing endpoints.
   - **Security impact:** None.
   - **Recommended fix:** Audit all SQL queries against the actual Neon migration schema.

## MEDIUM

8. **Image Storage / Cloudinary Configuration**
   - **File:** `backend/src/services/cloudinary.service.ts`, `backend/src/routes/api.routes.ts`
   - **Problem:** Cloudinary is requested NOT to be used, but code exists for it. Images should go to Neon PostgreSQL.
   - **Production impact:** Broken image uploads if Cloudinary is removed but DB storage isn't implemented properly.
   - **Security impact:** None.
   - **Recommended fix:** Fully remove Cloudinary service and ensure the PostgreSQL media storage mechanism works securely.

9. **Frontend Admin Login Pre-fill**
   - **File:** `app/admin/page.tsx`
   - **Problem:** "Quick Fill Admin Credentials" button exists in production UI.
   - **Production impact:** Unprofessional appearance on a luxury site.
   - **Security impact:** Discloses target admin email patterns.
   - **Recommended fix:** Remove the quick fill button and associated state logic.

## LOW

10. **Environment Variable Parity**
    - **Problem:** Need to ensure all variables (`NEXT_PUBLIC_API_URL`, etc.) are properly documented and aligned between Vercel and Render.
    - **Recommended fix:** Update `docs/ENVIRONMENT_VARIABLES.md`.

11. **Future 3D Support Fields**
    - **Problem:** Need to verify 3D fields (`model_3d_url`) are present in schema but unused in frontend.
    - **Recommended fix:** Keep in DB, remove any active 3D rendering scripts in frontend.
