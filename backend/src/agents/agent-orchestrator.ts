import { agentManager } from '../core/agent-manager';
import { teamManager } from '../teams/team-manager';
import { workflowEngine } from '../workflows/workflow-engine';
import { modelRouter } from '../core/model-router';
import { eventBus } from '../core/event-bus';
import type { AgentType } from '../types/common.types';

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  
  static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }
  
  async dispatchTask(task: {
    type: string;
    payload: any;
    requiredCapabilities?: string[];
    priority?: number;
  }): Promise<any> {
    console.log(`🎯 Dispatch de tâche: ${task.type}`);
    
    // Find best agent type for this task
    const agentType = this.determineAgentType(task.type);
    
    // Get available agents
    const availableAgents = await agentManager.getAvailableAgents(agentType);
    
    if (availableAgents.length === 0) {
      // Create a team to handle this
      const team = await teamManager.createTeam({
        type: task.type,
        specialization: task.type,
      });
      
      console.log(`👥 Équipe créée pour la tâche: ${team.name}`);
    }
    
    // Route to best model
    const result = await modelRouter.route(task.type, JSON.stringify(task.payload));
    
    return result;
  }
  
  private determineAgentType(taskType: string): AgentType {
    const typeMap: Record<string, AgentType> = {
      'code_generation': 'processor',
      'analysis': 'analyzer',
      'execution': 'executor',
      'coordination': 'coordinator',
      'validation': 'validator',
      'design': 'designer',
      'security': 'security',
      'deployment': 'devops',
      'data_analysis': 'data-scientist',
      'testing': 'qa',
    };
    
    return typeMap[taskType] || 'processor';
  }
  
  async coordinateWorkflow(workflowConfig: any): Promise<any> {
    const workflow = await workflowEngine.createWorkflow(workflowConfig);
    return workflowEngine.executeWorkflow(workflow.id);
  }
  
  getSystemStatus(): {
    totalAgents: number;
    activeWorkflows: number;
    totalTeams: number;
  } {
    return {
      totalAgents: agentManager.getAgentCount().total,
      activeWorkflows: workflowEngine.getActiveWorkflowCount(),
      totalTeams: teamManager.getTeamCount(),
    };
  }
}

export const agentOrchestrator = AgentOrchestrator.getInstance();