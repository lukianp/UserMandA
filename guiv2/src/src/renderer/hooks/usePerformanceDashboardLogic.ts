import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * System resource metrics
 */
interface SystemResourceMetrics {
  cpu: {
    usage: number; // Percentage 0-100
    temperature?: number; // Celsius
    loadAverage?: number[];
  };
  memory: {
    used: number; // MB
    total: number; // MB
    usage: number; // Percentage 0-100
    swapUsed?: number;
    swapTotal?: number;
  };
  disk: {
    readSpeed: number; // MB/s
    writeSpeed: number; // MB/s
    usage: number; // Percentage 0-100
    freeSpace: number; // GB
    totalSpace: number; // GB
  };
  network: {
    uploadSpeed: number; // Mbps
    downloadSpeed: number; // Mbps
    latency: number; // ms
    packetsLost: number; // Percentage
  };
}

/**
 * Performance trend data point
 */
interface PerformanceDataPoint {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  responseTime?: number;
}

/**
 * Performance alert
 */
interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
}

/**
 * Benchmark result
 */
interface BenchmarkResult {
  id: string;
  name: string;
  category: 'cpu' | 'memory' | 'disk' | 'network' | 'application';
  score: number;
  baseline?: number;
  improvement?: number; // Percentage
  timestamp: string;
  details: Record<string, any>;
}

/**
 * Optimization suggestion
 */
interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: string;
  actionable: boolean;
  commands?: string[];
  configChanges?: Record<string, any>;
}

/**
 * Historical performance data
 */
interface HistoricalPerformanceData {
  date: string;
  averageCpuUsage: number;
  peakCpuUsage: number;
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  averageResponseTime: number;
  totalAlerts: number;
  uptime: number; // Percentage
}

/**
 * Complete performance dashboard data
 */
interface PerformanceDashboardData {
  currentMetrics: SystemResourceMetrics;
  trends: PerformanceDataPoint[];
  alerts: PerformanceAlert[];
  benchmarks: BenchmarkResult[];
  suggestions: OptimizationSuggestion[];
  historicalData: HistoricalPerformanceData[];
  systemHealth: {
    overall: 'healthy' | 'warning' | 'critical';
    uptime: number; // Hours
    lastRestart: string;
    issues: string[];
  };
}

/**
 * Real-time streaming configuration
 */
interface StreamingConfig {
  enabled: boolean;
  interval: number; // ms
  metrics: string[];
  bufferSize: number;
}

/**
 * Hook return type
 */
interface UsePerformanceDashboardLogicReturn {
  dashboardData: PerformanceDashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date;
  streaming: StreamingConfig;
  // Actions
  refreshDashboard: () => Promise<void>;
  toggleStreaming: () => void;
  updateStreamingConfig: (config: Partial<StreamingConfig>) => void;
  acknowledgeAlert: (alertId: string) => void;
  runBenchmark: (category: BenchmarkResult['category']) => Promise<BenchmarkResult>;
  applySuggestion: (suggestionId: string) => Promise<boolean>;
  exportData: (format: 'json' | 'csv' | 'pdf') => Promise<Blob>;
}

/**
 * Default performance thresholds
 */
const DEFAULT_THRESHOLDS = {
  cpuWarning: 70,
  cpuCritical: 90,
  memoryWarning: 80,
  memoryCritical: 95,
  diskWarning: 80,
  diskCritical: 95,
  networkLatencyWarning: 50,
};

/**
 * The main hook for Performance Dashboard logic
 */
