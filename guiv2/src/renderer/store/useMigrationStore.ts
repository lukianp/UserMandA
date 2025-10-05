/**
 * Migration Store
 *
 * Manages migration operations, progress tracking, and results.
 * Handles user, group, and data migration workflows.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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
} from '../types/models/migration';
import { ValidationResult } from '../types/common';

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
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceResource: Resource;
  targetResource?: Resource;
  suggestedResolution: ConflictResolution;
  status: 'pending' | 'resolved' | 'skipped' | 'failed';
  metadata: any;
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
}

export const useMigrationStore = create<MigrationState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Existing state
          operations: new Map(),
          plans: [],
          selectedPlan: null,
          isMigrating: false,
          waves: [],
          selectedWaveId: null,
          currentWave: null,
          isLoading: false,
          error: null,

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
          selectedWave: get().waves.find(w => w.id === get().selectedWaveId) || null,
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
        const progressCleanup = window.electronAPI.onProgress((data) => {
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
                parameters: task.parameters,
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
          set({ waves, isLoading: false });
        } catch (error: any) {
          console.error('Failed to load waves:', error);
          set({ error: error.message || 'Failed to load waves', isLoading: false, waves: [] });
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
        set({ selectedWaveId: waveId });
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
            field: e.field,
            message: e.message,
            code: e.code,
            severity: e.severity === 'critical' ? 'critical' : 'error' as 'error' | 'critical'
          })),
          warnings: warnings.map(w => ({
            field: w.field,
            message: w.message,
            code: w.code,
            severity: w.severity === 'info' ? 'info' : 'warning' as 'warning' | 'info'
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
        const cleanup = window.electronAPI.onProgress((data) => {
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
        }))
      ),
      {
        name: 'MigrationStore',
        partialize: (state) => ({
          waves: state.waves,
          rollbackPoints: state.rollbackPoints,
          mappings: state.mappings,
          waveDependencies: state.waveDependencies,
        }),
      }
    )
  )
);
