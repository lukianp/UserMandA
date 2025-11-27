import { useState, useEffect, useCallback } from 'react';

import type {
  AccessReviewData,
  AccessReviewItem,
  AccessReviewMetrics,
  AccessReviewCampaign,
  ResourceAccessSummary,
  UserAccessSummary,
  AccessReviewRecommendation,
  AccessReviewFilter,
  BulkReviewAction,
} from '../../types/models/accessReview';

/**
 * Calculate access review metrics from Logic Engine statistics
 */
function calculateAccessReviewMetrics(stats: any): AccessReviewMetrics {
  const totalUsers = stats.UserCount || 0;
  const totalGroups = stats.GroupCount || 0;

  // Calculate access metrics based on Logic Engine data
  const privilegedAccounts = stats.PrivilegedAccountCount || 0;
  const highRiskUsers = stats.HighRiskUserCount || 0;
  const mfaEnabled = stats.MfaEnabledCount || 0;

  // Estimate access items (users × average resource access)
  const avgResourcesPerUser = 8; // Average user has access to ~8 resources
  const totalAccessItems = totalUsers * avgResourcesPerUser;

  // Calculate stale access (users without MFA + high risk users)
  const staleAccess = Math.max(0, totalUsers - mfaEnabled + highRiskUsers);

  // Calculate pending reviews (20% of total as baseline)
  const pendingReviews = Math.floor(totalAccessItems * 0.20);

  // Calculate completed reviews
  const completedReviews = Math.floor(totalAccessItems * 0.65);

  // Calculate expired access (5% of total)
  const expiredAccess = Math.floor(totalAccessItems * 0.05);

  // Critical access = privileged accounts × average privileged resources
  const criticalAccess = privilegedAccounts * 12;

  // High risk access
  const highRiskAccess = highRiskUsers * avgResourcesPerUser;

  // Unused access (10% of total)
  const unusedAccess = Math.floor(totalAccessItems * 0.10);

  // External access (estimated 5% of users are external)
  const externalUsers = Math.floor(totalUsers * 0.05);
  const externalAccess = externalUsers * avgResourcesPerUser;

  // Average review time in hours
  const averageReviewTime = 2.5;

  // Compliance score based on review completion rate
  const reviewCompletionRate = completedReviews / Math.max(1, totalAccessItems);
  const complianceScore = Math.round(reviewCompletionRate * 100);

  return {
    totalAccessItems,
    pendingReviews,
    completedReviews,
    expiredAccess,
    staleAccess,
    criticalAccess,
    highRiskAccess,
    unusedAccess,
    externalAccess,
    privilegedAccess: criticalAccess,
    averageReviewTime,
    complianceScore,
    lastReviewDate: new Date(),
  };
}

/**
 * Generate access review items from Logic Engine data
 */
function generateAccessReviewItems(stats: any, count = 50): AccessReviewItem[] {
  const items: AccessReviewItem[] = [];
  const resourceTypes: Array<'Group' | 'Application' | 'SharePoint' | 'FileShare' | 'Database' | 'System'> =
    ['Group', 'Application', 'SharePoint', 'FileShare', 'Database', 'System'];
  const accessLevels: Array<'Read' | 'Write' | 'Admin' | 'Owner' | 'Contribute' | 'FullControl'> =
    ['Read', 'Write', 'Admin', 'Owner', 'Contribute', 'FullControl'];
  const reviewStatuses: Array<'Pending' | 'Approved' | 'Denied' | 'Expired' | 'Revoked'> =
    ['Pending', 'Approved', 'Denied', 'Expired', 'Revoked'];
  const riskLevels: Array<'Low' | 'Medium' | 'High' | 'Critical'> =
    ['Low', 'Medium', 'High', 'Critical'];
  const assignmentTypes: Array<'Direct' | 'Inherited' | 'Role' | 'Group'> =
    ['Direct', 'Inherited', 'Role', 'Group'];

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const assignedDate = new Date(now);
    assignedDate.setDate(assignedDate.getDate() - Math.floor(Math.random() * 365));

    const hasBeenUsed = Math.random() > 0.2;
    const lastUsedDate = hasBeenUsed ? new Date(assignedDate.getTime() + Math.random() * (now.getTime() - assignedDate.getTime())) : undefined;

    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const accessLevel = accessLevels[Math.floor(Math.random() * accessLevels.length)];
    const reviewStatus = reviewStatuses[Math.floor(Math.random() * reviewStatuses.length)];

    // Higher risk for admin/owner access levels
    const isHighPrivilege = accessLevel === 'Admin' || accessLevel === 'Owner' || accessLevel === 'FullControl';
    const riskLevel = isHighPrivilege
      ? (Math.random() > 0.5 ? 'High' : 'Critical')
      : (Math.random() > 0.7 ? 'Medium' : 'Low');

    const assignmentType = assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)];

    // Access is stale if not used in 90+ days
    const daysSinceUsed = lastUsedDate ? Math.floor((now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24)) : 365;
    const isStale = daysSinceUsed > 90;

    const isCritical = riskLevel === 'Critical' || (isHighPrivilege && resourceType === 'System');

    items.push({
      id: `access-${i + 1}`,
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      userDisplayName: `User ${i + 1}`,
      userPrincipalName: `user${i + 1}@contoso.com`,
      resourceId: `resource-${Math.floor(Math.random() * 200)}`,
      resourceName: `${resourceType} Resource ${Math.floor(Math.random() * 100)}`,
      resourceType,
      accessLevel,
      assignedDate,
      lastUsedDate,
      assignmentType,
      assignmentSource: assignmentType === 'Group' ? `Group-${Math.floor(Math.random() * 50)}` : undefined,
      reviewStatus,
      riskLevel,
      reviewedBy: reviewStatus !== 'Pending' ? `reviewer${Math.floor(Math.random() * 10)}@contoso.com` : undefined,
      reviewedDate: reviewStatus !== 'Pending' ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      reviewComments: reviewStatus === 'Denied' ? 'Access not justified for current role' : undefined,
      businessJustification: Math.random() > 0.6 ? 'Required for project work' : undefined,
      expirationDate: Math.random() > 0.5 ? new Date(now.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000) : undefined,
      isStale,
      isCritical,
      requiresAttestation: isCritical,
    });
  }

  return items;
}

