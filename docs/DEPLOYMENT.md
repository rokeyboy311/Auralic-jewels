# Deployment Guide

Aurelic Jewels is designed as a decoupled architecture:
1. **Frontend**: Next.js App Router (Deploy on Vercel)
2. **Backend**: Node.js Express Server (Deploy on Render, Heroku, AWS, etc.)
3. **Database**: Managed PostgreSQL (Cloud SQL, Neon, Supabase, RDS)

## 1. Deploying the Backend (Render / General)

The backend handles API routing, authentication (JWT/Cookies), Stripe payments, and database connections.

1. Create a Web Service on your hosting provider.
2. Set the Root Directory to `/backend` (or build from root if supported).
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Ensure all **Environment Variables** (see `ENVIRONMENT_VARIABLES.md`) are injected, especially `DATABASE_URL` and `STRIPE_SECRET_KEY`.
6. Configure your hosting provider to support secure cookies (`Secure` flag is enforced in production).

### Render Configuration (`render.yaml`)
A `render.yaml` file is provided in the `/backend` folder for Infrastructure-as-Code deployment on Render.

## 2. Deploying the Frontend (Vercel)

The Next.js frontend is static/SSR and should be deployed to Vercel or similar.

1. Connect your Git repository to Vercel.
2. Set the Framework Preset to **Next.js**.
3. **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: Set this to your deployed backend URL (e.g., `https://api.domainname.com/api`).
   * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Deploy.

## 3. Stripe Webhooks

Once both are deployed, configure Stripe to send webhooks to your backend:
1. Go to Stripe Dashboard -> Developers -> Webhooks.
2. Add endpoint: `https://api.domainname.com/api/stripe/webhook`
3. Listen for events: `payment_intent.succeeded`.
4. Copy the Webhook Signing Secret and add it as `STRIPE_WEBHOOK_SECRET` in the backend environment variables.

## 4. Domain Setup

* **Primary**: `https://domainname.com` (Points to Vercel Frontend)
* **Admin Portal**: `https://domainname.com/admin` (Handled by the same Next.js application; protected via JWT HttpOnly cookies).
* **API**: `https://api.domainname.com` (Points to Render Backend). Ensure `FRONTEND_URL` is set to `https://domainname.com` on the backend to allow CORS.
