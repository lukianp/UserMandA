/**
 * Group Detail Type Definitions
 *
 * Comprehensive group detail projection with correlated data across all discovery modules.
 * Mirrors C# GroupDetailProjection pattern from UserDetailProjection.
 *
 * Epic 1 Task 1.4: GroupsView Detail Implementation
 */

import { UserData } from './user';
import { GroupData } from './group';
import { ApplicationData } from './application';

/**
 * Group Member Data
 * Users who are members of this group
 */
export interface GroupMemberData {
  id: string;
  userPrincipalName: string;
  displayName: string;
  email: string | null;
  memberType: 'Direct' | 'Nested' | 'Dynamic';
  addedDate: Date | string | null;
  department: string | null;
  jobTitle: string | null;
  accountEnabled: boolean;
}

/**
 * Group Owner Data
 * Users or groups who own/manage this group
 */
export interface GroupOwnerData {
  id: string;
  displayName: string;
  type: 'User' | 'Group' | 'ServicePrincipal';
  userPrincipalName: string | null;
  email: string | null;
  ownershipType: 'Primary' | 'Secondary';
  assignedDate: Date | string | null;
}

/**
 * Group Permission Data
 * Permissions and roles assigned to this group
 */
export interface GroupPermissionData {
  resourceType: string; // e.g., "SharePoint Site", "Exchange Mailbox", "Azure Subscription"
  resourceName: string;
  permissionLevel: string; // e.g., "Full Control", "Contribute", "Owner"
  scope: string | null;
  inherited: boolean;
  assignedDate: Date | string | null;
  assignedBy: string | null;
  source: 'Azure' | 'ActiveDirectory' | 'Exchange' | 'SharePoint' | 'Custom';
}

/**
 * Group Application Access
 * Applications this group has access to
 */
export interface GroupApplicationAccess {
  applicationId: string;
  applicationName: string;
  accessLevel: string; // e.g., "Read", "Write", "Admin"
  roles: string[];
  grantedDate: Date | string | null;
  grantedBy: string | null;
  source: 'Azure' | 'ActiveDirectory' | 'Custom';
  isConditionalAccess: boolean;
  conditions: string[];
}

/**
 * Nested Group Data
 * Child and parent group relationships
 */
export interface NestedGroupData {
  groupId: string;
  groupName: string;
  relationshipType: 'Parent' | 'Child';
  groupType: string;
  scope: string | null;
  memberCount: number | null;
  nestingLevel: number; // 1 = direct child/parent, 2 = grandchild/grandparent, etc.
  addedDate: Date | string | null;
}

/**
 * Group Policy Assignment
 * Group Policies linked to this group
 */
export interface GroupPolicyAssignment {
  policyName: string;
  policyGuid: string;
  policyType: 'User' | 'Computer' | 'Both';
  enabled: boolean;
  linkedOu: string | null;
  order: number | null;
  enforced: boolean;
  appliesTo: string | null;
}

/**
 * Group Risk Item
 */
export interface GroupRiskItem {
  type: string; // e.g., "OverprivilegedGroup", "StaleGroup", "ShadowAdmin"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
  detectedAt: Date | string;
  category: 'Security' | 'Compliance' | 'Configuration' | 'Governance';
  remediation: string | null;
  affectedMembers: string[];
  affectedResources: string[];
}

/**
 * Group Migration Hint
 */
export interface GroupMigrationHint {
  category: string; // e.g., "Membership", "Permissions", "NestedGroups"
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  actionRequired: boolean;
  impact: 'High' | 'Medium' | 'Low' | null;
  complexity: 'High' | 'Medium' | 'Low' | null;
  estimatedEffort: string | null;
  dependencies: string[];
}

/**
 * Group Sync Status
 * For hybrid (AD + Azure AD) groups
 */
export interface GroupSyncStatus {
  isSynced: boolean;
  lastSyncTime: Date | string | null;
  syncSource: 'ActiveDirectory' | 'AzureAD' | 'Manual' | null;
  syncErrors: string[];
  deltaChanges: number;
  syncEnabled: boolean;
}

/**
 * Group Detail Projection
 *
 * Complete group data with all correlated entities.
 * This is the primary data structure returned by LogicEngineService.getGroupDetailAsync().
 *
 * 6 tab structure: Overview, Members, Owners, Permissions, Applications, Nested Groups
 */
export interface GroupDetailProjection {
  // Core Group Data
  group: GroupData;

  // Tab 1: Overview (Summary Information)
  overview: {
    memberCount: number;
    ownerCount: number;
    permissionCount: number;
    applicationCount: number;
    nestedGroupCount: number;
    createdDate: Date | string | null;
    modifiedDate: Date | string | null;
    description: string | null;
    notes: string | null;
    isHybrid: boolean;
    isDynamic: boolean;
    dynamicMembershipRule: string | null;
  };

  // Tab 2: Members
  members: GroupMemberData[];

  // Tab 3: Owners
  owners: GroupOwnerData[];

  // Tab 4: Permissions
  permissions: GroupPermissionData[];

  // Tab 5: Applications
  applications: GroupApplicationAccess[];

  // Tab 6: Nested Groups
  nestedGroups: NestedGroupData[];

  // Additional correlated data
  policies: GroupPolicyAssignment[];
  risks: GroupRiskItem[];
  migrationHints: GroupMigrationHint[];
  syncStatus: GroupSyncStatus | null;

  // Computed Properties
  directMembers: string[]; // UPNs of direct members
  allMembers: string[]; // UPNs including nested members
  primaryOwner: string | null; // UPN of primary owner
  allOwners: string[]; // UPNs of all owners
  parentGroups: string[]; // Names of parent groups
  childGroups: string[]; // Names of child groups

  // Statistics
  stats?: GroupDetailStats;
}

/**
 * Group Detail Statistics
 */
export interface GroupDetailStats {
  totalMembers: number;
  totalOwners: number;
  totalPermissions: number;
  totalApplications: number;
  totalNestedGroups: number;
  totalRisks: number;
  highRiskCount: number;
  criticalRiskCount: number;
  activeMembers: number; // Members who have signed in recently
  staleMembers: number; // Members who haven't signed in for 90+ days
  securityScore: number; // 0-100
}

/**
 * Group Detail Load Options
 */
export interface GroupDetailLoadOptions {
  groupId: string;
  includeMembers?: boolean;
  includeOwners?: boolean;
  includePermissions?: boolean;
  includeApplications?: boolean;
  includeNestedGroups?: boolean;
  includePolicies?: boolean;
  includeRisks?: boolean;
  includeMigrationHints?: boolean;
  includeSyncStatus?: boolean;
  forceRefresh?: boolean; // Skip cache
}

/**
 * Group Detail Export Format
 */
export type GroupDetailExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

/**
 * Group Detail Export Options
 */
export interface GroupDetailExportOptions {
  format: GroupDetailExportFormat;
  fileName?: string;
  includeOverview?: boolean;
  includeMembers?: boolean;
  includeOwners?: boolean;
  includePermissions?: boolean;
  includeApplications?: boolean;
  includeNestedGroups?: boolean;
  includeRisks?: boolean;
  includeMigrationHints?: boolean;
  includeCharts?: boolean; // For PDF/Excel exports
  includeSummary?: boolean;
}
