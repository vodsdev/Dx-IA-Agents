import { v4 as uuidv4 } from 'uuid';
import { agentManager } from '../core/agent-manager';
import { eventBus } from '../core/event-bus';
import type { ITeam, IAgent, AgentType } from '../types/common.types';

export class TeamManager {
  private teams: Map<string, ITeam> = new Map();
  
  async createTeam(config: {
    name?: string;
    type: string;
    specialization: string;
    maxSize?: number;
  }): Promise<ITeam> {
    const maxSize = config.maxSize || 8;
    const team: ITeam = {
      id: uuidv4(),
      name: config.name || `dx-team-${uuidv4().slice(0, 4)}`,
      type: config.type,
      members: [],
      currentLoad: 0,
      specialization: config.specialization,
      performance: {
        successRate: 0,
        averageCompletion: 0,
        tasksCompleted: 0,
      },
      status: 'forming',
    };
    
    // Recruit agents
    const availableAgents = await agentManager.getAvailableAgents();
    const compatibleAgents = availableAgents
      .filter(a => this.isAgentCompatible(a, config.specialization))
      .slice(0, maxSize);
    
    for (const agent of compatibleAgents) {
      await agentManager.updateAgentStatus(agent.id, 'active');
      agent.teamId = team.id;
      team.members.push(agent);
    }
    
    // Elect leader
    if (team.members.length > 0) {
      team.leader = team.members.sort((a, b) => 
        b.performance.successRate - a.performance.successRate
      )[0];
    }
    
    team.status = 'active';
    this.teams.set(team.id, team);
    
    eventBus.emitTeamFormed(team.id, team.members.length);
    console.log(`👥 Équipe créée: ${team.name} (${team.members.length} membres)`);
    
    return team;
  }
  
  private isAgentCompatible(agent: IAgent, specialization: string): boolean {
    return agent.capabilities.some(cap => 
      cap.includes(specialization) || specialization.includes(cap)
    );
  }
  
  getTeam(id: string): ITeam | undefined {
    return this.teams.get(id);
  }
  
  getAllTeams(): Map<string, ITeam> {
    return this.teams;
  }
  
  async addMember(teamId: string, agentId: string): Promise<ITeam | null> {
    const team = this.teams.get(teamId);
    const agent = await agentManager.getAgent(agentId);
    
    if (!team || !agent) return null;
    
    agent.teamId = teamId;
    await agentManager.updateAgentStatus(agentId, 'active');
    team.members.push(agent);
    
    return team;
  }
  
  async removeMember(teamId: string, agentId: string): Promise<ITeam | null> {
    const team = this.teams.get(teamId);
    if (!team) return null;
    
    team.members = team.members.filter(m => m.id !== agentId);
    await agentManager.updateAgentStatus(agentId, 'idle');
    
    return team;
  }
  
  async dissolveTeam(teamId: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) return;
    
    team.status = 'dissolving';
    
    for (const member of team.members) {
      await agentManager.updateAgentStatus(member.id, 'idle');
      member.teamId = undefined;
    }
    
    team.status = 'dissolved';
    this.teams.delete(teamId);
    
    console.log(`👥 Équipe dissoute: ${team.name}`);
  }
  
  getTeamCount(): number {
    return this.teams.size;
  }
}

export const teamManager = new TeamManager();