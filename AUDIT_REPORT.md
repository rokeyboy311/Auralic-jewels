# AUDIT REPORT — MAISON AURELIA INTERNATIONAL LUXURY JEWELLERY
**Date:** August 19, 2026
**Architectural Verification Level:** Lead Full-Stack Architect, UI/UX Designer & QA Auditor

---

## 1. EXECUTIVE SUMMARY & ROUTE CONTRACT AUDIT

### Core Architectural Requirement:
The system strictly enforces **two main public access points**:
1. **User Website**: `https://domainname.com` (Encompasses all client shopping, bespoke customization, account management, multi-currency pricing, and client-side chat interactions).
2. **Admin Panel**: `https://domainname.com/admin` (The singular, centralized command hub for staff, master gemologists, orders, catalog, and live conversation triage).

No detached public portals (e.g. `/patron`, `/atelier`, `/staff`, `/customer`) are present or permitted. Internal Atelier staff operate inside `/admin` governed by internal role-based authorizations (`SUPER_ADMIN`, `ADMIN`, `ATELIER_STAFF`).

---

## 2. DETAILED AUDIT MATRIX

### [CRITICAL]
- **Chat System Integration**: Need dedicated `/api/conversations` and `/api/conversations/[id]/messages` routes and state management so users can initiate product modification chats, custom jewellery inquiries, and order inquiries directly from product and order pages.
- **Google Auth Endpoint Restoration**: `/app/api/auth/google/route.ts` was deleted and needs clean restoration to handle OAuth requests without server errors.

### [HIGH]
- **Admin Chat Management**: The `/admin` panel requires a comprehensive "Conversations" triage interface allowing admins and atelier staff to search, filter by status (`OPEN`, `PENDING`, `IN_PROGRESS`, `WAITING_FOR_USER`, `WAITING_FOR_ADMIN`, `RESOLVED`, `CLOSED`), assign internal staff, reply, add internal private notes, and attach files.
- **Product → Chat Linkage**: Clicking "Customize / Request Modification" on any product page (`/product/[slug]`) must immediately open the chat drawer preloaded with the product's SKU, title, selected size, metal, stone, and direct link.
- **Order → Chat Linkage**: In `/account` under orders, clicking "Contact Atelier / Request Assistance" must open a conversation preloaded with the order number, item titles, and dispatch tracking details.

### [SECURITY]
- Single unified user identity model across patron services, cart, and chat.
- User conversations are scoped strictly to the authenticated `userId` unless queried by authorized admin roles.
- Server-side recalculation of prices, discounts, shipping, and taxes on all orders before database commitment.
- Token and session cookies configured for production (`httpOnly`, `sameSite`, `secure`).

### [UI/UX]
- Anti-AI luxury aesthetic preserved: Warm ivory neutrals (`#faf8f5`), champagne gold accents (`#9b7e46`), deep charcoal typography (`#141210`), serif display headings (`Cormorant Garamond` / `Playfair Display`), and generous editorial whitespace.
- Floating Atelier Concierge Chat widget accessible across all customer pages with live unread indicators, minimizable states, quick inquiry chips, and conversation switching.
- Single-line button controls with truncation safety.

### [DATABASE & SCHEMA]
- In-memory mock store (`lib/db/mockDb.ts` & `lib/db/store.ts`) + PostgreSQL schema (`backend/src/db/schema.sql`) synchronized.
- Tables & entities supported:
  - `users`, `products`, `product_variants`, `categories`, `collections`, `product_images`, `inventory`, `carts`, `cart_items`, `wishlists`, `orders`, `order_items`, `payments`, `addresses`, `reviews`, `coupons`, `shipping_methods`, `notifications`, `conversations`, `conversation_messages`, `conversation_attachments`, `customization_requests`.
- Database schema supports future 3D model properties (`model_url`, `model_thumbnail`, `has_3d_model`, `model_status`) without requiring Three.js bundling now.

### [API]
- REST API conventions consistently applied across `/api/*` routes and Express `/backend`.
- Response structure: `{ success: boolean, data?: T, message?: string, error?: string }`.
- Centralized base URL configuration: `NEXT_PUBLIC_API_URL` (supports local `http://localhost:5000` and production `https://api.yourdomain.com`).

### [AUTHENTICATION]
- Single unified user account model for all patron activities.
- Unified registration, login, and Google OAuth integration.
- Protected client-side state synchronized via `useSyncExternalStore` in `context/AuthContext.tsx`.

### [CHAT & WORKFLOW]
- Workflow from User to Admin:
  1. User triggers chat from Product, Order, or Global Concierge button.
  2. Conversation created with unique ID, status `OPEN`, priority `medium` or `high`.
  3. Admin notification triggered; appears in `/admin` conversation inbox.
  4. Atelier staff or Admin opens conversation, reviews attached product/order context, and replies.
  5. User receives response in real-time or upon next session with unread notification badge.
  6. Status updates to `WAITING_FOR_USER`, `IN_PROGRESS`, or `RESOLVED`.

### [ADMIN PANEL]
- Route: `/admin` exclusively.
- Sidebar sections:
  - Dashboard Overview
  - Conversations (Live Chat Triage & Support)
  - Customization & Bespoke Requests
  - Products & Variant Inventory
  - Orders & Armored Logistics
  - Patrons & Client Directory
  - Currencies & Tax Rates
  - Marketing & Privileges (Coupons)
  - Atelier Staff & Roles

### [INTERNATIONAL JEWELLERY]
- Multi-currency support: USD ($), EUR (€), GBP (£), INR (₹), AED (د.إ), AUD (A$), CAD (C$).
- Dynamic currency rate conversion and country-specific tax rules (VAT, GST, Sales Tax, de minimis thresholds).
- Armored air transport integration specifications (FedEx Priority Valuables, Ferrari Group, Brinks Global).

### [DEPLOYMENT]
- Frontend: Vercel-ready with zero localhost hardcoding.
- Backend: Render-ready Express architecture.
- Database: Neon PostgreSQL ready with migration scripts (`backend/src/db/schema.sql`).
- Environment configuration: Complete `.env.example`.

### [FUTURE 3D COMPATIBILITY]
- Product data interfaces contain `modelUrl`, `modelThumbnail`, and `has3DModel` fields ready for Three.js/GLTF integration without current heavyweight dependencies.

---

## 3. IMPLEMENTATION ACTION PLAN
1. **Recreate `/app/api/auth/google/route.ts`** to complete authentication flows.
2. **Implement Conversation & Chat Types** in `lib/types.ts`.
3. **Add Conversation Storage & Helper Methods** in `lib/db/mockDb.ts` and `lib/db/store.ts`.
4. **Create API Endpoints**:
   - `/app/api/conversations/route.ts`
   - `/app/api/conversations/[id]/route.ts`
   - `/app/api/conversations/[id]/messages/route.ts`
5. **Create Chat Client Helpers & Context** (`context/ChatContext.tsx`, `lib/api.ts`).
6. **Build Floating Atelier Concierge Chat Component** (`components/AtelierConciergeChat.tsx`) and mount it globally in `app/layout.tsx`.
7. **Connect Product Page to Chat** (`app/product/[slug]/page.tsx` - "Customize / Request Modification" button triggers pre-filled conversation).
8. **Connect Account Orders to Chat** (`app/account/page.tsx` - "Contact Atelier" button triggers order-linked conversation, plus added "Atelier Messages" tab).
9. **Build Admin Conversations & Chat Management Hub** inside `/app/admin/page.tsx`.
10. **Update Database SQL Schemas & README documentation**.
11. **Verify compilation, linting, and user flows**.
