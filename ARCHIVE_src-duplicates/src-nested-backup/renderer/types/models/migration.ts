/**
 * Migration Type Definitions
 * Translated from GUI/Models/MigrationModels.cs
 */

import { Identifiable, Named, TimestampMetadata, Dictionary } from '../common';

/**
 * Migration types enumeration - Enhanced for enterprise migration
 */
export type MigrationType =
  | 'User'
  | 'UserProfile'
  | 'Mailbox'
  | 'FileShare'
  | 'SharePoint'
  | 'VirtualMachine'
  | 'Application'
  | 'Database'
  | 'SecurityGroup'
  | 'GroupPolicy'
  | 'OrganizationalUnit'
  | 'Certificate'
  | 'GPO'
  | 'OneDrive'
  | 'Teams'
  | 'DistributionList'
  | 'PublicFolder'
  | 'MailEnabledSecurityGroup'
  | 'NetworkDrive'
  | 'PrintQueue'
  | 'Registry'
  | 'ACL';

/**
 * Migration status enumeration
 */
export type MigrationStatus =
  | 'NotStarted'
  | 'Planning'
  | 'Planned'
  | 'Validating'
  | 'Ready'
  | 'InProgress'
  | 'Paused'
  | 'Completed'
  | 'CompletedWithWarnings'
  | 'Failed'
  | 'Cancelled'
  | 'RolledBack'
  | 'Skipped';

/**
 * Migration priority levels
 */
export type MigrationPriority = 'Low' | 'Normal' | 'High' | 'Critical';

/**
 * Migration complexity assessment
 */
export type MigrationComplexity = 'Simple' | 'Moderate' | 'Complex' | 'HighRisk';

/**
 * Mapping status
 */
export type MappingStatus = 'Pending' | 'Valid' | 'Invalid' | 'Conflicted' | 'Resolved' | 'Mapped' | 'Skipped';

/**
 * Migration wave for orchestrator
 */
export interface MigrationWave extends Identifiable, Named, TimestampMetadata {
  id: string;
  name: string;
  description: string;
  order: number;
  priority: MigrationPriority;
  plannedStartDate: Date | string;
  plannedEndDate: Date | string | null;
  targetStartDate?: Date | string; // Additional property for test compatibility
  actualStartDate: Date | string | null;
  actualEndDate: Date | string | null;
  createdAt: Date | string;
  estimatedDuration: number | null; // milliseconds
  tasks: MigrationTask[];
  status: MigrationStatus;
  batches: MigrationBatch[];
  users?: string[]; // Additional property for test compatibility
  metadata: Dictionary<any>;
  notes: string;
  prerequisites: string[];

  // Computed properties
  totalItems?: number;
  progressPercentage?: number;
}

/**
 * Migration task
 */
export interface MigrationTask extends Identifiable, Named {
  id: string;
  name: string;
  description: string;
  status: MigrationStatus;
  assignedTo: string;
  dueDate: Date | string | null;
  completedDate: Date | string | null;
  dependencies: string[];




















  type?: string; // Migration task type
  parameters?: Record<string, any>; // Task parameters
  timeout?: number; // Timeout in milliseconds
  critical?: boolean; // Whether task failure should stop the migration
}

/**
 * Migration batch for specific migration types
 */
export interface MigrationBatch extends Identifiable, Named, TimestampMetadata {
  id: string;
  name: string;
  description: string;
  type: MigrationType;
  priority: MigrationPriority;
  complexity: MigrationComplexity;
  items: MigrationItem[];
  status: MigrationStatus;
  statusMessage: string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  plannedStartDate: Date | string | null;
  plannedEndDate: Date | string | null;
  estimatedDuration: number | null; // milliseconds
  actualDuration: number | null; // milliseconds
  assignedTechnician: string;
  businessOwner: string;
  maxConcurrentItems: number;
  enableAutoRetry: boolean;
  maxRetryAttempts: number;
  retryDelay: number; // milliseconds

