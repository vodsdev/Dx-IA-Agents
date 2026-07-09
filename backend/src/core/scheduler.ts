import { EventEmitter } from 'events';

interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  handler: () => Promise<void>;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export class Scheduler extends EventEmitter {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  scheduleTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task);
    
    if (task.enabled) {
      this.startTask(task);
    }
  }
  
  private startTask(task: ScheduledTask): void {
    const interval = this.parseCronToMs(task.cronExpression);
    
    const timer = setInterval(async () => {
      try {
        task.lastRun = new Date();
        task.nextRun = new Date(Date.now() + interval);
        await task.handler();
        this.emit('task:completed', { taskId: task.id, timestamp: new Date() });
      } catch (error) {
        this.emit('task:error', { taskId: task.id, error });
      }
    }, interval);
    
    this.intervals.set(task.id, timer);
  }
  
  private parseCronToMs(cronExpression: string): number {
    // Simple cron parser - supports "*/5 * * * *" format
    const parts = cronExpression.split(' ');
    
    if (parts[0].startsWith('*/')) {
      const minutes = parseInt(parts[0].replace('*/', ''));
      return minutes * 60 * 1000;
    }
    
    // Default: 1 minute
    return 60000;
  }
  
  stopTask(taskId: string): void {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }
  }
  
  getScheduledTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }
  
  cleanup(): void {
    for (const [taskId] of this.intervals) {
      this.stopTask(taskId);
    }
  }
}

export const scheduler = new Scheduler();