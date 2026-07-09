import { v4 as uuidv4 } from 'uuid';

interface VectorEntry {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  timestamp: number;
}

export class VectorStore {
  private vectors: Map<string, VectorEntry> = new Map();
  private dimension: number = 1536;
  
  async insert(vector: number[], metadata: Record<string, any> = {}): Promise<string> {
    const id = uuidv4();
    
    const entry: VectorEntry = {
      id,
      vector: this.normalizeVector(vector),
      metadata,
      timestamp: Date.now(),
    };
    
    this.vectors.set(id, entry);
    
    return id;
  }
  
  async search(queryVector: number[], topK: number = 10): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>> {
    const normalizedQuery = this.normalizeVector(queryVector);
    
    const results: Array<{ id: string; score: number; metadata: Record<string, any> }> = [];
    
    for (const [id, entry] of this.vectors) {
      const similarity = this.cosineSimilarity(normalizedQuery, entry.vector);
      results.push({ id, score: similarity, metadata: entry.metadata });
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
  
  async searchByMetadata(metadata: Partial<Record<string, any>>): Promise<VectorEntry[]> {
    const results: VectorEntry[] = [];
    
    for (const entry of this.vectors.values()) {
      const matches = Object.entries(metadata).every(([key, value]) => 
        entry.metadata[key] === value
      );
      if (matches) results.push(entry);
    }
    
    return results;
  }
  
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
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
  
  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(v => v / magnitude);
  }
  
  async delete(id: string): Promise<boolean> {
    return this.vectors.delete(id);
  }
  
  getSize(): number {
    return this.vectors.size;
  }
  
  async clear(): Promise<void> {
    this.vectors.clear();
  }
}

export const vectorStore = new VectorStore();