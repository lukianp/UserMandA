/**
 * Centralized Logging Service
 *
 * Provides consistent logging across the application with support for
 * different log levels, structured logging, and file persistence.
 */

import * as fs from 'fs';
import * as path from 'path';

import { app } from 'electron';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  error?: Error;
}

export interface LoggingConfig {
  enableFileLogging: boolean;
  enableConsoleLogging: boolean;
  logDirectory: string;
  maxLogFiles: number;
  maxLogFileSize: number; // in bytes
  minLogLevel: LogLevel;
}

class LoggingService {
  private config: LoggingConfig;
  private currentLogFile: string | null = null;
  private logBuffer: LogEntry[] = [];
  private isInitialized = false;

  constructor() {
    const userDataPath = app?.getPath('userData') || process.cwd();

    this.config = {
      enableFileLogging: true,
      enableConsoleLogging: true,
      logDirectory: path.join(userDataPath, 'logs'),
      maxLogFiles: 10,
      maxLogFileSize: 10 * 1024 * 1024, // 10MB
      minLogLevel: LogLevel.DEBUG,
    };
  }

  /**
   * Initialize the logging service
   */
  async initialize(config?: Partial<LoggingConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.enableFileLogging) {
      await this.ensureLogDirectory();
      await this.rotateLogFiles();
      this.currentLogFile = this.getLogFilePath();
    }

    this.isInitialized = true;
    this.info('LoggingService', 'Logging service initialized', {
      config: this.config,
    });
  }

  /**
   * Log a debug message
   */
  debug(component: string, message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, component, message, context);
  }

  /**
   * Log an info message
   */
  info(component: string, message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, component, message, context);
  }

  /**
   * Log a warning message
   */
  warn(component: string, message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, component, message, context);
  }

  /**
   * Log an error message
   */
  error(component: string, message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, component, message, { ...context, error: error?.message }, error);
  }

  /**
   * Log a fatal error message
   */
  fatal(component: string, message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, component, message, { ...context, error: error?.message }, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    component: string,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Check if log level meets minimum threshold
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      context,
      stack: error?.stack,
      error,
    };

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(logEntry);
    }

    // File logging
    if (this.config.enableFileLogging) {
      this.logToFile(logEntry);
    }

    // Add to buffer
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > 1000) {
      this.logBuffer.shift();
    }
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level}] [${entry.component}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.context || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.context || '', entry.stack || '');
        break;
    }
  }

  /**
   * Log to file
   */
  private async logToFile(entry: LogEntry): Promise<void> {
    if (!this.currentLogFile) {
      return;
    }

    try {
      const logLine = this.formatLogEntry(entry);

      // Check if log file needs rotation
      if (await this.shouldRotateLogFile()) {
        await this.rotateLogFiles();
        this.currentLogFile = this.getLogFilePath();
      }

      await fs.promises.appendFile(this.currentLogFile, logLine + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Format log entry for file output
   */
  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      entry.timestamp,
      entry.level,
      entry.component,
      entry.message,
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(JSON.stringify(entry.context));
    }

    if (entry.stack) {
      parts.push(entry.stack.replace(/\n/g, '\\n'));
    }

    return parts.join(' | ');
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.config.minLogLevel);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDirectory(): Promise<void> {
    try {
      if (!fs.existsSync(this.config.logDirectory)) {
        await fs.promises.mkdir(this.config.logDirectory, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Get current log file path
   */
  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.config.logDirectory, `app-${date}.log`);
  }

  /**
   * Check if log file should be rotated
   */
  private async shouldRotateLogFile(): Promise<boolean> {
    if (!this.currentLogFile || !fs.existsSync(this.currentLogFile)) {
      return false;
    }

    try {
      const stats = await fs.promises.stat(this.currentLogFile);
      return stats.size >= this.config.maxLogFileSize;
    } catch (error) {
      return false;
    }
  }

  /**
   * Rotate log files
   */
  private async rotateLogFiles(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.config.logDirectory);
      const logFiles = files
        .filter(f => f.startsWith('app-') && f.endsWith('.log'))
        .map(f => ({
          name: f,
          path: path.join(this.config.logDirectory, f),
          mtime: fs.statSync(path.join(this.config.logDirectory, f)).mtime,
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Delete old log files
      if (logFiles.length >= this.config.maxLogFiles) {
        const filesToDelete = logFiles.slice(this.config.maxLogFiles - 1);
        for (const file of filesToDelete) {
          await fs.promises.unlink(file.path);
        }
      }
    } catch (error) {
      console.error('Failed to rotate log files:', error);
    }
  }

  /**
   * Get recent log entries
   */
  getRecentLogs(count = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel, count = 100): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level === level)
      .slice(-count);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string, count = 100): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.component === component)
      .slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggingConfig {
    return { ...this.config };
  }
}

// Singleton instance
let loggingService: LoggingService | null = null;

export function getLoggingService(): LoggingService {
  if (!loggingService) {
    loggingService = new LoggingService();
  }
  return loggingService;
}

export default LoggingService;


