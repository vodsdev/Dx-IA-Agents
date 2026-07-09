type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxRequests: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenRequests: number = 0;
  private config: CircuitBreakerConfig;
  
  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: config?.failureThreshold || 5,
      resetTimeout: config?.resetTimeout || 30000,
      halfOpenMaxRequests: config?.halfOpenMaxRequests || 3,
    };
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenRequests = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenRequests >= this.config.halfOpenMaxRequests) {
        throw new Error('Circuit breaker HALF_OPEN limit reached');
      }
      this.halfOpenRequests++;
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getMetrics(): { state: CircuitState; failureCount: number; lastFailure: string } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailure: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : 'never',
    };
  }
  
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.halfOpenRequests = 0;
  }
}

export const circuitBreaker = new CircuitBreaker();