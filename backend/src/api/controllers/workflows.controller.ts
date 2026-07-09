import { Request, Response } from 'express';
import { workflowEngine } from '../../workflows/workflow-engine';
import { z } from 'zod';

const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(z.object({
    name: z.string(),
    type: z.string(),
    requiredCapabilities: z.array(z.string()),
    priority: z.number().min(0).max(3).default(2),
  })),
});

export class WorkflowsController {
  async getAll(req: Request, res: Response): Promise<void> {
    const workflows = await workflowEngine.getAllWorkflows();
    
    res.json({
      success: true,
      data: workflows,
      count: workflows.length,
      timestamp: new Date().toISOString(),
    });
  }
  
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const workflow = await workflowEngine.getWorkflow(id);
    
    if (!workflow) {
      res.status(404).json({ success: false, error: 'Workflow non trouvé' });
      return;
    }
    
    res.json({
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    });
  }
  
  async create(req: Request, res: Response): Promise<void> {
    const data = createWorkflowSchema.parse(req.body);
    
    const workflow = await workflowEngine.createWorkflow(data);
    
    res.status(201).json({
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    });
  }
  
  async execute(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const result = await workflowEngine.executeWorkflow(id);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }
  
  async cancel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    await workflowEngine.cancelWorkflow(id);
    
    res.json({
      success: true,
      message: 'Workflow annulé',
      timestamp: new Date().toISOString(),
    });
  }
}

export const workflowsController = new WorkflowsController();