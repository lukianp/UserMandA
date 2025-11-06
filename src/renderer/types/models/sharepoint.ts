/**
 * SharePoint Discovery Type Definitions
 * Defines all types for SharePoint Online and On-Premises discovery
 */

// ============================================================================
// Core SharePoint Types
// ============================================================================

export type SiteTemplate =
  | 'STS#0' // Team Site
  | 'STS#3' // Team Site (no Office 365 group)
  | 'SITEPAGEPUBLISHING#0' // Communication Site
  | 'GROUP#0' // Modern Team Site
  | 'TEAMCHANNEL#0' // Teams Channel Site
  | 'BDR#0' // Document Center
  | 'DEV#0' // Developer Site
  | 'PROJECTSITE#0'; // Project Site

export type PermissionLevel =
  | 'Full Control'
  | 'Design'
  | 'Edit'
  | 'Contribute'
  | 'Read'
  | 'View Only'
  | 'Limited Access';

export interface SharePointSite {
  id: string;
  url: string;
  title: string;
  description: string;
  template: string;
  templateName: SiteTemplate;

  // Ownership
  owner: string;
  ownerEmail: string;
  siteAdmins: string[];

  // Storage
  storageUsage: number; // MB
  storageQuota: number; // MB
  storageWarningLevel: number; // MB

  // Settings
  isHubSite: boolean;
  hubSiteId?: string;
  sensitivityLabel?: string;
  classification?: string;
  groupId?: string; // For Office 365 Group-connected sites

  // Features
  sharingCapability: 'Disabled' | 'ExternalUserSharingOnly' | 'ExternalUserAndGuestSharing' | 'ExistingExternalUserSharingOnly';
  externalSharingEnabled: boolean;
  allowDownloadingNonWebViewableFiles: boolean;
  conditionalAccessPolicy: 'AllowFullAccess' | 'AllowLimitedAccess' | 'BlockAccess';

  // Subsites
  subsiteCount: number;
  subsites: SharePointSubsite[];

  // Lists and libraries
  listCount: number;
  documentLibraryCount: number;
  lists: SharePointList[];

  // Activity
  lastItemModifiedDate?: Date;
  lastItemUserModifiedDate?: Date;
  pageViews?: number;
  uniqueVisitors?: number;

  // Metadata
  created: Date;
  modified: Date;
  timeZoneId: number;
  lcid: number; // Locale ID
}

export interface SharePointSubsite {
  id: string;
  url: string;
  title: string;
  template: string;
  storageUsage: number;
  listCount: number;
  created: Date;
}

export interface SharePointList {
  id: string;
  title: string;
  description: string;
  siteUrl: string;
  listUrl: string;
  baseTemplate: number;
  baseType: 'GenericList' | 'DocumentLibrary' | 'DiscussionBoard' | 'Survey' | 'Issue';

  // Content
  itemCount: number;
  folderCount: number;
  documentCount: number;
  totalFileSize: number; // bytes

  // Versioning
  enableVersioning: boolean;
  majorVersionLimit?: number;
  minorVersionLimit?: number;

  // Content types
  contentTypesEnabled: boolean;
  contentTypes: string[];

  // Permissions
  hasUniquePermissions: boolean;
  permissions: SharePointPermission[];

  // Features
  enableFolderCreation: boolean;
  enableAttachments: boolean;
  enableModeration: boolean;
  requireCheckout: boolean;

  // Metadata
  created: Date;
  modified: Date;
  lastItemModifiedDate?: Date;
  lastItemDeletedDate?: Date;

  // Views
  defaultViewUrl: string;
  viewCount: number;
}

export interface SharePointPermission {
  id: string;
  principalType: 'User' | 'SecurityGroup' | 'SharePointGroup';
  principalId: string;
  principalName: string;
  principalEmail?: string;
  permissionLevel: PermissionLevel;
  permissionLevels: string[]; // Can have multiple
  directPermission: boolean; // false if inherited
  scope: 'Site' | 'List' | 'Item' | 'Folder';
  scopeUrl: string;
}

export interface SharePointContentType {
  id: string;
  name: string;
  description: string;
  group: string;
  isBuiltIn: boolean;
  sealed: boolean;
  hidden: boolean;
  readOnly: boolean;
  parentId?: string;
  fieldCount: number;
}

export interface SharePointColumn {
  id: string;
  internalName: string;
  displayName: string;
  type: string;
  required: boolean;
  indexed: boolean;
  hidden: boolean;
  readOnly: boolean;
  choices?: string[];
  defaultValue?: string;
}

export interface SharePointWorkflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  associationType: 'List' | 'Site' | 'ContentType';
  associationUrl: string;
  instanceCount: number;
  runningInstanceCount: number;
  workflowTemplate: string;
}

// ============================================================================
// Discovery Configuration
// ============================================================================

export interface SharePointDiscoveryConfig {
  // What to discover
  discoverSites: boolean;
  discoverLists: boolean;
  discoverPermissions: boolean;
  discoverContentTypes: boolean;
  discoverWorkflows: boolean;

  // Site options
  includeSubsites: boolean;
  includeHubSites: boolean;
  includePersonalSites: boolean; // OneDrive sites
  includeSiteMetrics: boolean; // Usage analytics

  // List options
  includeHiddenLists: boolean;
  includeSystemLists: boolean;
  includeListItems: boolean; // WARNING: Can be huge
  maxListItemsToScan: number;

  // Permission options
  analyzeUniquePermissions: boolean;
  identifyBrokenInheritance: boolean;
  detectExternalSharing: boolean;
  auditShareLinks: boolean;

