import { UniversalModelHub } from './universal-model-hub';
import { ModelRouter } from './model-router';
import { logger } from '../monitoring/logger';

export class PromptOptimizer {
  private modelHub: UniversalModelHub;
  private modelRouter: ModelRouter;

  private templates: Map<string, string> = new Map();
  
  constructor(modelHub: UniversalModelHub, modelRouter: ModelRouter) {
    this.modelHub = modelHub;
    this.modelRouter = modelRouter;

    this.initializeTemplates();
  }
  
  private initializeTemplates(): void {
    this.templates.set('code_generation', `
Tu es un expert en développement logiciel. 
Tâche: {task}
Contexte: {context}
Contraintes: {constraints}
Génère un code propre, documenté et optimisé.
`);
    
    this.templates.set('analysis', `
Tu es un analyste expert. 
Sujet: {topic}
Données disponibles: {data}
Objectif: {objective}
Fournis une analyse détaillée et structurée.
`);
    
    this.templates.set('creative', `
Tu es un créatif talentueux.
Brief: {brief}
Style: {style}
Public cible: {audience}
Crée un contenu original et engageant.
`);
    
    this.templates.set('validator', `
Tu es un validateur rigoureux.
Élément à vérifier: {item}
Critères de validation: {criteria}
Standards à respecter: {standards}
Fournis une validation détaillée avec des recommandations.
`);
  }
  
  optimize(templateName: string, variables: Record<string, string>): string {
    let template = this.templates.get(templateName);
    
    if (!template) {
      template = '{prompt}';
    }
    
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(`{${key}}`, value);
    }
    
    return result.trim();
  }

  async autoOptimizePrompt(initialPrompt: string, context?: string): Promise<string> {
    try {
      const optimizationPrompt = `Tu es un expert en ingénierie de prompt. Ton objectif est d'améliorer le prompt suivant pour le rendre plus clair, plus précis et plus efficace pour un modèle d'IA. Tiens compte du contexte fourni si disponible.

Prompt initial: ${initialPrompt}
${context ? `Contexte: ${context}` : ''}

Consignes d'optimisation:
- Rends le prompt plus spécifique.
- Ajoute des contraintes claires si nécessaire.
- Spécifie le format de sortie désiré.
- Élimine toute ambiguïté.
- Ne réponds qu'avec le prompt optimisé, sans aucune explication supplémentaire.

Prompt optimisé:`;

      const modelRef = await this.modelRouter.routeModel({
        task: 'prompt_optimization',
        prompt: optimizationPrompt,
        preferences: { quality: 'high', latency: 'medium' } // Prefer a high-quality model for prompt optimization
      });

      if (!modelRef) {
        logger.warn('No suitable model found for prompt optimization. Returning initial prompt.');
        return initialPrompt;
      }

      const optimizedResponse = await this.modelHub.request(modelRef, optimizationPrompt, { maxTokens: 1000 });
      return optimizedResponse.response.trim();
    } catch (error) {
      logger.error(`Error during prompt auto-optimization: ${error}. Returning initial prompt.`);
      return initialPrompt;
    }
  }
  
  addTemplate(name: string, template: string): void {
    this.templates.set(name, template);
  }
  
  chainPrompts(prompts: string[]): string {
    return prompts.join('\n\n---\n\n');
  }
  
  createSystemPrompt(role: string, expertise: string, constraints: string[]): string {
    return `
Tu es un {role} avec une expertise en {expertise}.
Contraintes:
{constraints}
Réponds de manière professionnelle et précise.
    `.replace('{role}', role)
      .replace('{expertise}', expertise)
      .replace('{constraints}', constraints.map(c => `- ${c}`).join('\n'));
  }
}

export const promptOptimizer = new PromptOptimizer(new UniversalModelHub(), new ModelRouter());