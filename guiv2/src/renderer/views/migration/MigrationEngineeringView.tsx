/**
 * MigrationEngineeringView Component
 *
 * Enhanced Migration Control Plane - Engineering Metrics View
 * Displays migration performance metrics, health scores, and operational insights.
 *
 * Features:
 * - Real-time throughput metrics
 * - Success/failure rate tracking
 * - Health score dashboard
 * - Error analysis
 * - Performance recommendations
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  ChevronRight,
  Heart,
} from 'lucide-react';

import { useMigrationStore } from '../../store/useMigrationStore';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { MigrationEngineeringMetrics, MigrationHealthScore } from '../../types/models/migration';

const MigrationEngineeringView: React.FC = () => {
  const {
    engineeringMetrics,
    healthScore,
    isLoading,
    loadEngineeringMetrics,
    calculateHealthScore,
    getMetricsSummary,
  } = useMigrationStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await loadEngineeringMetrics();
      await calculateHealthScore();
    };
    loadData();
  }, [loadEngineeringMetrics, calculateHealthScore]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadEngineeringMetrics();
      await calculateHealthScore();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadEngineeringMetrics, calculateHealthScore]);

  const metricsSummary = useMemo(() => getMetricsSummary(), [getMetricsSummary, engineeringMetrics]);
  const latestMetrics = useMemo(() => engineeringMetrics[engineeringMetrics.length - 1], [engineeringMetrics]);

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 50) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading && engineeringMetrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" label="Loading engineering metrics..." />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Migration Engineering
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Performance metrics, health monitoring, and operational insights
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            icon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Health Score Card */}
        <div className="grid grid-cols-2 gap-6">
          <div className={`rounded-xl p-6 ${healthScore ? getHealthBgColor(healthScore.overall) : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart size={20} className="text-red-500" />
                Migration Health Score
              </h2>
              {healthScore?.lastCalculated && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(healthScore.lastCalculated).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className={`text-6xl font-bold ${healthScore ? getHealthColor(healthScore.overall) : 'text-gray-400'}`}>
                  {healthScore?.overall || '--'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overall Score</div>
              </div>

              {healthScore && (
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {Object.entries(healthScore.categories).map(([key, value]) => (
                    <div key={key} className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className={`text-2xl font-bold ${getHealthColor(value)}`}>{value}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              Summary Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <TrendingUp size={14} />
                  Avg Success Rate
                </div>
                <div className="text-2xl font-bold text-green-600">{metricsSummary.avgSuccessRate}%</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <Zap size={14} />
                  Avg Throughput
                </div>
                <div className="text-2xl font-bold text-blue-600">{metricsSummary.avgThroughput}/hr</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <CheckCircle size={14} />
                  Total Processed
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{metricsSummary.totalProcessed}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <XCircle size={14} />
                  Total Failed
                </div>
                <div className="text-2xl font-bold text-red-600">{metricsSummary.totalFailed}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        {latestMetrics && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LineChart size={20} className="text-green-500" />
              Real-time Metrics
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                ({new Date(latestMetrics.timestamp).toLocaleTimeString()})
              </span>
            </h2>

            <div className="grid grid-cols-4 gap-6">
              {/* Throughput */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Throughput</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Items/Hour</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{latestMetrics.itemsPerHour}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">MB/Second</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(latestMetrics.bytesPerSecond / 1048576).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg Duration</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {Math.round(latestMetrics.averageItemDuration / 1000)}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Success Rates */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Success Rates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Success</span>
                    <span className="text-lg font-semibold text-green-600">{latestMetrics.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Failure</span>
                    <span className="text-lg font-semibold text-red-600">{latestMetrics.failureRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Retry</span>
                    <span className="text-lg font-semibold text-yellow-600">{latestMetrics.retryRate}%</span>
                  </div>
                </div>
              </div>

              {/* Queue Stats */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Queue Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Queued</span>
                    <span className="text-lg font-semibold text-blue-600">{latestMetrics.queuedItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Processing</span>
                    <span className="text-lg font-semibold text-yellow-600">{latestMetrics.processingItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
                    <span className="text-lg font-semibold text-green-600">{latestMetrics.completedItems}</span>
                  </div>
                </div>
              </div>

              {/* System Resources */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">System Resources</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Cpu size={12} /> CPU
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{latestMetrics.cpuUsage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${latestMetrics.cpuUsage > 80 ? 'bg-red-500' : latestMetrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${latestMetrics.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <HardDrive size={12} /> Memory
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{latestMetrics.memoryUsage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${latestMetrics.memoryUsage > 80 ? 'bg-red-500' : latestMetrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${latestMetrics.memoryUsage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Wifi size={12} /> Network
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{latestMetrics.networkUtilization}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${latestMetrics.networkUtilization > 80 ? 'bg-red-500' : latestMetrics.networkUtilization > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${latestMetrics.networkUtilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Issues & Top Errors */}
        <div className="grid grid-cols-2 gap-6">
          {/* Health Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Health Issues
            </h2>
            {healthScore?.issues && healthScore.issues.length > 0 ? (
              <div className="space-y-3">
                {healthScore.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-orange-500"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {issue.category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <ChevronRight size={12} />
                      <span>{issue.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                <p>No health issues detected</p>
              </div>
            )}
          </div>

          {/* Top Errors */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Top Errors
            </h2>
            {latestMetrics?.topErrors && latestMetrics.topErrors.length > 0 ? (
              <div className="space-y-3">
                {latestMetrics.topErrors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-red-600 dark:text-red-400">
                        {error.code}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                        {error.count} occurrences
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {error.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                <p>No errors reported</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-blue-500" />
            Performance Recommendations
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server size={16} className="text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Optimize Batch Size</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consider increasing batch size for bulk operations to improve throughput.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">Schedule Off-Peak</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Run large migrations during off-peak hours to minimize business impact.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">Monitor Dependencies</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ensure dependent resources are migrated in the correct order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationEngineeringView;


