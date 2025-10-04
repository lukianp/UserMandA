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

interface MigrationStatusData {
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

      // Execute PowerShell script to get dashboard metrics
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Analytics/DashboardMetrics.psm1',
        functionName: 'Get-ExecutiveDashboardData',
        parameters: {},
      });

      if (result.success && result.data) {
        // Calculate trends (mock calculation - in real app would come from historical data)
        const userTrend = Math.floor(Math.random() * 20) - 5; // -5% to +15%
        const groupTrend = Math.floor(Math.random() * 15) - 3;
        const dataVolumeTrend = Math.floor(Math.random() * 25) - 10;

        // Parse and structure the data
        const data: DashboardData = {
          kpis: {
            totalUsers: result.data.totalUsers || 0,
            totalGroups: result.data.totalGroups || 0,
            dataVolumeTB: result.data.dataVolumeTB || 0,
            estimatedTimelineDays: result.data.estimatedTimelineDays || 0,
            userTrend,
            groupTrend,
            dataVolumeTrend,
          },
          departmentDistribution: result.data.departmentDistribution || [],
          migrationProgress: result.data.migrationProgress || [],
          migrationStatus: calculateStatusBreakdown(result.data.migrationStatus || {}),
          systemHealth: {
            cpuUsage: result.data.systemHealth?.cpuUsage || 0,
            memoryUsage: result.data.systemHealth?.memoryUsage || 0,
            networkStatus: result.data.systemHealth?.networkStatus || 'healthy',
            lastUpdated: new Date(),
          },
        };

        setDashboardData(data);
        setLastRefresh(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
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
