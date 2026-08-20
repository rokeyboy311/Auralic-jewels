# MAISON AURELIA — MASTER ARCHITECTURE DOCUMENTATION

## 1. Executive Summary
Maison Aurelia is a modern, modular, production-ready International Haute Joaillerie E-Commerce platform.
The architecture is strictly divided into three primary standalone pillars:

1. **Frontend (`/` or `/frontend`)** — Next.js 15+ App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion. Engineered for deployment on **Vercel**.
2. **Backend (`/backend`)** — Standalone Node.js, Express, TypeScript, REST API, JWT Authentication, Helmet security, rate limiting, and PostgreSQL integration. Engineered for deployment on **Render**.
3. **Documentation & Guides (`/docs`)** — Complete architecture diagrams, deployment runbooks, API specifications, database migration instructions, third-party integrations (Stripe, Resend, Google OAuth, Cloudinary), and internationalization workflows.

---

## 2. Directory Separation Overview

```
├── app/                  # Next.js App Router (Frontend Pages & UI Components)
├── components/           # Reusable Luxury UI Components
├── context/              # React Context Providers (Auth, Cart, Currency, Chat, Wishlist)
├── lib/                  # Utilities, Types, and Dynamic API Client
├── backend/              # Standalone Express REST API (Deployable to Render)
│   ├── src/
│   │   ├── app.ts        # Express Application Factory
│   │   ├── index.ts      # HTTP Server & DB Connection Pool
│   │   ├── config/       # Environment Configuration
│   │   ├── db/           # PostgreSQL Schema, Seeds, Connection & Migrations
│   │   ├── middleware/   # JWT Auth & Global Error Handlers
│   │   ├── routes/       # REST Endpoints (/products, /payments, /bespoke, etc.)
│   │   └── services/     # Stripe & Resend Microservices
│   ├── .env.example      # Backend Environment Template
│   ├── package.json      # Backend Dependencies & Scripts
│   ├── render.yaml       # Render Infrastructure-as-Code Blueprint
│   └── tsconfig.json     # Backend TypeScript Config
│
└── docs/                 # Complete Architecture & Deployment Documentation
    ├── ARCHITECTURE.md   # System Architecture, Schemas, & Data Flow
    ├── DEPLOYMENT.md     # Step-by-Step Vercel, Render, & Neon Runbook
    ├── API_SPEC.md       # Full REST API Endpoints & Request/Response Contracts
    └── INTEGRATIONS.md   # Stripe, Resend, Google OAuth & Cloudinary Setup Guides
```

---

## 3. Deployment Targets Matrix

| Layer | Recommended Host | Root Directory | Build Command | Start Command |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | `./` (Root) | `npm run build` | `npm start` |
| **Backend** | **Render** | `backend` | `npm install && npm run build` | `npm start` |
| **Database** | **Neon PostgreSQL** | Cloud Hosted | Run `npm run db:migrate` | Run `npm run db:seed` |

---

## 4. Key Design Principles

- **No Hardcoded Localhost**: The frontend uses `NEXT_PUBLIC_API_URL` to connect seamlessly to development (`http://localhost:5000`) or production (`https://auralic-jewels.onrender.com`).
- **Zero Client Trust**: All critical calculations (product prices, discounts, sales taxes, insured armored shipping) are validated and recalculated server-side.
- **Human-Readable Code Quality**: Clean, documented TypeScript with explanatory comments at every major architecture junction.
