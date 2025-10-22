/**
 * Unit Tests for RollbackService
 *
 * CRITICAL SERVICE - Handles migration rollback for data safety
 * Tests cover:
 * - Full rollback point creation
 * - Selective rollback point creation
 * - Rollback execution (dry-run, production, selective, force)
 * - Retention policy enforcement
 * - Storage management and cleanup
 * - Snapshot compression/decompression
 * - Error recovery and validation
 */

import * as path from 'path';
import { EventEmitter } from 'events';

import RollbackService from './rollbackService';
import PowerShellExecutionService from './powerShellService';

// Mock dependencies
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('[]')),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./powerShellService');

const mockFs = require('fs/promises');
const MockPowerShellService = PowerShellExecutionService as jest.MockedClass<typeof PowerShellExecutionService>;

describe('RollbackService', () => {
  let service: RollbackService;
  let mockPowerShell: jest.Mocked<PowerShellExecutionService>;
  let testDataDir: string;

  // Sample test data
  const sampleWaveId = 'wave-001';
  const sampleUserIds = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

  const sampleSnapshotData = {
    users: [
      {
        id: 'user1@test.com',
        upn: 'user1@test.com',
        state: 'source',
        sourceAttributes: { displayName: 'User 1' },
        groupMemberships: ['group1'],
        permissions: ['perm1'],
      },
      {
        id: 'user2@test.com',
        upn: 'user2@test.com',
        state: 'source',
        sourceAttributes: { displayName: 'User 2' },
        groupMemberships: ['group1', 'group2'],
        permissions: ['perm1', 'perm2'],
      },
    ],
    groups: [
      { id: 'group1', name: 'Test Group 1', type: 'Security', members: ['user1@test.com'], attributes: {} },
      { id: 'group2', name: 'Test Group 2', type: 'Distribution', members: ['user2@test.com'], attributes: {} },
    ],
    permissions: [
      { resourceId: 'resource1', resourceType: 'Mailbox', principalId: 'user1@test.com', permissions: ['FullAccess'], attributes: {} },
    ],
    settings: {
      migrationSettings: { batchSize: 10 },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock fs
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue(Buffer.from('[]'));
    mockFs.unlink.mockResolvedValue(undefined);

    // Setup mock PowerShell service
    mockPowerShell = new MockPowerShellService() as jest.Mocked<PowerShellExecutionService>;
    mockPowerShell.executeScript = jest.fn().mockResolvedValue({
      success: true,
      data: sampleSnapshotData,
      error: null,
    });

    testDataDir = path.join(process.cwd(), 'data', 'test-rollback');
    service = new RollbackService(mockPowerShell, testDataDir, 30, 10);
  });

  afterEach(() => {
    // Clean up event listeners
    if (service) {
      service.removeAllListeners();
    }
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    it('should create data directories on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('test-rollback'),
        { recursive: true }
      );
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('snapshots'),
        { recursive: true }
      );
    });

    it('should initialize with provided configuration', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(RollbackService);
      expect(service).toBeInstanceOf(EventEmitter);
    });

    it('should load existing rollback points on initialization', () => {
      // readFile should be called to load rollback-points.json
      expect(mockFs.readFile).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Full Rollback Point Creation Tests
  // ============================================================================

  describe('createFullRollbackPoint', () => {
    it('should create full rollback point successfully', async () => {
      const events: any[] = [];
      service.on('rollback:creating', (data) => events.push({ event: 'creating', data }));
      service.on('rollback:created', (data) => events.push({ event: 'created', data }));

      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Pre-Migration Snapshot',
        'Full snapshot before migration'
      );

      // Verify rollback point structure
      expect(rollbackPoint).toMatchObject({
        waveId: sampleWaveId,
        name: 'Pre-Migration Snapshot',
        description: 'Full snapshot before migration',
        type: 'full',
        compressed: true,
        canRestore: true,
      });

      expect(rollbackPoint.id).toBeDefined();
      expect(rollbackPoint.createdAt).toBeInstanceOf(Date);
      expect(rollbackPoint.expiresAt).toBeInstanceOf(Date);
      expect(rollbackPoint.size).toBeGreaterThan(0);

      // Verify metadata
      expect(rollbackPoint.metadata.userCount).toBe(2);
      expect(rollbackPoint.metadata.groupCount).toBe(2);
      expect(rollbackPoint.metadata.permissionCount).toBe(1);

      // Verify events
      expect(events[0]).toMatchObject({
        event: 'creating',
        data: { waveId: sampleWaveId, type: 'full' },
      });
      expect(events[1].event).toBe('created');

      // Verify PowerShell was called
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Capture-MigrationSnapshot.ps1',
        expect.arrayContaining(['-WaveId', sampleWaveId, '-Type', 'Full']),
        expect.any(Object)
      );

      // Verify snapshot was saved
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.gz'),
        expect.any(Buffer)
      );
    }, 30000);

    it('should compress snapshot data', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Compression'
      );

      expect(rollbackPoint.compressed).toBe(true);
      expect(rollbackPoint.size).toBeGreaterThan(0);

      // Compressed data should be saved to file
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`${rollbackPoint.id}.gz`),
        expect.any(Buffer)
      );
    }, 30000);

    it('should set expiration date based on retention policy', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Retention'
      );

      expect(rollbackPoint.expiresAt).toBeDefined();

      const expectedExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const actualExpiration = rollbackPoint.expiresAt!;

      // Allow 1 second tolerance
      expect(Math.abs(actualExpiration.getTime() - expectedExpiration.getTime())).toBeLessThan(1000);
    }, 30000);

    it('should handle PowerShell snapshot capture failure', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: 'Failed to capture snapshot',
      });

      const events: any[] = [];
      service.on('rollback:failed', (data) => events.push({ event: 'failed', data }));

      await expect(
        service.createFullRollbackPoint(sampleWaveId, 'Failed Snapshot')
      ).rejects.toThrow('Failed to capture snapshot');

      // Verify failure event
      expect(events[0]).toMatchObject({
        event: 'failed',
        data: { waveId: sampleWaveId, error: 'Failed to capture snapshot' },
      });
    }, 30000);

    it('should enforce retention policy after creating rollback point', async () => {
      // Create max points + 1 to trigger cleanup
      for (let i = 0; i < 11; i++) {
        await service.createFullRollbackPoint(
          sampleWaveId,
          `Rollback Point ${i}`
        );
      }

      // Verify retention policy deleted oldest point
      const points = service.getRollbackPoints(sampleWaveId);
      expect(points.length).toBeLessThanOrEqual(10);
    }, 30000);
  });

  // ============================================================================
  // Selective Rollback Point Creation Tests
  // ============================================================================

  describe('createSelectiveRollbackPoint', () => {
    it('should create selective rollback point for specific users', async () => {
      const events: any[] = [];
      service.on('rollback:creating', (data) => events.push({ event: 'creating', data }));
      service.on('rollback:created', (data) => events.push({ event: 'created', data }));

      const userSubset = ['user1@test.com'];
      const rollbackPoint = await service.createSelectiveRollbackPoint(
        sampleWaveId,
        userSubset,
        'Selective User Snapshot'
      );

      // Verify rollback point structure
      expect(rollbackPoint).toMatchObject({
        waveId: sampleWaveId,
        name: 'Selective User Snapshot',
        type: 'selective',
        compressed: true,
        canRestore: true,
      });

      // Verify metadata includes user IDs
      expect(rollbackPoint.metadata.userIds).toEqual(userSubset);
      expect(rollbackPoint.metadata.userCount).toBe(1);

      // Verify events
      expect(events[0]).toMatchObject({
        event: 'creating',
        data: { waveId: sampleWaveId, type: 'selective', userCount: 1 },
      });

      // Verify PowerShell was called with correct parameters
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Capture-MigrationSnapshot.ps1',
        expect.arrayContaining([
          '-WaveId', sampleWaveId,
          '-Type', 'Selective',
          '-UserIds', JSON.stringify(userSubset),
        ]),
        expect.any(Object)
      );
    }, 30000);

    it('should create selective rollback for multiple users', async () => {
      const rollbackPoint = await service.createSelectiveRollbackPoint(
        sampleWaveId,
        sampleUserIds,
        'Multi-User Snapshot'
      );

      expect(rollbackPoint.metadata.userIds).toEqual(sampleUserIds);
      expect(rollbackPoint.metadata.userCount).toBe(3);
    }, 30000);
  });

  // ============================================================================
  // Rollback Execution Tests
  // ============================================================================

  describe('rollback', () => {
    let rollbackPointId: string;
    let compressedSnapshot: Buffer;

    beforeEach(async () => {
      // Create compressed snapshot for mocking
      const zlib = require('zlib');
      const snapshotJson = JSON.stringify({
        version: '1.0',
        timestamp: new Date(),
        users: sampleSnapshotData.users,
        groups: sampleSnapshotData.groups,
        permissions: sampleSnapshotData.permissions,
        settings: sampleSnapshotData.settings,
      });
      compressedSnapshot = await new Promise((resolve, reject) => {
        zlib.gzip(Buffer.from(snapshotJson, 'utf-8'), (err: any, result: Buffer) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // Create a rollback point for testing
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Rollback Point'
      );
      rollbackPointId = rollbackPoint.id;

      // Mock readFile to return compressed snapshot when loading rollback snapshot
      mockFs.readFile.mockImplementation((filepath: string) => {
        if (filepath.includes('.gz')) {
          return Promise.resolve(compressedSnapshot);
        }
        return Promise.resolve(Buffer.from('[]'));
      });

      // Mock successful rollback execution (handles both validation and rollback calls)
      mockPowerShell.executeScript = jest.fn()
        // First call: Validation script (Test-RollbackSnapshot.ps1)
        .mockResolvedValueOnce({
          success: true,
          data: {
            errors: [],
            warnings: [],
          },
          error: null,
        })
        // Second call: Rollback execution script (Invoke-MigrationRollback.ps1)
        .mockResolvedValue({
          success: true,
          data: {
            usersRestored: 2,
            groupsRestored: 2,
            permissionsRestored: 1,
          },
          error: null,
        });
    });

    it('should execute full rollback successfully', async () => {
      const events: any[] = [];
      service.on('rollback:started', (data) => events.push({ event: 'started', data }));
      service.on('rollback:completed', (data) => events.push({ event: 'completed', data }));

      const result = await service.rollback(rollbackPointId);

      // Verify result
      expect(result).toMatchObject({
        success: true,
        rollbackPointId,
        type: 'full',
        usersRestored: 2,
        groupsRestored: 2,
        permissionsRestored: 1,
      });

      expect(result.errors).toEqual([]);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.timestamp).toBeInstanceOf(Date);

      // Verify events
      expect(events[0].event).toBe('started');
      expect(events[0].data.rollbackPointId).toBe(rollbackPointId);
      expect(events[1].event).toBe('completed');

      // Verify PowerShell rollback script was called
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Invoke-MigrationRollback.ps1',
        expect.any(Array),
        expect.objectContaining({ timeout: 600000 })
      );
    }, 30000);

    it('should execute rollback in dry-run mode', async () => {
      const events: any[] = [];
      service.on('rollback:started', (data) => events.push({ event: 'started', data }));

      const result = await service.rollback(rollbackPointId, { dryRun: true });

      expect(result.success).toBe(true);

      // Verify dry-run parameter was passed
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Invoke-MigrationRollback.ps1',
        expect.arrayContaining(['-DryRun', '$true']),
        expect.any(Object)
      );

      // Verify started event includes dry-run flag
      expect(events[0].data.dryRun).toBe(true);
    }, 30000);

    it('should execute selective rollback for specific users', async () => {
      const selectiveUserIds = ['user1@test.com'];

      const result = await service.rollback(rollbackPointId, {
        userIds: selectiveUserIds,
      });

      expect(result.type).toBe('selective');
      expect(result.success).toBe(true);

      // Verify PowerShell was called for rollback execution
      const rollbackCalls = mockPowerShell.executeScript.mock.calls;
      expect(rollbackCalls.length).toBeGreaterThan(1); // Validation + Rollback

      // Find the rollback execution call (Invoke-MigrationRollback.ps1)
      const rollbackCall = rollbackCalls.find((call: any[]) =>
        call[0].includes('Invoke-MigrationRollback.ps1')
      );
      expect(rollbackCall).toBeDefined();
    }, 30000);

    it('should force rollback when canRestore is false', async () => {
      // Manually set canRestore to false
      const rollbackPoint = service.getRollbackPoint(rollbackPointId);
      if (rollbackPoint) {
        rollbackPoint.canRestore = false;
      }

      // Should fail without force option
      await expect(
        service.rollback(rollbackPointId)
      ).rejects.toThrow('Rollback point cannot be restored');

      // Should succeed with force option
      const result = await service.rollback(rollbackPointId, { force: true });
      expect(result.success).toBe(true);
    }, 30000);

    it('should validate snapshot before rollback', async () => {
      // Reset mock for this test
      mockPowerShell.executeScript = jest.fn()
        // Validation call with warnings
        .mockResolvedValueOnce({
          success: true,
          data: {
            errors: [],
            warnings: ['Snapshot is 15 days old'],
          },
          error: null,
        })
        // Rollback call
        .mockResolvedValue({
          success: true,
          data: { usersRestored: 2, groupsRestored: 2, permissionsRestored: 1 },
          error: null,
        });

      const result = await service.rollback(rollbackPointId);

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    }, 30000);

    it('should fail rollback when validation fails', async () => {
      // Mock validation failure - setup fresh mocks for this test
      mockFs.readFile.mockImplementation((filepath: string) => {
        if (filepath.includes('.gz')) {
          return Promise.resolve(compressedSnapshot);
        }
        return Promise.resolve(Buffer.from('[]'));
      });

      mockPowerShell.executeScript = jest.fn().mockResolvedValueOnce({
        success: true,
        data: {
          errors: ['Unsupported snapshot version'],
          warnings: [],
        },
        error: null,
      });

      // Validation errors are caught and returned as failed result
      const result = await service.rollback(rollbackPointId);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Rollback validation failed');
    }, 30000);

    it('should handle rollback execution failure gracefully', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: 'Rollback execution failed',
      });

      const events: any[] = [];
      service.on('rollback:failed', (data) => events.push({ event: 'failed', data }));

      const result = await service.rollback(rollbackPointId);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.usersRestored).toBe(0);

      // Verify failure event
      expect(events[0].event).toBe('failed');
    }, 30000);

    it('should reject rollback for non-existent rollback point', async () => {
      await expect(
        service.rollback('non-existent-id')
      ).rejects.toThrow('Rollback point non-existent-id not found');
    }, 30000);
  });

  // ============================================================================
  // Get/Query Operations Tests
  // ============================================================================

  describe('getRollbackPoints', () => {
    beforeEach(async () => {
      // Create rollback points for multiple waves
      await service.createFullRollbackPoint('wave-1', 'Wave 1 Point 1');
      await service.createFullRollbackPoint('wave-1', 'Wave 1 Point 2');
      await service.createFullRollbackPoint('wave-2', 'Wave 2 Point 1');
    });

    it('should return all rollback points', () => {
      const points = service.getRollbackPoints();

      expect(points.length).toBeGreaterThanOrEqual(3);
    }, 30000);

    it('should filter rollback points by wave ID', () => {
      const wave1Points = service.getRollbackPoints('wave-1');
      const wave2Points = service.getRollbackPoints('wave-2');

      expect(wave1Points.length).toBeGreaterThanOrEqual(2);
      expect(wave2Points.length).toBeGreaterThanOrEqual(1);

      expect(wave1Points.every(p => p.waveId === 'wave-1')).toBe(true);
      expect(wave2Points.every(p => p.waveId === 'wave-2')).toBe(true);
    }, 30000);

    it('should return empty array for non-existent wave', () => {
      const points = service.getRollbackPoints('non-existent-wave');

      expect(points).toEqual([]);
    }, 30000);
  });

  describe('getRollbackPoint', () => {
    it('should return specific rollback point', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Point'
      );

      const retrieved = service.getRollbackPoint(rollbackPoint.id);

      expect(retrieved).toMatchObject({
        id: rollbackPoint.id,
        name: 'Test Point',
        waveId: sampleWaveId,
      });
    }, 30000);

    it('should return null for non-existent rollback point', () => {
      const retrieved = service.getRollbackPoint('non-existent-id');

      expect(retrieved).toBeNull();
    }, 30000);
  });

  describe('getStorageStats', () => {
    beforeEach(async () => {
      await service.createFullRollbackPoint('wave-1', 'Wave 1 Point 1');
      await service.createFullRollbackPoint('wave-1', 'Wave 1 Point 2');
      await service.createFullRollbackPoint('wave-2', 'Wave 2 Point 1');
    });

    it('should return accurate storage statistics', async () => {
      const stats = await service.getStorageStats();

      expect(stats).toMatchObject({
        totalPoints: expect.any(Number),
        totalSize: expect.any(Number),
        pointsByWave: expect.any(Object),
      });

      expect(stats.totalPoints).toBeGreaterThanOrEqual(3);
      expect(stats.totalSize).toBeGreaterThan(0);

      expect(stats.pointsByWave['wave-1']).toBeGreaterThanOrEqual(2);
      expect(stats.pointsByWave['wave-2']).toBeGreaterThanOrEqual(1);
    }, 30000);

    it('should track oldest and newest points', async () => {
      const stats = await service.getStorageStats();

      expect(stats.oldestPoint).toBeInstanceOf(Date);
      expect(stats.newestPoint).toBeInstanceOf(Date);
      expect(stats.newestPoint!.getTime()).toBeGreaterThanOrEqual(stats.oldestPoint!.getTime());
    }, 30000);

    it('should return null dates when no points exist', async () => {
      // Create fresh service with no points
      const emptyService = new RollbackService(mockPowerShell, testDataDir + '-empty', 30, 10);

      const stats = await emptyService.getStorageStats();

      expect(stats.totalPoints).toBe(0);
      expect(stats.oldestPoint).toBeNull();
      expect(stats.newestPoint).toBeNull();
    }, 30000);
  });

  // ============================================================================
  // Delete Operations Tests
  // ============================================================================

  describe('deleteRollbackPoint', () => {
    it('should delete rollback point and snapshot file', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'To Be Deleted'
      );

      const events: any[] = [];
      service.on('rollback:deleted', (data) => events.push({ event: 'deleted', data }));

      await service.deleteRollbackPoint(rollbackPoint.id);

      // Verify point is deleted from memory
      const retrieved = service.getRollbackPoint(rollbackPoint.id);
      expect(retrieved).toBeNull();

      // Verify snapshot file was deleted
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining(`${rollbackPoint.id}.gz`)
      );

      // Verify delete event
      expect(events[0]).toMatchObject({
        event: 'deleted',
        data: { rollbackPointId: rollbackPoint.id },
      });
    }, 30000);

    it('should reject delete for non-existent rollback point', async () => {
      await expect(
        service.deleteRollbackPoint('non-existent-id')
      ).rejects.toThrow('Rollback point non-existent-id not found');
    }, 30000);

    it('should handle file deletion failure gracefully', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Delete'
      );

      // Mock file deletion failure
      mockFs.unlink.mockRejectedValue(new Error('File not found'));

      // Should not throw - should log warning and continue
      await service.deleteRollbackPoint(rollbackPoint.id);

      // Point should still be deleted from memory
      const retrieved = service.getRollbackPoint(rollbackPoint.id);
      expect(retrieved).toBeNull();
    }, 30000);
  });

  // ============================================================================
  // Retention Policy Tests
  // ============================================================================

  describe('Retention Policy', () => {
    it('should delete expired rollback points', async () => {
      // Create service with very short retention (0 days = immediate expiration)
      const shortRetentionService = new RollbackService(
        mockPowerShell,
        testDataDir + '-short-retention',
        0, // 0 day retention
        10
      );

      const rollbackPoint = await shortRetentionService.createFullRollbackPoint(
        sampleWaveId,
        'Expires Immediately'
      );

      // Wait briefly to ensure expiration time passes
      await new Promise(resolve => setTimeout(resolve, 10));

      // Create another point to trigger retention policy
      await shortRetentionService.createFullRollbackPoint(
        sampleWaveId,
        'Trigger Cleanup'
      );

      // First point should be deleted
      const retrieved = shortRetentionService.getRollbackPoint(rollbackPoint.id);
      expect(retrieved).toBeNull();
    }, 30000);

    it('should enforce max points per wave limit', async () => {
      // Create service with max 3 points per wave
      const limitedService = new RollbackService(
        mockPowerShell,
        testDataDir + '-limited',
        30,
        3 // max 3 points per wave
      );

      // Create 5 points
      for (let i = 0; i < 5; i++) {
        await limitedService.createFullRollbackPoint(
          sampleWaveId,
          `Point ${i}`
        );
      }

      // Should only have 3 points for the wave (max limit)
      const points = limitedService.getRollbackPoints(sampleWaveId);
      expect(points.length).toBe(3);

      // Should keep the 3 newest points
      // Sort by creation time to verify they are the most recent
      const sortedPoints = points.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Verify all points are from this wave
      expect(sortedPoints.every(p => p.waveId === sampleWaveId)).toBe(true);

      // The newest point should be Point 4
      expect(sortedPoints[0].name).toBe('Point 4');
    }, 30000);

    it('should not delete points from other waves', async () => {
      const limitedService = new RollbackService(
        mockPowerShell,
        testDataDir + '-multi-wave',
        30,
        2 // max 2 points per wave
      );

      // Create 3 points for wave-1
      await limitedService.createFullRollbackPoint('wave-1', 'Wave 1 Point 1');
      await limitedService.createFullRollbackPoint('wave-1', 'Wave 1 Point 2');
      await limitedService.createFullRollbackPoint('wave-1', 'Wave 1 Point 3');

      // Create 1 point for wave-2
      await limitedService.createFullRollbackPoint('wave-2', 'Wave 2 Point 1');

      // Wave-1 should have 2 points (oldest deleted)
      const wave1Points = limitedService.getRollbackPoints('wave-1');
      expect(wave1Points.length).toBe(2);

      // Wave-2 should still have 1 point (untouched)
      const wave2Points = limitedService.getRollbackPoints('wave-2');
      expect(wave2Points.length).toBe(1);
    }, 30000);
  });

  // ============================================================================
  // Error Recovery Tests
  // ============================================================================

  describe('Error Recovery', () => {
    it('should handle failed snapshot capture', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: 'PowerShell script failed',
      });

      await expect(
        service.createFullRollbackPoint(sampleWaveId, 'Failed Snapshot')
      ).rejects.toThrow('PowerShell script failed');
    }, 30000);

    it('should handle missing snapshot data', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: true,
        data: null, // No data
        error: null,
      });

      await expect(
        service.createFullRollbackPoint(sampleWaveId, 'No Data')
      ).rejects.toThrow('Failed to capture snapshot');
    }, 30000);

    it('should handle incomplete snapshot data gracefully', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: true,
        data: {
          users: [], // Empty arrays instead of null
          // Missing groups, permissions, settings
        },
        error: null,
      });

      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Incomplete Data'
      );

      // Should create point with empty arrays
      expect(rollbackPoint.metadata.userCount).toBe(0);
      expect(rollbackPoint.metadata.groupCount).toBe(0);
    }, 30000);

    it('should handle file I/O errors during snapshot save', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(
        service.createFullRollbackPoint(sampleWaveId, 'Disk Full')
      ).rejects.toThrow('Disk full');
    }, 30000);

    it('should handle decompression errors during rollback', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Decompression Error'
      );

      // Mock corrupted snapshot file
      mockFs.readFile.mockResolvedValue(Buffer.from('invalid gzip data'));

      // Service catches decompression errors and returns failed result
      const result = await service.rollback(rollbackPoint.id);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }, 30000);
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle large snapshots with compression', async () => {
      // Create large snapshot data
      const largeSnapshotData = {
        users: Array(1000).fill(null).map((_, i) => ({
          id: `user${i}@test.com`,
          upn: `user${i}@test.com`,
          state: 'source',
          sourceAttributes: { displayName: `User ${i}`, department: 'IT', location: 'Building A' },
          groupMemberships: [`group${i % 10}`],
          permissions: [`perm${i % 5}`],
        })),
        groups: Array(100).fill(null).map((_, i) => ({
          id: `group${i}`,
          name: `Group ${i}`,
          type: 'Security',
          members: [],
          attributes: {},
        })),
        permissions: [],
        settings: {},
      };

      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: true,
        data: largeSnapshotData,
        error: null,
      });

      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Large Snapshot'
      );

      expect(rollbackPoint.compressed).toBe(true);
      expect(rollbackPoint.size).toBeGreaterThan(0);
      expect(rollbackPoint.metadata.userCount).toBe(1000);
    }, 30000);

    it('should handle concurrent rollback point creation', async () => {
      const promises = [
        service.createFullRollbackPoint('wave-1', 'Concurrent 1'),
        service.createFullRollbackPoint('wave-2', 'Concurrent 2'),
        service.createFullRollbackPoint('wave-3', 'Concurrent 3'),
      ];

      const results = await Promise.all(promises);

      expect(results.length).toBe(3);
      expect(results[0].id).not.toBe(results[1].id);
      expect(results[1].id).not.toBe(results[2].id);
    }, 30000);

    it('should handle snapshot version compatibility', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Version'
      );

      // Verify snapshot has version field
      expect(rollbackPoint.snapshot.version).toBe('1.0');
    }, 30000);

    it('should preserve snapshot timestamp', async () => {
      const beforeCreate = new Date();

      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Timestamp'
      );

      const afterCreate = new Date();

      expect(rollbackPoint.snapshot.timestamp).toBeInstanceOf(Date);
      expect(rollbackPoint.snapshot.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(rollbackPoint.snapshot.timestamp.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    }, 30000);

    it('should handle metadata serialization for persistence', async () => {
      const rollbackPoint = await service.createFullRollbackPoint(
        sampleWaveId,
        'Test Metadata'
      );

      // Verify metadata was saved to file (without full snapshot)
      const saveCall = mockFs.writeFile.mock.calls.find(
        (call: any[]) => call[0].includes('rollback-points.json')
      );

      expect(saveCall).toBeDefined();

      const savedData = JSON.parse(saveCall[1]);
      const savedPoint = savedData.find((p: any) => p.id === rollbackPoint.id);

      expect(savedPoint).toBeDefined();
      expect(savedPoint.snapshot).toBeUndefined(); // Snapshot should not be in metadata
      expect(savedPoint.metadata).toBeDefined();
    }, 30000);
  });
});
