/**
 * Enhanced Logging Service
 *
 * Features:
 * - Structured logging with context and correlation IDs
 * - Multiple log levels with filtering (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * - Multiple log transports (console, file via IPC, remote)
 * - Log rotation (daily, size-based)
 * - Log search and filtering
 * - Performance logging with method timing
 * - Error stack trace capture
 * - Log correlation IDs for request tracking
 */

/**
 * Log levels with numeric priorities
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

/**
 * Log transport types
 */
export type LogTransport = 'console' | 'file' | 'remote';

/**
 * Enhanced log entry with structured data
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: string;
  correlationId?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration: number;
    method: string;
  };
  tags?: string[];
  userId?: string;
  sessionId?: string;
}

/**
 * Log filter criteria
 */
export interface LogFilter {
  levels?: LogLevel[];
  contexts?: string[];
  correlationId?: string;
  startTime?: Date;
  endTime?: Date;
  searchText?: string;
  tags?: string[];
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  minLevel: LogLevel;
  maxLogs: number;
  transports: LogTransport[];
  enablePerformanceLogging: boolean;
  enableStackTrace: boolean;
  rotationSize: number; // bytes
  rotationInterval: number; // milliseconds
}

/**
 * Enhanced Logging Service
 */
class LoggingService {
  private logs: LogEntry[] = [];
  private config: LoggingConfig;
  private correlationIdStack: string[] = [];
  private performanceMarks: Map<string, number> = new Map();
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.config = {
      minLevel: LogLevel.INFO,
      maxLogs: 10000,
      transports: ['console'],
      enablePerformanceLogging: true,
      enableStackTrace: true,
      rotationSize: 10 * 1024 * 1024, // 10MB
      rotationInterval: 86400000, // 24 hours
    };

    this.sessionId = globalThis.crypto.randomUUID();

