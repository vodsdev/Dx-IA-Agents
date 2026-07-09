export class PrometheusMetrics {
  private metrics: Map<string, { help: string; type: string; values: number[] }> = new Map();
  
  constructor() {
    this.registerMetric('dx_agents_total', 'Nombre total d\'agents', 'gauge');
    this.registerMetric('dx_agents_active', 'Nombre d\'agents actifs', 'gauge');
    this.registerMetric('dx_workflows_total', 'Nombre total de workflows', 'counter');
    this.registerMetric('dx_tasks_completed', 'Nombre de tâches complétées', 'counter');
    this.registerMetric('dx_model_requests', 'Nombre de requêtes aux modèles', 'counter');
    this.registerMetric('dx_model_latency', 'Latence des modèles en ms', 'histogram');
  }
  
  private registerMetric(name: string, help: string, type: string): void {
    this.metrics.set(name, { help, type, values: [] });
  }
  
  setGauge(name: string, value: number): void {
    const metric = this.metrics.get(name);
    if (metric && metric.type === 'gauge') {
      metric.values = [value];
    }
  }
  
  incrementCounter(name: string): void {
    const metric = this.metrics.get(name);
    if (metric && metric.type === 'counter') {
      const current = metric.values[0] || 0;
      metric.values = [current + 1];
    }
  }
  
  observeHistogram(name: string, value: number): void {
    const metric = this.metrics.get(name);
    if (metric && metric.type === 'histogram') {
      metric.values.push(value);
      if (metric.values.length > 1000) metric.values.shift();
    }
  }
  
  getMetrics(): string {
    let output = '';
    
    for (const [name, metric] of this.metrics) {
      output += `# HELP ${name} ${metric.help}\n`;
      output += `# TYPE ${name} ${metric.type}\n`;
      
      if (metric.type === 'histogram') {
        const values = metric.values;
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          output += `${name}_avg ${avg}\n`;
          output += `${name}_count ${values.length}\n`;
        }
      } else {
        const value = metric.values[0] || 0;
        output += `${name} ${value}\n`;
      }
    }
    
    return output;
  }
}

export const prometheusMetrics = new PrometheusMetrics();