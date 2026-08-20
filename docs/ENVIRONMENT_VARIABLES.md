# Environment Variables

Maison Auralic requires configuration across both the Frontend (Next.js) and Backend (Express) environments.

## Frontend (`/.env.example`)
Place these in the root directory.

```env
# API URL (The Express backend)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Stripe (Public Key for Elements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google OAuth (Client ID)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Backend (`/backend/.env`)
Place these in the `/backend` directory.

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database (Cloud SQL, Supabase, RDS, etc.)
DATABASE_URL=postgres://user:password@host:5432/db_name

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Stripe (Secret Key for Payment Intents and Webhooks)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (Email Service)
RESEND_API_KEY=re_...

# Cloudinary (Image Hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth Backend Verification
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
