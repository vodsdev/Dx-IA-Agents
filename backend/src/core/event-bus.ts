import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
  private static instance: EventBus;
  
  private constructor() {
    super();
    this.setMaxListeners(2000);
  }
  
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  emitAgentCreated(agentId: string, agentType: string): void {
    this.emit('agent:created', { agentId, agentType, timestamp: new Date().toISOString() });
  }
  
  emitAgentStatusChanged(agentId: string, oldStatus: string, newStatus: string): void {
    this.emit('agent:status:changed', { agentId, oldStatus, newStatus, timestamp: new Date().toISOString() });
  }
  
  emitTeamFormed(teamId: string, memberCount: number): void {
    this.emit('team:formed', { teamId, memberCount, timestamp: new Date().toISOString() });
  }
  
  emitSwarmFormed(swarmId: string, memberCount: number): void {
    this.emit('swarm:formed', { swarmId, memberCount, timestamp: new Date().toISOString() });
  }
  
  emitWorkflowStarted(workflowId: string): void {
    this.emit('workflow:started', { workflowId, timestamp: new Date().toISOString() });
  }
  
  emitWorkflowCompleted(workflowId: string, duration: number): void {
    this.emit('workflow:completed', { workflowId, duration, timestamp: new Date().toISOString() });
  }
  
  emitNeuralBridgeCreated(bridgeId: string, modelA: string, modelB: string): void {
    this.emit('neural-bridge:created', { bridgeId, modelA, modelB, timestamp: new Date().toISOString() });
  }
  
  emitMemoryConsolidated(layer: string, itemCount: number): void {
    this.emit('memory:consolidated', { layer, itemCount, timestamp: new Date().toISOString() });
  }
}

export const eventBus = EventBus.getInstance();