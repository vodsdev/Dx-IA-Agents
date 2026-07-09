import { v4 as uuidv4 } from 'uuid';
import type { IAgent, AgentType, AgentConfig } from '../types/common.types';
import { CONSTANTS } from '../config/constants';

export class AgentFactory {
  private static instance: AgentFactory;
  
  static getInstance(): AgentFactory {
    if (!AgentFactory.instance) {
      AgentFactory.instance = new AgentFactory();
    }
    return AgentFactory.instance;
  }
  
  createAgent(config: AgentConfig): IAgent {
    const id = uuidv4();
    const type = config.type;
    const capabilities = config.capabilities || [...(CONSTANTS.AGENT_CAPABILITIES[type] || [])];
    
    const agent: IAgent = {
      id,
      name: config.name || this.generateName(type),
      type,
      status: 'idle',
      capabilities,
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
        specialization: this.getDefaultSpecialization(type),
      },
    };
    
    return agent;
  }
  
  createBatch(count: number, typeDistribution?: Record<AgentType, number>): IAgent[] {
    const agents: IAgent[] = [];
    
    if (typeDistribution) {
      for (const [type, count] of Object.entries(typeDistribution)) {
        for (let i = 0; i < count; i++) {
          agents.push(this.createAgent({ type: type as AgentType, capabilities: [] }));
        }
      }
    } else {
      const types = CONSTANTS.AGENT_TYPES;
      for (let i = 0; i < count; i++) {
        const type = types[i % types.length] as AgentType;
        agents.push(this.createAgent({ type, capabilities: [] }));
      }
    }
    
    return agents;
  }
  
  private generateName(type: AgentType): string {
    const prefixes: Record<string, string[]> = {
      processor: ['Proc', 'DataForge', 'StreamLine'],
      analyzer: ['Analy', 'DeepScan', 'Insight'],
      executor: ['Exec', 'ActionBot', 'TaskRunner'],
      coordinator: ['Coord', 'Orchestra', 'Conductor'],
      validator: ['Valid', 'Guardian', 'Checker'],
      designer: ['Design', 'Creator', 'Artist'],
      security: ['Secure', 'Sentinel', 'Guard'],
      devops: ['DevOps', 'Pipeline', 'Deployer'],
      'data-scientist': ['DataSci', 'MLBrain', 'StatBot'],
      qa: ['QA', 'Tester', 'Verifier'],
    };
    
    const prefix = prefixes[type]?.[Math.floor(Math.random() * 3)] || 'Agent';
    return `${prefix}-${uuidv4().slice(0, 6)}`;
  }
  
  private getDefaultSpecialization(type: AgentType): string[] {
    const specializations: Record<string, string[]> = {
      processor: ['data_processing', 'etl', 'transformation'],
      analyzer: ['pattern_recognition', 'statistics', 'ml_analysis'],
      executor: ['automation', 'scripting', 'api_integration'],
      coordinator: ['project_management', 'resource_planning', 'orchestration'],
      validator: ['code_review', 'testing', 'quality_assurance'],
      designer: ['ui_ux', 'frontend', 'design_systems'],
      security: ['vulnerability_scanning', 'penetration_testing', 'audit'],
      devops: ['ci_cd', 'infrastructure', 'monitoring'],
      'data-scientist': ['machine_learning', 'deep_learning', 'data_analysis'],
      qa: ['automated_testing', 'performance_testing', 'regression'],
    };
    
    return specializations[type] || ['general'];
  }
}

export const agentFactory = AgentFactory.getInstance();