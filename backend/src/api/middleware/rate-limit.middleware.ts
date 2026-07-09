import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(maxRequests: number = 1000, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    let record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      requestCounts.set(key, record);
    }
    
    record.count++;
    
    if (record.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }
    
    next();
  };
}