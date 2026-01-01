/**
 * Centralized Error Handler
 *
 * Provides consistent error handling across the application with
 * standardized error types, logging, and user-friendly error messages.
 */

import { getLoggingService, LogLevel } from '../services/loggingService';

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  FILE_SYSTEM = 'FILE_SYSTEM',
  POWERSHELL = 'POWERSHELL',
  DATABASE = 'DATABASE',
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  component: string;
  context?: Record<string, any>;
  originalError?: Error;
  stack?: string;
  timestamp: string;
  userMessage: string;
  suggestions?: string[];
}

export interface ErrorHandlerOptions {
  logError?: boolean;
  notifyUser?: boolean;
  throwError?: boolean;
}

/**
 * Custom application error class
 */
export class ApplicationError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly component: string;
  public readonly context?: Record<string, any>;
  public readonly userMessage: string;
  public readonly suggestions?: string[];

  constructor(
    code: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    component: string,
    userMessage: string,
    context?: Record<string, any>,
    suggestions?: string[]
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.component = component;
    this.context = context;
    this.userMessage = userMessage;
    this.suggestions = suggestions;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler class
 */
class ErrorHandler {
  private loggingService = getLoggingService();

  /**
   * Handle an error with optional logging and notification
   */
  handleError(
    error: Error | ApplicationError | unknown,
    component: string,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const {
      logError = true,
      notifyUser = false,
      throwError = false,
    } = options;

    const appError = this.normalizeError(error, component);

    // Log error
    if (logError) {
      this.logError(appError);
    }

    // Notify user (implementation depends on your notification system)
    if (notifyUser) {
      this.notifyUser(appError);
    }

    // Re-throw if needed
    if (throwError) {
      throw new ApplicationError(
        appError.code,
        appError.message,
        appError.category,
        appError.severity,
        appError.component,
        appError.userMessage,
        appError.context,
        appError.suggestions
      );
    }

    return appError;
  }

  /**
   * Normalize any error to AppError format
   */
  private normalizeError(error: unknown, component: string): AppError {
    if (error instanceof ApplicationError) {
      return {
        code: error.code,
        message: error.message,
        category: error.category,
        severity: error.severity,
        component: error.component,
        context: error.context,
        originalError: error,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userMessage: error.userMessage,
        suggestions: error.suggestions,
      };
    }

    if (error instanceof Error) {
      const category = this.categorizeError(error);
      const severity = this.determineSeverity(error, category);

      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        category,
        severity,
        component,
        originalError: error,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userMessage: this.getUserFriendlyMessage(error, category),
        suggestions: this.getSuggestions(error, category),
      };
    }

    // Unknown error type
    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      component,
      stack: undefined,
      timestamp: new Date().toISOString(),
      userMessage: 'An unexpected error occurred. Please try again.',
      suggestions: ['Try refreshing the page', 'Contact support if the issue persists'],
    };
  }

  /**
   * Categorize error based on error type and message
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('file') || message.includes('path') || message.includes('enoent')) {
      return ErrorCategory.FILE_SYSTEM;
    }
    if (message.includes('powershell') || message.includes('script')) {
      return ErrorCategory.POWERSHELL;
    }
    if (message.includes('database') || message.includes('sql')) {
      return ErrorCategory.DATABASE;
    }
    if (message.includes('config')) {
      return ErrorCategory.CONFIGURATION;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Fatal errors
    if (error.message.toLowerCase().includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }

    // Category-based severity
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.DATABASE:
        return ErrorSeverity.HIGH;
      case ErrorCategory.NETWORK:
      case ErrorCategory.FILE_SYSTEM:
      case ErrorCategory.POWERSHELL:
        return ErrorSeverity.MEDIUM;
      case ErrorCategory.VALIDATION:
      case ErrorCategory.CONFIGURATION:
        return ErrorSeverity.LOW;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: Error, category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.VALIDATION:
        return 'The provided information is invalid. Please check your inputs and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials and try again.';
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorCategory.NETWORK:
        return 'Network error occurred. Please check your connection and try again.';
      case ErrorCategory.FILE_SYSTEM:
        return 'File system error occurred. Please check file permissions and paths.';
      case ErrorCategory.POWERSHELL:
        return 'PowerShell execution failed. Please check the script and try again.';
      case ErrorCategory.DATABASE:
        return 'Database error occurred. Please try again or contact support.';
      case ErrorCategory.CONFIGURATION:
        return 'Configuration error. Please check your settings.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get suggestions for resolving the error
   */
  private getSuggestions(error: Error, category: ErrorCategory): string[] {
    const suggestions: string[] = [];

    switch (category) {
      case ErrorCategory.VALIDATION:
        suggestions.push('Verify all required fields are filled');
        suggestions.push('Check that values are in the correct format');
        break;
      case ErrorCategory.AUTHENTICATION:
        suggestions.push('Verify your username and password');
        suggestions.push('Check if your account is active');
        suggestions.push('Try logging out and logging in again');
        break;
      case ErrorCategory.AUTHORIZATION:
        suggestions.push('Contact your administrator for access');
        suggestions.push('Verify you have the necessary permissions');
        break;
      case ErrorCategory.NETWORK:
        suggestions.push('Check your internet connection');
        suggestions.push('Verify the server is accessible');
        suggestions.push('Try again in a few moments');
        break;
      case ErrorCategory.FILE_SYSTEM:
        suggestions.push('Verify the file or directory exists');
        suggestions.push('Check file permissions');
        suggestions.push('Ensure the path is correct');
        break;
      case ErrorCategory.POWERSHELL:
        suggestions.push('Check the PowerShell script for errors');
        suggestions.push('Verify required modules are installed');
        suggestions.push('Check the execution logs for details');
        break;
      case ErrorCategory.DATABASE:
        suggestions.push('Verify database connection settings');
        suggestions.push('Check if the database is accessible');
        suggestions.push('Contact support if the issue persists');
        break;
      case ErrorCategory.CONFIGURATION:
        suggestions.push('Review your configuration settings');
        suggestions.push('Reset to default configuration if needed');
        suggestions.push('Consult documentation for correct settings');
        break;
      default:
        suggestions.push('Try the operation again');
        suggestions.push('Refresh the page');
        suggestions.push('Contact support if the issue persists');
    }

    return suggestions;
  }

  /**
   * Log error to logging service
   */
  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);

    this.loggingService.log(
      logLevel,
      error.component,
      error.message,
      {
        code: error.code,
        category: error.category,
        severity: error.severity,
        context: error.context,
        userMessage: error.userMessage,
        suggestions: error.suggestions,
      },
      error.originalError
    );
  }

  /**
   * Get log level from error severity
   */
  private getLogLevel(severity: ErrorSeverity): LogLevel {
    switch (severity) {
      case ErrorSeverity.LOW:
        return LogLevel.WARN;
      case ErrorSeverity.MEDIUM:
        return LogLevel.ERROR;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return LogLevel.FATAL;
      default:
        return LogLevel.ERROR;
    }
  }

  /**
   * Notify user about error (placeholder - implement based on your notification system)
   */
  private notifyUser(error: AppError): void {
    // This would be implemented with your notification/toast system
    console.warn('Error notification:', error.userMessage);
  }

  /**
   * Create a custom application error
   */
  createError(
    code: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    component: string,
    userMessage: string,
    context?: Record<string, any>,
    suggestions?: string[]
  ): ApplicationError {
    return new ApplicationError(
      code,
      message,
      category,
      severity,
      component,
      userMessage,
      context,
      suggestions
    );
  }
}

// Singleton instance
let errorHandler: ErrorHandler | null = null;

export function getErrorHandler(): ErrorHandler {
  if (!errorHandler) {
    errorHandler = new ErrorHandler();
  }
  return errorHandler;
}

// Convenience functions
export function handleError(
  error: unknown,
  component: string,
  options?: ErrorHandlerOptions
): AppError {
  return getErrorHandler().handleError(error, component, options);
}

export function createError(
  code: string,
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  component: string,
  userMessage: string,
  context?: Record<string, any>,
  suggestions?: string[]
): ApplicationError {
  return getErrorHandler().createError(
    code,
    message,
    category,
    severity,
    component,
    userMessage,
    context,
    suggestions
  );
}

export default ErrorHandler;


