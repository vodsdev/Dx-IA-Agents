export const CONSTANTS = {
  // Agent Types
  AGENT_TYPES: ['processor', 'analyzer', 'executor', 'coordinator', 'validator', 'designer', 'security', 'devops', 'data-scientist', 'qa'] as const,
  
  // Agent Capabilities by Type
  AGENT_CAPABILITIES: {
    processor: ['data_processing', 'transformation', 'enrichment', 'normalization'],
    analyzer: ['pattern_recognition', 'anomaly_detection', 'prediction', 'classification'],
    executor: ['task_execution', 'api_calls', 'automation', 'scripting'],
    coordinator: ['team_management', 'workflow_orchestration', 'resource_allocation', 'planning'],
    validator: ['quality_check', 'compliance', 'testing', 'verification'],
    designer: ['ui_generation', 'react_components', 'css_animations', 'vixdev_integration'],
    security: ['vulnerability_scan', 'penetration_test', 'security_audit', 'encryption'],
    devops: ['ci_cd', 'deployment', 'monitoring', 'containerization'],
    'data-scientist': ['machine_learning', 'statistical_analysis', 'data_visualization', 'model_training'],
    qa: ['test_automation', 'bug_detection', 'performance_testing', 'regression_testing'],
  } as const,
  
  // Model Providers Configuration
  MODEL_PROVIDERS: {
    anthropic: {
      models: ['claude-3-6-sonnet-20241022', 'claude-3-6-opus-20241022'],
      endpoint: 'https://api.anthropic.com/v1/messages',
      specialties: ['reasoning', 'code_generation', 'architecture', 'creative_writing'],
    },
    openai: {
      models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'],
      endpoint: 'https://api.openai.com/v1/chat/completions',
      specialties: ['general_purpose', 'creative_tasks', 'analysis'],
    },
    google: {
      models: ['gemini-3.1-pro', 'gemini-3.5-flash'],
      endpoint: 'https://generativelanguage.googleapis.com/v1/models',
      specialties: ['multimodal', 'context_understanding', 'translation'],
    },
    grok: {
      models: ['grok-4', 'grok-4-vision'],
      endpoint: 'https://api.grok.xai/v1/chat/completions',
      specialties: ['real_time_data', 'social_analysis', 'trend_detection'],
    },
    deepseek: {
      models: ['deepseek-v4', 'deepseek-coder-v4'],
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      specialties: ['code_generation', 'mathematical_reasoning', 'technical_documentation'],
    },
    groq: {
      models: ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile'],
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      specialties: ['fast_inference', 'real_time_processing', 'batch_processing'],
    },
    nvidia: {
      models: ['nemotron-4-340b', 'llama-3.1-nemotron-70b'],
      endpoint: 'https://api.nvidia.com/v1/chat/completions',
      specialties: ['gpu_acceleration', 'scientific_computing', 'simulation'],
    },
  } as const,
  
  // Task Priorities
  TASK_PRIORITIES: {
    CRITICAL: 0,
    HIGH: 1,
    NORMAL: 2,
    LOW: 3,
  } as const,
  
  // Cache Configuration
  CACHE: {
    L1_MAX_SIZE: 10000,
    L2_MAX_SIZE: 100000,
    L1_TTL: 300000,  // 5 minutes
    L2_TTL: 3600000, // 1 hour
    L3_TTL: 86400000, // 24 hours
  },
  
  // Workflow Limits
  WORKFLOW: {
    MAX_STEPS: 100,
    DEFAULT_TIMEOUT: 3600000, // 1 hour
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_BACKOFF: 'exponential' as const,
  },
  
  // Swarm Configuration
  SWARM: {
    MIN_SIZE: 3,
    MAX_SIZE: 50,
    FORMATION_TIMEOUT: 30000,
    DISSOLVE_TIMEOUT: 60000,
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    DEFAULT_MAX: 1000,
    DEFAULT_WINDOW: 60000, // 1 minute
    COORDINATOR_MAX: 100,
    VALIDATOR_MAX: 200,
    PROCESSOR_MAX: 500,
    ANALYZER_MAX: 300,
  },
} as const;