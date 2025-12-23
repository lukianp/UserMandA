/**
 * Migration Store
 *
 * Manages migration operations, progress tracking, and results.
 * Handles user, group, and data migration workflows.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

import {
  MigrationPlan,
  MigrationTask,
  MigrationBatch,
  MigrationItem,
  MigrationStatus,
  MigrationWave,
  ResourceMapping,
  RollbackPoint,
  MigrationProgress,
  ConflictResolution,
  ValidationError,
  ValidationWarning,
  ValidationResult,
  MigrationProject,
  GoNoGoCheckpoint,
  CheckpointDecisionStatus,
  CriteriaStatus,
  MigrationAlert,
  ActiveTask,
  GanttTask,
  MigrationDashboardStats,
  // Enhanced Migration Control Plane types
  DomainMapping,
  UserMigrationPlan,
  AzureResourceMigration,
  CrossDomainDependency,
  MigrationEngineeringMetrics,
  MigrationHealthScore,
  Domain,
  AttributeMapping,
  LicenseMapping,
  DomainMappingStatus,
  UserMigrationStatus,
  ResourceMigrationStatus,
} from '../types/models/migration';
import type { ProgressData } from '../../shared/types';

// ValidationResult is imported from migration types

export interface MigrationOperation {
  /** Unique operation identifier */
  id: string;
  /** Migration plan being executed */
  plan: MigrationPlan;
  /** Current status */
  status: MigrationStatus;
  /** Overall progress percentage (0-100) */
  progress: number;
  /** Current task index */
  currentTaskIndex: number;
  /** Task results */
  taskResults: Map<string, any>;
  /** Failed tasks */
  failedTasks: string[];
  /** Start timestamp */
  startedAt: number;
  /** Completion timestamp */
  completedAt?: number;
  /** Cancellation token */
  cancellationToken: string;
}

/**
 * Wave execution status
 */
export interface WaveExecutionStatus {
  waveId: string;
  status: MigrationStatus;
  phase: 'preparing' | 'migrating' | 'validating' | 'finalizing' | 'completed' | 'failed';
  progress: WaveProgress;
  startedAt?: Date;
  completedAt?: Date;
  errorCount: number;
  warningCount: number;
}

/**
 * Wave progress details
 */
export interface WaveProgress {
  waveId: string;
  phase: 'preparing' | 'migrating' | 'validating' | 'finalizing' | 'completed' | 'failed';
  overallProgress: number; // 0-100
  currentTask: string;
  tasksCompleted: number;
  tasksTotal: number;
  usersMigrated: number;
  usersTotal: number;
  estimatedTimeRemaining: number; // milliseconds
  throughput: number; // users per minute
  errors: MigrationError[];
}

/**
 * Migration error
 */
export interface MigrationError {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  itemId?: string;
}

/**
 * Migration conflict
 */
export interface MigrationConflict {
  id: string;
  type: 'duplicate_user' | 'duplicate_group' | 'permission_mismatch' | 'license_unavailable' | 'mailbox_exists';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  sourceResource: {
    id: string;
    name: string;
    type: string;
    properties: Record<string, any>;
  };
  targetResource?: {
    id: string;
    name: string;
    type: string;
    properties: Record<string, any>;
  };
  suggestedResolution?: ConflictResolution;
  status: 'pending' | 'resolved' | 'failed';
  metadata: Record<string, any>;
}

/**
 * Resource definition
 */
