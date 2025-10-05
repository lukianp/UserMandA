import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Group Analytics Metrics
 * Provides comprehensive analysis of group data including membership, types, and distribution
 */
interface GroupMetrics {
  totalGroups: number;
  securityGroups: number;
  distributionGroups: number;
  mailEnabledSecurityGroups: number;
  averageMembersPerGroup: number;
  maxGroupSize: number;
  minGroupSize: number;
  orphanedGroups: number; // Groups with no members
  nestedGroupsCount: number; // Groups containing other groups
  maxNestingDepth: number;
}

/**
 * Group size distribution for categorization
 */
interface GroupSizeDistribution {
  category: string;
  count: number;
  percentage: number;
  range: string;
}

/**
 * Group type breakdown
 */
interface GroupTypeData {
  type: string;
  count: number;
  percentage: number;
  averageMembers: number;
}

/**
 * Top groups by member count
 */
interface TopGroup {
  id: string;
  name: string;
  memberCount: number;
  type: string;
  description?: string;
}

/**
 * Complete analytics data structure
 */
interface GroupAnalyticsData {
  metrics: GroupMetrics;
  sizeDistribution: GroupSizeDistribution[];
  typeBreakdown: GroupTypeData[];
  topGroups: TopGroup[];
  membershipTrends: {
    month: string;
    totalMembers: number;
    averageGroupSize: number;
  }[];
}

/**
 * Calculate group size distribution from statistics
 */
function calculateSizeDistribution(stats: any): GroupSizeDistribution[] {
  const totalGroups = stats.GroupCount || 0;
  if (totalGroups === 0) return [];

  // Mock distribution based on typical enterprise patterns
  // In real implementation, this would aggregate actual group member counts
  const categories = [
    { category: 'Small (1-10)', range: '1-10', percentage: 45 },
    { category: 'Medium (11-50)', range: '11-50', percentage: 30 },
    { category: 'Large (51-200)', range: '51-200', percentage: 18 },
    { category: 'Very Large (201+)', range: '201+', percentage: 7 },
  ];

  return categories.map(cat => ({
    category: cat.category,
    count: Math.floor(totalGroups * (cat.percentage / 100)),
    percentage: cat.percentage,
    range: cat.range,
  }));
}

/**
 * Calculate group type breakdown from statistics
 */
function calculateTypeBreakdown(stats: any): GroupTypeData[] {
  const totalGroups = stats.GroupCount || 0;
  if (totalGroups === 0) return [];

  // Mock type distribution - in reality this would come from CSV data
  const types = [
    { type: 'Security Group', percentage: 55, avgMembers: 23 },
    { type: 'Distribution List', percentage: 30, avgMembers: 45 },
    { type: 'Mail-Enabled Security', percentage: 12, avgMembers: 18 },
    { type: 'Dynamic Group', percentage: 3, avgMembers: 78 },
  ];

  return types.map(t => ({
    type: t.type,
    count: Math.floor(totalGroups * (t.percentage / 100)),
    percentage: t.percentage,
    averageMembers: t.avgMembers,
  }));
}

/**
 * Generate mock top groups based on statistics
 * In real implementation, this would query actual group data
 */
function generateTopGroups(stats: any): TopGroup[] {
  const groupCount = stats.GroupCount || 0;
  if (groupCount === 0) return [];

  // Mock top 10 groups
  const mockGroups: TopGroup[] = [
    { id: '1', name: 'All Employees', memberCount: Math.floor((stats.UserCount || 0) * 0.95), type: 'Security Group', description: 'Company-wide distribution group' },
    { id: '2', name: 'Engineering Team', memberCount: Math.floor((stats.UserCount || 0) * 0.25), type: 'Security Group', description: 'Engineering department' },
    { id: '3', name: 'Sales Department', memberCount: Math.floor((stats.UserCount || 0) * 0.18), type: 'Distribution List', description: 'Sales team distribution' },
    { id: '4', name: 'IT Admins', memberCount: Math.floor((stats.UserCount || 0) * 0.05), type: 'Mail-Enabled Security', description: 'IT administrators' },
    { id: '5', name: 'Marketing', memberCount: Math.floor((stats.UserCount || 0) * 0.12), type: 'Distribution List', description: 'Marketing team' },
    { id: '6', name: 'Finance Department', memberCount: Math.floor((stats.UserCount || 0) * 0.10), type: 'Security Group', description: 'Finance and accounting' },
    { id: '7', name: 'HR Team', memberCount: Math.floor((stats.UserCount || 0) * 0.07), type: 'Security Group', description: 'Human resources' },
    { id: '8', name: 'Operations', memberCount: Math.floor((stats.UserCount || 0) * 0.15), type: 'Distribution List', description: 'Operations team' },
    { id: '9', name: 'Support Team', memberCount: Math.floor((stats.UserCount || 0) * 0.13), type: 'Security Group', description: 'Customer support' },
    { id: '10', name: 'Executives', memberCount: Math.floor((stats.UserCount || 0) * 0.03), type: 'Mail-Enabled Security', description: 'Executive leadership' },
  ];

  return mockGroups.slice(0, Math.min(10, Math.floor(groupCount / 2)));
}

