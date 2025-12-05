/**
 * DTO models for migration operations
 */

export interface GroupDto {
  id: string;
  sid: string;
  name: string;
  displayName: string;
  description: string;
  groupType: string;
  groupScope: string;
  distinguishedName: string;
  members: string[];
  memberSids: string[];
  memberOf: string[];
  memberOfSids: string[];
  created: Date;
  modified: Date;
  properties: Record<string, unknown>;
  customAttributes: Record<string, unknown>;
}

export interface FileItemDto {
  filePath: string;
  fileName: string;
  directory: string;
  fileSize: number;
  lastModified: Date;
  created: Date;
  fileExtension: string;
  mimeType: string;
  hash: string;
  owner: string;
  permissions: string[];
  isEncrypted: boolean;
  source: string;
  target: string;
  sourcePath: string;
  targetPath: string;
  metadata: Record<string, unknown>;
}

export interface MailboxDto {
  userPrincipalName: string;
  displayName: string;
  primarySmtpAddress: string;
  totalSizeBytes: number;
  mailboxType: string;
  discoveryTimestamp: Date;
  discoveryModule: string;
  sessionId: string;
  itemCount: number;
  prohibitSendQuota: string;
  prohibitSendReceiveQuota: string;
  issueWarningQuota: string;
  isArchiveEnabled: boolean;
  archiveSizeBytes: number;
  emailAddresses: string[];
  properties: Record<string, unknown>;
}

export interface UserDto {
  userPrincipalName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  manager: string;
  officeLocation: string;
  phoneNumber: string;
  employeeId: string;
  isEnabled: boolean;
  lastLogon: Date;
  created: Date;
  modified: Date;
  groupMemberships: string[];
  licenses: string[];
  customAttributes: Record<string, unknown>;
}

export interface DatabaseDto {
  databaseName: string;
  name: string;
  serverName: string;
  instanceName: string;
  sizeMB: number;
  compatibilityLevel: string;
  collationName: string;
  lastBackup: Date;
  recoveryModel: string;
  owner: string;
  users: string[];
  schemas: string[];
  tableCount: number;
  viewCount: number;
  storedProcedureCount: number;
  properties: Record<string, unknown>;
  sourceServer: string;
  targetServer: string;
  customProperties: Record<string, unknown>;
}

export interface GroupPolicyDto {
  gpoGuid: string;
  gpoName: string;
  displayName: string;
  description: string;
  domain: string;
  owner: string;
  createdDate: Date;
  modifiedDate: Date;
  linkedOUs: string[];
  securityFiltering: string[];
  wmiFilters: string[];
  isEnabled: boolean;
  version: number;
  settings: Record<string, unknown>;
  customProperties: Record<string, unknown>;
}

export interface AclDto {
  path: string;
  objectType: string;
  owner: string;
  primaryGroup: string;
  inheritanceEnabled: boolean;
  accessControlEntries: AclEntryDto[];
  extendedAttributes: Record<string, unknown>;
}

export interface AclEntryDto {
  sid: string;
  identityReference: string;
  accessMask: string;
  accessControlType: string;
  inheritanceFlags: string;
  propagationFlags: string;
  isInherited: boolean;
}

export interface SharePointSiteDto {
  id: string;
  title: string;
  url: string;
  template: string;
  storageUsage: number;
  created: Date;
  lastModified: Date;
  siteOwner: string;
  isDeleted: boolean;
  admins: string[];
  properties: Record<string, unknown>;
}

export interface SqlDatabaseDto {
  server: string;
  instance: string;
  database: string;
  name: string;
  sizeMB: number;
  compatibilityLevel: string;
  collationName: string;
  lastBackup: Date;
  recoveryModel: string;
  owner: string;
  users: string[];
  schemas: string[];
  tableCount: number;
  viewCount: number;
  storedProcedureCount: number;
  properties: Record<string, unknown>;
  sourceServer: string;
  targetServer: string;
  customProperties: Record<string, unknown>;
}

export interface FileShareDto {
  name: string;
  path: string;
  description: string;
  server: string;
  maxUses: number;
  currentUses: number;
  shareType: string;
  users: string[];
  groups: string[];
  permissions: Record<string, unknown>;
  properties: Record<string, unknown>;
}

