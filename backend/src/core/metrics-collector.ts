export class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();
  private counters: Map<string, number> = new Map();
  
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Keep only last 1000 values
    if (this.metrics.get(name)!.length > 1000) {
      this.metrics.get(name)!.shift();
    }
  }
  
  incrementCounter(name: string): void {
    this.counters.set(name, (this.counters.get(name) || 0) + 1);
  }
  
  getMetric(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;
    
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }
  
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }
  
  getAllMetrics(): any {
    const result: any = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetric(name);
    }
    
    for (const [name, value] of this.counters) {
      result[`counter:${name}`] = value;
    }
    
    return result;
  }
}

export const metricsCollector = new MetricsCollector();