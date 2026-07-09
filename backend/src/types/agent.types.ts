import { AgentType, AgentStatus } from './common.types';

export interface AgentConfig {
  type: AgentType;
  capabilities: string[];
  model?: string;
  name?: string;
}

export interface AgentCapability {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  experience: number;
}

export interface AgentSpecialization {
  domain: string;
  skills: string[];
  certifications?: string[];
}

export interface CreateAgentDto {
  type: AgentType;
  name?: string;
  capabilities?: string[];
  specialization?: string;
}

export interface UpdateAgentDto {
  status?: AgentStatus;
  capabilities?: string[];
  teamId?: string;
}

export interface AgentQueryParams {
  type?: AgentType;
  status?: AgentStatus;
  teamId?: string;
  capability?: string;
  limit?: number;
  offset?: number;
}