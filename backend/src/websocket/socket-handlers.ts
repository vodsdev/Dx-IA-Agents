import { Socket, Server } from 'socket.io';
import { agentManager } from '../core/agent-manager';
import { universalModelHub } from '../core/universal-model-hub';
import { workflowEngine } from '../workflows/workflow-engine';
import { swarmOrchestrator } from '../teams/swarm-orchestrator';

class SocketHandlers {
  private statsInterval: Map<string, NodeJS.Timeout> = new Map();
  
  register(socket: Socket, io: Server): void {
    // Join rooms
    socket.on('join:agents', () => {
      socket.join('agents');
      this.startAgentStats(socket);
    });
    
    socket.on('join:models', () => {
      socket.join('models');
      this.startModelStats(socket);
    });
    
    socket.on('join:workflows', () => {
      socket.join('workflows');
    });
    
    socket.on('join:swarms', () => {
      socket.join('swarms');
    });
    
    // Leave rooms
    socket.on('leave:agents', () => {
      socket.leave('agents');
      this.stopInterval(socket.id, 'agents');
    });
    
    socket.on('leave:models', () => {
      socket.leave('models');
      this.stopInterval(socket.id, 'models');
    });
    
    // Actions
    socket.on('agent:create', async (data) => {
      const agent = await agentManager.createAgent(data);
      io.to('agents').emit('agent:created', agent);
    });
    
    socket.on('agent:update-status', async (data) => {
      const agent = await agentManager.updateAgentStatus(data.id, data.status);
      if (agent) {
        io.to('agents').emit('agent:updated', agent);
      }
    });
    
    socket.on('workflow:create', async (data) => {
      const workflow = await workflowEngine.createWorkflow(data);
      io.to('workflows').emit('workflow:created', workflow);
    });
    
    socket.on('workflow:execute', async (data) => {
      try {
        const result = await workflowEngine.executeWorkflow(data.id);
        io.to('workflows').emit('workflow:completed', { id: data.id, result });
      } catch (error: any) {
        io.to('workflows').emit('workflow:failed', { id: data.id, error: error.message });
      }
    });
    
    socket.on('swarm:create', async (data) => {
      const swarm = await swarmOrchestrator.formSwarm(data.mission, data.capacity);
      io.to('swarms').emit('swarm:formed', swarm);
    });
    
    socket.on('model:request', async (data) => {
      try {
        const response = await universalModelHub.request(
          { provider: data.provider, model: data.model },
          data.prompt,
          data.options
        );
        socket.emit('model:response', response);
      } catch (error: any) {
        socket.emit('model:error', { error: error.message });
      }
    });
    
    // System status
    socket.on('system:status', () => {
      const agentCount = agentManager.getAgentCount();
      const modelMetrics = universalModelHub.getMetrics();
      
      socket.emit('system:status', {
        agents: agentCount,
        models: modelMetrics,
        activeWorkflows: workflowEngine.getActiveWorkflowCount(),
        activeSwarms: swarmOrchestrator.getSwarmCount(),
        timestamp: new Date().toISOString(),
      });
    });
  }
  
  private startAgentStats(socket: Socket): void {
    const interval = setInterval(() => {
      const stats = agentManager.getAgentCount();
      socket.emit('agents:stats', stats);
    }, 2000);
    
    this.statsInterval.set(`${socket.id}:agents`, interval);
  }
  
  private startModelStats(socket: Socket): void {
    const interval = setInterval(() => {
      const metrics = universalModelHub.getMetrics();
      socket.emit('models:stats', metrics);
    }, 2000);
    
    this.statsInterval.set(`${socket.id}:models`, interval);
  }
  
  private stopInterval(socketId: string, room: string): void {
    const key = `${socketId}:${room}`;
    const interval = this.statsInterval.get(key);
    if (interval) {
      clearInterval(interval);
      this.statsInterval.delete(key);
    }
  }
}

export const socketHandlers = new SocketHandlers();