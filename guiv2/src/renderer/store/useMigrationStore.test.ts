/**
 * Migration Store Unit Tests
 *
 * Focuses on verifying core orchestration behaviour while aligning with
 * the actual store API surface.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import type {
  MigrationConflict,
  MigrationWave,
  ResourceMapping,
  ValidationResult,
} from '../types/models/migration';

import { useMigrationStore } from './useMigrationStore';

const mockExecuteModule = jest.fn<(args?: any) => Promise<any>>();
const mockCancelExecution = jest.fn<(token?: string) => Promise<void>>();
let progressHandler: ((data: any) => void) | undefined;

const mockOnProgress = jest.fn<(handler: (data: any) => void) => () => void>((handler) => {
  progressHandler = handler;
  return jest.fn();
});

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: {
      executeModule: mockExecuteModule,
      cancelExecution: mockCancelExecution,
      onProgress: mockOnProgress,
    },
  });
});

const resetStore = () => {
  useMigrationStore.setState((state) => {
    state.operations.clear();
    state.plans = [];
    state.selectedPlan = null;
    state.isMigrating = false;
    state.waves = [];
    state.selectedWaveId = null;
    state.currentWave = null;
    state.isLoading = false;
    state.error = null;
    state.waveExecutionStatus = new Map();
    state.waveDependencies = new Map();
    state.mappings = [];
    state.conflicts = [];
    state.conflictResolutionStrategies = new Map();
    state.rollbackPoints = [];
    state.canRollback = false;
    state.validationResults = new Map();
    state.lastSyncTimestamp = null;
    state.deltaSyncEnabled = false;
    state.executionProgress = null;
    state.isExecuting = false;
    state.selectedWave = null;
  });
};

const planBasicWave = async () => {
  const { result } = renderHook(() => useMigrationStore());
  let waveId = '';
  await act(async () => {
    waveId = await result.current.planWave({
      name: 'Sample Wave',
      description: 'Test migration wave',
      plannedStartDate: new Date().toISOString(),
      plannedEndDate: new Date(Date.now() + 3600_000).toISOString(),
      priority: 'Normal',
      status: 'Planning',
      order: result.current.waves.length + 1,
      users: [],
      resources: [],
      dependencies: [],
      tasks: [],
      batches: [],
      metadata: {},
      notes: '',
      prerequisites: [],
      totalItems: 0,
      progressPercentage: 0,
      actualStartDate: null,
      actualEndDate: null,
      estimatedDuration: null,
    } as Omit<MigrationWave, 'id' | 'createdAt'>);
  });
  return { result, waveId };
};

describe('useMigrationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
    localStorage.clear();
    progressHandler = undefined;
  });

  it('creates a migration wave with default values', async () => {
    const { result, waveId } = await planBasicWave();

    const wave = result.current.waves.find((w) => w.id === waveId);
    expect(wave).toBeDefined();
    expect(wave?.status).toBe('Planning');
    expect(result.current.waves).toHaveLength(1);
  });

  it('executes a wave and marks it completed on success', async () => {
    const { result, waveId } = await planBasicWave();
    // place the wave in a runnable state
    await act(async () => {
      await result.current.updateWave(waveId, { status: 'Ready' as const });
    });

    mockExecuteModule.mockResolvedValueOnce({ success: true, data: {} });

    await act(async () => {
      await result.current.executeWave(waveId);
    });

    const wave = result.current.waves.find((w) => w.id === waveId);
    expect(mockExecuteModule).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'Start-MigrationWave',
      }),
    );
    expect(wave?.status).toBe('Completed');
  });

  it('pauses and resumes a migration wave', async () => {
    const { result, waveId } = await planBasicWave();
    await act(async () => {
      await result.current.updateWave(waveId, { status: 'InProgress' as const });
    });

    mockExecuteModule.mockResolvedValue({ success: true });

    await act(async () => {
      await result.current.pauseWave(waveId);
    });
    expect(result.current.waves.find((w) => w.id === waveId)?.status).toBe('Paused');

    await act(async () => {
      await result.current.resumeWave(waveId);
    });
    expect(result.current.waves.find((w) => w.id === waveId)?.status).toBe('InProgress');
  });

  it('detects conflicts and stores them in state', async () => {
    const { result, waveId } = await planBasicWave();
    const conflicts: MigrationConflict[] = [
      {
        id: 'conflict-1',
        type: 'duplicate_user',
        severity: 'High',
        sourceResource: { id: 'user-1', name: 'User One', type: 'User', properties: {} },
        status: 'pending',
        metadata: {},
      },
    ];
    mockExecuteModule.mockResolvedValueOnce({ success: true, data: { conflicts } });

    let detected: MigrationConflict[] = [];
    await act(async () => {
      detected = await result.current.detectConflicts(waveId);
    });

    expect(detected).toEqual(conflicts);
    expect(result.current.conflicts).toEqual(conflicts);
  });

  it('runs pre-flight checks and records validation result', async () => {
    const { result, waveId } = await planBasicWave();
    const validation: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [{ field: 'users', message: 'No users assigned' }],
    };
    mockExecuteModule.mockResolvedValueOnce({
      success: true,
      data: { errors: validation.errors, warnings: validation.warnings },
    });

    let outcome: ValidationResult | undefined;
    await act(async () => {
      outcome = await result.current.runPreFlightChecks(waveId);
    });

    expect(outcome).toEqual(validation);
    expect(result.current.validationResults.get(waveId)).toEqual(validation);
  });

  it('performs delta sync and updates sync metadata', async () => {
    const { result, waveId } = await planBasicWave();
    mockExecuteModule.mockResolvedValueOnce({
      success: true,
      data: { changesDetected: 5, changesApplied: 4, conflicts: 1 },
    });

    let deltaResult: any;
    await act(async () => {
      deltaResult = await result.current.performDeltaSync(waveId);
    });

    expect(deltaResult?.changesDetected).toBe(5);
    expect(result.current.lastSyncTimestamp).not.toBeNull();
  });

  it('maps resources and supports lookup by wave', async () => {
    const { result, waveId } = await planBasicWave();
    const mapping: ResourceMapping & { waveId: string } = {
      id: 'mapping-1',
      sourceId: 'user-1',
      sourceName: 'User One',
      targetId: 'user-1-target',
      targetName: 'User One Target',
      type: 'User',
      status: 'Mapped',
      conflicts: [],
      validationResult: null,
      waveId,
    };

    act(() => {
      result.current.mapResource(mapping);
    });

    expect(result.current.mappings).toContainEqual(mapping);
  });

  it('subscribes to progress updates via IPC bridge', async () => {
    const { result, waveId } = await planBasicWave();
    const callback = jest.fn<(progress: any) => void>();

    let unsubscribe: (() => void) | undefined;
    act(() => {
      unsubscribe = result.current.subscribeToProgress(waveId, callback);
    });

    expect(mockOnProgress).toHaveBeenCalled();

    const progressUpdate = {
      waveId,
      phase: 'migrating',
      overallProgress: 50,
      currentTask: 'Migrating mailbox',
      tasksCompleted: 1,
      tasksTotal: 2,
      usersMigrated: 10,
      usersTotal: 20,
      estimatedTimeRemaining: 600000,
      throughput: 5,
      errors: [],
    };

    const handler = progressHandler;

    act(() => {
      handler?.({
        type: 'migration-progress',
        waveId,
        progress: progressUpdate,
      });
    });

    expect(callback).toHaveBeenCalledWith(progressUpdate);
    act(() => unsubscribe?.());
  });
});
