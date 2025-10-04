/**
 * Enhanced Error Handling Service
 *
 * Features:
 * - Error boundary integration
 * - Unhandled promise rejection capture
 * - Global error reporting
 * - Error categorization (network, validation, auth, system)
 * - Error recovery strategies
 * - User-friendly error messages
 * - Retry logic for transient errors
 * - Error analytics and aggregation
 */

import * as crypto from 'crypto';
import loggingService, { LogLevel } from './loggingService';

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

/**
 * Error severity
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Recovery strategy
 */
export type RecoveryStrategy =
  | 'retry'
  | 'fallback'
  | 'ignore'
  | 'user-action'
  | 'reload'
  | 'none';

/**
 * Error report
 */
export interface ErrorReport {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  context?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
  handled: boolean;
  recovered: boolean;
  recoveryStrategy?: RecoveryStrategy;
  userMessage?: string;
}

/**
 * Error handler function
 */
export type ErrorHandler = (error: Error, report: ErrorReport) => void | Promise<void>;

/**
 * Recovery handler function
 */
export type RecoveryHandler = (report: ErrorReport) => boolean | Promise<boolean>;

/**
 * Enhanced Error Handling Service
 */
class ErrorHandlingService {
  private errors: ErrorReport[] = [];
  private maxErrors: number = 1000;
  private handlers: Map<ErrorCategory, ErrorHandler[]> = new Map();
  private recoveryHandlers: Map<RecoveryStrategy, RecoveryHandler> = new Map();
  private sessionId: string;
  private initialized: boolean = false;

  constructor() {
    this.sessionId = crypto.randomUUID();

    // Initialize default handlers for each category
    for (const category of Object.values(ErrorCategory)) {
      this.handlers.set(category as ErrorCategory, []);
    }

    // Setup default recovery handlers
    this.setupDefaultRecoveryHandlers();
  }

