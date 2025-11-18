/**
 * Backup and Restore Type Definitions
 * Defines interfaces for backup operations, restore functionality, and file management
 */

import { Identifiable, Named, TimestampMetadata, Dictionary } from '../common';

/**
 * Backup operations status enumeration
 */
export type BackupStatus =
  | 'NotStarted'
  | 'Initializing'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

/**
 * Restore operations status enumeration
 */
export type RestoreStatus =
  | 'NotStarted'
  | 'Validating'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

/**
 * Backup types
 */
export type BackupType =
  | 'Full'
  | 'Incremental'
  | 'Differential'
  | 'Configuration'
  | 'DataExport';

/**
 * Backup configuration interface
 */
export interface BackupConfiguration {
  /** Backup type */
  type: BackupType;
  /** Include users in backup */
  includeUsers: boolean;
  /** Include groups in backup */
  includeGroups: boolean;
  /** Include settings in backup */
  includeSettings: boolean;
  /** Include discovery data in backup */
  includeDiscoveryData: boolean;
  /** Include migration data in backup */
  includeMigrationData: boolean;
  /** Compression enabled */
  compressionEnabled: boolean;
  /** Encryption enabled */
  encryptionEnabled: boolean;
  /** Backup description */
  description?: string;
  /** Custom metadata */
  metadata?: Dictionary<any>;
}

/**
 * Backup operation interface
 */
export interface BackupOperation extends Identifiable, TimestampMetadata {
  /** Unique operation ID */
  id: string;
  /** Backup name */
  name: string;
  /** Backup description */
  description?: string;
  /** Backup status */
  status: BackupStatus;
  /** Backup type */
  type: BackupType;
  /** Start time */
  startTime: Date | string | null;
  /** End time */
  endTime: Date | string | null;
  /** Total items to backup */
  totalItems: number;
  /** Items processed */
  itemsProcessed: number;
  /** Success count */
  successCount: number;
  /** Error count */
  errorCount: number;
  /** Total size in bytes */
  totalSizeBytes: number;
  /** Size processed in bytes */
  processedSizeBytes: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
  /** File path where backup is stored */
  filePath?: string;
  /** Errors encountered during backup */
  errors: string[];
  /** Warnings encountered during backup */
  warnings: string[];
  /** Configuration used for backup */
  configuration: BackupConfiguration;
  /** Created timestamp */
  createdAt: Date | string;
  /** Last modified timestamp */
  updatedAt: Date | string;
}

/**
 * Restore configuration interface
 */
export interface RestoreConfiguration {
  /** Restore users */
  restoreUsers: boolean;
  /** Restore groups */
  restoreGroups: boolean;
  /** Restore settings */
  restoreSettings: boolean;
  /** Restore discovery data */
  restoreDiscoveryData: boolean;
  /** Restore migration data */
  restoreMigrationData: boolean;
  /** Overwrite existing data */
  overwriteExisting: boolean;
  /** Validate before restore */
  validateBeforeRestore: boolean;
  /** Custom metadata */
  metadata?: Dictionary<any>;
}

/**
 * Restore operation interface
 */
export interface RestoreOperation extends Identifiable, TimestampMetadata {
  /** Unique operation ID */
  id: string;
  /** Restore name */
  name: string;
  /** Restore description */
  description?: string;
  /** Restore status */
  status: RestoreStatus;
  /** Backup file path to restore from */
  backupFilePath: string;
  /** Start time */
  startTime: Date | string | null;
  /** End time */
  endTime: Date | string | null;
  /** Total items to restore */
  totalItems: number;
  /** Items processed */
  itemsProcessed: number;
  /** Success count */
  successCount: number;
  /** Error count */
  errorCount: number;
  /** Total size in bytes */
  totalSizeBytes: number;
  /** Size processed in bytes */
  processedSizeBytes: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
  /** Errors encountered during restore */
  errors: string[];
  /** Warnings encountered during restore */
  warnings: string[];
  /** Configuration used for restore */
  configuration: RestoreConfiguration;
  /** Created timestamp */
  createdAt: Date | string;
  /** Last modified timestamp */
  updatedAt: Date | string;
}

/**
 * Backup manifest interface (stored within backup files)
 */
export interface BackupManifest {
  /** Manifest version */
  version: string;
  /** Backup creation timestamp */
  createdAt: Date | string;
  /** Backup type */
  type: BackupType;
  /** Application version that created the backup */
  applicationVersion: string;
  /** Backup configuration */
  configuration: BackupConfiguration;
  /** File inventory (list of files in backup) */
  files: Array<{
    path: string;
    size: number;
    checksum?: string;
    type: string;
  }>;
  /** Metadata */
  metadata: Dictionary<any>;
  /** Validation checksums */
  checksums: Dictionary<string>;
}

/**
 * Backup/Restore progress data
 */
export interface BackupRestoreProgress {
  /** Operation ID */
  operationId: string;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Progress message */
  message: string;
  /** Current operation phase */
  phase: string;
  /** Items processed */
  itemsProcessed: number;
  /** Total items */
  totalItems: number;
  /** Current item being processed */
  currentItem?: string;
  /** Bytes processed */
  bytesProcessed: number;
  /** Total bytes */
  totalBytes: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
  /** Operation start time */
  startTime: Date | string;
  /** Last update time */
  lastUpdateTime: Date | string;
}

/**
 * Backup operation result
 */
export interface BackupResult {
  /** Success flag */
  success: boolean;
  /** Operation ID */
  operationId: string;
  /** Backup file path */
  filePath?: string;
  /** Error message if failed */
  error?: string;
  /** Statistics */
  statistics?: {
    totalItems: number;
    successCount: number;
    errorCount: number;
    totalSizeBytes: number;
    duration: number;
  };
}

/**
 * Restore operation result
 */
export interface RestoreResult {
  /** Success flag */
  success: boolean;
  /** Operation ID */
  operationId: string;
  /** Error message if failed */
  error?: string;
  /** Statistics */
  statistics?: {
    totalItems: number;
    successCount: number;
    errorCount: number;
    totalSizeBytes: number;
    duration: number;
  };
}

/**
 * Backup validation result
 */
export interface BackupValidationResult {
  /** Is backup valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Backup manifest */
  manifest?: BackupManifest;
}

/**
 * Backup schedule interface
 */
export interface BackupSchedule extends Identifiable, Named, TimestampMetadata {
  /** Schedule ID */
  id: string;
  /** Schedule name */
  name: string;
  /** Schedule description */
  description?: string;
  /** Is schedule enabled */
  enabled: boolean;
  /** Schedule type (daily, weekly, monthly) */
  scheduleType: 'daily' | 'weekly' | 'monthly';
  /** Schedule time (HH:MM format) */
  scheduleTime: string;
  /** Backup configuration */
  backupConfiguration: BackupConfiguration;
  /** Retention period in days */
  retentionDays: number;
  /** Maximum number of backups to keep */
  maxBackups: number;
  /** Last execution time */
  lastExecution?: Date | string;
  /** Next execution time */
  nextExecution: Date | string;
  /** Created timestamp */
  createdAt: Date | string;
  /** Updated timestamp */
  updatedAt: Date | string;
}