  // Content type options
  includeCustomContentTypes: boolean;
  analyzeContentTypeUsage: boolean;

  // Filters
  siteUrlPattern?: string; // Regex pattern
  minStorageUsage?: number; // MB
  maxStorageUsage?: number;
  onlyActiveSites?: boolean;
  lastActivityDays?: number;

  // Performance
  maxConcurrentQueries: number;
  batchSize: number;
  throttleDelay: number;
  queryTimeout: number;

  // Output
  exportFormat: 'JSON' | 'CSV' | 'XML';
  includeDetailedLogs: boolean;
}

export const DEFAULT_SHAREPOINT_CONFIG: SharePointDiscoveryConfig = {
  discoverSites: true,
  discoverLists: true,
  discoverPermissions: true,
  discoverContentTypes: false,
  discoverWorkflows: false,

  includeSubsites: true,
  includeHubSites: true,
  includePersonalSites: false,
  includeSiteMetrics: false,

  includeHiddenLists: false,
  includeSystemLists: false,
  includeListItems: false,
  maxListItemsToScan: 1000,

  analyzeUniquePermissions: true,
  identifyBrokenInheritance: true,
  detectExternalSharing: true,
  auditShareLinks: false,

  includeCustomContentTypes: true,
  analyzeContentTypeUsage: false,

  maxConcurrentQueries: 3,
  batchSize: 50,
  throttleDelay: 200,
  queryTimeout: 300000,

  exportFormat: 'JSON',
  includeDetailedLogs: false,
};

// ============================================================================
// Discovery Results
// ============================================================================

export interface SharePointDiscoveryResult {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';

  // Configuration used
  config: SharePointDiscoveryConfig;

  // Results
  sites: SharePointSite[];
  lists: SharePointList[];
  permissions: SharePointPermission[];
  contentTypes: SharePointContentType[];
  workflows: SharePointWorkflow[];

  // Statistics
  statistics: SharePointDiscoveryStatistics;

  // Errors and warnings
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];

  // Metadata
  discoveredBy: string;
  environment: 'Online' | 'OnPremises' | 'Hybrid';
  tenantUrl: string;
}

export interface SharePointDiscoveryStatistics {
  totalSites: number;
  totalStorage: number; // MB
  averageStoragePerSite: number;
  hubSites: number;
  groupConnectedSites: number;
  personalSites: number;

  totalLists: number;
  documentLibraries: number;
  totalDocuments: number;
  totalListItems: number;

  uniquePermissions: number;
  brokenInheritanceCount: number;
  externallySharedSites: number;
  externallySharedLists: number;

  customContentTypes: number;
  activeWorkflows: number;
  runningWorkflowInstances: number;

  largestSite?: {
    title: string;
    url: string;
    storage: number;
  };

  mostActiveSite?: {
    title: string;
    url: string;
    pageViews: number;
  };
}

export interface DiscoveryError {
  timestamp: Date;
  severity: 'critical' | 'error' | 'warning';
  category: string;
  message: string;
  details?: string;
  itemUrl?: string;
}

export interface DiscoveryWarning {
  timestamp: Date;
  category: string;
  message: string;
  itemUrl?: string;
}

// ============================================================================
// Discovery Progress
// ============================================================================

export interface SharePointDiscoveryProgress {
  phase: 'initializing' | 'sites' | 'lists' | 'permissions' | 'contenttypes' | 'workflows' | 'finalizing';
  phaseLabel: string;
  percentComplete: number;
  currentItem?: string;
  itemsProcessed: number;
  totalItems: number;
  estimatedTimeRemaining?: number;
  errors: number;
  warnings: number;
}

// ============================================================================
// Filters and Sorting
// ============================================================================

export interface SharePointSiteFilter {
  searchText?: string;
  templates?: SiteTemplate[];
  minStorage?: number;
  maxStorage?: number;
  isHubSite?: boolean;
  hasGroupConnection?: boolean;
  sharingCapability?: string[];
  externalSharingEnabled?: boolean;
  lastActivityBefore?: Date;
  lastActivityAfter?: Date;
}

export interface SharePointListFilter {
  searchText?: string;
  baseTypes?: string[];
  minItemCount?: number;
  maxItemCount?: number;
  hasUniquePermissions?: boolean;
  versioningEnabled?: boolean;
  moderationEnabled?: boolean;
}

export interface SharePointPermissionFilter {
  searchText?: string;
  principalTypes?: string[];
  permissionLevels?: PermissionLevel[];
  scopes?: string[];
  directOnly?: boolean;
  externalOnly?: boolean;
}

// ============================================================================
// Templates
// ============================================================================

export interface SharePointDiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  config: SharePointDiscoveryConfig;
  createdBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isDefault: boolean;
  tags: string[];
}

// ============================================================================
// Export Types
// ============================================================================

export interface SharePointExportOptions {
  format: 'CSV' | 'JSON' | 'Excel' | 'XML';
  includeSites: boolean;
  includeLists: boolean;
  includePermissions: boolean;
  includeContentTypes: boolean;
  includeWorkflows: boolean;
  includeStatistics: boolean;
  splitByType: boolean;
  fileName?: string;
}

// ============================================================================
// Security and Compliance
// ============================================================================

export interface SharePointSecurityInsight {
  type: 'external_sharing' | 'broken_inheritance' | 'over_shared' | 'inactive_permissions';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedSites: string[];
  affectedLists: string[];
  recommendation: string;
  count: number;
}
