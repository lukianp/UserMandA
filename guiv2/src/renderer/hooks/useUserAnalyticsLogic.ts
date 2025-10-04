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

      // Execute PowerShell script to get user analytics
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Analytics/UserAnalytics.psm1',
        functionName: 'Get-UserAnalyticsData',
        parameters: {
          dateRange: parseInt(dateRange),
          department: selectedDepartment === 'all' ? null : selectedDepartment,
        },
      });

      if (result.success && result.data) {
        setAnalyticsData({
          licenseUsage: result.data.licenseUsage || [],
          departmentBreakdown: calculateDepartmentBreakdown(result.data.departmentData || {}),
          activityHeatmap: result.data.activityHeatmap || [],
          metrics: result.data.metrics || {},
        });
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data');
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

  // Calculate department breakdown with percentages
  const calculateDepartmentBreakdown = (departmentData: Record<string, number>): DepartmentBreakdownData[] => {
    const total = Object.values(departmentData).reduce((sum, val) => sum + val, 0);
    if (total === 0) return [];

    return Object.entries(departmentData).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
    }));
  };

  // Mock data for development/testing
  const getMockAnalyticsData = (): AnalyticsData => ({
    licenseUsage: [
      { licenseName: 'Office 365 E3', assigned: 8500, available: 1500, total: 10000, utilization: 85 },
      { licenseName: 'Office 365 E5', assigned: 2100, available: 400, total: 2500, utilization: 84 },
      { licenseName: 'Microsoft Teams', assigned: 11200, available: 800, total: 12000, utilization: 93 },
      { licenseName: 'Power BI Pro', assigned: 1400, available: 600, total: 2000, utilization: 70 },
      { licenseName: 'Visio Online', assigned: 650, available: 350, total: 1000, utilization: 65 },
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
    activityHeatmap: generateMockHeatmapData(),
    metrics: {
      activeUsers: 10234,
      inactiveUsers: 2313,
      averageLoginFrequency: 4.7,
      peakActivityTime: '10:00 AM - 11:00 AM',
    },
  });

  // Generate mock heatmap data (day of week x hour)
  function generateMockHeatmapData(): ActivityHeatmapData[] {
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

  // Initial load
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Export analytics report
  const handleExportReport = useCallback(async () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Analytics/ExportReport.psm1',
        functionName: 'Export-UserAnalyticsReport',
        parameters: {
          data: analyticsData,
          dateRange: parseInt(dateRange),
          department: selectedDepartment,
          format: 'excel',
        },
      });

      if (result.success) {
        // Trigger file save dialog
        console.log('Report exported successfully:', result.data.filePath);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [analyticsData, dateRange, selectedDepartment]);

  // Export to PDF
  const handleExportPDF = useCallback(async () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Analytics/ExportReport.psm1',
        functionName: 'Export-UserAnalyticsReport',
        parameters: {
          data: analyticsData,
          dateRange: parseInt(dateRange),
          department: selectedDepartment,
          format: 'pdf',
        },
      });

      if (result.success) {
        console.log('PDF report exported successfully:', result.data.filePath);
      } else {
        throw new Error(result.error || 'PDF export failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF export failed';
      setError(errorMessage);
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [analyticsData, dateRange, selectedDepartment]);

  // Filter license usage data
  const filteredLicenseUsage = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.licenseUsage;
  }, [analyticsData]);

  // Filter department breakdown
  const filteredDepartmentBreakdown = useMemo(() => {
    if (!analyticsData) return [];
    if (selectedDepartment === 'all') return analyticsData.departmentBreakdown;
    return analyticsData.departmentBreakdown.filter(d => d.name === selectedDepartment);
  }, [analyticsData, selectedDepartment]);

  // Get available departments for filter
  const availableDepartments = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.departmentBreakdown.map(d => d.name);
  }, [analyticsData]);

  return {
    analyticsData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    selectedDepartment,
    setSelectedDepartment,
    filteredLicenseUsage,
    filteredDepartmentBreakdown,
    availableDepartments,
    isExporting,
    handleExportReport,
    handleExportPDF,
  };
};
