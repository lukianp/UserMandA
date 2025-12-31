/**
 * SQL Server Discovery Type Definitions
 * Maps to SQLServerDiscovery.psm1 PowerShell module
 */

export type SQLServerEdition = 'Enterprise' | 'Standard' | 'Web' | 'Express' | 'Developer' | 'Evaluation';
export type AuthenticationMode = 'Windows' | 'Mixed' | 'SQL';
export type RecoveryModel = 'Full' | 'Simple' | 'BulkLogged';
export type DatabaseState = 'Online' | 'Offline' | 'Restoring' | 'Recovering' | 'Suspect' | 'Emergency';
export type BackupType = 'Full' | 'Differential' | 'Transaction' | 'FileFilegroup';

export interface SQLServerInstance {
  id: string;
  serverName: string;
  instanceName: string;
  version: string;
  versionNumber: string;
  edition: SQLServerEdition;
  productLevel: string;
  authentication: AuthenticationMode;
  port: number;
  isClusteredInstance: boolean;
  clusterName?: string;
  isAlwaysOnEnabled: boolean;
  availabilityGroups?: AvailabilityGroup[];
  databases: SQLDatabase[];
  logins: SQLLogin[];
  configuration: SQLConfiguration;
  serviceAccounts: ServiceAccount[];
  diskSpace: DiskSpace[];
  performance: PerformanceMetrics;
  collation: string;
  language: string;
  isSysAdmin: boolean;
  serverProperties: Record<string, any>;
  createdDate: string;
  lastStartDate: string;
}

export interface SQLDatabase {
  id: string;
  instanceId: string;
  name: string;
  state: DatabaseState;
  owner: string;
  createdDate: string;
  size: {
    totalMB: number;
    dataFileMB: number;
    logFileMB: number;
  };
  spaceAvailable: {
    dataMB: number;
    logMB: number;
  };
  recoveryModel: RecoveryModel;
  compatibilityLevel: number;
  collation: string;
  isReadOnly: boolean;
  isEncrypted: boolean;
  encryptionType?: string;
  lastBackup?: {
    type: BackupType;
    date: string;
    sizeMB: number;
  };
  lastFullBackup?: string;
  lastDifferentialBackup?: string;
  lastLogBackup?: string;
  backupHistory: BackupHistory[];
  tables: number;
  views: number;
  storedProcedures: number;
  functions: number;
  fileGroups: FileGroup[];
  files: DatabaseFile[];
  users: DatabaseUser[];
  roles: DatabaseRole[];
  isSystemDatabase: boolean;
  containmentType: 'None' | 'Partial';
  availabilityGroup?: string;
  autoClose: boolean;
  autoShrink: boolean;
  autoCreateStatistics: boolean;
  autoUpdateStatistics: boolean;
  pageVerify: 'None' | 'TornPageDetection' | 'Checksum';
}

export interface AvailabilityGroup {
  name: string;
  primaryReplica: string;
  secondaryReplicas: string[];
  databases: string[];
  healthState: 'Healthy' | 'Warning' | 'Critical';
  synchronizationState: 'Synchronized' | 'Synchronizing' | 'NotSynchronizing';
}

export interface SQLLogin {
  id: string;
  name: string;
  type: 'WindowsUser' | 'WindowsGroup' | 'SQLLogin' | 'Certificate' | 'AsymmetricKey';
  isDisabled: boolean;
  createDate: string;
  modifyDate: string;
  passwordLastSetDate?: string;
  serverRoles: string[];
  defaultDatabase: string;
  defaultLanguage: string;
}

export interface DatabaseUser {
  name: string;
  type: 'SQLUser' | 'WindowsUser' | 'WindowsGroup';
  createDate: string;
  roles: string[];
  defaultSchema: string;
}

export interface DatabaseRole {
  name: string;
  owner: string;
  isFixedRole: boolean;
  members: string[];
}

export interface SQLConfiguration {
  instanceId: string;
  maxServerMemoryMB: number;
  minServerMemoryMB: number;
  maxDegreeOfParallelism: number;
  costThresholdForParallelism: number;
  optimizeForAdHocWorkloads: boolean;
  backupCompression: boolean;
  remoteAdminConnections: boolean;
  xpCmdShellEnabled: boolean;
  databaseMailEnabled: boolean;
  clrEnabled: boolean;
  fullTextEnabled: boolean;
  advancedOptions: Record<string, any>;
  traceFlags: number[];
}

