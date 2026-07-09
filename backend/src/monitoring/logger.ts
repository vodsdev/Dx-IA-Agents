type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private minLevel: LogLevel = 'info';
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }
  
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }
  
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
  
  private log(level: LogLevel, message: string, data?: any): void {
    const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    
    if (levels[level] < levels[this.minLevel]) return;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    
    this.logs.push(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    const emoji: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    
    const consoleMethod = level === 'error' ? console.error : 
                          level === 'warn' ? console.warn : console.log;
    
    consoleMethod(`${emoji[level]} [${entry.timestamp}] ${message}`);
    if (data) consoleMethod(data);
  }
  
  getLogs(level?: LogLevel, count: number = 100): LogEntry[] {
    let results = [...this.logs];
    if (level) {
      results = results.filter(l => l.level === level);
    }
    return results.slice(-count);
  }
}

export const logger = Logger.getInstance();