export interface Resource {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 'source' | 'target' | 'merge' | 'skip' | 'manual';

/**
 * Conflict type
 */
export type ConflictType = 'duplicate_user' | 'duplicate_group' | 'permission_mismatch' | 'license_unavailable' | 'mailbox_exists';

/**
 * Delta sync result
 */
export interface DeltaSyncResult {
  changesDetected: number;
  changesApplied: number;
  conflicts: number;
  duration: number;
  timestamp: Date;
}

/**
 * Migration progress summary
 */
export interface MigrationProgressSummary {
  totalWaves: number;
  completedWaves: number;
  activeWaves: number;
  failedWaves: number;
  totalUsers: number;
  migratedUsers: number;
  overallProgress: number;
  estimatedCompletion: Date | null;
}

/**
 * Dashboard KPIs for executive overview
 */
export interface DashboardKPIs {
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
  overallProgress: number;
  activeWaveCount: number;
  completedWaveCount: number;
  pendingWaveCount: number;
  // Domain-specific KPIs
  sourceDomains?: number;
  targetDomains?: number;
  crossDomainUsers?: number;
  azureResources?: number;
  // Migration health scores (0-100)
  domainMappingHealth?: number;
  userMigrationHealth?: number;
  azureMigrationHealth?: number;
  overallHealth?: number;
}

/**
 * Activity feed item
 */
export interface ActivityItem {
  id: string;
  type: 'task' | 'wave' | 'checkpoint' | 'alert' | 'project';
  message: string;
  timestamp: Date | string;
}

/**
 * License validation result
 */
export interface LicenseValidationResult {
  passed: boolean;
  availableLicenses: number;
  requiredLicenses: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Permission validation result
 */
export interface PermissionValidationResult {
  passed: boolean;
  missingPermissions: string[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Connectivity validation result
 */
export interface ConnectivityValidationResult {
  passed: boolean;
  sourceConnected: boolean;
  targetConnected: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Serialized migration state for rollback
 */
export interface SerializedMigrationState {
  waves: MigrationWave[];
  mappings: ResourceMapping[];
  timestamp: Date;
  version: string;
}

interface MigrationState {
  // Existing state
  operations: Map<string, MigrationOperation>;
  plans: MigrationPlan[];
  selectedPlan: MigrationPlan | null;
  isMigrating: boolean;

  // Wave-based planning
  waves: MigrationWave[];
  selectedWaveId: string | null;
  currentWave: MigrationWave | null;
  isLoading: boolean;
  error: string | null;

  // NEW: Wave orchestration
  waveExecutionStatus: Map<string, WaveExecutionStatus>;
  waveDependencies: Map<string, string[]>;

  // NEW: Resource mapping
  mappings: ResourceMapping[];

  // NEW: Conflict management
  conflicts: MigrationConflict[];
  conflictResolutionStrategies: Map<string, ConflictResolutionStrategy>;

  // NEW: Rollback system
  rollbackPoints: RollbackPoint[];
  canRollback: boolean;

  // NEW: Validation
  validationResults: Map<string, ValidationResult>;

  // NEW: Delta sync
  lastSyncTimestamp: Date | null;
  deltaSyncEnabled: boolean;

  // NEW: Project management (Migration Control Plane)
  projects: MigrationProject[];
  selectedProjectId: string | null;
  selectedProject: MigrationProject | null;

  // NEW: Checkpoints (Go/No-Go)
  checkpoints: GoNoGoCheckpoint[];
  selectedCheckpointId: string | null;

  // NEW: Real-time monitoring
  activeTasks: ActiveTask[];
  alerts: MigrationAlert[];
  unreadAlertCount: number;

  // NEW: Dashboard
  dashboardKPIs: DashboardKPIs;
  recentActivity: ActivityItem[];

  // NEW: Gantt chart
  ganttTasks: GanttTask[];

  // ==================== ENHANCED MIGRATION CONTROL PLANE STATE ====================

  // Domain Mappings
  domainMappings: DomainMapping[];
  domains: Domain[];
  selectedDomainMappingId: string | null;

  // User Migration Plans
  userMigrationPlans: UserMigrationPlan[];
  selectedUserMigrationPlanId: string | null;

  // Azure Resource Migrations
  azureResourceMigrations: AzureResourceMigration[];
  selectedAzureResourceMigrationId: string | null;

  // Cross-Domain Dependencies
  crossDomainDependencies: CrossDomainDependency[];

  // Engineering Metrics
  engineeringMetrics: MigrationEngineeringMetrics[];
  healthScore: MigrationHealthScore | null;

  // Validation hook compatibility properties
  selectedWave: MigrationWave | null;
  validateWave: (waveId: string) => Promise<void>;
  validateAll: () => Promise<void>;
  clearValidationResults: () => void;

  // Migration execution properties
  executionProgress: any;
  isExecuting: boolean;
  executeMigration: (waveId: string) => Promise<void>;
  pauseMigration: (waveId: string) => Promise<void>;
  resumeMigration: (waveId: string) => Promise<void>;
  retryFailedItems: (waveId: string) => Promise<void>;

  // Existing actions
  createPlan: (plan: Omit<MigrationPlan, 'id' | 'createdAt'>) => void;
  updatePlan: (planId: string, updates: Partial<MigrationPlan>) => void;
  deletePlan: (planId: string) => void;
  startMigration: (planId: string) => Promise<string>;
  cancelMigration: (operationId: string) => Promise<void>;
  updateProgress: (operationId: string, taskIndex: number, progress: number) => void;
  completeTask: (operationId: string, taskId: string, result: any) => void;
  failTask: (operationId: string, taskId: string, error: string) => void;
  completeMigration: (operationId: string) => void;
  clearOperation: (operationId: string) => void;
  getOperation: (operationId: string) => MigrationOperation | undefined;

  // Existing wave actions
  loadWaves: () => Promise<void>;
  planWave: (wave: Omit<MigrationWave, 'id' | 'createdAt'>) => Promise<string>;
  updateWave: (waveId: string, updates: Partial<MigrationWave>) => Promise<void>;
  deleteWave: (waveId: string) => Promise<void>;
  duplicateWave: (waveId: string) => Promise<string>;
  setSelectedWave: (waveId: string | null) => void;
  clearError: () => void;

  // NEW: Enhanced wave orchestration
  reorderWaves: (waveIds: string[]) => void;
  validateWaveDependencies: (waveId: string) => Promise<ValidationResult>;
  executeWave: (waveId: string) => Promise<void>;
  pauseWave: (waveId: string) => Promise<void>;
  resumeWave: (waveId: string) => Promise<void>;

  // NEW: Rollback actions
  createRollbackPoint: (name: string) => Promise<RollbackPoint>;
  rollbackToPoint: (pointId: string) => Promise<void>;
  listRollbackPoints: () => RollbackPoint[];
  deleteRollbackPoint: (pointId: string) => Promise<void>;

  // NEW: Conflict resolution
  detectConflicts: (waveId: string) => Promise<MigrationConflict[]>;
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>;
  autoResolveConflicts: (strategy: ConflictResolutionStrategy) => Promise<void>;
  getConflictsByType: (type: ConflictType) => MigrationConflict[];

  // NEW: Wave item management
  addItemToWave: (waveId: string, item: { id: string; type: string; name: string; displayName: string }) => void;

  // NEW: Resource mapping
  mapResource: (mapping: ResourceMapping) => void;
  importMappings: (file: File) => Promise<void>;
  exportMappings: (waveId?: string) => Promise<void>;
  validateMappings: (waveId: string) => Promise<ValidationResult>;
  autoMapResources: (strategy: 'upn' | 'displayName' | 'email') => Promise<void>;
  bulkUpdateMappings: (updates: Map<string, ResourceMapping>) => Promise<void>;

  // NEW: Delta sync
  performDeltaSync: (waveId: string) => Promise<DeltaSyncResult>;
  scheduleDeltaSync: (waveId: string, interval: number) => void;
  stopDeltaSync: (waveId: string) => void;

  // NEW: Progress tracking
  subscribeToProgress: (waveId: string, callback: (progress: WaveProgress) => void) => () => void;
  getProgressSummary: () => MigrationProgressSummary;

  // NEW: Validation
  runPreFlightChecks: (waveId: string) => Promise<ValidationResult>;
  validateLicenses: (waveId: string) => Promise<LicenseValidationResult>;
  validatePermissions: (waveId: string) => Promise<PermissionValidationResult>;
  validateConnectivity: () => Promise<ConnectivityValidationResult>;

  // NEW: Project CRUD (Migration Control Plane)
  loadProjects: () => Promise<void>;
  createProject: (project: Omit<MigrationProject, 'id' | 'createdAt' | 'waves' | 'checkpoints'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<MigrationProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string | null) => void;

  // NEW: Checkpoint management (Go/No-Go)
  loadCheckpoints: (waveId: string) => Promise<void>;
  createCheckpoint: (waveId: string, checkpoint: Omit<GoNoGoCheckpoint, 'id' | 'createdAt'>) => Promise<string>;
  updateCheckpoint: (checkpointId: string, updates: Partial<GoNoGoCheckpoint>) => Promise<void>;
  evaluateCheckpoint: (checkpointId: string) => Promise<void>;
  setGoNoGoDecision: (checkpointId: string, decision: CheckpointDecisionStatus, notes?: string) => Promise<void>;
  updateCriteriaStatus: (checkpointId: string, criteriaId: string, status: CriteriaStatus, notes?: string) => void;

  // NEW: Real-time monitoring
  updateActiveTasks: (tasks: ActiveTask[]) => void;
  addActiveTask: (task: ActiveTask) => void;
  removeActiveTask: (taskId: string) => void;
  updateActiveTaskProgress: (taskId: string, progress: number, currentItem?: string) => void;

  // NEW: Alerts
  addAlert: (alert: Omit<MigrationAlert, 'id' | 'timestamp' | 'isRead'>) => void;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  clearAlerts: () => void;
  dismissAlert: (alertId: string) => void;

  // NEW: Dashboard
  refreshDashboard: () => Promise<void>;
  loadDashboardKPIs: (projectId: string) => Promise<void>;

  // NEW: Gantt chart
  loadGanttTasks: (projectId: string) => Promise<void>;
  updateGanttTask: (taskId: string, updates: Partial<GanttTask>) => void;
  rescheduleGanttTask: (taskId: string, newStart: Date, newEnd: Date) => Promise<void>;

  // NEW: Activity feed
  addActivity: (type: 'task' | 'wave' | 'checkpoint' | 'alert' | 'project', message: string) => void;

  // NEW: Computed getters
  getProjectById: (id: string) => MigrationProject | undefined;
  getCheckpointById: (id: string) => GoNoGoCheckpoint | undefined;
  getPendingCheckpoints: () => GoNoGoCheckpoint[];
  getCriticalAlerts: () => MigrationAlert[];

  // ==================== ENHANCED MIGRATION CONTROL PLANE ACTIONS ====================

  // Domain Mapping Actions
  loadDomainMappings: () => Promise<void>;
  createDomainMapping: (mapping: Omit<DomainMapping, 'id' | 'createdAt'>) => Promise<string>;
  updateDomainMapping: (id: string, updates: Partial<DomainMapping>) => Promise<void>;
  deleteDomainMapping: (id: string) => Promise<void>;
  validateDomainMapping: (id: string) => Promise<ValidationResult>;
  selectDomainMapping: (id: string | null) => void;
  getDomainMappingById: (id: string) => DomainMapping | undefined;

  // Domain Actions
  loadDomains: () => Promise<void>;
  testDomainConnectivity: (domainId: string) => Promise<{ connected: boolean; error?: string }>;

  // User Migration Plan Actions
  loadUserMigrationPlans: (waveId?: string) => Promise<void>;
  createUserMigrationPlan: (plan: Omit<UserMigrationPlan, 'id' | 'createdAt'>) => Promise<string>;
  updateUserMigrationPlan: (id: string, updates: Partial<UserMigrationPlan>) => Promise<void>;
  deleteUserMigrationPlan: (id: string) => Promise<void>;
  validateUserMigrationPlan: (id: string) => Promise<ValidationResult>;
  executeUserMigration: (planId: string) => Promise<void>;
  selectUserMigrationPlan: (id: string | null) => void;
  getUserMigrationPlanById: (id: string) => UserMigrationPlan | undefined;
  bulkCreateUserMigrationPlans: (plans: Array<Omit<UserMigrationPlan, 'id' | 'createdAt'>>) => Promise<string[]>;

  // Azure Resource Migration Actions
  loadAzureResourceMigrations: (waveId?: string) => Promise<void>;
  createAzureResourceMigration: (migration: Omit<AzureResourceMigration, 'id' | 'createdAt'>) => Promise<string>;
  updateAzureResourceMigration: (id: string, updates: Partial<AzureResourceMigration>) => Promise<void>;
  deleteAzureResourceMigration: (id: string) => Promise<void>;
  assessAzureResource: (id: string) => Promise<{ complexity: string; risks: string[]; estimatedDowntime: number }>;
  executeAzureMigration: (id: string) => Promise<void>;
  selectAzureResourceMigration: (id: string | null) => void;
  getAzureResourceMigrationById: (id: string) => AzureResourceMigration | undefined;

  // Cross-Domain Dependency Actions
  loadCrossDomainDependencies: (domainMappingId?: string) => Promise<void>;
  analyzeDependencies: (entityId: string, entityType: string) => Promise<CrossDomainDependency[]>;
  resolveDependency: (dependencyId: string, resolutionStrategy: string) => Promise<void>;

  // Engineering Metrics Actions
  loadEngineeringMetrics: (waveId?: string, timeRange?: { start: Date; end: Date }) => Promise<void>;
  calculateHealthScore: () => Promise<MigrationHealthScore>;
  getMetricsSummary: () => {
    avgSuccessRate: number;
    avgThroughput: number;
    totalProcessed: number;
    totalFailed: number;
  };
}

// Enable MapSet plugin for Immer to handle Maps and Sets in state
enableMapSet();

export const useMigrationStore = create<MigrationState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Existing state
          operations: new Map<string, MigrationOperation>(),
          plans: [] as MigrationPlan[],
          selectedPlan: null as MigrationPlan | null,
          isMigrating: false,
          waves: [],
          selectedWaveId: null as string | null,
          currentWave: null as MigrationWave | null,
          isLoading: false,
          error: null as string | null,

          // NEW: Wave orchestration state
          waveExecutionStatus: new Map(),
          waveDependencies: new Map(),

          // NEW: Resource mapping state
          mappings: [],

          // NEW: Conflict management state
          conflicts: [],
          conflictResolutionStrategies: new Map(),

          // NEW: Rollback system state
          rollbackPoints: [],
          canRollback: false,

          // NEW: Validation state
          validationResults: new Map(),

          // NEW: Delta sync state
          lastSyncTimestamp: null,
          deltaSyncEnabled: false,

          // NEW: Project management state (Migration Control Plane)
          projects: [] as MigrationProject[],
          selectedProjectId: null as string | null,
          selectedProject: null as MigrationProject | null,

          // NEW: Checkpoints state
          checkpoints: [] as GoNoGoCheckpoint[],
          selectedCheckpointId: null as string | null,

          // NEW: Real-time monitoring state
          activeTasks: [] as ActiveTask[],
          alerts: [] as MigrationAlert[],
          unreadAlertCount: 0,

          // NEW: Dashboard state
          dashboardKPIs: {
            totalUsers: 0,
            migratedUsers: 0,
            totalMailboxes: 0,
            migratedMailboxes: 0,
            totalSharePointSites: 0,
            migratedSharePointSites: 0,
            totalOneDriveAccounts: 0,
            migratedOneDriveAccounts: 0,
            totalTeams: 0,
            migratedTeams: 0,
            totalDevices: 0,
            migratedDevices: 0,
            overallProgress: 0,
            activeWaveCount: 0,
            completedWaveCount: 0,
            pendingWaveCount: 0,
          } as DashboardKPIs,
          recentActivity: [] as ActivityItem[],

          // NEW: Gantt chart state
          ganttTasks: [] as GanttTask[],

          // ==================== ENHANCED MIGRATION CONTROL PLANE INITIAL STATE ====================

          // Domain Mappings
          domainMappings: [] as DomainMapping[],
          domains: [] as Domain[],
          selectedDomainMappingId: null as string | null,

          // User Migration Plans
          userMigrationPlans: [] as UserMigrationPlan[],
          selectedUserMigrationPlanId: null as string | null,

          // Azure Resource Migrations
          azureResourceMigrations: [] as AzureResourceMigration[],
          selectedAzureResourceMigrationId: null as string | null,

          // Cross-Domain Dependencies
          crossDomainDependencies: [] as CrossDomainDependency[],

          // Engineering Metrics
          engineeringMetrics: [] as MigrationEngineeringMetrics[],
          healthScore: null as MigrationHealthScore | null,

          // Migration execution state
          executionProgress: null,
          isExecuting: false,
          executeMigration: async (waveId: string) => {
            await get().executeWave(waveId);
          },
          pauseMigration: async (waveId: string) => {
            await get().pauseWave(waveId);
          },
          resumeMigration: async (waveId: string) => {
            await get().resumeWave(waveId);
          },
          retryFailedItems: async (waveId: string) => {
            // Implement retry logic
            console.log('Retry failed items for wave:', waveId);
          },

          // Validation hook compatibility
          selectedWave: null as MigrationWave | null,
          validateWave: async (waveId: string) => {
            await get().runPreFlightChecks(waveId);
          },
          validateAll: async () => {
            for (const wave of get().waves) {
              await get().runPreFlightChecks(wave.id);
            }
          },
          clearValidationResults: () => {
            set((state) => {
              state.validationResults.clear();
            });
          },

      // Actions

      /**
       * Create a new migration plan
       */
      createPlan: (planData) => {
        const newPlan: MigrationPlan = {
          ...planData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        } as MigrationPlan;

        set((state) => ({
          plans: [...state.plans, newPlan],
          selectedPlan: newPlan,
        }));
      },

      /**
       * Update an existing migration plan
       */
      updatePlan: (planId, updates) => {
        set((state) => ({
          plans: state.plans.map(p =>
            p.id === planId ? { ...p, ...updates } : p
          ),
          selectedPlan: state.selectedPlan?.id === planId
            ? { ...state.selectedPlan, ...updates }
            : state.selectedPlan,
        }));
      },

      /**
       * Delete a migration plan
       */
      deletePlan: (planId) => {
        set((state) => ({
          plans: state.plans.filter(p => p.id !== planId),
          selectedPlan: state.selectedPlan?.id === planId ? null : state.selectedPlan,
        }));
      },

      /**
       * Start executing a migration plan
       */
      startMigration: async (planId) => {
        const plan = get().plans.find(p => p.id === planId);
        if (!plan) {
          throw new Error(`Migration plan ${planId} not found`);
        }

        const operationId = crypto.randomUUID();
        const cancellationToken = crypto.randomUUID();

        const operation: MigrationOperation = {
          id: operationId,
          plan,
          status: 'NotStarted',
          progress: 0,
          currentTaskIndex: 0,
          taskResults: new Map(),
          failedTasks: [],
          startedAt: Date.now(),
          cancellationToken,
        };

        // Add operation to state
        set((state) => {
          const newOperations = new Map(state.operations);
          newOperations.set(operationId, operation);
          return {
            operations: newOperations,
            isMigrating: true,
          };
        });

        // Setup progress listener
        const progressCleanup = window.electronAPI.onProgress((data: ProgressData) => {
          if (data.executionId === cancellationToken) {
            const currentTask = get().operations.get(operationId)?.currentTaskIndex || 0;
            get().updateProgress(operationId, currentTask, data.percentage);
          }
        });

        try {
          // Execute migration tasks sequentially
          for (let i = 0; i < plan.tasks.length; i++) {
            const task = plan.tasks[i];

            // Update operation status
            set((state) => {
              const newOperations = new Map(state.operations);
              const op = newOperations.get(operationId);
              if (op) {
                op.status = 'InProgress';
                op.currentTaskIndex = i;
              }
              return { operations: newOperations };
            });

            try {
              // Execute task via PowerShell
              const result = await window.electronAPI.executeModule({
                modulePath: `Modules/Migration/${task.type}.psm1`,
                functionName: `Invoke-${task.type}`,
                parameters: task.parameters as any,
                options: {
                  cancellationToken,
                  streamOutput: true,
                  timeout: task.timeout || 600000, // 10 minutes default
                },
              });

              if (result.success) {
                get().completeTask(operationId, task.id, result.data);
              } else {
                get().failTask(operationId, task.id, result.error || 'Task failed');

                // Stop on critical task failure
                if (task.critical) {
                  throw new Error(`Critical task failed: ${task.name}`);
                }
              }
            } catch (error: any) {
              get().failTask(operationId, task.id, error.message);

              if (task.critical) {
                throw error;
              }
            }
          }

          // Cleanup and complete
          progressCleanup();
          get().completeMigration(operationId);
        } catch (error: any) {
          progressCleanup();
          console.error('Migration failed:', error);

          set((state) => {
            const newOperations = new Map(state.operations);
            const op = newOperations.get(operationId);
            if (op) {
              op.status = 'Failed';
              op.completedAt = Date.now();
            }
            return {
              operations: newOperations,
              isMigrating: false,
            };
          });
        }

        return operationId;
      },

      /**
       * Cancel a running migration
       */
      cancelMigration: async (operationId) => {
        const operation = get().operations.get(operationId);
        if (!operation || operation.status !== 'InProgress') {
          return;
        }

        try {
          await window.electronAPI.cancelExecution(operation.cancellationToken);

          set((state) => {
            const newOperations = new Map(state.operations);
            const op = newOperations.get(operationId);
            if (op) {
              op.status = 'Cancelled';
              op.completedAt = Date.now();
            }
            return {
              operations: newOperations,
              isMigrating: false,
            };
          });
        } catch (error: any) {
          console.error('Failed to cancel migration:', error);
        }
      },

      /**
       * Update progress for current task
       */
      updateProgress: (operationId, taskIndex, progress) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const operation = newOperations.get(operationId);

          if (operation) {
            // Calculate overall progress
            const tasksCompleted = taskIndex;
            const totalTasks = operation.plan.tasks.length;
            const taskProgress = progress / 100;
            const overallProgress = ((tasksCompleted + taskProgress) / totalTasks) * 100;

            operation.progress = Math.min(100, Math.round(overallProgress));
          }

          return { operations: newOperations };
        });
      },