export interface ServiceAccount {
  serviceName: string;
  displayName: string;
  account: string;
  startMode: 'Auto' | 'Manual' | 'Disabled';
  state: 'Running' | 'Stopped' | 'Paused';
  startName: string;
}

export interface DiskSpace {
  drive: string;
  totalSpaceGB: number;
  freeSpaceGB: number;
  usedSpaceGB: number;
  percentFree: number;
  isSystemDrive: boolean;
}

export interface PerformanceMetrics {
  cpuUsagePercent: number;
  memoryUsageMB: number;
  memoryUsagePercent: number;
  batchRequestsPerSecond: number;
  userConnections: number;
  pageLifeExpectancy: number;
  bufferCacheHitRatio: number;
  lazyWritesPerSecond: number;
  pageReadsPerSecond: number;
  pageWritesPerSecond: number;
  checkpointPagesPerSecond: number;
  lockWaitsPerSecond: number;
  deadlocksPerSecond: number;
  transactionsPerSecond: number;
  timestamp: string;
}

export interface BackupHistory {
  id: string;
  databaseName: string;
  backupType: BackupType;
  backupStartDate: string;
  backupFinishDate: string;
  sizeMB: number;
  compressedSizeMB?: number;
  backupSetName: string;
  description?: string;
  userName: string;
  serverName: string;
  machineName: string;
  physicalDevices: string[];
  isEncrypted: boolean;
  wasSuccessful: boolean;
  errorMessage?: string;
}

export interface FileGroup {
  name: string;
  isDefault: boolean;
  isReadOnly: boolean;
  files: number;
}

export interface DatabaseFile {
  id: number;
  name: string;
  physicalName: string;
  type: 'Data' | 'Log';
  fileGroup?: string;
  sizeMB: number;
  maxSizeMB: number;
  growth: string;
  isPercentGrowth: boolean;
  usedSpaceMB: number;
  availableSpaceMB: number;
}

export interface SQLSecurityIssue {
  id: string;
  instanceId: string;
  databaseId?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Authentication' | 'Authorization' | 'Encryption' | 'Configuration' | 'Patching' | 'Audit';
  title: string;
  description: string;
  recommendation: string;
  detectedDate: string;
  cveId?: string;
}

