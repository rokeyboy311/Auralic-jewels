import dotenv from 'dotenv';
import path from 'path';

// If process.env.DATABASE_URL has broken password, let .env or valid Neon connection take precedence
const validDefaultNeonUrl = 'postgresql://neondb_owner:npg_zZ3uSxOhX2nW@ep-calm-boat-ax5xne7v-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false });

let finalDatabaseUrl = process.env.DATABASE_URL || validDefaultNeonUrl;
if (finalDatabaseUrl.includes('npg_MuRhnf0So1ey')) {
  // If the stale invalid neon credentials were in runtime environment, redirect to valid working pooler
  finalDatabaseUrl = validDefaultNeonUrl;
}

export const config = {
  env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  databaseUrl: finalDatabaseUrl,
  jwtSecret: process.env.JWT_SECRET || 'auralic_haute_joaillerie_super_secret_jwt_key_2026_production_grade_32_chars_min',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'Maison Auralic <concierge@auralic-jewels.vercel.app>',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@auralic-jewels.vercel.app',
  },
};
