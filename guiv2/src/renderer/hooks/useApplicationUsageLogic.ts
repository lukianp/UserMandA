import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Application usage metrics
 * Tracks application adoption, licensing, and usage patterns
 */
interface ApplicationMetrics {
  totalApplications: number;
  licensedApplications: number;
  unusedApplications: number;
  averageUsersPerApp: number;
  totalLicenseCost: number;
  wastedLicenseCost: number;
  adoptionRate: number;
}

/**
 * Individual application data
 */
interface ApplicationData {
  id: string;
  name: string;
  vendor: string;
  userCount: number;
  licenseCount: number;
  utilizationRate: number;
  costPerLicense: number;
  totalCost: number;
  category: string;
  lastUsed?: Date;
}

/**
 * Application category distribution
 */
interface CategoryDistribution {
  category: string;
  count: number;
  userCount: number;
  totalCost: number;
  percentage: number;
}

/**
 * License usage trend data
 */
interface LicenseUsageTrend {
  month: string;
  assigned: number;
  active: number;
  unused: number;
}

/**
 * Application adoption metrics
 */
interface AdoptionMetrics {
  appName: string;
  adoptionRate: number;
  targetRate: number;
  userCount: number;
  trend: number; // Percentage change
}

/**
 * Complete application usage analytics
 */
interface ApplicationUsageData {
  metrics: ApplicationMetrics;
  topApplications: ApplicationData[];
  unusedApplications: ApplicationData[];
  categoryDistribution: CategoryDistribution[];
  licenseUsageTrends: LicenseUsageTrend[];
  adoptionMetrics: AdoptionMetrics[];
}

/**
 * Generate application data from Logic Engine statistics
 * In real implementation, this would aggregate application correlation data
 */
function generateApplicationData(stats: any): ApplicationData[] {
  const userCount = stats.UserCount || 0;
  if (userCount === 0) return [];

  // Mock application data based on typical enterprise applications
  const applications: ApplicationData[] = [
    { id: '1', name: 'Microsoft 365', vendor: 'Microsoft', userCount: Math.floor(userCount * 0.95), licenseCount: Math.floor(userCount * 1.0), utilizationRate: 95, costPerLicense: 12, totalCost: Math.floor(userCount * 1.0) * 12, category: 'Productivity' },
    { id: '2', name: 'Slack', vendor: 'Salesforce', userCount: Math.floor(userCount * 0.78), licenseCount: Math.floor(userCount * 0.85), utilizationRate: 92, costPerLicense: 8, totalCost: Math.floor(userCount * 0.85) * 8, category: 'Communication' },
    { id: '3', name: 'Salesforce CRM', vendor: 'Salesforce', userCount: Math.floor(userCount * 0.23), licenseCount: Math.floor(userCount * 0.30), utilizationRate: 77, costPerLicense: 150, totalCost: Math.floor(userCount * 0.30) * 150, category: 'CRM' },
    { id: '4', name: 'Adobe Creative Cloud', vendor: 'Adobe', userCount: Math.floor(userCount * 0.12), licenseCount: Math.floor(userCount * 0.15), utilizationRate: 80, costPerLicense: 55, totalCost: Math.floor(userCount * 0.15) * 55, category: 'Creative' },
    { id: '5', name: 'Zoom', vendor: 'Zoom Video', userCount: Math.floor(userCount * 0.89), licenseCount: Math.floor(userCount * 0.95), utilizationRate: 94, costPerLicense: 15, totalCost: Math.floor(userCount * 0.95) * 15, category: 'Communication' },
    { id: '6', name: 'Jira', vendor: 'Atlassian', userCount: Math.floor(userCount * 0.35), licenseCount: Math.floor(userCount * 0.40), utilizationRate: 88, costPerLicense: 10, totalCost: Math.floor(userCount * 0.40) * 10, category: 'Project Management' },
    { id: '7', name: 'Confluence', vendor: 'Atlassian', userCount: Math.floor(userCount * 0.42), licenseCount: Math.floor(userCount * 0.50), utilizationRate: 84, costPerLicense: 10, totalCost: Math.floor(userCount * 0.50) * 10, category: 'Documentation' },
    { id: '8', name: 'GitHub Enterprise', vendor: 'Microsoft', userCount: Math.floor(userCount * 0.28), licenseCount: Math.floor(userCount * 0.30), utilizationRate: 93, costPerLicense: 21, totalCost: Math.floor(userCount * 0.30) * 21, category: 'Development' },
    { id: '9', name: 'Tableau', vendor: 'Salesforce', userCount: Math.floor(userCount * 0.08), licenseCount: Math.floor(userCount * 0.12), utilizationRate: 67, costPerLicense: 70, totalCost: Math.floor(userCount * 0.12) * 70, category: 'Analytics' },
    { id: '10', name: 'DocuSign', vendor: 'DocuSign', userCount: Math.floor(userCount * 0.18), licenseCount: Math.floor(userCount * 0.25), utilizationRate: 72, costPerLicense: 25, totalCost: Math.floor(userCount * 0.25) * 25, category: 'Document Management' },
    { id: '11', name: 'ServiceNow', vendor: 'ServiceNow', userCount: Math.floor(userCount * 0.15), licenseCount: Math.floor(userCount * 0.20), utilizationRate: 75, costPerLicense: 100, totalCost: Math.floor(userCount * 0.20) * 100, category: 'IT Service Management' },
    { id: '12', name: 'Box', vendor: 'Box', userCount: Math.floor(userCount * 0.05), licenseCount: Math.floor(userCount * 0.15), utilizationRate: 33, costPerLicense: 15, totalCost: Math.floor(userCount * 0.15) * 15, category: 'Storage' },
  ];

  return applications;
}

