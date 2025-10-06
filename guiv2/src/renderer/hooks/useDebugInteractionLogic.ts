import { useEffect, useCallback, useRef } from 'react';
import { KeystrokeEvent, MouseEvent, PerformanceMetrics, ErrorContext } from '../../types/debug';

interface DebugInteractionOptions {
  enabled?: boolean;
  captureKeystrokes?: boolean;
  captureMouseEvents?: boolean;
  capturePerformance?: boolean;
  captureErrors?: boolean;
  componentName?: string;
}

export const useDebugInteractionLogic = (options: DebugInteractionOptions = {}) => {
  const {
    enabled = process.env.DEBUG === 'true',
    captureKeystrokes = true,
    captureMouseEvents = true,
    capturePerformance = true,
    captureErrors = true,
    componentName = 'UnknownComponent'
  } = options;

  const performanceMarks = useRef<Map<string, number>>(new Map());

  // Send debug events to main process
  const sendDebugEvent = useCallback((event: 'keystroke' | 'mouse' | 'performance' | 'error', data: any) => {
    if (!enabled) return;

    // Send via existing IPC channels or create a new one
    if (window.electronAPI) {
      // For now, log to console in development, will integrate with debug service later
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG-${event.toUpperCase()}]`, componentName, data);
      }
    }
  }, [enabled, componentName]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!captureKeystrokes) return;

    const keystrokeEvent: KeystrokeEvent = {
      type: 'keydown',
      key: event.key,
      keyCode: event.keyCode,
      modifiers: {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      },
      uiElementId: (event.target as HTMLElement)?.id,
      componentName,
      timestamp: new Date().toISOString()
    };

    sendDebugEvent('keystroke', keystrokeEvent);
  }, [captureKeystrokes, componentName, sendDebugEvent]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!captureKeystrokes) return;

    const keystrokeEvent: KeystrokeEvent = {
      type: 'keyup',
      key: event.key,
      keyCode: event.keyCode,
      modifiers: {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      },
      uiElementId: (event.target as HTMLElement)?.id,
      componentName,
      timestamp: new Date().toISOString()
    };

    sendDebugEvent('keystroke', keystrokeEvent);
  }, [captureKeystrokes, componentName, sendDebugEvent]);

  // Mouse event handlers
  const handleMouseEvent = useCallback((event: globalThis.MouseEvent | WheelEvent) => {
    if (!captureMouseEvents) return;

    const isWheelEvent = event.type === 'wheel';
    const wheelEvent = event as WheelEvent;

    const mouseEvent: MouseEvent = {
      type: event.type as any,
      x: event.clientX,
      y: event.clientY,
      button: (event as globalThis.MouseEvent).button,
      modifiers: {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      },
      uiElementId: (event.target as HTMLElement)?.id,
      componentName,
      deltaX: isWheelEvent ? wheelEvent.deltaX : undefined,
      deltaY: isWheelEvent ? wheelEvent.deltaY : undefined,
      timestamp: new Date().toISOString()
    };

    sendDebugEvent('mouse', mouseEvent);
  }, [captureMouseEvents, componentName, sendDebugEvent]);

  // Performance monitoring
  const startPerformanceMark = useCallback((operation: string) => {
    if (!capturePerformance) return;

    const markId = `${componentName}_${operation}_${Date.now()}`;
    performanceMarks.current.set(markId, Date.now());
    return markId;
  }, [capturePerformance, componentName]);

  const endPerformanceMark = useCallback((markId: string, operation: string, additionalData?: Record<string, any>) => {
    if (!capturePerformance) return;

    const startTime = performanceMarks.current.get(markId);
    if (!startTime) return;

    const endTime = Date.now();
    const duration = endTime - startTime;

    performanceMarks.current.delete(markId);

    const metrics: PerformanceMetrics = {
      cpuUsage: 0, // Would need to be collected from main process
      memoryUsage: 0, // Would need to be collected from main process
      renderTime: duration,
      apiResponseTime: additionalData?.apiResponseTime,
      componentName,
      operation,
      timestamp: new Date().toISOString()
    };

    sendDebugEvent('performance', metrics);
  }, [capturePerformance, componentName, sendDebugEvent]);

  // Error handling
  const captureError = useCallback((error: Error, context?: Record<string, any>) => {
    if (!captureErrors) return;

    const errorContext: ErrorContext = {
      stackTrace: error.stack || '',
      errorCode: (error as any).code,
      contextVariables: context,
      userSessionId: undefined, // Would be set by main process
      reproductionSteps: [],
      correlationId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    sendDebugEvent('error', errorContext);
  }, [captureErrors, sendDebugEvent]);

  // Global error handler
  const handleGlobalError = useCallback((event: ErrorEvent) => {
    captureError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }, [captureError]);

  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    captureError(new Error(`Unhandled promise rejection: ${event.reason}`), {
      reason: event.reason
    });
  }, [captureError]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    // Keyboard events
    if (captureKeystrokes) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }

    // Mouse events
    if (captureMouseEvents) {
      document.addEventListener('mousedown', handleMouseEvent as EventListener);
      document.addEventListener('mouseup', handleMouseEvent as EventListener);
      document.addEventListener('click', handleMouseEvent as EventListener);
      document.addEventListener('dblclick', handleMouseEvent as EventListener);
      document.addEventListener('wheel', handleMouseEvent as EventListener);
    }

    // Error events
    if (captureErrors) {
      window.addEventListener('error', handleGlobalError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    // Cleanup
    return () => {
      if (captureKeystrokes) {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      }

      if (captureMouseEvents) {
        document.removeEventListener('mousedown', handleMouseEvent as EventListener);
        document.removeEventListener('mouseup', handleMouseEvent as EventListener);
        document.removeEventListener('click', handleMouseEvent as EventListener);
        document.removeEventListener('dblclick', handleMouseEvent as EventListener);
        document.removeEventListener('wheel', handleMouseEvent as EventListener);
      }

      if (captureErrors) {
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, [
    enabled,
    captureKeystrokes,
    captureMouseEvents,
    captureErrors,
    handleKeyDown,
    handleKeyUp,
    handleMouseEvent,
    handleGlobalError,
    handleUnhandledRejection
  ]);

  // Hook API
  return {
    startPerformanceMark,
    endPerformanceMark,
    captureError,
    sendDebugEvent
  };
};