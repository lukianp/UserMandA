import { useEffect, useCallback } from 'react';
import { ErrorContext } from '../../types/debug';

interface ErrorLoggingOptions {
  enabled?: boolean;
  componentName?: string;
  captureStackTraces?: boolean;
  captureContext?: boolean;
  maxContextDepth?: number;
  includeBrowserInfo?: boolean;
  includeUserAgent?: boolean;
}

export const useErrorLoggingLogic = (options: ErrorLoggingOptions = {}) => {
  const {
    enabled = process.env.DEBUG === 'true',
    componentName = 'UnknownComponent',
    captureStackTraces = true,
    captureContext = true,
    maxContextDepth = 3,
    includeBrowserInfo = true,
    includeUserAgent = true
  } = options;

  // Send error context to main process
  const sendErrorContext = useCallback((context: ErrorContext) => {
    if (!enabled) return;

    if (window.electronAPI) {
      // For now, log to console in development, will integrate with debug service later
      if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${componentName}:`, context);
      }
    }
  }, [enabled, componentName]);

  // Capture error context
  const captureError = useCallback((
    error: Error | string,
    additionalContext?: Record<string, any>,
    userSessionId?: string,
    reproductionSteps?: string[]
  ) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const context: ErrorContext = {
      stackTrace: captureStackTraces ? errorObj.stack || 'No stack trace available' : '',
      errorCode: (errorObj as any).code,
      contextVariables: {},
      userSessionId,
      reproductionSteps,
      correlationId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    // Capture additional context
    if (captureContext && additionalContext) {
      context.contextVariables = sanitizeContext(additionalContext, maxContextDepth);
    }

    // Add browser/environment information
    if (includeBrowserInfo) {
      context.contextVariables = {
        ...context.contextVariables,
        browser: {
          userAgent: includeUserAgent ? navigator.userAgent : '[REDACTED]',
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine
        },
        environment: {
          url: window.location.href,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };
    }

    sendErrorContext(context);
    return context.correlationId;
  }, [
    captureStackTraces,
    captureContext,
    maxContextDepth,
    includeBrowserInfo,
    includeUserAgent,
    sendErrorContext
  ]);

  // Sanitize context to prevent logging sensitive information and limit depth
  const sanitizeContext = useCallback((obj: any, depth: number = maxContextDepth): any => {
    if (depth <= 0) return '[MAX_DEPTH_REACHED]';

    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
      if (obj.length > 50) return `[ARRAY_TOO_LARGE: ${obj.length} items]`;
      return obj.map(item => sanitizeContext(item, depth - 1));
    }

    // Handle objects
    const sanitized: any = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential', 'auth', 'authorization'];

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeContext(value, depth - 1);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }, [maxContextDepth]);

  // Global error handlers
  useEffect(() => {
    if (!enabled) return;

    const handleGlobalError = (event: ErrorEvent) => {
      captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: 'global_error_handler'
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          reason: event.reason,
          source: 'unhandled_promise_rejection'
        }
      );
    };

    const handleConsoleError = (...args: any[]) => {
      // Capture console.error calls
      const error = args.find(arg => arg instanceof Error) || new Error(args.join(' '));
      captureError(error, {
        consoleArgs: args,
        source: 'console_error'
      });
    };

    // Override console.error to capture errors
    const originalConsoleError = console.error;
    console.error = handleConsoleError;

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, [enabled, captureError]);

  // React error boundary integration
  const logReactError = useCallback((
    error: Error,
    errorInfo: { componentStack: string },
    additionalContext?: Record<string, any>
  ) => {
    captureError(error, {
      ...additionalContext,
      componentStack: errorInfo.componentStack,
      source: 'react_error_boundary',
      component: componentName
    });
  }, [captureError, componentName]);

  // Network error logging
  const logNetworkError = useCallback((
    url: string,
    method: string,
    status?: number,
    statusText?: string,
    response?: any,
    requestData?: any
  ) => {
    const error = new Error(`Network request failed: ${method} ${url} - ${status} ${statusText}`);

    captureError(error, {
      url,
      method,
      status,
      statusText,
      response: sanitizeContext(response),
      requestData: sanitizeContext(requestData),
      source: 'network_error'
    });
  }, [captureError, sanitizeContext]);

  // Validation error logging
  const logValidationError = useCallback((
    field: string,
    value: any,
    validationRules: string[],
    errorMessage: string
  ) => {
    const error = new Error(`Validation failed: ${errorMessage}`);

    captureError(error, {
      field,
      value: sanitizeContext(value),
      validationRules,
      source: 'validation_error'
    });
  }, [captureError, sanitizeContext]);

  // Hook API
  return {
    captureError,
    logReactError,
    logNetworkError,
    logValidationError,
    sanitizeContext
  };
};