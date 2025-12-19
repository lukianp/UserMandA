import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EventEmitter } from 'events';

import { app } from 'electron';

import {
  LogLevel,
  LogCategory,
  LogEntry,
  DebugConfiguration,
  KeystrokeEvent,
  MouseEvent,
  PerformanceMetrics,
  ErrorContext,
  LogReaderOptions,
  LogAnalysisResult
} from '../../types/debug';

export class DebugService extends EventEmitter {
  private config: DebugConfiguration;
  private logDirectory: string;
  private currentLogFiles: Map<LogCategory, string> = new Map();
  private writeStreams: Map<LogCategory, fs.WriteStream> = new Map();
  private sessionId: string;
  private appVersion: string;
  private buildInfo: string;

  constructor(config?: Partial<DebugConfiguration>) {
    super();

    // Initialize configuration
    this.config = {
      enabled: process.env.DEBUG === 'true' || config?.enabled || false,
      logLevel: config?.logLevel || LogLevel.DEBUG,
      categories: config?.categories || [LogCategory.UI, LogCategory.FUNCTIONALITY, LogCategory.ERRORS],
      maxFileSize: config?.maxFileSize || 100, // MB
      maxFiles: config?.maxFiles || 10,
      compressArchives: config?.compressArchives !== false,
      sanitizeLogs: config?.sanitizeLogs !== false,
      realtimeEnabled: config?.realtimeEnabled || false,
      performanceMonitoring: config?.performanceMonitoring || false,
      uiInteractionLogging: config?.uiInteractionLogging || false,
      errorContextCapture: config?.errorContextCapture || true
    };

    // Initialize session and app info
    this.sessionId = this.generateSessionId();
    this.appVersion = app.getVersion();
    this.buildInfo = process.env.BUILD_INFO || 'development';

    // Set up log directory
    this.logDirectory = path.join(process.env.DISCOVERY_DATA || 'C:\\discoverydata', 'logs');

    if (this.config.enabled) {
      this.initializeLogging();
    }
  }

  private initializeLogging(): void {
    try {
      // Ensure log directory exists
      if (!fs.existsSync(this.logDirectory)) {
        fs.mkdirSync(this.logDirectory, { recursive: true });
      }

      // Create subdirectories for each category
      this.config.categories.forEach(category => {
        const categoryDir = path.join(this.logDirectory, category);
        if (!fs.existsSync(categoryDir)) {
          fs.mkdirSync(categoryDir, { recursive: true });
        }

        // Initialize log file for this category
        this.initializeCategoryLogFile(category);
      });

      // Log system initialization
      this.log(LogLevel.INFO, LogCategory.SYSTEM, 'DebugService', 'DebugService initialized', {
        sessionId: this.sessionId,
        config: this.config,
        platform: process.platform,
        arch: process.arch
      });

    } catch (error) {
      console.error('Failed to initialize debug logging:', error);
    }
  }