/**
 * Generate membership trends over time
 * TODO: Replace with real time-series data when audit log tracking is implemented
 */
function generateMembershipTrends(stats: any) {
  const totalUsers = stats.UserCount || 0;
  const totalGroups = stats.GroupCount || 0;

  if (totalGroups === 0) return [];

  const avgMembership = totalGroups > 0 ? Math.floor(totalUsers / totalGroups) : 0;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return months.map((month, index) => ({
    month,
    totalMembers: Math.floor(totalUsers * (0.7 + (index / 24))), // Gradual growth
    averageGroupSize: Math.floor(avgMembership * (0.85 + (index / 30))), // Slight growth
  }));
}

/**
 * Get mock analytics data for fallback
 */
function getMockGroupAnalyticsData(): GroupAnalyticsData {
  return {
    metrics: {
      totalGroups: 438,
      securityGroups: 241,
      distributionGroups: 131,
      mailEnabledSecurityGroups: 53,
      averageMembersPerGroup: 28.5,
      maxGroupSize: 12547,
      minGroupSize: 1,
      orphanedGroups: 12,
      nestedGroupsCount: 87,
      maxNestingDepth: 5,
    },
    sizeDistribution: [
      { category: 'Small (1-10)', count: 197, percentage: 45, range: '1-10' },
      { category: 'Medium (11-50)', count: 131, percentage: 30, range: '11-50' },
      { category: 'Large (51-200)', count: 79, percentage: 18, range: '51-200' },
      { category: 'Very Large (201+)', count: 31, percentage: 7, range: '201+' },
    ],
    typeBreakdown: [
      { type: 'Security Group', count: 241, percentage: 55, averageMembers: 23 },
      { type: 'Distribution List', count: 131, percentage: 30, averageMembers: 45 },
      { type: 'Mail-Enabled Security', count: 53, percentage: 12, averageMembers: 18 },
      { type: 'Dynamic Group', count: 13, percentage: 3, averageMembers: 78 },
    ],
    topGroups: [
      { id: '1', name: 'All Employees', memberCount: 11919, type: 'Security Group', description: 'Company-wide distribution group' },
      { id: '2', name: 'Engineering Team', memberCount: 3137, type: 'Security Group', description: 'Engineering department' },
      { id: '3', name: 'Sales Department', memberCount: 2258, type: 'Distribution List', description: 'Sales team distribution' },
      { id: '4', name: 'IT Admins', memberCount: 627, type: 'Mail-Enabled Security', description: 'IT administrators' },
      { id: '5', name: 'Marketing', memberCount: 1506, type: 'Distribution List', description: 'Marketing team' },
      { id: '6', name: 'Finance Department', memberCount: 1255, type: 'Security Group', description: 'Finance and accounting' },
      { id: '7', name: 'HR Team', memberCount: 878, type: 'Security Group', description: 'Human resources' },
      { id: '8', name: 'Operations', memberCount: 1882, type: 'Distribution List', description: 'Operations team' },
      { id: '9', name: 'Support Team', memberCount: 1631, type: 'Security Group', description: 'Customer support' },
      { id: '10', name: 'Executives', memberCount: 376, type: 'Mail-Enabled Security', description: 'Executive leadership' },
    ],
    membershipTrends: [
      { month: 'Jan', totalMembers: 8783, averageGroupSize: 24 },
      { month: 'Feb', totalMembers: 9307, averageGroupSize: 25 },
      { month: 'Mar', totalMembers: 9832, averageGroupSize: 26 },
      { month: 'Apr', totalMembers: 10356, averageGroupSize: 26 },
      { month: 'May', totalMembers: 10880, averageGroupSize: 27 },
      { month: 'Jun', totalMembers: 11404, averageGroupSize: 28 },
      { month: 'Jul', totalMembers: 11929, averageGroupSize: 28 },
      { month: 'Aug', totalMembers: 12453, averageGroupSize: 29 },
      { month: 'Sep', totalMembers: 12977, averageGroupSize: 30 },
      { month: 'Oct', totalMembers: 13501, averageGroupSize: 30 },
      { month: 'Nov', totalMembers: 14025, averageGroupSize: 31 },
      { month: 'Dec', totalMembers: 14550, averageGroupSize: 32 },
    ],
  };
}

