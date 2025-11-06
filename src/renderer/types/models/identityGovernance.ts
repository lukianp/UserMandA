/**
 * Identity Governance Discovery Types
 */

export type IGDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';

export interface IGDiscoveryConfig {
  id: string;
  name: string;
  tenantId: string;
  includeAccessReviews: boolean;
  includeEntitlements: boolean;
  includePIM: boolean;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: IGDiscoveryStatus;
  accessReviews: AccessReview[];
  entitlementPackages: EntitlementPackage[];
  pimRoles: PIMRole[];
  totalReviewsFound: number;
  errors: IGError[];
  warnings: string[];
}

export interface AccessReview {
  id: string;
  displayName: string;
  description?: string;
  createdDateTime: Date;
  startDateTime: Date;
  endDateTime: Date;
  status: 'notStarted' | 'inProgress' | 'completed' | 'applied';
  scope: { query: string; queryType: string; };
  reviewers: Reviewer[];
  settings: ReviewSettings;
  decisions?: ReviewDecision[];
}

export interface Reviewer {
  query: string;
  queryType: string;
  queryRoot?: string;
}

export interface ReviewSettings {
  mailNotificationsEnabled: boolean;
  reminderNotificationsEnabled: boolean;
  justificationRequiredOnApproval: boolean;
  defaultDecisionEnabled: boolean;
  defaultDecision?: string;
  autoApplyDecisionsEnabled: boolean;
  recommendationsEnabled: boolean;
  recurrence: { pattern: { type: string; interval: number; }; range: { type: string; numberOfOccurrences?: number; }; };
}

export interface ReviewDecision {
  id: string;
  reviewedDateTime?: Date;
  decision: 'approve' | 'deny' | 'dontKnow' | 'notReviewed';
  justification?: string;
  reviewedBy?: { id: string; displayName: string; };
  appliedBy?: { id: string; displayName: string; };
  appliedDateTime?: Date;
  principal: { id: string; displayName: string; };
}

export interface EntitlementPackage {
  id: string;
  displayName: string;
  description?: string;
  isHidden: boolean;
  createdDateTime: Date;
  modifiedDateTime: Date;
  catalog: { id: string; displayName: string; };
  accessPackageResourceRoleScopes: ResourceRoleScope[];
  assignmentPolicies: AssignmentPolicy[];
}

export interface ResourceRoleScope {
  id: string;
  role: { id: string; displayName: string; originSystem: string; };
  scope: { id: string; displayName: string; originSystem: string; };
}

export interface AssignmentPolicy {
  id: string;
  displayName: string;
  description?: string;
  canExtend: boolean;
  durationInDays?: number;
  requestorSettings: { scopeType: string; acceptRequests: boolean; allowedRequestors: any[]; };
  requestApprovalSettings: { isApprovalRequired: boolean; stages: ApprovalStage[]; };
}

export interface ApprovalStage {
  approvalStageTimeOutInDays: number;
  isApproverJustificationRequired: boolean;
  isEscalationEnabled: boolean;
  escalationTimeInMinutes?: number;
  primaryApprovers: any[];
  escalationApprovers: any[];
}

export interface PIMRole {
  id: string;
  roleDefinitionId: string;
  roleName: string;
  principalId: string;
  principalDisplayName: string;
  principalType: string;
  assignmentState: 'eligible' | 'active';
  startDateTime?: Date;
  endDateTime?: Date;
  memberType: 'direct' | 'inherited';
  scope: string;
  justification?: string;
}

export interface IGError {
  timestamp: Date;
  message: string;
}

export interface IGStats {
  totalAccessReviews: number;
  activeReviews: number;
  totalEntitlements: number;
  totalPIMRoles: number;
}

export interface IGFilterState {
  searchText: string;
  selectedStatuses: string[];
}
