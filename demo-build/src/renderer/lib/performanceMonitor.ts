/**
 * Enhanced Performance Monitoring System
 *
 * Features:
 * - FPS monitoring with threshold alerts
 * - Memory usage tracking
 * - Bundle size monitoring
 * - Component render time tracking
 * - Network request monitoring
 * - Long task detection (>50ms)
 * - Performance marks and measures
 * - Performance reports and analytics
 * - Integration with Web Vitals
 */

import loggingService from '../services/loggingService';

/**
 * FPS monitoring state
 */
interface FPSMonitor {
  frameCount: number;
  lastTime: number;
  fps: number;
  running: boolean;
  threshold: number; // FPS threshold for alerts
}

/**
 * Memory snapshot
 */
interface MemorySnapshot {
  timestamp: Date;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Network request metrics
 */
interface NetworkMetrics {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  timestamp: Date;
}

/**
 * Component render metrics
 */
interface RenderMetrics {
  componentName: string;
  renderTime: number;
  timestamp: Date;
}

/**
 * Long task entry
 */
interface LongTaskEntry {
  name: string;
  duration: number;
  startTime: number;
  timestamp: Date;
}

/**
 * Performance report
 */
export interface PerformanceReport {
  timestamp: Date;
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  memory: {
    current: MemorySnapshot;
    peak: MemorySnapshot;
    average: number;
  };
  network: {
    totalRequests: number;
    averageDuration: number;
    totalSize: number;
  };
  renders: {
    totalRenders: number;
    averageRenderTime: number;
    slowest: RenderMetrics[];
  };
  longTasks: {
    count: number;
    tasks: LongTaskEntry[];
  };
}

/**
 * Enhanced Performance Monitor
 */
class EnhancedPerformanceMonitor {
  private fpsMonitor: FPSMonitor;
  private memorySnapshots: MemorySnapshot[] = [];
  private networkMetrics: NetworkMetrics[] = [];
  private renderMetrics: RenderMetrics[] = [];
  private longTasks: LongTaskEntry[] = [];
  private longTaskObserver: PerformanceObserver | null = null;
  private maxHistorySize = 1000;

