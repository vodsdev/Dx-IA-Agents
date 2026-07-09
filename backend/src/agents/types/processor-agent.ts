import { BaseAgent } from '../base-agent';

export class ProcessorAgent extends BaseAgent {
  constructor(name?: string) {
    super('processor', name);
    this.capabilities = ['data_processing', 'transformation', 'enrichment', 'normalization'];
  }
  
  async execute(task: any): Promise<any> {
    console.log(`🔧 ProcessorAgent ${this.name} exécute une tâche`);
    
    const prompt = `
En tant qu'agent processeur, traite cette tâche:
${JSON.stringify(task, null, 2)}
    
Fournis un résultat structuré et optimisé.
    `;
    
    const result = await this.think(prompt);
    
    await this.remember({ task, result, timestamp: new Date().toISOString() });
    
    return { agentId: this.id, type: 'processor', result };
  }
}