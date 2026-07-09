import axios from 'axios';
import { config } from '../config/index';
import { CONSTANTS } from '../config/constants';
import { eventBus } from './event-bus';
import type { ModelProvider, ModelReference, INeuralBridge, ConnectionType } from '../types/common.types';
import { piiAnonymizer } from '../security/pii-anonymizer';
import { ethicalGuardrails } from '../security/ethical-guardrails';
import type { ModelConfig, ModelRequest, ModelResponse, ModelMetrics } from '../types/model.types';

export class UniversalModelHub {
  private modelRegistry: Map<string, ModelConfig> = new Map();
  private modelPerformance: Map<string, ModelMetrics> = new Map();
  private neuralBridges: Map<string, INeuralBridge> = new Map();
  
  constructor() {
    this.initializeProviders();
  }
  
  private async initializeProviders(): Promise<void> {
    console.log('🌐 Initialisation du Hub Neuronal Universel...');
    
    // Anthropic
    if (config.providers.anthropic.apiKey) {
      this.registerProvider('anthropic', {
        provider: 'anthropic',
        model: 'claude-3-6-sonnet-20241022',
        apiKey: config.providers.anthropic.apiKey,
        endpoint: 'https://api.anthropic.com/v1/messages',
        specialties: ['reasoning', 'code_generation'],
      });
    }
    
    // OpenAI
    if (config.providers.openai.apiKey) {
      this.registerProvider('openai', {
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: config.providers.openai.apiKey,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        specialties: ['general_purpose', 'creative_tasks'],
      });
    }
    
    // Google Gemini
    if (config.providers.google.apiKey) {
      this.registerProvider('google', {
        provider: 'google',
        model: 'gemini-3.1-pro',
        apiKey: config.providers.google.apiKey,
        endpoint: 'https://generativelanguage.googleapis.com/v1/models',
        specialties: ['multimodal', 'context_understanding'],
      });
    }
    
    // Grok
    if (config.providers.grok.apiKey) {
      this.registerProvider('grok', {
        provider: 'grok',
        model: 'grok-4',
        apiKey: config.providers.grok.apiKey,
        endpoint: 'https://api.grok.xai/v1/chat/completions',
        specialties: ['real_time_data', 'social_analysis'],
      });
    }
    
    // DeepSeek
    if (config.providers.deepseek.apiKey) {
      this.registerProvider('deepseek', {
        provider: 'deepseek',
        model: 'deepseek-v4',
        apiKey: config.providers.deepseek.apiKey,
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        specialties: ['code_generation', 'mathematical_reasoning'],
      });
    }
    
    // Groq
    if (config.providers.groq.apiKey) {
      this.registerProvider('groq', {
        provider: 'groq',
        model: 'llama-3.1-70b-versatile',
        apiKey: config.providers.groq.apiKey,
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        specialties: ['fast_inference', 'real_time_processing'],
      });
    }
    
    // NVIDIA
    if (config.providers.nvidia.apiKey) {
      this.registerProvider('nvidia', {
        provider: 'nvidia',
        model: 'nemotron-4-340b',
        apiKey: config.providers.nvidia.apiKey,
        endpoint: 'https://api.nvidia.com/v1/chat/completions',
        specialties: ['gpu_acceleration', 'scientific_computing'],
      });
    }
    
    // Local services
    this.registerProvider('whisper', {
      provider: 'whisper',
      model: 'whisper-large-v4',
      endpoint: config.localServices.whisper,
      local: true,
      specialties: ['speech_recognition'],
    });
    
    this.registerProvider('opencv', {
      provider: 'opencv',
      model: 'opencv-4.9',
      endpoint: config.localServices.opencv,
      local: true,
      specialties: ['computer_vision'],
    });
    
    this.registerProvider('tensorflow', {
      provider: 'tensorflow',
      model: 'tf-2.16',
      endpoint: config.localServices.tensorflow,
      local: true,
      specialties: ['deep_learning'],
    });
    
    this.registerProvider('local-llm', {
      provider: 'local-llm',
      model: 'mixtral-8x22b',
      endpoint: config.localServices.localLlm,
      local: true,
      specialties: ['private_computing'],
    });
    
    console.log(`✅ Hub initialisé avec ${this.modelRegistry.size} modèles`);
  }
  
