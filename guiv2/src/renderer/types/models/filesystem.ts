/**
 * File System Discovery Type Definitions
 * Maps to FileSystemDiscovery.psm1 PowerShell module
 */

export type ShareType = 'SMB' | 'NFS' | 'DFS' | 'Hidden' | 'Administrative';
export type PermissionRight = 'FullControl' | 'Modify' | 'ReadAndExecute' | 'Read' | 'Write' | 'ListDirectory';
export type InheritanceFlag = 'None' | 'ContainerInherit' | 'ObjectInherit' | 'Both';
export type FileSystemType = 'NTFS' | 'ReFS' | 'FAT32' | 'exFAT' | 'Unknown';

export interface FileShare {
  id: string;
  name: string;
  path: string;
  type: ShareType;
  description?: string;
  server: string;
  isHidden: boolean;
  currentUsers: number;
  maxUsers: number;
  permissions: FilePermission[];
  size: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    percentUsed: number;
  };
  statistics: {
    totalFiles: number;
    totalFolders: number;
    largestFile: {
      name: string;
      path: string;
      sizeBytes: number;
    } | null;
    oldestFile: {
      name: string;
      path: string;
      modifiedDate: string;
    } | null;
  };
  fileSystemType: FileSystemType;
  quotaEnabled: boolean;
  quotaLimit?: number;
  quotaUsed?: number;
  accessBasedEnumeration: boolean;
  shadowCopiesEnabled: boolean;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  deduplicationEnabled: boolean;
  createdDate: string;
  modifiedDate: string;
  lastAccessDate: string;
}

export interface FilePermission {
  id: string;
  shareId: string;
  shareName: string;
  sharePath: string;
  principal: {
    name: string;
    type: 'User' | 'Group' | 'Computer' | 'WellKnownSid';
    sid: string;
    domain?: string;
  };
  rights: PermissionRight[];
  accessType: 'Allow' | 'Deny';
  inheritance: InheritanceFlag;
  isInherited: boolean;
  propagationFlags: string[];
  appliesTo: string;
}

export interface LargeFile {
  id: string;
  name: string;
  path: string;
  extension: string;
  sizeBytes: number;
  sizeFormatted: string;
  share: string;
  owner: string;
  createdDate: string;
  modifiedDate: string;
  lastAccessDate: string;
  isArchive: boolean;
  isReadOnly: boolean;
  isHidden: boolean;
  isSystem: boolean;
  isCompressed: boolean;
  isEncrypted: boolean;
  attributes: string[];
}

export interface StorageStatistics {
  totalShares: number;
  totalStorage: {
    bytes: number;
    formatted: string;
  };
  usedStorage: {
    bytes: number;
    formatted: string;
    percent: number;
  };
  freeStorage: {
    bytes: number;
    formatted: string;
    percent: number;
  };
  totalFiles: number;
  totalFolders: number;
  largestShare: {
    name: string;
    path: string;
    sizeBytes: number;
  } | null;
  oldestShare: {
    name: string;
    path: string;
    createdDate: string;
  } | null;
  sharesWithQuota: number;
  sharesWithEncryption: number;
  sharesWithDeduplication: number;
  averageShareSize: number;
}

export interface SecurityRisk {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Permissions' | 'Encryption' | 'Access' | 'Configuration';
  title: string;
  description: string;
  affectedShare: string;
  affectedPath: string;
  recommendation: string;
  detectedDate: string;
}

export interface FileSystemDiscoveryConfig {
  servers: string[];
  includeHiddenShares: boolean;
  includeAdministrativeShares: boolean;
  scanPermissions: boolean;
  scanLargeFiles: boolean;
  largeFileThresholdMB: number;
  analyzeStorage: boolean;
  detectSecurityRisks: boolean;
  maxDepth: number;
  timeout: number;
  parallelScans: number;
  excludePaths?: string[];
  credentials?: {
    username: string;
    domain?: string;
  };
}

export interface FileSystemDiscoveryResult {
  id: string;
  configId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  servers: string[];
  shares: FileShare[];
  permissions: FilePermission[];
  largeFiles: LargeFile[];
  statistics: StorageStatistics;
  securityRisks: SecurityRisk[];
  errors: Array<{
    server: string;
    share?: string;
    message: string;
    timestamp: string;
  }>;
  warnings: Array<{
    server: string;
    share?: string;
    message: string;
    timestamp: string;
  }>;
  metadata: {
    totalServersScanned: number;
    totalSharesDiscovered: number;
    totalPermissionsAnalyzed: number;
    totalFilesScanned: number;
    totalFoldersScanned: number;
    totalStorageAnalyzed: number;
  };
}