export const usePerformanceDashboardLogic = (): UsePerformanceDashboardLogicReturn => {
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [streaming, setStreaming] = useState<StreamingConfig>({
    enabled: false,
    interval: 5000, // 5 seconds
    metrics: ['cpu', 'memory', 'disk', 'network'],
    bufferSize: 100,
  });

  const streamBuffer = useRef<PerformanceDataPoint[]>([]);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch complete dashboard data
   */
  const fetchDashboardData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch system resource metrics
      const systemMetrics = await getSystemResourceMetrics();

      // Generate performance trends
      const trends = generatePerformanceTrends(24);

      // Analyze alerts
      const alerts = analyzeAlerts(systemMetrics, DEFAULT_THRESHOLDS);

      // Generate optimization suggestions
      const suggestions = generateOptimizationSuggestions(systemMetrics, alerts, []);

      // Fetch historical data
      const historicalData = await getHistoricalPerformanceData(30);

      // Calculate system health
      const systemHealth: PerformanceDashboardData['systemHealth'] = {
        overall: alerts.some(a => a.type === 'critical') ? 'critical' :
                 alerts.some(a => a.type === 'warning') ? 'warning' : 'healthy',
        uptime: Math.floor(Math.random() * 30) + 1, // Mock uptime in days
        lastRestart: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Within last 24h
        issues: alerts.filter(a => !a.resolved).map(a => a.message),
      };

      const completeData: PerformanceDashboardData = {
        currentMetrics: systemMetrics,
        trends,
        alerts,
        benchmarks: [], // Will be populated when benchmarks are run
        suggestions,
        historicalData,
        systemHealth,
      };

      setDashboardData(completeData);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start streaming performance data
   */
  const startStreaming = useCallback(() => {
    if (streamingIntervalRef.current) return;

    streamingIntervalRef.current = setInterval(async () => {
      try {
        const metrics = await getSystemResourceMetrics();
        const dataPoint: PerformanceDataPoint = {
          timestamp: new Date().toISOString(),
          cpuUsage: metrics.cpu.usage,
          memoryUsage: metrics.memory.usage,
          diskUsage: metrics.disk.usage,
          networkLatency: metrics.network.latency,
          responseTime: Math.floor(Math.random() * 50) + 20,
        };

        streamBuffer.current.push(dataPoint);

        // Keep buffer size limited
        if (streamBuffer.current.length > streaming.bufferSize) {
          streamBuffer.current.shift();
        }

        // Update dashboard with latest metrics
        setDashboardData(prev => {
          if (!prev) return prev;

          const newTrends = [...prev.trends];
          newTrends.push(dataPoint);

          // Keep trends limited to 24 hours
          if (newTrends.length > 1440) { // 24 hours * 60 minutes
            newTrends.shift();
          }

          return {
            ...prev,
            currentMetrics: metrics,
            trends: newTrends,
          };
        });

        setLastUpdate(new Date());
      } catch (err) {
        console.warn('Streaming data fetch error:', err);
      }
    }, streaming.interval);
  }, [streaming.interval, streaming.bufferSize]);

  /**
   * Stop streaming performance data
   */
  const stopStreaming = useCallback(() => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
  }, []);

  /**
   * Toggle streaming on/off
   */
  const toggleStreaming = useCallback(() => {
    setStreaming(prev => {
      const newEnabled = !prev.enabled;

      if (newEnabled) {
        startStreaming();
      } else {
        stopStreaming();
      }

      return { ...prev, enabled: newEnabled };
    });
  }, [startStreaming, stopStreaming]);

  /**
   * Update streaming configuration
   */
  const updateStreamingConfig = useCallback((config: Partial<StreamingConfig>) => {
    setStreaming(prev => {
      const newConfig = { ...prev, ...config };

      // Restart streaming if interval changed and it's currently enabled
      if (config.interval && prev.enabled) {
        stopStreaming();
        setTimeout(() => startStreaming(), 100); // Small delay to allow state update
      }

      return newConfig;
    });
  }, [startStreaming, stopStreaming]);

  /**
   * Acknowledge an alert
   */
  const acknowledgeAlert = useCallback((alertId: string) => {
    setDashboardData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        alerts: prev.alerts.map(alert =>
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ),
      };
    });
  }, []);

  /**
   * Run a performance benchmark
   */
  const runBenchmark = useCallback(async (category: BenchmarkResult['category']): Promise<BenchmarkResult> => {
    try {
      const result = await runBenchmark(category);

      // Add to dashboard data
      setDashboardData(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          benchmarks: [...prev.benchmarks, result],
        };
      });

      return result;
    } catch (err) {
      throw new Error(`Benchmark failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  /**
   * Apply an optimization suggestion
   */
  const applySuggestion = useCallback(async (suggestionId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would execute system commands or API calls
      console.log(`Applying suggestion ${suggestionId}`);

      // Mock async operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update suggestion status
      setDashboardData(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          suggestions: prev.suggestions.map(suggestion =>
            suggestion.id === suggestionId ? { ...suggestion, actionable: false } : suggestion
          ),
        };
      });

      return true;
    } catch (err) {
      console.error('Failed to apply suggestion:', err);
      return false;
    }
  }, []);

  /**
   * Export dashboard data
   */
  const exportData = useCallback(async (format: 'json' | 'csv' | 'pdf'): Promise<Blob> => {
    if (!dashboardData) {
      throw new Error('No data available to export');
    }

    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(dashboardData, null, 2)], {
          type: 'application/json',
        });

      case 'csv':
        // Convert key metrics to CSV
        const csvData = [
          ['Metric', 'Value', 'Timestamp'],
          ['CPU Usage', `${dashboardData.currentMetrics.cpu.usage}%`, new Date().toISOString()],
          ['Memory Usage', `${dashboardData.currentMetrics.memory.usage}%`, new Date().toISOString()],
          ['Disk Usage', `${dashboardData.currentMetrics.disk.usage}%`, new Date().toISOString()],
          ['Network Latency', `${dashboardData.currentMetrics.network.latency}ms`, new Date().toISOString()],
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        return new Blob([csvContent], { type: 'text/csv' });

      case 'pdf':
        // Mock PDF export - in real implementation would use a PDF library
        throw new Error('PDF export not implemented yet');

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [dashboardData]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    dashboardData,
    isLoading,
    error,
    lastUpdate,
    streaming,
    refreshDashboard: fetchDashboardData,
    toggleStreaming,
    updateStreamingConfig,
    acknowledgeAlert,
    runBenchmark,
    applySuggestion,
    exportData,
  };
};
/**
 * Get system resource metrics from electron API
 */
async function getSystemResourceMetrics(): Promise<SystemResourceMetrics> {
  try {
    // For now, use mock data since system API doesn't exist yet
    // const result = await window.electronAPI.system.getResourceMetrics();
    // if (result.success && result.data) {
    //   return result.data;
    // }
    // throw new Error(result.error || 'Failed to fetch system metrics');
    return getMockSystemResourceMetrics();
  } catch (error) {
    console.warn('System metrics fetch failed, using mock data:', error);
    return getMockSystemResourceMetrics();
  }
}

/**
 * Get mock system resource metrics for development/testing
 */
function getMockSystemResourceMetrics(): SystemResourceMetrics {
  return {
    cpu: {
      usage: Math.floor(Math.random() * 40) + 20, // 20-60%
      temperature: Math.floor(Math.random() * 30) + 40, // 40-70°C
      loadAverage: [1.2 + Math.random() * 2, 1.0 + Math.random() * 1.5, 0.8 + Math.random()],
    },
    memory: {
      used: Math.floor(Math.random() * 4000) + 2000, // 2-6GB
      total: 8192, // 8GB
      usage: Math.floor(Math.random() * 40) + 30, // 30-70%
      swapUsed: Math.floor(Math.random() * 1000),
      swapTotal: 2048,
    },
    disk: {
      readSpeed: Math.floor(Math.random() * 50) + 20, // 20-70 MB/s
      writeSpeed: Math.floor(Math.random() * 40) + 15, // 15-55 MB/s
      usage: Math.floor(Math.random() * 30) + 40, // 40-70%
      freeSpace: Math.floor(Math.random() * 100) + 50, // 50-150 GB
      totalSpace: 256, // 256 GB
    },
    network: {
      uploadSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 Mbps
      downloadSpeed: Math.floor(Math.random() * 50) + 20, // 20-70 Mbps
      latency: Math.floor(Math.random() * 20) + 10, // 10-30 ms
      packetsLost: Math.floor(Math.random() * 2), // 0-2%
    },
  };
}

/**
 * Generate performance trend data
 */
function generatePerformanceTrends(hours: number = 24): PerformanceDataPoint[] {
  const trends: PerformanceDataPoint[] = [];

  for (let i = 0; i < hours; i++) {
    const time = new Date();
    time.setHours(time.getHours() - (hours - i));

    trends.push({
      timestamp: time.toISOString(),
      cpuUsage: Math.floor(Math.random() * 50) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      diskUsage: Math.floor(Math.random() * 30) + 40,
      networkLatency: Math.floor(Math.random() * 20) + 10,
      responseTime: Math.floor(Math.random() * 50) + 20,
    });
  }

  return trends;
}

/**
 * Analyze current metrics and generate alerts
 */
function analyzeAlerts(metrics: SystemResourceMetrics, thresholds: Record<string, number>): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];
  const timestamp = new Date().toISOString();

  // CPU alerts
  if (metrics.cpu.usage > thresholds.cpuWarning) {
    alerts.push({
      id: `cpu-${Date.now()}`,
      type: metrics.cpu.usage > thresholds.cpuCritical ? 'critical' : 'warning',
      metric: 'CPU Usage',
      message: `CPU usage is ${metrics.cpu.usage.toFixed(1)}%`,
      threshold: thresholds.cpuWarning,
      currentValue: metrics.cpu.usage,
      timestamp,
      resolved: false,
    });
  }

  // Memory alerts
  if (metrics.memory.usage > thresholds.memoryWarning) {
    alerts.push({
      id: `memory-${Date.now()}`,
      type: metrics.memory.usage > thresholds.memoryCritical ? 'critical' : 'warning',
      metric: 'Memory Usage',
      message: `Memory usage is ${metrics.memory.usage.toFixed(1)}%`,
      threshold: thresholds.memoryWarning,
      currentValue: metrics.memory.usage,
      timestamp,
      resolved: false,
    });
  }

  // Disk alerts
  if (metrics.disk.usage > thresholds.diskWarning) {
    alerts.push({
      id: `disk-${Date.now()}`,
      type: metrics.disk.usage > thresholds.diskCritical ? 'critical' : 'warning',
      metric: 'Disk Usage',
      message: `Disk usage is ${metrics.disk.usage.toFixed(1)}%`,
      threshold: thresholds.diskWarning,
      currentValue: metrics.disk.usage,
      timestamp,
      resolved: false,
    });
  }

  // Network alerts
  if (metrics.network.latency > thresholds.networkLatencyWarning) {
    alerts.push({
      id: `network-${Date.now()}`,
      type: 'warning',
      metric: 'Network Latency',
      message: `Network latency is ${metrics.network.latency}ms`,
      threshold: thresholds.networkLatencyWarning,
      currentValue: metrics.network.latency,
      timestamp,
      resolved: false,
    });
  }

  return alerts;
}

/**
 * Run performance benchmark
 */
async function runBenchmark(category: BenchmarkResult['category']): Promise<BenchmarkResult> {
  const benchmarks = {
    cpu: async () => {
      // Simulate CPU benchmark
      const startTime = Date.now();
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sin(i) * Math.cos(i);
      }
      const duration = Date.now() - startTime;
      return {
        score: Math.floor(1000000 / duration * 100),
        details: { duration, operations: 1000000 },
      };
    },
    memory: async () => {
      // Simulate memory benchmark
      const arrays: number[][] = [];
      const startTime = Date.now();
      try {
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(10000).fill(0).map(() => Math.random()));
        }
        const duration = Date.now() - startTime;
        return {
          score: Math.floor(100000 / duration * 100),
          details: { duration, arrays: 100, arraySize: 10000 },
        };
      } finally {
        // Clean up
        arrays.length = 0;
      }
    },
    disk: async () => {
      // Mock disk benchmark
      const duration = Math.floor(Math.random() * 1000) + 500;
      await new Promise(resolve => setTimeout(resolve, duration));
      return {
        score: Math.floor(1000 / duration * 100),
        details: { duration, operations: 1000 },
      };
    },
    network: async () => {
      // Mock network benchmark
      const duration = Math.floor(Math.random() * 500) + 200;
      await new Promise(resolve => setTimeout(resolve, duration));
      return {
        score: Math.floor(1000 / duration * 50),
        details: { duration, packets: 1000 },
      };
    },
    application: async () => {
      // Mock application benchmark (Logic Engine performance)
      const duration = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, duration));
      return {
        score: Math.floor(5000 / duration * 100),
        details: { duration, queries: 5000 },
      };
    },
  };

  const result = await benchmarks[category]();

  return {
    id: `${category}-${Date.now()}`,
    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Benchmark`,
    category,
    score: result.score,
    timestamp: new Date().toISOString(),
    details: result.details,
  };
}

