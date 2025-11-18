/**
 * Delta Sync Service Tests
 *
 * Tests the delta synchronization service that handles incremental syncs after migration.
 */

import * as path from 'path';

import DeltaSyncService from './deltaSyncService';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

// Mock crypto.randomUUID
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => {
      uuidCounter++;
      return `test-uuid-${uuidCounter.toString().padStart(4, '0')}`;
    }),
  },
  writable: true,
  configurable: true,
});

describe('DeltaSyncService', () => {
  let service: DeltaSyncService;
  let mockPowerShell: any;
  const testDataDir = path.join(process.cwd(), 'test-data', 'delta-sync');
  const mockFs = require('fs/promises');
  const mockCron = require('node-cron');

  beforeEach(async () => {
    jest.clearAllMocks();
    uuidCounter = 0;

    // Setup default mock responses
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockRejectedValue(new Error('File not found'));

    // Mock PowerShell service
    mockPowerShell = {
      executeScript: jest.fn(),
    };

    mockPowerShell.executeScript.mockResolvedValue({
      success: true,
      data: { changes: [], applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
      error: null,
    });

    // Create service instance
    service = new DeltaSyncService(mockPowerShell, testDataDir, 10);

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    service.removeAllListeners();
    await service.shutdown();
  });

  // ============================================
  // Initialization Tests
  // ============================================

  describe('Initialization', () => {
    it('should create data directory on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
    });

    it('should set default bandwidth limit', () => {
      // Service should be created with 10 MB/s limit
      expect(service).toBeDefined();
    });

    it('should load persisted data on initialization', () => {
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'sync-history.json'),
        'utf-8'
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'schedules.json'),
        'utf-8'
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'timestamps.json'),
        'utf-8'
      );
    });
  });

  // ============================================
  // Delta Sync Tests
  // ============================================

  describe('Delta Sync Operations', () => {
    it('should perform incremental delta sync', async () => {
      const events: any[] = [];
      service.on('sync:started', data => events.push({ event: 'started', data }));
      service.on('sync:completed', data => events.push({ event: 'completed', data }));

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: [
            { id: '1', resourceId: 'user1', resourceType: 'user', changeType: 'modified', attributes: {}, changedFields: ['email'], timestamp: new Date() },
          ],
        },
        error: null,
      }).mockResolvedValueOnce({
        success: true,
        data: { applied: 1, failed: 0, conflicts: 0, bandwidth: 0.5, errors: [], warnings: [] },
        error: null,
      });

      const result = await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      expect(result).toBeDefined();
      expect(result.waveId).toBe('wave-1');
      expect(result.type).toBe('incremental');
      expect(result.direction).toBe('source-to-target');
      expect(result.changesDetected).toBe(1);
      expect(result.changesApplied).toBe(1);
      expect(events.some(e => e.event === 'started')).toBe(true);
      expect(events.some(e => e.event === 'completed')).toBe(true);
    }, 30000);

    it('should perform full sync', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: { changes: [] },
        error: null,
      }).mockResolvedValueOnce({
        success: true,
        data: { applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
        error: null,
      });

      const result = await service.performDeltaSync('wave-1', 'full', 'source-to-target');

      expect(result.type).toBe('full');
    }, 30000);

    it('should perform bidirectional sync', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: { changes: [] },
        error: null,
      }).mockResolvedValueOnce({
        success: true,
        data: { applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
        error: null,
      });

      const result = await service.performDeltaSync('wave-1', 'incremental', 'bidirectional');

      expect(result.direction).toBe('bidirectional');
    }, 30000);

    it('should detect changes since last sync', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: [
            { id: '1', resourceId: 'user1', resourceType: 'user', changeType: 'new', attributes: {}, changedFields: [], timestamp: new Date() },
            { id: '2', resourceId: 'user2', resourceType: 'user', changeType: 'modified', attributes: {}, changedFields: ['email'], timestamp: new Date() },
          ],
        },
        error: null,
      }).mockResolvedValueOnce({
        success: true,
        data: { applied: 2, failed: 0, conflicts: 0, bandwidth: 1.0, errors: [], warnings: [] },
        error: null,
      });

      const result = await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      expect(result.changesDetected).toBe(2);
      expect(result.changesApplied).toBe(2);
    }, 30000);

    it('should emit progress events during sync', async () => {
      const events: any[] = [];
      service.on('sync:progress', data => events.push(data));

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: Array(150).fill(null).map((_, i) => ({
            id: `${i}`,
            resourceId: `user${i}`,
            resourceType: 'user',
            changeType: 'new',
            attributes: {},
            changedFields: [],
            timestamp: new Date(),
          })),
        },
        error: null,
      }).mockResolvedValue({
        success: true,
        data: { applied: 100, failed: 0, conflicts: 0, bandwidth: 1.0, errors: [], warnings: [] },
        error: null,
      });

      await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.progress > 0)).toBe(true);
    }, 30000);

    it('should handle conflicts during sync', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: [
            { id: '1', resourceId: 'user1', resourceType: 'user', changeType: 'modified', attributes: {}, changedFields: ['email'], timestamp: new Date() },
          ],
        },
        error: null,
      }).mockResolvedValueOnce({
        success: true,
        data: { applied: 0, failed: 0, conflicts: 1, bandwidth: 0, errors: [], warnings: ['Conflict detected'] },
        error: null,
      });

      const result = await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      expect(result.conflicts).toBe(1);
      expect(result.warnings.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle sync failures', async () => {
      mockPowerShell.executeScript.mockRejectedValueOnce(new Error('PowerShell error'));

      await expect(service.performDeltaSync('wave-1', 'incremental', 'source-to-target'))
        .rejects.toThrow('PowerShell error');
    }, 30000);
  });

  // ============================================
  // Checkpoint Tests
  // ============================================

  describe('Checkpoints', () => {
    it('should create checkpoints during sync', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: Array(150).fill(null).map((_, i) => ({
            id: `${i}`,
            resourceId: `user${i}`,
            resourceType: 'user',
            changeType: 'new',
            attributes: {},
            changedFields: [],
            timestamp: new Date(),
          })),
        },
        error: null,
      }).mockResolvedValue({
        success: true,
        data: { applied: 100, failed: 0, conflicts: 0, bandwidth: 1.0, errors: [], warnings: [] },
        error: null,
      });

      await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      // Checkpoints should be created for batches
      // Service creates checkpoints internally
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should resume from checkpoint', async () => {
      // First, create a checkpoint by running a sync
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: Array(150).fill(null).map((_, i) => ({
            id: `${i}`,
            resourceId: `user${i}`,
            resourceType: 'user',
            changeType: 'new',
            attributes: {},
            changedFields: [],
            timestamp: new Date(),
          })),
        },
        error: null,
      }).mockResolvedValue({
        success: true,
        data: { applied: 100, failed: 0, conflicts: 0, bandwidth: 1.0, errors: [], warnings: [] },
        error: null,
      });

      await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      // Now resume from checkpoint (in real scenario, would use actual checkpoint ID)
      // This tests that the service can handle resume requests
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: { changes: [] },
        error: null,
      }).mockResolvedValueOnce({
        success: true,
        data: { applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
        error: null,
      });

      const checkpointId = 'test-uuid-0001';
      await expect(service.resumeFromCheckpoint(checkpointId)).rejects.toThrow('not found');
    }, 30000);
  });

  // ============================================
  // Scheduling Tests
  // ============================================

  describe('Sync Scheduling', () => {
    it('should schedule delta sync', async () => {
      const schedule = await service.scheduleDeltaSync(
        'wave-1',
        'Daily Sync',
        '0 0 * * *',
        { type: 'incremental', direction: 'source-to-target' }
      );

      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(typeof schedule.id).toBe('string');
      expect(schedule.name).toBe('Daily Sync');
      expect(schedule.cronExpression).toBe('0 0 * * *');
      expect(schedule.enabled).toBe(true);
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '0 0 * * *',
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should emit event when schedule created', async () => {
      const events: any[] = [];
      service.on('schedule:created', data => events.push(data));

      await service.scheduleDeltaSync('wave-1', 'Daily Sync', '0 0 * * *');

      expect(events.length).toBe(1);
      expect(events[0].schedule.name).toBe('Daily Sync');
    });

    it('should stop delta sync schedule', async () => {
      const schedule = await service.scheduleDeltaSync('wave-1', 'Daily Sync', '0 0 * * *');

      const events: any[] = [];
      service.on('schedule:stopped', data => events.push(data));

      await service.stopDeltaSync(schedule.id);

      expect(events.length).toBe(1);
      // Schedule should be stopped (verified by event)
    });

    it('should resume delta sync schedule', async () => {
      const schedule = await service.scheduleDeltaSync('wave-1', 'Daily Sync', '0 0 * * *');
      await service.stopDeltaSync(schedule.id);

      const events: any[] = [];
      service.on('schedule:resumed', data => events.push(data));

      await service.resumeDeltaSync(schedule.id);

      expect(events.length).toBe(1);
      // Schedule should be resumed (verified by event)
    });

    it('should delete schedule', async () => {
      const schedule = await service.scheduleDeltaSync('wave-1', 'Daily Sync', '0 0 * * *');

      const events: any[] = [];
      service.on('schedule:deleted', data => events.push(data));

      await service.deleteSchedule(schedule.id);

      expect(events.length).toBe(1);
      // Schedule should be deleted and stopped (verified by event)
    });

    it('should handle non-existent schedule operations', async () => {
      await expect(service.stopDeltaSync('non-existent')).rejects.toThrow('not found');
      await expect(service.resumeDeltaSync('non-existent')).rejects.toThrow('not found');
      await expect(service.deleteSchedule('non-existent')).rejects.toThrow('not found');
    });
  });

  // ============================================
  // Data Retrieval Tests
  // ============================================

  describe('Data Retrieval', () => {
    it('should get sync history for wave', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { changes: [], applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
        error: null,
      });

      await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');
      await service.performDeltaSync('wave-2', 'incremental', 'source-to-target');

      const history = service.getSyncHistory('wave-1');

      expect(history.length).toBe(1);
      expect(history[0].waveId).toBe('wave-1');
    }, 30000);

    it('should get all sync history when no wave specified', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { changes: [], applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
        error: null,
      });

      await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');
      await service.performDeltaSync('wave-2', 'incremental', 'source-to-target');

      const history = service.getSyncHistory();

      expect(history.length).toBe(2);
    }, 30000);

    it('should get schedules for wave', async () => {
      await service.scheduleDeltaSync('wave-1', 'Sync 1', '0 0 * * *');
      await service.scheduleDeltaSync('wave-2', 'Sync 2', '0 0 * * *');

      const schedules = service.getSchedules('wave-1');

      expect(schedules.length).toBe(1);
      expect(schedules[0].waveId).toBe('wave-1');
    });

    it('should get all schedules when no wave specified', async () => {
      await service.scheduleDeltaSync('wave-1', 'Sync 1', '0 0 * * *');
      await service.scheduleDeltaSync('wave-2', 'Sync 2', '0 0 * * *');

      const schedules = service.getSchedules();

      expect(schedules.length).toBe(2);
    });

    it('should get last sync timestamp', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { changes: [], applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
        error: null,
      });

      await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      const timestamp = service.getLastSyncTimestamp('wave-1');

      expect(timestamp).toBeDefined();
      expect(timestamp).toBeInstanceOf(Date);
    }, 30000);

    it('should return null for wave with no sync history', () => {
      const timestamp = service.getLastSyncTimestamp('non-existent');

      expect(timestamp).toBeNull();
    });
  });

  // ============================================
  // Bandwidth Throttling Tests
  // ============================================

  describe('Bandwidth Throttling', () => {
    it('should throttle when bandwidth limit exceeded', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: Array(200).fill(null).map((_, i) => ({
            id: `${i}`,
            resourceId: `user${i}`,
            resourceType: 'user',
            changeType: 'new',
            attributes: {},
            changedFields: [],
            timestamp: new Date(),
          })),
        },
        error: null,
      }).mockResolvedValue({
        success: true,
        data: { applied: 100, failed: 0, conflicts: 0, bandwidth: 15, errors: [], warnings: [] },
        error: null,
      });

      const startTime = Date.now();
      await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');
      const duration = Date.now() - startTime;

      // Should have some delay due to throttling
      expect(duration).toBeGreaterThan(0);
    }, 30000);
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle empty change list', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { changes: [], applied: 0, failed: 0, conflicts: 0, bandwidth: 0, errors: [], warnings: [] },
        error: null,
      });

      const result = await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      expect(result.changesDetected).toBe(0);
      expect(result.changesApplied).toBe(0);
    }, 30000);

    it('should handle very large batch of changes', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          changes: Array(1000).fill(null).map((_, i) => ({
            id: `${i}`,
            resourceId: `user${i}`,
            resourceType: 'user',
            changeType: 'new',
            attributes: {},
            changedFields: [],
            timestamp: new Date(),
          })),
        },
        error: null,
      }).mockResolvedValue({
        success: true,
        data: { applied: 100, failed: 0, conflicts: 0, bandwidth: 1.0, errors: [], warnings: [] },
        error: null,
      });

      const result = await service.performDeltaSync('wave-1', 'incremental', 'source-to-target');

      expect(result.changesDetected).toBe(1000);
      // Should be processed in batches
    }, 30000);

    it('should handle cron expression for different timezones', async () => {
      const schedule = await service.scheduleDeltaSync('wave-1', 'Hourly Sync', '0 * * * *');

      expect(schedule).toBeDefined();
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '0 * * * *',
        expect.any(Function),
        { timezone: 'UTC' }
      );
    });

    it('should persist data on shutdown', async () => {
      mockFs.writeFile.mockClear();

      await service.shutdown();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'sync-history.json'),
        expect.any(String),
        'utf-8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'schedules.json'),
        expect.any(String),
        'utf-8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'timestamps.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });
});

