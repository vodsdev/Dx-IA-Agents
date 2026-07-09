import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { config } from '../config/index';
import { CONSTANTS } from '../config/constants';
import { eventBus } from './event-bus';
import type { IAgent, AgentConfig, AgentType, AgentStatus, AgentPerformance, AgentMetadata } from '../types/common.types';

export class AgentManager {
  private agents: Map<string, IAgent> = new Map();
  private redis: Redis;
  private maxAgents: number;
  
  constructor() {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      maxRetriesPerRequest: 3,
    });
    this.maxAgents = config.agents.maxAgents;
  }
  
  async initializeAgentPool(): Promise<void> {
    console.log(`🚀 Initialisation du pool de ${this.maxAgents} agents...`);
    
    const batchSize = 100;
    const totalBatches = Math.ceil(this.maxAgents / batchSize);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const promises = [];
      const startIndex = batch * batchSize;
      const endIndex = Math.min(startIndex + batchSize, this.maxAgents);
      
      for (let i = startIndex; i < endIndex; i++) {
        promises.push(this.createAgent({
          type: this.getAgentType(i),
          capabilities: this.getCapabilities(i),
        }));
      }
      
      const agents = await Promise.all(promises);
      agents.forEach(agent => {
        this.agents.set(agent.id, agent);
        this.cacheAgent(agent);
      });
      
      console.log(`  📦 Lot ${batch + 1}/${totalBatches}: ${agents.length} agents créés`);
    }
    
    console.log(`✅ Pool de ${this.agents.size} agents initialisé avec succès`);
    eventBus.emit('agents:ready', this.agents.size);
  }
  
  private getAgentType(index: number): AgentType {
    const types = CONSTANTS.AGENT_TYPES;
    return types[index % types.length] as AgentType;
  }
  
  private getCapabilities(index: number): string[] {
    const types = CONSTANTS.AGENT_TYPES;
    const type = types[index % types.length];
    return [...(CONSTANTS.AGENT_CAPABILITIES[type] || [])];
  }
  
  async createAgent(config: AgentConfig): Promise<IAgent> {
    const agent: IAgent = {
      id: uuidv4(),
      name: config.name || `dx-agent-${uuidv4().slice(0, 8)}`,
      type: config.type,
      status: 'idle',
      capabilities: config.capabilities,
      performance: {
        tasksCompleted: 0,
        successRate: 0.95 + Math.random() * 0.05,
        averageResponseTime: 100 + Math.random() * 400,
        tokensProcessed: 0,
        lastActive: new Date().toISOString(),
      },
      metadata: {
        created: new Date().toISOString(),
        version: '2.0.0',
      },
    };
    
    eventBus.emitAgentCreated(agent.id, agent.type);
    return agent;
  }
  
  async cacheAgent(agent: IAgent): Promise<void> {
    await this.redis.hset(
      `agent:${agent.id}`,
      {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        capabilities: JSON.stringify(agent.capabilities),
        performance: JSON.stringify(agent.performance),
        metadata: JSON.stringify(agent.metadata),
      }
    );
    await this.redis.expire(`agent:${agent.id}`, 3600);
  }
  
  async getAgent(id: string): Promise<IAgent | undefined> {
    if (this.agents.has(id)) {
      return this.agents.get(id);
    }
    
    const cached = await this.redis.hgetall(`agent:${id}`);
    if (cached && cached.id) {
      const agent: IAgent = {
        id: cached.id,
        name: cached.name,
        type: cached.type as AgentType,
        status: cached.status as AgentStatus,
        capabilities: JSON.parse(cached.capabilities || '[]'),
        performance: JSON.parse(cached.performance || '{}'),
        metadata: JSON.parse(cached.metadata || '{}'),
      };
      this.agents.set(id, agent);
      return agent;
    }
    
    return undefined;
  }
  
  async updateAgentStatus(id: string, status: AgentStatus): Promise<IAgent | null> {
    const agent = this.agents.get(id);
    if (!agent) return null;
    
    const oldStatus = agent.status;
    agent.status = status;
    agent.performance.lastActive = new Date().toISOString();
    
    await this.cacheAgent(agent);
    eventBus.emitAgentStatusChanged(id, oldStatus, status);
    
    return agent;
  }
  
  async getAgentsByType(type: AgentType): Promise<IAgent[]> {
    return Array.from(this.agents.values()).filter(a => a.type === type);
  }
  
  async getAvailableAgents(type?: AgentType): Promise<IAgent[]> {
    let agents = Array.from(this.agents.values()).filter(a => a.status === 'idle');
    if (type) {
      agents = agents.filter(a => a.type === type);
    }
    return agents.sort((a, b) => b.performance.successRate - a.performance.successRate);
  }
  
  getAgentCount(): { total: number; byType: Record<string, number>; byStatus: Record<string, number> } {
    const agents = Array.from(this.agents.values());
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    agents.forEach(agent => {
      byType[agent.type] = (byType[agent.type] || 0) + 1;
      byStatus[agent.status] = (byStatus[agent.status] || 0) + 1;
    });
    
    return { total: agents.length, byType, byStatus };
  }
  
  async cleanup(): Promise<void> {
    this.agents.clear();
    await this.redis.quit();
  }
}

export const agentManager = new AgentManager();