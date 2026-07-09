import { EventEmitter } from 'events';
import { agentManager } from './agent-manager';
import { eventBus } from './event-bus';
import type { IAgent, AgentStatus } from '../types/common.types';

interface LifecycleState {
  agentId: string;
  currentStatus: AgentStatus;
  statusHistory: Array<{ status: AgentStatus; timestamp: string; reason?: string }>;
  heartbeatCount: number;
  lastHeartbeat: string;
  errorCount: number;
  maxErrors: number;
}

export class AgentLifecycle extends EventEmitter {
  private states: Map<string, LifecycleState> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  initialize(): void {
    console.log('💓 Initialisation du gestionnaire de cycle de vie...');
    
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, 30000);
    
    eventBus.on('agent:created', ({ agentId, agentType }) => {
      this.registerAgent(agentId);
    });
    
    console.log('✅ Gestionnaire de cycle de vie initialisé');
  }
  
  registerAgent(agentId: string): void {
    this.states.set(agentId, {
      agentId,
      currentStatus: 'idle',
      statusHistory: [{ status: 'idle', timestamp: new Date().toISOString(), reason: 'Agent créé' }],
      heartbeatCount: 0,
      lastHeartbeat: new Date().toISOString(),
      errorCount: 0,
      maxErrors: 5,
    });
  }
  
  async transition(agentId: string, newStatus: AgentStatus, reason?: string): Promise<boolean> {
    const state = this.states.get(agentId);
    if (!state) return false;
    
    const oldStatus = state.currentStatus;
    
    // Validate transition
    if (!this.isValidTransition(oldStatus, newStatus)) {
      console.warn(`⚠️ Transition invalide: ${oldStatus} -> ${newStatus} pour l'agent ${agentId}`);
      return false;
    }
    
    state.currentStatus = newStatus;
    state.statusHistory.push({ status: newStatus, timestamp: new Date().toISOString(), reason });
    
    await agentManager.updateAgentStatus(agentId, newStatus);
    
    this.emit('transition', { agentId, oldStatus, newStatus, reason });
    
    return true;
  }
  
  private isValidTransition(from: AgentStatus, to: AgentStatus): boolean {
    const validTransitions: Record<AgentStatus, AgentStatus[]> = {
      'idle': ['active', 'offline', 'error'],
      'active': ['busy', 'idle', 'error', 'offline'],
      'busy': ['active', 'idle', 'error', 'offline'],
      'error': ['idle', 'offline'],
      'offline': ['idle'],
    };
    
    return validTransitions[from]?.includes(to) || false;
  }
  
  heartbeat(agentId: string): void {
    const state = this.states.get(agentId);
    if (!state) return;
    
    state.heartbeatCount++;
    state.lastHeartbeat = new Date().toISOString();
  }
  
  private checkHeartbeats(): void {
    const now = Date.now();
    const timeout = 120000; // 2 minutes
    
    for (const [agentId, state] of this.states) {
      const lastBeat = new Date(state.lastHeartbeat).getTime();
      if (now - lastBeat > timeout && state.currentStatus !== 'offline') {
        console.warn(`⚠️ Agent ${agentId} ne répond plus, marquage offline`);
        this.transition(agentId, 'offline', 'Heartbeat timeout');
      }
    }
  }
  
  recordError(agentId: string): void {
    const state = this.states.get(agentId);
    if (!state) return;
    
    state.errorCount++;
    
    if (state.errorCount >= state.maxErrors) {
      this.transition(agentId, 'error', `Trop d'erreurs (${state.errorCount})`);
    }
  }
  
  getState(agentId: string): LifecycleState | undefined {
    return this.states.get(agentId);
  }
  
  getAllStates(): Map<string, LifecycleState> {
    return this.states;
  }
  
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.states.clear();
  }
}

export const agentLifecycle = new AgentLifecycle();