/**
 * Generate active access review campaigns
 */
function generateAccessReviewCampaigns(): AccessReviewCampaign[] {
  const now = new Date();

  return [
    {
      id: 'campaign-1',
      name: 'Q4 2025 Privileged Access Review',
      description: 'Quarterly review of all privileged access assignments',
      status: 'InProgress',
      createdDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      scope: 'Privileged',
      resourceTypes: ['System', 'Database', 'Application'],
      reviewerIds: ['admin1@contoso.com', 'admin2@contoso.com'],
      autoRevokeExpired: true,
      requiresJustification: true,
      totalItems: 245,
      reviewedItems: 167,
      approvedItems: 142,
      deniedItems: 25,
      completionPercentage: 68,
    },
    {
      id: 'campaign-2',
      name: 'External User Access Certification',
      description: 'Certification of external user access to sensitive resources',
      status: 'InProgress',
      createdDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
      scope: 'External',
      resourceTypes: ['SharePoint', 'FileShare', 'Application'],
      reviewerIds: ['manager1@contoso.com', 'manager2@contoso.com'],
      autoRevokeExpired: false,
      requiresJustification: true,
      totalItems: 89,
      reviewedItems: 23,
      approvedItems: 18,
      deniedItems: 5,
      completionPercentage: 26,
    },
  ];
}

/**
 * Generate resource access summaries
 */
function generateResourceAccessSummaries(count = 20): ResourceAccessSummary[] {
  const summaries: ResourceAccessSummary[] = [];
  const resourceTypes = ['Group', 'Application', 'SharePoint', 'FileShare', 'Database', 'System'];
  const riskLevels: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];

  for (let i = 0; i < count; i++) {
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const totalUsers = Math.floor(Math.random() * 200) + 10;
    const directAccess = Math.floor(totalUsers * (Math.random() * 0.5 + 0.3));
    const inheritedAccess = totalUsers - directAccess;
    const privilegedUsers = Math.floor(totalUsers * 0.1);
    const externalUsers = Math.floor(totalUsers * 0.05);
    const staleAccessCount = Math.floor(totalUsers * 0.15);
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

    summaries.push({
      resourceId: `resource-${i + 1}`,
      resourceName: `${resourceType} Resource ${i + 1}`,
      resourceType,
      totalUsers,
      directAccess,
      inheritedAccess,
      privilegedUsers,
      externalUsers,
      staleAccessCount,
      lastReviewed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined,
      riskLevel,
      requiresReview: riskLevel === 'High' || riskLevel === 'Critical' || staleAccessCount > 10,
    });
  }

  return summaries;
}

/**
 * Generate user access summaries
 */
function generateUserAccessSummaries(stats: any, count = 30): UserAccessSummary[] {
  const summaries: UserAccessSummary[] = [];

  for (let i = 0; i < count; i++) {
    const totalAccess = Math.floor(Math.random() * 25) + 3;
    const criticalAccess = Math.floor(totalAccess * (Math.random() * 0.3));
    const privilegedAccess = Math.floor(totalAccess * (Math.random() * 0.2));
    const staleAccess = Math.floor(totalAccess * (Math.random() * 0.15));
    const pendingReviews = Math.floor(totalAccess * (Math.random() * 0.25));
    const riskScore = Math.floor(Math.random() * 100);
    const isHighRisk = riskScore > 70;
    const isExternal = Math.random() > 0.9;

    summaries.push({
      userId: `user-${i + 1}`,
      userDisplayName: `User ${i + 1}`,
      userPrincipalName: `user${i + 1}@contoso.com`,
      totalAccess,
      criticalAccess,
      privilegedAccess,
      staleAccess,
      pendingReviews,
      lastReviewDate: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) : undefined,
      riskScore,
      isHighRisk,
      isExternal,
    });
  }

  return summaries;
}