/**
 * Calculate category distribution from application data
 */
function calculateCategoryDistribution(applications: ApplicationData[]): CategoryDistribution[] {
  const categoryMap = new Map<string, { count: number; userCount: number; totalCost: number }>();

  applications.forEach(app => {
    const existing = categoryMap.get(app.category) || { count: 0, userCount: 0, totalCost: 0 };
    categoryMap.set(app.category, {
      count: existing.count + 1,
      userCount: existing.userCount + app.userCount,
      totalCost: existing.totalCost + app.totalCost,
    });
  });

  const total = applications.length;
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    userCount: data.userCount,
    totalCost: data.totalCost,
    percentage: Math.round((data.count / total) * 100),
  }));
}

/**
 * Generate license usage trends over time
 * TODO: Replace with real time-series data when audit log tracking is implemented
 */
function generateLicenseUsageTrends(applications: ApplicationData[]): LicenseUsageTrend[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const totalLicenses = applications.reduce((sum, app) => sum + app.licenseCount, 0);
  const totalActive = applications.reduce((sum, app) => sum + app.userCount, 0);

  return months.map((month, index) => {
    const growthFactor = 0.7 + (index / 24); // Gradual growth
    return {
      month,
      assigned: Math.floor(totalLicenses * growthFactor),
      active: Math.floor(totalActive * growthFactor),
      unused: Math.floor((totalLicenses - totalActive) * growthFactor),
    };
  });
}

/**
 * Calculate adoption metrics for key applications
 */
function calculateAdoptionMetrics(applications: ApplicationData[]): AdoptionMetrics[] {
  // Focus on top 6 applications
  return applications.slice(0, 6).map(app => ({
    appName: app.name,
    adoptionRate: app.utilizationRate,
    targetRate: 90, // Target 90% utilization
    userCount: app.userCount,
    trend: Math.floor(Math.random() * 20) - 5, // Mock trend -5% to +15%
  }));
}

/**
 * Get mock application usage data for fallback
 */
