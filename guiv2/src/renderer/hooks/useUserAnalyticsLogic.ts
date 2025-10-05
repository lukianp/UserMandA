import { useState, useEffect, useMemo, useCallback } from 'react';

interface LicenseUsageData {
  licenseName: string;
  assigned: number;
  available: number;
  total: number;
  utilization: number;
}

interface DepartmentBreakdownData {
  name: string;
  value: number;
  percentage: number;
}

interface ActivityHeatmapData {
  day: string;
  hour: number;
  activity: number;
}

interface UserActivityMetrics {
  activeUsers: number;
  inactiveUsers: number;
  averageLoginFrequency: number;
  peakActivityTime: string;
}

interface AnalyticsData {
  licenseUsage: LicenseUsageData[];
  departmentBreakdown: DepartmentBreakdownData[];
  activityHeatmap: ActivityHeatmapData[];
  metrics: UserActivityMetrics;
}

type DateRange = '7' | '30' | '90';

/**
 * Calculate license usage from Logic Engine statistics
 * In a real implementation, this would come from licensing discovery module
 */
function calculateLicenseUsage(stats: any): LicenseUsageData[] {
  const totalUsers = stats.UserCount || 0;
  const mailboxCount = stats.MailboxCount || 0;

  if (totalUsers === 0) return [];

  // Mock license distribution based on user counts
  return [
    {
      licenseName: 'Office 365 E3',
      assigned: Math.floor(totalUsers * 0.68),
      available: Math.floor(totalUsers * 0.12),
      total: Math.floor(totalUsers * 0.80),
      utilization: 85,
    },
    {
      licenseName: 'Office 365 E5',
      assigned: Math.floor(totalUsers * 0.17),
      available: Math.floor(totalUsers * 0.03),
      total: Math.floor(totalUsers * 0.20),
      utilization: 84,
    },
    {
      licenseName: 'Microsoft Teams',
      assigned: Math.floor(totalUsers * 0.89),
      available: Math.floor(totalUsers * 0.07),
      total: Math.floor(totalUsers * 0.96),
      utilization: 93,
    },
    {
      licenseName: 'Power BI Pro',
      assigned: Math.floor(totalUsers * 0.11),
      available: Math.floor(totalUsers * 0.05),
      total: Math.floor(totalUsers * 0.16),
      utilization: 70,
    },
  ];
}

/**
 * Calculate department breakdown from Logic Engine statistics
 * In a real implementation, this would aggregate user department data
 */
function calculateDepartmentBreakdown(stats: any): DepartmentBreakdownData[] {
  const totalUsers = stats.UserCount || 0;
  if (totalUsers === 0) return [];

  // Mock department distribution - in reality this would come from CSV data
  const distribution = [
    { name: 'Sales', percentage: 19 },
    { name: 'Engineering', percentage: 25 },
    { name: 'Marketing', percentage: 12 },
    { name: 'HR', percentage: 7 },
    { name: 'Finance', percentage: 10 },
    { name: 'Operations', percentage: 15 },
    { name: 'Support', percentage: 12 },
  ];

  return distribution.map(dept => ({
    name: dept.name,
    value: Math.floor(totalUsers * (dept.percentage / 100)),
    percentage: dept.percentage,
  }));
}

/**
 * Generate activity heatmap data
 * In a real implementation, this would come from login tracking
 */
function generateActivityHeatmap(): ActivityHeatmapData[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const data: ActivityHeatmapData[] = [];

  days.forEach(day => {
    for (let hour = 0; hour < 24; hour++) {
      let activity = 0;
      // Simulate work hours activity
      if (day !== 'Saturday' && day !== 'Sunday') {
        if (hour >= 8 && hour <= 17) {
          activity = Math.floor(Math.random() * 100) + 50;
        } else if (hour >= 6 && hour <= 20) {
          activity = Math.floor(Math.random() * 50) + 10;
        } else {
          activity = Math.floor(Math.random() * 20);
        }
      } else {
        activity = Math.floor(Math.random() * 30);
      }
      data.push({ day, hour, activity });
    }
  });

  return data;
}

/**
 * Get mock analytics data for fallback
 */
function getMockAnalyticsData(): AnalyticsData {
  return {
    licenseUsage: [
      { licenseName: 'Office 365 E3', assigned: 8500, available: 1500, total: 10000, utilization: 85 },
      { licenseName: 'Office 365 E5', assigned: 2100, available: 400, total: 2500, utilization: 84 },
      { licenseName: 'Microsoft Teams', assigned: 11200, available: 800, total: 12000, utilization: 93 },
      { licenseName: 'Power BI Pro', assigned: 1400, available: 600, total: 2000, utilization: 70 },
    ],
    departmentBreakdown: [
      { name: 'Sales', value: 2340, percentage: 19 },
      { name: 'Engineering', value: 3120, percentage: 25 },
      { name: 'Marketing', value: 1560, percentage: 12 },
      { name: 'HR', value: 890, percentage: 7 },
      { name: 'Finance', value: 1240, percentage: 10 },
      { name: 'Operations', value: 1870, percentage: 15 },
      { name: 'Support', value: 1527, percentage: 12 },
    ],
    activityHeatmap: generateActivityHeatmap(),
    metrics: {
      activeUsers: 10234,
      inactiveUsers: 2313,
      averageLoginFrequency: 4.7,
      peakActivityTime: '10:00 AM - 11:00 AM',
    },
  };
}

export const useUserAnalyticsLogic = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get statistics from Logic Engine
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Calculate license usage from user/mailbox data
        const licenseUsage = calculateLicenseUsage(stats);

        // Calculate department breakdown from user data
        const departmentBreakdown = calculateDepartmentBreakdown(stats);

        // Generate activity heatmap (requires login tracking not yet implemented)
        const activityHeatmap = generateActivityHeatmap();

        // Calculate user activity metrics
        const metrics: UserActivityMetrics = {
          activeUsers: Math.floor((stats.UserCount || 0) * 0.85), // Estimate 85% active
          inactiveUsers: Math.floor((stats.UserCount || 0) * 0.15), // Estimate 15% inactive
          averageLoginFrequency: 4.2, // Mock data - requires login tracking
          peakActivityTime: '10:00 AM - 11:00 AM', // Mock data - requires login tracking
        };

        const analyticsResult: AnalyticsData = {
          licenseUsage,
          departmentBreakdown,
          activityHeatmap,
          metrics,
        };

        setAnalyticsData(analyticsResult);
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('User analytics fetch error:', err);

      // Set mock data for development/testing
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedDepartment]);

  // Initial load
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Export analytics report
  const handleExportReport = useCallback(async () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      // In a real implementation, this would call an export module
      console.log('Exporting analytics report...', analyticsData);

      // Mock export success
      const fileName = `UserAnalytics_${dateRange}days_${new Date().toISOString().split('T')[0]}.xlsx`;
      alert(`Report would be exported to: ${fileName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [analyticsData, dateRange]);

  // Available departments for filter
  const availableDepartments = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.departmentBreakdown.map(d => ({ id: d.name, name: d.name }));
  }, [analyticsData]);

  // Filter data by department
  const filteredData = useMemo(() => {
    if (!analyticsData || selectedDepartment === 'all') return analyticsData;

    // In a real implementation, this would filter the actual data
    // For now, just return all data since we don't have department-level details
    return analyticsData;
  }, [analyticsData, selectedDepartment]);

  return {
    analyticsData: filteredData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    selectedDepartment,
    setSelectedDepartment,
    availableDepartments,
    isExporting,
    handleExportReport,
    refreshData: fetchAnalyticsData,
  };
};
