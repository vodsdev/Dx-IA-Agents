import type { ITeam, IAgent } from '../types/common.types';

export class TeamDynamics {
  calculateTeamCohesion(team: ITeam): number {
    if (team.members.length < 2) return 1;
    
    let cohesionScore = 0;
    const members = team.members;
    
    // Calculate based on complementary capabilities
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const complementarity = this.calculateComplementarity(members[i], members[j]);
        cohesionScore += complementarity;
      }
    }
    
    const maxPairs = (members.length * (members.length - 1)) / 2;
    return cohesionScore / maxPairs;
  }
  
  private calculateComplementarity(agentA: IAgent, agentB: IAgent): number {
    const capsA = new Set(agentA.capabilities);
    const capsB = new Set(agentB.capabilities);
    
    let shared = 0;
    let unique = 0;
    
    for (const cap of capsA) {
      if (capsB.has(cap)) shared++;
      else unique++;
    }
    
    for (const cap of capsB) {
      if (!capsA.has(cap)) unique++;
    }
    
    const total = shared + unique;
    if (total === 0) return 0;
    
    return unique / total;
  }
  
  calculateTeamLoad(team: ITeam): number {
    const totalCapacity = team.members.length * 10;
    return Math.min(1, team.currentLoad / Math.max(1, totalCapacity));
  }
  
  suggestOptimalTeamSize(taskComplexity: number): number {
    if (taskComplexity < 0.3) return 3;
    if (taskComplexity < 0.6) return 5;
    if (taskComplexity < 0.8) return 8;
    return 12;
  }
}

export const teamDynamics = new TeamDynamics();