import { useState, useEffect, useMemo, useCallback } from 'react';

interface KpiMetrics {
  totalUsers: number;
  totalGroups: number;
  dataVolumeTB: number;
  estimatedTimelineDays: number;
  userTrend: number;
  groupTrend: number;
  dataVolumeTrend: number;
}

interface DepartmentData {
  name: string;
  userCount: number;
}

interface MigrationProgressData {
  date: string;
  usersMigrated: number;
  groupsMigrated: number;
}

interface MigrationStatusData extends Record<string, unknown> {
  name: string;
  value: number;
  percentage: number;
}

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  networkStatus: 'healthy' | 'warning' | 'error';
  lastUpdated: Date;
}

interface DashboardData {
  kpis: KpiMetrics;
  departmentDistribution: DepartmentData[];
  migrationProgress: MigrationProgressData[];
  migrationStatus: MigrationStatusData[];
  systemHealth: SystemHealth;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Build department distribution from statistics
 * In a real implementation, this would aggregate actual user department data
 */
function buildDepartmentDistribution(stats: any): DepartmentData[] {
  const totalUsers = stats.UserCount || 0;
  if (totalUsers === 0) return [];

  // Mock distribution percentages - in reality this would come from CSV data
  return [
    { name: 'Sales', userCount: Math.floor(totalUsers * 0.18) },
    { name: 'Engineering', userCount: Math.floor(totalUsers * 0.25) },
    { name: 'Marketing', userCount: Math.floor(totalUsers * 0.12) },
    { name: 'HR', userCount: Math.floor(totalUsers * 0.07) },
    { name: 'Finance', userCount: Math.floor(totalUsers * 0.10) },
    { name: 'Operations', userCount: Math.floor(totalUsers * 0.15) },
    { name: 'Support', userCount: Math.floor(totalUsers * 0.13) },
  ];
}

/**
 * Build migration progress timeline from statistics
 * In a real implementation, this would come from migration tracking data
 */
function buildMigrationProgress(stats: any): MigrationProgressData[] {
  const totalUsers = stats.UserCount || 0;
  const totalGroups = stats.GroupCount || 0;

  // Mock 6-week migration timeline
  const now = new Date();
  const weeks = 6;
  const data: MigrationProgressData[] = [];

  for (let i = 0; i < weeks; i++) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - (weeks - i - 1) * 7);

    const progressPct = (i + 1) / weeks;
    data.push({
      date: weekDate.toISOString().split('T')[0],
      usersMigrated: Math.floor(totalUsers * progressPct * 0.8), // 80% completion
      groupsMigrated: Math.floor(totalGroups * progressPct * 0.85), // 85% completion
    });
  }

  return data;
}

/**
 * Build migration status breakdown from statistics
 * In a real implementation, this would come from migration state tracking
 */
function buildMigrationStatus(stats: any): MigrationStatusData[] {
  const totalUsers = stats.UserCount || 0;
  if (totalUsers === 0) return [];

  // Mock status distribution
  const completed = Math.floor(totalUsers * 0.81);
  const inProgress = Math.floor(totalUsers * 0.12);
  const failed = Math.floor(totalUsers * 0.03);
  const pending = totalUsers - completed - inProgress - failed;

  const total = totalUsers;

  return [
    {
      name: 'Completed',
      value: completed,
      percentage: Math.round((completed / total) * 100),
    },
    {
      name: 'In Progress',
      value: inProgress,
      percentage: Math.round((inProgress / total) * 100),
    },
    {
      name: 'Failed',
      value: failed,
      percentage: Math.round((failed / total) * 100),
    },
    {
      name: 'Pending',
      value: pending,
      percentage: Math.round((pending / total) * 100),
    },
  ].filter(item => item.value > 0);
}

