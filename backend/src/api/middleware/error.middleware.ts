import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('❌ Erreur:', err.message);
  
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  if (err.name === 'NotFoundError') {
    res.status(404).json({
      success: false,
      error: 'Ressource non trouvée',
      details: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
}