# THIRD-PARTY INTEGRATIONS & CREDENTIALS RUNBOOK

This document details how to configure third-party services for Google OAuth, Stripe Payments, Resend Transactional Email, and Cloudinary Media Storage.

---

## 1. Google OAuth 2.0 Configuration

1. Open the [Google Cloud Console](https://console.cloud.google.com).
2. Create or select a project named **Maison Aurelia**.
3. Under **APIs & Services > OAuth Consent Screen**:
   - Set **User Type** to `External`.
   - Set **App Name** to `Maison Aurelia Haute Joaillerie`.
   - Set **User Support Email** to `concierge@auralic-jewels.vercel.app`.
4. Under **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**:
   - **Application Type**: `Web application`
   - **Authorized JavaScript Origins**:
     - `http://localhost:3000`
     - `https://auralic-jewels.vercel.app`
     - `https://your-frontend.vercel.app`
   - **Authorized Redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
     - `https://auralic-jewels.onrender.com/api/auth/google/callback`
5. Save the **Client ID** and **Client Secret** into your `.env` files:
   - Frontend: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Backend: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## 2. Stripe Payments & Webhook Setup

1. Create or log in to your account at [Stripe](https://dashboard.stripe.com).
2. Retrieve your API Keys under **Developers > API Keys**:
   - `Publishable Key` (`pk_live_...` or `pk_test_...`) -> Set as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on Frontend.
   - `Secret Key` (`sk_live_...` or `sk_test_...`) -> Set as `STRIPE_SECRET_KEY` on Backend.
3. Configure Webhooks under **Developers > Webhooks**:
   - Click **Add Endpoint**.
   - **Endpoint URL**: `https://auralic-jewels.onrender.com/api/payments/webhook`
   - **Events to Listen For**:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
4. Copy the **Signing Secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` on Backend.

---

## 3. Resend Transactional Email Setup

1. Sign up at [Resend](https://resend.com).
2. In **Domains**, add your domain (e.g. `auralic-jewels.vercel.app`) and add the DNS records (DKIM, SPF, MX) to your domain registrar.
3. In **API Keys**, generate a new API key with *Full Access*.
4. Configure in `backend/.env`:
   ```bash
   RESEND_API_KEY="re_123456789"
   EMAIL_FROM="Maison Aurelia <concierge@auralic-jewels.vercel.app>"
   ```

---

## 4. Cloudinary Media Storage Setup

1. Create an account on [Cloudinary](https://cloudinary.com).
2. From the Cloudinary Dashboard, copy:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Configure in `backend/.env` for secure server-side image optimization.
