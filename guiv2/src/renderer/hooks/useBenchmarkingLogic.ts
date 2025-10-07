import { useState, useEffect, useCallback } from 'react';

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
}

/**
 * KPI data for benchmarking
 */
export interface BenchmarkingKpi {
  label: string;
  value: number;
  change: number;
  benchmark: number;
}

/**
 * Chart data for benchmarking
 */
export interface BenchmarkingChartData {
  date: string;
  current: number;
  benchmark: number;
  category: string;
}

/**
 * Custom hook for benchmarking logic
 */
export const useBenchmarkingLogic = () => {
  const [data, setData] = useState<BenchmarkingData[]>([]);
  const [chartData, setChartData] = useState<BenchmarkingChartData[]>([]);
  const [kpis, setKpis] = useState<BenchmarkingKpi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

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

      setData(mockData);
      setChartData(mockChartData);
      setKpis(mockKpis);

      console.info('[Benchmarking] Loaded benchmarking data');
    } catch (err: any) {
      const errorMsg = `Failed to load benchmarking data: ${err.message}`;
      console.error('[Benchmarking] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return {
    data,
    chartData,
    kpis,
    isLoading,
    error,
    exportData,
    refreshData: loadData,
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
  }));
}

/**
 * Generate mock benchmarking chart data
 */
function generateMockBenchmarkingChartData(): BenchmarkingChartData[] {
  const categories = ['Q1', 'Q2', 'Q3', 'Q4'];
  const data: BenchmarkingChartData[] = [];

  categories.forEach((category, index) => {
    data.push({
      date: `2025-${String((index + 1) * 3).padStart(2, '0')}-01`,
      current: 70 + Math.random() * 30,
      benchmark: 75 + Math.random() * 20,
      category,
    });
  });

  return data;
}

/**
 * Generate mock benchmarking KPIs
 */
function generateMockBenchmarkingKpis(): BenchmarkingKpi[] {
  return [
    { label: 'Performance Score', value: 88, change: 3.2, benchmark: 85 },
    { label: 'Compliance Rate', value: 92, change: -1.5, benchmark: 90 },
    { label: 'Efficiency Index', value: 76, change: 5.1, benchmark: 80 },
  ];
}

/**
 * Convert benchmarking data to CSV format
 */
function convertBenchmarkingToCSV(data: BenchmarkingData[]): string {
  const headers = [
    'ID', 'Metric', 'Current Value', 'Benchmark Value', 'Status', 'Category', 'Date'
  ];

  const rows = data.map(item => [
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