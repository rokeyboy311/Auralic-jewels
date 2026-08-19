import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/api.routes';

export function createApp() {
  const app = express();

  // Security Headers & Logging
  app.use(helmet());
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  // Strict & Configurable CORS
  app.use(
    cors({
      origin: [config.frontendUrl, 'http://localhost:3000', 'https://*.vercel.app'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount Primary REST API Router
  app.use('/api', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
