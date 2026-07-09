import { BaseAgent } from '../base-agent';

export class AnalyzerAgent extends BaseAgent {
  constructor(name?: string) {
    super('analyzer', name);
    this.capabilities = ['pattern_recognition', 'anomaly_detection', 'prediction', 'classification'];
  }
  
  async execute(task: any): Promise<any> {
    console.log(`🔍 AnalyzerAgent ${this.name} analyse des données`);
    
    const prompt = `
En tant qu'agent analyste, analyse ces données:
${JSON.stringify(task, null, 2)}

Fournis:
1. Patterns identifiés
2. Anomalies détectées
3. Prédictions
4. Recommandations
    `;
    
    const result = await this.think(prompt);
    
    return { agentId: this.id, type: 'analyzer', result };
  }
}