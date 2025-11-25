import { useEffect, useCallback, useRef } from 'react';

import { PerformanceMetrics } from '../../types/debug';

interface PerformanceMonitoringOptions {
  enabled?: boolean;
  componentName?: string;
  trackRenderTime?: boolean;
  trackInteractions?: boolean;
  trackMemory?: boolean;
  slowOperationThreshold?: number;
}

export const usePerformanceMonitoringLogic = (options: PerformanceMonitoringOptions = {}) => {
  const {
    enabled = process.env.DEBUG === 'true',
    componentName = 'UnknownComponent',
    trackRenderTime = true,
    trackInteractions = true,
    trackMemory = false,
    slowOperationThreshold = 100
  } = options;

  const renderStartTime = useRef<number | undefined>(undefined);
  const operationTimers = useRef<Map<string, number>>(new Map());

  // Send performance metrics to main process
  const sendPerformanceMetric = useCallback((metrics: PerformanceMetrics) => {
    if (!enabled) return;

    if (window.electronAPI) {
      // For now, log to console in development, will integrate with debug service later
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PERFORMANCE] ${componentName}:`, metrics);
      }
    }
  }, [enabled, componentName]);

  // Track render time
  const startRenderTracking = useCallback(() => {
    if (!trackRenderTime) return;
    renderStartTime.current = performance.now();
  }, [trackRenderTime]);

  const endRenderTracking = useCallback(() => {
    if (!trackRenderTime || !renderStartTime.current) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderStartTime.current = undefined;

    const metrics: PerformanceMetrics = {
      cpuUsage: 0, // Would be collected from main process
      memoryUsage: trackMemory ? (performance as any).memory?.usedJSHeapSize || 0 : 0,
      renderTime,
      componentName,
      operation: 'render',
      timestamp: new Date().toISOString()
    };

    // Only log slow renders or if explicitly enabled
    if (renderTime > slowOperationThreshold || process.env.NODE_ENV === 'development') {
      sendPerformanceMetric(metrics);
    }
  }, [trackRenderTime, trackMemory, componentName, slowOperationThreshold, sendPerformanceMetric]);

  // Track operation timing
  const startOperation = useCallback((operationName: string) => {
    if (!trackInteractions) return;
    operationTimers.current.set(operationName, performance.now());
  }, [trackInteractions]);

  const endOperation = useCallback((operationName: string, additionalData?: Record<string, any>) => {
    if (!trackInteractions) return;

    const startTime = operationTimers.current.get(operationName);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    operationTimers.current.delete(operationName);

    const metrics: PerformanceMetrics = {
      cpuUsage: 0,
      memoryUsage: trackMemory ? (performance as any).memory?.usedJSHeapSize || 0 : 0,
      renderTime: duration,
      apiResponseTime: additionalData?.apiResponseTime,
      componentName,
      operation: operationName,
      timestamp: new Date().toISOString()
    };

    // Log slow operations or if in development
    if (duration > slowOperationThreshold || process.env.NODE_ENV === 'development') {
      sendPerformanceMetric(metrics);
    }
  }, [trackInteractions, trackMemory, componentName, slowOperationThreshold, sendPerformanceMetric]);

  // Track API calls
  const trackApiCall = useCallback(async <T>(
    operationName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      const metrics: PerformanceMetrics = {
        cpuUsage: 0,
        memoryUsage: trackMemory ? (performance as any).memory?.usedJSHeapSize || 0 : 0,
        renderTime: duration,
        apiResponseTime: duration,
        componentName,
        operation: operationName,
        timestamp: new Date().toISOString()
      };

      if (duration > slowOperationThreshold || process.env.NODE_ENV === 'development') {
        sendPerformanceMetric(metrics);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      const metrics: PerformanceMetrics = {
        cpuUsage: 0,
        memoryUsage: trackMemory ? (performance as any).memory?.usedJSHeapSize || 0 : 0,
        renderTime: duration,
        apiResponseTime: duration,
        componentName,
        operation: `${operationName}_error`,
        timestamp: new Date().toISOString()
      };

      sendPerformanceMetric(metrics);
      throw error;
    }
  }, [trackMemory, componentName, slowOperationThreshold, sendPerformanceMetric]);

  // Component lifecycle tracking
  useEffect(() => {
    if (!enabled || !trackRenderTime) return;

    startRenderTracking();

    // Use requestAnimationFrame to ensure DOM is updated
    const measureRender = () => {
      endRenderTracking();
    };

    const rafId = requestAnimationFrame(measureRender);

    return () => {
      cancelAnimationFrame(rafId);
      endRenderTracking();
    };
  }, [enabled, trackRenderTime, startRenderTracking, endRenderTracking]);

  // Memory usage tracking (if available)
  const getMemoryUsage = useCallback(() => {
    if (!trackMemory) return null;

    const memory = (performance as any).memory;
    if (!memory) return null;

    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };
  }, [trackMemory]);

  // Performance observer for additional metrics
  useEffect(() => {
    if (!enabled || !trackInteractions) return;

    let observer: PerformanceObserver | null = null;

    try {
      // Observe long tasks (tasks > 50ms)
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > slowOperationThreshold) {
            const metrics: PerformanceMetrics = {
              cpuUsage: 0,
              memoryUsage: getMemoryUsage()?.used || 0,
              renderTime: entry.duration,
              componentName,
              operation: 'long_task',
              timestamp: new Date().toISOString()
            };

            sendPerformanceMetric(metrics);
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // PerformanceObserver may not be supported in all browsers
      console.warn('Performance monitoring not fully supported:', error);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [enabled, trackInteractions, slowOperationThreshold, componentName, getMemoryUsage, sendPerformanceMetric]);

  // Hook API
  return {
    startOperation,
    endOperation,
    trackApiCall,
    getMemoryUsage,
    startRenderTracking,
    endRenderTracking
  };
};