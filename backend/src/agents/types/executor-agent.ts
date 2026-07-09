import { BaseAgent } from '../base-agent';

export class ExecutorAgent extends BaseAgent {
  constructor(name?: string) {
    super('executor', name);
    this.capabilities = ['task_execution', 'api_calls', 'automation', 'scripting'];
  }
  
  async execute(task: any): Promise<any> {
    console.log(`⚡ ExecutorAgent ${this.name} exécute une action`);
    
    const prompt = `
En tant qu'agent exécuteur, réalise cette action:
${JSON.stringify(task, null, 2)}

Fournis le résultat de l'exécution.
    `;
    
    const result = await this.think(prompt);
    
    return { agentId: this.id, type: 'executor', result };
  }
}