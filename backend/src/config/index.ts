import dotenv from 'dotenv';
import path from 'path';

// Load environment configuration from .env in project root and backend dir
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false });

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || '';

if (isProduction && !databaseUrl) {
  console.warn('[CONFIG WARNING] DATABASE_URL is not set in environment variables. Please provide DATABASE_URL in Render settings.');
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'https://aurelic-jewels.vercel.app',
  apiUrl: process.env.API_URL || 'https://aurelic-jewels.onrender.com',
  databaseUrl: databaseUrl,
  jwtSecret: process.env.JWT_SECRET || (isProduction ? 'prod_jwt_secret_key_luxury_aurelic_jewels_32_chars' : 'dev_jwt_secret_change_in_production_key_32_chars_min'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'aurelic_auth_token',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'https://aurelic-jewels.onrender.com/api/auth/google/callback',
  },
  // Payment integration disabled (Direct invoice / Bank Wire / Vault Escrow)
  payments: {
    enabled: false,
    defaultMethod: 'direct_consignment',
  },
  // Email service temporarily paused
  email: {
    enabled: false,
    from: process.env.EMAIL_FROM || 'Aurelic Jewels <concierge@aurelic-jewels.vercel.app>',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@aurelic-jewels.vercel.app',
  },
  // Media uploads stored natively in Neon PostgreSQL database
  media: {
    storageType: 'neon_postgres',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  }
};
