import type { IAgent, AgentType } from '../types/common.types';

interface TeamRole {
  name: string;
  requiredType: AgentType;
  requiredCapabilities: string[];
  priority: number;
}

export class RoleAssigner {
  private roles: Map<string, TeamRole> = new Map();
  
  constructor() {
    this.initializeRoles();
  }
  
  private initializeRoles(): void {
    this.roles.set('leader', {
      name: 'Leader',
      requiredType: 'coordinator',
      requiredCapabilities: ['team_management', 'planning'],
      priority: 1,
    });
    
    this.roles.set('developer', {
      name: 'Développeur',
      requiredType: 'processor',
      requiredCapabilities: ['code_generation', 'api_calls'],
      priority: 2,
    });
    
    this.roles.set('analyst', {
      name: 'Analyste',
      requiredType: 'analyzer',
      requiredCapabilities: ['pattern_recognition', 'prediction'],
      priority: 2,
    });
    
    this.roles.set('tester', {
      name: 'Testeur',
      requiredType: 'qa',
      requiredCapabilities: ['testing', 'quality_check'],
      priority: 3,
    });
    
    this.roles.set('designer', {
      name: 'Designer',
      requiredType: 'designer',
      requiredCapabilities: ['ui_generation', 'css_animations'],
      priority: 3,
    });
    
    this.roles.set('devops', {
      name: 'DevOps',
      requiredType: 'devops',
      requiredCapabilities: ['deployment', 'monitoring'],
      priority: 3,
    });
  }
  
  assignRoles(agents: IAgent[], taskRequirements: string[]): Map<string, IAgent> {
    const assignments = new Map<string, IAgent>();
    const available = [...agents];
    
    for (const [roleName, role] of this.roles) {
      if (!taskRequirements.some(req => role.requiredCapabilities.includes(req))) {
        continue;
      }
      
      const bestAgent = this.findBestAgent(available, role);
      if (bestAgent) {
        assignments.set(roleName, bestAgent);
        available.splice(available.indexOf(bestAgent), 1);
      }
    }
    
    return assignments;
  }
  
  private findBestAgent(agents: IAgent[], role: TeamRole): IAgent | null {
    let bestAgent: IAgent | null = null;
    let bestScore = 0;
    
    for (const agent of agents) {
      if (agent.type !== role.requiredType) continue;
      
      const score = agent.capabilities.filter(cap => 
        role.requiredCapabilities.includes(cap)
      ).length;
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }
    
    return bestAgent;
  }
  
  getRoles(): Map<string, TeamRole> {
    return this.roles;
  }
}

export const roleAssigner = new RoleAssigner();