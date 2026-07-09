interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class CacheManager {
  private l1Cache: Map<string, CacheEntry> = new Map(); // In-memory, fastest
  private l2Cache: Map<string, CacheEntry> = new Map(); // Larger, slightly slower
  
  private maxL1Size: number = 10000;
  private maxL2Size: number = 100000;
  private defaultTTL: number = 300000; // 5 minutes
  
  async get<T>(key: string): Promise<T | null> {
    // Check L1 first
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      l1Entry.hits++;
      return l1Entry.value as T;
    }
    
    // Check L2
    const l2Entry = this.l2Cache.get(key);
    if (l2Entry && !this.isExpired(l2Entry)) {
      l2Entry.hits++;
      // Promote to L1
      this.l1Cache.set(key, l2Entry);
      this.evictL1IfNeeded();
      return l2Entry.value as T;
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
    };
    
    // Always set in L1
    this.l1Cache.set(key, entry);
    this.evictL1IfNeeded();
    
    // Also set in L2 for persistence
    this.l2Cache.set(key, entry);
    this.evictL2IfNeeded();
  }
  
  async delete(key: string): Promise<void> {
    this.l1Cache.delete(key);
    this.l2Cache.delete(key);
  }
  
  async clear(): Promise<void> {
    this.l1Cache.clear();
    this.l2Cache.clear();
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  private evictL1IfNeeded(): void {
    while (this.l1Cache.size > this.maxL1Size) {
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey) {
        this.l1Cache.delete(oldestKey);
      }
    }
  }
  
  private evictL2IfNeeded(): void {
    while (this.l2Cache.size > this.maxL2Size) {
      const oldestKey = this.l2Cache.keys().next().value;
      if (oldestKey) {
        this.l2Cache.delete(oldestKey);
      }
    }
  }
  
  getStats(): { l1: { size: number; maxSize: number }; l2: { size: number; maxSize: number } } {
    return {
      l1: { size: this.l1Cache.size, maxSize: this.maxL1Size },
      l2: { size: this.l2Cache.size, maxSize: this.maxL2Size },
    };
  }
}

export const cacheManager = new CacheManager();