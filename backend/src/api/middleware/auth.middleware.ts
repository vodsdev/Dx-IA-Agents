import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';
import { auth } from '../../security/auth'; // Import the auth service

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    mfaEnabled?: boolean;
    mfaSecret?: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ success: false, error: 'Token requis' });
    return;
  }
  
  try {
    const decoded = auth.verifyToken(token);
    if (!decoded) {
      res.status(401).json({ success: false, error: 'Token invalide' });
      return;
    }

    // In a real application, you would fetch the user from the database here
    // to get their current role, MFA status, etc.
    // For now, we'll assume the token contains enough info or use dummy data.
    req.user = {
      id: decoded.id,
      role: decoded.role,
      // mfaEnabled: user.mfaEnabled, // Assuming this comes from user data
      // mfaSecret: user.mfaSecret, // Only if needed for verification in this middleware
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token invalide' });
  }
}

export function authorize(roles: string[] = []): (req: AuthRequest, res: Response, next: NextFunction) => void {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Accès non autorisé' });
      return;
    }
    next();
  };
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  authorize(['admin'])(req, res, next);
}