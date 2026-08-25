import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function normalizeRole(roleStr?: string): 'customer' | 'admin' {
  if (!roleStr) return 'customer';
  const lower = roleStr.toLowerCase();
  if (lower === 'admin' || lower === 'superadmin' || lower === 'administrator') return 'admin';
  return 'customer';
}

/**
 * Strict authentication guard
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token =
    req.cookies?.[config.cookieName] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to your customer account.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: normalizeRole(decoded.role),
      name: decoded.name,
    };
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or cryptographic signature invalid. Please sign in again.',
    });
  }
}

/**
 * Optional authentication middleware
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token =
    req.cookies?.[config.cookieName] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: normalizeRole(decoded.role),
        name: decoded.name,
      };
    } catch {
      // Ignore invalid optional tokens
    }
  }
  next();
}

/**
 * Admin role guard
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Administrative privileges required.',
      });
    }
    next();
  });
}
