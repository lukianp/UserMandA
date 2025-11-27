import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Health metric data model
 */
export interface HealthMetric {
  id: string;
  name: string;
  category: 'system' | 'application' | 'network' | 'security' | 'performance';
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  threshold: {
    warning: number;
    critical: number;
  };
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

/**
 * Health check data model
 */
export interface HealthCheck {
  id: string;
  name: string;
  type: 'liveness' | 'readiness' | 'startup' | 'custom';
  status: 'passing' | 'failing' | 'unknown';
  duration: number; // in milliseconds
  lastChecked: string;
  nextCheck?: string;
  errorMessage?: string;
  metadata: { [key: string]: any };
}

/**
 * System health dashboard data
 */
export interface HealthDashboard {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  uptime: number; // in seconds
  lastIncident?: string;
  metricsCount: number;
  checksCount: number;
  alertsCount: number;
  availability: number; // percentage
}

/**
 * Alert configuration
 */
export interface HealthAlert {
  id: string;
  metricId: string;
  condition: 'above' | 'below' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
  cooldownPeriod: number; // in minutes
  lastTriggered?: string;
}

/**
 * Health trend analysis
 */
export interface HealthTrend {
  metricId: string;
  period: string; // e.g., '1h', '24h', '7d'
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
  trend: 'improving' | 'degrading' | 'stable';
  dataPoints: Array<{ timestamp: string; value: number }>;
}

/**
 * Custom hook for health monitoring logic
 */
export const useHealthMonitoringLogic = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate metric status based on value and thresholds
   */
  const calculateMetricStatus = useCallback((value: number, threshold: HealthMetric['threshold']): HealthMetric['status'] => {
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'healthy';
  }, []);

  /**
   * Calculate trend based on recent values
   */
  const calculateTrend = useCallback((current: number, previous: number): 'up' | 'down' | 'stable' => {
    const change = (current - previous) / previous;
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }, []);

