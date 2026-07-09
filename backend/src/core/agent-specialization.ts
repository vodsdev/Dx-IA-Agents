import type { AgentType } from '../types/common.types';

interface SpecializationConfig {
  domain: string;
  requiredSkills: string[];
  recommendedModels: string[];
  priorityTasks: string[];
}

export class AgentSpecialization {
  private specializations: Map<string, SpecializationConfig> = new Map();
  
  constructor() {
    this.initializeSpecializations();
  }
  
  private initializeSpecializations(): void {
    this.specializations.set('frontend', {
      domain: 'Développement Frontend',
      requiredSkills: ['react', 'css', 'ui_design', 'vixdev_integration'],
      recommendedModels: ['claude-3-6-sonnet', 'gpt-4o'],
      priorityTasks: ['ui_generation', 'component_creation', 'style_optimization'],
    });
    
    this.specializations.set('backend', {
      domain: 'Développement Backend',
      requiredSkills: ['nodejs', 'api_design', 'database', 'microservices'],
      recommendedModels: ['claude-3-6-sonnet', 'deepseek-coder-v4'],
      priorityTasks: ['api_creation', 'database_design', 'performance_optimization'],
    });
    
    this.specializations.set('data-science', {
      domain: 'Data Science & ML',
      requiredSkills: ['python', 'tensorflow', 'statistics', 'data_visualization'],
      recommendedModels: ['claude-3-6-opus', 'gpt-4o'],
      priorityTasks: ['model_training', 'data_analysis', 'visualization'],
    });
    
    this.specializations.set('devops', {
      domain: 'DevOps & Infrastructure',
      requiredSkills: ['docker', 'kubernetes', 'ci_cd', 'cloud'],
      recommendedModels: ['claude-3-6-sonnet', 'gemini-3.1-pro'],
      priorityTasks: ['deployment', 'monitoring', 'infrastructure_as_code'],
    });
    
    this.specializations.set('security', {
      domain: 'Sécurité',
      requiredSkills: ['penetration_testing', 'vulnerability_scanning', 'encryption'],
      recommendedModels: ['claude-3-6-opus', 'gpt-4o'],
      priorityTasks: ['security_audit', 'vulnerability_assessment', 'compliance_check'],
    });
    
    this.specializations.set('qa', {
      domain: 'Quality Assurance',
      requiredSkills: ['testing', 'automation', 'performance_testing'],
      recommendedModels: ['claude-3-6-sonnet', 'gemini-3.5-flash'],
      priorityTasks: ['test_automation', 'regression_testing', 'performance_testing'],
    });
  }
  
  getSpecialization(domain: string): SpecializationConfig | undefined {
    return this.specializations.get(domain);
  }
  
  getAllSpecializations(): Map<string, SpecializationConfig> {
    return this.specializations;
  }
  
  getRecommendedAgentTypes(domain: string): AgentType[] {
    const specialization = this.specializations.get(domain);
    if (!specialization) return ['processor'];
    
    const typeMap: Record<string, AgentType[]> = {
      'frontend': ['designer', 'processor', 'validator'],
      'backend': ['processor', 'analyzer', 'validator'],
      'data-science': ['data-scientist', 'analyzer', 'processor'],
      'devops': ['devops', 'executor', 'validator'],
      'security': ['security', 'analyzer', 'validator'],
      'qa': ['qa', 'validator', 'executor'],
    };
    
    return typeMap[domain] || ['processor'];
  }
  
  getRecommendedModel(domain: string): string {
    const specialization = this.specializations.get(domain);
    return specialization?.recommendedModels[0] || 'claude-3-6-sonnet';
  }
}

export const agentSpecialization = new AgentSpecialization();