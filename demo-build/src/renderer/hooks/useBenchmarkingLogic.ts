import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Benchmarking data model
 */
export interface BenchmarkingData {
  id: string;
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  status: 'above' | 'below' | 'equal';
  category: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  score: number;
}

/**
 * KPI data for benchmarking
 */
export interface BenchmarkingKpi {
  label: string;
  value: number;
  change: number;
  benchmark: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Chart data for benchmarking
 */
export interface BenchmarkingChartData {
  date: string;
  current: number;
  benchmark: number;
  category: string;
  trend: number;
}

/**
 * Statistical report data
 */
export interface BenchmarkingStats {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  count: number;
}

/**
 * Trend analysis data
 */
export interface TrendAnalysis {
  period: string;
  growthRate: number;
  confidence: number;
  direction: 'up' | 'down' | 'stable';
}

/**
 * Filter options
 */
export interface BenchmarkingFilters {
  category?: string;
  status?: BenchmarkingData['status'];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Custom hook for benchmarking logic
 */
export const useBenchmarkingLogic = () => {
  const [data, setData] = useState<BenchmarkingData[]>([]);
  const [chartData, setChartData] = useState<BenchmarkingChartData[]>([]);
  const [kpis, setKpis] = useState<BenchmarkingKpi[]>([]);
  const [stats, setStats] = useState<BenchmarkingStats | null>(null);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [filters, setFilters] = useState<BenchmarkingFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate performance score based on current vs benchmark values
   */
  const calculateScore = useCallback((current: number, benchmark: number): number => {
    return Math.round((current / benchmark) * 100);
  }, []);

  /**
   * Determine trend direction based on change value
   */
  const calculateTrend = useCallback((change: number): 'up' | 'down' | 'stable' => {
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
  }, []);

  /**
   * Calculate statistical metrics
   */
  const calculateStats = useCallback((values: number[]): BenchmarkingStats => {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }, []);

  /**
   * Analyze trends over time periods
   */
  const analyzeTrends = useCallback((data: BenchmarkingData[]): TrendAnalysis[] => {
    const periods = ['7d', '30d', '90d'];
    return periods.map(period => {
      // Simplified trend calculation - in real implementation would analyze historical data
      const growthRate = Math.random() * 20 - 10; // Mock growth rate
      const confidence = 0.8 + Math.random() * 0.2;
      const direction = growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable';

      return {
        period,
        growthRate: Math.round(growthRate * 100) / 100,
        confidence: Math.round(confidence * 100),
        direction,
      };
    });
  }, []);

  /**
   * Create new benchmarking entry
   */
  const createBenchmark = useCallback(async (benchmarkData: Omit<BenchmarkingData, 'id' | 'date' | 'status' | 'trend' | 'score'>) => {
    try {
      const newEntry: BenchmarkingData = {
        ...benchmarkData,
        id: `benchmark-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: benchmarkData.currentValue > benchmarkData.benchmarkValue ? 'above' :
                benchmarkData.currentValue < benchmarkData.benchmarkValue ? 'below' : 'equal',
        trend: 'stable', // New entries start as stable
        score: calculateScore(benchmarkData.currentValue, benchmarkData.benchmarkValue),
      };

      setData(prev => [...prev, newEntry]);
      console.info('[Benchmarking] Created new benchmark entry:', newEntry.id);
    } catch (err: any) {
      console.error('[Benchmarking] Failed to create benchmark:', err);
      setError(`Failed to create benchmark: ${err.message}`);
    }
  }, [calculateScore]);

  /**
   * Update existing benchmarking entry
   */
  const updateBenchmark = useCallback(async (id: string, updates: Partial<BenchmarkingData>) => {
    try {
      setData(prev => prev.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };
        if (updates.currentValue !== undefined || updates.benchmarkValue !== undefined) {
          const currentValue = updates.currentValue ?? item.currentValue;
          const benchmarkValue = updates.benchmarkValue ?? item.benchmarkValue;
          updated.status = currentValue > benchmarkValue ? 'above' :
                          currentValue < benchmarkValue ? 'below' : 'equal';
          updated.score = calculateScore(currentValue, benchmarkValue);
        }

        return updated;
      }));

      console.info('[Benchmarking] Updated benchmark entry:', id);
    } catch (err: any) {
      console.error('[Benchmarking] Failed to update benchmark:', err);
      setError(`Failed to update benchmark: ${err.message}`);
    }
  }, [calculateScore]);

  /**
   * Filter data based on current filters
   */
  const getFilteredData = useCallback(() => {
    return (data ?? []).filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.dateRange) {
        const itemDate = new Date(item.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (itemDate < startDate || itemDate > endDate) return false;
      }
      return true;
    });
  }, [data, filters]);

  /**
   * Load benchmarking data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockBenchmarkingData();
      const mockChartData = generateMockBenchmarkingChartData();
      const mockKpis = generateMockBenchmarkingKpis();

      // Calculate stats and trends
      const currentValues = mockData.map(d => d.currentValue);
      const calculatedStats = calculateStats(currentValues);
      const calculatedTrends = analyzeTrends(mockData);

      setData(mockData);
      setChartData(mockChartData);
      setKpis(mockKpis);
      setStats(calculatedStats);
      setTrends(calculatedTrends);

      console.info('[Benchmarking] Loaded benchmarking data');
    } catch (err: any) {
      const errorMsg = `Failed to load benchmarking data: ${err.message}`;
      console.error('[Benchmarking] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats, analyzeTrends]);

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

    console.info('[Benchmarking] Started real-time updates');
  }, [loadData]);

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.info('[Benchmarking] Stopped real-time updates');
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
   * Export benchmarking data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const csv = convertBenchmarkingToCSV(data);

      await window.electronAPI.invoke('export-data', {
        filename: `benchmarking-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[Benchmarking] Exported benchmarking data successfully');
    } catch (err: any) {
      console.error('[Benchmarking] Export failed:', err);
      setError(`Export failed: ${err.message}`);
    }
  }, [data]);

  /**
   * Generate statistical report
   */
  const generateReport = useCallback(() => {
    if (!stats) return null;

    const filteredData = getFilteredData();
    const report = {
      summary: {
        totalBenchmarks: filteredData.length,
        aboveBenchmark: filteredData.filter(d => d.status === 'above').length,
        belowBenchmark: filteredData.filter(d => d.status === 'below').length,
        equalBenchmark: filteredData.filter(d => d.status === 'equal').length,
      },
      statistics: stats,
      trends,
      topPerformers: filteredData
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      categories: [...new Set(filteredData.map(d => d.category))],
    };

    return report;
  }, [stats, trends, getFilteredData]);

  return {
    data: getFilteredData(),
    allData: data,
    chartData,
    kpis,
    stats,
    trends,
    filters,
    isLoading,
    error,
    createBenchmark,
    updateBenchmark,
    setFilters,
    exportData,
    refreshData: loadData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    generateReport,
  };
};

/**
 * Generate mock benchmarking data for development
 */
function generateMockBenchmarkingData(): BenchmarkingData[] {
  const metrics = [
    { metric: 'User Adoption Rate', current: 85, benchmark: 80 },
    { metric: 'System Performance', current: 92, benchmark: 90 },
    { metric: 'Data Accuracy', current: 96, benchmark: 95 },
    { metric: 'Security Compliance', current: 88, benchmark: 85 },
    { metric: 'Cost Efficiency', current: 78, benchmark: 80 },
  ];

  return metrics.map((item, index) => ({
    id: `benchmark-${index + 1}`,
    metric: item.metric,
    currentValue: item.current,
    benchmarkValue: item.benchmark,
    status: item.current > item.benchmark ? 'above' : item.current < item.benchmark ? 'below' : 'equal',
    category: index < 2 ? 'Performance' : 'Compliance',
    date: new Date().toISOString().split('T')[0],
    trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable',
    score: Math.round((item.current / item.benchmark) * 100),
  }));
}

/**
 * Generate mock benchmarking chart data
 */
function generateMockBenchmarkingChartData(): BenchmarkingChartData[] {
  const categories = ['Q1', 'Q2', 'Q3', 'Q4'];
  const data: BenchmarkingChartData[] = [];

  categories.forEach((category, index) => {
    const current = 70 + Math.random() * 30;
    const benchmark = 75 + Math.random() * 20;
    const trend = ((current - benchmark) / benchmark) * 100;

    data.push({
      date: `2025-${String((index + 1) * 3).padStart(2, '0')}-01`,
      current: Math.round(current),
      benchmark: Math.round(benchmark),
      category,
      trend: Math.round(trend * 100) / 100,
    });
  });

  return data;
}

/**
 * Generate mock benchmarking KPIs
 */
function generateMockBenchmarkingKpis(): BenchmarkingKpi[] {
  return [
    { label: 'Performance Score', value: 88, change: 3.2, benchmark: 85, trend: 'up' },
    { label: 'Compliance Rate', value: 92, change: -1.5, benchmark: 90, trend: 'down' },
    { label: 'Efficiency Index', value: 76, change: 5.1, benchmark: 80, trend: 'up' },
  ];
}

/**
 * Convert benchmarking data to CSV format
 */
function convertBenchmarkingToCSV(data: BenchmarkingData[]): string {
  const headers = [
    'ID', 'Metric', 'Current Value', 'Benchmark Value', 'Status', 'Category', 'Date'
  ];

  const rows = (data ?? []).map(item => [
    item.id,
    item.metric,
    item.currentValue.toString(),
    item.benchmarkValue.toString(),
    item.status,
    item.category,
    item.date,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}