export type AgentStatus = 'idle' | 'active' | 'busy' | 'error' | 'offline';
export type AgentType = 'processor' | 'analyzer' | 'executor' | 'coordinator' | 'validator' | 'designer' | 'security' | 'devops' | 'data-scientist' | 'qa';
export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'grok' | 'deepseek' | 'groq' | 'nvidia' | 'whisper' | 'opencv' | 'tensorflow' | 'local-llm';
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 0 | 1 | 2 | 3;
export type ConnectionType = 'parallel' | 'sequential' | 'adversarial';

export interface IAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  teamId?: string;
  currentTask?: string;
  model?: string;
  performance: AgentPerformance;
  metadata: AgentMetadata;
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
  tokensProcessed: number;
  lastActive: string;
}

export interface AgentMetadata {
  created: string;
  version: string;
  specialization?: string[];
  modelProvider?: ModelProvider;
}

export interface ITeam {
  id: string;
  name: string;
  type: string;
  members: IAgent[];
  leader?: IAgent;
  currentLoad: number;
  specialization: string;
  performance: TeamPerformance;
  status: 'forming' | 'active' | 'dissolving' | 'dissolved';
}

export interface TeamPerformance {
  successRate: number;
  averageCompletion: number;
  tasksCompleted: number;
}

export interface IWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  assignedTeam?: string;
  progress: number;
  created: string;
  completedAt?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: WorkflowStatus;
  requiredCapabilities: string[];
  priority: TaskPriority;
  result?: any;
}

export interface INeuralBridge {
  id: string;
  modelA: ModelReference;
  modelB: ModelReference;
  connectionType: ConnectionType;
  metrics: BridgeMetrics;
  active: boolean;
}

export interface ModelReference {
  provider: ModelProvider;
  model: string;
}

export interface BridgeMetrics {
  fusionQuality: number;
  latency: number;
  improvementOverSingle: number;
}

export interface ITask {
  id: string;
  workflowId: string;
  stepId: string;
  type: string;
  status: string;
  priority: TaskPriority;
  assignedTo?: string;
  result?: any;
  created: string;
  completedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}