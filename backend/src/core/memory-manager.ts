import { v4 as uuidv4 } from 'uuid';
import { CONSTANTS } from '../config/constants';
import { eventBus } from './event-bus';

interface MemoryItem {
  id: string;
  agentId: string;
  teamId: string;
  content: any;
  vector: number[];
  timestamp: number;
  ttl: number;
}

export class MemoryManager {
  private l1Cache: Map<string, MemoryItem> = new Map(); // Working memory
  private l2Cache: Map<string, MemoryItem> = new Map(); // Short-term memory
  private l3Store: Map<string, MemoryItem> = new Map(); // Long-term memory
  private knowledgeGraph: Map<string, any> = new Map();
  
  private consolidationInterval: NodeJS.Timeout | null = null;
  
  initialize(): void {
    console.log('🧠 Initialisation du gestionnaire de mémoire L1/L2/L3...');
    
    this.consolidationInterval = setInterval(() => {
      this.consolidateMemories();
    }, 300000); // Every 5 minutes
    
    console.log('✅ Mémoire hiérarchique initialisée');
  }
  
  async memorize(agentId: string, teamId: string, content: any, vector: number[] = []): Promise<string> {
    const memoryId = uuidv4();
    const memory: MemoryItem = {
      id: memoryId,
      agentId,
      teamId,
      content,
      vector: vector.length > 0 ? vector : this.generatePlaceholderVector(),
      timestamp: Date.now(),
      ttl: CONSTANTS.CACHE.L1_TTL,
    };
    
    // Store in L1 (working memory)
    this.l1Cache.set(memoryId, memory);
    
    // Enforce L1 size limit
    if (this.l1Cache.size > CONSTANTS.CACHE.L1_MAX_SIZE) {
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey) {
        const oldMemory = this.l1Cache.get(oldestKey);
        if (oldMemory) {
          this.l2Cache.set(oldestKey, oldMemory);
        }
        this.l1Cache.delete(oldestKey);
      }
    }
    
    // Create neural connections
    await this.createNeuralConnections(memory);
    
    return memoryId;
  }
  
  async recall(query: string, vector?: number[]): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    
    // Search L1 first (fastest)
    for (const memory of this.l1Cache.values()) {
      if (this.matchesQuery(memory, query)) {
        results.push(memory);
      }
    }
    
    // Search L2
    for (const memory of this.l2Cache.values()) {
      if (this.matchesQuery(memory, query) && !results.find(r => r.id === memory.id)) {
        results.push(memory);
      }
    }
    
    // Search L3 (vector store)
    if (vector && vector.length > 0) {
      const vectorResults = await this.vectorSearch(vector);
      results.push(...vectorResults);
    }
    
    return results.slice(0, 10);
  }
  
  private matchesQuery(memory: MemoryItem, query: string): boolean {
    const content = typeof memory.content === 'string' 
      ? memory.content 
      : JSON.stringify(memory.content);
    return content.toLowerCase().includes(query.toLowerCase());
  }
  
  private async vectorSearch(vector: number[]): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    
    for (const memory of this.l3Store.values()) {
      const similarity = this.cosineSimilarity(vector, memory.vector);
      if (similarity > 0.8) {
        results.push(memory);
      }
    }
    
    return results.sort((a, b) => {
      const simA = this.cosineSimilarity(vector, a.vector);
      const simB = this.cosineSimilarity(vector, b.vector);
      return simB - simA;
    });
  }
  
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  private generatePlaceholderVector(): number[] {
    return Array.from({ length: 64 }, () => Math.random());
  }
  
  private async createNeuralConnections(memory: MemoryItem): Promise<void> {
    const allMemories = [
      ...Array.from(this.l1Cache.values()),
      ...Array.from(this.l2Cache.values()),
      ...Array.from(this.l3Store.values()),
    ];
    
    for (const existing of allMemories) {
      if (existing.id === memory.id) continue;
      
      const similarity = this.cosineSimilarity(memory.vector, existing.vector);
      if (similarity > 0.85) {
        const connectionKey = `${memory.id}:${existing.id}`;
        this.knowledgeGraph.set(connectionKey, {
          source: memory.id,
          target: existing.id,
          strength: similarity,
          type: 'semantic_link',
        });
      }
    }
  }
  
  private consolidateMemories(): void {
    console.log('🔄 Consolidation des mémoires L1 -> L2 -> L3...');
    
    const now = Date.now();
    
    // Move expired L1 items to L2
    for (const [key, memory] of this.l1Cache) {
      if (now - memory.timestamp > memory.ttl) {
        this.l2Cache.set(key, { ...memory, ttl: CONSTANTS.CACHE.L2_TTL });
        this.l1Cache.delete(key);
      }
    }
    
    // Enforce L2 size limit
    while (this.l2Cache.size > CONSTANTS.CACHE.L2_MAX_SIZE) {
      const oldestKey = this.l2Cache.keys().next().value;
      if (oldestKey) {
        const memory = this.l2Cache.get(oldestKey);
        if (memory) {
          this.l3Store.set(oldestKey, { ...memory, ttl: CONSTANTS.CACHE.L3_TTL });
        }
        this.l2Cache.delete(oldestKey);
      }
    }
    
    eventBus.emitMemoryConsolidated('L1->L2', this.l2Cache.size);
    console.log(`  L1: ${this.l1Cache.size} | L2: ${this.l2Cache.size} | L3: ${this.l3Store.size}`);
  }
  
  getMemoryStats(): { l1: number; l2: number; l3: number; knowledgeGraph: number } {
    return {
      l1: this.l1Cache.size,
      l2: this.l2Cache.size,
      l3: this.l3Store.size,
      knowledgeGraph: this.knowledgeGraph.size,
    };
  }
  
  cleanup(): void {
    if (this.consolidationInterval) {
      clearInterval(this.consolidationInterval);
    }
  }
}

export const memoryManager = new MemoryManager();