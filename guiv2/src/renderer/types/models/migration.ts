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

/**
 * Go/No-Go checkpoint checkpoint type
 */
export type CheckpointType = 'PreMigration' | 'MidMigration' | 'PostMigration';

/**
 * Checkpoint decision status
 */
export type CheckpointDecisionStatus = 'Pending' | 'InReview' | 'Go' | 'NoGo' | 'Deferred';

/**
 * Criteria evaluation status
 */
export type CriteriaStatus = 'NotEvaluated' | 'Pass' | 'Fail' | 'Warning' | 'Waived';

/**
 * Criteria category
 */
export type CriteriaCategory = 'Technical' | 'Business' | 'Security' | 'Compliance';

/**
 * Criteria evaluation type
 */
export type EvaluationType = 'Automatic' | 'Manual';

/**
 * Checkpoint criteria for Go/No-Go decisions
 */
export interface CheckpointCriteria extends Identifiable {
  id: string;
  name: string;
  description: string;
  category: CriteriaCategory;

  // Evaluation
  evaluationType: EvaluationType;
  evaluationScript?: string;   // PowerShell script for automatic evaluation

  // Status
  status: CriteriaStatus;
  evaluatedAt?: Date | string;
  evaluatedBy?: string;
  notes?: string;
}

/**
 * Go/No-Go checkpoint for wave approval
 */
export interface GoNoGoCheckpoint extends Identifiable, Named, TimestampMetadata {
  id: string;
  waveId: string;
  name: string;
  description: string;
  checkpointType: CheckpointType;

  // Criteria
  criteria: CheckpointCriteria[];
  allCriteriaMustPass: boolean;

  // Decision
  status: CheckpointDecisionStatus;
  decidedBy?: string;
  decidedAt?: Date | string;
  notes?: string;

  // Escalation
  escalationRequired: boolean;
  escalatedTo?: string;
  escalatedAt?: Date | string;
}

/**
 * Migration project (enterprise level)
 */
export interface MigrationProject extends Identifiable, Named, TimestampMetadata {
  id: string;
  name: string;
  description: string;
  status: MigrationStatus;

  // Source and Target
  sourceProfileId: string;
  targetProfileId: string;

  // Timeline
  plannedStartDate: Date | string;
  plannedEndDate: Date | string;
  actualStartDate?: Date | string;
  actualEndDate?: Date | string;

  // Progress
  overallProgress: number;     // 0-100
  currentPhase: string;

  // Relationships
  waves: MigrationWave[];
  checkpoints: GoNoGoCheckpoint[];

  // Audit
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;

  // Metadata
  tags: string[];
  metadata: Dictionary<any>;
}

/**
 * Task type for migration operations
 */
export type TaskType =
  | 'UserMigration'
  | 'GroupMigration'
  | 'MailboxMigration'
  | 'SharePointMigration'
  | 'OneDriveMigration'
  | 'TeamsMigration'
  | 'DeviceMigration'
  | 'ServerMigration'
  | 'ADCleanup'
  | 'PermissionSync'
  | 'Validation'
  | 'Notification'
  | 'Checkpoint';

/**
 * Workload type for migration categorization
 */
export type WorkloadType =
  | 'Users'
  | 'Groups'
  | 'Mailboxes'
  | 'SharePoint'
  | 'OneDrive'
  | 'Teams'
  | 'Devices'
  | 'Servers';

/**
 * Go/No-Go decision type
 */
export type GoNoGoDecision = 'Go' | 'NoGo' | 'Defer';

/**
 * Migration user assigned to a wave
 */
export interface MigrationUser {
  id: string;
  displayName: string;
  email: string;
  upn: string;
  department?: string;
  waveId: string;
  status: MigrationStatus;
  migrationDate?: Date | string;
  rollbackDate?: Date | string;
  notes?: string;
}

/**
 * Migration device assigned to a wave
 */
export interface MigrationDevice {
  id: string;
  name: string;
  type: 'Desktop' | 'Laptop' | 'Server' | 'Mobile' | 'Virtual';
  owner?: string;
  waveId: string;
  status: MigrationStatus;
  migrationDate?: Date | string;
  notes?: string;
}

/**
 * Prerequisite for wave execution
 */
export interface Prerequisite {
  id: string;
  name: string;
  description: string;
  category: 'Technical' | 'Business' | 'Communication' | 'Approval';
  status: 'Pending' | 'InProgress' | 'Completed' | 'Blocked';
  assignedTo?: string;
  dueDate?: Date | string;
  completedDate?: Date | string;
  notes?: string;
  isBlocking: boolean;
}