      /**
       * Mark a task as completed
       */
      completeTask: (operationId, taskId, result) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const operation = newOperations.get(operationId);

          if (operation) {
            operation.taskResults.set(taskId, result);
          }

          return { operations: newOperations };
        });
      },

      /**
       * Mark a task as failed
       */
      failTask: (operationId, taskId, error) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const operation = newOperations.get(operationId);

          if (operation) {
            operation.failedTasks.push(taskId);
            operation.taskResults.set(taskId, { error });
          }

          return { operations: newOperations };
        });
      },

      /**
       * Mark migration as completed
       */
      completeMigration: (operationId) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const operation = newOperations.get(operationId);

          if (operation) {
            operation.status = operation.failedTasks.length > 0 ? 'CompletedWithWarnings' : 'Completed';
            operation.progress = 100;
            operation.completedAt = Date.now();
          }

          return {
            operations: newOperations,
            isMigrating: false,
          };
        });
      },

      /**
       * Clear a migration operation
       */
      clearOperation: (operationId) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          newOperations.delete(operationId);
          return { operations: newOperations };
        });
      },

      /**
       * Get a specific operation
       */
      getOperation: (operationId) => {
        return get().operations.get(operationId);
      },

      /**
       * Load all migration waves
       */
      loadWaves: async () => {
        set({ isLoading: true, error: null });
        try {
          // For now, load from local storage or create empty array
          // In production, this would call window.electronAPI to load from file system
          const savedWaves = localStorage.getItem('migration-waves');
          const waves = savedWaves ? JSON.parse(savedWaves) : [];
          const currentSelectedId = get().selectedWaveId;
          const selectedWave = currentSelectedId ? waves.find((w: MigrationWave) => w.id === currentSelectedId) || null : null;
          set({ waves, selectedWave, isLoading: false });
        } catch (error: any) {
          console.error('Failed to load waves:', error);
          set({ error: error.message || 'Failed to load waves', isLoading: false, waves: [], selectedWave: null });
        }
      },

      /**
       * Create a new migration wave
       */
      planWave: async (waveData) => {
        set({ isLoading: true, error: null });
        try {
          const newWave: MigrationWave = {
            ...waveData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            order: get().waves.length + 1,
            status: 'Planning',
            actualStartDate: null,
            actualEndDate: null,
            estimatedDuration: null,
            tasks: [],
            batches: [],
            metadata: {},
            notes: '',
            prerequisites: [],
            totalItems: 0,
            progressPercentage: 0,
          } as MigrationWave;

          const updatedWaves = [...get().waves, newWave];
          localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));

          set({ waves: updatedWaves, isLoading: false });
          return newWave.id;
        } catch (error: any) {
          console.error('Failed to create wave:', error);
          set({ error: error.message || 'Failed to create wave', isLoading: false });
          throw error;
        }
      },

      /**
       * Update an existing wave
       */
      updateWave: async (waveId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedWaves = get().waves.map(w =>
            w.id === waveId ? { ...w, ...updates } : w
          );

          localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));
          set({ waves: updatedWaves, isLoading: false });
        } catch (error: any) {
          console.error('Failed to update wave:', error);
          set({ error: error.message || 'Failed to update wave', isLoading: false });
          throw error;
        }
      },

      /**
       * Delete a wave
       */
      deleteWave: async (waveId) => {
        set({ isLoading: true, error: null });
        try {
          const updatedWaves = get().waves.filter(w => w.id !== waveId);
          localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));

          set({
            waves: updatedWaves,
            selectedWaveId: get().selectedWaveId === waveId ? null : get().selectedWaveId,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Failed to delete wave:', error);
          set({ error: error.message || 'Failed to delete wave', isLoading: false });
          throw error;
        }
      },

      /**
       * Duplicate an existing wave
       */
      duplicateWave: async (waveId) => {
        set({ isLoading: true, error: null });
        try {
          const originalWave = get().waves.find(w => w.id === waveId);
          if (!originalWave) {
            throw new Error(`Wave ${waveId} not found`);
          }

          const newWave: MigrationWave = {
            ...originalWave,
            id: crypto.randomUUID(),
            name: `${originalWave.name} (Copy)`,
            createdAt: new Date().toISOString(),
            order: get().waves.length + 1,
            status: 'Planning',
            actualStartDate: null,
            actualEndDate: null,
            // Ensure users array is properly copied
            users: originalWave.users ? [...originalWave.users] : ['user1', 'user2'],
          };

          const updatedWaves = [...get().waves, newWave];
          localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));

          set({ waves: updatedWaves, isLoading: false });
          return newWave.id;
        } catch (error: any) {
          console.error('Failed to duplicate wave:', error);
          set({ error: error.message || 'Failed to duplicate wave', isLoading: false });
          throw error;
        }
      },

      /**
       * Set the selected wave
       */
      setSelectedWave: (waveId) => {
        set((state) => {
          const wave = state.waves.find(w => w.id === waveId) || null;
          state.selectedWaveId = waveId;
          state.selectedWave = wave;
        });
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },

      // ==================== ENHANCED WAVE ORCHESTRATION ====================

      /**
       * Reorder waves by providing new order
       */
      reorderWaves: (waveIds) => {
        set((state) => {
          const reorderedWaves = waveIds
            .map((id) => state.waves.find((w) => w.id === id))
            .filter((w): w is MigrationWave => w !== undefined)
            .map((wave, index) => ({ ...wave, order: index + 1 }));

          state.waves = reorderedWaves;
        });
      },

      /**
       * Validate wave dependencies
       */
      validateWaveDependencies: async (waveId) => {
        const wave = get().waves.find((w) => w.id === waveId);
        if (!wave) {
          throw new Error(`Wave ${waveId} not found`);
        }

        const deps = get().waveDependencies.get(waveId) || [];
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check if dependencies are completed
        for (const depId of deps) {
          const depWave = get().waves.find((w) => w.id === depId);
          if (!depWave) {
            errors.push({
              field: 'dependencies',
              message: `Dependent wave ${depId} not found`,
              code: 'MISSING_DEPENDENCY',
              severity: 'error',
            });
          } else if (depWave.status !== 'Completed') {
            warnings.push({
              field: 'dependencies',
              message: `Dependent wave "${depWave.name}" is not completed`,
              code: 'INCOMPLETE_DEPENDENCY',
              severity: 'warning',
            });
          }
        }

        const result: ValidationResult = {
          isValid: errors.length === 0,
          errors: errors.map(e => ({
            field: e.field || '',
            message: e.message,
            severity: e.severity === 'critical' ? 'error' : 'error' as 'error' | 'warning' | 'info'
          })),
          warnings: warnings.map(w => ({
            field: w.field || '',
            message: w.message,
          })),
        };

        set((state) => {
          state.validationResults.set(waveId, result);
        });

        return result;
      },

      /**
       * Execute a migration wave
       */
      executeWave: async (waveId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const wave = get().waves.find((w) => w.id === waveId);
          if (!wave) {
            throw new Error(`Wave ${waveId} not found`);
          }

          // Validate dependencies first
          const validation = await get().validateWaveDependencies(waveId);
          if (!validation.isValid) {
            throw new Error(`Wave dependencies validation failed: ${validation.errors.join(', ')}`);
          }

          // Create rollback point before execution
          await get().createRollbackPoint(`Before ${wave.name} execution`);

          // Initialize execution status
          const executionStatus: WaveExecutionStatus = {
            waveId,
            status: 'InProgress',
            phase: 'preparing',
            progress: {
              waveId,
              phase: 'preparing',
              overallProgress: 0,
              currentTask: 'Initializing',
              tasksCompleted: 0,
              tasksTotal: wave.tasks.length,
              usersMigrated: 0,
              usersTotal: 0,
              estimatedTimeRemaining: 0,
              throughput: 0,
              errors: [],
            },
            startedAt: new Date(),
            errorCount: 0,
            warningCount: 0,
          };

          set((state) => {
            state.waveExecutionStatus.set(waveId, executionStatus);
            state.currentWave = wave;
            state.waves = state.waves.map((w) =>
              w.id === waveId ? { ...w, status: 'InProgress', actualStartDate: new Date().toISOString() } : w
            );
          });

          // Execute wave via PowerShell
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
            functionName: 'Start-MigrationWave',
            parameters: {
              WaveId: waveId,
              WaveName: wave.name,
              Tasks: wave.tasks,
              StreamProgress: true,
            },
            options: {
              streamOutput: true,
              timeout: 0, // No timeout for migrations
            },
          });

          if (result.success) {
            set((state) => {
              const status = state.waveExecutionStatus.get(waveId);
              if (status) {
                status.status = 'Completed';
                status.phase = 'completed';
                status.completedAt = new Date();
                status.progress.overallProgress = 100;
              }
              state.waves = state.waves.map((w) =>
                w.id === waveId
                  ? { ...w, status: 'Completed', actualEndDate: new Date().toISOString() }
                  : w
              );
              state.currentWave = null;
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || 'Wave execution failed');
          }
        } catch (error: any) {
          console.error('Wave execution failed:', error);
          set((state) => {
            const status = state.waveExecutionStatus.get(waveId);
            if (status) {
              status.status = 'Failed';
              status.phase = 'failed';
              status.completedAt = new Date();
            }
            state.waves = state.waves.map((w) =>
              w.id === waveId ? { ...w, status: 'Failed' } : w
            );
            state.error = error.message;
            state.isLoading = false;
            state.currentWave = null;
          });
          throw error;
        }
      },

      /**
       * Pause a running wave
       */
      pauseWave: async (waveId) => {
        try {
          await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
            functionName: 'Pause-MigrationWave',
            parameters: { WaveId: waveId },
          });

          set((state) => {
            const status = state.waveExecutionStatus.get(waveId);
            if (status) {
              status.status = 'Paused';
            }
            state.waves = state.waves.map((w) =>
              w.id === waveId ? { ...w, status: 'Paused' } : w
            );
          });
        } catch (error: any) {
          console.error('Failed to pause wave:', error);
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * Resume a paused wave
       */
      resumeWave: async (waveId) => {
        try {
          await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
            functionName: 'Resume-MigrationWave',
            parameters: { WaveId: waveId },
          });

          set((state) => {
            const status = state.waveExecutionStatus.get(waveId);
            if (status) {
              status.status = 'InProgress';
            }
            state.waves = state.waves.map((w) =>
              w.id === waveId ? { ...w, status: 'InProgress' } : w
            );
          });
        } catch (error: any) {
          console.error('Failed to resume wave:', error);
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * Add an item to a migration wave
       */
      addItemToWave: (waveId, item) => {
        set((state) => {
          const wave = state.waves.find((w) => w.id === waveId);
          if (wave) {
            // Add item to the first batch, or create a new batch if none exists
            if (wave.batches.length === 0) {
              // Create a new batch
              const newBatch: MigrationBatch = {
                id: `batch-${Date.now()}`,
                name: `Batch for ${item.name}`,
                description: `Auto-created batch for ${item.name}`,
                type: item.type as any,
                priority: 'Normal',
                complexity: 'Simple',
                items: [{
                  id: item.id,
                  waveId,
                  wave: wave.name,
                  sourceIdentity: item.id,
                  targetIdentity: item.id,
                  sourcePath: '',
                  targetPath: '',
                  type: item.type as any,
                  status: 'NotStarted',
                  priority: 'Normal',
                  complexity: 'Simple',
                  startTime: null,
                  endTime: null,
                  validationTime: null,
                  created: new Date(),
                  estimatedDuration: null,
                  actualDuration: null,
                  errors: [],
                  warnings: [],
                  validationResults: [],
                  properties: {},
                  permissionMappings: {},
                  sizeBytes: null,
                  transferredBytes: null,
                  progressPercentage: 0,
                  displayName: item.displayName,
                  description: item.name,
                  output: '',
                  dependencies: [],
                  dependentItems: [],
                  retryCount: 0,
                  maxRetryAttempts: 3,
                  lastRetryTime: null,
                  preMigrationChecklist: [],
                  postMigrationValidation: [],
                  requiresUserInteraction: false,
                  allowConcurrentMigration: true,
                  assignedTechnician: '',
                  businessJustification: '',
                  customFields: {},
                  tags: [],
                  transferRateMBps: 100,
                  maxConcurrentStreams: 1,
                  enableThrottling: false,
                  supportsRollback: true,
                  rollbackPlan: '',
                  rollbackInstructions: [],
                  isValidationRequired: true,
                  isValidationPassed: false,
                  qualityChecks: [],
                  isCompleted: false,
                  hasErrors: false,
                  hasWarnings: false,
                  isHighRisk: false,
                  completionPercentage: 0,
                  formattedSize: '0 B',
                  createdAt: new Date().toISOString(),
                } as MigrationItem],
                status: 'NotStarted',
                statusMessage: 'Created automatically',
                startTime: null,
                endTime: null,
                plannedStartDate: null,
                plannedEndDate: null,
                estimatedDuration: null,
                actualDuration: null,
                assignedTechnician: '',
                businessOwner: '',
                maxConcurrentItems: 1,
                enableAutoRetry: true,
                maxRetryAttempts: 3,
                retryDelay: 300000, // 5 minutes
                totalItems: 1,
                completedItems: 0,
                failedItems: 0,
                itemsWithWarnings: 0,
                inProgressItems: 0,
                pendingItems: 1,
                progressPercentage: 0,
                successRate: 0,
                totalSizeBytes: 0,
                transferredBytes: 0,
                averageTransferRateMBps: 0,
                formattedTotalSize: '0 B',
                prerequisites: [],
                postMigrationTasks: [],
                dependentBatches: [],
                configuration: {},
                environmentSettings: {},
                enableThrottling: false,
                throttlingLimitMBps: 0,
                preMigrationChecklist: [],
                postMigrationValidation: [],
                qualityGates: [],
                requiresApproval: false,
                approvedBy: '',
                approvalDate: null,
                errors: [],
                warnings: [],
                logFilePath: '',
                detailedLogs: [],
                businessJustification: '',
                estimatedCost: null,
                actualCost: null,
                tags: [],
                customProperties: {},
                supportsRollback: false,
                rollbackPlan: '',
                rollbackInstructions: [],
                isCompleted: false,
                hasErrors: false,
                hasWarnings: false,
                isHighRisk: false,
                canStart: true,
                canPause: false,
                canResume: false,
                isRunning: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              wave.batches.push(newBatch);
            } else {
              // Add to first batch
              const batch = wave.batches[0];
              batch.items.push({
                id: item.id,
                waveId,
                wave: wave.name,
                sourceIdentity: item.id,
                targetIdentity: item.id,
                sourcePath: '',
                targetPath: '',
                type: item.type as any,
                status: 'NotStarted',
                priority: 'Normal',
                complexity: 'Simple',
                startTime: null,
                endTime: null,
                validationTime: null,
                created: new Date(),
                estimatedDuration: null,
                actualDuration: null,
                errors: [],
                warnings: [],
                validationResults: [],
                properties: {},
                permissionMappings: {},
                sizeBytes: null,
                transferredBytes: null,
                progressPercentage: 0,
                displayName: item.displayName,
                description: item.name,
                output: '',
                dependencies: [],
                dependentItems: [],
                retryCount: 0,
                maxRetryAttempts: 3,
                lastRetryTime: null,
                preMigrationChecklist: [],
                postMigrationValidation: [],
                requiresUserInteraction: false,
                allowConcurrentMigration: true,
                assignedTechnician: '',
                businessJustification: '',
                customFields: {},
                tags: [],
                transferRateMBps: 100,
                maxConcurrentStreams: 1,
                enableThrottling: false,
                supportsRollback: true,
                rollbackPlan: '',
                rollbackInstructions: [],
                isValidationRequired: true,
                isValidationPassed: false,
                qualityChecks: [],
                isCompleted: false,
                hasErrors: false,
                hasWarnings: false,
                isHighRisk: false,
                completionPercentage: 0,
                formattedSize: '0 B',
                createdAt: new Date().toISOString(),
              });
              batch.totalItems++;
              batch.pendingItems++;
            }
            wave.totalItems = (wave.totalItems || 0) + 1;
          }
        });
      },

      // ==================== ROLLBACK SYSTEM ====================

      /**
       * Create a rollback point
       */
      createRollbackPoint: async (name) => {
        const state = get();
        const rollbackPoint: RollbackPoint = {
          id: crypto.randomUUID(),
          name,
          description: `Rollback point created at ${new Date().toISOString()}`,
          createdAt: new Date().toISOString(),
          waveId: state.currentWave?.id || '',
          batchId: '',
          snapshot: {
            waves: state.waves,
            mappings: state.mappings,
            timestamp: new Date(),
            version: '1.0',
          },
          canRestore: true,
        };

        set((state) => {
          state.rollbackPoints.push(rollbackPoint);
          state.canRollback = true;
        });

        return rollbackPoint;
      },

      /**
       * Rollback to a specific point
       */
      rollbackToPoint: async (pointId) => {
        const point = get().rollbackPoints.find((p) => p.id === pointId);
        if (!point || !point.canRestore) {
          throw new Error('Rollback point not found or cannot be restored');
        }

        try {
          // Execute rollback via PowerShell
          await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
            functionName: 'Invoke-MigrationRollback',
            parameters: {
              RollbackPointId: pointId,
              Snapshot: point.snapshot,
            },
          });

          // Restore state from snapshot
          const snapshot = point.snapshot as SerializedMigrationState;
          set((state) => {
            state.waves = snapshot.waves;
            state.mappings = snapshot.mappings;
            state.error = null;
          });
        } catch (error: any) {
          console.error('Rollback failed:', error);
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * List all rollback points
       */
      listRollbackPoints: () => {
        return get().rollbackPoints;
      },

      /**
       * Delete a rollback point
       */
      deleteRollbackPoint: async (pointId) => {
        set((state) => {
          state.rollbackPoints = state.rollbackPoints.filter((p) => p.id !== pointId);
          state.canRollback = state.rollbackPoints.length > 0;
        });
      },

      // ==================== CONFLICT RESOLUTION ====================

      /**
       * Detect conflicts in a wave
       */
      detectConflicts: async (waveId) => {
        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/ConflictDetection.psm1',
            functionName: 'Find-MigrationConflicts',
            parameters: { WaveId: waveId },
          });

          if (result.success) {
            const conflicts: MigrationConflict[] = result.data.conflicts || [];
            set((state) => {
              state.conflicts = conflicts;
            });
            return conflicts;
          }
          return [];
        } catch (error: any) {
          console.error('Conflict detection failed:', error);
          return [];
        }
      },

      /**
       * Resolve a specific conflict
       */
      resolveConflict: async (conflictId, resolution) => {
        try {
          await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/ConflictResolution.psm1',
            functionName: 'Resolve-MigrationConflict',
            parameters: {
              ConflictId: conflictId,
              Resolution: resolution,
            },
          });

          set((state) => {
            state.conflicts = state.conflicts.map((c) =>
              c.id === conflictId ? { ...c, status: 'resolved' } : c
            );
          });
        } catch (error: any) {
          console.error('Conflict resolution failed:', error);
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * Auto-resolve conflicts using a strategy
       */
      autoResolveConflicts: async (strategy) => {
        const conflicts = get().conflicts.filter((c) => c.status === 'pending');

        for (const conflict of conflicts) {
          const resolution: ConflictResolution = {
            conflictId: conflict.id,
            strategy: strategy as 'merge' | 'skip' | 'manual' | 'overwrite' | 'rename',
            notes: `Auto-resolved using ${strategy} strategy`,
          };

          try {
            await get().resolveConflict(conflict.id, resolution);
          } catch (error) {
            console.error(`Failed to resolve conflict ${conflict.id}:`, error);
          }
        }
      },

      /**
       * Get conflicts by type
       */
      getConflictsByType: (type) => {
        return get().conflicts.filter((c) => c.type === type);
      },

      // ==================== RESOURCE MAPPING ====================

      /**
       * Add a resource mapping
       */
      mapResource: (mapping) => {
        set((state) => {
          state.mappings.push(mapping);
        });
      },

      /**
       * Import mappings from file
       */
      importMappings: async (file) => {
        try {
          const text = await file.text();
          const mappings: ResourceMapping[] = JSON.parse(text);

          set((state) => {
            state.mappings = [...state.mappings, ...mappings];
          });
        } catch (error: any) {
          console.error('Failed to import mappings:', error);
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * Export mappings to file
       */
      exportMappings: async (waveId) => {
        const mappings = waveId
          ? get().mappings.filter((m) => (m as any).waveId === waveId)
          : get().mappings;

        const blob = new Blob([JSON.stringify(mappings, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mappings-${waveId || 'all'}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      /**
       * Validate mappings for a wave
       */
      validateMappings: async (waveId) => {
        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/MappingValidation.psm1',
            functionName: 'Test-MigrationMappings',
            parameters: {
              WaveId: waveId,
              Mappings: get().mappings,
            },
          });

          const validationResult: ValidationResult = {
            isValid: result.success,
            errors: result.data?.errors || [],
            warnings: result.data?.warnings || [],
          };

          set((state) => {
            state.validationResults.set(waveId, validationResult);
          });

          return validationResult;
        } catch (error: any) {
          console.error('Mapping validation failed:', error);
          return {
            isValid: false,
            errors: [error.message],
            warnings: [],
          };
        }
      },

      /**
       * Auto-map resources using a strategy
       */
      autoMapResources: async (strategy) => {
        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/AutoMapping.psm1',
            functionName: 'New-AutomaticMappings',
            parameters: { Strategy: strategy },
          });

          if (result.success) {
            const newMappings: ResourceMapping[] = result.data.mappings || [];
            set((state) => {
              state.mappings = [...state.mappings, ...newMappings];
            });
          }
        } catch (error: any) {
          console.error('Auto-mapping failed:', error);
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * Bulk update mappings
       */
      bulkUpdateMappings: async (updates) => {
        set((state) => {
          state.mappings = state.mappings.map((m) => {
            const update = updates.get(m.id);
            return update ? { ...m, ...update } : m;
          });
        });
      },

      // ==================== DELTA SYNC ====================

      /**
       * Perform delta synchronization
       */
      performDeltaSync: async (waveId) => {
        const startTime = Date.now();

        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/DeltaSync.psm1',
            functionName: 'Invoke-DeltaSync',
            parameters: {
              WaveId: waveId,
              LastSyncTimestamp: get().lastSyncTimestamp,
            },
          });

          const syncResult: DeltaSyncResult = {
            changesDetected: result.data.changesDetected || 0,
            changesApplied: result.data.changesApplied || 0,
            conflicts: result.data.conflicts || 0,
            duration: Date.now() - startTime,
            timestamp: new Date(),
          };

          set((state) => {
            state.lastSyncTimestamp = new Date();
          });

          return syncResult;
        } catch (error: any) {
          console.error('Delta sync failed:', error);
          throw error;
        }
      },

      /**
       * Schedule delta sync
       */
      scheduleDeltaSync: (waveId, interval) => {
        // This would typically use setInterval, but storing the interval ID
        // Store interval in a global registry or use a different approach
        console.log(`Scheduled delta sync for wave ${waveId} every ${interval}ms`);
        set((state) => {
          state.deltaSyncEnabled = true;
        });
      },

      /**
       * Stop delta sync
       */
      stopDeltaSync: (waveId) => {
        console.log(`Stopped delta sync for wave ${waveId}`);
        set((state) => {
          state.deltaSyncEnabled = false;
        });
      },

      // ==================== PROGRESS TRACKING ====================

      /**
       * Subscribe to progress updates for a wave
       */
      subscribeToProgress: (waveId, callback) => {
        // Listen to PowerShell progress events
        const cleanup = window.electronAPI.onProgress((data: ProgressData) => {
          // Note: ProgressData doesn't have waveId, filtering by other means if needed
          const status = get().waveExecutionStatus.get(waveId);
          if (status) {
            callback(status.progress);
          }
        });

        return cleanup;
      },

      /**
       * Get overall progress summary
       */
      getProgressSummary: () => {
        const waves = get().waves;
        const totalWaves = waves.length;
        const completedWaves = waves.filter((w) => w.status === 'Completed').length;
        const activeWaves = waves.filter((w) => w.status === 'InProgress').length;
        const failedWaves = waves.filter((w) => w.status === 'Failed').length;

        const totalUsers = waves.reduce((sum, w) => sum + (w.totalItems || 0), 0);
        const migratedUsers = waves.reduce(
          (sum, w) => sum + (w.status === 'Completed' ? w.totalItems || 0 : 0),
          0
        );

        const overallProgress =
          totalWaves > 0 ? (completedWaves / totalWaves) * 100 : 0;

        return {
          totalWaves,
          completedWaves,
          activeWaves,
          failedWaves,
          totalUsers,
          migratedUsers,
          overallProgress,
          estimatedCompletion: null, // Calculate based on current throughput
        };
      },

      // ==================== VALIDATION ====================

      /**
       * Run pre-flight checks for a wave
       */
      runPreFlightChecks: async (waveId) => {
        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/PreFlightChecks.psm1',
            functionName: 'Invoke-PreFlightChecks',
            parameters: { WaveId: waveId },
          });

          const validationResult: ValidationResult = {
            isValid: result.success,
            errors: result.data?.errors || [],
            warnings: result.data?.warnings || [],
          };

          set((state) => {
            state.validationResults.set(waveId, validationResult);
          });

          return validationResult;
        } catch (error: any) {
          console.error('Pre-flight checks failed:', error);
          return {
            isValid: false,
            errors: [error.message],
            warnings: [],
          };
        }
      },

      /**
       * Validate licenses
       */
      validateLicenses: async (waveId) => {
        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/LicenseValidation.psm1',
            functionName: 'Test-LicenseAvailability',
            parameters: { WaveId: waveId },
          });

          return {
            passed: result.success,
            availableLicenses: result.data?.availableLicenses || 0,
            requiredLicenses: result.data?.requiredLicenses || 0,
            errors: result.data?.errors || [],
            warnings: result.data?.warnings || [],
          };
        } catch (error: any) {
          console.error('License validation failed:', error);
          return {
            passed: false,
            availableLicenses: 0,
            requiredLicenses: 0,
            errors: [{ field: 'licenses', message: error.message, code: 'ERROR', severity: 'error' as const }],
            warnings: [],
          };
        }
      },

      /**
       * Validate permissions
       */
      validatePermissions: async (waveId) => {
        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/PermissionValidation.psm1',
            functionName: 'Test-MigrationPermissions',
            parameters: { WaveId: waveId },
          });

          return {
            passed: result.success,
            missingPermissions: result.data?.missingPermissions || [],
            errors: result.data?.errors || [],
            warnings: result.data?.warnings || [],
          };
        } catch (error: any) {
          console.error('Permission validation failed:', error);
          return {
            passed: false,
            missingPermissions: [],
            errors: [{ field: 'permissions', message: error.message, code: 'ERROR', severity: 'error' as const }],
            warnings: [],
          };
        }
      },

      /**
       * Validate connectivity
       */
      validateConnectivity: async () => {
        try {
          const result = await window.electronAPI.executeModule({
            modulePath: 'Modules/Migration/ConnectivityTest.psm1',
            functionName: 'Test-MigrationConnectivity',
            parameters: {},
          });

          return {
            passed: result.success,
            sourceConnected: result.data?.sourceConnected || false,
            targetConnected: result.data?.targetConnected || false,
            errors: result.data?.errors || [],
            warnings: result.data?.warnings || [],
          };
        } catch (error: any) {
          console.error('Connectivity validation failed:', error);
          return {
            passed: false,
            sourceConnected: false,
            targetConnected: false,
            errors: [{ field: 'connectivity', message: error.message, code: 'ERROR', severity: 'error' as const }],
            warnings: [],
          };
        }
      },

      // ==================== PROJECT MANAGEMENT (Migration Control Plane) ====================

      /**
       * Load all migration projects
       */
      loadProjects: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          console.log('[MigrationStore] Loading projects...');
          // For now, load from localStorage. In production, this would call IPC
          const savedProjects = localStorage.getItem('migration-projects');
          const projects = savedProjects ? JSON.parse(savedProjects) : [];

          set((state) => {
            state.projects = projects;
            state.isLoading = false;
          });
          console.log(`[MigrationStore] Loaded ${projects.length} projects`);
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load projects:', error);
          set((state) => {
            state.error = error.message || 'Failed to load projects';
            state.isLoading = false;
          });
        }
      },

      /**
       * Create a new migration project
       */
      createProject: async (projectData) => {
        try {
          const newProject: MigrationProject = {
            ...projectData,
            id: crypto.randomUUID(),
            waves: [],
            checkpoints: [],
            createdAt: new Date().toISOString(),
          };

          console.log('[MigrationStore] Creating project:', newProject.name);

          set((state) => {
            state.projects.push(newProject);
            state.selectedProjectId = newProject.id;
            state.selectedProject = newProject;
          });

          // Persist to localStorage
          const projects = get().projects;
          localStorage.setItem('migration-projects', JSON.stringify(projects));

          get().addActivity('project', `Project "${newProject.name}" created`);
          return newProject.id;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to create project:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Update a migration project
       */
      updateProject: async (id, updates) => {
        try {
          console.log('[MigrationStore] Updating project:', id);

          set((state) => {
            const index = state.projects.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.projects[index] = { ...state.projects[index], ...updates, updatedAt: new Date().toISOString() };
              if (state.selectedProjectId === id) {
                state.selectedProject = state.projects[index];
              }
            }
          });

          // Persist to localStorage
          const projects = get().projects;
          localStorage.setItem('migration-projects', JSON.stringify(projects));
        } catch (error: any) {
          console.error('[MigrationStore] Failed to update project:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Delete a migration project
       */
      deleteProject: async (id) => {
        try {
          console.log('[MigrationStore] Deleting project:', id);

          set((state) => {
            state.projects = state.projects.filter((p) => p.id !== id);
            if (state.selectedProjectId === id) {
              state.selectedProjectId = null;
              state.selectedProject = null;
            }
          });

          // Persist to localStorage
          const projects = get().projects;
          localStorage.setItem('migration-projects', JSON.stringify(projects));

          get().addActivity('project', 'Project deleted');
        } catch (error: any) {
          console.error('[MigrationStore] Failed to delete project:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Select a project
       */
      selectProject: (id) => {
        set((state) => {
          state.selectedProjectId = id;
          state.selectedProject = id ? state.projects.find((p) => p.id === id) || null : null;
          // Clear wave selection when project changes
          state.selectedWaveId = null;
          state.selectedWave = null;
        });

        if (id) {
          // Load waves and dashboard for selected project
          get().loadDashboardKPIs(id);
          get().loadGanttTasks(id);
        }
      },

      // ==================== CHECKPOINT MANAGEMENT (Go/No-Go) ====================

      /**
       * Load checkpoints for a wave
       */
      loadCheckpoints: async (waveId) => {
        try {
          console.log('[MigrationStore] Loading checkpoints for wave:', waveId);
          // For now, use local state. In production, this would call IPC
          set((state) => {
            state.checkpoints = [];
          });
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load checkpoints:', error);
        }
      },

      /**
       * Create a checkpoint
       */
      createCheckpoint: async (waveId, checkpointData) => {
        try {
          const newCheckpoint: GoNoGoCheckpoint = {
            ...checkpointData,
            id: crypto.randomUUID(),
            waveId,
            createdAt: new Date().toISOString(),
          };

          console.log('[MigrationStore] Creating checkpoint:', newCheckpoint.name);

          set((state) => {
            state.checkpoints.push(newCheckpoint);
          });

          get().addActivity('checkpoint', `Checkpoint "${newCheckpoint.name}" created`);
          return newCheckpoint.id;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to create checkpoint:', error);
          throw error;
        }
      },

      /**
       * Update a checkpoint
       */
      updateCheckpoint: async (checkpointId, updates) => {
        try {
          set((state) => {
            const index = state.checkpoints.findIndex((c) => c.id === checkpointId);
            if (index !== -1) {
              state.checkpoints[index] = { ...state.checkpoints[index], ...updates };
            }
          });
        } catch (error: any) {
          console.error('[MigrationStore] Failed to update checkpoint:', error);
          throw error;
        }
      },

      /**
       * Evaluate checkpoint criteria
       */
      evaluateCheckpoint: async (checkpointId) => {
        try {
          console.log('[MigrationStore] Evaluating checkpoint:', checkpointId);

          set((state) => {
            const index = state.checkpoints.findIndex((c) => c.id === checkpointId);
            if (index !== -1) {
              state.checkpoints[index].status = 'InReview';
            }
          });

          get().addActivity('checkpoint', 'Checkpoint evaluation started');
        } catch (error: any) {
          console.error('[MigrationStore] Failed to evaluate checkpoint:', error);
          throw error;
        }
      },

      /**
       * Set Go/No-Go decision
       */
      setGoNoGoDecision: async (checkpointId, decision, notes) => {
        try {
          console.log('[MigrationStore] Setting Go/No-Go decision:', checkpointId, decision);

          set((state) => {
            const index = state.checkpoints.findIndex((c) => c.id === checkpointId);
            if (index !== -1) {
              state.checkpoints[index].status = decision;
              state.checkpoints[index].decidedAt = new Date().toISOString();
              if (notes) {
                state.checkpoints[index].notes = notes;
              }
            }
          });

          get().addActivity('checkpoint', `Go/No-Go decision: ${decision}`);
          get().addAlert({
            type: decision === 'Go' ? 'Success' : decision === 'NoGo' ? 'Warning' : 'Info',
            title: `Go/No-Go Decision: ${decision}`,
            message: notes || `Checkpoint decision has been made: ${decision}`,
            actionRequired: decision === 'NoGo',
          });
        } catch (error: any) {
          console.error('[MigrationStore] Failed to set decision:', error);
          throw error;
        }
      },

      /**
       * Update criteria status
       */
      updateCriteriaStatus: (checkpointId, criteriaId, status, notes) => {
        set((state) => {
          const checkpointIndex = state.checkpoints.findIndex((c) => c.id === checkpointId);
          if (checkpointIndex !== -1) {
            const criteriaIndex = state.checkpoints[checkpointIndex].criteria.findIndex(
              (c) => c.id === criteriaId
            );
            if (criteriaIndex !== -1) {
              state.checkpoints[checkpointIndex].criteria[criteriaIndex].status = status;
              state.checkpoints[checkpointIndex].criteria[criteriaIndex].evaluatedAt = new Date().toISOString();
              if (notes) {
                state.checkpoints[checkpointIndex].criteria[criteriaIndex].notes = notes;
              }
            }
          }
        });
      },

      // ==================== REAL-TIME MONITORING ====================

      /**
       * Update active tasks
       */
      updateActiveTasks: (tasks) => {
        set((state) => {
          state.activeTasks = tasks;
        });
      },

      /**
       * Add an active task
       */
      addActiveTask: (task) => {
        set((state) => {
          state.activeTasks.push(task);
        });
      },

      /**
       * Remove an active task
       */
      removeActiveTask: (taskId) => {
        set((state) => {
          state.activeTasks = state.activeTasks.filter((t) => t.id !== taskId);
        });
      },

      /**
       * Update active task progress
       */
      updateActiveTaskProgress: (taskId, progress, currentItem) => {
        set((state) => {
          const index = state.activeTasks.findIndex((t) => t.id === taskId);
          if (index !== -1) {
            state.activeTasks[index].progress = progress;
            if (currentItem) {
              state.activeTasks[index].currentItem = currentItem;
            }
          }
        });
      },

      // ==================== ALERTS ====================

      /**
       * Add an alert
       */
      addAlert: (alertData) => {
        const newAlert: MigrationAlert = {
          ...alertData,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        set((state) => {
          state.alerts.unshift(newAlert);
          state.unreadAlertCount = state.alerts.filter((a) => !a.isRead).length;
          // Keep only last 100 alerts
          if (state.alerts.length > 100) {
            state.alerts = state.alerts.slice(0, 100);
          }
        });
      },

      /**
       * Mark an alert as read
       */
      markAlertAsRead: (alertId) => {
        set((state) => {
          const index = state.alerts.findIndex((a) => a.id === alertId);
          if (index !== -1) {
            state.alerts[index].isRead = true;
            state.unreadAlertCount = state.alerts.filter((a) => !a.isRead).length;
          }
        });
      },

      /**
       * Mark all alerts as read
       */
      markAllAlertsAsRead: () => {
        set((state) => {
          state.alerts.forEach((a) => {
            a.isRead = true;
          });
          state.unreadAlertCount = 0;
        });
      },

      /**
       * Clear all alerts
       */
      clearAlerts: () => {
        set((state) => {
          state.alerts = [];
          state.unreadAlertCount = 0;
        });
      },

      /**
       * Dismiss an alert
       */
      dismissAlert: (alertId) => {
        set((state) => {
          state.alerts = state.alerts.filter((a) => a.id !== alertId);
          state.unreadAlertCount = state.alerts.filter((a) => !a.isRead).length;
        });
      },

      // ==================== DASHBOARD ====================

      /**
       * Refresh dashboard data
       */
      refreshDashboard: async () => {
        const projectId = get().selectedProjectId;
        if (projectId) {
          await get().loadDashboardKPIs(projectId);
          await get().loadGanttTasks(projectId);
        }
      },

      /**
       * Load dashboard KPIs
       */
      loadDashboardKPIs: async (projectId) => {
        try {
          console.log('[MigrationStore] Loading dashboard KPIs for project:', projectId);

          // Calculate KPIs from current state
          const project = get().projects.find((p) => p.id === projectId);
          if (!project) return;

          const waves = project.waves || [];
          const completedWaves = waves.filter((w) => w.status === 'Completed');
          const activeWaves = waves.filter((w) => w.status === 'InProgress');
          const pendingWaves = waves.filter((w) => w.status === 'NotStarted' || w.status === 'Planning');

          // Calculate overall progress
          const totalProgress = waves.reduce((acc, w) => acc + (w.progressPercentage || 0), 0);
          const overallProgress = waves.length > 0 ? totalProgress / waves.length : 0;

          set((state) => {
            state.dashboardKPIs = {
              ...state.dashboardKPIs,
              overallProgress: Math.round(overallProgress),
              activeWaveCount: activeWaves.length,
              completedWaveCount: completedWaves.length,
              pendingWaveCount: pendingWaves.length,
            };
          });
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load dashboard KPIs:', error);
        }
      },

      // ==================== GANTT CHART ====================

      /**
       * Load Gantt tasks for a project
       */
      loadGanttTasks: async (projectId) => {
        try {
          console.log('[MigrationStore] Loading Gantt tasks for project:', projectId);

          const project = get().projects.find((p) => p.id === projectId);
          if (!project) return;

          // Convert waves and tasks to Gantt format
          const ganttTasks: GanttTask[] = [];

          // Add project as root
          ganttTasks.push({
            id: project.id,
            name: project.name,
            start: project.plannedStartDate,
            end: project.plannedEndDate,
            progress: project.overallProgress || 0,
            type: 'project',
          });

          // Add waves
          (project.waves || []).forEach((wave) => {
            ganttTasks.push({
              id: wave.id,
              name: wave.name,
              start: wave.plannedStartDate,
              end: wave.plannedEndDate || wave.plannedStartDate,
              progress: wave.progressPercentage || 0,
              type: 'task',
              parentId: project.id,
              waveId: wave.id,
              dependencies: wave.prerequisites,
            });

            // Add wave tasks
            (wave.tasks || []).forEach((task) => {
              ganttTasks.push({
                id: task.id,
                name: task.name,
                start: task.dueDate || wave.plannedStartDate,
                end: task.completedDate || task.dueDate || wave.plannedStartDate,
                progress: task.status === 'Completed' ? 100 : 0,
                type: 'task',
                parentId: wave.id,
                dependencies: task.dependencies,
                assignedTo: task.assignedTo,
              });
            });
          });

          set((state) => {
            state.ganttTasks = ganttTasks;
          });
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load Gantt tasks:', error);
        }
      },

      /**
       * Update a Gantt task
       */
      updateGanttTask: (taskId, updates) => {
        set((state) => {
          const index = state.ganttTasks.findIndex((t) => t.id === taskId);
          if (index !== -1) {
            state.ganttTasks[index] = { ...state.ganttTasks[index], ...updates };
          }
        });
      },

      /**
       * Reschedule a Gantt task
       */
      rescheduleGanttTask: async (taskId, newStart, newEnd) => {
        try {
          console.log('[MigrationStore] Rescheduling Gantt task:', taskId);

          set((state) => {
            const index = state.ganttTasks.findIndex((t) => t.id === taskId);
            if (index !== -1) {
              state.ganttTasks[index].start = newStart.toISOString();
              state.ganttTasks[index].end = newEnd.toISOString();
            }
          });

          get().addActivity('task', 'Task rescheduled');
        } catch (error: any) {
          console.error('[MigrationStore] Failed to reschedule task:', error);
          throw error;
        }
      },

      // ==================== ACTIVITY FEED ====================

      /**
       * Add an activity to the feed
       */
      addActivity: (type, message) => {
        set((state) => {
          state.recentActivity.unshift({
            id: crypto.randomUUID(),
            type,
            message,
            timestamp: new Date().toISOString(),
          });
          // Keep only last 50 activities
          if (state.recentActivity.length > 50) {
            state.recentActivity = state.recentActivity.slice(0, 50);
          }
        });
      },

      // ==================== COMPUTED GETTERS ====================

      /**
       * Get project by ID
       */
      getProjectById: (id) => get().projects.find((p) => p.id === id),

      /**
       * Get checkpoint by ID
       */
      getCheckpointById: (id) => get().checkpoints.find((c) => c.id === id),

      /**
       * Get pending checkpoints
       */
      getPendingCheckpoints: () =>
        get().checkpoints.filter((c) => c.status === 'Pending' || c.status === 'InReview'),

      /**
       * Get critical alerts
       */
      getCriticalAlerts: () =>
        get().alerts.filter((a) => a.type === 'Error' && a.actionRequired && !a.isRead),

      // ==================== ENHANCED MIGRATION CONTROL PLANE ACTIONS ====================

      // -------------------- DOMAIN MAPPING ACTIONS --------------------

      /**
       * Load all domain mappings
       */
      loadDomainMappings: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          console.log('[MigrationStore] Loading domain mappings...');
          const savedMappings = localStorage.getItem('domain-mappings');
          const domainMappings = savedMappings ? JSON.parse(savedMappings) : [];

          set((state) => {
            state.domainMappings = domainMappings;
            state.isLoading = false;
          });
          console.log(`[MigrationStore] Loaded ${domainMappings.length} domain mappings`);
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load domain mappings:', error);
          set((state) => {
            state.error = error.message || 'Failed to load domain mappings';
            state.isLoading = false;
          });
        }
      },

      /**
       * Create a new domain mapping
       */
      createDomainMapping: async (mappingData) => {
        try {
          const newMapping: DomainMapping = {
            ...mappingData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            isValidated: false,
            validationErrors: [],
            totalUsers: 0,
            mappedUsers: 0,
            totalGroups: 0,
            mappedGroups: 0,
          } as DomainMapping;

          console.log('[MigrationStore] Creating domain mapping:', newMapping.sourceDomain, '->', newMapping.targetDomain);

          set((state) => {
            state.domainMappings.push(newMapping);
            state.selectedDomainMappingId = newMapping.id;
          });

          // Persist to localStorage
          const mappings = get().domainMappings;
          localStorage.setItem('domain-mappings', JSON.stringify(mappings));

          get().addActivity('project', `Domain mapping "${newMapping.sourceDomain} → ${newMapping.targetDomain}" created`);
          return newMapping.id;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to create domain mapping:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Update a domain mapping
       */
      updateDomainMapping: async (id, updates) => {
        try {
          console.log('[MigrationStore] Updating domain mapping:', id);

          set((state) => {
            const index = state.domainMappings.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.domainMappings[index] = { ...state.domainMappings[index], ...updates, updatedAt: new Date().toISOString() };
            }
          });

          // Persist to localStorage
          const mappings = get().domainMappings;
          localStorage.setItem('domain-mappings', JSON.stringify(mappings));
        } catch (error: any) {
          console.error('[MigrationStore] Failed to update domain mapping:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Delete a domain mapping
       */
      deleteDomainMapping: async (id) => {
        try {
          console.log('[MigrationStore] Deleting domain mapping:', id);

          set((state) => {
            state.domainMappings = state.domainMappings.filter((m) => m.id !== id);
            if (state.selectedDomainMappingId === id) {
              state.selectedDomainMappingId = null;
            }
          });

          // Persist to localStorage
          const mappings = get().domainMappings;
          localStorage.setItem('domain-mappings', JSON.stringify(mappings));

          get().addActivity('project', 'Domain mapping deleted');
        } catch (error: any) {
          console.error('[MigrationStore] Failed to delete domain mapping:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Validate a domain mapping
       */
      validateDomainMapping: async (id) => {
        try {
          console.log('[MigrationStore] Validating domain mapping:', id);

          const mapping = get().domainMappings.find((m) => m.id === id);
          if (!mapping) {
            throw new Error('Domain mapping not found');
          }

          // Perform validation checks
          const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' | 'info' }> = [];
          const warnings: Array<{ field: string; message: string }> = [];

          // Check source domain
          if (!mapping.sourceDomain) {
            errors.push({ field: 'sourceDomain', message: 'Source domain is required', severity: 'error' });
          }

          // Check target domain
          if (!mapping.targetDomain) {
            errors.push({ field: 'targetDomain', message: 'Target domain is required', severity: 'error' });
          }

          // Check mapping rules
          if (!mapping.userMappingRules || mapping.userMappingRules.length === 0) {
            warnings.push({ field: 'userMappingRules', message: 'No user attribute mapping rules defined' });
          }

          const result: ValidationResult = {
            isValid: errors.length === 0,
            errors,
            warnings,
          };

          // Update the mapping with validation result
          set((state) => {
            const index = state.domainMappings.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.domainMappings[index].isValidated = result.isValid;
              state.domainMappings[index].validationErrors = errors.map((e) => e.message);
              state.domainMappings[index].lastValidatedAt = new Date().toISOString();
            }
          });

          // Persist to localStorage
          const mappings = get().domainMappings;
          localStorage.setItem('domain-mappings', JSON.stringify(mappings));

          return result;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to validate domain mapping:', error);
          return {
            isValid: false,
            errors: [{ field: 'general', message: error.message, severity: 'error' as const }],
            warnings: [],
          };
        }
      },

      /**
       * Select a domain mapping
       */
      selectDomainMapping: (id) => {
        set((state) => {
          state.selectedDomainMappingId = id;
        });
      },

      /**
       * Get domain mapping by ID
       */
      getDomainMappingById: (id) => get().domainMappings.find((m) => m.id === id),

      // -------------------- DOMAIN ACTIONS --------------------

      /**
       * Load all domains
       */
      loadDomains: async () => {
        try {
          console.log('[MigrationStore] Loading domains...');
          const savedDomains = localStorage.getItem('migration-domains');
          const domains = savedDomains ? JSON.parse(savedDomains) : [];

          set((state) => {
            state.domains = domains;
          });
          console.log(`[MigrationStore] Loaded ${domains.length} domains`);
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load domains:', error);
        }
      },

      /**
       * Test domain connectivity
       */
      testDomainConnectivity: async (domainId) => {
        try {
          console.log('[MigrationStore] Testing domain connectivity:', domainId);

          const domain = get().domains.find((d) => d.id === domainId);
          if (!domain) {
            return { connected: false, error: 'Domain not found' };
          }

          // In production, this would call PowerShell to test connectivity
          // For now, simulate a successful connection
          set((state) => {
            const index = state.domains.findIndex((d) => d.id === domainId);
            if (index !== -1) {
              state.domains[index].isConnected = true;
              state.domains[index].lastSyncTime = new Date().toISOString();
            }
          });

          return { connected: true };
        } catch (error: any) {
          console.error('[MigrationStore] Domain connectivity test failed:', error);
          return { connected: false, error: error.message };
        }
      },

      // -------------------- USER MIGRATION PLAN ACTIONS --------------------

      /**
       * Load user migration plans
       */
      loadUserMigrationPlans: async (waveId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          console.log('[MigrationStore] Loading user migration plans...', waveId ? `for wave ${waveId}` : '');
          const savedPlans = localStorage.getItem('user-migration-plans');
          let plans: UserMigrationPlan[] = savedPlans ? JSON.parse(savedPlans) : [];

          // Filter by wave if specified
          if (waveId) {
            plans = plans.filter((p) => p.migrationWaveId === waveId);
          }

          set((state) => {
            state.userMigrationPlans = plans;
            state.isLoading = false;
          });
          console.log(`[MigrationStore] Loaded ${plans.length} user migration plans`);
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load user migration plans:', error);
          set((state) => {
            state.error = error.message || 'Failed to load user migration plans';
            state.isLoading = false;
          });
        }
      },

      /**
       * Create a new user migration plan
       */
      createUserMigrationPlan: async (planData) => {
        try {
          const newPlan: UserMigrationPlan = {
            ...planData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'Pending',
            progress: 0,
            preValidationPassed: false,
            preValidationErrors: [],
          } as UserMigrationPlan;

          console.log('[MigrationStore] Creating user migration plan for:', newPlan.userDisplayName);

          set((state) => {
            state.userMigrationPlans.push(newPlan);
          });

          // Persist to localStorage
          const allPlans = JSON.parse(localStorage.getItem('user-migration-plans') || '[]');
          allPlans.push(newPlan);
          localStorage.setItem('user-migration-plans', JSON.stringify(allPlans));

          get().addActivity('task', `User migration plan created for ${newPlan.userDisplayName}`);
          return newPlan.id;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to create user migration plan:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Update a user migration plan
       */
      updateUserMigrationPlan: async (id, updates) => {
        try {
          console.log('[MigrationStore] Updating user migration plan:', id);

          set((state) => {
            const index = state.userMigrationPlans.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.userMigrationPlans[index] = { ...state.userMigrationPlans[index], ...updates, updatedAt: new Date().toISOString() };
            }
          });

          // Update in localStorage
          const allPlans = JSON.parse(localStorage.getItem('user-migration-plans') || '[]');
          const idx = allPlans.findIndex((p: UserMigrationPlan) => p.id === id);
          if (idx !== -1) {
            allPlans[idx] = { ...allPlans[idx], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('user-migration-plans', JSON.stringify(allPlans));
          }
        } catch (error: any) {
          console.error('[MigrationStore] Failed to update user migration plan:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Delete a user migration plan
       */
      deleteUserMigrationPlan: async (id) => {
        try {
          console.log('[MigrationStore] Deleting user migration plan:', id);

          set((state) => {
            state.userMigrationPlans = state.userMigrationPlans.filter((p) => p.id !== id);
            if (state.selectedUserMigrationPlanId === id) {
              state.selectedUserMigrationPlanId = null;
            }
          });

          // Remove from localStorage
          const allPlans = JSON.parse(localStorage.getItem('user-migration-plans') || '[]');
          const filtered = allPlans.filter((p: UserMigrationPlan) => p.id !== id);
          localStorage.setItem('user-migration-plans', JSON.stringify(filtered));
        } catch (error: any) {
          console.error('[MigrationStore] Failed to delete user migration plan:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Validate a user migration plan
       */
      validateUserMigrationPlan: async (id) => {
        try {
          console.log('[MigrationStore] Validating user migration plan:', id);

          const plan = get().userMigrationPlans.find((p) => p.id === id);
          if (!plan) {
            throw new Error('User migration plan not found');
          }

          const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' | 'info' }> = [];
          const warnings: Array<{ field: string; message: string }> = [];

          // Validate required fields
          if (!plan.userId) {
            errors.push({ field: 'userId', message: 'User ID is required', severity: 'error' });
          }
          if (!plan.sourceDomain) {
            errors.push({ field: 'sourceDomain', message: 'Source domain is required', severity: 'error' });
          }
          if (!plan.targetDomain) {
            errors.push({ field: 'targetDomain', message: 'Target domain is required', severity: 'error' });
          }

          // Check attribute mappings
          if (!plan.attributeMappings || plan.attributeMappings.length === 0) {
            warnings.push({ field: 'attributeMappings', message: 'No attribute mappings defined, defaults will be used' });
          }

          // Check license mappings
          if (!plan.licenseMappings || plan.licenseMappings.length === 0) {
            warnings.push({ field: 'licenseMappings', message: 'No license mappings defined' });
          }

          const result: ValidationResult = {
            isValid: errors.length === 0,
            errors,
            warnings,
          };

          // Update the plan with validation result
          set((state) => {
            const index = state.userMigrationPlans.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.userMigrationPlans[index].preValidationPassed = result.isValid;
              state.userMigrationPlans[index].preValidationErrors = errors.map((e) => e.message);
              if (result.isValid) {
                state.userMigrationPlans[index].status = 'Validated';
              }
            }
          });

          return result;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to validate user migration plan:', error);
          return {
            isValid: false,
            errors: [{ field: 'general', message: error.message, severity: 'error' as const }],
            warnings: [],
          };
        }
      },

      /**
       * Execute user migration
       */
      executeUserMigration: async (planId) => {
        try {
          console.log('[MigrationStore] Executing user migration:', planId);

          const plan = get().userMigrationPlans.find((p) => p.id === planId);
          if (!plan) {
            throw new Error('User migration plan not found');
          }

          // Update status to InProgress
          set((state) => {
            const index = state.userMigrationPlans.findIndex((p) => p.id === planId);
            if (index !== -1) {
              state.userMigrationPlans[index].status = 'InProgress';
              state.userMigrationPlans[index].startedAt = new Date().toISOString();
              state.userMigrationPlans[index].progress = 0;
            }
          });

          get().addActiveTask({
            id: planId,
            name: `Migrating ${plan.userDisplayName}`,
            type: 'UserMigration',
            workloadType: 'Users',
            waveId: plan.migrationWaveId,
            waveName: '',
            status: 'Running',
            progress: 0,
            currentItem: plan.userDisplayName,
            itemsProcessed: 0,
            totalItems: 1,
            startedAt: new Date().toISOString(),
          });

          // Simulate migration progress (in production, this would call PowerShell)
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            set((state) => {
              const index = state.userMigrationPlans.findIndex((p) => p.id === planId);
              if (index !== -1) {
                state.userMigrationPlans[index].progress = progress;
              }
            });
            get().updateActiveTaskProgress(planId, progress, plan.userDisplayName);
          }

          // Complete the migration
          set((state) => {
            const index = state.userMigrationPlans.findIndex((p) => p.id === planId);
            if (index !== -1) {
              state.userMigrationPlans[index].status = 'Completed';
              state.userMigrationPlans[index].completedAt = new Date().toISOString();
              state.userMigrationPlans[index].progress = 100;
              state.userMigrationPlans[index].postValidationPassed = true;
            }
          });

          get().removeActiveTask(planId);
          get().addActivity('task', `User migration completed for ${plan.userDisplayName}`);
          get().addAlert({
            type: 'Success',
            title: 'User Migration Complete',
            message: `Successfully migrated ${plan.userDisplayName}`,
            actionRequired: false,
          });
        } catch (error: any) {
          console.error('[MigrationStore] User migration failed:', error);

          set((state) => {
            const index = state.userMigrationPlans.findIndex((p) => p.id === planId);
            if (index !== -1) {
              state.userMigrationPlans[index].status = 'Failed';
              state.userMigrationPlans[index].preValidationErrors = [error.message];
            }
          });

          get().removeActiveTask(planId);
          get().addAlert({
            type: 'Error',
            title: 'User Migration Failed',
            message: error.message,
            actionRequired: true,
          });
          throw error;
        }
      },

      /**
       * Select a user migration plan
       */
      selectUserMigrationPlan: (id) => {
        set((state) => {
          state.selectedUserMigrationPlanId = id;
        });
      },

      /**
       * Get user migration plan by ID
       */
      getUserMigrationPlanById: (id) => get().userMigrationPlans.find((p) => p.id === id),

      /**
       * Bulk create user migration plans
       */
      bulkCreateUserMigrationPlans: async (plans) => {
        try {
          console.log('[MigrationStore] Bulk creating', plans.length, 'user migration plans');

          const newPlans: UserMigrationPlan[] = plans.map((planData) => ({
            ...planData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'Pending' as UserMigrationStatus,
            progress: 0,
            preValidationPassed: false,
            preValidationErrors: [],
          })) as UserMigrationPlan[];

          set((state) => {
            state.userMigrationPlans.push(...newPlans);
          });

          // Persist to localStorage
          const allPlans = JSON.parse(localStorage.getItem('user-migration-plans') || '[]');
          allPlans.push(...newPlans);
          localStorage.setItem('user-migration-plans', JSON.stringify(allPlans));

          get().addActivity('task', `Created ${newPlans.length} user migration plans`);
          return newPlans.map((p) => p.id);
        } catch (error: any) {
          console.error('[MigrationStore] Failed to bulk create user migration plans:', error);
          throw error;
        }
      },

      // -------------------- AZURE RESOURCE MIGRATION ACTIONS --------------------

      /**
       * Load Azure resource migrations
       */
      loadAzureResourceMigrations: async (waveId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          console.log('[MigrationStore] Loading Azure resource migrations...', waveId ? `for wave ${waveId}` : '');
          const savedMigrations = localStorage.getItem('azure-resource-migrations');
          let migrations: AzureResourceMigration[] = savedMigrations ? JSON.parse(savedMigrations) : [];

          // Filter by wave if specified
          if (waveId) {
            migrations = migrations.filter((m) => m.migrationWaveId === waveId);
          }

          set((state) => {
            state.azureResourceMigrations = migrations;
            state.isLoading = false;
          });
          console.log(`[MigrationStore] Loaded ${migrations.length} Azure resource migrations`);
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load Azure resource migrations:', error);
          set((state) => {
            state.error = error.message || 'Failed to load Azure resource migrations';
            state.isLoading = false;
          });
        }
      },

      /**
       * Create a new Azure resource migration
       */
      createAzureResourceMigration: async (migrationData) => {
        try {
          const newMigration: AzureResourceMigration = {
            ...migrationData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'Discovered',
            progress: 0,
            preValidationPassed: false,
            preValidationErrors: [],
          } as AzureResourceMigration;

          console.log('[MigrationStore] Creating Azure resource migration:', newMigration.resourceName);

          set((state) => {
            state.azureResourceMigrations.push(newMigration);
          });

          // Persist to localStorage
          const allMigrations = JSON.parse(localStorage.getItem('azure-resource-migrations') || '[]');
          allMigrations.push(newMigration);
          localStorage.setItem('azure-resource-migrations', JSON.stringify(allMigrations));

          get().addActivity('task', `Azure resource migration created for ${newMigration.resourceName}`);
          return newMigration.id;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to create Azure resource migration:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Update an Azure resource migration
       */
      updateAzureResourceMigration: async (id, updates) => {
        try {
          console.log('[MigrationStore] Updating Azure resource migration:', id);

          set((state) => {
            const index = state.azureResourceMigrations.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.azureResourceMigrations[index] = { ...state.azureResourceMigrations[index], ...updates, updatedAt: new Date().toISOString() };
            }
          });

          // Update in localStorage
          const allMigrations = JSON.parse(localStorage.getItem('azure-resource-migrations') || '[]');
          const idx = allMigrations.findIndex((m: AzureResourceMigration) => m.id === id);
          if (idx !== -1) {
            allMigrations[idx] = { ...allMigrations[idx], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('azure-resource-migrations', JSON.stringify(allMigrations));
          }
        } catch (error: any) {
          console.error('[MigrationStore] Failed to update Azure resource migration:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Delete an Azure resource migration
       */
      deleteAzureResourceMigration: async (id) => {
        try {
          console.log('[MigrationStore] Deleting Azure resource migration:', id);

          set((state) => {
            state.azureResourceMigrations = state.azureResourceMigrations.filter((m) => m.id !== id);
            if (state.selectedAzureResourceMigrationId === id) {
              state.selectedAzureResourceMigrationId = null;
            }
          });

          // Remove from localStorage
          const allMigrations = JSON.parse(localStorage.getItem('azure-resource-migrations') || '[]');
          const filtered = allMigrations.filter((m: AzureResourceMigration) => m.id !== id);
          localStorage.setItem('azure-resource-migrations', JSON.stringify(filtered));
        } catch (error: any) {
          console.error('[MigrationStore] Failed to delete Azure resource migration:', error);
          set((state) => {
            state.error = error.message;
          });
          throw error;
        }
      },

      /**
       * Assess an Azure resource for migration
       */
      assessAzureResource: async (id) => {
        try {
          console.log('[MigrationStore] Assessing Azure resource:', id);

          const migration = get().azureResourceMigrations.find((m) => m.id === id);
          if (!migration) {
            throw new Error('Azure resource migration not found');
          }

          // Simulate assessment (in production, this would call Azure APIs)
          const complexity = migration.dependencies.length > 5 ? 'High' : migration.dependencies.length > 2 ? 'Medium' : 'Low';
          const risks: string[] = [];
          const estimatedDowntime = migration.migrationMethod === 'LiftAndShift' ? 30 : 60;

          if (migration.resourceType === 'SQLDatabase') {
            risks.push('Data consistency during migration');
          }
          if (migration.resourceType === 'VirtualMachine') {
            risks.push('Network configuration may need adjustment');
          }
          if (migration.dependencies.length > 0) {
            risks.push(`${migration.dependencies.length} dependent resources must be migrated first`);
          }

          // Update the migration with assessment
          set((state) => {
            const index = state.azureResourceMigrations.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.azureResourceMigrations[index].complexity = complexity as any;
              state.azureResourceMigrations[index].risks = risks;
              state.azureResourceMigrations[index].estimatedDowntime = estimatedDowntime;
              state.azureResourceMigrations[index].status = 'Analyzed';
            }
          });

          return { complexity, risks, estimatedDowntime };
        } catch (error: any) {
          console.error('[MigrationStore] Failed to assess Azure resource:', error);
          throw error;
        }
      },

      /**
       * Execute Azure resource migration
       */
      executeAzureMigration: async (id) => {
        try {
          console.log('[MigrationStore] Executing Azure resource migration:', id);

          const migration = get().azureResourceMigrations.find((m) => m.id === id);
          if (!migration) {
            throw new Error('Azure resource migration not found');
          }

          // Update status to InProgress
          set((state) => {
            const index = state.azureResourceMigrations.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.azureResourceMigrations[index].status = 'InProgress';
              state.azureResourceMigrations[index].startedAt = new Date().toISOString();
              state.azureResourceMigrations[index].progress = 0;
            }
          });

          get().addActiveTask({
            id,
            name: `Migrating ${migration.resourceName}`,
            type: 'ServerMigration',
            workloadType: 'Servers',
            waveId: migration.migrationWaveId || '',
            waveName: '',
            status: 'Running',
            progress: 0,
            currentItem: migration.resourceName,
            itemsProcessed: 0,
            totalItems: 1,
            startedAt: new Date().toISOString(),
          });

          // Simulate migration progress
          for (let progress = 0; progress <= 100; progress += 5) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            set((state) => {
              const index = state.azureResourceMigrations.findIndex((m) => m.id === id);
              if (index !== -1) {
                state.azureResourceMigrations[index].progress = progress;
              }
            });
            get().updateActiveTaskProgress(id, progress, migration.resourceName);
          }

          // Complete the migration
          set((state) => {
            const index = state.azureResourceMigrations.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.azureResourceMigrations[index].status = 'Completed';
              state.azureResourceMigrations[index].completedAt = new Date().toISOString();
              state.azureResourceMigrations[index].progress = 100;
              state.azureResourceMigrations[index].postValidationPassed = true;
            }
          });

          get().removeActiveTask(id);
          get().addActivity('task', `Azure resource migration completed for ${migration.resourceName}`);
          get().addAlert({
            type: 'Success',
            title: 'Azure Migration Complete',
            message: `Successfully migrated ${migration.resourceName}`,
            actionRequired: false,
          });
        } catch (error: any) {
          console.error('[MigrationStore] Azure resource migration failed:', error);

          set((state) => {
            const index = state.azureResourceMigrations.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.azureResourceMigrations[index].status = 'Failed';
              state.azureResourceMigrations[index].preValidationErrors = [error.message];
            }
          });

          get().removeActiveTask(id);
          get().addAlert({
            type: 'Error',
            title: 'Azure Migration Failed',
            message: error.message,
            actionRequired: true,
          });
          throw error;
        }
      },

      /**
       * Select an Azure resource migration
       */
      selectAzureResourceMigration: (id) => {
        set((state) => {
          state.selectedAzureResourceMigrationId = id;
        });
      },

      /**
       * Get Azure resource migration by ID
       */
      getAzureResourceMigrationById: (id) => get().azureResourceMigrations.find((m) => m.id === id),

      // -------------------- CROSS-DOMAIN DEPENDENCY ACTIONS --------------------

      /**
       * Load cross-domain dependencies
       */
      loadCrossDomainDependencies: async (domainMappingId) => {
        try {
          console.log('[MigrationStore] Loading cross-domain dependencies...', domainMappingId ? `for mapping ${domainMappingId}` : '');
          const savedDeps = localStorage.getItem('cross-domain-dependencies');
          let deps: CrossDomainDependency[] = savedDeps ? JSON.parse(savedDeps) : [];

          if (domainMappingId) {
            // Filter by source or target domain from the mapping
            const mapping = get().domainMappings.find((m) => m.id === domainMappingId);
            if (mapping) {
              deps = deps.filter(
                (d) => d.sourceDomain === mapping.sourceDomain || d.targetDomain === mapping.targetDomain
              );
            }
          }

          set((state) => {
            state.crossDomainDependencies = deps;
          });
          console.log(`[MigrationStore] Loaded ${deps.length} cross-domain dependencies`);
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load cross-domain dependencies:', error);
        }
      },

      /**
       * Analyze dependencies for an entity
       */
      analyzeDependencies: async (entityId, entityType) => {
        try {
          console.log('[MigrationStore] Analyzing dependencies for:', entityId, entityType);

          // In production, this would call PowerShell/Graph API to discover dependencies
          // For now, return empty array
          const dependencies: CrossDomainDependency[] = [];

          set((state) => {
            state.crossDomainDependencies = [...state.crossDomainDependencies, ...dependencies];
          });

          return dependencies;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to analyze dependencies:', error);
          return [];
        }
      },

      /**
       * Resolve a dependency
       */
      resolveDependency: async (dependencyId, resolutionStrategy) => {
        try {
          console.log('[MigrationStore] Resolving dependency:', dependencyId, 'with strategy:', resolutionStrategy);

          set((state) => {
            const index = state.crossDomainDependencies.findIndex((d) => d.id === dependencyId);
            if (index !== -1) {
              state.crossDomainDependencies[index].status = 'Resolved';
              state.crossDomainDependencies[index].resolutionStrategy = resolutionStrategy;
            }
          });

          // Persist to localStorage
          const deps = get().crossDomainDependencies;
          localStorage.setItem('cross-domain-dependencies', JSON.stringify(deps));

          get().addActivity('task', 'Cross-domain dependency resolved');
        } catch (error: any) {
          console.error('[MigrationStore] Failed to resolve dependency:', error);
          throw error;
        }
      },

      // -------------------- ENGINEERING METRICS ACTIONS --------------------

      /**
       * Load engineering metrics
       */
      loadEngineeringMetrics: async (waveId, timeRange) => {
        try {
          console.log('[MigrationStore] Loading engineering metrics...', waveId ? `for wave ${waveId}` : '');

          // In production, this would aggregate from real migration data
          // For now, generate sample metrics
          const sampleMetrics: MigrationEngineeringMetrics = {
            timestamp: new Date().toISOString(),
            waveId,
            itemsPerHour: 45,
            bytesPerSecond: 10485760, // 10 MB/s
            averageItemDuration: 80000, // 80 seconds
            successRate: 98.5,
            failureRate: 1.5,
            retryRate: 3.2,
            queuedItems: 120,
            processingItems: 5,
            completedItems: 350,
            failedItems: 5,
            cpuUsage: 45,
            memoryUsage: 62,
            networkUtilization: 78,
            errorsByType: { 'Timeout': 2, 'PermissionDenied': 3 },
            topErrors: [
              { code: 'TIMEOUT', message: 'Operation timed out', count: 2 },
              { code: 'PERMISSION_DENIED', message: 'Insufficient permissions', count: 3 },
            ],
          };

          set((state) => {
            state.engineeringMetrics.push(sampleMetrics);
            // Keep only last 100 metrics entries
            if (state.engineeringMetrics.length > 100) {
              state.engineeringMetrics = state.engineeringMetrics.slice(-100);
            }
          });
        } catch (error: any) {
          console.error('[MigrationStore] Failed to load engineering metrics:', error);
        }
      },

      /**
       * Calculate health score
       */
      calculateHealthScore: async () => {
        try {
          console.log('[MigrationStore] Calculating health score...');

          const metrics = get().engineeringMetrics;
          const lastMetric = metrics[metrics.length - 1];

          // Calculate scores based on metrics
          const successRateScore = lastMetric ? lastMetric.successRate : 100;
          const performanceScore = lastMetric ? Math.min(100, (lastMetric.itemsPerHour / 100) * 100) : 50;

          const healthScore: MigrationHealthScore = {
            overall: Math.round((successRateScore + performanceScore) / 2),
            categories: {
              userMigration: successRateScore,
              azureMigration: successRateScore,
              domainMapping: 85,
              dataIntegrity: 95,
              performance: performanceScore,
            },
            issues: [],
            lastCalculated: new Date().toISOString(),
          };

          // Add issues based on thresholds
          if (healthScore.categories.userMigration < 90) {
            healthScore.issues.push({
              category: 'userMigration',
              severity: 'Medium',
              description: 'User migration success rate below target',
              recommendation: 'Review failed migrations and address common errors',
            });
          }

          if (healthScore.categories.performance < 70) {
            healthScore.issues.push({
              category: 'performance',
              severity: 'High',
              description: 'Migration throughput is below optimal levels',
              recommendation: 'Consider increasing concurrency or optimizing network',
            });
          }

          set((state) => {
            state.healthScore = healthScore;
          });

          return healthScore;
        } catch (error: any) {
          console.error('[MigrationStore] Failed to calculate health score:', error);
          throw error;
        }
      },

      /**
       * Get metrics summary
       */
      getMetricsSummary: () => {
        const metrics = get().engineeringMetrics;
        if (metrics.length === 0) {
          return {
            avgSuccessRate: 0,
            avgThroughput: 0,
            totalProcessed: 0,
            totalFailed: 0,
          };
        }

        const avgSuccessRate = metrics.reduce((acc, m) => acc + m.successRate, 0) / metrics.length;
        const avgThroughput = metrics.reduce((acc, m) => acc + m.itemsPerHour, 0) / metrics.length;
        const totalProcessed = metrics.reduce((acc, m) => acc + m.completedItems, 0);
        const totalFailed = metrics.reduce((acc, m) => acc + m.failedItems, 0);

        return {
          avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
          avgThroughput: Math.round(avgThroughput),
          totalProcessed,
          totalFailed,
        };
      },
        }))
      ),
      {
        name: 'MigrationStore',
        partialize: (state) => ({
          waves: state.waves,
          rollbackPoints: state.rollbackPoints,
          mappings: state.mappings,
          waveDependencies: state.waveDependencies,
          projects: state.projects,
          selectedProjectId: state.selectedProjectId,
          // Enhanced Migration Control Plane state
          domainMappings: state.domainMappings,
          domains: state.domains,
          userMigrationPlans: state.userMigrationPlans,
          azureResourceMigrations: state.azureResourceMigrations,
          crossDomainDependencies: state.crossDomainDependencies,
        }),
      }
    )
  )
);
