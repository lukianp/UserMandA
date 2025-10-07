/**
 * Performance Metrics View
 *
 * Comprehensive analysis of Logic Engine performance including:
 * - Load time and data source performance
 * - Query response time metrics
 * - Cache hit rates and memory usage
 * - Inference rule execution performance
 * - System health assessment
 * - Performance trends over time
 */

import React from 'react';
import { RefreshCw, Activity, Database, Zap, Clock, TrendingUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePerformanceMetricsLogic } from '../../hooks/usePerformanceMetricsLogic';
import { Button } from '@components/atoms/Button';
import LoadingSpinner from '@components/atoms/LoadingSpinner';

/**
 * Format time in milliseconds
 */
const formatMs = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Format memory size
 */
const formatMemory = (mb: number): string => {
  if (mb < 1024) return `${mb.toFixed(0)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
};

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, subtitle, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`ml-4 p-3 rounded-lg ${variantStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Performance Metrics View Component
 */
export const PerformanceMetricsView: React.FC = () => {
  const {
    metricsData,
    isLoading,
    error,
    lastRefresh,
    autoRefresh,
    toggleAutoRefresh,
    refreshMetrics,
  } = usePerformanceMetricsLogic();

  if (isLoading && !metricsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !metricsData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Metrics</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={refreshMetrics} icon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!metricsData) {
    return null;
  }

  const { engineMetrics, dataSourcePerformance, queryPerformance, performanceTrends, systemHealth } = metricsData;

  // Get health status icon
  const getHealthIcon = () => {
    switch (systemHealth.status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getHealthVariant = (): 'success' | 'warning' | 'danger' => {
    switch (systemHealth.status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'danger';
    }
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto" data-cy="performance-metrics-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Metrics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time Logic Engine performance monitoring and optimization
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'primary' : 'secondary'}
            onClick={toggleAutoRefresh}
            icon={<Activity className="w-4 h-4" />}
          >
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button
            variant="secondary"
            onClick={refreshMetrics}
            icon={<RefreshCw className="w-4 h-4" />}
            disabled={isLoading}
          >
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Health Status */}
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg border-2 ${
        systemHealth.status === 'healthy' ? 'border-green-500' :
        systemHealth.status === 'warning' ? 'border-yellow-500' :
        'border-red-500'
      }`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getHealthIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              System Health: <span className="capitalize">{systemHealth.status}</span>
            </h3>
            {systemHealth.issues.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issues Detected:</p>
                <ul className="list-disc list-inside space-y-1">
                  {systemHealth.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations:</p>
              <ul className="list-disc list-inside space-y-1">
                {systemHealth.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Load Time"
          value={formatMs(engineMetrics.lastLoadTime)}
          icon={<Clock className="w-6 h-6" />}
          subtitle="Logic Engine initialization"
          variant={engineMetrics.lastLoadTime > 5000 ? 'warning' : 'success'}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${engineMetrics.cacheHitRate}%`}
          icon={<Zap className="w-6 h-6" />}
          subtitle="Query cache efficiency"
          variant={engineMetrics.cacheHitRate >= 80 ? 'success' : engineMetrics.cacheHitRate >= 60 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Memory Usage"
          value={formatMemory(engineMetrics.memoryUsageMB)}
          icon={<Database className="w-6 h-6" />}
          subtitle="Current memory footprint"
          variant={engineMetrics.memoryUsageMB > 500 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Avg Query Time"
          value={formatMs(engineMetrics.averageQueryResponseTime)}
          icon={<Activity className="w-6 h-6" />}
          subtitle="Average response time"
          variant={engineMetrics.averageQueryResponseTime > 100 ? 'danger' : engineMetrics.averageQueryResponseTime > 50 ? 'warning' : 'success'}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Data Sources"
          value={formatNumber(engineMetrics.totalDataSources)}
          icon={<Database className="w-6 h-6" />}
          subtitle="Active data sources"
        />
        <MetricCard
          title="Records Processed"
          value={formatNumber(engineMetrics.totalRecordsProcessed)}
          icon={<Database className="w-6 h-6" />}
          subtitle="Total records loaded"
        />
        <MetricCard
          title="Inference Rules"
          value={formatNumber(engineMetrics.inferenceRulesExecuted)}
          icon={<Zap className="w-6 h-6" />}
          subtitle="Rules executed"
        />
        <MetricCard
          title="Inference Time"
          value={formatMs(engineMetrics.inferenceRuleExecutionTime)}
          icon={<Clock className="w-6 h-6" />}
          subtitle="Total inference time"
        />
      </div>

      {/* Performance Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Trends (Last 24 Hours)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis
              dataKey="timestamp"
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
            <YAxis
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
              labelFormatter={(value) => new Date(value).toLocaleString()}
            />
            <Legend />
            <Line type="monotone" dataKey="loadTime" stroke="#3b82f6" strokeWidth={2} name="Load Time (ms)" />
            <Line type="monotone" dataKey="memoryUsage" stroke="#10b981" strokeWidth={2} name="Memory (MB)" />
            <Line type="monotone" dataKey="queryResponseTime" stroke="#f59e0b" strokeWidth={2} name="Query Time (ms)" />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          * Trend data is currently simulated. Real time-series data will be available when performance tracking is implemented.
        </p>
      </div>

      {/* Data Source Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Source Load Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Data Source</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Records</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Load Time</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cache Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Last Loaded</th>
              </tr>
            </thead>
            <tbody>
              {dataSourcePerformance.map((source) => (
                <tr
                  key={source.source}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{source.source}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                    {formatNumber(source.recordCount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatMs(source.loadTime)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      source.cacheStatus === 'hit'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : source.cacheStatus === 'stale'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {source.cacheStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                    {source.lastLoaded.toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Query Performance Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={queryPerformance}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis
              dataKey="queryType"
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tick={{ fill: 'currentColor' }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar dataKey="averageTime" fill="#3b82f6" name="Avg Time (ms)" />
            <Bar dataKey="maxTime" fill="#ef4444" name="Max Time (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Query Details Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Query Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Query Type</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Executions</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Avg Time</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Min/Max</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cache Hit Rate</th>
              </tr>
            </thead>
            <tbody>
              {queryPerformance.map((query) => (
                <tr
                  key={query.queryType}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{query.queryType}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                    {formatNumber(query.executionCount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatMs(query.averageTime)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatMs(query.minTime)} / {formatMs(query.maxTime)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      query.cacheHitRate >= 80
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : query.cacheHitRate >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {query.cacheHitRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsView;
