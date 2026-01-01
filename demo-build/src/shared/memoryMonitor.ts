/**
 * Memory monitoring utility for development builds
 * Detects potential memory leaks and high memory usage
 *
 * @module memoryMonitor
 * @since 1.0.0
 */

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss?: number;
  timestamp: number;
}

/**
 * Memory monitoring configuration
 */
export interface MemoryMonitorConfig {
  /** Threshold in MB before warning (default: 50MB) */
  warningThresholdMB?: number;
  /** Threshold in MB before critical alert (default: 100MB) */
  criticalThresholdMB?: number;
  /** Enable automatic monitoring interval (default: false) */
  enableAutoMonitoring?: boolean;
  /** Monitoring interval in ms (default: 30000 = 30s) */
  monitoringIntervalMs?: number;
  /** Callback for memory warnings */
  onWarning?: (stats: MemoryStats) => void;
  /** Callback for critical alerts */
  onCritical?: (stats: MemoryStats) => void;
}

/**
 * Memory Monitor Singleton
 *
 * Monitors memory usage in development builds and alerts when thresholds are exceeded.
 * Only active in development mode to avoid performance impact in production.
 *
 * @example
 * ```typescript
 * // Initialize with custom config
 * const monitor = MemoryMonitor.getInstance({
 *   warningThresholdMB: 75,
 *   enableAutoMonitoring: true
 * });
 *
 * // Manual check
 * monitor.checkForLeaks();
 *
 * // Get current stats
 * const stats = monitor.getMemoryStats();
 * console.log(`Heap used: ${stats.heapUsed}MB`);
 * ```
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private warningThresholdBytes: number;
  private criticalThresholdBytes: number;
  private monitoringInterval?: NodeJS.Timeout;
  private lastWarningTime = 0;
  private warningCooldownMs = 60000; // 1 minute cooldown between warnings
  private config: MemoryMonitorConfig;
  private memoryHistory: MemoryStats[] = [];
  private maxHistoryLength = 100;

  private constructor(config: MemoryMonitorConfig = {}) {
    this.config = {
      warningThresholdMB: 50,
      criticalThresholdMB: 100,
      enableAutoMonitoring: false,
      monitoringIntervalMs: 30000,
      ...config,
    };

    this.warningThresholdBytes = (this.config.warningThresholdMB || 50) * 1024 * 1024;
    this.criticalThresholdBytes = (this.config.criticalThresholdMB || 100) * 1024 * 1024;

    if (this.config.enableAutoMonitoring && process.env.NODE_ENV === 'development') {
      this.startAutoMonitoring();
    }
  }

  /**
   * Get or create the MemoryMonitor singleton instance
   *
   * @param config - Optional configuration (only used on first call)
   * @returns The MemoryMonitor instance
   */
  static getInstance(config?: MemoryMonitorConfig): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor(config);
    }
    return MemoryMonitor.instance;
  }

  /**
   * Get current memory statistics
   *
   * @returns Memory usage statistics in MB
   */
  getMemoryStats(): MemoryStats {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      return {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        timestamp: Date.now(),
      };
    }

    // Browser environment fallback
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      return {
        heapUsed: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        heapTotal: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        external: 0,
        timestamp: Date.now(),
      };
    }

    // No memory info available
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Check for potential memory leaks
   *
   * Compares current memory usage against thresholds and triggers
   * callbacks if thresholds are exceeded.
   *
   * Only performs checks in development mode.
   */
  checkForLeaks(): void {
    if (process.env.NODE_ENV !== 'development') {
      return; // Only monitor in development
    }

    const stats = this.getMemoryStats();
    const heapUsedBytes = stats.heapUsed * 1024 * 1024;

    // Add to history
    this.memoryHistory.push(stats);
    if (this.memoryHistory.length > this.maxHistoryLength) {
      this.memoryHistory.shift();
    }

    const now = Date.now();
    const canWarn = now - this.lastWarningTime > this.warningCooldownMs;

    // Critical threshold check
    if (heapUsedBytes > this.criticalThresholdBytes) {
      if (canWarn) {
        console.error('[MemoryMonitor] CRITICAL: High memory usage detected!', {
          heapUsed: `${stats.heapUsed}MB`,
          heapTotal: `${stats.heapTotal}MB`,
          external: `${stats.external}MB`,
          rss: stats.rss ? `${stats.rss}MB` : 'N/A',
          threshold: `${this.config.criticalThresholdMB}MB`,
        });
        this.lastWarningTime = now;

        if (this.config.onCritical) {
          this.config.onCritical(stats);
        }
      }
      return;
    }

    // Warning threshold check
    if (heapUsedBytes > this.warningThresholdBytes) {
      if (canWarn) {
        console.warn('[MemoryMonitor] WARNING: Elevated memory usage detected', {
          heapUsed: `${stats.heapUsed}MB`,
          heapTotal: `${stats.heapTotal}MB`,
          external: `${stats.external}MB`,
          rss: stats.rss ? `${stats.rss}MB` : 'N/A',
          threshold: `${this.config.warningThresholdMB}MB`,
        });
        this.lastWarningTime = now;

        if (this.config.onWarning) {
          this.config.onWarning(stats);
        }
      }
    }
  }

  /**
   * Detect memory leak trends
   *
   * Analyzes memory history to detect continuously increasing memory usage
   * which may indicate a memory leak.
   *
   * @returns true if a potential leak is detected, false otherwise
   */
  detectLeakTrend(): boolean {
    if (this.memoryHistory.length < 10) {
      return false; // Not enough data
    }

    const recent = this.memoryHistory.slice(-10);
    let increasingCount = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].heapUsed > recent[i - 1].heapUsed) {
        increasingCount++;
      }
    }

    // If memory increased in 8 out of 10 samples, potential leak
    const isLeaking = increasingCount >= 8;

    if (isLeaking && process.env.NODE_ENV === 'development') {
      console.warn('[MemoryMonitor] Potential memory leak detected: Memory continuously increasing', {
        samples: recent.length,
        increasingTrend: `${increasingCount}/${recent.length}`,
        startHeap: `${recent[0].heapUsed}MB`,
        endHeap: `${recent[recent.length - 1].heapUsed}MB`,
        increase: `${recent[recent.length - 1].heapUsed - recent[0].heapUsed}MB`,
      });
    }

    return isLeaking;
  }

  /**
   * Start automatic memory monitoring
   *
   * Only works in development mode. Checks memory usage at regular intervals.
   */
  startAutoMonitoring(): void {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    console.log('[MemoryMonitor] Auto-monitoring enabled', {
      interval: `${this.config.monitoringIntervalMs}ms`,
      warningThreshold: `${this.config.warningThresholdMB}MB`,
      criticalThreshold: `${this.config.criticalThresholdMB}MB`,
    });

    this.monitoringInterval = setInterval(() => {
      this.checkForLeaks();
      this.detectLeakTrend();
    }, this.config.monitoringIntervalMs || 30000);
  }

  /**
   * Stop automatic memory monitoring
   */
  stopAutoMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('[MemoryMonitor] Auto-monitoring stopped');
    }
  }

  /**
   * Get memory usage history
   *
   * @returns Array of memory statistics snapshots
   */
  getHistory(): MemoryStats[] {
    return [...this.memoryHistory];
  }

  /**
   * Clear memory usage history
   */
  clearHistory(): void {
    this.memoryHistory = [];
  }

  /**
   * Force garbage collection (if available)
   *
   * Requires Node to be started with --expose-gc flag
   *
   * @returns true if GC was triggered, false if not available
   */
  forceGarbageCollection(): boolean {
    if (typeof global !== 'undefined' && (global as any).gc) {
      console.log('[MemoryMonitor] Forcing garbage collection...');
      (global as any).gc();
      return true;
    }
    console.warn('[MemoryMonitor] GC not available. Start Node with --expose-gc flag');
    return false;
  }

  /**
   * Get a memory usage report
   *
   * @returns Formatted string report of memory usage
   */
  getReport(): string {
    const stats = this.getMemoryStats();
    const history = this.getHistory();
    const hasHistory = history.length > 0;

    let report = '\n=== Memory Monitor Report ===\n';
    report += `Timestamp: ${new Date(stats.timestamp).toISOString()}\n`;
    report += `\nCurrent Usage:\n`;
    report += `  Heap Used:  ${stats.heapUsed}MB\n`;
    report += `  Heap Total: ${stats.heapTotal}MB\n`;
    report += `  External:   ${stats.external}MB\n`;
    if (stats.rss) {
      report += `  RSS:        ${stats.rss}MB\n`;
    }

    report += `\nThresholds:\n`;
    report += `  Warning:    ${this.config.warningThresholdMB}MB\n`;
    report += `  Critical:   ${this.config.criticalThresholdMB}MB\n`;

    if (hasHistory) {
      const oldest = history[0];
      const newest = history[history.length - 1];
      const increase = newest.heapUsed - oldest.heapUsed;

      report += `\nHistory (${history.length} samples):\n`;
      report += `  Initial:    ${oldest.heapUsed}MB\n`;
      report += `  Current:    ${newest.heapUsed}MB\n`;
      report += `  Change:     ${increase > 0 ? '+' : ''}${increase}MB\n`;
      report += `  Trend:      ${this.detectLeakTrend() ? 'INCREASING (potential leak)' : 'Normal'}\n`;
    }

    report += '===========================\n';

    return report;
  }
}

/**
 * Create and export a default instance for convenience
 */
export const memoryMonitor = MemoryMonitor.getInstance();


