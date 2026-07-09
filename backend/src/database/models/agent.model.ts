export interface AgentRecord {
  id: string;
  name: string;
  type: string;
  status: string;
  capabilities: string[];
  team_id?: string;
  success_rate: number;
  tasks_completed: number;
  avg_response_time: number;
  tokens_processed: number;
  created_at: string;
  updated_at: string;
}

export const AgentSchema = {
  tableName: 'agents',
  columns: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    name: 'VARCHAR(255) NOT NULL',
    type: 'VARCHAR(50) NOT NULL',
    status: 'VARCHAR(20) DEFAULT \'idle\'',
    capabilities: 'JSONB DEFAULT \'[]\'',
    team_id: 'UUID REFERENCES teams(id)',
    success_rate: 'FLOAT DEFAULT 0.95',
    tasks_completed: 'INTEGER DEFAULT 0',
    avg_response_time: 'FLOAT DEFAULT 0',
    tokens_processed: 'BIGINT DEFAULT 0',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  },
  indexes: [
    'CREATE INDEX idx_agents_type ON agents(type)',
    'CREATE INDEX idx_agents_status ON agents(status)',
    'CREATE INDEX idx_agents_team_id ON agents(team_id)',
  ],
};