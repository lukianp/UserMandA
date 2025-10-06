/**
 * Trend Analysis View
 *
 * Comprehensive trend analysis including:
 * - Multi-metric trend visualization
 * - Historical comparisons
 * - Forecasting and projections
 * - Correlation analysis
 * - Period-over-period analysis
 */

import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Download, Minus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTrendAnalysisLogic } from '../../hooks/useTrendAnalysisLogic';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Trend Summary Card Component
 */
interface TrendSummaryCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  projection30Days?: number;
  projection90Days?: number;
}

const TrendSummaryCard: React.FC<TrendSummaryCardProps> = ({
  title,
  currentValue,
  previousValue,
  change,
  changePercentage,
  trend,
  projection30Days,
  projection90Days,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">{title}</h3>
        {getTrendIcon()}
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(currentValue)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Value</p>
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium ${getTrendColor()}`}>
          <span>{change >= 0 ? '+' : ''}{formatNumber(change)}</span>
          <span>({changePercentage >= 0 ? '+' : ''}{changePercentage}%)</span>
        </div>
        {projection30Days !== undefined && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">30-Day Projection</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(projection30Days)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Trend Analysis View Component
 */
export const TrendAnalysisView: React.FC = () => {
  const {
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
    refreshData,
  } = useTrendAnalysisLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !trendData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Trends</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Unknown error occurred'}</p>
          <Button onClick={refreshData} icon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { primaryTrend, comparativeTrends, summaries, correlations } = trendData;

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto" data-cy="trend-analysis-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trend Analysis</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Analyze trends, forecast growth, and identify patterns over time
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedMetric}
            onChange={(value) => setSelectedMetric(value as any)}
            className="w-48"
          >
            <option value="users">Users</option>
            <option value="groups">Groups</option>
            <option value="devices">Devices</option>
            <option value="mailboxes">Mailboxes</option>
            <option value="storage">Storage (GB)</option>
          </Select>
          <Select
            value={timeRange}
            onChange={(value) => setTimeRange(value as any)}
            className="w-40"
          >
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
            <option value="90days">90 Days</option>
            <option value="12months">12 Months</option>
          </Select>
          <Button
            variant="secondary"
            onClick={refreshData}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            onClick={handleExportReport}
            loading={isExporting}
            icon={<Download className="w-4 h-4" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaries.map((summary) => (
          <TrendSummaryCard
            key={summary.metric}
            title={getMetricLabel(summary.metric as any)}
            currentValue={summary.currentValue}
            previousValue={summary.previousValue}
            change={summary.change}
            changePercentage={summary.changePercentage}
            trend={summary.trend}
            projection30Days={summary.metric === selectedMetric ? summary.projection30Days : undefined}
            projection90Days={summary.metric === selectedMetric ? summary.projection90Days : undefined}
          />
        ))}
      </div>

      {/* Primary Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {getMetricLabel(selectedMetric)} Trend - {timeRange.replace('days', ' Days').replace('months', ' Months')}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={primaryTrend}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis
              dataKey="date"
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return timeRange === '12months'
                  ? date.toLocaleDateString([], { month: 'short' })
                  : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              }}
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
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorValue)"
              name="Actual"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorTarget)"
              name="Target"
            />
            {primaryTrend.some(p => p.forecast) && (
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="8 4"
                name="Forecast"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          * Trend data is currently simulated based on Logic Engine statistics. Real time-series data will be available when audit log tracking is implemented.
        </p>
      </div>

      {/* Comparative Analysis */}
      {comparativeTrends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Comparative Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparativeTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="period"
                className="text-xs fill-gray-600 dark:fill-gray-400"
                tick={{ fill: 'currentColor' }}
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
              <Bar dataKey="previous" fill="#94a3b8" name="Previous Period" />
              <Bar dataKey="current" fill="#3b82f6" name="Current Period" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparativeTrends.map((trend) => (
              <div key={trend.period} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{trend.period}</p>
                <p className={`text-lg font-bold mt-2 ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.change >= 0 ? '+' : ''}{formatNumber(trend.change)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {trend.changePercentage >= 0 ? '+' : ''}{trend.changePercentage}% change
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Analysis */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Metric Correlations</h3>
        <div className="space-y-4">
          {correlations.map((corr, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {corr.metric1} ↔ {corr.metric2}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        corr.correlation >= 0.8 ? 'bg-green-600' :
                        corr.correlation >= 0.5 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${corr.correlation * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                    {(corr.correlation * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{corr.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          * Correlations are calculated from current statistics. Historical correlation tracking requires audit log implementation.
        </p>
      </div>

      {/* Projections Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Growth Projections</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Metric</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Current</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">30-Day Projection</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">90-Day Projection</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr
                  key={summary.metric}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    {getMetricLabel(summary.metric as any)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                    {formatNumber(summary.currentValue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatNumber(summary.projection30Days)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatNumber(summary.projection90Days)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {summary.trend === 'increasing' && <TrendingUp className="w-5 h-5 text-green-600 inline" />}
                    {summary.trend === 'decreasing' && <TrendingDown className="w-5 h-5 text-red-600 inline" />}
                    {summary.trend === 'stable' && <Minus className="w-5 h-5 text-gray-600 inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Projections use simple linear extrapolation based on current trend data. More sophisticated forecasting requires historical data collection.
        </p>
      </div>
    </div>
  );
};

export default TrendAnalysisView;
