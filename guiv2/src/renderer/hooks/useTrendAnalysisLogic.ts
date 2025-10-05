import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Trend analysis time range
 */
type TimeRange = '7days' | '30days' | '90days' | '12months';

/**
 * Metric type for trend analysis
 */
type MetricType = 'users' | 'groups' | 'devices' | 'mailboxes' | 'storage';

/**
 * Trend data point
 */
interface TrendDataPoint {
  date: string;
  value: number;
  target?: number;
  forecast?: number;
}

/**
 * Comparative trend data
 */
interface ComparativeTrend {
  period: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

/**
 * Trend summary statistics
 */
interface TrendSummary {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  projection30Days: number;
  projection90Days: number;
}

/**
 * Complete trend analysis data
 */
interface TrendAnalysisData {
  primaryTrend: TrendDataPoint[];
  comparativeTrends: ComparativeTrend[];
  summaries: TrendSummary[];
  correlations: {
    metric1: string;
    metric2: string;
    correlation: number;
    description: string;
  }[];
}

/**
 * Generate trend data from Logic Engine statistics
 * TODO: Replace with real time-series data when audit log tracking is implemented
 * For now, using Logic Engine current stats to generate realistic mock trends
 */
function generateTrendData(
  stats: any,
  metricType: MetricType,
  timeRange: TimeRange
): TrendDataPoint[] {
  // Get current value from stats
  let currentValue = 0;
  switch (metricType) {
    case 'users':
      currentValue = stats.UserCount || 0;
      break;
    case 'groups':
      currentValue = stats.GroupCount || 0;
      break;
    case 'devices':
      currentValue = stats.DeviceCount || 0;
      break;
    case 'mailboxes':
      currentValue = stats.MailboxCount || 0;
      break;
    case 'storage':
      // Estimate storage from mailboxes (5GB avg per mailbox)
      currentValue = (stats.MailboxCount || 0) * 5;
      break;
  }

  // Generate historical data points based on time range
  const points: TrendDataPoint[] = [];
  let numPoints = 0;
  let dateIncrement = 0;

  switch (timeRange) {
    case '7days':
      numPoints = 7;
      dateIncrement = 1; // 1 day
      break;
    case '30days':
      numPoints = 30;
      dateIncrement = 1; // 1 day
      break;
    case '90days':
      numPoints = 90;
      dateIncrement = 1; // 1 day
      break;
    case '12months':
      numPoints = 12;
      dateIncrement = 30; // ~1 month
      break;
  }

  const now = new Date();

  for (let i = 0; i < numPoints; i++) {
    const pointDate = new Date(now);
    pointDate.setDate(pointDate.getDate() - ((numPoints - i - 1) * dateIncrement));

    // Calculate value with slight growth trend
    const progressRatio = i / numPoints;
    const baseValue = currentValue * (0.7 + progressRatio * 0.3); // Start at 70%, end at 100%
    const noise = (Math.random() - 0.5) * (currentValue * 0.05); // ±5% noise
    const value = Math.max(0, Math.floor(baseValue + noise));

    // Calculate target (slightly higher than actual for motivation)
    const target = Math.floor(value * 1.05);

    // Calculate forecast for future points (simple linear projection)
    const forecast = i >= numPoints - 3 ? Math.floor(currentValue * 1.02) : undefined;

    points.push({
      date: pointDate.toISOString().split('T')[0],
      value,
      target,
      forecast,
    });
  }

  return points;
}

/**
 * Generate comparative trends (current vs previous period)
 */
function generateComparativeTrends(
  trendData: TrendDataPoint[]
): ComparativeTrend[] {
  if (trendData.length < 2) return [];

  const midPoint = Math.floor(trendData.length / 2);
  const firstHalf = trendData.slice(0, midPoint);
  const secondHalf = trendData.slice(midPoint);

  const avgFirst = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

  const change = avgSecond - avgFirst;
  const changePercentage = avgFirst > 0 ? Math.round((change / avgFirst) * 100) : 0;

  return [
    {
      period: 'First Half vs Second Half',
      current: Math.floor(avgSecond),
      previous: Math.floor(avgFirst),
      change: Math.floor(change),
      changePercentage,
    },
  ];
}

/**
 * Calculate trend summary with projections
 */
function calculateTrendSummary(
  metricType: MetricType,
  trendData: TrendDataPoint[]
): TrendSummary {
  if (trendData.length < 2) {
    return {
      metric: metricType,
      currentValue: 0,
      previousValue: 0,
      change: 0,
      changePercentage: 0,
      trend: 'stable',
      projection30Days: 0,
      projection90Days: 0,
    };
  }

  const current = trendData[trendData.length - 1].value;
  const previous = trendData[0].value;
  const change = current - previous;
  const changePercentage = previous > 0 ? Math.round((change / previous) * 100) : 0;

  // Determine trend direction
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(changePercentage) >= 5) {
    trend = changePercentage > 0 ? 'increasing' : 'decreasing';
  }

