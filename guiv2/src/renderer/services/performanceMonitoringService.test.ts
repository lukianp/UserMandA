/**
 * PerformanceMonitoringService Tests
 */

import { enhancedPerformanceMonitor } from '../lib/performanceMonitor';

import { PerformanceMonitoringService } from './performanceMonitoringService';

// Mock the enhanced performance monitor
jest.mock('../lib/performanceMonitor', () => ({
  enhancedPerformanceMonitor: {
    startFPSMonitoring: jest.fn(),
    stopFPSMonitoring: jest.fn(),
    startMemoryMonitoring: jest.fn(() => 123 as any),
    generateReport: jest.fn(() => ({
      timestamp: new Date(),
      fps: { current: 20, average: 20, min: 20, max: 20 }, // Critical FPS (< 30)
      memory: {
        current: {
          timestamp: new Date(),
          usedJSHeapSize: 50 * 1048576, // 50 MB
          totalJSHeapSize: 100 * 1048576,
          jsHeapSizeLimit: 1000 * 1048576,
        },
        peak: {
          timestamp: new Date(),
          usedJSHeapSize: 60 * 1048576,
          totalJSHeapSize: 100 * 1048576,
          jsHeapSizeLimit: 1000 * 1048576,
        },
        average: 55 * 1048576,
      },
      network: {
        totalRequests: 10,
        averageDuration: 200,
        totalSize: 1048576,
      },
      renders: {
        totalRenders: 100,
        averageRenderTime: 10,
        slowest: [],
      },
      longTasks: {
        count: 2,
        tasks: [],
      },
    })),
    clearMetrics: jest.fn(),
  },
}));