/**
 * Generate optimization suggestions based on metrics and alerts
 */
function generateOptimizationSuggestions(
  metrics: SystemResourceMetrics,
  alerts: PerformanceAlert[],
  benchmarks: BenchmarkResult[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // CPU optimization suggestions
  if (metrics.cpu.usage > 70) {
    suggestions.push({
      id: 'cpu-optimization-1',
      title: 'Reduce CPU Usage',
      description: 'High CPU usage detected. Consider optimizing background processes or upgrading hardware.',
      impact: 'high',
      effort: 'medium',
      category: 'cpu',
      actionable: true,
      commands: ['taskmgr', 'Optimize CPU-intensive processes'],
    });
  }

  // Memory optimization suggestions
  if (metrics.memory.usage > 80) {
    suggestions.push({
      id: 'memory-optimization-1',
      title: 'Optimize Memory Usage',
      description: 'Memory usage is high. Consider closing unused applications or increasing RAM.',
      impact: 'high',
      effort: 'low',
      category: 'memory',
      actionable: true,
      commands: ['Close unused applications', 'Clear system cache'],
    });
  }

  // Disk optimization suggestions
  if (metrics.disk.usage > 85) {
    suggestions.push({
      id: 'disk-optimization-1',
      title: 'Free Up Disk Space',
      description: 'Disk usage is critically high. Clean up temporary files and remove unnecessary data.',
      impact: 'high',
      effort: 'medium',
      category: 'disk',
      actionable: true,
      commands: ['Clean temporary files', 'Run disk cleanup', 'Move data to external storage'],
    });
  }

  // Network optimization suggestions
  if (metrics.network.latency > 50) {
    suggestions.push({
      id: 'network-optimization-1',
      title: 'Improve Network Performance',
      description: 'Network latency is high. Check network configuration and connections.',
      impact: 'medium',
      effort: 'medium',
      category: 'network',
      actionable: true,
      commands: ['Check network settings', 'Restart network adapters', 'Update network drivers'],
    });
  }

  // Benchmark-based suggestions
  benchmarks.forEach(benchmark => {
    if (benchmark.score < 50) {
      suggestions.push({
        id: `benchmark-${benchmark.category}-${benchmark.id}`,
        title: `Improve ${benchmark.category} Performance`,
        description: `${benchmark.category} benchmark score is low. Consider hardware upgrades or optimizations.`,
        impact: 'high',
        effort: 'high',
        category: benchmark.category,
        actionable: false,
      });
    }
  });

  return suggestions;
}

/**
 * Get historical performance data from storage
 */
async function getHistoricalPerformanceData(days: number = 30): Promise<HistoricalPerformanceData[]> {
  try {
    // For now, use mock data since storage API doesn't exist yet
    // const result = await window.electronAPI.storage.getPerformanceHistory(days);
    // if (result.success && result.data) {
    //   return result.data;
    // }
    // throw new Error(result.error || 'Failed to fetch historical data');
    return generateMockHistoricalData(days);
  } catch (error) {
    console.warn('Historical data fetch failed, generating mock data:', error);
    return generateMockHistoricalData(days);
  }
}

/**
 * Generate mock historical performance data
 */
function generateMockHistoricalData(days: number): HistoricalPerformanceData[] {
  const data: HistoricalPerformanceData[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    data.push({
      date: date.toISOString().split('T')[0],
      averageCpuUsage: Math.floor(Math.random() * 30) + 20,
      peakCpuUsage: Math.floor(Math.random() * 40) + 40,
      averageMemoryUsage: Math.floor(Math.random() * 25) + 35,
      peakMemoryUsage: Math.floor(Math.random() * 30) + 50,
      averageResponseTime: Math.floor(Math.random() * 30) + 15,
      totalAlerts: Math.floor(Math.random() * 10),
      uptime: Math.floor(Math.random() * 20) + 80, // 80-100%
    });
  }

  return data;
}