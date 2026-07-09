export const SocketEvents = {
  // Agent events
  AGENT_CREATED: 'agent:created',
  AGENT_UPDATED: 'agent:updated',
  AGENT_STATUS_CHANGED: 'agent:status:changed',
  AGENTS_STATS: 'agents:stats',
  
  // Model events
  MODEL_REQUEST: 'model:request',
  MODEL_RESPONSE: 'model:response',
  MODEL_ERROR: 'model:error',
  MODELS_STATS: 'models:stats',
  BRIDGE_CREATED: 'bridge:created',
  
  // Workflow events
  WORKFLOW_CREATED: 'workflow:created',
  WORKFLOW_STARTED: 'workflow:started',
  WORKFLOW_COMPLETED: 'workflow:completed',
  WORKFLOW_FAILED: 'workflow:failed',
  WORKFLOW_PROGRESS: 'workflow:progress',
  
  // Swarm events
  SWARM_FORMED: 'swarm:formed',
  SWARM_DISSOLVED: 'swarm:dissolved',
  SWARM_UPDATED: 'swarm:updated',
  
  // System events
  SYSTEM_STATUS: 'system:status',
  SYSTEM_ALERT: 'system:alert',
  HEALTH_UPDATE: 'health:update',
  STATS_UPDATE: 'stats:update',
  
  // Room events
  JOIN_AGENTS: 'join:agents',
  LEAVE_AGENTS: 'leave:agents',
  JOIN_MODELS: 'join:models',
  LEAVE_MODELS: 'leave:models',
  JOIN_WORKFLOWS: 'join:workflows',
  JOIN_SWARMS: 'join:swarms',
} as const;