export interface FileSystemDiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  config: FileSystemDiscoveryConfig;
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  isDefault: boolean;
  category: 'Full' | 'Quick' | 'Permissions' | 'Storage' | 'Security' | 'Custom';
}

export interface FileSystemExportOptions {
  format: 'CSV' | 'JSON' | 'Excel' | 'XML';
  includeShares: boolean;
  includePermissions: boolean;
  includeLargeFiles: boolean;
  includeStatistics: boolean;
  includeSecurityRisks: boolean;
  includeErrors: boolean;
  includeWarnings: boolean;
  fileNamePattern?: string;
}

export interface ShareFilter {
  type?: ShareType[];
  minSize?: number;
  maxSize?: number;
  hasQuota?: boolean;
  hasEncryption?: boolean;
  hasDeduplication?: boolean;
  server?: string;
  searchText?: string;
}

export interface PermissionFilter {
  accessType?: ('Allow' | 'Deny')[];
  principalType?: ('User' | 'Group' | 'Computer' | 'WellKnownSid')[];
  rights?: PermissionRight[];
  inheritance?: InheritanceFlag[];
  share?: string;
  searchText?: string;
}

export interface LargeFileFilter {
  minSize?: number;
  extension?: string[];
  share?: string;
  isEncrypted?: boolean;
  isCompressed?: boolean;
  olderThanDays?: number;
  searchText?: string;
}

export interface FileSystemValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

export interface FileSystemProgress {
  phase: 'initializing' | 'discovering_shares' | 'scanning_permissions' | 'analyzing_storage' | 'detecting_risks' | 'finalizing';
  currentServer?: string;
  currentShare?: string;
  serversCompleted: number;
  totalServers: number;
  sharesCompleted: number;
  totalShares: number;
  percentComplete: number;
  estimatedTimeRemaining?: number;
  message: string;
}

export interface FileSystemSchedule {
  id: string;
  name: string;
  configId: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule: string;
  nextRun?: string;
  lastRun?: string;
  lastStatus?: 'success' | 'failed' | 'cancelled';
  notifications: {
    email?: string[];
    onSuccess: boolean;
    onFailure: boolean;
    onRisksDetected: boolean;
  };
}

export const DEFAULT_FILESYSTEM_CONFIG: FileSystemDiscoveryConfig = {
  servers: ['localhost'],
  includeHiddenShares: false,
  includeAdministrativeShares: false,
  scanPermissions: true,
  scanLargeFiles: true,
  largeFileThresholdMB: 1024,
  analyzeStorage: true,
  detectSecurityRisks: true,
  maxDepth: 10,
  timeout: 300,
  parallelScans: 5,
};

export const FILESYSTEM_TEMPLATES: Omit<FileSystemDiscoveryTemplate, 'id' | 'createdDate' | 'modifiedDate' | 'createdBy'>[] = [
  {
    name: 'Full Discovery',
    description: 'Complete file system discovery with all features enabled',
    isDefault: true,
    category: 'Full',
    config: DEFAULT_FILESYSTEM_CONFIG,
  },
  {
    name: 'Quick Scan',
    description: 'Fast scan of shares without deep analysis',
    isDefault: false,
    category: 'Quick',
    config: {
      ...DEFAULT_FILESYSTEM_CONFIG,
      scanPermissions: false,
      scanLargeFiles: false,
      analyzeStorage: false,
      detectSecurityRisks: false,
      maxDepth: 1,
    },
  },
  {
    name: 'Permissions Audit',
    description: 'Focus on detailed permission analysis',
    isDefault: false,
    category: 'Permissions',
    config: {
      ...DEFAULT_FILESYSTEM_CONFIG,
      scanLargeFiles: false,
      analyzeStorage: false,
      maxDepth: 3,
    },
  },
  {
    name: 'Storage Analysis',
    description: 'Analyze storage usage and large files',
    isDefault: false,
    category: 'Storage',
    config: {
      ...DEFAULT_FILESYSTEM_CONFIG,
      scanPermissions: false,
      detectSecurityRisks: false,
      largeFileThresholdMB: 500,
    },
  },
  {
    name: 'Security Scan',
    description: 'Detect security risks and misconfigurations',
    isDefault: false,
    category: 'Security',
    config: {
      ...DEFAULT_FILESYSTEM_CONFIG,
      scanLargeFiles: false,
      analyzeStorage: false,
      detectSecurityRisks: true,
    },
  },
];
