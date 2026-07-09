import { Request, Response } from 'express';
import { universalModelHub } from '../../core/universal-model-hub';
import { neuralBridgeManager } from '../../core/neural-bridge';

export class ModelsController {
  async getProviders(req: Request, res: Response): Promise<void> {
    const metrics = universalModelHub.getMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  }
  
  async request(req: Request, res: Response): Promise<void> {
    const { provider, model, prompt, options } = req.body;
    
    const response = await universalModelHub.request(
      { provider, model },
      prompt,
      options
    );
    
    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  }
  
  async createBridge(req: Request, res: Response): Promise<void> {
    const { modelAProvider, modelAModel, modelBProvider, modelBModel, connectionType } = req.body;
    
    const bridge = await neuralBridgeManager.createBridge(
      modelAProvider,
      modelAModel,
      modelBProvider,
      modelBModel,
      connectionType
    );
    
    res.status(201).json({
      success: true,
      data: bridge,
      timestamp: new Date().toISOString(),
    });
  }
  
  async fusedRequest(req: Request, res: Response): Promise<void> {
    const { bridgeId, prompt } = req.body;
    
    const response = await neuralBridgeManager.executeFusedRequest(bridgeId, prompt);
    
    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  }
  
  async getBridges(req: Request, res: Response): Promise<void> {
    const bridges = neuralBridgeManager.getAllBridges();
    
    res.json({
      success: true,
      data: bridges,
      count: bridges.length,
      timestamp: new Date().toISOString(),
    });
  }
}

export const modelsController = new ModelsController();