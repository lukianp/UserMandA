/**
 * Group Analytics View
 *
 * Comprehensive analysis of group data including:
 * - Group type distribution (Security, Distribution, Mail-Enabled)
 * - Group size distribution and statistics
 * - Top groups by member count
 * - Membership trends over time
 * - Orphaned groups detection
 * - Nested group analysis
 */

import { RefreshCw, Download, Users, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useGroupAnalyticsLogic } from '../../hooks/useGroupAnalyticsLogic';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
  trend?: number;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <p className={`text-xs mt-2 flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'}
          </p>
        )}
      </div>
      <div className="ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);

/**
 * Group Analytics View Component
 */
export const GroupAnalyticsView: React.FC = () => {
  const {
    analyticsData,
    isLoading,
    error,
    selectedGroupType,
    setSelectedGroupType,
    availableGroupTypes,
    isExporting,
    handleExportReport,
    refreshData,
  } = useGroupAnalyticsLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Unknown error occurred'}</p>
          <Button onClick={refreshData} icon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { metrics, sizeDistribution, typeBreakdown, topGroups, membershipTrends } = analyticsData;

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto" data-cy="group-analytics-view" data-testid="group-analytics-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analysis of group distribution, membership, and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedGroupType}
            onChange={(value) => setSelectedGroupType(value)}
            className="w-48"
            options={[
              { value: 'all', label: 'All Group Types' },
              ...availableGroupTypes.map(type => ({ value: type.id, label: type.name }))
            ]}
          />
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Groups"
          value={formatNumber(metrics.totalGroups)}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          subtitle="All group objects"
        />
        <MetricCard
          title="Security Groups"
          value={formatNumber(metrics.securityGroups)}
          icon={<Users className="w-6 h-6 text-green-600" />}
          subtitle={`${Math.round((metrics.securityGroups / metrics.totalGroups) * 100)}% of total`}
        />
        <MetricCard
          title="Avg Members/Group"
          value={(typeof metrics?.averageMembersPerGroup === 'number' ? metrics.averageMembersPerGroup : 0).toFixed(1)}
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
          subtitle="Average membership size"
        />
        <MetricCard
          title="Orphaned Groups"
          value={formatNumber(metrics.orphanedGroups)}
          icon={<Users className="w-6 h-6 text-red-600" />}
          subtitle="Groups with no members"
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Distribution Groups"
          value={formatNumber(metrics.distributionGroups)}
          icon={<Users className="w-6 h-6 text-orange-600" />}
          subtitle={`${Math.round((metrics.distributionGroups / metrics.totalGroups) * 100)}% of total`}
        />
        <MetricCard
          title="Mail-Enabled Security"
          value={formatNumber(metrics.mailEnabledSecurityGroups)}
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          subtitle={`${Math.round((metrics.mailEnabledSecurityGroups / metrics.totalGroups) * 100)}% of total`}
        />
        <MetricCard
          title="Nested Groups"
          value={formatNumber(metrics.nestedGroupsCount)}
          icon={<BarChart3 className="w-6 h-6 text-teal-600" />}
          subtitle={`Max depth: ${metrics.maxNestingDepth} levels`}
        />
        <MetricCard
          title="Largest Group"
          value={formatNumber(metrics.maxGroupSize)}
          icon={<Users className="w-6 h-6 text-pink-600" />}
          subtitle="Members in largest group"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Type Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Group Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={typeBreakdown}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.type}: ${entry.count}`}
              >
                {typeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Group Size Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Group Size Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sizeDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis
                dataKey="category"
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
              <Bar dataKey="count" fill="#3b82f6" name="Group Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Membership Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Membership Trends Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={membershipTrends}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis
              dataKey="month"
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
            <Line
              type="monotone"
              dataKey="totalMembers"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Members"
            />
            <Line
              type="monotone"
              dataKey="averageGroupSize"
              stroke="#10b981"
              strokeWidth={2}
              name="Avg Group Size"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          * Trend data is currently simulated. Real time-series data will be available when audit log tracking is implemented.
        </p>
      </div>

      {/* Top Groups Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top Groups by Member Count
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Rank</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Group Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Members</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Description</th>
              </tr>
            </thead>
            <tbody>
              {topGroups.map((group, index) => (
                <tr
                  key={group.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">#{index + 1}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{group.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{group.type}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                    {formatNumber(group.memberCount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{group.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Type Breakdown Details */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Group Type Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {typeBreakdown.map((type, index) => (
            <div
              key={type.type}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ borderLeftWidth: '4px', borderLeftColor: COLORS[index % COLORS.length] }}
            >
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{type.type}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatNumber(type.count)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {type.percentage}% of total
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Avg: {type.averageMembers} members
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupAnalyticsView;
