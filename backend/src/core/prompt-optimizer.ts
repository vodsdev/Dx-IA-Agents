export class PromptOptimizer {
  private templates: Map<string, string> = new Map();
  
  constructor() {
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

export const promptOptimizer = new PromptOptimizer();