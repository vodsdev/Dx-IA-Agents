import { Request, Response } from 'express';
import { agentManager } from '../../core/agent-manager';
import { z } from 'zod';

const createAgentSchema = z.object({
  type: z.enum(['processor', 'analyzer', 'executor', 'coordinator', 'validator', 'designer', 'security', 'devops', 'data-scientist', 'qa']),
  name: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

export class AgentsController {
  async getAll(req: Request, res: Response): Promise<void> {
    const { type, status, limit, offset } = req.query;
    
    const agentCount = agentManager.getAgentCount();
    
    res.json({
      success: true,
      data: agentCount,
      timestamp: new Date().toISOString(),
    });
  }
  
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const agent = await agentManager.getAgent(id);
    
    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent non trouvé' });
      return;
    }
    
    res.json({
      success: true,
      data: agent,
      timestamp: new Date().toISOString(),
    });
  }
  
  async create(req: Request, res: Response): Promise<void> {
    const data = createAgentSchema.parse(req.body);
    
    const agent = await agentManager.createAgent({
      type: data.type,
      name: data.name,
      capabilities: data.capabilities || [],
    });
    
    res.status(201).json({
      success: true,
      data: agent,
      timestamp: new Date().toISOString(),
    });
  }
  
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;
    
    const agent = await agentManager.updateAgentStatus(id, status);
    
    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent non trouvé' });
      return;
    }
    
    res.json({
      success: true,
      data: agent,
      timestamp: new Date().toISOString(),
    });
  }
  
  async getAvailable(req: Request, res: Response): Promise<void> {
    const { type } = req.query;
    const agents = await agentManager.getAvailableAgents(type as any);
    
    res.json({
      success: true,
      data: agents,
      count: agents.length,
      timestamp: new Date().toISOString(),
    });
  }
}

export const agentsController = new AgentsController();