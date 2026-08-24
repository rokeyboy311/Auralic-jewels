import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/api.routes';

export function createApp() {
  const app = express();

  // Trust proxy in production for rate limit & secure cookie behind reverse proxies
  if (config.env === 'production') {
    app.set('trust proxy', 1);
  }

  // Security Headers & Logging
  app.use(helmet());
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Strict CORS Configuration
  const allowedOrigins = [
    config.frontendUrl,
    'https://auralic-jewels.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        
        // Exact match against allowed origins
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow Vercel production & preview deployments
        if (origin.endsWith('.vercel.app') || origin.includes('localhost')) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not permitted by CORS policy`), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'stripe-signature'],
    })
  );

  // Global rate limiter (200 requests per 15 minutes per IP)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please try again later.' },
  });
  app.use('/api', globalLimiter);

  // Raw body preservation for Stripe webhook verification
  app.use(
    express.json({
      limit: '2mb',
      verify: (req: any, _res, buf) => {
        if (req.originalUrl.includes('/webhook') || req.originalUrl.includes('/payments/webhook')) {
          req.rawBody = buf;
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Root & Health Monitoring Endpoints for Render Web Service Health Checks
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'Maison Auralic Haute Joaillerie REST API',
      status: 'online',
      environment: config.env,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'Maison Auralic Haute Joaillerie REST API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Primary REST API Router
  app.use('/api', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
