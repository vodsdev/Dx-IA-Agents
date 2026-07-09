import { BaseAgent } from '../base-agent';

export class ValidatorAgent extends BaseAgent {
  constructor(name?: string) {
    super('validator', name);
    this.capabilities = ['quality_check', 'compliance', 'testing', 'verification'];
  }
  
  async execute(task: any): Promise<any> {
    console.log(`✅ ValidatorAgent ${this.name} valide un résultat`);
    
    const prompt = `
En tant qu'agent validateur, vérifie ce résultat:
${JSON.stringify(task, null, 2)}

Critères de validation:
- Exactitude
- Complétude
- Conformité
- Qualité

Fournis un rapport de validation détaillé.
    `;
    
    const result = await this.think(prompt);
    
    return { agentId: this.id, type: 'validator', result };
  }
}