  registerProvider(name: string, modelConfig: ModelConfig): void {
    const key = `${name}:${modelConfig.model}`;
    this.modelRegistry.set(key, modelConfig);
    
    this.modelPerformance.set(key, {
      latency: [],
      successRate: 1.0,
      tokensPerSecond: 0,
      costPerToken: 0.001,
      errorRate: 0,
    });
  }
  
  async request(modelRef: ModelReference, prompt: string, options: any = {}): Promise<ModelResponse> {
    const key = `${modelRef.provider}:${modelRef.model}`;
    const providerConfig = this.modelRegistry.get(key);
    
    if (!providerConfig) {
      throw new Error(`Provider not found: ${key}`);
    }
    
    const startTime = Date.now();

    // 1. Appliquer les guardrails éthiques au prompt
    const promptEvaluation = await ethicalGuardrails.evaluatePrompt(prompt);
    if (!promptEvaluation.passed) {
      throw new Error(`Ethical guardrail violation: ${promptEvaluation.reason}`);
    }

    // 2. Anonymiser les PII dans le prompt
    const anonymizedPrompt = piiAnonymizer.anonymize(prompt);
    
    try {
      let response: ModelResponse;
      const processedPrompt = anonymizedPrompt; // Use the anonymized prompt
      
      switch (modelRef.provider) {
        case 'anthropic':
          response = await this.anthropicRequest(providerConfig, processedPrompt, options);
          break;
        case 'openai':
          response = await this.openaiRequest(providerConfig, processedPrompt, options);
          break;
        case 'google':
          response = await this.googleRequest(providerConfig, processedPrompt, options);
          break;
        case 'grok':
          response = await this.grokRequest(providerConfig, processedPrompt, options);
          break;
        case 'deepseek':
          response = await this.deepseekRequest(providerConfig, processedPrompt, options);
          break;
        case 'groq':
          response = await this.groqRequest(providerConfig, processedPrompt, options);
          break;
        case 'nvidia':
          response = await this.nvidiaRequest(providerConfig, processedPrompt, options);
          break;
        default:
          response = await this.localRequest(providerConfig, processedPrompt, options);
      }
      
      const latency = Date.now() - startTime;
      response.latency = latency;
      
      this.updateMetrics(key, latency, true);
      
      // 3. Appliquer les guardrails éthiques à la réponse
      const responseEvaluation = await ethicalGuardrails.evaluateResponse(response.response);
      if (!responseEvaluation.passed) {
        throw new Error(`Ethical guardrail violation in response: ${responseEvaluation.reason}`);
      }

      // 4. Anonymiser les PII dans la réponse avant de la retourner
      response.response = piiAnonymizer.anonymize(response.response);

      return response;
    } catch (error: any) {
      this.updateMetrics(key, Date.now() - startTime, false);
      throw error;
    }
  }
  
