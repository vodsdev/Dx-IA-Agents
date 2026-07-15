interface ContextMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens: number;
}

import { UniversalModelHub } from './universal-model-hub';
import { ModelRouter } from './model-router';
import { logger } from '../monitoring/logger';

export class ContextWindow {
  private modelHub: UniversalModelHub;
  private modelRouter: ModelRouter;

  private messages: ContextMessage[] = [];
  private maxTokens: number;
  private currentTokens: number = 0;
  
  constructor(modelHub: UniversalModelHub, modelRouter: ModelRouter, maxTokens: number = 128000) {
    this.modelHub = modelHub;
    this.modelRouter = modelRouter;

    this.maxTokens = maxTokens;
  }
  
  addMessage(role: 'system' | 'user' | 'assistant', content: string): void {
    const tokens = this.estimateTokens(content);
    
    this.messages.push({
      role,
      content,
      timestamp: Date.now(),
      tokens,
    });
    
    this.currentTokens += tokens;
    
    // Trim if exceeding limit
    while (this.currentTokens > this.maxTokens && this.messages.length > 1) {
      const removed = this.messages.shift();
      if (removed) {
        this.currentTokens -= removed.tokens;
      }
    }
  }
  
  getContext(): ContextMessage[] {
    return [...this.messages];
  }
  
  getContextAsString(): string {
    return this.messages
      .map(m => `[${m.role}]: ${m.content}`)
      .join('\n');
  }
  
  getSystemPrompt(): string {
    const systemMessages = this.messages.filter(m => m.role === 'system');
    return systemMessages.map(m => m.content).join('\n');
  }
  
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
  
  getTokenUsage(): { current: number; max: number; percentage: number } {
    return {
      current: this.currentTokens,
      max: this.maxTokens,
      percentage: Math.round((this.currentTokens / this.maxTokens) * 100),
    };
  }
  
  clear(): void {
    this.messages = [];
    this.currentTokens = 0;
  }
  
  async summarize(): Promise<string> {
    if (this.messages.length === 0) {
      return "";
    }

    // Take a portion of the older messages to summarize
    const messagesToSummarize = this.messages.slice(0, Math.floor(this.messages.length / 2));
    const textToSummarize = messagesToSummarize.map(m => `${m.role}: ${m.content}`).join("\n");

    if (textToSummarize.length === 0) {
      return "";
    }

    try {
      // Use a lightweight model (e.g., Groq) for summarization
      const modelRef = await this.modelRouter.routeModel({
        task: 'summarization',
        prompt: textToSummarize,
        // Prefer a cost-effective and fast model for summarization
        preferences: { cost: 'low', latency: 'low' }
      });

      if (!modelRef) {
        logger.warn('No suitable model found for summarization. Falling back to basic summary.');
        return this.basicSummarize(messagesToSummarize);
      }

      const summaryResponse = await this.modelHub.request(modelRef, `Résumez le texte suivant de manière concise, en conservant les points clés et le contexte général:\n\n${textToSummarize}`, { maxTokens: 500 });
      const summary = summaryResponse.response;

      // Remove summarized messages and add the summary as a system message
      this.messages = this.messages.slice(messagesToSummarize.length);
      this.currentTokens = this.messages.reduce((sum, msg) => sum + msg.tokens, 0);
      this.addMessage("system", `Résumé de la conversation précédente:\n${summary}`);

      return summary;
    } catch (error) {
      logger.error(`Error during dynamic context summarization: ${error}. Falling back to basic summary.`);
      return this.basicSummarize(messagesToSummarize);
    }
  }

  private basicSummarize(messages: ContextMessage[]): string {
    const summary = messages
      .slice(-10) // Still take the last 10 of the portion to summarize if fallback
      .map(m => `[${m.role}]: ${m.content.substring(0, 100)}...`)
      .join("\n");
    return `Résumé basique de la conversation précédente:\n${summary}`;
  }

}