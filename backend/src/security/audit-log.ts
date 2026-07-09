interface AuditEntry {
  eventType: string;
  entityType: string;
  entityId: string;
  userId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export class AuditLog {
  private logs: AuditEntry[] = [];
  private maxLogs: number = 10000;
  
  log(entry: Omit<AuditEntry, 'timestamp'>): void {
    const auditEntry: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    
    this.logs.push(auditEntry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    console.log(`📝 Audit: [${auditEntry.eventType}] ${auditEntry.entityType}:${auditEntry.entityId}`);
  }
  
  getLogs(filters?: {
    eventType?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): AuditEntry[] {
    let results = [...this.logs];
    
    if (filters) {
      if (filters.eventType) {
        results = results.filter(l => l.eventType === filters.eventType);
      }
      if (filters.entityType) {
        results = results.filter(l => l.entityType === filters.entityType);
      }
      if (filters.userId) {
        results = results.filter(l => l.userId === filters.userId);
      }
      if (filters.startDate) {
        results = results.filter(l => l.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        results = results.filter(l => l.timestamp <= filters.endDate!);
      }
    }
    
    return results;
  }
  
  getRecentLogs(count: number = 100): AuditEntry[] {
    return this.logs.slice(-count);
  }
  
  clear(): void {
    this.logs = [];
  }
}

export const auditLog = new AuditLog();