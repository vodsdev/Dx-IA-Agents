interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  
  constructor() {
    this.configs.set('default', { maxRequests: 1000, windowMs: 60000 });
    this.configs.set('coordinator', { maxRequests: 100, windowMs: 60000 });
    this.configs.set('validator', { maxRequests: 200, windowMs: 60000 });
    this.configs.set('processor', { maxRequests: 500, windowMs: 60000 });
    this.configs.set('analyzer', { maxRequests: 300, windowMs: 60000 });
    this.configs.set('api', { maxRequests: 1000, windowMs: 60000 });
  }
  
  async checkLimit(key: string, type: string = 'default'): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const config = this.configs.get(type) || this.configs.get('default')!;
    const now = Date.now();
    
    let record = this.records.get(key);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + config.windowMs };
      this.records.set(key, record);
    }
    
    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((record.resetTime - now) / 1000),
      };
    }
    
    record.count++;
    
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
  }
  
  addConfig(name: string, config: RateLimitConfig): void {
    this.configs.set(name, config);
  }
  
  getStats(): Map<string, { total: number; remaining: number }> {
    const stats = new Map<string, { total: number; remaining: number }>();
    
    for (const [key, record] of this.records) {
      const config = this.configs.get('default')!;
      stats.set(key, {
        total: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - record.count),
      });
    }
    
    return stats;
  }
  
  reset(key: string): void {
    this.records.delete(key);
  }
  
  resetAll(): void {
    this.records.clear();
  }
}

export const rateLimiter = new RateLimiter();