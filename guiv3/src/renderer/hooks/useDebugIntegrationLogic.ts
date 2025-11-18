import { useDebugInteractionLogic } from './useDebugInteractionLogic';
import { usePerformanceMonitoringLogic } from './usePerformanceMonitoringLogic';
import { useErrorLoggingLogic } from './useErrorLoggingLogic';

interface DebugIntegrationOptions {
  enabled?: boolean;
  componentName?: string;
  captureKeystrokes?: boolean;
  captureMouseEvents?: boolean;
  capturePerformance?: boolean;
  captureErrors?: boolean;
  trackRenderTime?: boolean;
  trackInteractions?: boolean;
  trackMemory?: boolean;
  slowOperationThreshold?: number;
  captureStackTraces?: boolean;
  captureContext?: boolean;
}

export const useDebugIntegrationLogic = (options: DebugIntegrationOptions = {}) => {
  const {
    enabled = process.env.DEBUG === 'true',
    componentName = 'UnknownComponent',
    captureKeystrokes = true,
    captureMouseEvents = true,
    capturePerformance = true,
    captureErrors = true,
    trackRenderTime = true,
    trackInteractions = true,
    trackMemory = false,
    slowOperationThreshold = 100,
    captureStackTraces = true,
    captureContext = true
  } = options;

  // Initialize all debug hooks
  const debugInteraction = useDebugInteractionLogic({
    enabled,
    captureKeystrokes,
    captureMouseEvents,
    capturePerformance,
    captureErrors,
    componentName
  });

  const performanceMonitoring = usePerformanceMonitoringLogic({
    enabled,
    componentName,
    trackRenderTime,
    trackInteractions,
    trackMemory,
    slowOperationThreshold
  });

  const errorLogging = useErrorLoggingLogic({
    enabled,
    componentName,
    captureStackTraces,
    captureContext
  });

  // Combined API for easy integration
  const startOperation = performanceMonitoring.startOperation;
  const endOperation = performanceMonitoring.endOperation;
  const trackApiCall = performanceMonitoring.trackApiCall;

  const captureError = errorLogging.captureError;
  const logReactError = errorLogging.logReactError;
  const logNetworkError = errorLogging.logNetworkError;
  const logValidationError = errorLogging.logValidationError;

  // Convenient wrapper for common operations
  const withDebugTracking = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    additionalContext?: Record<string, any>
  ): Promise<T> => {
    const markId = debugInteraction.startPerformanceMark(operationName);

    try {
      const result = await operation();
      debugInteraction.endPerformanceMark(markId ?? '', operationName);
      return result;
    } catch (error) {
      debugInteraction.endPerformanceMark(markId ?? '', operationName, { error: error instanceof Error ? error.message : String(error) });
      captureError(error instanceof Error ? error : new Error(String(error)), additionalContext);
      throw error;
    }
  };

  // Component lifecycle helpers
  const trackComponentMount = () => {
    if (enabled && process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] Component mounted: ${componentName}`);
    }
  };

  const trackComponentUnmount = () => {
    if (enabled && process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] Component unmounted: ${componentName}`);
    }
  };

  // Hook API
  return {
    // Performance monitoring
    startOperation,
    endOperation,
    trackApiCall,

    // Error logging
    captureError,
    logReactError,
    logNetworkError,
    logValidationError,

    // Debug interaction (keystrokes, mouse, etc.)
    startPerformanceMark: debugInteraction.startPerformanceMark,
    endPerformanceMark: debugInteraction.endPerformanceMark,
    captureInteractionError: debugInteraction.captureError,

    // Utility functions
    withDebugTracking,
    trackComponentMount,
    trackComponentUnmount,

    // Direct access to individual hooks if needed
    debugInteraction,
    performanceMonitoring,
    errorLogging,

    // Configuration status
    isEnabled: enabled,
    componentName
  };
};