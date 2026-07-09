interface ContextMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens: number;
}

export class ContextWindow {
  private messages: ContextMessage[] = [];
  private maxTokens: number;
  private currentTokens: number = 0;
  
  constructor(maxTokens: number = 128000) {
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
  
  summarize(): string {
    const summary = this.messages
      .slice(-10)
      .map(m => `[${m.role}]: ${m.content.substring(0, 100)}...`)
      .join('\n');
    
    this.clear();
    this.addMessage('system', `Résumé de la conversation précédente:\n${summary}`);
    
    return summary;
  }
}