  /**
   * Create new health metric
   */
  const createMetric = useCallback(async (metricData: Omit<HealthMetric, 'id' | 'timestamp' | 'status' | 'trend'>) => {
    try {
      const newMetric: HealthMetric = {
        ...metricData,
        id: `metric-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: calculateMetricStatus(metricData.value, metricData.threshold),
        trend: 'stable', // New metrics start as stable
      };

      setMetrics(prev => [...prev, newMetric]);
      console.info('[HealthMonitoring] Created health metric:', newMetric.id);
      return newMetric;
    } catch (err: any) {
      console.error('[HealthMonitoring] Failed to create metric:', err);
      setError(`Failed to create metric: ${err.message}`);
      return null;
    }
  }, [calculateMetricStatus]);

  /**
   * Update existing health metric
   */
  const updateMetric = useCallback(async (id: string, updates: Partial<HealthMetric>) => {
    try {
      setMetrics(prev => prev.map(metric => {
        if (metric.id !== id) return metric;

        const updated = { ...metric, ...updates };
        if (updates.value !== undefined && updated.threshold) {
          updated.status = calculateMetricStatus(updated.value, updated.threshold);
        }

        return { ...updated, timestamp: new Date().toISOString() };
      }));

      console.info('[HealthMonitoring] Updated health metric:', id);
    } catch (err: any) {
      console.error('[HealthMonitoring] Failed to update metric:', err);
      setError(`Failed to update metric: ${err.message}`);
    }
  }, [calculateMetricStatus]);

  /**
   * Create health check
   */
  const createHealthCheck = useCallback(async (checkData: Omit<HealthCheck, 'id' | 'lastChecked'>) => {
    try {
      const newCheck: HealthCheck = {
        ...checkData,
        id: `check-${Date.now()}`,
        lastChecked: new Date().toISOString(),
      };

      setChecks(prev => [...prev, newCheck]);
      console.info('[HealthMonitoring] Created health check:', newCheck.id);
      return newCheck;
    } catch (err: any) {
      console.error('[HealthMonitoring] Failed to create health check:', err);
      setError(`Failed to create health check: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update health check
   */
  const updateHealthCheck = useCallback(async (id: string, updates: Partial<HealthCheck>) => {
    try {
      setChecks(prev => prev.map(check => {
        if (check.id !== id) return check;
        return { ...check, ...updates, lastChecked: new Date().toISOString() };
      }));

      console.info('[HealthMonitoring] Updated health check:', id);
    } catch (err: any) {
      console.error('[HealthMonitoring] Failed to update health check:', err);
      setError(`Failed to update health check: ${err.message}`);
    }
  }, []);

  /**
   * Create alert configuration
   */
  const createAlert = useCallback(async (alertData: Omit<HealthAlert, 'id'>) => {
    try {
      const newAlert: HealthAlert = {
        ...alertData,
        id: `alert-${Date.now()}`,
      };

      setAlerts(prev => [...prev, newAlert]);
      console.info('[HealthMonitoring] Created alert:', newAlert.id);
      return newAlert;
    } catch (err: any) {
      console.error('[HealthMonitoring] Failed to create alert:', err);
      setError(`Failed to create alert: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update alert configuration
   */
  const updateAlert = useCallback(async (id: string, updates: Partial<HealthAlert>) => {
    try {
      setAlerts(prev => prev.map(alert =>
        alert.id === id ? { ...alert, ...updates } : alert
      ));

      console.info('[HealthMonitoring] Updated alert:', id);
    } catch (err: any) {
      console.error('[HealthMonitoring] Failed to update alert:', err);
      setError(`Failed to update alert: ${err.message}`);
    }
  }, []);

  /**
   * Calculate overall system health
   */
  const calculateOverallHealth = useCallback((metrics: HealthMetric[], checks: HealthCheck[]): HealthDashboard['overallStatus'] => {
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
    const failingChecks = checks.filter(c => c.status === 'failing').length;

    if (criticalMetrics > 0 || failingChecks > 0) return 'critical';
    if (metrics.some(m => m.status === 'warning') || checks.some(c => c.status === 'unknown')) return 'degraded';
    return 'healthy';
  }, []);

  /**
   * Analyze trends for metrics
   */
  const analyzeTrends = useCallback((metrics: HealthMetric[]): HealthTrend[] => {
    const periods = ['1h', '24h', '7d'];
    return periods.map(period => {
      // Simplified trend analysis - in real implementation would analyze historical data
      const metric = metrics[Math.floor(Math.random() * metrics.length)];
      const mockDataPoints = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        value: metric.value + (Math.random() - 0.5) * 10,
      }));

      const values = mockDataPoints.map(p => p.value);
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length;
      const standardDeviation = Math.sqrt(variance);

      return {
        metricId: metric.id,
        period,
        average,
        min,
        max,
        standardDeviation,
        trend: Math.random() > 0.5 ? 'improving' : 'stable',
        dataPoints: mockDataPoints,
      };
    });
  }, []);

  /**
   * Load health monitoring data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockMetrics = generateMockHealthMetrics();
      const mockChecks = generateMockHealthChecks();
      const mockAlerts = generateMockAlerts();

      const calculatedTrends = analyzeTrends(mockMetrics);
      const overallStatus = calculateOverallHealth(mockMetrics, mockChecks);

      const mockDashboard: HealthDashboard = {
        overallStatus,
        uptime: 86400 + Math.floor(Math.random() * 86400), // 1-2 days
        lastIncident: overallStatus !== 'healthy' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
        metricsCount: mockMetrics.length,
        checksCount: mockChecks.length,
        alertsCount: mockAlerts.length,
        availability: 99.5 + Math.random() * 0.4, // 99.5-99.9%
      };

      setMetrics(mockMetrics);
      setChecks(mockChecks);
      setAlerts(mockAlerts);
      setTrends(calculatedTrends);
      setDashboard(mockDashboard);

      console.info('[HealthMonitoring] Loaded health monitoring data');
    } catch (err: any) {
      const errorMsg = `Failed to load health monitoring data: ${err.message}`;
      console.error('[HealthMonitoring] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [analyzeTrends, calculateOverallHealth]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Set up real-time refresh
   */
  const startRealTimeUpdates = useCallback((intervalMs: number = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      loadData();
    }, intervalMs);

    console.info('[HealthMonitoring] Started real-time updates');
  }, [loadData]);

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.info('[HealthMonitoring] Stopped real-time updates');
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  /**
   * Run health check
   */
  const runHealthCheck = useCallback(async (id: string) => {
    try {
      const check = checks.find(c => c.id === id);
      if (!check) return;

      // Simulate health check execution
      await updateHealthCheck(id, {
        status: Math.random() > 0.1 ? 'passing' : 'failing',
        duration: Math.floor(Math.random() * 1000) + 100,
        errorMessage: Math.random() > 0.9 ? 'Connection timeout' : undefined,
      });
    } catch (err: any) {
      console.error('[HealthMonitoring] Health check failed:', err);
      await updateHealthCheck(id, { status: 'failing', errorMessage: err.message });
    }
  }, [checks, updateHealthCheck]);

  /**
   * Get metrics by category
   */
  const getMetricsByCategory = useCallback((category: HealthMetric['category']) => {
    return metrics.filter(metric => metric.category === category);
  }, [metrics]);

  /**
   * Get critical alerts
   */
  const getCriticalAlerts = useCallback(() => {
    return alerts.filter(alert => alert.severity === 'critical' && alert.enabled);
  }, [alerts]);

  return {
    metrics,
    checks,
    alerts,
    trends,
    dashboard,
    isLoading,
    error,
    createMetric,
    updateMetric,
    createHealthCheck,
    updateHealthCheck,
    createAlert,
    updateAlert,
    runHealthCheck,
    getMetricsByCategory,
    getCriticalAlerts,
    refreshData: loadData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };
};

/**
 * Generate mock health metrics for development
 */
function generateMockHealthMetrics(): HealthMetric[] {
  const categories: HealthMetric['category'][] = ['system', 'application', 'network', 'security', 'performance'];
  const metricNames = [
    'CPU Usage', 'Memory Usage', 'Disk Space', 'Network Latency', 'Error Rate',
    'Response Time', 'Throughput', 'Active Connections', 'Security Events', 'Uptime'
  ];

  return Array.from({ length: 10 }, (_, index) => {
    const value = Math.floor(Math.random() * 100);
    const threshold = {
      warning: 70 + Math.floor(Math.random() * 20),
      critical: 85 + Math.floor(Math.random() * 10),
    };

    return {
      id: `metric-${index + 1}`,
      name: metricNames[index % metricNames.length],
      category: categories[index % categories.length],
      value,
      unit: index < 2 ? '%' : index < 4 ? 'ms' : 'count',
      status: value >= threshold.critical ? 'critical' : value >= threshold.warning ? 'warning' : 'healthy',
      threshold,
      timestamp: new Date().toISOString(),
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      description: `Monitors ${metricNames[index % metricNames.length].toLowerCase()} for system health`,
    };
  });
}

/**
 * Generate mock health checks for development
 */
function generateMockHealthChecks(): HealthCheck[] {
  const checkNames = ['Database Connection', 'API Gateway', 'Authentication Service', 'Message Queue', 'Cache Layer'];

  return checkNames.map((name, index) => ({
    id: `check-${index + 1}`,
    name,
    type: ['liveness', 'readiness', 'startup', 'custom'][index % 4] as HealthCheck['type'],
    status: Math.random() > 0.2 ? 'passing' : 'failing',
    duration: Math.floor(Math.random() * 500) + 50,
    lastChecked: new Date(Date.now() - Math.random() * 60 * 1000).toISOString(),
    nextCheck: new Date(Date.now() + Math.random() * 60 * 1000).toISOString(),
    errorMessage: Math.random() > 0.8 ? 'Service unavailable' : undefined,
    metadata: {
      endpoint: `https://service${index + 1}.example.com/health`,
      timeout: 5000,
    },
  }));
}

/**
 * Generate mock alerts for development
 */
function generateMockAlerts(): HealthAlert[] {
  return [
    {
      id: 'alert-1',
      metricId: 'metric-1',
      condition: 'above',
      threshold: 90,
      severity: 'critical',
      enabled: true,
      notificationChannels: ['email', 'slack'],
      cooldownPeriod: 5,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'alert-2',
      metricId: 'metric-2',
      condition: 'above',
      threshold: 80,
      severity: 'high',
      enabled: true,
      notificationChannels: ['email'],
      cooldownPeriod: 15,
    },
  ];
}