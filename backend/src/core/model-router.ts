import { universalModelHub } from './universal-model-hub';
import type { ModelReference, ModelProvider } from '../types/common.types';

interface RoutingRule {
  taskType: string;
  primaryModel: ModelReference;
  fallbackModel: ModelReference;
  conditions: Record<string, any>;
}

export class ModelRouter {
  private rules: Map<string, RoutingRule> = new Map();
  private routingHistory: Array<{ taskType: string; modelUsed: string; success: boolean; latency: number }> = [];
  
  constructor() {
    this.initializeRules();
  }
  
  private initializeRules(): void {
    this.rules.set('code_generation', {
      taskType: 'code_generation',
      primaryModel: { provider: 'deepseek', model: 'deepseek-coder-v4' },
      fallbackModel: { provider: 'anthropic', model: 'claude-3-6-sonnet-20241022' },
      conditions: { maxLatency: 5000, minQuality: 0.8 },
    });
    
    this.rules.set('creative_writing', {
      taskType: 'creative_writing',
      primaryModel: { provider: 'anthropic', model: 'claude-3-6-sonnet-20241022' },
      fallbackModel: { provider: 'openai', model: 'gpt-4o' },
      conditions: { maxLatency: 8000, minQuality: 0.9 },
    });
    
    this.rules.set('fast_inference', {
      taskType: 'fast_inference',
      primaryModel: { provider: 'groq', model: 'llama-3.1-70b-versatile' },
      fallbackModel: { provider: 'groq', model: 'mixtral-8x7b-32768' },
      conditions: { maxLatency: 500, minQuality: 0.7 },
    });
    
    this.rules.set('analysis', {
      taskType: 'analysis',
      primaryModel: { provider: 'openai', model: 'gpt-4o' },
      fallbackModel: { provider: 'anthropic', model: 'claude-3-6-sonnet-20241022' },
      conditions: { maxLatency: 10000, minQuality: 0.85 },
    });
    
    this.rules.set('multimodal', {
      taskType: 'multimodal',
      primaryModel: { provider: 'google', model: 'gemini-3.1-pro' },
      fallbackModel: { provider: 'openai', model: 'gpt-4o' },
      conditions: { maxLatency: 8000, minQuality: 0.8 },
    });
    
    this.rules.set('real_time', {
      taskType: 'real_time',
      primaryModel: { provider: 'grok', model: 'grok-4' },
      fallbackModel: { provider: 'groq', model: 'llama-3.1-70b-versatile' },
      conditions: { maxLatency: 2000, minQuality: 0.75 },
    });
    
    this.rules.set('scientific', {
      taskType: 'scientific',
      primaryModel: { provider: 'nvidia', model: 'nemotron-4-340b' },
      fallbackModel: { provider: 'anthropic', model: 'claude-3-6-opus-20241022' },
      conditions: { maxLatency: 15000, minQuality: 0.9 },
    });
  }
  
  async route(taskType: string, prompt: string, options: any = {}): Promise<any> {
    const rule = this.rules.get(taskType);
    
    if (!rule) {
      // Default routing
      const defaultModel: ModelReference = { provider: 'anthropic', model: 'claude-3-6-sonnet-20241022' };
      return this.executeWithFallback(defaultModel, defaultModel, prompt, options, taskType);
    }
    
    return this.executeWithFallback(rule.primaryModel, rule.fallbackModel, prompt, options, taskType);
  }
  
  private async executeWithFallback(
    primary: ModelReference,
    fallback: ModelReference,
    prompt: string,
    options: any,
    taskType: string
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await universalModelHub.request(primary, prompt, options);
      
      this.routingHistory.push({
        taskType,
        modelUsed: `${primary.provider}:${primary.model}`,
        success: true,
        latency: Date.now() - startTime,
      });
      
      return result;
    } catch (error) {
      console.warn(`⚠️ Modèle primaire échoué, tentative fallback: ${fallback.provider}:${fallback.model}`);
      
      try {
        const fallbackResult = await universalModelHub.request(fallback, prompt, options);
        
        this.routingHistory.push({
          taskType,
          modelUsed: `${fallback.provider}:${fallback.model}`,
          success: true,
          latency: Date.now() - startTime,
        });
        
        return fallbackResult;
      } catch (fallbackError) {
        this.routingHistory.push({
          taskType,
          modelUsed: 'none',
          success: false,
          latency: Date.now() - startTime,
        });
        
        throw new Error(`Tous les modèles ont échoué pour la tâche: ${taskType}`);
      }
    }
  }
  
  getRoutingHistory(): Array<any> {
    return this.routingHistory.slice(-100);
  }
  
  addRule(rule: RoutingRule): void {
    this.rules.set(rule.taskType, rule);
  }
  
  getRules(): Map<string, RoutingRule> {
    return this.rules;
  }
}

export const modelRouter = new ModelRouter();