import { universalModelHub } from './universal-model-hub';
import type { ModelReference, INeuralBridge, ConnectionType } from '../types/common.types';

export class NeuralBridgeManager {
  private bridges: Map<string, INeuralBridge> = new Map();
  
  async createBridge(
    modelAProvider: string,
    modelAModel: string,
    modelBProvider: string,
    modelBModel: string,
    connectionType: ConnectionType = 'parallel'
  ): Promise<INeuralBridge> {
    const modelA: ModelReference = {
      provider: modelAProvider as any,
      model: modelAModel,
    };
    const modelB: ModelReference = {
      provider: modelBProvider as any,
      model: modelBModel,
    };
    
    const bridge = await universalModelHub.createNeuralBridge(modelA, modelB, connectionType);
    this.bridges.set(bridge.id, bridge);
    
    return bridge;
  }
  
  async executeFusedRequest(bridgeId: string, prompt: string): Promise<string> {
    const bridge = this.bridges.get(bridgeId);
    if (!bridge) throw new Error(`Bridge not found: ${bridgeId}`);
    
    const response = await universalModelHub.fusedRequest(bridgeId, prompt);
    return response.response;
  }
  
  getOptimalBridge(taskType: string): INeuralBridge | null {
    const bridges = Array.from(this.bridges.values()).filter(b => b.active);
    
    if (bridges.length === 0) return null;
    
    // Return bridge with highest fusion quality
    return bridges.sort((a, b) => b.metrics.fusionQuality - a.metrics.fusionQuality)[0];
  }
  
  getAllBridges(): INeuralBridge[] {
    return Array.from(this.bridges.values());
  }
}

export const neuralBridgeManager = new NeuralBridgeManager();