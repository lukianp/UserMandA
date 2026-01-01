/**
 * OneDrive Discovery Type Definitions
 * Comprehensive types for OneDrive/OneDrive for Business discovery operations
 */

import { Identifiable, TimestampMetadata } from '../common';

/**
 * OneDrive Account Information
 */
export interface OneDriveAccount extends Identifiable, TimestampMetadata {
  userPrincipalName: string;
  displayName: string;
  email: string;
  accountType: 'personal' | 'business' | 'shared';

  // Storage information
  storageQuota: number; // bytes
  storageUsed: number; // bytes
  storageAvailable: number; // bytes
  storagePercentUsed: number;

  // Content counts
  totalFiles: number;
  totalFolders: number;
  recentFiles: number;
  sharedFiles: number;
  externalShares: number;

  // Sharing settings
  sharingEnabled: boolean;
  externalSharingEnabled: boolean;
  anonymousLinkingEnabled: boolean;

  // Activity
  lastActivityDate: Date | string | null;
  lastModifiedDate: Date | string | null;

  // Status
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  isDeleted: boolean;

  // Discovery metadata
  discoveredOn: Date | string;
  lastSyncDate: Date | string | null;
}

/**
 * OneDrive File Metadata
 */
export interface OneDriveFile extends Identifiable, TimestampMetadata {
  name: string;
  fullPath: string;
  relativePath: string;
  parentFolder: string;

  // File properties
  size: number; // bytes
  extension: string;
  mimeType: string;
  fileType: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video' | 'audio' | 'archive' | 'other';

  // Timestamps
  createdDate: Date | string;
  modifiedDate: Date | string;
  lastAccessedDate: Date | string | null;

  // Owner and creator
  owner: string;
  createdBy: string;
  modifiedBy: string;

  // Sharing
  isShared: boolean;
  sharingType: 'none' | 'internal' | 'external' | 'anonymous' | 'organization';
  sharedWith: string[];
  shareCount: number;

  // Permissions
  permissions: OneDrivePermission[];
  hasExternalSharing: boolean;
  hasAnonymousLink: boolean;

  // Classification
  sensitivityLabel: string | null;
  retentionLabel: string | null;
  isClassified: boolean;

  // Versions
  versionCount: number;
  currentVersion: string;

  // Status
  status: 'normal' | 'locked' | 'checkout' | 'deleted';
  isDeleted: boolean;

  // Security flags
  hasMalware: boolean;
  isQuarantined: boolean;
  securityRiskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * OneDrive Permission
 */
export interface OneDrivePermission {
  id: string;
  type: 'user' | 'group' | 'anonymous' | 'organization';
  role: 'read' | 'write' | 'owner';
  grantedTo: string;
  grantedToEmail: string | null;
  expirationDate: Date | string | null;
  hasPassword: boolean;
  allowDownload: boolean;
  link: string | null;
}

/**
 * OneDrive Sharing Link
 */
export interface OneDriveSharing extends Identifiable, TimestampMetadata {
  fileId: string;
  fileName: string;
  filePath: string;
  fileOwner: string;

  // Link information
  linkType: 'view' | 'edit' | 'embed';
  shareType: 'anonymous' | 'organization' | 'specific' | 'inherited';
  linkUrl: string;

  // Access control
  requiresPassword: boolean;
  requiresSignIn: boolean;
  expirationDate: Date | string | null;
  isExpired: boolean;
  allowDownload: boolean;

  // Recipients
  sharedWith: string[];
  recipientCount: number;
  externalRecipientCount: number;

  // Activity
  viewCount: number;
  downloadCount: number;
  lastAccessedDate: Date | string | null;
  createdDate: Date | string;

  // Security
  securityRisk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  hasExternalAccess: boolean;
  hasAnonymousAccess: boolean;

  // Status
  status: 'active' | 'expired' | 'revoked' | 'blocked';
}

/**
 * OneDrive Discovery Configuration
 */
export interface OneDriveDiscoveryConfig extends Identifiable, TimestampMetadata {
  name: string;
  description: string;

