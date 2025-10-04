/**
 * Performance Monitoring Utilities
 *
 * Provides tools for measuring and reporting application performance metrics
 */

/**
 * Measure the execution time of a synchronous function
 */
export const measurePerformance = (metricName: string, fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);
  }

  return duration;
};

/**
 * Measure the execution time of an async function
 */
export const measureAsyncPerformance = async <T>(
  metricName: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
};

/**
 * Performance metric interface
 */
interface PerformanceMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
}

/**
 * Report Web Vitals metrics (CLS, FID, FCP, LCP, TTFB)
 * Dynamically imports web-vitals to avoid bloating the main bundle
 */
export const reportWebVitals = (onPerfEntry?: (metric: PerformanceMetric) => void): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import web-vitals to reduce initial bundle size
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    }).catch(err => {
      console.error('Failed to load web-vitals:', err);
    });
  }
};

/**
 * Performance observer for custom marks and measures
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();

  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
    if (typeof performance.mark === 'function') {
      performance.mark(name);
    }
  }

  /**
   * Measure the time between a mark and now
   */
  measure(name: string, startMark: string): number | null {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`[PerformanceTracker] Start mark "${startMark}" not found`);
      return null;
    }

    const duration = performance.now() - startTime;

    if (typeof performance.measure === 'function') {
      try {
        performance.measure(name, startMark);
      } catch (e) {
        // Ignore if mark doesn't exist in performance timeline
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Clear a specific mark
   */
  clearMark(name: string): void {
    this.marks.delete(name);
    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks(name);
    }
  }

  /**
   * Clear all marks
   */
  clearAllMarks(): void {
    this.marks.clear();
    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks();
    }
  }

  /**
   * Get all performance entries
   */
  getEntries(): PerformanceEntry[] {
    if (typeof performance.getEntries === 'function') {
      return performance.getEntries();
    }
    return [];
  }

  /**
   * Get performance entries by name
   */
  getEntriesByName(name: string): PerformanceEntry[] {
    if (typeof performance.getEntriesByName === 'function') {
      return performance.getEntriesByName(name);
    }
    return [];
  }
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new PerformanceTracker();

/**
 * Bundle size analyzer - logs chunk sizes in development
 */
export const logBundleInfo = (): void => {
  if (process.env.NODE_ENV !== 'production') {
    // Get all loaded scripts
    const scripts = Array.from(document.scripts);

    console.group('[Bundle Info]');
    scripts.forEach((script) => {
      if (script.src) {
        console.log(`Script: ${script.src}`);
      }
    });
    console.groupEnd();
  }
};

/**
 * Memory usage monitor (only works in development with Chrome DevTools)
 */
export const logMemoryUsage = (): void => {
  if (process.env.NODE_ENV !== 'production' && 'memory' in performance) {
    const memory = (performance as any).memory;

    console.group('[Memory Usage]');
    console.log(`Used JS Heap: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log(`Total JS Heap: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log(`Heap Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
    console.groupEnd();
  }
};
