import axios from 'axios';

export class SlackService {
  private webhookUrl: string;
  private botToken: string;
  
  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.botToken = process.env.SLACK_BOT_TOKEN || '';
  }
  
  async sendNotification(message: string, channel?: string): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('⚠️ Slack webhook non configuré');
      return;
    }
    
    try {
      await axios.post(this.webhookUrl, {
        text: message,
        channel: channel,
      });
    } catch (error: any) {
      console.error('❌ Erreur notification Slack:', error.message);
    }
  }
  
  async sendRichMessage(blocks: any[], channel?: string): Promise<void> {
    if (!this.botToken) return;
    
    try {
      await axios.post('https://slack.com/api/chat.postMessage', {
        channel: channel || '#general',
        blocks,
      }, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('❌ Erreur message Slack:', error.message);
    }
  }
  
  async notifyWorkflowComplete(workflowName: string, status: string, details?: string): Promise<void> {
    const emoji = status === 'completed' ? '✅' : status === 'failed' ? '❌' : '🔄';
    
    await this.sendNotification(
      `${emoji} Workflow *${workflowName}* - ${status}\n${details || ''}`
    );
  }
  
  async notifyAgentStatus(agentName: string, status: string): Promise<void> {
    const emoji = status === 'active' ? '🟢' : status === 'error' ? '🔴' : '🟡';
    
    await this.sendNotification(
      `${emoji} Agent *${agentName}* est maintenant *${status}*`
    );
  }
}

export const slackService = new SlackService();