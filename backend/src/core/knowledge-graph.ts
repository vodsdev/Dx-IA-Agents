interface GraphNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
}

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }
  
  addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
  }
  
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }
  
  getNeighbors(nodeId: string): GraphNode[] {
    const neighbors: GraphNode[] = [];
    
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId) {
        const target = this.nodes.get(edge.target);
        if (target) neighbors.push(target);
      }
      if (edge.target === nodeId) {
        const source = this.nodes.get(edge.source);
        if (source) neighbors.push(source);
      }
    }
    
    return neighbors;
  }
  
  findPath(sourceId: string, targetId: string, maxDepth: number = 5): string[] | null {
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [{ nodeId: sourceId, path: [sourceId] }];
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === targetId) return path;
      if (path.length > maxDepth) continue;
      
      visited.add(nodeId);
      
      for (const neighbor of this.getNeighbors(nodeId)) {
        if (!visited.has(neighbor.id)) {
          queue.push({ nodeId: neighbor.id, path: [...path, neighbor.id] });
        }
      }
    }
    
    return null;
  }
  
  query(query: { nodeType?: string; edgeType?: string; properties?: Record<string, any> }): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const matchingNodes: GraphNode[] = [];
    const matchingEdges: GraphEdge[] = [];
    
    for (const node of this.nodes.values()) {
      if (query.nodeType && node.type !== query.nodeType) continue;
      if (query.properties) {
        const matches = Object.entries(query.properties).every(([key, value]) => 
          node.properties[key] === value
        );
        if (!matches) continue;
      }
      matchingNodes.push(node);
    }
    
    for (const edge of this.edges.values()) {
      if (query.edgeType && edge.type !== query.edgeType) continue;
      matchingEdges.push(edge);
    }
    
    return { nodes: matchingNodes, edges: matchingEdges };
  }
  
  getStats(): { nodeCount: number; edgeCount: number } {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
    };
  }
}

export const knowledgeGraph = new KnowledgeGraph();