/**
 * Error Handling and Logging Service
 *
 * Centralized error handling, logging, and error reporting system.
 * Pattern from GUI/Services/ErrorHandlingService.cs
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: Error;
  context: Record<string, any>;
  resolved: boolean;
  notes?: string;
}

/**
 * Error Handling and Logging Service
 */
export class ErrorHandlingService extends EventEmitter {
  private logsDir: string;
  private errorsDir: string;
  private currentLogFile: string;
  private logBuffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private errorReports: Map<string, ErrorReport> = new Map();

  constructor(dataRoot = 'C:\\DiscoveryData') {
    super();
    this.logsDir = path.join(dataRoot, 'Logs');
    this.errorsDir = path.join(dataRoot, 'Errors');
    this.currentLogFile = this.getLogFilePath();

    this.ensureDirectoriesExist();
    this.startFlushInterval();
  }

  /**
   * Ensure log directories exist
   */
  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    if (!fs.existsSync(this.errorsDir)) {
      fs.mkdirSync(this.errorsDir, { recursive: true });
    }
  }

  /**
   * Get current log file path (daily rotation)
   */
  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logsDir, `app-${date}.log`);
  }

  /**
   * Start periodic log flush
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Log a message
   */
  log(level: LogLevel, category: string, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context
    };

    this.logBuffer.push(entry);

    // Emit event for real-time monitoring
    this.emit('log', entry);

    // Console output
    const consoleMessage = `[${entry.timestamp}] [${level.toUpperCase()}] [${category}] ${message}`;
    switch (level) {
      case 'debug':
        console.debug(consoleMessage, context || '');
        break;
      case 'info':
        console.log(consoleMessage, context || '');
        break;
      case 'warn':
        console.warn(consoleMessage, context || '');
        break;
      case 'error':
      case 'fatal':
        console.error(consoleMessage, context || '');
        break;
    }

    // Flush immediately for errors and fatals
    if (level === 'error' || level === 'fatal') {
      this.flushLogs();
    }
  }

  /**
   * Log debug message
   */
  debug(category: string, message: string, context?: Record<string, any>): void {
    this.log('debug', category, message, context);
  }

  /**
   * Log info message
   */
  info(category: string, message: string, context?: Record<string, any>): void {
    this.log('info', category, message, context);
  }

  /**
   * Log warning message
   */
  warn(category: string, message: string, context?: Record<string, any>): void {
    this.log('warn', category, message, context);
  }

  /**
   * Log error message
   */
  error(category: string, message: string, error?: Error, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      message,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        : undefined
    };

    this.logBuffer.push(entry);
    this.emit('log', entry);
    this.emit('error', entry);

    console.error(`[${entry.timestamp}] [ERROR] [${category}] ${message}`, error || '', context || '');

    // Create error report
    if (error) {
      this.createErrorReport(error, context || {});
    }

    this.flushLogs();
  }

  /**
   * Log fatal error
   */
  fatal(category: string, message: string, error?: Error, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'fatal',
      category,
      message,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        : undefined
    };

    this.logBuffer.push(entry);
    this.emit('log', entry);
    this.emit('fatal', entry);

    console.error(`[${entry.timestamp}] [FATAL] [${category}] ${message}`, error || '', context || '');

    // Create error report
    if (error) {
      this.createErrorReport(error, context || {});
    }

    this.flushLogs();
  }

  /**
   * Create error report for tracking and resolution
   */
  private createErrorReport(error: Error, context: Record<string, any>): void {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      error,
      context,
      resolved: false
    };

    this.errorReports.set(report.id, report);

    // Save error report to disk
    const reportPath = path.join(this.errorsDir, `${report.id}.json`);
    fs.promises.writeFile(
      reportPath,
      JSON.stringify(
        {
          ...report,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        },
        null,
        2
      ),
      'utf8'
    );
  }

  /**
   * Flush log buffer to disk
   */
  private flushLogs(): void {
    if (this.logBuffer.length === 0) {
      return;
    }

    // Check if we need to rotate log file
    const currentPath = this.getLogFilePath();
    if (currentPath !== this.currentLogFile) {
      this.currentLogFile = currentPath;
    }

    // Format log entries
    const logLines = this.logBuffer.map(entry => {
      const parts = [
        entry.timestamp,
        entry.level.toUpperCase().padEnd(5),
        entry.category.padEnd(20),
        entry.message
      ];

      if (entry.context) {
        parts.push(JSON.stringify(entry.context));
      }

      if (entry.error) {
        parts.push(`\n  Error: ${entry.error.name}: ${entry.error.message}`);
        if (entry.error.stack) {
          parts.push(`\n  Stack: ${entry.error.stack}`);
        }
      }

      return parts.join(' | ');
    });

    // Append to log file
    fs.appendFileSync(this.currentLogFile, logLines.join('\n') + '\n', 'utf8');

    // Clear buffer
    this.logBuffer = [];
  }

  /**
   * Get error reports
   */
  getErrorReports(filter?: { resolved?: boolean; since?: string }): ErrorReport[] {
    let reports = Array.from(this.errorReports.values());

    if (filter) {
      if (filter.resolved !== undefined) {
        reports = reports.filter(r => r.resolved === filter.resolved);
      }
      if (filter.since) {
        const sinceDate = new Date(filter.since);
        reports = reports.filter(r => new Date(r.timestamp) >= sinceDate);
      }
    }

    return reports;
  }

  /**
   * Resolve error report
   */
  async resolveErrorReport(reportId: string, notes?: string): Promise<void> {
    const report = this.errorReports.get(reportId);
    if (report) {
      report.resolved = true;
      report.notes = notes;

      // Update file
      const reportPath = path.join(this.errorsDir, `${reportId}.json`);
      if (fs.existsSync(reportPath)) {
        await fs.promises.writeFile(
          reportPath,
          JSON.stringify(
            {
              ...report,
              error: {
                name: report.error.name,
                message: report.error.message,
                stack: report.error.stack
              }
            },
            null,
            2
          ),
          'utf8'
        );
      }
    }
  }

  /**
   * Report an error and create a report
   */
  async reportError(error: Error, context?: Record<string, any>): Promise<string> {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      error,
      context: context || {},
      resolved: false
    };

    this.errorReports.set(report.id, report);

    // Save error report to disk
    const reportPath = path.join(this.errorsDir, `${report.id}.json`);
    await fs.promises.writeFile(
      reportPath,
      JSON.stringify(
        {
          ...report,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        },
        null,
        2
      ),
      'utf8'
    );

    // Emit event
    this.emit('error-reported', report);

    return report.id;
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 100): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  /**
   * Get log statistics
   */
  getStatistics(): {
    totalLogs: number;
    errorReports: number;
    unresolvedErrors: number;
  } {
    return {
      totalLogs: this.logBuffer.length,
      errorReports: this.errorReports.size,
      unresolvedErrors: Array.from(this.errorReports.values()).filter(r => !r.resolved).length
    };
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushLogs();
  }
}

// Singleton instance
let errorHandlingService: ErrorHandlingService | null = null;

export function getErrorHandlingService(dataRoot?: string): ErrorHandlingService {
  if (!errorHandlingService) {
    errorHandlingService = new ErrorHandlingService(dataRoot);
  }
  return errorHandlingService;
}

export default ErrorHandlingService;