/**
 * Dashboard statistics for migration
 */
export interface MigrationDashboardStats {
  totalUsers: number;
  migratedUsers: number;
  totalMailboxes: number;
  migratedMailboxes: number;
  totalSharePointSites: number;
  migratedSharePointSites: number;
  totalOneDriveAccounts: number;
  migratedOneDriveAccounts: number;
  totalTeams: number;
  migratedTeams: number;
  totalDevices: number;
  migratedDevices: number;
  totalServers: number;
  migratedServers: number;
}

/**
 * Active task for real-time monitoring
 */
export interface ActiveTask {
  id: string;
  name: string;
  type: TaskType;
  workloadType: WorkloadType;
  waveId: string;
  waveName: string;
  status: 'Running' | 'Queued' | 'Paused';
  progress: number;
  currentItem?: string;
  itemsProcessed: number;
  totalItems: number;
  startedAt: Date | string;
  estimatedCompletion?: Date | string;
  assignedTo?: string;
}

/**
 * Alert for migration dashboard
 */
export interface MigrationAlert {
  id: string;
  type: 'Error' | 'Warning' | 'Info' | 'Success';
  title: string;
  message: string;
  waveId?: string;
  taskId?: string;
  timestamp: Date | string;
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

/**
 * Gantt chart task for visualization
 */
export interface GanttTask {
  id: string;
  name: string;
  start: Date | string;
  end: Date | string;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  dependencies?: string[];
  parentId?: string;
  assignedTo?: string;
  isCriticalPath?: boolean;
  color?: string;
  waveId?: string;
}

/**
 * Workload configuration for migration
 */
export interface WorkloadConfig {
  workloadType: WorkloadType;
  enabled: boolean;
  priority: number;
  settings: Dictionary<any>;
  scope?: {
    includeAll: boolean;
    includeIds?: string[];
    excludeIds?: string[];
    filters?: Dictionary<any>;
  };
}

/**
 * Migration execution options
 */
export interface MigrationExecutionOptions {
  dryRun: boolean;
  validateOnly: boolean;
  maxConcurrent: number;
  throttleRateMBps?: number;
  pauseOnError: boolean;
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  rollbackOnFailure: boolean;
}

/**
 * Wave execution summary
 */
export interface WaveExecutionSummary {
  waveId: string;
  waveName: string;
  status: MigrationStatus;
  startTime?: Date | string;
  endTime?: Date | string;
  duration?: number;
  tasksTotal: number;
  tasksCompleted: number;
  tasksFailed: number;
  tasksSkipped: number;
  itemsTotal: number;
  itemsSucceeded: number;
  itemsFailed: number;
  errorSummary: Array<{
    errorCode: string;
    count: number;
    message: string;
  }>;
}

// ===== ENHANCED MIGRATION CONTROL PLANE TYPES =====
// Phase 1: Domain Mapping, User Migration, Azure Resource Migration

/**
 * Trust relationship level between domains
 */
export type TrustLevel = 'None' | 'OneSided' | 'BiDirectional' | 'Forest' | 'External' | 'Realm';

/**
 * Migration strategy for domain mapping
 */
export type MigrationStrategy =
  | 'BigBang'           // All at once
  | 'Phased'            // Wave-based
  | 'Coexistence'       // Parallel operation
  | 'Cutover'           // Direct switch
  | 'Hybrid';           // Mixed approach

/**
 * Domain mapping status
 */
export type DomainMappingStatus = 'Draft' | 'Validated' | 'Active' | 'Suspended' | 'Completed';

/**
 * User migration status
 */
export type UserMigrationStatus =
  | 'Pending'
  | 'Validated'
  | 'Ready'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'RolledBack'
  | 'Skipped';

/**
 * Resource migration status
 */
export type ResourceMigrationStatus =
  | 'Discovered'
  | 'Analyzed'
  | 'Planned'
  | 'Ready'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'RolledBack';

/**
 * Azure resource types for migration
 */
export type AzureResourceType =
  | 'VirtualMachine'
  | 'StorageAccount'
  | 'VirtualNetwork'
  | 'NetworkSecurityGroup'
  | 'LoadBalancer'
  | 'AzureADApplication'
  | 'AzureADGroup'
  | 'AzureADUser'
  | 'KeyVault'
  | 'SQLDatabase'
  | 'AppService'
  | 'FunctionApp'
  | 'CosmosDB'
  | 'ServiceBus'
  | 'EventHub'
  | 'LogicApp'
  | 'ContainerRegistry'
  | 'AKSCluster';

/**
 * Migration method for Azure resources
 */
export type AzureMigrationMethod =
  | 'LiftAndShift'      // Move as-is
  | 'Rehost'            // Move with minimal changes
  | 'Refactor'          // Modify for cloud optimization
  | 'Rebuild'           // Rebuild from scratch
  | 'Replace';          // Replace with SaaS/PaaS

/**
 * Domain representation for migration
 */
export interface Domain extends Identifiable, Named {
  id: string;
  name: string;
  fqdn: string;
  type: 'Source' | 'Target';
  environmentType: 'OnPremises' | 'Azure' | 'Hybrid';
  forestName?: string;
  domainController?: string;
  isConnected: boolean;
  lastSyncTime?: Date | string;
  userCount?: number;
  groupCount?: number;
  computerCount?: number;
  metadata: Dictionary<any>;
}

/**
 * Domain mapping between source and target
 */
export interface DomainMapping extends Identifiable, TimestampMetadata {
  id: string;
  sourceDomain: string;
  targetDomain: string;
  mappingType: 'OneToOne' | 'ManyToOne' | 'OneToMany' | 'Complex';
  trustRelationship: TrustLevel;
  migrationStrategy: MigrationStrategy;
  priority: number;
  status: DomainMappingStatus;

