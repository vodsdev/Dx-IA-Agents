import { UniversalModelHub } from './universal-model-hub';
import type { ModelReference, ModelProvider, ModelConfig, ModelMetrics } from '../types/common.types';
import { logger } from '../monitoring/logger';

interface RoutingRule {
  taskType: string;
  primaryModel: ModelReference;
  fallbackModel: ModelReference;
  conditions: Record<string, any>;
}

export class ModelRouter {
  private modelHub: UniversalModelHub;
  private modelReferences: Map<string, ModelConfig> = new Map();
  private rules: Map<string, RoutingRule> = new Map();
  private routingHistory: Array<{ taskType: string; modelUsed: string; success: boolean; latency: number }> = [];
  
  constructor(modelHub: UniversalModelHub) {
    this.modelHub = modelHub;
    this.initializeRules();
  }
  
  private initializeRules(): void {
    // Initialisation des règles de routage basées sur les préférences de tâche
    // Ces règles peuvent être dynamiquement mises à jour ou apprises
  }
  
  async routeModel(request: { task: string; prompt: string; preferences?: { cost?: 'low' | 'medium' | 'high'; latency?: 'low' | 'medium' | 'high'; quality?: 'low' | 'medium' | 'high'; stream?: boolean } }): Promise<ModelReference | undefined> {
    const { task, prompt, preferences } = request;
    const availableModels = Array.from(this.modelReferences.values());

    if (availableModels.length === 0) {
      logger.warn('No models registered in ModelRouter.');
      return undefined;
    }

    // Filter models by task compatibility (if defined in ModelConfig specialties)
    let candidateModels = availableModels.filter(model => 
      model.specialties && model.specialties.includes(task)
    );

    if (candidateModels.length === 0) {
      logger.warn(`No specialized models found for task: ${task}. Considering all models.`);
      candidateModels = availableModels; // Fallback to all models if no specialized ones
    }

    // Sort models based on preferences
    candidateModels.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      const metricsA = this.modelHub.getModelPerformance(`${a.provider}:${a.model}`);
      const metricsB = this.modelHub.getModelPerformance(`${b.provider}:${b.model}`);

      // Prioritize based on cost
      if (preferences?.cost === 'low') {
        scoreA += (metricsA?.costPerToken || 1) * 1000; // Lower cost is better
        scoreB += (metricsB?.costPerToken || 1) * 1000;
      } else if (preferences?.cost === 'high') {
        scoreA -= (metricsA?.costPerToken || 1) * 1000; // Higher cost (more powerful) is better
        scoreB -= (metricsB?.costPerToken || 1) * 1000;
      }

      // Prioritize based on latency
      if (preferences?.latency === 'low') {
        scoreA += (metricsA?.latency.reduce((sum, l) => sum + l, 0) / metricsA?.latency.length || 1000) / 10; // Lower latency is better
        scoreB += (metricsB?.latency.reduce((sum, l) => sum + l, 0) / metricsB?.latency.length || 1000) / 10;
      } else if (preferences?.latency === 'high') {
        scoreA -= (metricsA?.latency.reduce((sum, l) => sum + l, 0) / metricsA?.latency.length || 1000) / 10; // Higher latency (more complex processing) is better
        scoreB -= (metricsB?.latency.reduce((sum, l) => sum + l, 0) / metricsB?.latency.length || 1000) / 10;
      }

      // Prioritize based on quality (represented by successRate for now)
      if (preferences?.quality === 'high') {
        scoreA -= (metricsA?.successRate || 0) * 100; // Higher success rate (quality) is better
        scoreB -= (metricsB?.successRate || 0) * 100;
      } else if (preferences?.quality === 'low') {
        scoreA += (metricsA?.successRate || 0) * 100; // Lower success rate (less critical) is better
        scoreB += (metricsB?.successRate || 0) * 100;
      }

      return scoreA - scoreB;
    });

    // Return the best model
    if (candidateModels.length > 0) {
      const bestModel = candidateModels[0];
      logger.info(`Routed task '${task}' to model: ${bestModel.provider}:${bestModel.model} based on preferences.`);
      return { provider: bestModel.provider, model: bestModel.model };
    }

    logger.warn(`No suitable model found for task: ${task} with given preferences. Falling back to default.`);
    // Fallback to a default model if no suitable model is found
    const defaultModel = this.modelHub.getModelConfig('openai:gpt-4o') || this.modelHub.getModelConfig('anthropic:claude-3-6-sonnet-20241022');
    if (defaultModel) {
      return { provider: defaultModel.provider, model: defaultModel.model };
    }
    return undefined;
  }


  

  
  getRoutingHistory(): Array<any> {
    return this.routingHistory.slice(-100);
  }
  
  setModelReference(modelConfig: ModelConfig): void {
    const key = `${modelConfig.provider}:${modelConfig.model}`;
    this.modelReferences.set(key, modelConfig);
  }

  addRule(rule: RoutingRule): void {
    this.rules.set(rule.taskType, rule);
  }
  
  getRules(): Map<string, RoutingRule> {
    return this.rules;
  }
}

// modelRouter est maintenant instancié dans app.ts avec UniversalModelHub
// export const modelRouter = new ModelRouter();