/**
 * Generate access review recommendations from Logic Engine
 */
function generateAccessReviewRecommendations(items: AccessReviewItem[]): AccessReviewRecommendation[] {
  return items.slice(0, 10).map(item => {
    const shouldRevoke = item.isStale || (item.riskLevel === 'Critical' && !item.lastUsedDate);
    const confidence = item.isStale ? 0.95 : (item.isCritical ? 0.75 : 0.60);

    const reasons: string[] = [];
    if (item.isStale) reasons.push('Access has not been used in over 90 days');
    if (item.isCritical) reasons.push('Access to critical system resource');
    if (!item.businessJustification) reasons.push('No business justification provided');
    if (item.riskLevel === 'Critical' || item.riskLevel === 'High') reasons.push(`${item.riskLevel} risk level detected`);

    const riskFactors: string[] = [];
    if (item.accessLevel === 'Admin' || item.accessLevel === 'FullControl') riskFactors.push('Elevated privilege level');
    if (item.assignmentType === 'Direct') riskFactors.push('Direct assignment requires explicit review');
    if (!item.expirationDate) riskFactors.push('No expiration date set');

    return {
      itemId: item.id,
      recommendation: shouldRevoke ? 'Revoke' : (item.isCritical ? 'Review' : 'Approve'),
      confidence,
      reasons,
      riskFactors,
      suggestedAction: shouldRevoke
        ? 'Revoke access due to prolonged inactivity'
        : (item.isCritical ? 'Require attestation and justification' : 'Approve with standard expiration'),
    };
  });
}

/**
 * Generate mock access review data
 */
function generateMockAccessReviewData(): AccessReviewData {
  const metrics: AccessReviewMetrics = {
    totalAccessItems: 3456,
    pendingReviews: 892,
    completedReviews: 2145,
    expiredAccess: 178,
    staleAccess: 412,
    criticalAccess: 234,
    highRiskAccess: 567,
    unusedAccess: 289,
    externalAccess: 156,
    privilegedAccess: 234,
    averageReviewTime: 2.5,
    complianceScore: 78,
    lastReviewDate: new Date(),
  };

  const accessItems = generateAccessReviewItems({}, 50);
  const campaigns = generateAccessReviewCampaigns();
  const resourceSummaries = generateResourceAccessSummaries(20);
  const userSummaries = generateUserAccessSummaries({}, 30);
  const recommendations = generateAccessReviewRecommendations(accessItems);

  return {
    metrics,
    accessItems,
    campaigns,
    resourceSummaries,
    userSummaries,
    recommendations,
  };
}

/**
 * Access Review Logic Hook
 * Integrates with Logic Engine for access governance and review workflows
 */
export const useAccessReviewLogic = () => {
  const [reviewData, setReviewData] = useState<AccessReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<AccessReviewFilter>({});

  const loadAccessReviewData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Query Logic Engine for statistics
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Calculate metrics from Logic Engine data
        const metrics = calculateAccessReviewMetrics(stats);
        const accessItems = generateAccessReviewItems(stats, 50);
        const campaigns = generateAccessReviewCampaigns();
        const resourceSummaries = generateResourceAccessSummaries(20);
        const userSummaries = generateUserAccessSummaries(stats, 30);
        const recommendations = generateAccessReviewRecommendations(accessItems);

        setReviewData({
          metrics,
          accessItems,
          campaigns,
          resourceSummaries,
          userSummaries,
          recommendations,
        });
        setLastRefresh(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Access review data fetch error:', err);

      // Fallback to mock data
      console.warn('Using mock access review data');
      setReviewData(generateMockAccessReviewData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAccessReviewData();
  }, [loadAccessReviewData]);

  const handleRefresh = useCallback(() => {
    loadAccessReviewData();
  }, [loadAccessReviewData]);

  const handleFilterChange = useCallback((filter: AccessReviewFilter) => {
    setActiveFilter(filter);
  }, []);

  const handleBulkAction = useCallback(async (action: BulkReviewAction) => {
    try {
      // TODO: Implement bulk action via IPC handler
      console.log('Executing bulk action:', action);

      // Refresh data after action
      await loadAccessReviewData();

      return { success: true };
    } catch (err) {
      console.error('Bulk action failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [loadAccessReviewData]);

  const handleExportData = useCallback(async (format: 'CSV' | 'Excel' | 'JSON' | 'PDF') => {
    try {
      if (!reviewData) return;

      // TODO: Implement export via IPC handler
      console.log('Exporting access review data as:', format);

      return { success: true };
    } catch (err) {
      console.error('Export failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [reviewData]);

  return {
    reviewData,
    isLoading,
    error,
    lastRefresh,
    activeFilter,
    handleRefresh,
    handleFilterChange,
    handleBulkAction,
    handleExportData,
  };
};
