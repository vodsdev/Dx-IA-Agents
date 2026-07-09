import { BaseAgent } from '../base-agent';

export class CoordinatorAgent extends BaseAgent {
  constructor(name?: string) {
    super('coordinator', name);
    this.capabilities = ['team_management', 'workflow_orchestration', 'resource_allocation', 'planning'];
  }
  
  async execute(task: any): Promise<any> {
    console.log(`🎯 CoordinatorAgent ${this.name} coordonne une mission`);
    
    const prompt = `
En tant qu'agent coordinateur, planifie cette mission:
${JSON.stringify(task, null, 2)}

Fournis un plan d'action détaillé avec:
1. Objectifs
2. Ressources nécessaires
3. Timeline
4. Répartition des tâches
    `;
    
    const result = await this.think(prompt);
    
    return { agentId: this.id, type: 'coordinator', result };
  }
}