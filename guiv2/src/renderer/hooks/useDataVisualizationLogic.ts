import { useState, useEffect, useCallback } from 'react';

/**
 * Data visualization configuration
 */
export interface VisualizationConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  title: string;
  dataSource: string;
  filters: Record<string, any>;
  settings: Record<string, any>;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  category?: string;
}

/**
 * KPI data for data visualization
 */
export interface VisualizationKpi {
  label: string;
  value: number;
  change: number;
  format: 'number' | 'percentage' | 'currency';
}

/**
 * Custom hook for data visualization logic
 */
export const useDataVisualizationLogic = () => {
  const [data, setData] = useState<VisualizationConfig[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [kpis, setKpis] = useState<VisualizationKpi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  /**
   * Load data visualization data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockData = generateMockVisualizationConfigs();
      const mockChartData = generateMockChartData();
      const mockKpis = generateMockVisualizationKpis();

      setData(mockData);
      setChartData(mockChartData);
      setKpis(mockKpis);

      console.info('[DataVisualization] Loaded data visualization data');
    } catch (err: any) {
      const errorMsg = `Failed to load data visualization data: ${err.message}`;
      console.error('[DataVisualization] Error:', err);
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
   * Export visualization data to CSV
   */
  const exportData = useCallback(async () => {
    try {
      const csv = convertVisualizationToCSV(chartData);

      await window.electronAPI.invoke('export-data', {
        filename: `data-visualization-${new Date().toISOString().split('T')[0]}.csv`,
        data: csv,
      });

      console.info('[DataVisualization] Exported visualization data successfully');
    } catch (err: any) {
      console.error('[DataVisualization] Export failed:', err);
      setError(`Export failed: ${err.message}`);
    }
  }, [chartData]);

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
 * Generate mock visualization configurations
 */
function generateMockVisualizationConfigs(): VisualizationConfig[] {
  return [
    {
      id: 'viz-1',
      type: 'bar',
      title: 'User Distribution by Department',
      dataSource: 'user-data',
      filters: { active: true },
      settings: { colorScheme: 'blue', showLegend: true },
    },
    {
      id: 'viz-2',
      type: 'line',
      title: 'System Performance Trends',
      dataSource: 'performance-metrics',
      filters: { timeframe: '30d' },
      settings: { smooth: true, showPoints: true },
    },
    {
      id: 'viz-3',
      type: 'pie',
      title: 'Resource Allocation',
      dataSource: 'resource-data',
      filters: { category: 'all' },
      settings: { showPercentages: true, explodeSlices: false },
    },
  ];
}

/**
 * Generate mock chart data
 */
function generateMockChartData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  categories.forEach((month, index) => {
    data.push({
      x: month,
      y: 50 + Math.random() * 100,
      category: 'Primary',
    });
    data.push({
      x: month,
      y: 30 + Math.random() * 80,
      category: 'Secondary',
    });
  });

  return data;
}

/**
 * Generate mock visualization KPIs
 */
function generateMockVisualizationKpis(): VisualizationKpi[] {
  return [
    { label: 'Total Data Points', value: 15420, change: 12.5, format: 'number' },
    { label: 'Visualization Coverage', value: 89.3, change: 2.1, format: 'percentage' },
    { label: 'Average Load Time', value: 1.2, change: -0.3, format: 'number' },
  ];
}

/**
 * Convert visualization data to CSV format
 */
function convertVisualizationToCSV(data: ChartDataPoint[]): string {
  const headers = ['X', 'Y', 'Label', 'Category'];

  const rows = data.map(item => [
    item.x.toString(),
    item.y.toString(),
    item.label || '',
    item.category || '',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}