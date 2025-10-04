import { useState, useEffect, useMemo, useCallback } from 'react';
import { powerShellService } from '../services/powerShellService';
import { useProfileStore } from '../store/useProfileStore';

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
  const [loadingMessage, setLoadingMessage] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  // Get current profile from store
  const { getCurrentSourceProfile } = useProfileStore();

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setWarnings([]);

      setLoadingMessage('Checking cache and data sources...');

      const selectedProfile = getCurrentSourceProfile();

      // First try cached data (mirror LogicEngineService pattern)
      let analyticsResult: AnalyticsData;
      try {
        analyticsResult = await powerShellService.getCachedResult(
          `user_analytics_${selectedProfile?.id || 'default'}_${dateRange}_${selectedDepartment}`,
          async () => {
            setLoadingMessage('Loading analytics from PowerShell modules...');

            // Try to execute Get-UserAnalyticsData module
            const result = await powerShellService.executeModule<AnalyticsData>(
              'Modules/Analytics/UserAnalytics.psm1',
              'Get-UserAnalyticsData',
              {
                ProfileName: selectedProfile?.companyName || 'Default',
                DateRange: parseInt(dateRange),
                Department: selectedDepartment === 'all' ? null : selectedDepartment,
              }
            );

            return {
              licenseUsage: result.data?.licenseUsage || [],
              departmentBreakdown: calculateDepartmentBreakdown(result.data?.departmentData || {}),
              activityHeatmap: result.data?.activityHeatmap || [],
              metrics: result.data?.metrics || {} as UserActivityMetrics,
            };
          }
        );
      } catch (moduleError) {
        // Fallback to CSV service (mirror C# fallback pattern)
        console.warn('Module execution failed, falling back to CSV:', moduleError);
        setLoadingMessage('Loading analytics from CSV files...');

        try {
          const csvResult = await powerShellService.executeScript<{
            licenseUsage: LicenseUsageData[];
            departmentData: Record<string, number>;
            activityHeatmap: ActivityHeatmapData[];
            metrics: UserActivityMetrics;
            warnings?: string[];
          }>(
            'Scripts/Get-UserAnalyticsFromCsv.ps1',
            {
              ProfilePath: selectedProfile?.dataPath || 'C:\\discoverydata',
              DateRange: parseInt(dateRange),
              Department: selectedDepartment === 'all' ? null : selectedDepartment,
            }
          );

          analyticsResult = {
            licenseUsage: csvResult.data?.licenseUsage || [],
            departmentBreakdown: calculateDepartmentBreakdown(csvResult.data?.departmentData || {}),
            activityHeatmap: csvResult.data?.activityHeatmap || [],
            metrics: csvResult.data?.metrics || {} as UserActivityMetrics,
          };

          // Mirror C# header warnings
          if (csvResult.warnings && csvResult.warnings.length > 0) {
            setWarnings(csvResult.warnings);
          }
        } catch (csvError) {
          console.error('CSV fallback also failed:', csvError);
          // Use mock data as last resort
          analyticsResult = getMockAnalyticsData();
          setWarnings(['PowerShell execution failed. Using mock data.']);
        }
      }

      setAnalyticsData(analyticsResult);
      setLoadingMessage('');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('User analytics fetch error:', err);

      // Set mock data for development/testing
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
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
      const selectedProfile = getCurrentSourceProfile();

      const result = await powerShellService.executeModule<{ filePath: string }>(
        'Modules/Analytics/ExportReport.psm1',
        'Export-UserAnalyticsReport',
        {
          ProfileName: selectedProfile?.companyName || 'Default',
          Data: JSON.stringify(analyticsData),
          DateRange: parseInt(dateRange),
          Department: selectedDepartment,
          Format: 'excel',
        }
      );

      if (result.success && result.data?.filePath) {
        console.log('Report exported successfully:', result.data.filePath);
        alert(`Report exported successfully to ${result.data.filePath}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
      alert(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  }, [analyticsData, dateRange, selectedDepartment]);

  // Export to PDF
  const handleExportPDF = useCallback(async () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      const selectedProfile = getCurrentSourceProfile();

      const result = await powerShellService.executeModule<{ filePath: string }>(
        'Modules/Analytics/ExportReport.psm1',
        'Export-UserAnalyticsReport',
        {
          ProfileName: selectedProfile?.companyName || 'Default',
          Data: JSON.stringify(analyticsData),
          DateRange: parseInt(dateRange),
          Department: selectedDepartment,
          Format: 'pdf',
        }
      );

      if (result.success && result.data?.filePath) {
        console.log('PDF report exported successfully:', result.data.filePath);
        alert(`PDF report exported successfully to ${result.data.filePath}`);
      } else {
        throw new Error('PDF export failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF export failed';
      setError(errorMessage);
      console.error('PDF export error:', err);
      alert(`PDF export failed: ${errorMessage}`);
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
    loadingMessage,
    warnings,
  };
};
