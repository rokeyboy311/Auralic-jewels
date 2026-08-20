# MAISON AURELIA — INTERNATIONAL LUXURY FINE JEWELLERY E-COMMERCE

> **Maison de Haute Joaillerie & High Gemology**  
> Certified Conflict-Free Natural Diamonds • 18K/22K Solid Gold • Colombian Emeralds & Ceylon Sapphires • Worldwide Armored Valuables Courier • Live Atelier Concierge Chat & Bespoke Commissions

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Folder & Directory Structure](#2-folder--directory-structure)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Local Development Setup](#4-local-development-setup)
5. [Database Setup & Migration (Neon PostgreSQL)](#5-database-setup--migration-neon-postgresql)
6. [Frontend Deployment (Vercel)](#6-frontend-deployment-vercel)
7. [Backend Deployment (Render)](#7-backend-deployment-render)
8. [Third-Party Services Configuration](#8-third-party-services-configuration)
   - [Google OAuth 2.0 Setup](#google-oauth-20-setup)
   - [Stripe Payment Gateway & Webhooks](#stripe-payment-gateway--webhooks)
   - [Resend Transactional Email Engine](#resend-transactional-email-engine)
   - [Cloudinary Media Storage](#cloudinary-media-storage)
9. [Public Website Features & Routes](#9-public-website-features--routes)
10. [Atelier Concierge Chat & Admin Portal](#10-atelier-concierge-chat--admin-portal)
11. [Future 3D Showroom & GLTF Compatibility](#11-future-3d-showroom--gltf-compatibility)
12. [Security, Performance & Best Practices](#12-security-performance--best-practices)
13. [Troubleshooting & FAQ](#13-troubleshooting--faq)

---

## 1. Project Overview & Architecture

Maison Aurelia is engineered with a strict **two-tier full-stack architecture** designed for independent scalability, high availability, and zero-downtime deployment:

```
┌────────────────────────────────────────────────────────┐
│               MAISON AURELIA ARCHITECTURE              │
├──────────────────────────┬─────────────────────────────┤
│   FRONTEND (Vercel)      │   BACKEND (Render)          │
│   Next.js 15+ App Router │   Express + TypeScript REST │
│   Tailwind CSS           │   JWT + Role Auth (Admin)   │
│   Framer Motion          │   Stripe + Resend + Cloud   │
│   Multi-Currency Engine  │   CORS + Helmet + Limiting  │
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
             ▼                            ▼
   ┌──────────────────┐         ┌──────────────────┐
   │ Dynamic API URL  │────────▶│ Neon PostgreSQL  │
   │ (Single Env Var) │         │ (Serverless Pool)│
   └──────────────────┘         └──────────────────┘
```

### Hosting & Deployment Topology

| Component | Target Platform | Local Development | Production Environment |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | `http://localhost:3000` | `https://aureliajewels.com` |
| **Backend REST API** | **Render** | `http://localhost:5000` | `https://auralic-jewels.onrender.com` |
| **Database** | **Neon PostgreSQL** | Neon Connection Pool | Neon High-Availability Replica Pool |

---

## 2. Folder & Directory Structure

```
/
├── .env.example                  # Frontend environment configuration template
├── README.md                     # Comprehensive architecture and deployment guide
├── next.config.ts                # Next.js configuration & image remote patterns
├── package.json                  # Frontend dependencies and build scripts
├── tsconfig.json                 # TypeScript strict compiler options
│
├── app/                          # Next.js 15 App Router directory
│   ├── layout.tsx                # Root layout with Currency, Auth, Cart, Chat providers
│   ├── page.tsx                  # Luxury editorial homepage
│   ├── globals.css               # Tailwind CSS v4 styling & luxury typography imports
│   ├── shop/                     # Haute Joaillerie catalogue with multi-facet filters
│   ├── collections/              # Curated thematic collections & [slug] dynamic page
│   ├── categories/               # Jewellery categories & [slug] dynamic pages
│   ├── product/[slug]/           # Product dossier, variant selector & inquiry launcher
│   ├── custom-jewellery/         # Bespoke private commissions brief generator
│   ├── cart/                     # Shopping bag with live taxes & discount codes
│   ├── checkout/                 # Armored courier checkout with recalculation
│   ├── order-success/            # Order confirmation & dispatch invoice
│   ├── track-order/              # Real-time Ferrari Group armored logistics tracker
│   ├── wishlist/                 # Curated private wishlist & instant bag transfer
│   ├── account/                  # Patron dashboard & Atelier inquiry threads
│   ├── admin/                    # Executive control center & Concierge Chat desk
│   ├── about/ & our-story/       # Maison heritage & Place Vendôme history
│   ├── jewellery-guide/          # GIA 4Cs Diamond & Untreated Gemology Guide
│   ├── size-guide/               # International ring and collar sizing charts
│   ├── materials-care/           # 18K/22K gold alloy care & maintenance charter
│   ├── shipping-policy/          # Insured armored courier transit terms
│   ├── returns-refunds/          # 30-day privilege return & lifetime trade-up
│   ├── privacy-policy/           # GDPR & patron confidentiality charter
│   ├── terms-conditions/         # Terms of acquisition & hallmarked authentication
│   ├── contact/ & faq/           # Private appointments & patron inquiry desk
│   └── api/                      # Next.js server-side API proxy routes
│
├── components/                   # Reusable UI & architectural components
│   ├── Header.tsx                # 3-Zone navigation, currency switcher & quick actions
│   ├── Footer.tsx                # Maison directory, newsletter & compliance badges
│   ├── ProductCard.tsx           # Luxury piece presentation with quick wishlist
│   ├── AtelierConciergeChat.tsx  # Live sliding chat with Master Jeweller
│   ├── CartDrawer.tsx            # Slide-out bag with dynamic subtotal calculations
│   ├── SearchModal.tsx           # Instant search modal with SKU indexing
│   ├── AuthModal.tsx             # Patron sign-in & Google OAuth popup
│   ├── CustomDesignModal.tsx     # Quick bespoke inquiry modal
│   └── ConciergeAppointmentModal.tsx # Private salon appointment booking
│
├── context/                      # State management providers
│   ├── AuthContext.tsx           # Patron and admin session authentication
│   ├── CartContext.tsx           # Shopping bag persistence and tax calculations
│   ├── WishlistContext.tsx       # Saved pieces persistence
│   ├── CurrencyContext.tsx       # Live currency exchange rate engine (USD, EUR, GBP, INR, AED, AUD, CAD)
│   ├── ChatContext.tsx           # Real-time Atelier Concierge chat engine
│   └── ToastContext.tsx          # Non-intrusive luxury toast notifications
│
├── lib/                          # Data, API clients & utilities
│   ├── types.ts                  # Comprehensive TypeScript domain interfaces
│   ├── api.ts                    # Centralized dynamic API client (zero localhost lock-in)
│   ├── brandConfig.ts            # Brand identity, addresses & contact data
│   ├── internationalConfig.ts    # Multi-currency matrix, VAT, & customs calculation
│   └── db/
│       ├── mockDb.ts             # Initial high-jewellery inventory & staff fixtures
│       └── store.ts              # In-memory operational store with fallback persistence
│
└── backend/                      # Standalone Express REST API (Deployable to Render)
    ├── .env.example              # Backend environment template
    ├── package.json              # Express, PG, Stripe, Resend dependencies
    ├── tsconfig.json             # Backend TypeScript configuration
    ├── render.yaml               # Infrastructure-as-Code Blueprint for Render
    └── src/
        ├── app.ts                # Express application factory with Helmet & CORS
        ├── index.ts              # Server startup & database connection pool
        ├── config/               # Environment configuration loader
        ├── routes/               # Modular REST endpoints (/products, /payments, etc.)
        ├── services/             # Stripe payment & Resend email microservices
        ├── middleware/           # JWT verification, CORS & error handling
        └── db/
            ├── connection.ts     # PostgreSQL connection pool with SSL
            ├── schema.sql        # Complete PostgreSQL database schema DDL
            ├── seeds.sql         # Rich demo jewellery inventory DML
            ├── migrate.ts        # Database schema migration script
            └── seed.ts           # Database seeding runner
```

---

## 3. Environment Variables Reference

### Frontend (`.env.local` for development / Vercel Environment Variables)

```bash
# Centralized API Base URL (Crucial for Deployment)
# In development, leave empty or set to http://localhost:5000
# In production, set to your Render API URL
NEXT_PUBLIC_API_URL="https://auralic-jewels.onrender.com"

# Public Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"

# Public Stripe Publishable Key (for client-side tokenization)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51P..."
```

### Backend (`/backend/.env` / Render Environment Variables)

```bash
# Server Environment & Port
NODE_ENV="production"
PORT=5000

# Client Application URL for CORS Whitelist
FRONTEND_URL="https://aureliajewels.com"

# PostgreSQL Database Connection URL (from Neon)
DATABASE_URL="postgres://neondb_owner:password@ep-sweet-dawn-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Secret for Patron & Admin Authentication
JWT_SECRET="super-secure-random-jwt-secret-string-at-least-64-characters"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
GOOGLE_CALLBACK_URL="https://auralic-jewels.onrender.com/api/auth/google/callback"

# Stripe Payment Processing
STRIPE_SECRET_KEY="sk_live_51P..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend Transactional Email
RESEND_API_KEY="re_..."
EMAIL_FROM="Maison Aurelia <concierge@aureliajewels.com>"

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

---

## 4. Local Development Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/maison-aurelia-jewellery.git
cd maison-aurelia-jewellery
```

### Step 2: Set Up & Run Frontend
```bash
# Install frontend dependencies
npm install

# Create local environment file
cp .env.example .env.local

# Run Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 3: Set Up & Run Backend Server
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create backend environment file
cp .env.example .env

# Run Express development server
npm run dev
```
The REST API will be available at [http://localhost:5000](http://localhost:5000).

---

## 5. Database Setup & Migration (Neon PostgreSQL)

Maison Aurelia is optimized for **Neon Serverless PostgreSQL**.

### Step 1: Create a Neon Project
1. Log in to [Neon Console](https://console.neon.tech).
2. Click **Create Project**, name it `maison-aurelia-db`, and choose your nearest region.
3. In the project dashboard, copy the **Connection String** (Pooled connection mode recommended).

### Step 2: Run Database Schema Migrations
You can apply the schema either using `psql` or the built-in migration script:

#### Method A: Using Built-in NPM Scripts (Recommended)
```bash
cd backend
# Set your DATABASE_URL in backend/.env, then run:
npm run db:migrate
npm run db:seed
```

#### Method B: Using Neon Web SQL Editor or psql
```bash
# Connect and execute schema
psql "$DATABASE_URL" -f backend/src/db/schema.sql

# Seed initial high-jewellery inventory and staff
psql "$DATABASE_URL" -f backend/src/db/seeds.sql
```

The database schema provisions:
- `users` & `admins` (with hashed passwords and role hierarchies)
- `categories` & `collections` (indexed by slugs)
- `products` & `product_variants` (with gold weights, purity, stone carats, hallmarking)
- `orders` & `order_items` (with armored transit airway bills)
- `conversations` & `conversation_messages` (for Atelier Concierge chat threads)
- `bespoke_inquiries` (for private client design briefs)
- `coupons` & `reviews`
- `showroom_models` (prepared for future 3D GLTF compatibility)

---

## 6. Frontend Deployment (Vercel)

The Next.js frontend is structured for deployment on **Vercel**:

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Push your repository to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your `maison-aurelia-jewellery` repository.
4. Keep the **Root Directory** as `./` (Root).
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-api.onrender.com`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: `your-google-client-id.apps.googleusercontent.com`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`
6. Click **Deploy**.
7. Under **Project Settings > Domains**, assign your custom production domain (e.g. `aureliajewels.com`).

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 7. Backend Deployment (Render)

The Express backend can be deployed to **Render** using a Web Service:

### Option A: Deploy using Blueprint (`render.yaml`)
1. In [Render Dashboard](https://dashboard.render.com), click **Blueprints > New Blueprint Instance**.
2. Select your repository. Render will automatically read `/backend/render.yaml`.
3. Configure the required environment variables:
   - `DATABASE_URL` (from Neon)
   - `FRONTEND_URL` (`https://aureliajewels.com`)
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `RESEND_API_KEY`
4. Click **Apply**.

### Option B: Manual Web Service Setup on Render
1. Click **New > Web Service** in Render.
2. Connect your GitHub repository.
3. Configure the following parameters:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add the Environment Variables listed in Section 3.
5. Click **Create Web Service**.
6. Copy your Render service URL (e.g. `https://maison-aurelia-api.onrender.com`) and paste it as `NEXT_PUBLIC_API_URL` on your Vercel frontend.

---

## 8. Third-Party Services Configuration

### Google OAuth 2.0 Setup

1. Open [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project named **Maison Aurelia**.
3. Navigate to **APIs & Services > OAuth Consent Screen**:
   - User Type: **External**
   - App Name: `Maison Aurelia`
   - User Support Email: `concierge@aureliajewels.com`
4. Navigate to **Credentials > Create Credentials > OAuth 2.0 Client ID**:
   - Application Type: **Web application**
   - **Authorized JavaScript Origins**:
     - `http://localhost:3000`
     - `https://aureliajewels.com`
   - **Authorized Redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
     - `https://auralic-jewels.onrender.com/api/auth/google/callback`
5. Copy the **Client ID** and **Client Secret** into your `.env` files.

---

### Stripe Payment Gateway & Webhooks

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com).
2. In **Developers > API Keys**, copy your `Publishable Key` and `Secret Key`.
3. Navigate to **Developers > Webhooks** and click **Add Endpoint**:
   - **Endpoint URL**: `https://auralic-jewels.onrender.com/api/payments/webhook`
   - **Events to listen for**:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
4. Reveal the **Signing Secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` on Render.

---

### Resend Transactional Email Engine

1. Create an account at [Resend](https://resend.com).
2. Go to **Domains > Add Domain** (e.g., `aureliajewels.com`).
3. Add the required DNS records (DKIM, SPF, MX) to your domain registrar.
4. Generate an API Key under **API Keys** with *Full Access*.
5. Set `RESEND_API_KEY` and `EMAIL_FROM="Maison Aurelia <concierge@aureliajewels.com>"`.

---

### Cloudinary Media Storage

1. Create an account on [Cloudinary](https://cloudinary.com).
2. In your dashboard, locate:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Set these values in `backend/.env` for secure server-side image optimization and upload.

---

## 9. Public Website Features & Routes

| Route | Functionality |
| :--- | :--- |
| `/` | Editorial Homepage featuring High Solitaire Hero, Curated Collections, Craftsmanship Film, and Newsletter. |
| `/shop` | Product Discovery with multi-filter (Metal, Gemstone, Purity, Price, Size), sorting, and search. |
| `/collections` | Curated collections gallery (Solitaire Masterpieces, The Royal Emerald, Heritage Gold, Celestial Radiance). |
| `/categories/[slug]` | Dedicated category archives (Rings, Necklaces, Earrings, Bracelets, Bangles, Pendants, Chains, Men's). |
| `/product/[slug]` | Masterpiece Dossier with metal selector, ring sizer, 4 technical tabs, reviews, and Atelier inquiry drawer. |
| `/custom-jewellery` | Bespoke Haute Joaillerie Brief Builder for private custom commissions. |
| `/cart` | Dynamic shopping bag with live international VAT/duty estimates and discount engine. |
| `/checkout` | Armored delivery checkout with server-side recalculation, Ferrari Group courier, and payment selector. |
| `/order-success` | Authenticated order completion with GIA warranty breakdown and airbill tracking link. |
| `/track-order` | Consignment tracking portal with carrier airbill timeline. |
| `/wishlist` | Saved patron pieces with instant move-to-bag capabilities. |
| `/account` | Patron portal managing addresses, previous consignments, and live Atelier message threads. |
| `/jewellery-guide` | GIA Diamond 4Cs & untreated gemstone educational portal. |
| `/size-guide` | International ring, collar, and wrist sizing comparison chart. |
| `/materials-care` | Preservation guidelines for 18K/22K gold, platinum, and precious gemstones. |
| `/shipping-policy` | Worldwide armored courier logistics terms and insurance coverage. |
| `/returns-refunds` | 30-day privilege return and lifetime diamond trade-up policies. |
| `/privacy-policy` | Patron privacy charter and security specifications. |
| `/terms-conditions` | Legal terms of acquisition and authenticity warranties. |
| `/contact` & `/faq` | Private showroom consultations and frequently asked questions. |

---

## 10. Atelier Concierge Chat & Admin Portal

### Public Floating Concierge
- **Accessibility**: Available across all pages via the gold floating button at the bottom-right.
- **Product Context**: Clicking "Chat with Atelier Jeweller" on any product automatically attaches the piece name, SKU, price, and selected metal alloy to the conversation.
- **Patron Thread Storage**: Inquiries are saved under the patron's account and synchronized with the Maison ledger.

### Maison Administration Portal (`/admin`)
- **Access Control**: Role-gated dashboard for Maison Directors and Master Craftsmen (`SUPER_ADMIN`, `ADMIN`, `MASTER_JEWELLER`).
- **Live Concierge Desk**:
  - Filter inquiries by status (`OPEN`, `IN_PROGRESS`, `WAITING_FOR_USER`, `WAITING_FOR_ADMIN`, `RESOLVED`).
  - Search by ticket number, patron name, or piece SKU.
  - Assign inquiries to specific specialists (e.g. Master Goldsmith Henri Vane, Senior Gemologist Dr. Vivienne Moreau).
  - Record private internal technical notes (visible only to staff).
  - Dispatch official replies to patrons.
- **Consignment Dispatch**: Real-time status update (`Pending`, `Confirmed`, `In Atelier Vault`, `Armored Courier In Transit`, `Delivered`).
- **Inventory Management**: Create new GIA-certified pieces, manage stock levels, and update prices.

---

## 11. Future 3D Showroom & GLTF Compatibility

The database and API architecture are fully prepared for 3D GLTF / Three.js model viewing without requiring schema modifications:

1. **Database Fields**:
   - `products.model_url`: URL pointing to the hosted `.glb` or `.gltf` asset.
   - `products.model_thumbnail`: 2D preview image before WebGL loading.
   - `products.model_status`: Enum (`none`, `processing`, `active`).
2. **Dedicated Table**: `showroom_models` with spatial positioning coordinates (`position_x`, `position_y`, `scale`, `rotation`).
3. **Integration Path**: When ready, simply install `@react-three/fiber` and `@react-three/drei` on the frontend and mount the canvas inside `app/product/[slug]/page.tsx`.

---

## 12. Security, Performance & Best Practices

- **Zero Client Trust**: All order prices, taxes, and shipping rates are recalculated server-side before generating payment intents.
- **Security Headers**: Helmet integration enforcing strict CSP, XSS protection, and frameguard rules.
- **Rate Limiting**: Express rate limiting protecting authentication and checkout endpoints from abuse.
- **Safe Authentication**: Passwords hashed with bcrypt (salt rounds = 12); JWT tokens stored securely.
- **Image Optimization**: Responsive Next.js `<Image>` components with lazy loading and remote security whitelists.
- **SEO & Social Sharing**: Complete Open Graph, Twitter Cards, canonical tags, `sitemap.xml`, and `robots.txt` dynamic generation.

---

## 13. Troubleshooting & FAQ

#### Q1: "Failed to fetch / Network Error" when connecting frontend to backend
- **Fix**: Check `NEXT_PUBLIC_API_URL` on Vercel. Ensure there is no trailing slash (e.g. `https://auralic-jewels.onrender.com`).
- **Fix**: Verify backend `FRONTEND_URL` on Render includes your exact Vercel production domain.

#### Q2: PostgreSQL connection timeout on Neon
- **Fix**: Make sure you use the **Pooled Connection string** (`-pooler` in hostname) to avoid exhausting connection limits with serverless workers.
- **Fix**: Verify `?sslmode=require` is appended to your `DATABASE_URL`.

#### Q3: Google OAuth redirect mismatch (`redirect_uri_mismatch`)
- **Fix**: In Google Cloud Console, ensure both development (`http://localhost:5000/api/auth/google/callback`) and production (`https://auralic-jewels.onrender.com/api/auth/google/callback`) are added under **Authorized Redirect URIs**.

---

## 14. Verification & Production Build Commands

```bash
# Verify Frontend Production Compilation
npm run build

# Verify Backend Production Compilation
cd backend
npm run build
```

---

© 2026 Maison Aurelia Paris. All Rights Reserved.  
*Haute Joaillerie, Fine Gemology & High Horology.*

## Production Documentation

We have prepared comprehensive documentation for deploying and running Maison Aurelia in a production environment:

* [Production Setup & Architecture](docs/PRODUCTION_SETUP.md)
* [Database Initialization](docs/DATABASE_SETUP.md)
* [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
* [API Reference](docs/API_REFERENCE.md)
* [Deployment Guide](docs/DEPLOYMENT.md)
