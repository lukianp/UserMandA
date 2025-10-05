/**
 * Enhanced Performance Monitoring Service
 *
 * Enterprise-grade performance monitoring with:
 * - Historical data tracking and analysis
 * - Configurable alerts and thresholds
 * - Performance degradation detection
 * - Export capabilities (JSON, CSV)
 * - Performance baselines and comparisons
 * - Automated performance regression detection
 */

import { enhancedPerformanceMonitor, PerformanceReport } from '../lib/performanceMonitor';
import loggingService from './loggingService';

export interface PerformanceThresholds {
  fps: {
    min: number; // Alert if FPS drops below this
    critical: number; // Critical alert threshold
  };
  memory: {
    warningMB: number; // Warning threshold in MB
    criticalMB: number; // Critical threshold in MB
    warningPercent: number; // Warning at % of heap limit
  };
  renderTime: {
    warningMs: number; // Warn if render takes longer than this
    criticalMs: number; // Critical if render takes longer than this
  };
  networkRequest: {
    warningMs: number; // Warn if request takes longer than this
    criticalMs: number; // Critical if request takes longer than this
  };
  longTask: {
    maxPerMinute: number; // Max long tasks per minute before alert
  };
}

export interface PerformanceAlert {
  id: string;
  severity: 'warning' | 'critical';
  category: 'fps' | 'memory' | 'render' | 'network' | 'long-task';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface PerformanceBaseline {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  report: PerformanceReport;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  fps: number;
  memoryUsageMB: number;
  memoryUsagePercent: number;
  activeRenders: number;
  networkRequests: number;
  longTasks: number;
}

export interface PerformanceComparison {
  baseline: PerformanceBaseline;
  current: PerformanceReport;
  changes: {
    fps: { delta: number; percentChange: number };
    memory: { deltaMB: number; percentChange: number };
    renderTime: { delta: number; percentChange: number };
    networkTime: { delta: number; percentChange: number };
  };
  regressions: string[];
  improvements: string[];
}

/**
 * Default performance thresholds
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fps: {
    min: 50,
    critical: 30,
  },
  memory: {
    warningMB: 800,
    criticalMB: 1000,
    warningPercent: 80,
  },
  renderTime: {
    warningMs: 16, // 60 FPS = 16.67ms per frame
    criticalMs: 50,
  },
  networkRequest: {
    warningMs: 1000,
    criticalMs: 3000,
  },
  longTask: {
    maxPerMinute: 5,
  },
};

/**
 * Enhanced Performance Monitoring Service
 */
export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;
  private alerts: PerformanceAlert[] = [];
  private baselines: PerformanceBaseline[] = [];
  private historicalData: HistoricalDataPoint[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private memoryInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private maxHistorySize = 10000; // Keep last 10k data points
  private maxAlerts = 1000;

  private constructor() {
    // Initialize performance monitoring service
    loggingService.debug('PerformanceMonitoringService instance created', 'PerformanceMonitoringService');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Start comprehensive performance monitoring
   */
  start(dataCollectionIntervalMs = 10000): void {
    if (this.isMonitoring) {
      loggingService.warn('Performance monitoring already running', 'PerformanceMonitoringService');
      return;
    }

    this.isMonitoring = true;

    // Start FPS monitoring
    enhancedPerformanceMonitor.startFPSMonitoring(this.thresholds.fps.min);

    // Start memory monitoring
    this.memoryInterval = enhancedPerformanceMonitor.startMemoryMonitoring(5000);

    // Start periodic data collection and analysis
    this.monitoringInterval = setInterval(() => {
      this.collectHistoricalData();
      this.analyzePerformance();
    }, dataCollectionIntervalMs);

    loggingService.info('Performance monitoring started', 'PerformanceMonitoringService', {
      dataCollectionIntervalMs,
    });
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    enhancedPerformanceMonitor.stopFPSMonitoring();

    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = undefined;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    loggingService.info('Performance monitoring stopped', 'PerformanceMonitoringService');
  }

  /**
   * Collect historical data point
   */
  private collectHistoricalData(): void {
    const report = enhancedPerformanceMonitor.generateReport();
    const memorySnapshot = report.memory.current;

    const dataPoint: HistoricalDataPoint = {
      timestamp: new Date(),
      fps: report.fps.current,
      memoryUsageMB: memorySnapshot.usedJSHeapSize / 1048576,
      memoryUsagePercent:
        (memorySnapshot.usedJSHeapSize / memorySnapshot.jsHeapSizeLimit) * 100,
      activeRenders: report.renders.totalRenders,
      networkRequests: report.network.totalRequests,
      longTasks: report.longTasks.count,
    };

    this.historicalData.push(dataPoint);

    // Trim history if needed
    if (this.historicalData.length > this.maxHistorySize) {
      this.historicalData.shift();
    }
  }

  /**
   * Analyze current performance against thresholds
   */
  private analyzePerformance(): void {
    const report = enhancedPerformanceMonitor.generateReport();

    // Check FPS
    if (report.fps.current < this.thresholds.fps.critical) {
      this.createAlert('critical', 'fps', 'Critical FPS drop detected', report.fps.current, this.thresholds.fps.critical);
    } else if (report.fps.current < this.thresholds.fps.min) {
      this.createAlert('warning', 'fps', 'Low FPS detected', report.fps.current, this.thresholds.fps.min);
    }

    // Check Memory
    const memoryMB = report.memory.current.usedJSHeapSize / 1048576;
    const memoryPercent =
      (report.memory.current.usedJSHeapSize / report.memory.current.jsHeapSizeLimit) * 100;

    if (
      memoryMB > this.thresholds.memory.criticalMB ||
      memoryPercent > this.thresholds.memory.warningPercent
    ) {
      this.createAlert('critical', 'memory', `Critical memory usage: ${memoryMB.toFixed(2)}MB`, memoryMB, this.thresholds.memory.criticalMB);
    } else if (memoryMB > this.thresholds.memory.warningMB) {
      this.createAlert('warning', 'memory', `High memory usage: ${memoryMB.toFixed(2)}MB`, memoryMB, this.thresholds.memory.warningMB);
    }

    // Check Render Times
    if (report.renders.averageRenderTime > this.thresholds.renderTime.criticalMs) {
      this.createAlert('critical', 'render', 'Critical render time detected', report.renders.averageRenderTime, this.thresholds.renderTime.criticalMs);
    } else if (report.renders.averageRenderTime > this.thresholds.renderTime.warningMs) {
      this.createAlert('warning', 'render', 'Slow render times detected', report.renders.averageRenderTime, this.thresholds.renderTime.warningMs);
    }

    // Check Network Requests
    if (report.network.averageDuration > this.thresholds.networkRequest.criticalMs) {
      this.createAlert('critical', 'network', 'Critical network latency detected', report.network.averageDuration, this.thresholds.networkRequest.criticalMs);
    } else if (report.network.averageDuration > this.thresholds.networkRequest.warningMs) {
      this.createAlert('warning', 'network', 'Slow network requests detected', report.network.averageDuration, this.thresholds.networkRequest.warningMs);
    }

    // Check Long Tasks
    const recentLongTasks = this.getRecentLongTasks(60000); // Last minute
    if (recentLongTasks > this.thresholds.longTask.maxPerMinute) {
      this.createAlert('warning', 'long-task', `Too many long tasks: ${recentLongTasks} in last minute`, recentLongTasks, this.thresholds.longTask.maxPerMinute);
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    severity: 'warning' | 'critical',
    category: PerformanceAlert['category'],
    message: string,
    value: number,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      category,
      message,
      value,
      threshold,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.push(alert);

    // Trim alerts if needed
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.shift();
    }

    // Log alert
    if (severity === 'critical') {
      loggingService.error(message, 'PerformanceMonitoringService', { value, threshold });
    } else {
      loggingService.warn(message, 'PerformanceMonitoringService', { value, threshold });
    }
  }

  /**
   * Get recent long tasks count
   */
  private getRecentLongTasks(windowMs: number): number {
    const cutoff = Date.now() - windowMs;
    return this.historicalData.filter((d) => d.timestamp.getTime() > cutoff && d.longTasks > 0).length;
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds,
    };

    loggingService.info('Performance thresholds updated', 'PerformanceMonitoringService', thresholds);
  }

  /**
   * Get current thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Get all alerts
   */
  getAlerts(unacknowledgedOnly = false): PerformanceAlert[] {
    if (unacknowledgedOnly) {
      return this.alerts.filter((a) => !a.acknowledged);
    }
    return [...this.alerts];
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Create performance baseline
   */
  createBaseline(name: string, description?: string): PerformanceBaseline {
    const report = enhancedPerformanceMonitor.generateReport();

    const baseline: PerformanceBaseline = {
      id: `baseline-${Date.now()}`,
      name,
      description,
      timestamp: new Date(),
      report,
    };

    this.baselines.push(baseline);

    loggingService.info(`Performance baseline created: ${name}`, 'PerformanceMonitoringService');

    return baseline;
  }

  /**
   * Get all baselines
   */
  getBaselines(): PerformanceBaseline[] {
    return [...this.baselines];
  }

  /**
   * Delete baseline
   */
  deleteBaseline(baselineId: string): void {
    const index = this.baselines.findIndex((b) => b.id === baselineId);
    if (index !== -1) {
      this.baselines.splice(index, 1);
      loggingService.info(`Baseline deleted: ${baselineId}`, 'PerformanceMonitoringService');
    }
  }

  /**
   * Compare current performance to baseline
   */
  compareToBaseline(baselineId: string): PerformanceComparison | null {
    const baseline = this.baselines.find((b) => b.id === baselineId);
    if (!baseline) {
      return null;
    }

    const current = enhancedPerformanceMonitor.generateReport();

    const fpsDelta = current.fps.average - baseline.report.fps.average;
    const fpsPercent = (fpsDelta / baseline.report.fps.average) * 100;

    const baselineMemMB = baseline.report.memory.average / 1048576;
    const currentMemMB = current.memory.average / 1048576;
    const memDelta = currentMemMB - baselineMemMB;
    const memPercent = (memDelta / baselineMemMB) * 100;

    const renderDelta = current.renders.averageRenderTime - baseline.report.renders.averageRenderTime;
    const renderPercent = (renderDelta / baseline.report.renders.averageRenderTime) * 100;

    const networkDelta = current.network.averageDuration - baseline.report.network.averageDuration;
    const networkPercent = (networkDelta / baseline.report.network.averageDuration) * 100;

    const regressions: string[] = [];
    const improvements: string[] = [];

    if (fpsPercent < -10) regressions.push(`FPS decreased by ${Math.abs(fpsPercent).toFixed(1)}%`);
    else if (fpsPercent > 10) improvements.push(`FPS improved by ${fpsPercent.toFixed(1)}%`);

    if (memPercent > 20) regressions.push(`Memory usage increased by ${memPercent.toFixed(1)}%`);
    else if (memPercent < -20) improvements.push(`Memory usage decreased by ${Math.abs(memPercent).toFixed(1)}%`);

    if (renderPercent > 20) regressions.push(`Render time increased by ${renderPercent.toFixed(1)}%`);
    else if (renderPercent < -20) improvements.push(`Render time decreased by ${Math.abs(renderPercent).toFixed(1)}%`);

    if (networkPercent > 20) regressions.push(`Network latency increased by ${networkPercent.toFixed(1)}%`);
    else if (networkPercent < -20) improvements.push(`Network latency decreased by ${Math.abs(networkPercent).toFixed(1)}%`);

    return {
      baseline,
      current,
      changes: {
        fps: { delta: fpsDelta, percentChange: fpsPercent },
        memory: { deltaMB: memDelta, percentChange: memPercent },
        renderTime: { delta: renderDelta, percentChange: renderPercent },
        networkTime: { delta: networkDelta, percentChange: networkPercent },
      },
      regressions,
      improvements,
    };
  }

  /**
   * Get historical data
   */
  getHistoricalData(fromDate?: Date, toDate?: Date): HistoricalDataPoint[] {
    let data = [...this.historicalData];

    if (fromDate) {
      data = data.filter((d) => d.timestamp >= fromDate);
    }

    if (toDate) {
      data = data.filter((d) => d.timestamp <= toDate);
    }

    return data;
  }

  /**
   * Get current performance report
   */
  getCurrentReport(): PerformanceReport {
    return enhancedPerformanceMonitor.generateReport();
  }

  /**
   * Export performance data as JSON
   */
  exportAsJSON(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds,
      alerts: this.alerts,
      baselines: this.baselines,
      historicalData: this.historicalData,
      currentReport: this.getCurrentReport(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export performance data as CSV
   */
  exportAsCSV(): string {
    const headers = [
      'Timestamp',
      'FPS',
      'Memory (MB)',
      'Memory (%)',
      'Active Renders',
      'Network Requests',
      'Long Tasks',
    ];

    const rows = this.historicalData.map((d) => [
      d.timestamp.toISOString(),
      d.fps.toString(),
      d.memoryUsageMB.toFixed(2),
      d.memoryUsagePercent.toFixed(2),
      d.activeRenders.toString(),
      d.networkRequests.toString(),
      d.longTasks.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return csv;
  }

  /**
   * Download performance data
   */
  downloadReport(format: 'json' | 'csv', filename?: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `performance-report-${timestamp}.${format}`;
    const finalFilename = filename || defaultFilename;

    let content: string;
    let mimeType: string;

    if (format === 'json') {
      content = this.exportAsJSON();
      mimeType = 'application/json';
    } else {
      content = this.exportAsCSV();
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    loggingService.info(`Performance report downloaded: ${finalFilename}`, 'PerformanceMonitoringService');
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    this.alerts = [];
    this.baselines = [];
    this.historicalData = [];
    enhancedPerformanceMonitor.clearMetrics();

    loggingService.info('All performance data cleared', 'PerformanceMonitoringService');
  }

  /**
   * Get monitoring status
   */
  isActive(): boolean {
    return this.isMonitoring;
  }
}

/**
 * Export singleton instance
 */
export const performanceMonitoringService = PerformanceMonitoringService.getInstance();
