export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  
  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} non trouvé`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Limite de requêtes atteinte') {
    super(message, 429, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class CircuitBreakerError extends AppError {
  constructor(message: string = 'Circuit breaker ouvert') {
    super(message, 503, 'CIRCUIT_BREAKER');
    this.name = 'CircuitBreakerError';
  }
}

export class ErrorHandler {
  static handle(error: Error): { statusCode: number; body: any } {
    if (error instanceof AppError) {
      return {
        statusCode: error.statusCode,
        body: {
          success: false,
          error: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
        },
      };
    }
    
    console.error('❌ Erreur non gérée:', error);
    
    return {
      statusCode: 500,
      body: {
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
    };
  }
}