export const useExecutiveDashboardLogic = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get statistics from Logic Engine
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Calculate trends (mock calculation - in real app would come from historical data)
        const userTrend = Math.floor(Math.random() * 20) - 5; // -5% to +15%
        const groupTrend = Math.floor(Math.random() * 15) - 3;
        const dataVolumeTrend = Math.floor(Math.random() * 25) - 10;

        // Estimate data volume from mailbox data (rough estimate)
        // In a real implementation, this would come from file share discovery
        const estimatedDataVolumeTB = (stats.MailboxCount || 0) * 0.005; // Assume 5GB per mailbox avg

        // Estimate timeline based on complexity (rough heuristic)
        const totalEntities = (stats.UserCount || 0) + (stats.GroupCount || 0) + (stats.DeviceCount || 0);
        const estimatedTimelineDays = Math.ceil(totalEntities / 300); // Assume 300 entities per day

        // Build department distribution from user data
        // In a real implementation, this would aggregate user department data
        const departmentDistribution = buildDepartmentDistribution(stats);

        // Build migration progress timeline (mock data for now)
        const migrationProgress = buildMigrationProgress(stats);

        // Build migration status breakdown (mock data for now)
        const migrationStatus = buildMigrationStatus(stats);

        // Parse and structure the data
        const data: DashboardData = {
          kpis: {
            totalUsers: stats.UserCount || 0,
            totalGroups: stats.GroupCount || 0,
            dataVolumeTB: estimatedDataVolumeTB,
            estimatedTimelineDays,
            userTrend,
            groupTrend,
            dataVolumeTrend,
          },
          departmentDistribution,
          migrationProgress,
          migrationStatus,
          systemHealth: {
            cpuUsage: Math.floor(Math.random() * 60) + 20, // Mock CPU usage
            memoryUsage: Math.floor(Math.random() * 50) + 30, // Mock memory usage
            networkStatus: 'healthy',
            lastUpdated: new Date(),
          },
        };

        setDashboardData(data);
        setLastRefresh(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);

      // Set mock data for development/testing
      setDashboardData(getMockDashboardData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate migration status breakdown with percentages
  const calculateStatusBreakdown = (statusData: any): MigrationStatusData[] => {
    const total = (statusData.completed || 0) + (statusData.inProgress || 0) +
                  (statusData.failed || 0) + (statusData.pending || 0);

    if (total === 0) return [];

    return [
      {
        name: 'Completed',
        value: statusData.completed || 0,
        percentage: Math.round(((statusData.completed || 0) / total) * 100),
      },
      {
        name: 'In Progress',
        value: statusData.inProgress || 0,
        percentage: Math.round(((statusData.inProgress || 0) / total) * 100),
      },
      {
        name: 'Failed',
        value: statusData.failed || 0,
        percentage: Math.round(((statusData.failed || 0) / total) * 100),
      },
      {
        name: 'Pending',
        value: statusData.pending || 0,
        percentage: Math.round(((statusData.pending || 0) / total) * 100),
      },
    ].filter(item => item.value > 0);
  };

  // Mock data for development/testing
  const getMockDashboardData = (): DashboardData => ({
    kpis: {
      totalUsers: 12547,
      totalGroups: 438,
      dataVolumeTB: 2.7,
      estimatedTimelineDays: 45,
      userTrend: 8.5,
      groupTrend: 3.2,
      dataVolumeTrend: -2.1,
    },
    departmentDistribution: [
      { name: 'Sales', userCount: 2340 },
      { name: 'Engineering', userCount: 3120 },
      { name: 'Marketing', userCount: 1560 },
      { name: 'HR', userCount: 890 },
      { name: 'Finance', userCount: 1240 },
      { name: 'Operations', userCount: 1870 },
      { name: 'Support', userCount: 1527 },
    ],
    migrationProgress: [
      { date: '2025-09-01', usersMigrated: 1200, groupsMigrated: 45 },
      { date: '2025-09-08', usersMigrated: 2800, groupsMigrated: 98 },
      { date: '2025-09-15', usersMigrated: 4500, groupsMigrated: 156 },
      { date: '2025-09-22', usersMigrated: 6700, groupsMigrated: 234 },
      { date: '2025-09-29', usersMigrated: 8900, groupsMigrated: 312 },
      { date: '2025-10-03', usersMigrated: 10200, groupsMigrated: 378 },
    ],
    migrationStatus: [
      { name: 'Completed', value: 10200, percentage: 81 },
      { name: 'In Progress', value: 1500, percentage: 12 },
      { name: 'Failed', value: 347, percentage: 3 },
      { name: 'Pending', value: 500, percentage: 4 },
    ],
    systemHealth: {
      cpuUsage: 45,
      memoryUsage: 62,
      networkStatus: 'healthy',
      lastUpdated: new Date(),
    },
  });

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Format time since last refresh
  const timeSinceRefresh = useMemo(() => {
    const seconds = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }, [lastRefresh]);

  return {
    dashboardData,
    isLoading,
    error,
    lastRefresh,
    timeSinceRefresh,
    autoRefresh,
    handleRefresh,
    toggleAutoRefresh,
  };
};
