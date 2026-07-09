import { v4 as uuidv4 } from 'uuid';
import { agentManager } from '../core/agent-manager';
import { eventBus } from '../core/event-bus';
import type { IAgent, AgentType } from '../types/common.types';

interface Swarm {
  id: string;
  mission: string;
  members: IAgent[];
  coordinator: IAgent | null;
  subTeams: SubTeam[];
  status: 'forming' | 'active' | 'dissolving' | 'dissolved';
  birthTime: number;
  ttl: number;
}

interface SubTeam {
  id: string;
  members: IAgent[];
  leader: IAgent | null;
  task: string;
  status: 'forming' | 'active' | 'completed';
}

export class SwarmOrchestrator {
  private activeSwarms: Map<string, Swarm> = new Map();
  
  async formSwarm(mission: string, requiredCapacity: number = 10): Promise<Swarm> {
    console.log(`🧬 Formation d'un essaim pour: ${mission}`);
    
    const swarm: Swarm = {
      id: `swarm-${uuidv4().slice(0, 8)}`,
      mission,
      members: [],
      coordinator: null,
      subTeams: [],
      status: 'forming',
      birthTime: Date.now(),
      ttl: 3600000, // 1 hour
    };
    
    // Recruit coordinator
    const coordinators = await agentManager.getAvailableAgents('coordinator');
    if (coordinators.length > 0) {
      swarm.coordinator = coordinators[0];
      await agentManager.updateAgentStatus(swarm.coordinator.id, 'active');
    }
    
    // Recruit members based on mission needs
    const requiredTypes = this.analyzeMissionRequirements(mission);
    
    for (const { type, count } of requiredTypes) {
      const agents = await agentManager.getAvailableAgents(type);
      const selected = agents.slice(0, count);
      
      for (const agent of selected) {
        await agentManager.updateAgentStatus(agent.id, 'active');
        swarm.members.push(agent);
      }
    }
    
    // Organize into sub-teams
    swarm.subTeams = this.organizeSubTeams(swarm.members, mission);
    
    swarm.status = 'active';
    this.activeSwarms.set(swarm.id, swarm);
    
    eventBus.emitSwarmFormed(swarm.id, swarm.members.length);
    console.log(`✅ Essaim formé: ${swarm.id} (${swarm.members.length} membres, ${swarm.subTeams.length} sous-équipes)`);
    
    return swarm;
  }
  
  private analyzeMissionRequirements(mission: string): Array<{ type: AgentType; count: number }> {
    const requirements: Array<{ type: AgentType; count: number }> = [];
    
    const keywords: Record<string, { type: AgentType; count: number }> = {
      'code': { type: 'processor', count: 3 },
      'analyse': { type: 'analyzer', count: 2 },
      'design': { type: 'designer', count: 2 },
      'test': { type: 'qa', count: 2 },
      'security': { type: 'security', count: 1 },
      'deploy': { type: 'devops', count: 1 },
      'data': { type: 'data-scientist', count: 2 },
    };
    
    for (const [keyword, req] of Object.entries(keywords)) {
      if (mission.toLowerCase().includes(keyword)) {
        requirements.push(req);
      }
    }
    
    if (requirements.length === 0) {
      requirements.push({ type: 'processor', count: 3 });
      requirements.push({ type: 'analyzer', count: 1 });
    }
    
    return requirements;
  }
  
  private organizeSubTeams(members: IAgent[], mission: string): SubTeam[] {
    const subTeams: SubTeam[] = [];
    
    // Group by type
    const byType = new Map<AgentType, IAgent[]>();
    for (const member of members) {
      const list = byType.get(member.type) || [];
      list.push(member);
      byType.set(member.type, list);
    }
    
    // Create sub-teams
    let index = 0;
    for (const [type, agents] of byType) {
      subTeams.push({
        id: `subteam-${index++}`,
        members: agents,
        leader: agents[0] || null,
        task: `${mission} - ${type}`,
        status: 'active',
      });
    }
    
    return subTeams;
  }
  
  async dissolveSwarm(swarmId: string): Promise<void> {
    const swarm = this.activeSwarms.get(swarmId);
    if (!swarm) return;
    
    swarm.status = 'dissolving';
    
    // Release all agents
    const allAgents = [swarm.coordinator, ...swarm.members].filter(Boolean) as IAgent[];
    
    for (const agent of allAgents) {
      await agentManager.updateAgentStatus(agent.id, 'idle');
    }
    
    swarm.status = 'dissolved';
    this.activeSwarms.delete(swarmId);
    
    console.log(`🔄 Essaim dissous: ${swarmId}`);
  }
  
  getActiveSwarms(): Swarm[] {
    return Array.from(this.activeSwarms.values());
  }
  
  getSwarmCount(): number {
    return this.activeSwarms.size;
  }
}

export const swarmOrchestrator = new SwarmOrchestrator();