export interface SQLStatistics {
  totalInstances: number;
  totalDatabases: number;
  totalUserDatabases: number;
  totalSystemDatabases: number;
  totalSizeGB: number;
  instancesByEdition: Record<SQLServerEdition, number>;
  databasesByState: Record<DatabaseState, number>;
  databasesByRecovery: Record<RecoveryModel, number>;
  instancesWithAlwaysOn: number;
  instancesWithClustering: number;
  encryptedDatabases: number;
  databasesWithoutRecentBackup: number;
  databasesWithoutFullBackup: number;
  averageDatabaseSizeMB: number;
  largestDatabase: {
    name: string;
    instance: string;
    sizeMB: number;
  } | null;
  oldestDatabase: {
    name: string;
    instance: string;
    createdDate: string;
  } | null;
  securityIssues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SQLDiscoveryConfig {
  servers: string[];
  includeSystemDatabases: boolean;
  includeBackupHistory: boolean;
  includeDatabaseFiles: boolean;
  includeSecurityAudit: boolean;
  includePerformanceMetrics: boolean;
  includeConfiguration: boolean;
  authenticationType: 'Windows' | 'SQL';
  sqlUsername?: string;
  sqlPassword?: string;
  timeout: number;
  parallelScans: number;
  excludeDatabases?: string[];
}

export interface SQLDiscoveryResult {
  id: string;
  configId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  instances: SQLServerInstance[];
  databases: SQLDatabase[];
  securityIssues: SQLSecurityIssue[];
  statistics: SQLStatistics;
  errors: Array<{
    server: string;
    instance?: string;
    message: string;
    timestamp: string;
  }>;
  warnings: Array<{
    server: string;
    instance?: string;
    message: string;
    timestamp: string;
  }>;
  metadata: {
    totalServersScanned: number;
    totalInstancesDiscovered: number;
    totalDatabasesDiscovered: number;
    totalSecurityIssuesFound: number;
  };
}

export interface SQLDiscoveryTemplate {
  id: string;
  name: string;
  description: string;
  config: SQLDiscoveryConfig;
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
  isDefault: boolean;
  category: 'Full' | 'Quick' | 'Security' | 'Configuration' | 'Backup' | 'Custom';
}

export interface SQLExportOptions {
  format: 'CSV' | 'JSON' | 'Excel' | 'XML';
  includeInstances: boolean;
  includeDatabases: boolean;
  includeConfiguration: boolean;
  includeBackupHistory: boolean;
  includeSecurityIssues: boolean;
  includeStatistics: boolean;
  includeErrors: boolean;
  fileNamePattern?: string;
}

export interface InstanceFilter {
  edition?: SQLServerEdition[];
  version?: string;
  authentication?: AuthenticationMode[];
  hasClustering?: boolean;
  hasAlwaysOn?: boolean;
  searchText?: string;
}

export interface DatabaseFilter {
  state?: DatabaseState[];
  recoveryModel?: RecoveryModel[];
  minSizeMB?: number;
  maxSizeMB?: number;
  isEncrypted?: boolean;
  hasRecentBackup?: boolean;
  instance?: string;
  searchText?: string;
}

export interface SQLValidationResult {
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

export interface SQLProgress {
  phase: 'initializing' | 'discovering_instances' | 'scanning_databases' | 'analyzing_configuration' | 'checking_security' | 'collecting_performance' | 'finalizing';
  currentServer?: string;
  currentInstance?: string;
  currentDatabase?: string;
  serversCompleted: number;
  totalServers: number;
  instancesCompleted: number;
  totalInstances: number;
  databasesCompleted: number;
  totalDatabases: number;
  percentComplete: number;
  estimatedTimeRemaining?: number;
  message: string;
}

export interface SQLSchedule {
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
    onSecurityIssues: boolean;
  };
}

export const DEFAULT_SQL_CONFIG: SQLDiscoveryConfig = {
  servers: [],
  includeSystemDatabases: true,
  includeBackupHistory: true,
  includeDatabaseFiles: true,
  includeSecurityAudit: true,
  includePerformanceMetrics: true,
  includeConfiguration: true,
  authenticationType: 'Windows',
  timeout: 300,
  parallelScans: 5,
};

export const SQL_TEMPLATES: Omit<SQLDiscoveryTemplate, 'id' | 'createdDate' | 'modifiedDate' | 'createdBy'>[] = [
  {
    name: 'Full SQL Discovery',
    description: 'Complete SQL Server discovery with all features',
    isDefault: true,
    category: 'Full',
    config: DEFAULT_SQL_CONFIG,
  },
  {
    name: 'Quick Scan',
    description: 'Fast scan of SQL instances and databases',
    isDefault: false,
    category: 'Quick',
    config: {
      ...DEFAULT_SQL_CONFIG,
      includeBackupHistory: false,
      includeDatabaseFiles: false,
      includePerformanceMetrics: false,
      timeout: 120,
    },
  },
  {
    name: 'Security Audit',
    description: 'Focus on security configuration and vulnerabilities',
    isDefault: false,
    category: 'Security',
    config: {
      ...DEFAULT_SQL_CONFIG,
      includeBackupHistory: false,
      includeDatabaseFiles: false,
      includePerformanceMetrics: false,
    },
  },
  {
    name: 'Backup Analysis',
    description: 'Analyze backup status and history',
    isDefault: false,
    category: 'Backup',
    config: {
      ...DEFAULT_SQL_CONFIG,
      includeSecurityAudit: false,
      includePerformanceMetrics: false,
      includeConfiguration: false,
    },
  },
  {
    name: 'Configuration Review',
    description: 'Review SQL Server configuration settings',
    isDefault: false,
    category: 'Configuration',
    config: {
      ...DEFAULT_SQL_CONFIG,
      includeBackupHistory: false,
      includeDatabaseFiles: false,
      includeSecurityAudit: false,
      includePerformanceMetrics: false,
    },
  },
];


