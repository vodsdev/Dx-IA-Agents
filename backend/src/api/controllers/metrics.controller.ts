import { Request, Response } from 'express';
import { metricsCollector } from '../../core/metrics-collector';
import { healthChecker } from '../../core/health-checker';

export class MetricsController {
  async getMetrics(req: Request, res: Response): Promise<void> {
    const metrics = metricsCollector.getAllMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  }
  
  async getHealth(req: Request, res: Response): Promise<void> {
    const health = await healthChecker.checkHealth();
    
    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString(),
    });
  }
  
  async getSystemInfo(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage(),
      },
      timestamp: new Date().toISOString(),
    });
  }
}

export const metricsController = new MetricsController();