  // Statistics
  totalItems: number;
  completedItems: number;
  failedItems: number;
  itemsWithWarnings: number;
  inProgressItems: number;
  pendingItems: number;
  progressPercentage: number;
  successRate: number;

  // Size and transfer tracking
  totalSizeBytes: number;
  transferredBytes: number;
  averageTransferRateMBps: number;
  formattedTotalSize: string;

  // Dependencies and prerequisites
  prerequisites: string[];
  postMigrationTasks: string[];
  dependentBatches: string[];

  // Configuration
  configuration: Dictionary<any>;
  environmentSettings: Dictionary<string>;
  enableThrottling: boolean;
  throttlingLimitMBps: number;

  // Quality assurance
  preMigrationChecklist: string[];
  postMigrationValidation: string[];
  qualityGates: string[];
  requiresApproval: boolean;
  approvedBy: string;
  approvalDate: Date | string | null;

  // Error handling and logging
  errors: string[];
  warnings: string[];
  logFilePath: string;
  detailedLogs: string[];

  // Business data
  businessJustification: string;
  estimatedCost: number | null;
  actualCost: number | null;
  tags: string[];
  customProperties: Dictionary<any>;

  // Rollback support
  supportsRollback: boolean;
  rollbackPlan: string;
  rollbackInstructions: string[];

  // Computed properties
  isCompleted: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  isHighRisk: boolean;
  canStart: boolean;
  canPause: boolean;
  canResume: boolean;
  isRunning: boolean;
}

/**
 * Individual migration item
 */
export interface MigrationItem extends Identifiable, TimestampMetadata {
  id: string;
  waveId: string;
  wave: string;
  sourceIdentity: string;
  targetIdentity: string;
  sourcePath: string;
  targetPath: string;
  type: MigrationType;
  status: MigrationStatus;
  priority: MigrationPriority;
  complexity: MigrationComplexity;
  startTime: Date | string | null;
  endTime: Date | string | null;
  validationTime: Date | string | null;
  created: Date | string;
  estimatedDuration: number | null; // milliseconds
  actualDuration: number | null; // milliseconds
  errors: string[];
  warnings: string[];
  validationResults: string[];
  properties: Dictionary<any>;
  permissionMappings: Dictionary<string>;
  sizeBytes: number | null;
  transferredBytes: number | null;
  progressPercentage: number;
  displayName: string;
  description: string;
  output: string;
  dependencies: string[];
  dependentItems: string[];
  retryCount: number;
  maxRetryAttempts: number;
  lastRetryTime: Date | string | null;
  preMigrationChecklist: string[];
  postMigrationValidation: string[];
  requiresUserInteraction: boolean;
  allowConcurrentMigration: boolean;
  assignedTechnician: string;
  businessJustification: string;
  customFields: Dictionary<any>;
  tags: string[];

  // Performance
  transferRateMBps: number;
  maxConcurrentStreams: number;
  enableThrottling: boolean;

  // Rollback
  supportsRollback: boolean;
  rollbackPlan: string;
  rollbackInstructions: string[];

  // Validation and quality
  isValidationRequired: boolean;
  isValidationPassed: boolean;
  qualityChecks: string[];

  // Computed properties
  isCompleted: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  isHighRisk: boolean;
  completionPercentage: number;
  formattedSize: string;
}

/**
 * Resource mapping for migrations
 */
export interface ResourceMapping extends Identifiable {
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  type: MigrationType;
  status: MappingStatus;
  conflicts: string[];
  validationResult: ValidationResult | null;
}

/**
 * Migration environment configuration
 */
export interface MigrationEnvironment extends Named {
  name: string;
  type: 'Azure' | 'OnPremises' | 'Hybrid';
  connectionStrings: Dictionary<string>;
  configuration: Dictionary<any>;
  isConnected: boolean;
  isHealthy: boolean;
  healthStatus: string;
  lastHealthCheck: Date | string;
  capabilities: string[];
  credentials: Dictionary<string>;
}

/**
 * Migration settings and configuration
 */
