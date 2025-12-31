/**
 * BenchmarkingView Component
 *
 * Comprehensive benchmarking analysis view with KPI cards, trend visualization,
 * and data export capabilities. Follows production template pattern.
 *
 * Features:
 * - Real-time KPI metrics with benchmarking scores
 * - Interactive trend charts and comparative analysis
 * - Advanced filtering and data export
 * - Error handling and loading states
 * - Production-ready component integration
 */

import React from 'react';
import { TrendingUp, BarChart3, Download, RefreshCw, Zap, Target, Activity, Clock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useBenchmarkingLogic } from '../../hooks/useBenchmarkingLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { ModernCard } from '../../components/atoms/ModernCard';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { StatisticsCard } from '../../components/molecules/StatisticsCard';
import { Spinner } from '../../components/atoms/Spinner';

export const BenchmarkingView: React.FC = () => {
  const {
    data = [],
    chartData = [],
    kpis = [],
    stats = {},
    trends = [],
    filters = {},
    isLoading = false,
    error,
    createBenchmark,
    updateBenchmark,
    setFilters,
    exportData,
    refreshData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    generateReport,
  } = useBenchmarkingLogic();

  // KPI metrics for cards
  const kpiMetrics = [
    {
      label: 'Performance Score',
      value: (typeof kpis.find((k: any) => k.label === 'Performance Score')?.value === 'number' ? kpis.find((k: any) => k.label === 'Performance Score')?.value : 0) || 0,
      change: (typeof kpis.find((k: any) => k.label === 'Performance Score')?.change === 'number' ? kpis.find((k: any) => k.label === 'Performance Score')?.change : 0) || 0,
      icon: <Zap className="w-6 h-6" />,
      color: 'blue',
    },
    {
      label: 'Benchmark Achievement',
      value: (Array.isArray(data) && data.length > 0 ? Math.round(((data ?? []).filter((d: any) => d.status === 'above').length / (data ?? []).length) * 100) : 0),
      change: 0,
      icon: <Target className="w-6 h-6" />,
      color: 'green',
    },
    {
      label: 'Trend Confidence',
      value: (Array.isArray(trends) && trends.length > 0 ? Math.round(trends.reduce((acc: number, t: any) => acc + (t.confidence || 0), 0) / trends.length) : 0),
      change: 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'purple',
    },
    {
      label: 'Active Benchmarks',
      value: (Array.isArray(data) ? data.length : 0),
      change: 0,
      icon: <Clock className="w-6 h-6" />,
      color: 'orange',
    },
  ];

  // Data table columns
  const columns = [
    { field: 'metric', headerName: 'Metric', sortable: true, filter: true },
    { field: 'currentValue', headerName: 'Current Value', sortable: true },
    { field: 'benchmarkValue', headerName: 'Benchmark', sortable: true },
    { field: 'score', headerName: 'Score (%)', sortable: true },
    { field: 'status', headerName: 'Status', sortable: true },
    { field: 'trend', headerName: 'Trend', sortable: true },
    { field: 'category', headerName: 'Category', sortable: true, filter: true },
  ];

  // Filter options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Performance', label: 'Performance' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Security', label: 'Security' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'above', label: 'Above Benchmark' },
    { value: 'below', label: 'Below Benchmark' },
    { value: 'equal', label: 'At Benchmark' },
  ];

  // Handle filter changes
  const handleCategoryFilter = (value: string) => {
    setFilters({ ...filters, category: value || undefined });
  };

  const handleStatusFilter = (value: string) => {
    const status = value as 'above' | 'below' | 'equal' | undefined;
    setFilters({ ...filters, status: status });
  };

  // Safe access to filters with defaults
  const safeFilters = filters || {};

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full p-6">
        <ModernCard className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Activity className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Benchmarking Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={refreshData} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900" data-cy="benchmarking-view" data-testid="benchmarking-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Benchmarking Analysis</h1>
            <p className="text-gray-600 dark:text-gray-400">Performance metrics and trend analysis</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={refreshData}
            loading={isLoading}
            data-cy="refresh-btn" data-testid="refresh-btn"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={exportData}
            data-cy="export-btn" data-testid="export-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {kpiMetrics.map((metric) => (
            <StatisticsCard
              key={metric.label}
              title={metric.label}
              value={metric.value}
              icon={metric.icon}
              data-cy={`kpi-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
            />
          ))}
        </div>

        {/* Filters */}
        <ModernCard className="mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Category"
                value={(typeof safeFilters.category === 'string' ? safeFilters.category : '')}
                onChange={handleCategoryFilter}
                options={categoryOptions}
                data-cy="category-filter" data-testid="category-filter"
              />
              <Select
                label="Status"
                value={(typeof safeFilters.status === 'string' ? safeFilters.status : '')}
                onChange={handleStatusFilter}
                options={statusOptions}
                data-cy="status-filter" data-testid="status-filter"
              />
              <Input
                label="Search Metrics"
                placeholder="Search by metric name..."
                data-cy="search-filter"
              />
            </div>
          </div>
        </ModernCard>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Analysis Chart */}
          <ModernCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trend Analysis
              </h3>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                Array.isArray(chartData) && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="current"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="benchmark"
                        stackId="2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No chart data available
                  </div>
                )
              )}
            </div>
          </ModernCard>

          {/* Comparative Analysis Chart */}
          <ModernCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Comparative Analysis
              </h3>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                Array.isArray(data) && data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={(data ?? []).slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="currentValue" fill="#3b82f6" name="Current" />
                      <Bar dataKey="benchmarkValue" fill="#10b981" name="Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No data available for chart
                  </div>
                )
              )}
            </div>
          </ModernCard>
        </div>

        {/* Data Table */}
        <ModernCard>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Benchmarking Details</h3>
          </div>
          <VirtualizedDataGrid
            data={Array.isArray(data) ? data : []}
            columns={columns}
            loading={isLoading}
            height="500px"
            data-cy="benchmarking-table" data-testid="benchmarking-table"
          />
        </ModernCard>
      </div>
    </div>
  );
};

export default BenchmarkingView;


