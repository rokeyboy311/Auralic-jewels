# STEP-BY-STEP PRODUCTION DEPLOYMENT GUIDE

This guide provides end-to-end instructions for deploying Maison Aurelia to **Vercel** (Frontend), **Render** (Backend), and **Neon** (PostgreSQL Database).

---

## 1. Database Provisioning (Neon PostgreSQL)

1. Navigate to [https://neon.tech](https://neon.tech) and create an account.
2. Click **Create Project**, name it `maison-aurelia-db`, and choose your preferred cloud region.
3. In the project dashboard, copy the **Connection String** (Pooled connection mode recommended).
4. Run migrations and seed data from your local terminal:
   ```bash
   cd backend
   # In backend/.env, set DATABASE_URL to your Neon connection string:
   DATABASE_URL="postgres://username:password@ep-sample-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

   # Execute schema migration and demo high-jewellery inventory seed
   npm run db:migrate
   npm run db:seed
   ```

---

## 2. Backend Deployment (Render)

### Option A: Using Blueprint (`render.yaml`)
1. Log in to [https://render.com](https://render.com).
2. Click **Blueprints > New Blueprint Instance**.
3. Select your repository. Render will automatically detect `backend/render.yaml`.
4. Fill in the environment variables:
   - `DATABASE_URL` (From Neon)
   - `FRONTEND_URL` (Your Vercel URL, e.g. `https://aureliajewels.com`)
   - `JWT_SECRET` (A strong 64-character random string)
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY` & `EMAIL_FROM`
5. Click **Apply**.

### Option B: Manual Web Service Setup
1. On Render, click **New > Web Service**.
2. Connect your GitHub repository.
3. Set the following configuration:
   - **Name**: `maison-aurelia-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add the environment variables from `backend/.env.example`.
5. Click **Create Web Service**.
6. Copy your live API URL (e.g. `https://maison-aurelia-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Log in to [https://vercel.com](https://vercel.com).
2. Click **Add New > Project** and import your repository.
3. Keep the **Root Directory** as `./` (Root).
4. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g. `https://maison-aurelia-api.onrender.com`) without a trailing slash.
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe Publishable Key.
5. Click **Deploy**.
6. In **Project Settings > Domains**, connect your custom production domain (e.g. `aureliajewels.com`).

---

## 4. Post-Deployment Verification Checklist

- [ ] Visit `https://your-frontend.vercel.app` and confirm homepage loads smoothly.
- [ ] Visit `https://your-backend.onrender.com/api/health` and verify `status: healthy`.
- [ ] Test adding items to the shopping bag and proceeding to checkout.
- [ ] Test the **Live Atelier Concierge Chat** drawer on a product detail page.
- [ ] Log in to `/admin` to verify the Haute Joaillerie Concierge & Chat Desk.