  private initializeCategoryLogFile(category: LogCategory): void {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `${category}_${timestamp}.log`;
    const filepath = path.join(this.logDirectory, category, filename);

    // Close existing stream if it exists
    const existingStream = this.writeStreams.get(category);
    if (existingStream) {
      existingStream.end();
    }

    // Create new write stream
    const stream = fs.createWriteStream(filepath, {
      flags: 'a', // append mode
      encoding: 'utf8'
    });

    this.writeStreams.set(category, stream);
    this.currentLogFiles.set(category, filepath);

    // Handle stream events
    stream.on('error', (error) => {
      console.error(`Error writing to ${category} log:`, error);
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.config.enabled) return false;
    if (!this.config.categories.includes(category)) return false;

    const levels = [LogLevel.VERBOSE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private sanitizeData(data: any): any {
    if (!this.config.sanitizeLogs || !data) return data;

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential', 'auth'];
    const sanitized = { ...data };

    const sanitizeObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[REDACTED]';
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  private formatLogEntry(entry: LogEntry): string {
    const threadId = process.pid.toString();
    const baseEntry = {
      timestamp: entry.timestamp,
      threadId,
      module: entry.module,
      component: entry.component,
      level: entry.level,
      category: entry.category,
      message: entry.message,
      correlationId: entry.correlationId,
      userSession: {
        sessionId: this.sessionId,
        ...(entry.userSession || {})
      },
      metadata: {
        platform: process.platform,
        version: this.appVersion,
        build: this.buildInfo,
        environment: process.env.NODE_ENV || 'production',
        ...entry.metadata
      }
    };

    // Add optional fields
    if (entry.data) {
      (baseEntry as any).data = this.sanitizeData(entry.data);
    }
    if (entry.error) {
      (baseEntry as any).error = {
        ...entry.error,
        context: entry.error.context ? this.sanitizeData(entry.error.context) : undefined
      };
    }

    return JSON.stringify(baseEntry) + '\n';
  }

  public log(
    level: LogLevel,
    category: LogCategory,
    module: string,
    message: string,
    data?: Record<string, any>,
    error?: Error,
    correlationId?: string,
    userSession?: { userId?: string; profile?: string }
  ): void {
    if (!this.shouldLog(level, category)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      threadId: '', // Will be set in formatLogEntry
      module,
      component: module, // For simplicity, component can be same as module
      level,
      category,
      message,
      data,
      correlationId,
      userSession: userSession ? {
        sessionId: this.sessionId,
        userId: userSession.userId,
        profile: userSession.profile
      } : undefined
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context: data
      };
    }

    const formattedEntry = this.formatLogEntry(entry);

    // Write to appropriate log file
    const stream = this.writeStreams.get(category);
    if (stream) {
      stream.write(formattedEntry);

      // Check if file needs rotation
      this.checkFileRotation(category);
    }

    // Emit event for real-time monitoring
    if (this.config.realtimeEnabled) {
      this.emit('log-entry', entry);
    }
  }

  private checkFileRotation(category: LogCategory): void {
    const filepath = this.currentLogFiles.get(category);
    if (!filepath) return;

    try {
      const stats = fs.statSync(filepath);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB >= this.config.maxFileSize) {
        this.rotateLogFile(category);
      }
    } catch (error) {
      console.error(`Error checking file rotation for ${category}:`, error);
    }
  }

  private rotateLogFile(category: LogCategory): void {
    const currentFile = this.currentLogFiles.get(category);
    if (!currentFile) return;

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const rotatedFile = `${currentFile}.${timestamp}`;

    try {
      // Close current stream
      const stream = this.writeStreams.get(category);
      if (stream) {
        stream.end();
      }

      // Rename current file
      fs.renameSync(currentFile, rotatedFile);

      // Compress if enabled
      if (this.config.compressArchives) {
        this.compressLogFile(rotatedFile);
      }

      // Clean up old files
      this.cleanupOldFiles(category);

      // Initialize new log file
      this.initializeCategoryLogFile(category);

    } catch (error) {
      console.error(`Error rotating log file for ${category}:`, error);
    }
  }

  private async compressLogFile(filepath: string): Promise<void> {
    // Simple gzip compression using Node.js built-in zlib
    const zlib = await import('zlib');
    const fsPromises = fs.promises;

    try {
      const compressedFile = `${filepath}.gz`;
      const input = fs.createReadStream(filepath);
      const output = fs.createWriteStream(compressedFile);
      const gzip = zlib.createGzip();

      await new Promise<void>((resolve, reject) => {
        input.pipe(gzip).pipe(output)
          .on('finish', () => resolve())
          .on('error', reject);
      });

      // Remove uncompressed file
      await fsPromises.unlink(filepath);

    } catch (error) {
      console.error('Error compressing log file:', error);
    }
  }

  private cleanupOldFiles(category: LogCategory): void {
    const categoryDir = path.join(this.logDirectory, category);

    try {
      const files = fs.readdirSync(categoryDir)
        .filter(file => file.endsWith('.log') || file.endsWith('.log.gz'))
        .map(file => ({
          name: file,
          path: path.join(categoryDir, file),
          stats: fs.statSync(path.join(categoryDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only the most recent maxFiles
      if (files.length > this.config.maxFiles) {
        const filesToDelete = files.slice(this.config.maxFiles);
        filesToDelete.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(`Error deleting old log file ${file.path}:`, error);
          }
        });
      }
    } catch (error) {
      console.error(`Error cleaning up old files for ${category}:`, error);
    }
  }

  // Specific logging methods for different event types
  public logKeystroke(event: KeystrokeEvent): void {
    if (!this.config.uiInteractionLogging) return;

    this.log(LogLevel.VERBOSE, LogCategory.UI, 'UIInteraction', 'Keystroke event', {
      type: event.type,
      key: event.key,
      keyCode: event.keyCode,
      modifiers: event.modifiers,
      uiElementId: event.uiElementId,
      componentName: event.componentName
    });
  }

  public logMouse(event: MouseEvent): void {
    if (!this.config.uiInteractionLogging) return;

    this.log(LogLevel.VERBOSE, LogCategory.UI, 'UIInteraction', 'Mouse event', {
      type: event.type,
      x: event.x,
      y: event.y,
      button: event.button,
      modifiers: event.modifiers,
      uiElementId: event.uiElementId,
      componentName: event.componentName,
      deltaX: event.deltaX,
      deltaY: event.deltaY
    });
  }

  public logPerformance(metrics: PerformanceMetrics): void {
    if (!this.config.performanceMonitoring) return;

    const level = metrics.renderTime > 100 ? LogLevel.WARN : LogLevel.DEBUG;

    this.log(level, LogCategory.PERFORMANCE, 'PerformanceMonitor', 'Performance metrics', {
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsage,
      renderTime: metrics.renderTime,
      apiResponseTime: metrics.apiResponseTime,
      componentName: metrics.componentName,
      operation: metrics.operation
    });
  }

  public logError(context: ErrorContext): void {
    if (!this.config.errorContextCapture) return;

    this.log(LogLevel.ERROR, LogCategory.ERRORS, 'ErrorHandler', 'Application error', {
      stackTrace: context.stackTrace,
      errorCode: context.errorCode,
      contextVariables: this.sanitizeData(context.contextVariables),
      userSessionId: context.userSessionId,
      reproductionSteps: context.reproductionSteps
    }, undefined, context.correlationId);
  }

  // Configuration management
  public updateConfiguration(newConfig: Partial<DebugConfiguration>): void {
    const oldEnabled = this.config.enabled;
    this.config = { ...this.config, ...newConfig };

    if (this.config.enabled !== oldEnabled) {
      if (this.config.enabled) {
        this.initializeLogging();
      } else {
        this.shutdown();
      }
    }

    this.log(LogLevel.INFO, LogCategory.SYSTEM, 'DebugService', 'Configuration updated', { config: this.config });
  }

  public getConfiguration(): DebugConfiguration {
    return { ...this.config };
  }

  // Log reading and analysis
  public async readLogs(options: LogReaderOptions = {}): Promise<LogEntry[]> {
    const allEntries: LogEntry[] = [];

    for (const category of this.config.categories) {
      const categoryDir = path.join(this.logDirectory, category);
      if (!fs.existsSync(categoryDir)) continue;

      const files = fs.readdirSync(categoryDir)
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(categoryDir, file));

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.trim().split('\n');

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const entry: LogEntry = JSON.parse(line);

              // Apply filters
              if (options.category && entry.category !== options.category) continue;
              if (options.level && entry.level !== options.level) continue;
              if (options.component && entry.component !== options.component) continue;
              if (options.correlationId && entry.correlationId !== options.correlationId) continue;

              if (options.startDate && new Date(entry.timestamp) < options.startDate) continue;
              if (options.endDate && new Date(entry.timestamp) > options.endDate) continue;

              allEntries.push(entry);
            } catch (parseError) {
              // Skip malformed lines
              continue;
            }
          }
        } catch (error) {
          console.error(`Error reading log file ${file}:`, error);
        }
      }
    }

