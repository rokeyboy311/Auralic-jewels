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
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows images served by backend to be displayed on Vercel frontend
  }));
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Strict CORS Configuration
  const allowedOrigins = [
    config.frontendUrl,
    'https://aurelic-jewels.vercel.app',
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
        if (origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not permitted by CORS policy`), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Global rate limiter (300 requests per 15 minutes per IP)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please try again later.' },
  });
  app.use('/api', globalLimiter);

  // Body Parsing with support for high-res images in base64
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(cookieParser());

  // Normalize multiple slashes in URLs (e.g. //products -> /products)
  app.use((req, _res, next) => {
    if (req.url.includes('//')) {
      req.url = req.url.replace(/\/+/g, '/');
    }
    next();
  });

  // Root & Health Monitoring Endpoints for Render Web Service Health Checks
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'Aurelic Jewels REST API',
      status: 'online',
      mediaStorage: 'Neon PostgreSQL Image Vault',
      payments: 'Direct Workshop Consignment',
      environment: config.env,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'Aurelic Jewels REST API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Primary REST API Router on both /api and root / for universal compatibility
  app.use('/api', apiRoutes);
  app.use('/', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
