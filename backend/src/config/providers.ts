import { config } from './index';
import { CONSTANTS } from './constants';
import type { ModelProvider, ModelConfig } from '../types/model.types';

export function getProviderConfig(provider: ModelProvider): ModelConfig | null {
  const providerConfig = CONSTANTS.MODEL_PROVIDERS[provider];
  if (!providerConfig) return null;
  
  const apiKey = config.providers[provider]?.apiKey;
  
  return {
    provider,
    model: providerConfig.models[0],
    apiKey,
    endpoint: providerConfig.endpoint,
    specialties: [...providerConfig.specialties],
    local: false,
  };
}

export function getLocalServiceConfig(service: string): ModelConfig | null {
  const endpoints: Record<string, string> = {
    whisper: config.localServices.whisper,
    opencv: config.localServices.opencv,
    tensorflow: config.localServices.tensorflow,
    'local-llm': config.localServices.localLlm,
  };
  
  if (!endpoints[service]) return null;
  
  return {
    provider: service as ModelProvider,
    model: service === 'whisper' ? 'whisper-large-v4' : 'default',
    endpoint: endpoints[service],
    local: true,
    specialties: [service],
  };
}

export function getAllAvailableProviders(): ModelConfig[] {
  const providers: ModelConfig[] = [];
  
  for (const [name, providerConfig] of Object.entries(CONSTANTS.MODEL_PROVIDERS)) {
    const apiKey = config.providers[name as keyof typeof config.providers]?.apiKey;
    if (apiKey) {
      for (const model of providerConfig.models) {
        providers.push({
          provider: name as ModelProvider,
          model,
          apiKey,
          endpoint: providerConfig.endpoint,
          specialties: [...providerConfig.specialties],
          local: false,
        });
      }
    }
  }
  
  // Add local services
  providers.push(getLocalServiceConfig('whisper')!);
  providers.push(getLocalServiceConfig('opencv')!);
  providers.push(getLocalServiceConfig('tensorflow')!);
  providers.push(getLocalServiceConfig('local-llm')!);
  
  return providers;
}