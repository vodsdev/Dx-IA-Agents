import { v4 as uuidv4 } from 'uuid';
import { eventBus } from '../core/event-bus';
import { agentManager } from '../core/agent-manager';
import { teamManager } from '../teams/team-manager';
import { universalModelHub } from '../core/universal-model-hub';
import type { IWorkflow, WorkflowStep, WorkflowStatus } from '../types/common.types';

export class WorkflowEngine {
  private workflows: Map<string, IWorkflow> = new Map();
  private activeWorkflows: number = 0;
  
  async createWorkflow(config: {
    name: string;
    description?: string;
    steps: Array<{
      name: string;
      type: string;
      requiredCapabilities: string[];
      priority?: number;
    }>;
  }): Promise<IWorkflow> {
    const workflow: IWorkflow = {
      id: uuidv4(),
      name: config.name,
      description: config.description,
      steps: config.steps.map(step => ({
        id: uuidv4(),
        name: step.name,
        type: step.type,
        status: 'pending',
        requiredCapabilities: step.requiredCapabilities,
        priority: (step.priority || 2) as any,
      })),
      status: 'pending',
      progress: 0,
      created: new Date().toISOString(),
    };
    
    this.workflows.set(workflow.id, workflow);
    eventBus.emitWorkflowStarted(workflow.id);
    
    console.log(`📋 Workflow créé: ${workflow.name} (${workflow.steps.length} étapes)`);
    
    return workflow;
  }
  
  async executeWorkflow(workflowId: string): Promise<any> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow non trouvé: ${workflowId}`);
    
    workflow.status = 'running';
    this.activeWorkflows++;
    
    const results: any[] = [];
    
    for (const step of workflow.steps) {
      step.status = 'running';
      
      try {
        const result = await this.executeStep(step, workflow.id);
        step.status = 'completed';
        step.result = result;
        results.push(result);
        
        workflow.progress = Math.round(
          (workflow.steps.filter(s => s.status === 'completed').length / workflow.steps.length) * 100
        );
      } catch (error) {
        step.status = 'failed';
        workflow.status = 'failed';
        throw error;
      }
    }
    
    workflow.status = 'completed';
    workflow.completedAt = new Date().toISOString();
    this.activeWorkflows--;
    
    eventBus.emitWorkflowCompleted(workflow.id, Date.now() - new Date(workflow.created).getTime());
    
    return results;
  }
  
  private async executeStep(step: WorkflowStep, workflowId: string): Promise<any> {
    console.log(`  ⚡ Exécution de l'étape: ${step.name}`);
    
    // Find suitable agent
    const availableAgents = await agentManager.getAvailableAgents();
    const suitableAgent = availableAgents.find(a => 
      step.requiredCapabilities.every(cap => a.capabilities.includes(cap))
    );
    
    if (!suitableAgent) {
      throw new Error(`Aucun agent disponible pour l'étape: ${step.name}`);
    }
    
    await agentManager.updateAgentStatus(suitableAgent.id, 'busy');
    
    // Execute via model hub
    const response = await universalModelHub.request(
      { provider: 'anthropic', model: 'claude-3-6-sonnet-20241022' },
      `Exécute cette étape de workflow: ${step.name} (Type: ${step.type})`,
      { maxTokens: 2048 }
    );
    
    await agentManager.updateAgentStatus(suitableAgent.id, 'idle');
    
    return {
      stepId: step.id,
      stepName: step.name,
      agentId: suitableAgent.id,
      response: response.response,
      completedAt: new Date().toISOString(),
    };
  }
  
  async getWorkflow(id: string): Promise<IWorkflow | undefined> {
    return this.workflows.get(id);
  }
  
  async getAllWorkflows(): Promise<IWorkflow[]> {
    return Array.from(this.workflows.values());
  }
  
  async cancelWorkflow(id: string): Promise<void> {
    const workflow = this.workflows.get(id);
    if (!workflow) throw new Error(`Workflow non trouvé: ${id}`);
    
    workflow.status = 'cancelled';
    this.activeWorkflows = Math.max(0, this.activeWorkflows - 1);
  }
  
  getActiveWorkflowCount(): number {
    return this.activeWorkflows;
  }
}

export const workflowEngine = new WorkflowEngine();