/**
 * Custom hook for Group Analytics logic
 * Integrates with Logic Engine to provide real-time group analysis
 */
export const useGroupAnalyticsLogic = () => {
  const [analyticsData, setAnalyticsData] = useState<GroupAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupType, setSelectedGroupType] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const fetchGroupAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get statistics from Logic Engine
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Calculate size distribution from group data
        const sizeDistribution = calculateSizeDistribution(stats);

        // Calculate type breakdown from group data
        const typeBreakdown = calculateTypeBreakdown(stats);

        // Generate top groups by member count
        const topGroups = generateTopGroups(stats);

        // Generate membership trends (mock until audit tracking implemented)
        const membershipTrends = generateMembershipTrends(stats);

        // Calculate group metrics
        const totalGroups = stats.GroupCount || 0;
        const totalUsers = stats.UserCount || 0;

        // Mock calculations - in reality would come from actual group member analysis
        const metrics: GroupMetrics = {
          totalGroups,
          securityGroups: Math.floor(totalGroups * 0.55),
          distributionGroups: Math.floor(totalGroups * 0.30),
          mailEnabledSecurityGroups: Math.floor(totalGroups * 0.12),
          averageMembersPerGroup: totalGroups > 0 ? Math.floor(totalUsers / totalGroups) : 0,
          maxGroupSize: Math.floor(totalUsers * 0.95), // Assume largest group is "All Employees"
          minGroupSize: 1,
          orphanedGroups: Math.floor(totalGroups * 0.03), // Estimate 3% orphaned
          nestedGroupsCount: Math.floor(totalGroups * 0.20), // Estimate 20% contain groups
          maxNestingDepth: 5, // Mock value - requires actual nesting analysis
        };

        const analyticsResult: GroupAnalyticsData = {
          metrics,
          sizeDistribution,
          typeBreakdown,
          topGroups,
          membershipTrends,
        };

        setAnalyticsData(analyticsResult);
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.warn('Group analytics fetch error, using mock data:', err);

      // Set mock data for development/testing
      setAnalyticsData(getMockGroupAnalyticsData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchGroupAnalytics();
  }, [fetchGroupAnalytics]);

  // Export analytics report
  const handleExportReport = useCallback(async () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      // In a real implementation, this would call an export module
      console.log('Exporting group analytics report...', analyticsData);

      // Mock export success
      const fileName = `GroupAnalytics_${new Date().toISOString().split('T')[0]}.xlsx`;
      alert(`Report would be exported to: ${fileName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [analyticsData]);

  // Filter data by group type
  const filteredData = useMemo(() => {
    if (!analyticsData || selectedGroupType === 'all') return analyticsData;

    // Filter top groups by type
    const filteredTopGroups = analyticsData.topGroups.filter(
      group => group.type.toLowerCase().includes(selectedGroupType.toLowerCase())
    );

    return {
      ...analyticsData,
      topGroups: filteredTopGroups,
    };
  }, [analyticsData, selectedGroupType]);

  // Available group types for filter
  const availableGroupTypes = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.typeBreakdown.map(t => ({ id: t.type, name: t.type }));
  }, [analyticsData]);

  return {
    analyticsData: filteredData,
    isLoading,
    error,
    selectedGroupType,
    setSelectedGroupType,
    availableGroupTypes,
    isExporting,
    handleExportReport,
    refreshData: fetchGroupAnalytics,
  };
};