  // Scope
  includePersonalOneDrive: boolean;
  includeBusinessOneDrive: boolean;
  includeSharedLibraries: boolean;

  // Discovery options
  discoverAccounts: boolean;
  discoverFiles: boolean;
  discoverSharing: boolean;
  discoverVersions: boolean;
  discoverPermissions: boolean;

  // Filters
  userFilter: string | null; // UPN or email pattern
  minFileSize: number | null; // bytes
  maxFileSize: number | null; // bytes
  fileExtensions: string[]; // e.g., ['.docx', '.xlsx']
  modifiedAfter: Date | string | null;
  modifiedBefore: Date | string | null;

  // Sharing filters
  includeExternalShares: boolean;
  includeAnonymousShares: boolean;
  includeExpiredShares: boolean;

  // Security options
  scanForMalware: boolean;
  checkSensitivityLabels: boolean;
  identifyOversharing: boolean;

  // Performance
  maxConcurrentRequests: number;
  pageSize: number;
  throttleDelayMs: number;
  timeout: number; // seconds

  // Credentials
  tenantId: string | null;
  credentialId: string | null;

  // Schedule
  isScheduled: boolean;
  schedule: string | null; // cron expression
}

/**
 * OneDrive Discovery Result
 */
export interface OneDriveDiscoveryResult extends Identifiable, TimestampMetadata {
  configId: string;
  configName: string;

  // Timing
  startTime: Date | string;
  endTime: Date | string | null;
  duration: number; // milliseconds

  // Status
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'partial';
  completionPercentage: number;

  // Results
  accounts: OneDriveAccount[];
  files: OneDriveFile[];
  sharing: OneDriveSharing[];

  // Statistics
  statistics: OneDriveStatistics;

  // Errors and warnings
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];

  // Metadata
  tenantId: string | null;
  tenantName: string | null;
  discoveredBy: string;
}

/**
 * OneDrive Statistics
 */
export interface OneDriveStatistics {
  // Account statistics
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  suspendedAccounts: number;

  // Storage statistics
  totalStorageQuota: number; // bytes
  totalStorageUsed: number; // bytes
  totalStorageAvailable: number; // bytes
  averageStorageUsage: number; // percentage

  // File statistics
  totalFiles: number;
  totalFolders: number;
  totalSize: number; // bytes
  averageFileSize: number; // bytes
  largestFile: number; // bytes

  // File type distribution
  fileTypeDistribution: Record<string, number>; // extension -> count

  // Sharing statistics
  totalShares: number;
  internalShares: number;
  externalShares: number;
  anonymousShares: number;
  expiredShares: number;

  // Security statistics
  filesWithExternalAccess: number;
  filesWithAnonymousAccess: number;
  filesWithMalware: number;
  filesQuarantined: number;
  unlabeledFiles: number;

  // Activity statistics
  activeFiles: number; // modified in last 30 days
  staleFiles: number; // not modified in 180 days
  recentlyShared: number; // shared in last 7 days

  // Risk metrics
  highRiskShares: number;
  mediumRiskShares: number;
  lowRiskShares: number;
  oversharedFiles: number; // files shared with >50 users
}

/**
 * Discovery Error
 */
export interface DiscoveryError {
  timestamp: Date | string;
  severity: 'error' | 'critical';
  code: string;
  message: string;
  details: string | null;
  context: Record<string, any>;
  recoverable: boolean;
}

/**
 * Discovery Warning
 */
export interface DiscoveryWarning {
  timestamp: Date | string;
  severity: 'warning' | 'info';
  code: string;
  message: string;
  details: string | null;
  context: Record<string, any>;
  actionable: boolean;
  recommendation: string | null;
}

/**
 * OneDrive Discovery Progress
 */
export interface OneDriveDiscoveryProgress {
  type: 'onedrive-discovery';
  timestamp: Date | string;

