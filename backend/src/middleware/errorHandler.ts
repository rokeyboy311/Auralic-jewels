import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Aurelic Server Error]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred in the workshop server.';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.env === 'development' ? { stack: err.stack } : {}),
  });
}
