/**
 * Access Review Type Definitions
 * Enterprise-grade access review and certification system
 */

/**
 * Access review item representing a user's access to a resource
 */
export interface AccessReviewItem {
  id: string;
  userId: string;
  userDisplayName: string;
  userPrincipalName: string;
  resourceId: string;
  resourceName: string;
  resourceType: 'Group' | 'Application' | 'SharePoint' | 'FileShare' | 'Database' | 'System';
  accessLevel: 'Read' | 'Write' | 'Admin' | 'Owner' | 'Contribute' | 'FullControl';
  assignedDate: Date;
  lastUsedDate?: Date;
  assignmentType: 'Direct' | 'Inherited' | 'Role' | 'Group';
  assignmentSource?: string;
  reviewStatus: 'Pending' | 'Approved' | 'Denied' | 'Expired' | 'Revoked';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reviewedBy?: string;
  reviewedDate?: Date;
  reviewComments?: string;
  businessJustification?: string;
  expirationDate?: Date;
  isStale: boolean;
  isCritical: boolean;
  requiresAttestation: boolean;
}

/**
 * Access review campaign
 */
export interface AccessReviewCampaign {
  id: string;
  name: string;
  description: string;
  status: 'Draft' | 'InProgress' | 'Completed' | 'Cancelled';
  createdDate: Date;
  startDate: Date;
  endDate: Date;
  scope: 'AllUsers' | 'HighRisk' | 'Privileged' | 'External' | 'Custom';
  resourceTypes: string[];
  reviewerIds: string[];
  autoRevokeExpired: boolean;
  requiresJustification: boolean;
  totalItems: number;
  reviewedItems: number;
  approvedItems: number;
  deniedItems: number;
  completionPercentage: number;
}

/**
 * Access review metrics for dashboard
 */
export interface AccessReviewMetrics {
  totalAccessItems: number;
  pendingReviews: number;
  completedReviews: number;
  expiredAccess: number;
  staleAccess: number;
  criticalAccess: number;
  highRiskAccess: number;
  unusedAccess: number;
  externalAccess: number;
  privilegedAccess: number;
  averageReviewTime: number;
  complianceScore: number;
  lastReviewDate?: Date;
}

/**
 * Resource access summary
 */
export interface ResourceAccessSummary {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  totalUsers: number;
  directAccess: number;
  inheritedAccess: number;
  privilegedUsers: number;
  externalUsers: number;
  staleAccessCount: number;
  lastReviewed?: Date;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  requiresReview: boolean;
}

/**
 * User access summary
 */
export interface UserAccessSummary {
  userId: string;
  userDisplayName: string;
  userPrincipalName: string;
  totalAccess: number;
  criticalAccess: number;
  privilegedAccess: number;
  staleAccess: number;
  pendingReviews: number;
  lastReviewDate?: Date;
  riskScore: number;
  isHighRisk: boolean;
  isExternal: boolean;
}

/**
 * Access review filter options
 */
export interface AccessReviewFilter {
  reviewStatus?: string[];
  riskLevel?: string[];
  resourceType?: string[];
  accessLevel?: string[];
  assignmentType?: string[];
  isStale?: boolean;
  isCritical?: boolean;
  requiresAttestation?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  searchText?: string;
}

/**
 * Bulk review action
 */
export interface BulkReviewAction {
  action: 'Approve' | 'Deny' | 'Revoke' | 'Extend' | 'RequestJustification';
  itemIds: string[];
  comments?: string;
  newExpirationDate?: Date;
}

/**
 * Access review recommendation from Logic Engine
 */
export interface AccessReviewRecommendation {
  itemId: string;
  recommendation: 'Approve' | 'Deny' | 'Review' | 'Revoke';
  confidence: number;
  reasons: string[];
  riskFactors: string[];
  suggestedAction: string;
}

/**
 * Export options for access review data
 */
export interface AccessReviewExportOptions {
  format: 'CSV' | 'Excel' | 'JSON' | 'PDF';
  includeMetrics: boolean;
  includeRecommendations: boolean;
  includeCampaignDetails: boolean;
  filterOptions?: AccessReviewFilter;
}

/**
 * Complete access review data structure
 */
export interface AccessReviewData {
  metrics: AccessReviewMetrics;
  accessItems: AccessReviewItem[];
  campaigns: AccessReviewCampaign[];
  resourceSummaries: ResourceAccessSummary[];
  userSummaries: UserAccessSummary[];
  recommendations: AccessReviewRecommendation[];
}