  /**
   * Initialize the service
   */
  initialize(): void {
    if (this.initialized) {
      console.warn('ErrorHandlingService already initialized');
      return;
    }

    // Global error handler
    window.addEventListener('error', this.handleGlobalError.bind(this));

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    this.initialized = true;
    loggingService.info('ErrorHandlingService initialized', 'ErrorHandlingService');
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(event: ErrorEvent): void {
    event.preventDefault(); // Prevent default browser error handling

    this.captureError(event.error || new Error(event.message), {
      context: 'Global Error',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    event.preventDefault(); // Prevent default unhandled rejection warning

    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    this.captureError(error, {
      context: 'Unhandled Promise Rejection',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
    });
  }

  /**
   * Capture and process an error
   */
  captureError(
    error: Error | string,
    options?: {
      context?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      metadata?: Record<string, any>;
      handled?: boolean;
    }
  ): ErrorReport {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const category = options?.category || this.categorizeError(errorObj);
    const severity = options?.severity || this.determineSeverity(category, errorObj);

    const report: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message: errorObj.message,
      stack: errorObj.stack,
      context: options?.context,
      category,
      severity,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      metadata: options?.metadata,
      handled: options?.handled || false,
      recovered: false,
      userMessage: this.getUserFriendlyMessage(category, errorObj),
    };

    // Store error
    this.errors.push(report);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log error
    loggingService.error(
      `[${category}] ${report.message}`,
      options?.context || 'ErrorHandlingService',
      report.metadata,
      errorObj
    );

    // Call registered handlers
    this.callHandlers(category, errorObj, report);

    // Attempt recovery
    this.attemptRecovery(report);

    return report;
  }

  /**
   * Categorize error based on message and type
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      error.name === 'NetworkError'
    ) {
      return ErrorCategory.NETWORK;
    }

    // Validation errors
    if (
      message.includes('invalid') ||
      message.includes('validation') ||
      message.includes('required') ||
      message.includes('format')
    ) {
      return ErrorCategory.VALIDATION;
    }

    // Authentication errors
    if (
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('credential') ||
      message.includes('token') ||
      message.includes('401')
    ) {
      return ErrorCategory.AUTHENTICATION;
    }

    // Authorization errors
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('unauthorized') ||
      message.includes('403')
    ) {
      return ErrorCategory.AUTHORIZATION;
    }

    // Not found errors
    if (
      message.includes('not found') ||
      message.includes('404')
    ) {
      return ErrorCategory.NOT_FOUND;
    }

    // Conflict errors
    if (
      message.includes('conflict') ||
      message.includes('duplicate') ||
      message.includes('409')
    ) {
      return ErrorCategory.CONFLICT;
    }

    // System errors
    if (
      message.includes('system') ||
      message.includes('internal') ||
      message.includes('500')
    ) {
      return ErrorCategory.SYSTEM;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(category: ErrorCategory, error: Error): ErrorSeverity {
    // Critical errors
    if (
      category === ErrorCategory.SYSTEM ||
      error.message.includes('crash') ||
      error.message.includes('fatal')
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity
    if (
      category === ErrorCategory.AUTHENTICATION ||
      category === ErrorCategory.AUTHORIZATION
    ) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity
    if (
      category === ErrorCategory.NETWORK ||
      category === ErrorCategory.CONFLICT
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity
    return ErrorSeverity.LOW;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(category: ErrorCategory, error: Error): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Network connection issue. Please check your internet connection and try again.',
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Your session has expired. Please log in again.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorCategory.NOT_FOUND]: 'The requested resource could not be found.',
      [ErrorCategory.CONFLICT]: 'This operation conflicts with existing data.',
      [ErrorCategory.SYSTEM]: 'An unexpected error occurred. Please try again later.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred.',
    };

    return messages[category] || error.message;
  }

  /**
   * Call registered error handlers
   */
  private async callHandlers(category: ErrorCategory, error: Error, report: ErrorReport): Promise<void> {
    const handlers = this.handlers.get(category) || [];

    for (const handler of handlers) {
      try {
        await handler(error, report);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }
  }

  /**
   * Attempt to recover from error
   */
  private async attemptRecovery(report: ErrorReport): Promise<void> {
    // Determine recovery strategy
    const strategy = this.determineRecoveryStrategy(report);
    report.recoveryStrategy = strategy;

    if (strategy === 'none') {
      return;
    }

    const handler = this.recoveryHandlers.get(strategy);
    if (!handler) {
      return;
    }

    try {
      const recovered = await handler(report);
      report.recovered = recovered;

      if (recovered) {
        loggingService.info(
          `Error recovered using ${strategy} strategy`,
          'ErrorHandlingService',
          { errorId: report.id }
        );
      }
    } catch (recoveryError) {
      loggingService.error(
        'Recovery attempt failed',
        'ErrorHandlingService',
        { errorId: report.id, strategy },
        recoveryError as Error
      );
    }
  }

  /**
   * Determine recovery strategy
   */
  private determineRecoveryStrategy(report: ErrorReport): RecoveryStrategy {
    // Transient network errors - retry
    if (
      report.category === ErrorCategory.NETWORK &&
      this.isTransientError(report.message)
    ) {
      return 'retry';
    }

    // Authentication errors - user action required
    if (report.category === ErrorCategory.AUTHENTICATION) {
      return 'user-action';
    }

    // System errors with high severity - reload
    if (
      report.category === ErrorCategory.SYSTEM &&
      report.severity === ErrorSeverity.CRITICAL
    ) {
      return 'reload';
    }

    // Low severity errors - ignore
    if (report.severity === ErrorSeverity.LOW) {
      return 'ignore';
    }

    return 'none';
  }

  /**
   * Check if error is transient
   */
  private isTransientError(message: string): boolean {
    const transientPatterns = [
      /timeout/i,
      /temporarily unavailable/i,
      /too many requests/i,
      /service unavailable/i,
      /503/,
      /429/,
    ];

    return transientPatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Setup default recovery handlers
   */
  private setupDefaultRecoveryHandlers(): void {
    // Retry strategy
    this.recoveryHandlers.set('retry', async (report) => {
      loggingService.info('Attempting retry recovery', 'ErrorHandlingService', { errorId: report.id });
      // Actual retry logic would be implemented by the calling code
      return false;
    });

    // Ignore strategy
    this.recoveryHandlers.set('ignore', async () => {
      return true; // Always succeeds
    });

    // Reload strategy
    this.recoveryHandlers.set('reload', async (report) => {
      loggingService.warn('Reloading application due to critical error', 'ErrorHandlingService', { errorId: report.id });
      setTimeout(() => window.location.reload(), 3000);
      return true;
    });

    // User action strategy
    this.recoveryHandlers.set('user-action', async () => {
      // Notification would be shown to user
      return false;
    });
  }

  /**
   * Register error handler for a category
   */
  registerHandler(category: ErrorCategory, handler: ErrorHandler): void {
    const handlers = this.handlers.get(category) || [];
    handlers.push(handler);
    this.handlers.set(category, handlers);

    loggingService.debug(`Registered error handler for ${category}`, 'ErrorHandlingService');
  }

  /**
   * Register recovery handler
   */
  registerRecoveryHandler(strategy: RecoveryStrategy, handler: RecoveryHandler): void {
    this.recoveryHandlers.set(strategy, handler);
    loggingService.debug(`Registered recovery handler for ${strategy}`, 'ErrorHandlingService');
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ErrorReport[] {
    return this.errors.filter((e) => e.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return this.errors.filter((e) => e.severity === severity);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.errors.slice(-limit);
  }

  /**
   * Get error statistics
   */
  getStatistics() {
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const category of Object.values(ErrorCategory)) {
      byCategory[category] = this.errors.filter((e) => e.category === category).length;
    }

    for (const severity of Object.values(ErrorSeverity)) {
      bySeverity[severity] = this.errors.filter((e) => e.severity === severity).length;
    }

    return {
      total: this.errors.length,
      handled: this.errors.filter((e) => e.handled).length,
      recovered: this.errors.filter((e) => e.recovered).length,
      byCategory,
      bySeverity,
      sessionId: this.sessionId,
    };
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    loggingService.info('All errors cleared', 'ErrorHandlingService');
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);

    this.errors = [];
    this.handlers.clear();
    this.initialized = false;

    loggingService.info('ErrorHandlingService shut down', 'ErrorHandlingService');
  }
}

export default new ErrorHandlingService();
