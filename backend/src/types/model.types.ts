import { ModelProvider } from './common.types';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
  local?: boolean;
  specialties: string[];
}

export interface ModelRequest {
  provider: ModelProvider;
  model: string;
  prompt: string;
  options?: ModelRequestOptions;
}

export interface ModelRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  skipCache?: boolean;
  batchable?: boolean;
  priority?: number;
}

export interface ModelResponse {
  response: string;
  model: string;
  provider: ModelProvider;
  usage?: TokenUsage;
  latency?: number;
  cached?: boolean;
  fusionMetadata?: FusionMetadata;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface FusionMetadata {
  models: string[];
  quality: number;
  bridge: string;
  rounds?: number;
  improvement?: string;
}

export interface ModelMetrics {
  latency: number[];
  successRate: number;
  tokensPerSecond: number;
  costPerToken: number;
  errorRate: number;
}

export interface ModelPerformance {
  [key: string]: {
    avgLatency: number;
    successRate: number;
    tokensPerSecond: number;
  };
}