import { agentManager } from './agent-manager';
import { universalModelHub } from './universal-model-hub';
import { memoryManager } from './memory-manager';

export class HealthChecker {
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    components: Record<string, { status: string; details?: any }>;
  }> {
    const components: Record<string, any> = {};
    let overallHealthy = true;
    
    // Check Agent Manager
    try {
      const agentCount = agentManager.getAgentCount();
      components.agents = {
        status: agentCount.total >= 1000 ? 'healthy' : 'degraded',
        total: agentCount.total,
        byType: agentCount.byType,
      };
    } catch (error) {
      components.agents = { status: 'unhealthy', error };
      overallHealthy = false;
    }
    
    // Check Model Hub
    try {
      const modelMetrics = universalModelHub.getMetrics();
      const modelCount = Object.keys(modelMetrics).length;
      components.models = {
        status: modelCount > 0 ? 'healthy' : 'degraded',
        available: modelCount,
      };
    } catch (error) {
      components.models = { status: 'unhealthy', error };
      overallHealthy = false;
    }
    
    // Check Memory
    try {
      const memoryStats = memoryManager.getMemoryStats();
      components.memory = {
        status: 'healthy',
        ...memoryStats,
      };
    } catch (error) {
      components.memory = { status: 'unhealthy', error };
      overallHealthy = false;
    }
    
    return {
      status: overallHealthy ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      components,
    };
  }
}

export const healthChecker = new HealthChecker();