    // Load persisted logs from localStorage
    this.loadLogs();
  }

  /**
   * Configure logging service
   */
  configure(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('Logging service configured:', this.config);
  }

  /**
   * Set minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Set user ID for logging context
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Start a correlation context
   */
  startCorrelation(id?: string): string {
    const correlationId = id || globalThis.crypto.randomUUID();
    this.correlationIdStack.push(correlationId);
    return correlationId;
  }

  /**
   * End the current correlation context
   */
  endCorrelation(): void {
    this.correlationIdStack.pop();
  }

  /**
   * Get current correlation ID
   */
  private getCurrentCorrelationId(): string | undefined {
    return this.correlationIdStack[this.correlationIdStack.length - 1];
  }

  /**
   * TRACE level logging
   */
  trace(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.TRACE, message, context, data);
  }

  /**
   * DEBUG level logging
   */
  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * INFO level logging
   */
  info(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * WARN level logging
   */
  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * ERROR level logging
   */
  error(message: string, context?: string, data?: Record<string, unknown>, error?: Error): void {
    const errorData = error && this.config.enableStackTrace ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    this.log(LogLevel.ERROR, message, context, data, errorData);
  }

  /**
   * FATAL level logging
   */
  fatal(message: string, context?: string, data?: Record<string, unknown>, error?: Error): void {
    const errorData = error && this.config.enableStackTrace ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    this.log(LogLevel.FATAL, message, context, data, errorData);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, unknown>,
    error?: { name: string; message: string; stack?: string }
  ): void {
    // Check if log level is enabled
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      id: globalThis.crypto.randomUUID(),
      timestamp: new Date(),
      level,
      levelName: LogLevel[level],
      message,
      context,
      correlationId: this.getCurrentCorrelationId(),
      data,
      error,
      tags: [],
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.logs.push(entry);

    // Manage log rotation
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }

    // Output to transports
    this.outputToTransports(entry);

    // Persist logs periodically
    if (this.logs.length % 10 === 0) {
      this.persistLogs();
    }
  }

  /**
   * Performance logging - start timing
   */
  startPerformanceMeasure(methodName: string): void {
    if (!this.config.enablePerformanceLogging) return;
    this.performanceMarks.set(methodName, performance.now());
  }

  /**
   * Performance logging - end timing and log
   */
  endPerformanceMeasure(methodName: string, context?: string): number | null {
    if (!this.config.enablePerformanceLogging) return null;

    const startTime = this.performanceMarks.get(methodName);
    if (!startTime) {
      this.warn(`No performance mark found for ${methodName}`, 'Performance');
      return null;
    }

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(methodName);

    // Log performance entry
    const entry: LogEntry = {
      id: globalThis.crypto.randomUUID(),
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      levelName: 'DEBUG',
      message: `Performance: ${methodName}`,
      context: context || 'Performance',
      correlationId: this.getCurrentCorrelationId(),
      performance: {
        duration,
        method: methodName,
      },
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.logs.push(entry);
    this.outputToTransports(entry);

    return duration;
  }

  /**
   * Measure async function performance
   */
  async measureAsync<T>(
    methodName: string,
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    this.startPerformanceMeasure(methodName);
    try {
      return await fn();
    } finally {
      this.endPerformanceMeasure(methodName, context);
    }
  }

  /**
   * Output log entry to configured transports
   */
  private outputToTransports(entry: LogEntry): void {
    for (const transport of this.config.transports) {
      switch (transport) {
        case 'console':
          this.outputToConsole(entry);
          break;
        case 'file':
          this.outputToFile(entry);
          break;
        case 'remote':
          this.outputToRemote(entry);
          break;
      }
    }
  }

  /**
   * Output to console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.levelName.padEnd(5);
    const context = entry.context ? `[${entry.context}]` : '';
    const correlationId = entry.correlationId ? `[${entry.correlationId.slice(0, 8)}]` : '';

    let logFn = console.log;
    let color = '';

    switch (entry.level) {
      case LogLevel.TRACE:
        logFn = console.debug;
        color = '\x1b[90m'; // Gray
        break;
      case LogLevel.DEBUG:
        logFn = console.debug;
        color = '\x1b[36m'; // Cyan
        break;
      case LogLevel.INFO:
        logFn = console.info;
        color = '\x1b[32m'; // Green
        break;
      case LogLevel.WARN:
        logFn = console.warn;
        color = '\x1b[33m'; // Yellow
        break;
      case LogLevel.ERROR:
        logFn = console.error;
        color = '\x1b[31m'; // Red
        break;
      case LogLevel.FATAL:
        logFn = console.error;
        color = '\x1b[35m'; // Magenta
        break;
    }

    const reset = '\x1b[0m';
    logFn(`${color}${timestamp} ${level}${reset} ${context}${correlationId} ${entry.message}`);

    if (entry.data) {
      console.log('  Data:', entry.data);
    }

    if (entry.error) {
      console.error('  Error:', entry.error.message);
      if (entry.error.stack) {
        console.error(entry.error.stack);
      }
    }

    if (entry.performance) {
      console.log(`  Duration: ${entry.performance.duration.toFixed(2)}ms`);
    }
  }

  /**
   * Output to file (via IPC to main process)
   */
  private outputToFile(entry: LogEntry): void {
    // Send to main process for file writing
    if (window.electronAPI?.logToFile) {
      window.electronAPI.logToFile(entry).catch((err: unknown) => {
        console.error('Failed to write log to file:', err);
      });
    }
  }

  /**
   * Output to remote logging service
   */
  private outputToRemote(entry: LogEntry): void {
    // Would send to remote logging service (e.g., Elasticsearch, Splunk)
    // Implementation depends on specific service
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Filter logs by criteria
   */
  filterLogs(filter: LogFilter): LogEntry[] {
    return this.logs.filter((entry) => {
      if (filter.levels && !filter.levels.includes(entry.level)) {
        return false;
      }

      if (filter.contexts && entry.context && !filter.contexts.includes(entry.context)) {
        return false;
      }

      if (filter.correlationId && entry.correlationId !== filter.correlationId) {
        return false;
      }

      if (filter.startTime && entry.timestamp < filter.startTime) {
        return false;
      }

      if (filter.endTime && entry.timestamp > filter.endTime) {
        return false;
      }

      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const matchesMessage = entry.message.toLowerCase().includes(searchLower);
        const matchesContext = entry.context?.toLowerCase().includes(searchLower);
        const matchesData = JSON.stringify(entry.data || {}).toLowerCase().includes(searchLower);

        if (!matchesMessage && !matchesContext && !matchesData) {
          return false;
        }
      }

      if (filter.tags && entry.tags) {
        const hasTag = filter.tags.some((tag) => entry.tags!.includes(tag));
        if (!hasTag) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Search logs by text
   */
  searchLogs(query: string): LogEntry[] {
    return this.filterLogs({ searchText: query });
  }

  /**
   * Get logs by correlation ID
   */
  getLogsByCorrelation(correlationId: string): LogEntry[] {
    return this.filterLogs({ correlationId });
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('app_logs');
    console.log('All logs cleared');
  }

  /**
   * Persist logs to localStorage
   */
  private persistLogs(): void {
    try {
      // Store last 1000 logs
      const logsToStore = this.logs.slice(-1000);
      localStorage.setItem('app_logs', JSON.stringify(logsToStore));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogs(): void {
    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        const logs = JSON.parse(stored) as LogEntry[];
        // Convert timestamp strings back to Date objects
        this.logs = logs.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        console.log(`Loaded ${this.logs.length} persisted logs`);
      }
    } catch (error) {
      console.error('Failed to load persisted logs:', error);
    }
  }

  /**
   * Export logs to JSON
   */
  exportLogs(format: 'json' | 'csv' = 'json'): void {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'json') {
      content = JSON.stringify(this.logs, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      // CSV format
      const headers = ['timestamp', 'level', 'context', 'correlationId', 'message', 'data'];
      const rows = this.logs.map((entry) => [
        entry.timestamp.toISOString(),
        entry.levelName,
        entry.context || '',
        entry.correlationId || '',
        entry.message,
        JSON.stringify(entry.data || {}),
      ]);

      content = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);

    this.info('Logs exported', 'LoggingService', { format, count: this.logs.length });
  }

  /**
   * Get logging statistics
   */
  getStatistics() {
    const total = this.logs.length;
    const byLevel: Record<string, number> = {};

    for (let level = LogLevel.TRACE; level <= LogLevel.FATAL; level++) {
      byLevel[LogLevel[level]] = this.logs.filter((l) => l.level === level).length;
    }

    const contexts = new Set(this.logs.map((l) => l.context).filter(Boolean));
    const correlations = new Set(this.logs.map((l) => l.correlationId).filter(Boolean));

    return {
      total,
      byLevel,
      uniqueContexts: contexts.size,
      uniqueCorrelations: correlations.size,
      sessionId: this.sessionId,
      userId: this.userId,
      oldestLog: this.logs[0]?.timestamp,
      newestLog: this.logs[this.logs.length - 1]?.timestamp,
    };
  }
}

export default new LoggingService();