// Mock logging service
jest.mock('./loggingService', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = PerformanceMonitoringService.getInstance();
    service.clearAllData();
  });

  afterEach(() => {
    service.stop();
    jest.useRealTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PerformanceMonitoringService.getInstance();
      const instance2 = PerformanceMonitoringService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Start/Stop Monitoring', () => {
    it('should start monitoring', () => {
      service.start(1000);

      expect(enhancedPerformanceMonitor.startFPSMonitoring).toHaveBeenCalled();
      expect(enhancedPerformanceMonitor.startMemoryMonitoring).toHaveBeenCalledWith(5000);
      expect(service.isActive()).toBe(true);
    });

    it('should not start monitoring twice', () => {
      service.start(1000);
      service.start(1000);

      // Should only be called once
      expect(enhancedPerformanceMonitor.startFPSMonitoring).toHaveBeenCalledTimes(1);
    });

    it('should stop monitoring', () => {
      service.start(1000);
      service.stop();

      expect(enhancedPerformanceMonitor.stopFPSMonitoring).toHaveBeenCalled();
      expect(service.isActive()).toBe(false);
    });
  });

  describe('Thresholds', () => {
    it('should have default thresholds', () => {
      const thresholds = service.getThresholds();

      expect(thresholds.fps.min).toBe(50);
      expect(thresholds.fps.critical).toBe(30);
      expect(thresholds.memory.warningMB).toBe(800);
    });

    it('should allow custom thresholds', () => {
      service.setThresholds({
        fps: { min: 40, critical: 20 },
      });

      const thresholds = service.getThresholds();
      expect(thresholds.fps.min).toBe(40);
      expect(thresholds.fps.critical).toBe(20);
    });
  });

  describe('Alerts', () => {
    beforeEach(() => {
      // Reset thresholds to default before each test
      service.setThresholds({
        fps: { min: 50, critical: 30 },
        memory: { warningMB: 800, criticalMB: 1000, warningPercent: 80 },
        renderTime: { warningMs: 16, criticalMs: 50 },
        networkRequest: { warningMs: 1000, criticalMs: 3000 },
        longTask: { maxPerMinute: 5 },
      });

      // Mock low FPS
      (enhancedPerformanceMonitor.generateReport as jest.Mock).mockReturnValue({
        timestamp: new Date(),
        fps: { current: 25, average: 25, min: 25, max: 25 }, // Below critical threshold
        memory: {
          current: {
            timestamp: new Date(),
            usedJSHeapSize: 50 * 1048576,
            totalJSHeapSize: 100 * 1048576,
            jsHeapSizeLimit: 1000 * 1048576,
          },
          peak: {
            timestamp: new Date(),
            usedJSHeapSize: 60 * 1048576,
            totalJSHeapSize: 100 * 1048576,
            jsHeapSizeLimit: 1000 * 1048576,
          },
          average: 55 * 1048576,
        },
        network: { totalRequests: 10, averageDuration: 200, totalSize: 1048576 },
        renders: { totalRenders: 100, averageRenderTime: 10, slowest: [] },
        longTasks: { count: 2, tasks: [] },
      });
    });

    it('should create alerts for performance issues', () => {
      service.start(1000);

      // Fast-forward to trigger analysis
      jest.advanceTimersByTime(11000);

      const alerts = service.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const fpsAlert = alerts.find((a) => a.category === 'fps');
      expect(fpsAlert).toBeDefined();
      expect(fpsAlert?.severity).toBe('critical');
    });

    it('should filter unacknowledged alerts', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      const allAlerts = service.getAlerts();
      expect(allAlerts.length).toBeGreaterThan(0);

      // Acknowledge first alert
      service.acknowledgeAlert(allAlerts[0].id);

      const unacknowledged = service.getAlerts(true);
      expect(unacknowledged.length).toBe(allAlerts.length - 1);
    });

    it('should clear alerts', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      expect(service.getAlerts().length).toBeGreaterThan(0);

      service.clearAlerts();
      expect(service.getAlerts().length).toBe(0);
    });
  });

  describe('Baselines', () => {
    it('should create baseline', () => {
      const baseline = service.createBaseline('Test Baseline', 'Test description');

      expect(baseline.name).toBe('Test Baseline');
      expect(baseline.description).toBe('Test description');
      expect(baseline.report).toBeDefined();
    });

    it('should get all baselines', () => {
      service.createBaseline('Baseline 1');
      service.createBaseline('Baseline 2');

      const baselines = service.getBaselines();
      expect(baselines.length).toBe(2);
    });

    it('should delete baseline', () => {
      const baseline = service.createBaseline('Test');
      service.deleteBaseline(baseline.id);

      const baselines = service.getBaselines();
      expect(baselines.length).toBe(0);
    });
  });

  describe('Baseline Comparison', () => {
    it('should compare to baseline', () => {
      const baseline = service.createBaseline('Initial');

      // Mock improved performance
      (enhancedPerformanceMonitor.generateReport as jest.Mock).mockReturnValue({
        timestamp: new Date(),
        fps: { current: 60, average: 60, min: 60, max: 60 },
        memory: {
          current: {
            timestamp: new Date(),
            usedJSHeapSize: 40 * 1048576, // Reduced memory
            totalJSHeapSize: 100 * 1048576,
            jsHeapSizeLimit: 1000 * 1048576,
          },
          peak: {
            timestamp: new Date(),
            usedJSHeapSize: 50 * 1048576,
            totalJSHeapSize: 100 * 1048576,
            jsHeapSizeLimit: 1000 * 1048576,
          },
          average: 45 * 1048576, // Reduced average
        },
        network: { totalRequests: 10, averageDuration: 150, totalSize: 1048576 }, // Faster
        renders: { totalRenders: 100, averageRenderTime: 8, slowest: [] }, // Faster
        longTasks: { count: 1, tasks: [] },
      });

      const comparison = service.compareToBaseline(baseline.id);

      expect(comparison).not.toBeNull();
      expect(comparison!.improvements.length).toBeGreaterThan(0);
    });

    it('should detect regressions', () => {
      const baseline = service.createBaseline('Initial');

      // Mock degraded performance
      (enhancedPerformanceMonitor.generateReport as jest.Mock).mockReturnValue({
        timestamp: new Date(),
        fps: { current: 40, average: 40, min: 40, max: 40 }, // Lower FPS
        memory: {
          current: {
            timestamp: new Date(),
            usedJSHeapSize: 100 * 1048576, // Higher memory
            totalJSHeapSize: 150 * 1048576,
            jsHeapSizeLimit: 1000 * 1048576,
          },
          peak: {
            timestamp: new Date(),
            usedJSHeapSize: 110 * 1048576,
            totalJSHeapSize: 150 * 1048576,
            jsHeapSizeLimit: 1000 * 1048576,
          },
          average: 105 * 1048576, // Higher average
        },
        network: { totalRequests: 10, averageDuration: 400, totalSize: 2097152 }, // Slower
        renders: { totalRenders: 100, averageRenderTime: 20, slowest: [] }, // Slower
        longTasks: { count: 5, tasks: [] },
      });

      const comparison = service.compareToBaseline(baseline.id);

      expect(comparison).not.toBeNull();
      expect(comparison!.regressions.length).toBeGreaterThan(0);
    });

    it('should return null for invalid baseline', () => {
      const comparison = service.compareToBaseline('nonexistent');
      expect(comparison).toBeNull();
    });
  });

  describe('Historical Data', () => {
    it('should collect historical data', () => {
      service.start(1000);

      // Fast-forward to collect data
      jest.advanceTimersByTime(11000);

      const data = service.getHistoricalData();
      expect(data.length).toBeGreaterThan(0);
    });

    it('should filter historical data by date range', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      const now = new Date();
      const tenSecondsAgo = new Date(now.getTime() - 10000);

      const filtered = service.getHistoricalData(tenSecondsAgo, now);
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('Export', () => {
    beforeEach(() => {
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement
      const mockLink = {
        click: jest.fn(),
        href: '',
        download: '',
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    it('should export as JSON', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      const json = service.exportAsJSON();
      const parsed = JSON.parse(json);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.thresholds).toBeDefined();
      expect(parsed.currentReport).toBeDefined();
    });

    it('should export as CSV', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      const csv = service.exportAsCSV();

      expect(csv).toContain('Timestamp');
      expect(csv).toContain('FPS');
      expect(csv).toContain('Memory (MB)');
    });

    it('should download JSON report', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      service.downloadReport('json', 'test-report.json');

      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should download CSV report', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      service.downloadReport('csv', 'test-report.csv');

      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('Clear Data', () => {
    it('should clear all data', () => {
      service.start(1000);
      jest.advanceTimersByTime(11000);

      service.createBaseline('Test');

      service.clearAllData();

      expect(service.getAlerts().length).toBe(0);
      expect(service.getBaselines().length).toBe(0);
      expect(service.getHistoricalData().length).toBe(0);
      expect(enhancedPerformanceMonitor.clearMetrics).toHaveBeenCalled();
    });
  });
});