  private async anthropicRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(
      config.endpoint!,
      {
        model: config.model,
        max_tokens: options.maxTokens || 4096,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2024-02-15',
          'content-type': 'application/json',
        },
      }
    );
    
    return {
      response: response.data.content[0].text,
      model: config.model,
      provider: 'anthropic',
      usage: response.data.usage,
    };
  }
  
  private async openaiRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(
      config.endpoint!,
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      response: response.data.choices[0].message.content,
      model: config.model,
      provider: 'openai',
      usage: response.data.usage,
    };
  }
  
  private async googleRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(
      `${config.endpoint}/${config.model}:generateContent?key=${config.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 4096,
        },
      }
    );
    
    return {
      response: response.data.candidates[0].content.parts[0].text,
      model: config.model,
      provider: 'google',
    };
  }
  
  private async grokRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(
      config.endpoint!,
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      response: response.data.choices[0].message.content,
      model: config.model,
      provider: 'grok',
    };
  }
  
  private async deepseekRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(
      config.endpoint!,
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      response: response.data.choices[0].message.content,
      model: config.model,
      provider: 'deepseek',
    };
  }
  
  private async groqRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(
      config.endpoint!,
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      response: response.data.choices[0].message.content,
      model: config.model,
      provider: 'groq',
      usage: response.data.usage,
    };
  }
  
  private async nvidiaRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(
      config.endpoint!,
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      response: response.data.choices[0].message.content,
      model: config.model,
      provider: 'nvidia',
    };
  }
  
  private async localRequest(config: ModelConfig, prompt: string, options: any): Promise<ModelResponse> {
    const response = await axios.post(`${config.endpoint}/generate`, {
      model: config.model,
      prompt,
      options,
    });
    
    return {
      response: response.data.text || response.data.response,
      model: config.model,
      provider: config.provider,
    };
  }
  
  async createNeuralBridge(modelA: ModelReference, modelB: ModelReference, connectionType: ConnectionType = 'parallel'): Promise<INeuralBridge> {
    const bridgeId = `${modelA.provider}:${modelA.model}↔${modelB.provider}:${modelB.model}`;
    
    const bridge: INeuralBridge = {
      id: bridgeId,
      modelA,
      modelB,
      connectionType,
      metrics: {
        fusionQuality: 0,
        latency: 0,
        improvementOverSingle: 0,
      },
      active: true,
    };
    
    this.neuralBridges.set(bridgeId, bridge);
    eventBus.emitNeuralBridgeCreated(bridgeId, `${modelA.provider}:${modelA.model}`, `${modelB.provider}:${modelB.model}`);
    
    console.log(`🔗 NeuroBridge créé : ${bridgeId} (${connectionType})`);
    return bridge;
  }
  
  async fusedRequest(bridgeId: string, prompt: string, options: any = {}): Promise<ModelResponse> {
    const bridge = this.neuralBridges.get(bridgeId);
    if (!bridge) throw new Error(`NeuroBridge not found: ${bridgeId}`);
    
    switch (bridge.connectionType) {
      case 'parallel': {
        const [responseA, responseB] = await Promise.all([
          this.request(bridge.modelA, prompt, options),
          this.request(bridge.modelB, prompt, options),
        ]);
        
        return {
          response: `${responseA.response}\n\n--- NeuroBridge Fusion ---\n\n${responseB.response}`,
          model: `${bridge.modelA.model}+${bridge.modelB.model}`,
          provider: 'anthropic', // default
          fusionMetadata: {
            models: [responseA.model, responseB.model],
            quality: 0.9,
            bridge: bridgeId,
          },
        };
      }
      
      case 'sequential': {
        const firstPass = await this.request(bridge.modelA, prompt, options);
        const enhancedPrompt = `${prompt}\n\nContexte du modèle A: ${firstPass.response}`;
        const secondPass = await this.request(bridge.modelB, enhancedPrompt, options);
        
        return {
          ...secondPass,
          fusionMetadata: {
            models: [bridge.modelA.model, bridge.modelB.model],
            quality: 0.85,
            bridge: bridgeId,
            improvement: 'sequential_refinement',
          },
        };
      }
      
      case 'adversarial': {
        const proposal = await this.request(bridge.modelA, prompt, options);
        const critique = await this.request(bridge.modelB, `Analyse critique:\n${proposal.response}`, options);
        const finalResponse = await this.request(bridge.modelA, `Améliore avec ces critiques:\n${critique.response}`, options);
        
        return {
          ...finalResponse,
          fusionMetadata: {
            models: [bridge.modelA.model, bridge.modelB.model],
            quality: 0.95,
            bridge: bridgeId,
            rounds: 1,
            improvement: 'adversarial_refinement',
          },
        };
      }
    }
  }
  
  private updateMetrics(key: string, latency: number, success: boolean): void {
    const metrics = this.modelPerformance.get(key);
    if (!metrics) return;
    
    metrics.latency.push(latency);
    if (metrics.latency.length > 100) metrics.latency.shift();
    
    if (!success) {
      metrics.errorRate = (metrics.errorRate * 0.9) + 0.1;
    } else {
      metrics.errorRate *= 0.9;
    }
    
    metrics.successRate = 1 - metrics.errorRate;
  }
  
  getMetrics(): any {
    const result: any = {};
    
    for (const [key, metrics] of this.modelPerformance) {
      const avgLatency = metrics.latency.length > 0
        ? metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length
        : 0;
      
      result[key] = {
        avgLatency: Math.round(avgLatency),
        successRate: metrics.successRate,
        tokensPerSecond: metrics.tokensPerSecond,
        errorRate: metrics.errorRate,
      };
    }
    
    return result;
  }
  
  getBridges(): INeuralBridge[] {
    return Array.from(this.neuralBridges.values());
  }
}

export const universalModelHub = new UniversalModelHub();