/**
 * Migration Store Unit Tests
 *
 * Tests comprehensive migration orchestration functionality including:
 * - Wave management (CRUD operations)
 * - Wave execution and lifecycle
 * - Rollback system
 * - Conflict detection and resolution
 * - Resource mapping
 * - Validation (pre-flight, licenses, permissions, connectivity)
 * - Delta synchronization
 * - Progress tracking
 */

import { renderHook, act } from '@testing-library/react';
import { useMigrationStore } from './useMigrationStore';
import type {
  MigrationWave,
  MigrationConflict,
  ResourceMapping,
  RollbackPoint,
  ValidationResult,
} from '../types/models/migration';

// Mock electron API
const mockExecuteModule = jest.fn();
const mockCancelExecution = jest.fn();
const mockOnProgress = jest.fn(() => jest.fn()); // Returns cleanup function

global.window = {
  electronAPI: {
    executeModule: mockExecuteModule,
    cancelExecution: mockCancelExecution,
    onProgress: mockOnProgress,
  },
} as any;

describe('useMigrationStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useMigrationStore());
    act(() => {
      result.current.waves.forEach(w => result.current.deleteWave(w.id));
      result.current.rollbackPoints.forEach(p => result.current.deleteRollbackPoint(p.id));
    });

    // Clear mocks
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Wave Management', () => {
    it('should create a new migration wave', async () => {
      const { result } = renderHook(() => useMigrationStore());

      let waveId = '';
      await act(async () => {
        waveId = await result.current.planWave({
          name: 'Test Wave 1',
          description: 'Test wave for unit testing',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date(Date.now() + 86400000).toISOString(),
          priority: 'Normal',
        } as any);
      });

      expect(waveId).toBeTruthy();
      expect(result.current.waves).toHaveLength(1);
      expect(result.current.waves[0].name).toBe('Test Wave 1');
      expect(result.current.waves[0].status).toBe('Planning');
      expect(result.current.waves[0].order).toBe(1);
    });

    it('should update an existing wave', async () => {
      const { result } = renderHook(() => useMigrationStore());

      let waveId = '';
      await act(async () => {
        waveId = await result.current.planWave({
          name: 'Original Name',
          description: 'Original Description',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      await act(async () => {
        await result.current.updateWave(waveId, {
          name: 'Updated Name',
          description: 'Updated Description',
        });
      });

      expect(result.current.waves[0].name).toBe('Updated Name');
      expect(result.current.waves[0].description).toBe('Updated Description');
    });

    it('should delete a wave', async () => {
      const { result } = renderHook(() => useMigrationStore());

      let waveId = '';
      await act(async () => {
        waveId = await result.current.planWave({
          name: 'Wave to Delete',
          description: 'Will be deleted',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      expect(result.current.waves).toHaveLength(1);

      await act(async () => {
        await result.current.deleteWave(waveId);
      });

      expect(result.current.waves).toHaveLength(0);
    });

    it('should duplicate a wave', async () => {
      const { result } = renderHook(() => useMigrationStore());

      let originalId = '';
      await act(async () => {
        originalId = await result.current.planWave({
          name: 'Original Wave',
          description: 'Original Description',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      let duplicateId = '';
      await act(async () => {
        duplicateId = await result.current.duplicateWave(originalId);
      });

      expect(result.current.waves).toHaveLength(2);
      expect(result.current.waves[1].name).toBe('Original Wave (Copy)');
      expect(result.current.waves[1].users).toEqual(['user1', 'user2']);
      expect(result.current.waves[1].id).not.toBe(originalId);
    });

    it('should reorder waves', async () => {
      const { result } = renderHook(() => useMigrationStore());

      const ids: string[] = [];
      await act(async () => {
        ids[0] = await result.current.planWave({
          name: 'Wave 1',
          description: 'First',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
        ids[1] = await result.current.planWave({
          name: 'Wave 2',
          description: 'Second',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
        ids[2] = await result.current.planWave({
          name: 'Wave 3',
          description: 'Third',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      act(() => {
        result.current.reorderWaves([ids[2], ids[0], ids[1]]);
      });

      expect(result.current.waves[0].name).toBe('Wave 3');
      expect(result.current.waves[0].order).toBe(1);
      expect(result.current.waves[1].name).toBe('Wave 1');
      expect(result.current.waves[1].order).toBe(2);
      expect(result.current.waves[2].name).toBe('Wave 2');
      expect(result.current.waves[2].order).toBe(3);
    });
  });

  describe('Wave Execution', () => {
    it('should execute a wave successfully', async () => {
      // Set up wave to be in correct state for execution
      const { result } = renderHook(() => useMigrationStore());

      let waveId = '';
      await act(async () => {
        waveId = await result.current.planWave({
          name: 'Execution Test Wave',
          description: 'Test execution',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
          users: ['user1', 'user2'],
        } as any);
      });

      // Mock successful execution response - ensure proper structure
      mockExecuteModule.mockResolvedValueOnce({
        success: true,
        data: { completed: true, executionId: 'test-execution-id' },
        error: null,
      });

      await act(async () => {
        await result.current.executeWave(waveId);
      });

      expect(mockExecuteModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
        functionName: 'Start-MigrationWave',
        parameters: expect.objectContaining({
          WaveId: waveId,
          WaveName: 'Execution Test Wave',
        }),
        options: expect.objectContaining({
          streamOutput: true,
          timeout: 0,
        }),
      });

      const wave = result.current.waves.find(w => w.id === waveId);
      expect(wave?.status).toBe('Completed');
    });

    it('should handle wave execution failure', async () => {
      mockExecuteModule.mockRejectedValueOnce(new Error('Execution failed'));

      const { result } = renderHook(() => useMigrationStore());

      let waveId = '';
      await act(async () => {
        waveId = await result.current.planWave({
          name: 'Failing Wave',
          description: 'Will fail',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      await act(async () => {
        try {
          await result.current.executeWave(waveId);
        } catch (error) {
          // Expected to fail
        }
      });

      const wave = result.current.waves.find(w => w.id === waveId);
      expect(wave?.status).toBe('Failed');
      expect(result.current.error).toBeTruthy();
    });

    it('should pause a running wave', async () => {
      // Set up wave to be in correct state for pausing
      const { result } = renderHook(() => useMigrationStore());

      let pauseWaveId = '';
      await act(async () => {
        pauseWaveId = await result.current.planWave({
          name: 'Pausable Wave',
          description: 'Can be paused',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
          users: ['user1', 'user2'],
        } as any);
      });

      // Set wave to in-progress state
      await act(async () => {
        await result.current.updateWave(pauseWaveId, { status: 'InProgress' });
      });

      mockExecuteModule.mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.pauseWave(pauseWaveId);
      });

      expect(mockExecuteModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
        functionName: 'Pause-MigrationWave',
        parameters: { WaveId: pauseWaveId },
      });

      const wave = result.current.waves.find(w => w.id === pauseWaveId);
      expect(wave?.status).toBe('Paused');
    });

    it('should resume a paused wave', async () => {
      mockExecuteModule.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useMigrationStore());

      let waveId = '';
      await act(async () => {
        waveId = await result.current.planWave({
          name: 'Resumable Wave',
          description: 'Can be resumed',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      // Set wave to paused state
      await act(async () => {
        await result.current.updateWave(waveId, { status: 'Paused' });
      });

      await act(async () => {
        await result.current.resumeWave(waveId);
      });

      expect(mockExecuteModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
        functionName: 'Resume-MigrationWave',
        parameters: { WaveId: waveId },
      });

      const wave = result.current.waves.find(w => w.id === waveId);
      expect(wave?.status).toBe('InProgress');
    });
  });

  describe('Rollback System', () => {
    it('should create a rollback point', async () => {
      const { result } = renderHook(() => useMigrationStore());

      let rollbackPoint: RollbackPoint | undefined;
      await act(async () => {
        rollbackPoint = await result.current.createRollbackPoint('Test Rollback Point');
      });

      expect(rollbackPoint).toBeDefined();
      expect(rollbackPoint!.name).toBe('Test Rollback Point');
      expect(rollbackPoint!.canRestore).toBe(true);
      expect(result.current.rollbackPoints).toHaveLength(1);
      expect(result.current.canRollback).toBe(true);
    });

    it('should rollback to a previous point', async () => {
      mockExecuteModule.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useMigrationStore());

      // Create initial state
      let waveId = '';
      await act(async () => {
        waveId = await result.current.planWave({
          name: 'Original Wave',
          description: 'Before rollback',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      // Create rollback point
      let rollbackPoint: RollbackPoint | undefined;
      await act(async () => {
        rollbackPoint = await result.current.createRollbackPoint('Before Changes');
      });

      // Make changes
      await act(async () => {
        await result.current.updateWave(waveId, { name: 'Modified Wave' });
      });

      expect(result.current.waves[0].name).toBe('Modified Wave');

      // Rollback
      await act(async () => {
        await result.current.rollbackToPoint(rollbackPoint!.id);
      });

      expect(mockExecuteModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
        functionName: 'Invoke-MigrationRollback',
        parameters: expect.objectContaining({
          RollbackPointId: rollbackPoint!.id,
        }),
      });

      expect(result.current.waves[0].name).toBe('Original Wave');
    });

    it('should delete a rollback point', async () => {
      const { result } = renderHook(() => useMigrationStore());

      let rollbackPoint: RollbackPoint | undefined;
      await act(async () => {
        rollbackPoint = await result.current.createRollbackPoint('Point to Delete');
      });

      expect(result.current.rollbackPoints).toHaveLength(1);

      await act(async () => {
        await result.current.deleteRollbackPoint(rollbackPoint!.id);
      });

      expect(result.current.rollbackPoints).toHaveLength(0);
      expect(result.current.canRollback).toBe(false);
    });
  });

  describe('Conflict Management', () => {
    it('should detect conflicts', async () => {
      const mockConflicts: MigrationConflict[] = [
        {
          id: 'conflict-1',
          type: 'duplicate_user',
          severity: 'High',
          sourceResource: { id: 'src-1', name: 'User1', type: 'User', properties: {} },
          targetResource: { id: 'tgt-1', name: 'User1', type: 'User', properties: {} },
          suggestedResolution: { conflictId: 'conflict-1', strategy: 'merge', notes: '' },
          status: 'pending',
          metadata: {},
        },
      ];

      mockExecuteModule.mockResolvedValueOnce({
        success: true,
        data: { conflicts: mockConflicts },
        error: null,
      });

      const { result } = renderHook(() => useMigrationStore());

      let conflicts: MigrationConflict[] = [];
      await act(async () => {
        conflicts = await result.current.detectConflicts('wave-id');
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('duplicate_user');
      expect(result.current.conflicts).toHaveLength(1);
    });

    it('should resolve a conflict', async () => {
      mockExecuteModule.mockResolvedValueOnce({ success: true, error: null });

      const { result } = renderHook(() => useMigrationStore());

      // Add conflict to state using a proper mutable array
      const mockConflict = {
        id: 'conflict-1',
        type: 'duplicate_user' as const,
        severity: 'High' as const,
        sourceResource: { id: 'src-1', name: 'User1', type: 'User', properties: {} },
        status: 'pending' as const,
        suggestedResolution: { conflictId: 'conflict-1', strategy: 'merge' as const, notes: '' },
        metadata: {},
      };

      act(() => {
        // Use array replacement instead of push to avoid mutability issues
        result.current.conflicts.length = 0; // Clear array
        result.current.conflicts.push(mockConflict);
      });

      await act(async () => {
        await result.current.resolveConflict('conflict-1', {
          conflictId: 'conflict-1',
          strategy: 'merge',
          notes: 'Use source value',
        });
      });

      expect(mockExecuteModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Migration/ConflictResolution.psm1',
        functionName: 'Resolve-MigrationConflict',
        parameters: expect.objectContaining({
          ConflictId: 'conflict-1',
        }),
      });

      const resolvedConflict = result.current.conflicts.find(c => c.id === 'conflict-1');
      expect(resolvedConflict?.status).toBe('resolved');
    });

    it('should get conflicts by type', async () => {
      const { result } = renderHook(() => useMigrationStore());

      const conflicts = [
        {
          id: 'c1',
          type: 'duplicate_user' as const,
          severity: 'High' as const,
          sourceResource: { id: 's1', name: 'User1', type: 'User', properties: {} },
          status: 'pending' as const,
          suggestedResolution: { conflictId: 'c1', strategy: 'merge' as const, notes: '' },
          metadata: {},
        },
        {
          id: 'c2',
          type: 'duplicate_group' as const,
          severity: 'Medium' as const,
          sourceResource: { id: 's2', name: 'Group1', type: 'Group', properties: {} },
          status: 'pending' as const,
          suggestedResolution: { conflictId: 'c2', strategy: 'merge' as const, notes: '' },
          metadata: {},
        },
        {
          id: 'c3',
          type: 'duplicate_user' as const,
          severity: 'Low' as const,
          sourceResource: { id: 's3', name: 'User2', type: 'User', properties: {} },
          status: 'pending' as const,
          suggestedResolution: { conflictId: 'c3', strategy: 'skip' as const, notes: '' },
          metadata: {},
        },
      ];

      act(() => {
        // Use array replacement instead of push to avoid mutability issues
        result.current.conflicts.length = 0; // Clear array
        result.current.conflicts.push(...conflicts);
      });

      const userConflicts = result.current.getConflictsByType('duplicate_user');

      expect(userConflicts).toHaveLength(2);
      expect(userConflicts.every(c => c.type === 'duplicate_user')).toBe(true);
    });
  });

  describe('Resource Mapping', () => {
    it('should add a resource mapping', () => {
      const { result } = renderHook(() => useMigrationStore());

      const mapping: ResourceMapping = {
        id: 'mapping-1',
        sourceId: 'src-user-1',
        sourceName: 'User1',
        targetId: 'tgt-user-1',
        targetName: 'User1',
        type: 'User',
        status: 'Mapped',
        conflicts: [],
        validationResult: null,
      };

      act(() => {
        result.current.mapResource(mapping);
      });

      expect(result.current.mappings).toHaveLength(1);
      expect(result.current.mappings[0].id).toBe('mapping-1');
    });

    it('should validate mappings', async () => {
      mockExecuteModule.mockResolvedValueOnce({
        success: true,
        data: { errors: [], warnings: ['Warning: Some mappings are incomplete'] },
        error: null,
      });

      const { result } = renderHook(() => useMigrationStore());

      let validationResult: ValidationResult | undefined;
      await act(async () => {
        validationResult = await result.current.validateMappings('wave-id');
      });

      expect(validationResult!.isValid).toBe(true);
      expect(validationResult!.errors).toHaveLength(0);
      expect(validationResult!.warnings).toHaveLength(1);
    });

    it('should export mappings', async () => {
      const { result } = renderHook(() => useMigrationStore());

      const mappings: ResourceMapping[] = [
        {
          id: 'm1',
          sourceId: 'src-1',
          sourceName: 'User1',
          targetId: 'tgt-1',
          targetName: 'User1',
          type: 'User',
          status: 'Mapped',
          conflicts: [],
          validationResult: null,
        },
        {
          id: 'm2',
          sourceId: 'src-2',
          sourceName: 'Group1',
          targetId: 'tgt-2',
          targetName: 'Group1',
          type: 'SecurityGroup',
          status: 'Mapped',
          conflicts: [],
          validationResult: null,
        },
      ];

      act(() => {
        mappings.forEach(m => result.current.mapResource(m));
      });

      // Mock DOM methods
      const createElementSpy = jest.spyOn(document, 'createElement');
      const mockAnchor = {
        click: jest.fn(),
        href: '',
        download: '',
      };
      createElementSpy.mockReturnValueOnce(mockAnchor as any);

      await act(async () => {
        await result.current.exportMappings();
      });

      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toContain('mappings-all');
    });
  });

  describe('Validation', () => {
    it('should run pre-flight checks', async () => {
      mockExecuteModule.mockResolvedValueOnce({
        success: true,
        data: {
          errors: [],
          warnings: ['Network latency detected'],
        },
        error: null,
      });

      const { result } = renderHook(() => useMigrationStore());

      let validationResult: ValidationResult | undefined;
      await act(async () => {
        validationResult = await result.current.runPreFlightChecks('wave-id');
      });

      expect(mockExecuteModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Migration/PreFlightChecks.psm1',
        functionName: 'Invoke-PreFlightChecks',
        parameters: { WaveId: 'wave-id' },
      });

      expect(validationResult!.isValid).toBe(true);
      expect(validationResult!.warnings).toContain('Network latency detected');
    });

    it('should validate licenses', async () => {
      mockExecuteModule.mockResolvedValueOnce({
        success: true,
        data: {
          availableLicenses: 100,
          requiredLicenses: 50,
          errors: [],
          warnings: [],
        },
        error: null,
      });

      const { result } = renderHook(() => useMigrationStore());

      let licenseResult: any;
      await act(async () => {
        licenseResult = await result.current.validateLicenses('wave-id');
      });

      expect(licenseResult.passed).toBe(true);
      expect(licenseResult.availableLicenses).toBe(100);
      expect(licenseResult.requiredLicenses).toBe(50);
    });

    it('should validate permissions', async () => {
      mockExecuteModule.mockResolvedValueOnce({
        success: false,
        data: {
          missingPermissions: ['User.ReadWrite.All'],
          errors: [{ field: 'permissions', message: 'Missing permissions', code: 'MISSING_PERMS', severity: 'error' }],
          warnings: [],
        },
        error: null,
      });

      const { result } = renderHook(() => useMigrationStore());

      let permResult: any;
      await act(async () => {
        permResult = await result.current.validatePermissions('wave-id');
      });

      expect(permResult.passed).toBe(false);
      expect(permResult.missingPermissions).toContain('User.ReadWrite.All');
    });

    it('should validate connectivity', async () => {
      mockExecuteModule.mockResolvedValueOnce({
        success: true,
        data: {
          sourceConnected: true,
          targetConnected: true,
          errors: [],
          warnings: [],
        },
      });

      const { result } = renderHook(() => useMigrationStore());

      let connResult: any;
      await act(async () => {
        connResult = await result.current.validateConnectivity();
      });

      expect(connResult.passed).toBe(true);
      expect(connResult.sourceConnected).toBe(true);
      expect(connResult.targetConnected).toBe(true);
    });
  });

  describe('Delta Sync', () => {
    it('should perform delta synchronization', async () => {
      mockExecuteModule.mockResolvedValueOnce({
        success: true,
        data: {
          changesDetected: 25,
          changesApplied: 23,
          conflicts: 2,
        },
      });

      const { result } = renderHook(() => useMigrationStore());

      let syncResult: any;
      await act(async () => {
        syncResult = await result.current.performDeltaSync('wave-id');
      });

      expect(syncResult.changesDetected).toBe(25);
      expect(syncResult.changesApplied).toBe(23);
      expect(syncResult.conflicts).toBe(2);
      expect(result.current.lastSyncTimestamp).toBeTruthy();
    });

    it('should enable delta sync scheduling', () => {
      const { result } = renderHook(() => useMigrationStore());

      act(() => {
        result.current.scheduleDeltaSync('wave-id', 60000);
      });

      expect(result.current.deltaSyncEnabled).toBe(true);
    });

    it('should stop delta sync', () => {
      const { result } = renderHook(() => useMigrationStore());

      act(() => {
        result.current.scheduleDeltaSync('wave-id', 60000);
      });

      expect(result.current.deltaSyncEnabled).toBe(true);

      act(() => {
        result.current.stopDeltaSync('wave-id');
      });

      expect(result.current.deltaSyncEnabled).toBe(false);
    });
  });

  describe('Progress Tracking', () => {
    it('should get progress summary', async () => {
      const { result } = renderHook(() => useMigrationStore());

      // Create multiple waves with different statuses
      await act(async () => {
        await result.current.planWave({
          name: 'Completed Wave',
          description: 'Done',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      await act(async () => {
        const wave = result.current.waves[0];
        await result.current.updateWave(wave.id, { status: 'Completed', totalItems: 3 });
      });

      await act(async () => {
        await result.current.planWave({
          name: 'In Progress Wave',
          description: 'Running',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      await act(async () => {
        const wave = result.current.waves[1];
        await result.current.updateWave(wave.id, { status: 'InProgress', totalItems: 2 });
      });

      const summary = result.current.getProgressSummary();

      expect(summary.totalWaves).toBe(2);
      expect(summary.completedWaves).toBe(1);
      expect(summary.activeWaves).toBe(1);
      expect(summary.failedWaves).toBe(0);
      expect(summary.totalUsers).toBe(5);
      expect(summary.migratedUsers).toBe(3);
      expect(summary.overallProgress).toBe(50);
    });
  });

  describe('Persistence', () => {
    it('should persist waves to localStorage', async () => {
      const { result } = renderHook(() => useMigrationStore());

      await act(async () => {
        await result.current.planWave({
          name: 'Persistent Wave',
          description: 'Will be saved',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          priority: 'Normal',
        } as any);
      });

      const saved = localStorage.getItem('migration-waves');
      expect(saved).toBeTruthy();

      const waves = JSON.parse(saved!);
      expect(waves).toHaveLength(1);
      expect(waves[0].name).toBe('Persistent Wave');
    });

    it('should load waves from localStorage', async () => {
      const mockWaves = [
        {
          id: 'wave-1',
          name: 'Loaded Wave',
          description: 'From storage',
          status: 'Planning' as const,
          order: 1,
          priority: 'Normal' as const,
          createdAt: new Date().toISOString(),
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          users: [] as string[],
          resources: [] as string[],
          dependencies: [] as string[],
          tasks: [] as any[],
          batches: [] as any[],
          metadata: {},
          notes: '',
          prerequisites: [] as string[],
          totalItems: 0,
          progressPercentage: 0,
          actualStartDate: null as string | Date | null,
          actualEndDate: null as string | Date | null,
          estimatedDuration: null as number | null,
        },
      ];

      localStorage.setItem('migration-waves', JSON.stringify(mockWaves));

      const { result } = renderHook(() => useMigrationStore());

      await act(async () => {
        await result.current.loadWaves();
      });

      expect(result.current.waves).toHaveLength(1);
      expect(result.current.waves[0].name).toBe('Loaded Wave');
    });
  });
});