  // Simple linear projection
  const avgDailyChange = change / trendData.length;
  const projection30Days = Math.max(0, Math.floor(current + avgDailyChange * 30));
  const projection90Days = Math.max(0, Math.floor(current + avgDailyChange * 90));

  return {
    metric: metricType,
    currentValue: current,
    previousValue: previous,
    change,
    changePercentage,
    trend,
    projection30Days,
    projection90Days,
  };
}

/**
 * Calculate correlations between metrics
 * TODO: Replace with real correlation analysis when time-series data is available
 */
function calculateCorrelations(summaries: TrendSummary[]) {
  return [
    {
      metric1: 'Users',
      metric2: 'Mailboxes',
      correlation: 0.95,
      description: 'Strong positive correlation - most users have mailboxes',
    },
    {
      metric1: 'Users',
      metric2: 'Groups',
      correlation: 0.78,
      description: 'Positive correlation - group membership grows with users',
    },
    {
      metric1: 'Devices',
      metric2: 'Users',
      correlation: 0.82,
      description: 'Positive correlation - device count tracks user growth',
    },
  ];
}

/**
 * Get mock trend analysis data for fallback
 */
function getMockTrendAnalysisData(): TrendAnalysisData {
  const mockTrend: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      date: date.toISOString().split('T')[0],
      value: 10000 + Math.floor(Math.random() * 2000) + i * 50,
      target: 11000 + i * 50,
    };
  });

  return {
    primaryTrend: mockTrend,
    comparativeTrends: generateComparativeTrends(mockTrend),
    summaries: [
      {
        metric: 'users',
        currentValue: 12547,
        previousValue: 11200,
        change: 1347,
        changePercentage: 12,
        trend: 'increasing',
        projection30Days: 13200,
        projection90Days: 14500,
      },
    ],
    correlations: calculateCorrelations([]),
  };
}

/**
 * Custom hook for Trend Analysis logic
 * Integrates with Logic Engine to generate trend analysis from current statistics
 */
export const useTrendAnalysisLogic = () => {
  const [trendData, setTrendData] = useState<TrendAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('users');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [isExporting, setIsExporting] = useState(false);

  const fetchTrendAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get statistics from Logic Engine
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Generate trend data for selected metric
        const primaryTrend = generateTrendData(stats, selectedMetric, timeRange);

        // Generate comparative trends
        const comparativeTrends = generateComparativeTrends(primaryTrend);

        // Calculate summaries for all metrics
        const metricTypes: MetricType[] = ['users', 'groups', 'devices', 'mailboxes', 'storage'];
        const summaries = metricTypes.map(metric => {
          const metricTrend = generateTrendData(stats, metric, timeRange);
          return calculateTrendSummary(metric, metricTrend);
        });

        // Calculate correlations
        const correlations = calculateCorrelations(summaries);

        const analysisResult: TrendAnalysisData = {
          primaryTrend,
          comparativeTrends,
          summaries,
          correlations,
        };

        setTrendData(analysisResult);
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.warn('Trend analysis fetch error, using mock data:', err);

      // Set mock data for development/testing
      setTrendData(getMockTrendAnalysisData());
    } finally {
      setIsLoading(false);
    }
  }, [selectedMetric, timeRange]);

  // Initial load
  useEffect(() => {
    fetchTrendAnalysis();
  }, [fetchTrendAnalysis]);

  // Export trend report
  const handleExportReport = useCallback(async () => {
    if (!trendData) return;

    setIsExporting(true);
    try {
      console.log('Exporting trend analysis report...', trendData);
      const fileName = `TrendAnalysis_${selectedMetric}_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
      alert(`Report would be exported to: ${fileName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [trendData, selectedMetric, timeRange]);

  // Get metric label
  const getMetricLabel = useCallback((metric: MetricType): string => {
    const labels: Record<MetricType, string> = {
      users: 'Users',
      groups: 'Groups',
      devices: 'Devices',
      mailboxes: 'Mailboxes',
      storage: 'Storage (GB)',
    };
    return labels[metric];
  }, []);

  return {
    trendData,
    isLoading,
    error,
    selectedMetric,
    setSelectedMetric,
    timeRange,
    setTimeRange,
    isExporting,
    handleExportReport,
    getMetricLabel,
    refreshData: fetchTrendAnalysis,
  };
};
