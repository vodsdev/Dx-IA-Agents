import { Router, Request, Response } from 'express';
import { agentManager } from '../../core/agent-manager';
import { universalModelHub } from '../../core/universal-model-hub';
import { memoryManager } from '../../core/memory-manager';

const router = Router();

router.get('/stats', (req: Request, res: Response) => {
  const agentStats = agentManager.getAgentCount();
  const modelMetrics = universalModelHub.getMetrics();
  const memoryStats = memoryManager.getMemoryStats();
  
  res.json({
    success: true,
    data: {
      agents: agentStats,
      models: modelMetrics,
      memory: memoryStats,
    },
    timestamp: new Date().toISOString(),
  });
});

router.post('/reset', async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Reset du système initié',
    timestamp: new Date().toISOString(),
  });
});

export { router as adminRoutes };