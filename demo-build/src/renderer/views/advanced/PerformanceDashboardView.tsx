/**
 * Performance Dashboard View
 *
 * Comprehensive performance monitoring dashboard with real-time metrics,
 * interactive charts, alerts management, and optimization recommendations.
 */

import React, { useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Zap,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Clock,
  BarChart3,
  Target,
  Play,
  Pause,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Wrench,
  Search,
  X,
  Eye,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { usePerformanceDashboardLogic } from '../../hooks/usePerformanceDashboardLogic';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

/**
 * Format number for display
 */
const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

/**
 * Format bytes to human readable format
 */
const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${formatNumber(value)} ${units[unitIndex]}`;
};

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change?: number;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  icon,
  status,
  trend,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor().replace('text-', 'bg-').replace('-600', '-100')}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {getTrendIcon()}
              <span>{change >= 0 ? '+' : ''}{formatNumber(change, 1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Alert Item Component
 */
interface AlertItemProps {
  alert: any;
  onAcknowledge: (id: string) => void;
  onDrillDown: (alert: any) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onAcknowledge, onDrillDown }) => {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertBgColor = () => {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getAlertBgColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getAlertIcon()}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {alert.message}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Metric: {alert.metric} • Current: {alert.currentValue} • Threshold: {alert.threshold}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!alert.resolved && (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          )}
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onDrillDown(alert)}
            icon={<Eye className="w-3 h-3" />}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Optimization Suggestion Component
 */
interface SuggestionItemProps {
  suggestion: any;
  onApply: (id: string) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, onApply }) => {
  const getImpactColor = () => {
    switch (suggestion.impact) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
    }
  };

  const getEffortColor = () => {
    switch (suggestion.effort) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {suggestion.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {suggestion.description}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`text-xs font-medium ${getImpactColor()}`}>
                Impact: {suggestion.impact}
              </span>
              <span className={`text-xs font-medium ${getEffortColor()}`}>
                Effort: {suggestion.effort}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Category: {suggestion.category}
              </span>
            </div>
          </div>
        </div>
        {suggestion.actionable && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onApply(suggestion.id)}
            icon={<Wrench className="w-4 h-4" />}
          >
            Apply
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Performance Dashboard View Component
 */
export const PerformanceDashboardView: React.FC = () => {
  const {
    dashboardData,
    isLoading,
    error,
    lastUpdate,
    streaming,
    refreshDashboard,
    toggleStreaming,
    updateStreamingConfig,
    acknowledgeAlert,
    runBenchmark,
    applySuggestion,
    exportData,
  } = usePerformanceDashboardLogic();

  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [showAlerts, setShowAlerts] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [drillDownAlert, setDrillDownAlert] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={refreshDashboard} icon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load performance metrics at this time.
          </p>
          <Button onClick={refreshDashboard} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const { currentMetrics, trends, alerts, benchmarks, suggestions, historicalData, systemHealth } = dashboardData;

  // Calculate metrics for display
  const cpuStatus = currentMetrics.cpu.usage > 80 ? 'critical' : currentMetrics.cpu.usage > 60 ? 'warning' : 'healthy';
  const memoryStatus = currentMetrics.memory.usage > 90 ? 'critical' : currentMetrics.memory.usage > 75 ? 'warning' : 'healthy';
  const diskStatus = currentMetrics.disk.usage > 85 ? 'critical' : currentMetrics.disk.usage > 70 ? 'warning' : 'healthy';
  const networkStatus = currentMetrics.network.latency > 100 ? 'critical' : currentMetrics.network.latency > 50 ? 'warning' : 'healthy';

  // Filter trends based on selected time range
  const getFilteredTrends = () => {
    const now = new Date();
    const hours = selectedTimeRange === '1h' ? 1 : selectedTimeRange === '6h' ? 6 : 24;
    return trends.filter(point => {
      const pointTime = new Date(point.timestamp);
      return (now.getTime() - pointTime.getTime()) <= (hours * 60 * 60 * 1000);
    });
  };

  const filteredTrends = getFilteredTrends();

  // Handle benchmark execution
  const handleRunBenchmark = async (category: any) => {
    setIsBenchmarking(true);
    try {
      await runBenchmark(category);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Handle alert drill-down
  const handleAlertDrillDown = (alert: any) => {
    setDrillDownAlert(alert);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto" data-cy="performance-dashboard-view" data-testid="performance-dashboard-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time system monitoring and performance analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={streaming.enabled ? 'danger' : 'secondary'}
              onClick={toggleStreaming}
              icon={streaming.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {streaming.enabled ? 'Stop Live' : 'Start Live'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={refreshDashboard}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            systemHealth.overall === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            systemHealth.overall === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              systemHealth.overall === 'healthy' ? 'bg-green-500' :
              systemHealth.overall === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.uptime}h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{(alerts ?? []).filter(a => !a.resolved).length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{benchmarks.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Benchmarks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.filter(s => s.actionable).length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Optimizations</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last restart: {new Date(systemHealth.lastRestart).toLocaleString()}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            options={[
              { value: '1h', label: 'Last Hour' },
              { value: '6h', label: 'Last 6 Hours' },
              { value: '24h', label: 'Last 24 Hours' },
            ]}
            className="w-40"
          />
          <Select
            value={selectedMetric}
            onChange={setSelectedMetric}
            options={[
              { value: 'cpu', label: 'CPU Usage' },
              { value: 'memory', label: 'Memory Usage' },
              { value: 'disk', label: 'Disk Usage' },
              { value: 'network', label: 'Network Latency' },
            ]}
            className="w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowAlerts(!showAlerts)}
            icon={<Filter className="w-4 h-4" />}
          >
            {showAlerts ? 'Hide' : 'Show'} Alerts
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowSuggestions(!showSuggestions)}
            icon={<Target className="w-4 h-4" />}
          >
            {showSuggestions ? 'Hide' : 'Show'} Suggestions
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={formatNumber(currentMetrics.cpu.usage)}
          unit="%"
          icon={<Cpu className="w-6 h-6" />}
          status={cpuStatus}
          trend={currentMetrics.cpu.usage > 70 ? 'up' : 'down'}
        />
        <MetricCard
          title="Memory Usage"
          value={formatNumber(currentMetrics.memory.usage)}
          unit="%"
          icon={<MemoryStick className="w-6 h-6" />}
          status={memoryStatus}
          trend={currentMetrics.memory.usage > 80 ? 'up' : 'down'}
        />
        <MetricCard
          title="Disk Usage"
          value={formatNumber(currentMetrics.disk.usage)}
          unit="%"
          icon={<HardDrive className="w-6 h-6" />}
          status={diskStatus}
          trend={currentMetrics.disk.usage > 75 ? 'up' : 'down'}
        />
        <MetricCard
          title="Network Latency"
          value={formatNumber(currentMetrics.network.latency)}
          unit="ms"
          icon={<Wifi className="w-6 h-6" />}
          status={networkStatus}
          trend={currentMetrics.network.latency > 60 ? 'up' : 'down'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Trends
            </h3>
            <Select
              value={selectedMetric}
              onChange={setSelectedMetric}
              options={[
                { value: 'cpu', label: 'CPU' },
                { value: 'memory', label: 'Memory' },
                { value: 'disk', label: 'Disk' },
                { value: 'network', label: 'Network' },
              ]}
              className="w-32"
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredTrends}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="timestamp"
                className="text-xs fill-gray-600 dark:fill-gray-400"
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: any, name: string) => [
                  `${formatNumber(value)}${selectedMetric === 'network' ? 'ms' : '%'}`,
                  name === 'cpuUsage' ? 'CPU' :
                  name === 'memoryUsage' ? 'Memory' :
                  name === 'diskUsage' ? 'Disk' : 'Network Latency'
                ]}
              />
              <Area
                type="monotone"
                dataKey={
                  selectedMetric === 'cpu' ? 'cpuUsage' :
                  selectedMetric === 'memory' ? 'memoryUsage' :
                  selectedMetric === 'disk' ? 'diskUsage' : 'networkLatency'
                }
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Usage Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resource Usage Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{
              name: 'Current Usage',
              CPU: currentMetrics.cpu.usage,
              Memory: currentMetrics.memory.usage,
              Disk: currentMetrics.disk.usage,
              Network: Math.min(currentMetrics.network.latency / 2, 100), // Scale network latency to 0-100
            }]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis dataKey="name" className="text-xs fill-gray-600 dark:fill-gray-400" />
              <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: any) => [`${formatNumber(value)}%`, '']}
              />
              <Bar dataKey="CPU" fill="#ef4444" name="CPU" />
              <Bar dataKey="Memory" fill="#f59e0b" name="Memory" />
              <Bar dataKey="Disk" fill="#10b981" name="Disk" />
              <Bar dataKey="Network" fill="#3b82f6" name="Network" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts and Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        {showAlerts && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts ({(alerts ?? []).filter(a => !a.resolved).length})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAlerts(false)}
              >
                Hide
              </Button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(alerts ?? []).filter(a => !a.resolved).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No active alerts</p>
                </div>
              ) : (
                (alerts ?? []).filter(a => !a.resolved).map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={acknowledgeAlert}
                    onDrillDown={handleAlertDrillDown}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        {showSuggestions && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Optimization Suggestions ({suggestions.filter(s => s.actionable).length})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSuggestions(false)}
              >
                Hide
              </Button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {suggestions.filter(s => s.actionable).length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No actionable suggestions</p>
                </div>
              ) : (
                suggestions.filter(s => s.actionable).map((suggestion) => (
                  <SuggestionItem
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={applySuggestion}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Benchmarks and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benchmarks */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Benchmarks
          </h3>
          <div className="space-y-3">
            {['cpu', 'memory', 'disk', 'network', 'application'].map((category) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {category} Benchmark
                </span>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => handleRunBenchmark(category as any)}
                  loading={isBenchmarking}
                  disabled={isBenchmarking}
                >
                  Run
                </Button>
              </div>
            ))}
          </div>
          {benchmarks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent Results:</p>
              <div className="space-y-2">
                {benchmarks.slice(-3).map((benchmark) => (
                  <div key={benchmark.id} className="text-xs text-gray-500 dark:text-gray-400">
                    {benchmark.name}: {formatNumber(benchmark.score)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports & Export
          </h3>
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={() => exportData('json')}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Export as JSON
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportData('csv')}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Export as CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => exportData('pdf')}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
              disabled
            >
              Export as PDF (Coming Soon)
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Monitoring Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Update Interval
              </label>
              <Select
                value={streaming.interval.toString()}
                onChange={(value) => updateStreamingConfig({ interval: parseInt(value) })}
                options={[
                  { value: '1000', label: '1 second' },
                  { value: '5000', label: '5 seconds' },
                  { value: '10000', label: '10 seconds' },
                  { value: '30000', label: '30 seconds' },
                ]}
                disabled={!streaming.enabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buffer Size
              </label>
              <Select
                value={streaming.bufferSize.toString()}
                onChange={(value) => updateStreamingConfig({ bufferSize: parseInt(value) })}
                options={[
                  { value: '50', label: '50 data points' },
                  { value: '100', label: '100 data points' },
                  { value: '200', label: '200 data points' },
                ]}
                disabled={!streaming.enabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Drill-down Modal */}
      {drillDownAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Details</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDrillDownAlert(null)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{drillDownAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Metric</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{drillDownAlert.metric}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{drillDownAlert.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Value</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{drillDownAlert.currentValue}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{drillDownAlert.threshold}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(drillDownAlert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboardView;


