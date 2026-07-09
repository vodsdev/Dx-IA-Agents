export class TokenManager {
  private totalTokensUsed: number = 0;
  private tokenLimit: number;
  private resetTime: number;
  private usageHistory: Array<{ timestamp: number; tokens: number }> = [];
  
  constructor(tokenLimit: number = 1000000) {
    this.tokenLimit = tokenLimit;
    this.resetTime = Date.now() + 60000;
  }
  
  async consumeTokens(count: number): Promise<boolean> {
    this.checkReset();
    
    if (this.totalTokensUsed + count > this.tokenLimit) {
      return false;
    }
    
    this.totalTokensUsed += count;
    this.usageHistory.push({ timestamp: Date.now(), tokens: count });
    
    // Keep last 1000 entries
    if (this.usageHistory.length > 1000) {
      this.usageHistory.shift();
    }
    
    return true;
  }
  
  private checkReset(): void {
    if (Date.now() > this.resetTime) {
      this.totalTokensUsed = 0;
      this.resetTime = Date.now() + 60000;
    }
  }
  
  getRemainingTokens(): number {
    this.checkReset();
    return Math.max(0, this.tokenLimit - this.totalTokensUsed);
  }
  
  getUsageStats(): {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    resetIn: number;
  } {
    this.checkReset();
    
    return {
      used: this.totalTokensUsed,
      limit: this.tokenLimit,
      remaining: this.getRemainingTokens(),
      percentage: Math.round((this.totalTokensUsed / this.tokenLimit) * 100),
      resetIn: Math.max(0, this.resetTime - Date.now()),
    };
  }
  
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  getUsageHistory(): Array<{ timestamp: number; tokens: number }> {
    return this.usageHistory;
  }
}

export const tokenManager = new TokenManager();