  // Mapping configuration
  userMappingRules: AttributeMapping[];
  groupMappingRules: AttributeMapping[];
  ouMappingRules: OUMapping[];

  // Validation
  isValidated: boolean;
  validationErrors: string[];
  lastValidatedAt?: Date | string;

  // Statistics
  totalUsers: number;
  mappedUsers: number;
  totalGroups: number;
  mappedGroups: number;

  // Audit
  createdAt: Date | string;
  createdBy: string;
  updatedAt?: Date | string;
  updatedBy?: string;

  notes?: string;
}

/**
 * Attribute mapping for user/group properties
 */
export interface AttributeMapping {
  id: string;
  sourceAttribute: string;
  targetAttribute: string;
  transformationType: 'Direct' | 'Transform' | 'Concatenate' | 'Split' | 'Lookup' | 'Default';
  transformationRule?: string;
  defaultValue?: string;
  isRequired: boolean;
  isEnabled: boolean;
}

/**
 * Organizational Unit mapping
 */
export interface OUMapping {
  id: string;
  sourceOU: string;
  targetOU: string;
  includeChildren: boolean;
  status: MappingStatus;
}

/**
 * License mapping for user migration
 */
export interface LicenseMapping {
  id: string;
  sourceLicense: string;
  sourceLicenseName: string;
  targetLicense: string;
  targetLicenseName: string;
  mappingType: 'Direct' | 'Upgrade' | 'Downgrade' | 'Remove';
  isEnabled: boolean;
  notes?: string;
}

/**
 * Mailbox migration configuration
 */
export interface MailboxMigrationConfig {
  enabled: boolean;
  migrationType: 'Full' | 'Incremental' | 'Delta';
  includeArchive: boolean;
  includeRules: boolean;
  includeCalendar: boolean;
  includeContacts: boolean;
  cutoverDate?: Date | string;
  batchSize: number;
  throttlingEnabled: boolean;
  priority: MigrationPriority;
}

/**
 * User migration plan for individual users
 */
export interface UserMigrationPlan extends Identifiable, TimestampMetadata {
  id: string;
  userId: string;
  userDisplayName: string;
  userPrincipalName: string;
  sourceDomain: string;
  targetDomain: string;
  migrationWaveId: string;

  // Attribute mappings
  attributeMappings: AttributeMapping[];
  groupMappings: UserGroupMapping[];
  licenseMappings: LicenseMapping[];

  // Migration options
  passwordSync: boolean;
  passwordSyncMethod: 'Hash' | 'PassThrough' | 'Federation' | 'Reset';
  preserveSID: boolean;
  preserveUPN: boolean;
  newUPN?: string;

  // Mailbox migration
  mailboxMigration: MailboxMigrationConfig;

  // OneDrive migration
  oneDriveMigration: {
    enabled: boolean;
    preserveSharing: boolean;
    migrateVersionHistory: boolean;
  };

  // Status and progress
  status: UserMigrationStatus;
  progress: number;
  currentStep?: string;
  startedAt?: Date | string;
  completedAt?: Date | string;

