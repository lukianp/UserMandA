import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { Users, FolderTree, HardDrive, Calendar, RefreshCw, Cpu, MemoryStick, Network } from 'lucide-react';
import { useExecutiveDashboardLogic } from '../../hooks/useExecutiveDashboardLogic';
import { Button } from '../../components/atoms/Button';

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
  'data-cy'?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, suffix, 'data-cy': dataCy }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div
      className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
      data-cy={dataCy}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <div className="text-blue-500 dark:text-blue-400">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {suffix && <span className="text-sm text-gray-500 dark:text-gray-400">{suffix}</span>}
      </div>
      {trend !== undefined && (
        <div
          className={`text-sm mt-2 font-medium ${
            trend > 0 ? 'text-green-600 dark:text-green-400' : trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
          }`}
        >
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

// Loading Skeleton Component
const DashboardSkeleton: React.FC = () => (
  <div className="h-full p-6 space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>
  </div>
);

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          <span className="font-semibold">{(entry.value ?? 0).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const ExecutiveDashboardView: React.FC = () => {
  const {
    dashboardData,
    isLoading,
    error,
    timeSinceRefresh,
    autoRefresh,
    handleRefresh,
    toggleAutoRefresh,
  } = useExecutiveDashboardLogic();

  const isDarkMode = document.documentElement.classList.contains('dark');

  // Chart theme configuration
  const chartTheme = {
    textColor: isDarkMode ? '#f9fafb' : '#1f2937',
    gridColor: isDarkMode ? '#374151' : '#e5e7eb',
    tooltipBg: isDarkMode ? '#374151' : '#ffffff',
  };

  // Color palette for charts
  const COLORS = {
    primary: isDarkMode ? '#60a5fa' : '#3b82f6',
    success: isDarkMode ? '#34d399' : '#10b981',
    warning: isDarkMode ? '#fbbf24' : '#f59e0b',
    danger: isDarkMode ? '#f87171' : '#ef4444',
    neutral: isDarkMode ? '#9ca3af' : '#6b7280',
  };

  // Pie chart colors for migration status
  const PIE_COLORS = [COLORS.success, COLORS.warning, COLORS.danger, COLORS.neutral];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center" data-cy="dashboard-error">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="primary" data-cy="retry-btn">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="executive-dashboard-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Executive Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {timeSinceRefresh}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleAutoRefresh}
            variant={autoRefresh ? 'primary' : 'secondary'}
            size="sm"
            data-cy="auto-refresh-toggle"
          >
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            data-cy="refresh-btn"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Users"
            value={dashboardData.kpis.totalUsers}
            icon={<Users className="w-6 h-6" />}
            trend={dashboardData.kpis.userTrend}
            data-cy="kpi-users"
          />
          <KpiCard
            title="Total Groups"
            value={dashboardData.kpis.totalGroups}
            icon={<FolderTree className="w-6 h-6" />}
            trend={dashboardData.kpis.groupTrend}
            data-cy="kpi-groups"
          />
          <KpiCard
            title="Data Volume"
            value={dashboardData.kpis.(typeof dataVolumeTB === 'number' ? dataVolumeTB : 0).toFixed(1)}
            suffix="TB"
            icon={<HardDrive className="w-6 h-6" />}
            trend={dashboardData.kpis.dataVolumeTrend}
            data-cy="kpi-data-volume"
          />
          <KpiCard
            title="Est. Timeline"
            value={dashboardData.kpis.estimatedTimelineDays}
            suffix="days"
            icon={<Calendar className="w-6 h-6" />}
            data-cy="kpi-timeline"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution by Department */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              User Distribution by Department
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis
                  dataKey="name"
                  stroke={chartTheme.textColor}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke={chartTheme.textColor} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="userCount" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Migration Progress Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Migration Progress Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.migrationProgress}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorGroups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis dataKey="date" stroke={chartTheme.textColor} tick={{ fontSize: 12 }} />
                <YAxis stroke={chartTheme.textColor} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="usersMigrated"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Users Migrated"
                />
                <Area
                  type="monotone"
                  dataKey="groupsMigrated"
                  stroke={COLORS.success}
                  fillOpacity={1}
                  fill="url(#colorGroups)"
                  name="Groups Migrated"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Migration Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Migration Status Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.migrationStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.migrationStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* System Health Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Health</h2>
            <div className="space-y-6">
              {/* CPU Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {dashboardData.systemHealth.cpuUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      dashboardData.systemHealth.cpuUsage > 80
                        ? 'bg-red-500'
                        : dashboardData.systemHealth.cpuUsage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${dashboardData.systemHealth.cpuUsage}%` }}
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {dashboardData.systemHealth.memoryUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      dashboardData.systemHealth.memoryUsage > 80
                        ? 'bg-red-500'
                        : dashboardData.systemHealth.memoryUsage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${dashboardData.systemHealth.memoryUsage}%` }}
                  />
                </div>
              </div>

              {/* Network Status */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Status</span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      dashboardData.systemHealth.networkStatus === 'healthy'
                        ? 'text-green-600 dark:text-green-400'
                        : dashboardData.systemHealth.networkStatus === 'warning'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {dashboardData.systemHealth.networkStatus.charAt(0).toUpperCase() +
                      dashboardData.systemHealth.networkStatus.slice(1)}
                  </span>
                </div>
              </div>

              {/* Last Updated */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last health check: {dashboardData.systemHealth.lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardView;