function getMockApplicationUsageData(): ApplicationUsageData {
  const mockApps = generateApplicationData({ UserCount: 12547 });

  return {
    metrics: {
      totalApplications: 12,
      licensedApplications: 12,
      unusedApplications: 2,
      averageUsersPerApp: 3156,
      totalLicenseCost: 127340,
      wastedLicenseCost: 18920,
      adoptionRate: 82,
    },
    topApplications: mockApps.slice(0, 8).sort((a, b) => b.userCount - a.userCount),
    unusedApplications: mockApps.filter(app => app.utilizationRate < 50),
    categoryDistribution: calculateCategoryDistribution(mockApps),
    licenseUsageTrends: generateLicenseUsageTrends(mockApps),
    adoptionMetrics: calculateAdoptionMetrics(mockApps),
  };
}

/**
 * Custom hook for Application Usage analytics
 * Integrates with Logic Engine to provide application correlation data
 */
export const useApplicationUsageLogic = () => {
  const [usageData, setUsageData] = useState<ApplicationUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'userCount' | 'utilizationRate' | 'totalCost'>('userCount');
  const [isExporting, setIsExporting] = useState(false);

  const fetchApplicationUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get statistics from Logic Engine
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Generate application data from user correlations
        const applications = generateApplicationData(stats);

        // Calculate metrics
        const totalApps = applications.length;
        const licensedApps = applications.filter(app => app.licenseCount > 0).length;
        const unusedApps = applications.filter(app => app.utilizationRate < 50);
        const totalUserAssignments = applications.reduce((sum, app) => sum + app.userCount, 0);
        const totalLicenses = applications.reduce((sum, app) => sum + app.licenseCount, 0);
        const totalCost = applications.reduce((sum, app) => sum + app.totalCost, 0);
        const wastedCost = applications.reduce((sum, app) => {
          const unused = app.licenseCount - app.userCount;
          return sum + (unused > 0 ? unused * app.costPerLicense : 0);
        }, 0);

        const metrics: ApplicationMetrics = {
          totalApplications: totalApps,
          licensedApplications: licensedApps,
          unusedApplications: unusedApps.length,
          averageUsersPerApp: totalApps > 0 ? Math.floor(totalUserAssignments / totalApps) : 0,
          totalLicenseCost: totalCost,
          wastedLicenseCost: wastedCost,
          adoptionRate: totalLicenses > 0 ? Math.round((totalUserAssignments / totalLicenses) * 100) : 0,
        };

        const usageResult: ApplicationUsageData = {
          metrics,
          topApplications: applications.slice().sort((a, b) => b.userCount - a.userCount).slice(0, 8),
          unusedApplications: unusedApps,
          categoryDistribution: calculateCategoryDistribution(applications),
          licenseUsageTrends: generateLicenseUsageTrends(applications),
          adoptionMetrics: calculateAdoptionMetrics(applications),
        };

        setUsageData(usageResult);
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.warn('Application usage fetch error, using mock data:', err);

      // Set mock data for development/testing
      setUsageData(getMockApplicationUsageData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchApplicationUsage();
  }, [fetchApplicationUsage]);

  // Export analytics report
  const handleExportReport = useCallback(async () => {
    if (!usageData) return;

    setIsExporting(true);
    try {
      console.log('Exporting application usage report...', usageData);
      const fileName = `ApplicationUsage_${new Date().toISOString().split('T')[0]}.xlsx`;
      alert(`Report would be exported to: ${fileName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [usageData]);

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!usageData) return null;

    let filtered = usageData.topApplications;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Sort by selected field
    filtered = filtered.slice().sort((a, b) => {
      switch (sortBy) {
        case 'userCount':
          return b.userCount - a.userCount;
        case 'utilizationRate':
          return b.utilizationRate - a.utilizationRate;
        case 'totalCost':
          return b.totalCost - a.totalCost;
        default:
          return 0;
      }
    });

    return {
      ...usageData,
      topApplications: filtered,
    };
  }, [usageData, selectedCategory, sortBy]);

  // Available categories for filter
  const availableCategories = useMemo(() => {
    if (!usageData) return [];
    return usageData.categoryDistribution.map(cat => ({ id: cat.category, name: cat.category }));
  }, [usageData]);

  return {
    usageData: processedData,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    availableCategories,
    isExporting,
    handleExportReport,
    refreshData: fetchApplicationUsage,
  };
};