    // Sort by timestamp and apply limit
    allEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (options.limit) {
      return allEntries.slice(-options.limit);
    }

    return allEntries;
  }

  public async analyzeLogs(options: LogReaderOptions = {}): Promise<LogAnalysisResult> {
    const logs = await this.readLogs(options);

    const errorCount = logs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL).length;
    const warningCount = logs.filter(log => log.level === LogLevel.WARN).length;
    const performanceIssues = logs.filter(log =>
      log.category === LogCategory.PERFORMANCE &&
      log.data &&
      (log.data.renderTime > 100 || log.data.apiResponseTime > 5000)
    ).length;

    // Analyze recurring errors
    const errorMap = new Map<string, { count: number; first: string; last: string }>();
    logs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL)
      .forEach(log => {
        const errorKey = `${log.error?.name || 'Unknown'}: ${log.error?.message || log.message}`;
        const existing = errorMap.get(errorKey);
        if (existing) {
          existing.count++;
          existing.last = log.timestamp;
        } else {
          errorMap.set(errorKey, { count: 1, first: log.timestamp, last: log.timestamp });
        }
      });

    const recurringErrors = Array.from(errorMap.entries())
      .map(([error, data]) => ({
        error,
        count: data.count,
        firstOccurrence: data.first,
        lastOccurrence: data.last
      }))
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count);

    // Analyze slow operations
    const performanceLogs = logs.filter(log =>
      log.category === LogCategory.PERFORMANCE &&
      log.data &&
      (log.data?.renderTime || log.data?.apiResponseTime)
    );

    const operationMap = new Map<string, { times: number[]; count: number }>();
    performanceLogs.forEach(log => {
      const operation = log.data?.operation || 'unknown';
      const time = log.data?.renderTime || log.data?.apiResponseTime || 0;

      const existing = operationMap.get(operation);
      if (existing) {
        existing.times.push(time);
        existing.count++;
      } else {
        operationMap.set(operation, { times: [time], count: 1 });
      }
    });

    const slowOperations = Array.from(operationMap.entries())
      .map(([operation, data]) => ({
        operation,
        averageTime: data.times.reduce((a, b) => a + b, 0) / data.times.length,
        maxTime: Math.max(...data.times),
        count: data.count
      }))
      .filter(op => op.averageTime > 50) // Threshold for "slow"
      .sort((a, b) => b.averageTime - a.averageTime);

    // Generate recommendations
    const recommendations: string[] = [];

    if (errorCount > logs.length * 0.1) {
      recommendations.push('High error rate detected. Consider reviewing error handling and input validation.');
    }

    if (performanceIssues > 0) {
      recommendations.push(`${performanceIssues} performance issues detected. Review slow operations and consider optimization.`);
    }

    if (recurringErrors.length > 0) {
      recommendations.push(`${recurringErrors.length} recurring errors found. Focus on the most frequent errors first.`);
    }

    if (slowOperations.length > 0) {
      recommendations.push(`Slow operations detected. Consider caching, lazy loading, or code optimization for: ${slowOperations.slice(0, 3).map(op => op.operation).join(', ')}`);
    }

    return {
      summary: {
        totalLogs: logs.length,
        errorCount,
        warningCount,
        performanceIssues
      },
      patterns: {
        recurringErrors,
        slowOperations
      },
      recommendations
    };
  }

  // Real-time monitoring
  public onLogEntry(callback: (entry: LogEntry) => void): void {
    this.on('log-entry', callback);
  }

  public offLogEntry(callback: (entry: LogEntry) => void): void {
    this.off('log-entry', callback);
  }

  // Cleanup
  public shutdown(): void {
    this.writeStreams.forEach(stream => {
      stream.end();
    });
    this.writeStreams.clear();
    this.currentLogFiles.clear();

    this.log(LogLevel.INFO, LogCategory.SYSTEM, 'DebugService', 'DebugService shutdown');
  }

  // Utility methods
  public getLogDirectory(): string {
    return this.logDirectory;
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}