  constructor() {
    this.fpsMonitor = {
      frameCount: 0,
      lastTime: performance.now(),
      fps: 60,
      running: false,
      threshold: 50, // Alert if FPS drops below 50
    };

    // Setup long task observer
    this.setupLongTaskObserver();
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring(threshold = 50): void {
    this.fpsMonitor.threshold = threshold;
    this.fpsMonitor.running = true;
    this.fpsMonitor.lastTime = performance.now();
    this.fpsMonitor.frameCount = 0;

    const measureFPS = () => {
      if (!this.fpsMonitor.running) return;

      this.fpsMonitor.frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - this.fpsMonitor.lastTime;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        this.fpsMonitor.fps = Math.round((this.fpsMonitor.frameCount * 1000) / elapsed);

        // Alert if FPS drops below threshold
        if (this.fpsMonitor.fps < this.fpsMonitor.threshold) {
          loggingService.warn(
            `Low FPS detected: ${this.fpsMonitor.fps} (threshold: ${this.fpsMonitor.threshold})`,
            'PerformanceMonitor'
          );
        }

        this.fpsMonitor.frameCount = 0;
        this.fpsMonitor.lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
    loggingService.info('FPS monitoring started', 'PerformanceMonitor', { threshold });
  }

  /**
   * Stop FPS monitoring
   */
  stopFPSMonitoring(): void {
    this.fpsMonitor.running = false;
    loggingService.info('FPS monitoring stopped', 'PerformanceMonitor');
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.fpsMonitor.fps;
  }

  /**
   * Capture memory snapshot
   */
  captureMemorySnapshot(): MemorySnapshot | null {
    if (!('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: new Date(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };

    this.memorySnapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.memorySnapshots.length > this.maxHistorySize) {
      this.memorySnapshots.shift();
    }

    return snapshot;
  }

  /**
   * Start automatic memory monitoring
   */
  startMemoryMonitoring(intervalMs = 5000): NodeJS.Timeout {
    loggingService.info('Memory monitoring started', 'PerformanceMonitor', { intervalMs });

    return setInterval(() => {
      const snapshot = this.captureMemorySnapshot();

      if (snapshot) {
        const usedMB = snapshot.usedJSHeapSize / 1048576;
        const limitMB = snapshot.jsHeapSizeLimit / 1048576;
        const usage = (usedMB / limitMB) * 100;

        // Alert if memory usage is high
        if (usage > 80) {
          loggingService.warn(
            `High memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB (${usage.toFixed(1)}%)`,
            'PerformanceMonitor'
          );
        }
      }
    }, intervalMs);
  }

  /**
   * Track network request
   */
  trackNetworkRequest(
    url: string,
    method: string,
    duration: number,
    size: number,
    status: number
  ): void {
    const metric: NetworkMetrics = {
      url,
      method,
      duration,
      size,
      status,
      timestamp: new Date(),
    };

    this.networkMetrics.push(metric);

    // Keep only recent metrics
    if (this.networkMetrics.length > this.maxHistorySize) {
      this.networkMetrics.shift();
    }

    // Log slow requests
    if (duration > 1000) {
      loggingService.warn(`Slow network request: ${method} ${url} (${duration.toFixed(2)}ms)`, 'PerformanceMonitor');
    }
  }

  /**
   * Track component render
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    const metric: RenderMetrics = {
      componentName,
      renderTime,
      timestamp: new Date(),
    };

    this.renderMetrics.push(metric);

    // Keep only recent metrics
    if (this.renderMetrics.length > this.maxHistorySize) {
      this.renderMetrics.shift();
    }

    // Log slow renders
    if (renderTime > 16) {
      loggingService.warn(
        `Slow component render: ${componentName} (${renderTime.toFixed(2)}ms)`,
        'PerformanceMonitor'
      );
    }
  }

  /**
   * Setup long task observer
   */
  private setupLongTaskObserver(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const task: LongTaskEntry = {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: new Date(),
          };

          this.longTasks.push(task);

          // Keep only recent tasks
          if (this.longTasks.length > this.maxHistorySize) {
            this.longTasks.shift();
          }

          // Log long tasks
          loggingService.warn(
            `Long task detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`,
            'PerformanceMonitor'
          );
        }
      });

      this.longTaskObserver.observe({ entryTypes: ['longtask'] });
      loggingService.info('Long task observer initialized', 'PerformanceMonitor');
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    // FPS stats
    const fpsHistory = this.fpsMonitor.running
      ? [this.fpsMonitor.fps]
      : [];

    // Memory stats
    const memoryStats = this.memorySnapshots.length > 0
      ? {
          current: this.memorySnapshots[this.memorySnapshots.length - 1],
          peak: this.memorySnapshots.reduce((max, s) => s.usedJSHeapSize > max.usedJSHeapSize ? s : max),
          average: this.memorySnapshots.reduce((sum, s) => sum + s.usedJSHeapSize, 0) / this.memorySnapshots.length,
        }
      : {
          current: { timestamp: new Date(), usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 },
          peak: { timestamp: new Date(), usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 },
          average: 0,
        };

    // Network stats
    const networkStats = {
      totalRequests: this.networkMetrics.length,
      averageDuration:
        this.networkMetrics.length > 0
          ? this.networkMetrics.reduce((sum, m) => sum + m.duration, 0) / this.networkMetrics.length
          : 0,
      totalSize: this.networkMetrics.reduce((sum, m) => sum + m.size, 0),
    };

    // Render stats
    const sortedRenders = [...this.renderMetrics].sort((a, b) => b.renderTime - a.renderTime);
    const renderStats = {
      totalRenders: this.renderMetrics.length,
      averageRenderTime:
        this.renderMetrics.length > 0
          ? this.renderMetrics.reduce((sum, m) => sum + m.renderTime, 0) / this.renderMetrics.length
          : 0,
      slowest: sortedRenders.slice(0, 10),
    };

    // Long tasks
    const longTaskStats = {
      count: this.longTasks.length,
      tasks: [...this.longTasks].slice(-10),
    };

    return {
      timestamp: new Date(),
      fps: {
        current: this.fpsMonitor.fps,
        average: fpsHistory.length > 0 ? fpsHistory.reduce((sum, f) => sum + f, 0) / fpsHistory.length : 60,
        min: fpsHistory.length > 0 ? Math.min(...fpsHistory) : 60,
        max: fpsHistory.length > 0 ? Math.max(...fpsHistory) : 60,
      },
      memory: memoryStats,
      network: networkStats,
      renders: renderStats,
      longTasks: longTaskStats,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.memorySnapshots = [];
    this.networkMetrics = [];
    this.renderMetrics = [];
    this.longTasks = [];
    loggingService.info('Performance metrics cleared', 'PerformanceMonitor');
  }

  /**
   * Shutdown the monitor
   */
  shutdown(): void {
    this.stopFPSMonitoring();

    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
      this.longTaskObserver = null;
    }

    this.clearMetrics();
    loggingService.info('Performance monitor shut down', 'PerformanceMonitor');
  }
}

/**
 * Global performance monitor instance
 */
export const enhancedPerformanceMonitor = new EnhancedPerformanceMonitor();

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

    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
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


