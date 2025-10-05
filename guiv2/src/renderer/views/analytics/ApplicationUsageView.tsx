/**
 * Application Usage View
 *
 * Comprehensive analysis of application usage including:
 * - License utilization and cost analysis
 * - Application adoption rates
 * - Top applications by user count
 * - Unused/underutilized applications
 * - Category distribution
 * - Usage trends over time
 */

import React from 'react';
import { RefreshCw, Download, Package, TrendingUp, DollarSign, AlertTriangle, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApplicationUsageLogic } from '../../hooks/useApplicationUsageLogic';
import Button from '../../components/atoms/Button';
import Select from '../../components/atoms/Select';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

/**
 * Format currency
 */
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
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
  trend?: number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, subtitle, variant = 'default' }) => {
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
          {trend !== undefined && (
            <p className={`text-xs mt-2 flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'}
            </p>
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
 * Application Usage View Component
 */
export const ApplicationUsageView: React.FC = () => {
  const {
    usageData,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    availableCategories,
    isExporting,
    handleExportReport,
    refreshData,
  } = useApplicationUsageLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !usageData) {
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

  const { metrics, topApplications, unusedApplications, categoryDistribution, licenseUsageTrends, adoptionMetrics } = usageData;

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto" data-cy="application-usage-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Usage Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analysis of application adoption, licensing, and cost optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-48"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-48"
          >
            <option value="userCount">Sort by Users</option>
            <option value="utilizationRate">Sort by Utilization</option>
            <option value="totalCost">Sort by Cost</option>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Applications"
          value={formatNumber(metrics.totalApplications)}
          icon={<Package className="w-6 h-6" />}
          subtitle="Licensed applications"
        />
        <MetricCard
          title="Total License Cost"
          value={formatCurrency(metrics.totalLicenseCost)}
          icon={<DollarSign className="w-6 h-6" />}
          subtitle="Annual licensing cost"
          variant="default"
        />
        <MetricCard
          title="Overall Adoption"
          value={`${metrics.adoptionRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          subtitle="License utilization rate"
          variant={metrics.adoptionRate >= 80 ? 'success' : metrics.adoptionRate >= 60 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Wasted Cost"
          value={formatCurrency(metrics.wastedLicenseCost)}
          icon={<AlertTriangle className="w-6 h-6" />}
          subtitle="Unused license cost"
          variant="danger"
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Licensed Apps"
          value={formatNumber(metrics.licensedApplications)}
          icon={<Package className="w-6 h-6" />}
          subtitle="Applications with licenses"
          variant="success"
        />
        <MetricCard
          title="Underutilized Apps"
          value={formatNumber(metrics.unusedApplications)}
          icon={<AlertTriangle className="w-6 h-6" />}
          subtitle="Applications <50% utilized"
          variant="warning"
        />
        <MetricCard
          title="Avg Users per App"
          value={formatNumber(metrics.averageUsersPerApp)}
          icon={<BarChart3 className="w-6 h-6" />}
          subtitle="Average user assignments"
        />
        <MetricCard
          title="Cost Optimization"
          value={`${Math.round((metrics.wastedLicenseCost / metrics.totalLicenseCost) * 100)}%`}
          icon={<DollarSign className="w-6 h-6" />}
          subtitle="Potential savings"
          variant="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Application Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={categoryDistribution}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.category}: ${entry.count}`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* License Usage Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            License Usage Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={licenseUsageTrends}>
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
              <Line type="monotone" dataKey="assigned" stroke="#3b82f6" strokeWidth={2} name="Assigned" />
              <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Active" />
              <Line type="monotone" dataKey="unused" stroke="#ef4444" strokeWidth={2} name="Unused" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            * Trend data is currently simulated. Real time-series data will be available when audit log tracking is implemented.
          </p>
        </div>
      </div>

      {/* Application Adoption Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Application Adoption Rates
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={adoptionMetrics}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
            <XAxis
              dataKey="appName"
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
            <Bar dataKey="adoptionRate" fill="#3b82f6" name="Current Adoption %" />
            <Bar dataKey="targetRate" fill="#10b981" name="Target %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Applications Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Top Applications by User Count
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Application</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Vendor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Category</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Users</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Licenses</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Utilization</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Annual Cost</th>
              </tr>
            </thead>
            <tbody>
              {topApplications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{app.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{app.vendor}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{app.category}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                    {formatNumber(app.userCount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                    {formatNumber(app.licenseCount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      app.utilizationRate >= 80
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : app.utilizationRate >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {app.utilizationRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(app.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Underutilized Applications */}
      {unusedApplications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 border-l-yellow-500">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Underutilized Applications (Optimization Opportunities)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Application</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Users</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Licenses</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Utilization</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Wasted Cost</th>
                </tr>
              </thead>
              <tbody>
                {unusedApplications.map((app) => {
                  const wastedLicenses = app.licenseCount - app.userCount;
                  const wastedCost = wastedLicenses * app.costPerLicense;
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{app.name}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatNumber(app.userCount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatNumber(app.licenseCount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          {app.utilizationRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-red-600 dark:text-red-400 font-semibold">
                        {formatCurrency(wastedCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            These applications have utilization rates below 50%. Consider redistributing or reducing licenses to optimize costs.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationUsageView;