export interface MigrationSettings {
  enableRollback: boolean;
  validateBeforeMigration: boolean;
  maxConcurrentMigrations: number;
  retryAttempts: number;
  retryDelay: number; // milliseconds
  preservePermissions: boolean;
  createMissingTargetContainers: boolean;
  notificationEmail: string;
  typeSpecificSettings: Dictionary<any>;
  excludedItems: string[];
  pauseOnError: boolean;
  generateDetailedLogs: boolean;
}

/**
 * Conflict information
 */
export interface Conflict {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  affectedItems: string[];
  resolution: string;
  isResolved: boolean;
}

/**
 * Rollback point for migration
 */
export interface RollbackPoint extends Identifiable, TimestampMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: Date | string;
  waveId: string;
  batchId: string;
  snapshot: Dictionary<any>;
  canRestore: boolean;
}

/**
 * Migration orchestrator project container
 */
export interface MigrationOrchestratorProject extends Identifiable, Named, TimestampMetadata {
  id: string;
  name: string;
  description: string;
  createdDate: Date | string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  status: MigrationStatus;
  waves: MigrationWave[];
  sourceEnvironment: MigrationEnvironment;
  targetEnvironment: MigrationEnvironment;
  settings: MigrationSettings;
  tags: string[];
}

/**
 * Migration metrics for dashboard
 */
export interface MigrationMetrics {
  totalProjects: number;
  activeMigrations: number;
  completedMigrations: number;
  overallCompletionPercentage: number;
}

/**
 * Active migration model for dashboard
 */
export interface ActiveMigrationModel {
  projectName: string;
  waveName: string;
  migrationType: string;
  status: string;
  completionPercentage: number;
  startTime: Date | string;
  estimatedCompletion: Date | string;
}

/**
 * Validation error for migration
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'critical';
}

/**
 * Validation warning for migration
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  severity: 'warning' | 'info';
}

/**
 * ACL entry for file shares
 */
export interface AclEntry {
  identity: string;
  permissions: string[];
  accessType: 'Allow' | 'Deny';
  isInherited: boolean;
}

/**
 * Migration progress tracking
 */
export interface MigrationProgress {
  waveId: string;
  batchId?: string;
  percentage: number;
  message: string;
  currentItem: string;
  itemsProcessed: number;
  totalItems: number;
  itemsSucceeded: number;
  itemsFailed: number;
  itemsSkipped: number;
  estimatedTimeRemaining: number | null;
  transferRateMBps: number;
  startTime: Date | string;
  lastUpdateTime: Date | string;
}

/**
 * Validation result for migration operations
 */
export interface ValidationResult {
  isValid: boolean;
  passed?: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Conflict resolution strategy
 */
export interface ConflictResolution {
  conflictId: string;
  strategy: 'skip' | 'overwrite' | 'merge' | 'rename' | 'manual';
  customAction?: string;
  notes?: string;
}

/**
 * Migration conflict information
 */
export interface MigrationConflict extends Identifiable {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  sourceResource: {
    id: string;
    name: string;
    type: string;
    properties: Dictionary<any>;
  };
  targetResource?: {
    id: string;
    name: string;
    type: string;
    properties: Dictionary<any>;
  };
  suggestedResolution?: ConflictResolution;
  status: 'pending' | 'resolved' | 'failed';
  metadata: Dictionary<any>;
}

/**
 * Migration plan for legacy compatibility
 */
export interface MigrationPlan extends Identifiable, Named, TimestampMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: Date | string;
  tasks: MigrationTask[];
  status: MigrationStatus;
}

/**
 * Complexity score for migration planning
 */
export interface ComplexityScore {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: string[];
}

/**
 * Group mapping for migration planning
 */
export interface GroupMapping {
  userId: string;
  sourceGroupId: string;
  targetGroupId: string;
  mappingType: 'Direct' | 'Merge' | 'Split';
  status: MappingStatus;
}

/**
 * Migration analysis result
 */
export interface MigrationAnalysis {
  userId: string;
  complexity: ComplexityScore;
  dependencies: string[];
  recommendations: string[];
  estimatedDuration: number | null; // milliseconds
  risks: string[];
}
