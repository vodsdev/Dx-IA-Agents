import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { universalModelHub } from '../core/universal-model-hub';
import { memoryManager } from '../core/memory-manager';
import type { IAgent, AgentType, AgentStatus, ModelReference } from '../types/common.types';

export abstract class BaseAgent extends EventEmitter {
  public id: string;
  public name: string;
  public type: AgentType;
  public status: AgentStatus;
  public capabilities: string[];
  public teamId?: string;
  protected modelRef: ModelReference;
  
  constructor(type: AgentType, name?: string) {
    super();
    this.id = uuidv4();
    this.name = name || `${type}-${this.id.slice(0, 6)}`;
    this.type = type;
    this.status = 'idle';
    this.capabilities = [];
    this.modelRef = { provider: 'anthropic', model: 'claude-3-6-sonnet-20241022' };
  }
  
  abstract execute(task: any): Promise<any>;
  
  async think(prompt: string): Promise<string> {
    this.status = 'active';
    
    try {
      const response = await universalModelHub.request(this.modelRef, prompt);
      this.status = 'idle';
      return response.response;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
  
  async remember(context: any): Promise<void> {
    await memoryManager.memorize(this.id, this.teamId || 'default', context);
  }
  
  async recall(query: string): Promise<any> {
    return memoryManager.recall(query);
  }
  
  setModel(provider: string, model: string): void {
    this.modelRef = { provider: provider as any, model };
  }
  
  getInfo(): Partial<IAgent> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      capabilities: this.capabilities,
      teamId: this.teamId,
    };
  }
}