export interface MigrationSettings {
  id: string;
  name: string;
  description: string;
  enableDeltaMigration: boolean;
  validateBeforeMigration: boolean;
  validateAfterMigration: boolean;
  enableRollback: boolean;
  createBackups: boolean;
  maxConcurrentOperations: number;
  batchSize: number;
  retryDelay: number; // TimeSpan in milliseconds
  maxRetryAttempts: number;
  operationTimeout: number; // TimeSpan in milliseconds
  preservePermissions: boolean;
  preserveTimestamps: boolean;
  preserveOwnership: boolean;
  maintainVersionHistory: boolean;
  compressData: boolean;
  encryptInTransit: boolean;
  maxFileSizeBytes: number;
  excludedFileExtensions: string[];
  excludedDirectories: string[];
  includedDirectories: string[];
  cutoffDate: Date | null;
  enableProgressNotifications: boolean;
  enableErrorNotifications: boolean;
  enableCompletionNotifications: boolean;
  notificationRecipients: string[];
  enableDetailedLogging: boolean;
  logLevel: string;
  logOutputPath: string;
  logToFile: boolean;
  logToEventLog: boolean;
  customSettings: Record<string, unknown>;
  conflictResolution: string;
  migrationStrategy: string;
  enablePasswordProvisioning: boolean;
  passwordRequirements: string;
  scheduledStart: Date | null;
  blackoutWindows: number[]; // TimeSpan array in milliseconds
  preferredDays: number[];
  createdBy: string;
  createdDate: Date;
  lastModifiedBy: string;
  lastModifiedDate: Date;
  validationErrors: string[];
  isValid: boolean;
}

export interface MigrationWave {
  id: string;
  name: string;
  description: string;
  status: MigrationWaveStatus;
  scheduledStart: Date | null;
  actualStart: Date | null;
  actualEnd: Date | null;
  priority: number;
  duration: number | null; // TimeSpan in milliseconds
  users: UserItem[];
  mailboxes: MailboxItem[];
  groups: GroupItem[];
  fileShares: FileShareItem[];
  files: FileShareItem[];
  databases: DatabaseItem[];
  groupPolicies: GroupPolicyItem[];
  accessControlLists: AclItem[];
  customItems: unknown[];
  settings: Record<string, unknown>;
  dependencies: string[];
  tags: string[];
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  progressPercentage: number;
  successRate: number;
  createdBy: string;
  createdDate: Date;
  lastModifiedBy: string;
  lastModifiedDate: Date;
  isValid: boolean;
  validationErrors: string[];
}

export enum MigrationWaveStatus {
  Pending = 'Pending',
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Paused = 'Paused',
}

export interface UserItem {
  userPrincipalName: string;
  displayName: string;
  properties: Record<string, unknown>;
}

export interface MailboxItem {
  userPrincipalName: string;
  primarySmtpAddress: string;
  sizeBytes: number;
  properties: Record<string, unknown>;
}

export interface GroupItem {
  name: string;
  description: string;
  groupType: string;
  sid: string;
  groupScope: string;
  members: string[];
  memberSids: string[];
  memberOfSids: string[];
  properties: Record<string, unknown>;
  customAttributes: Record<string, unknown>;
}

export interface FileShareItem {
  sourcePath: string;
  targetPath: string;
  sizeBytes: number;
  properties: Record<string, unknown>;
}

export interface DatabaseItem {
  name: string;
  sourceServer: string;
  targetServer: string;
  sizeMB: number;
  properties: Record<string, unknown>;
}

export interface GroupPolicyItem {
  gpoGuid: string;
  gpoName: string;
  name: string;
  displayName: string;
  description: string;
  domain: string;
  owner: string;
  createdDate: Date;
  modifiedDate: Date;
  createdBy: string;
  modifiedBy: string;
  linkedOUs: string[];
  securityFiltering: string[];
  wmiFilters: string[];
  settings: Record<string, unknown>;
  creationTime: Date;
  modificationTime: Date;
  version: number;
  enabled: boolean;
  isEnabled: boolean;
  status: string;
  customProperties: Record<string, unknown>;
}

export interface AclItem {
  id: string;
  path: string;
  objectType: string;
  accessControlEntries: AclEntryDto[];
  owner: string;
  primaryGroup: string;
  inheritanceEnabled: boolean;
  extendedAttributes: Record<string, unknown>;
}
