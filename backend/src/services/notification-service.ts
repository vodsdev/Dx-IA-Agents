import { slackService } from './slack-service';
import { eventBus } from '../core/event-bus';

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  initialize(): void {
    console.log('🔔 Initialisation du service de notifications...');
    
    eventBus.on('workflow:completed', async ({ workflowId, duration }) => {
      await this.notify('workflow_completed', { workflowId, duration });
    });
    
    eventBus.on('agent:status:changed', async ({ agentId, oldStatus, newStatus }) => {
      await this.notify('agent_status_changed', { agentId, oldStatus, newStatus });
    });
    
    eventBus.on('swarm:formed', async ({ swarmId, memberCount }) => {
      await this.notify('swarm_formed', { swarmId, memberCount });
    });
    
    eventBus.on('neural-bridge:created', async ({ bridgeId, modelA, modelB }) => {
      await this.notify('bridge_created', { bridgeId, modelA, modelB });
    });
    
    console.log('✅ Service de notifications initialisé');
  }
  
  async notify(event: string, data: any): Promise<void> {
    const messages: Record<string, string> = {
      'workflow_completed': `✅ Workflow ${data.workflowId} terminé en ${data.duration}ms`,
      'agent_status_changed': `🔄 Agent ${data.agentId}: ${data.oldStatus} → ${data.newStatus}`,
      'swarm_formed': `🧬 Nouvel essaim formé: ${data.swarmId} (${data.memberCount} membres)`,
      'bridge_created': `🔗 NeuroBridge créé: ${data.modelA} ↔ ${data.modelB}`,
    };
    
    const message = messages[event] || `📢 Événement: ${event}`;
    
    await slackService.sendNotification(message);
  }
  
  async sendAlert(title: string, message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    const emoji = severity === 'error' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
    await slackService.sendNotification(`${emoji} *${title}*\n${message}`);
  }
}

export const notificationService = NotificationService.getInstance();