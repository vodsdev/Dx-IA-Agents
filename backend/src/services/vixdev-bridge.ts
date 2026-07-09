import axios from 'axios';
import { config } from '../config/index';

export class VixdevBridge {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = config.external.vixdev || 'http://localhost:8000/api';
  }
  
  async generateUI(prompt: string, options: {
    framework?: string;
    styling?: string;
    gitSync?: boolean;
    webhookUrl?: string;
    metadata?: Record<string, any>;
  } = {}): Promise<any> {
    console.log(`🎨 Génération UI via Vixdev: ${prompt.substring(0, 100)}...`);
    
    try {
      const response = await axios.post(`${this.apiUrl}/boost`, {
        prompt,
        framework: options.framework || 'react',
        styling: options.styling || 'css',
        git_sync: options.gitSync ?? true,
        webhook_url: options.webhookUrl,
        metadata: options.metadata || {},
      }, {
        timeout: 60000,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur Vixdev:', error.message);
      throw error;
    }
  }
  
  async getProjectStatus(projectId: string): Promise<any> {
    const response = await axios.get(`${this.apiUrl}/projects/${projectId}`);
    return response.data;
  }
  
  async listProjects(): Promise<any> {
    const response = await axios.get(`${this.apiUrl}/projects`);
    return response.data;
  }
}

export const vixdevBridge = new VixdevBridge();