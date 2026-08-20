# Production Readiness Audit & Implementation

This document covers the steps executed to transition Maison Auralic from a mock-driven prototype to a fully decoupled, secure, production-ready e-commerce platform.

## Architecture

* **Frontend**: Next.js App Router
* **Backend**: Node.js Express API
* **Database**: PostgreSQL
* **Integration**: Stripe (Payments), Cloudinary (Images), Resend (Emails)

## Key Implementations

1. **Strict Decoupling**: Removed Next.js internal `/app/api` routes and mock databases (`lib/db/mockDb.ts`). The frontend now exclusively communicates with the Express backend using `lib/api.ts` wrapping `fetch`.
2. **Database Integration**: 
   * Transitioned all product fetching (`/products`, `/custom-jewellery`), category fetching, and bespoke inquiries to PostgreSQL.
3. **Authentication**: 
   * Replaced `localStorage` state simulation with secure JWT HttpOnly cookies set by the Express backend.
   * Centralized Google OAuth on the backend to avoid client-side secret exposure.
4. **Stripe Payments**:
   * Removed fake validation flows.
   * Integrated `@stripe/stripe-js` and `@stripe/react-stripe-js`.
   * Added `PaymentIntent` backend endpoint (`/stripe/intent`).
5. **Security & Validation**:
   * Added Next.js `middleware.ts` to strictly protect `/admin` routes based on JWT presence and Role-Based Access Control (RBAC).
6. **Unified Portal**:
   * Maintained strictly two entry points: `/` (public/patron) and `/admin` (atelier staff), sharing the same authentication infrastructure.

## Next Steps for Administrators

1. Follow `DATABASE_SETUP.md` to seed PostgreSQL.
2. Follow `ENVIRONMENT_VARIABLES.md` to configure secrets.
3. Follow `DEPLOYMENT.md` to launch the platform.
