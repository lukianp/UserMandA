import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, FileText, Calendar, Filter, Users, UserCheck, UserX, Clock } from 'lucide-react';

import { useUserAnalyticsLogic } from '../../hooks/useUserAnalyticsLogic';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';

// Statistics Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  'data-cy'?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, 'data-cy': dataCy }) => (
  <div
    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    data-cy={dataCy}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  </div>
);

// Loading Skeleton
const AnalyticsSkeleton: React.FC = () => (
  <div className="h-full p-6 space-y-6 animate-pulse">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>
  </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          <span className="font-semibold">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// Activity Heatmap Component
const ActivityHeatmap: React.FC<{ data: any[] }> = ({ data }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getActivityColor = (activity: number) => {
    if (activity >= 80) return 'bg-green-600';
    if (activity >= 60) return 'bg-green-500';
    if (activity >= 40) return 'bg-yellow-500';
    if (activity >= 20) return 'bg-orange-500';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pt-6">
            {days.map(day => (
              <div key={day} className="h-4 flex items-center text-xs text-gray-600 dark:text-gray-400 w-20">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 mb-1">
              {hours.map(hour => (
                <div key={hour} className="w-4 text-xs text-gray-600 dark:text-gray-400 text-center">
                  {hour % 6 === 0 ? hour : ''}
                </div>
              ))}
            </div>
            {days.map(day => (
              <div key={day} className="flex gap-1">
                {hours.map(hour => {
                  const item = (data ?? []).find(d => d.day === day && d.hour === hour);
                  const activity = item?.activity || 0;
                  return (
                    <div
                      key={hour}
                      className={`w-4 h-4 rounded-sm ${getActivityColor(activity)} transition-all hover:scale-125 cursor-pointer`}
                      title={`${day} ${hour}:00 - Activity: ${activity}%`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm" />
            <div className="w-4 h-4 bg-orange-500 rounded-sm" />
            <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
            <div className="w-4 h-4 bg-green-500 rounded-sm" />
            <div className="w-4 h-4 bg-green-600 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

const UserAnalyticsView: React.FC = () => {
  const {
    analyticsData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    selectedDepartment,
    setSelectedDepartment,
    availableDepartments,
    isExporting,
    handleExportReport,
    refreshData,
  } = useUserAnalyticsLogic();

  const isDarkMode = document.documentElement.classList.contains('dark');

  // Compute filtered data from analyticsData
  const filteredLicenseUsage = analyticsData?.licenseUsage || [];
  const filteredDepartmentBreakdown = analyticsData?.departmentBreakdown || [];

  // Chart theme
  const chartTheme = {
    textColor: isDarkMode ? '#f9fafb' : '#1f2937',
    gridColor: isDarkMode ? '#374151' : '#e5e7eb',
  };

  // Color palette
  const COLORS = {
    primary: isDarkMode ? '#60a5fa' : '#3b82f6',
    success: isDarkMode ? '#34d399' : '#10b981',
    warning: isDarkMode ? '#fbbf24' : '#f59e0b',
    danger: isDarkMode ? '#f87171' : '#ef4444',
    purple: isDarkMode ? '#a78bfa' : '#8b5cf6',
    pink: isDarkMode ? '#f472b6' : '#ec4899',
    teal: isDarkMode ? '#2dd4bf' : '#14b8a6',
  };

  const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.pink, COLORS.teal, COLORS.danger];

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center" data-cy="analytics-error" data-testid="analytics-error">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="user-analytics-view" data-testid="user-analytics-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Analytics</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-32 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
              data-cy="date-range-select" data-testid="date-range-select"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-40 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
              data-cy="department-filter" data-testid="department-filter"
            >
              <option value="all">All Departments</option>
              {availableDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleExportReport}
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            disabled={isExporting}
            data-cy="export-excel-btn" data-testid="export-excel-btn"
          >
            Export Excel
          </Button>
          <Button
            onClick={() => console.log('Export PDF')}
            variant="secondary"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            disabled={isExporting}
            data-cy="export-pdf-btn" data-testid="export-pdf-btn"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Users"
            value={analyticsData.metrics.activeUsers}
            icon={<UserCheck className="w-6 h-6 text-white" />}
            color="bg-green-500"
            data-cy="stat-active-users" data-testid="stat-active-users"
          />
          <StatCard
            title="Inactive Users"
            value={analyticsData.metrics.inactiveUsers}
            icon={<UserX className="w-6 h-6 text-white" />}
            color="bg-red-500"
            data-cy="stat-inactive-users" data-testid="stat-inactive-users"
          />
          <StatCard
            title="Avg. Login Frequency"
            value={`${analyticsData.metrics.averageLoginFrequency}/week`}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            data-cy="stat-login-frequency" data-testid="stat-login-frequency"
          />
          <StatCard
            title="Peak Activity Time"
            value={analyticsData.metrics.peakActivityTime}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            data-cy="stat-peak-time" data-testid="stat-peak-time"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* License Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">License Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredLicenseUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis dataKey="licenseName" stroke={chartTheme.textColor} angle={-30} textAnchor="end" height={100} />
                <YAxis stroke={chartTheme.textColor} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="assigned" stackId="a" fill={COLORS.primary} name="Assigned" radius={[0, 0, 0, 0]} />
                <Bar dataKey="available" stackId="a" fill={COLORS.success} name="Available" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
              {filteredLicenseUsage.map((license, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{license.licenseName}</p>
                  <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${
                        license.utilization >= 90
                          ? 'bg-red-500'
                          : license.utilization >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${license.utilization}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1">{license.utilization}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Department Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filteredDepartmentBreakdown as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredDepartmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity Heatmap</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              User activity by day and time (last {dateRange} days)
            </p>
            <ActivityHeatmap data={analyticsData.activityHeatmap} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsView;
