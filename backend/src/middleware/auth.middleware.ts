import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'customer' | 'atelier_staff' | 'admin' | 'superadmin' | 'gemologist' | 'master_jeweller';
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Authenticates requests using either Bearer JWT token or HttpOnly cookie.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = (req as any).cookies?.aurelia_auth_token;

  let token = cookieToken;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required to access this resource.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
}

/**
 * Optional authentication: attaches user if token is valid, otherwise continues anonymously.
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      req.user = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    } catch {
      // Ignored for optional authentication
    }
  }
  next();
}

/**
 * Requires Administrative privileges (ADMIN or SUPER_ADMIN).
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ success: false, error: 'Administrative privileges required.' });
    }
    next();
  });
}

/**
 * Requires Super Administrator privileges (SUPER_ADMIN only).
 */
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Super Administrator privileges required.' });
    }
    next();
  });
}

/**
 * Requires Atelier Staff, Gemologist, Master Jeweller, or Admin privileges.
 */
export function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const allowed = ['atelier_staff', 'gemologist', 'master_jeweller', 'admin', 'superadmin'];
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Atelier staff privileges required.' });
    }
    next();
  });
}