  // Validation
  preValidationPassed: boolean;
  preValidationErrors: string[];
  postValidationPassed?: boolean;
  postValidationErrors?: string[];

  // Dependencies
  dependencies: string[];
  blockedBy?: string[];

  // Audit
  createdAt: Date | string;
  createdBy: string;
  updatedAt?: Date | string;

  notes?: string;
}

/**
 * User group mapping for migration
 */
export interface UserGroupMapping {
  sourceGroupId: string;
  sourceGroupName: string;
  targetGroupId?: string;
  targetGroupName?: string;
  action: 'Map' | 'Create' | 'Skip';
  status: MappingStatus;
}

/**
 * Azure resource migration plan
 */
export interface AzureResourceMigration extends Identifiable, TimestampMetadata {
  id: string;
  resourceType: AzureResourceType;
  resourceId: string;
  resourceName: string;
  resourceGroup: string;

  // Source and Target
  sourceSubscriptionId: string;
  sourceSubscriptionName: string;
  targetSubscriptionId: string;
  targetSubscriptionName: string;
  targetResourceGroup?: string;
  targetRegion?: string;

  // Migration configuration
  migrationMethod: AzureMigrationMethod;
  migrationWaveId?: string;
  dependencies: string[];
  dependentResources: string[];

  // Assessment
  complexity: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedDowntime: number;  // minutes
  estimatedCost?: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  risks: string[];

  // Status and progress
  status: ResourceMigrationStatus;
  progress: number;
  currentStep?: string;
  startedAt?: Date | string;
  completedAt?: Date | string;

  // Validation
  preValidationPassed: boolean;
  preValidationErrors: string[];
  postValidationPassed?: boolean;
  postValidationErrors?: string[];

  // Rollback
  supportsRollback: boolean;
  rollbackPlan?: string;
  rollbackComplexity?: 'Low' | 'Medium' | 'High';

  // Configuration
  migrationSettings: Dictionary<any>;
  tags: Dictionary<string>;

  // Audit
  createdAt: Date | string;
  createdBy: string;
  updatedAt?: Date | string;

  notes?: string;
}

/**
 * Cross-domain dependency
 */
export interface CrossDomainDependency extends Identifiable {
  id: string;
  sourceEntityId: string;
  sourceEntityType: 'User' | 'Group' | 'Application' | 'Resource';
  sourceEntityName: string;
  sourceDomain: string;

  targetEntityId: string;
  targetEntityType: 'User' | 'Group' | 'Application' | 'Resource';
  targetEntityName: string;
  targetDomain: string;

  dependencyType: 'Ownership' | 'Membership' | 'Permission' | 'Reference' | 'Configuration';
  isCritical: boolean;
  resolutionStrategy?: string;
  status: 'Identified' | 'Analyzed' | 'Resolved' | 'Ignored';
}

/**
 * Migration engineering metrics
 */
export interface MigrationEngineeringMetrics {
  timestamp: Date | string;
  waveId?: string;

  // Throughput
  itemsPerHour: number;
  bytesPerSecond: number;
  averageItemDuration: number;

  // Success rates
  successRate: number;
  failureRate: number;
  retryRate: number;

  // Queue stats
  queuedItems: number;
  processingItems: number;
  completedItems: number;
  failedItems: number;

  // Performance
  cpuUsage: number;
  memoryUsage: number;
  networkUtilization: number;

  // Errors
  errorsByType: Dictionary<number>;
  topErrors: Array<{
    code: string;
    message: string;
    count: number;
  }>;
}

/**
 * Migration log entry
 */
export interface MigrationLogEntry {
  id: string;
  timestamp: Date | string;
  level: 'Debug' | 'Info' | 'Warning' | 'Error' | 'Critical';
  category: string;
  message: string;
  waveId?: string;
  taskId?: string;
  itemId?: string;
  userId?: string;
  details?: Dictionary<any>;
  stackTrace?: string;
}

/**
 * Rollback result
 */
export interface RollbackResult {
  success: boolean;
  rollbackId: string;
  itemsRolledBack: number;
  itemsFailed: number;
  errors: string[];
  startedAt: Date | string;
  completedAt: Date | string;
  duration: number;
}

/**
 * Migration health score
 */
export interface MigrationHealthScore {
  overall: number;  // 0-100
  categories: {
    userMigration: number;
    azureMigration: number;
    domainMapping: number;
    dataIntegrity: number;
    performance: number;
  };
  issues: Array<{
    category: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
    recommendation: string;
  }>;
  lastCalculated: Date | string;
}