  // Overall progress
  currentPhase: 'initializing' | 'discovering-accounts' | 'discovering-files' | 'discovering-sharing' | 'analyzing' | 'finalizing';
  phaseProgress: number; // 0-100
  overallProgress: number; // 0-100

  // Current operation
  currentOperation: string;
  currentItem: string | null;

  // Counts
  accountsProcessed: number;
  filesProcessed: number;
  sharesProcessed: number;
  errorsEncountered: number;
  warningsEncountered: number;

  // Performance
  itemsPerSecond: number;
  estimatedTimeRemaining: number | null; // seconds

  // Status
  canCancel: boolean;
  isPaused: boolean;
}

/**
 * OneDrive Discovery Filter
 */
export interface OneDriveDiscoveryFilter {
  // Account filters
  accountStatus: ('active' | 'inactive' | 'suspended' | 'deleted')[] | null;
  accountType: ('personal' | 'business' | 'shared')[] | null;
  minStorageUsed: number | null; // bytes
  maxStorageUsed: number | null; // bytes
  storageUsagePercentage: { min: number; max: number } | null;

  // File filters
  fileTypes: string[] | null; // extensions
  fileSizeRange: { min: number; max: number } | null; // bytes
  modifiedDateRange: { start: Date | string; end: Date | string } | null;
  sharingStatus: ('shared' | 'not-shared' | 'external' | 'anonymous')[] | null;

  // Sharing filters
  shareTypes: ('internal' | 'external' | 'anonymous' | 'organization')[] | null;
  shareStatus: ('active' | 'expired' | 'revoked' | 'blocked')[] | null;
  riskLevel: ('none' | 'low' | 'medium' | 'high' | 'critical')[] | null;

  // Security filters
  hasMalware: boolean | null;
  hasExternalAccess: boolean | null;
  hasAnonymousAccess: boolean | null;
  isClassified: boolean | null;

  // Search
  searchQuery: string | null;
}

/**
 * OneDrive Discovery Template
 */
export interface OneDriveDiscoveryTemplate extends Identifiable, TimestampMetadata {
  name: string;
  description: string;
  category: 'quick' | 'comprehensive' | 'security' | 'compliance' | 'custom';
  config: OneDriveDiscoveryConfig;
  isDefault: boolean;
  isReadOnly: boolean;
  tags: string[];
  author: string | null;
  version: string;
}

/**
 * Default configuration factory
 */
export const createDefaultOneDriveConfig = (): OneDriveDiscoveryConfig => ({
  id: crypto.randomUUID(),
  name: 'New OneDrive Discovery',
  description: '',
  includePersonalOneDrive: true,
  includeBusinessOneDrive: true,
  includeSharedLibraries: false,
  discoverAccounts: true,
  discoverFiles: true,
  discoverSharing: true,
  discoverVersions: false,
  discoverPermissions: true,
  userFilter: null,
  minFileSize: null,
  maxFileSize: null,
  fileExtensions: [],
  modifiedAfter: null,
  modifiedBefore: null,
  includeExternalShares: true,
  includeAnonymousShares: true,
  includeExpiredShares: false,
  scanForMalware: true,
  checkSensitivityLabels: true,
  identifyOversharing: true,
  maxConcurrentRequests: 5,
  pageSize: 100,
  throttleDelayMs: 100,
  timeout: 3600,
  tenantId: null,
  credentialId: null,
  isScheduled: false,
  schedule: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Default filter factory
 */
export const createDefaultOneDriveFilter = (): OneDriveDiscoveryFilter => ({
  accountStatus: null,
  accountType: null,
  minStorageUsed: null,
  maxStorageUsed: null,
  storageUsagePercentage: null,
  fileTypes: null,
  fileSizeRange: null,
  modifiedDateRange: null,
  sharingStatus: null,
  shareTypes: null,
  shareStatus: null,
  riskLevel: null,
  hasMalware: null,
  hasExternalAccess: null,
  hasAnonymousAccess: null,
  isClassified: null,
  searchQuery: null,
});


