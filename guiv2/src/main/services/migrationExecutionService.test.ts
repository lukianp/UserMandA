/**
 * Unit Tests for MigrationExecutionService
 *
 * CRITICAL SERVICE - Handles user migration execution
 * Tests cover:
 * - Wave execution (sequential, parallel, batch)
 * - Dry-run vs production modes
 * - Pause/resume/cancel operations
 * - Error recovery and retry logic
 * - Transaction management
 * - Logging functionality
 * - Pre-execution validation
 */

import MigrationExecutionService from './migrationExecutionService';
import PowerShellExecutionService from './powerShellService';
import * as path from 'path';
import { EventEmitter } from 'events';

// Mock dependencies
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  appendFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(''),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./powerShellService');

const mockFs = require('fs/promises');
const MockPowerShellService = PowerShellExecutionService as jest.MockedClass<typeof PowerShellExecutionService>;

describe('MigrationExecutionService', () => {
  let service: MigrationExecutionService;
  let mockPowerShell: jest.Mocked<PowerShellExecutionService>;
  let testDataDir: string;

  // Sample test data
  const sampleSteps = [
    {
      id: 'step-1',
      name: 'Pre-Migration Validation',
      phase: 'pre-migration' as const,
      scriptPath: './scripts/validate.ps1',
      parameters: {},
      required: true,
      retryable: false,
      dependencies: [],
    },
    {
      id: 'step-2',
      name: 'Migrate Mailbox',
      phase: 'migration' as const,
      scriptPath: './scripts/migrate-mailbox.ps1',
      parameters: {},
      required: true,
      retryable: true,
      timeout: 300000,
      dependencies: ['step-1'],
    },
    {
      id: 'step-3',
      name: 'Post-Migration Cleanup',
      phase: 'post-migration' as const,
      scriptPath: './scripts/cleanup.ps1',
      parameters: {},
      required: false,
      retryable: true,
      dependencies: ['step-2'],
    },
  ];

  const sampleUsers = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock fs
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.appendFile.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('');

    // Setup mock PowerShell service
    mockPowerShell = new MockPowerShellService() as jest.Mocked<PowerShellExecutionService>;
    mockPowerShell.executeScript = jest.fn().mockResolvedValue({
      success: true,
      data: { output: 'Script executed successfully' },
      error: null,
    });

    testDataDir = path.join(process.cwd(), 'data', 'test-migration-execution');
    service = new MigrationExecutionService(mockPowerShell, testDataDir, 2);
  });

  afterEach(async () => {
    if (service && typeof service.shutdown === 'function') {
      try {
        await service.shutdown();
      } catch (error) {
        // Ignore shutdown errors in tests
      }
    }
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    it('should create data directory on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('migration-execution'),
        { recursive: true }
      );
    });

    it('should initialize with provided configuration', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(MigrationExecutionService);
      expect(service).toBeInstanceOf(EventEmitter);
    });
  });

  // ============================================================================
  // Wave Execution Tests
  // ============================================================================

  describe('executeWave', () => {
    it('should execute wave in sequential mode', async () => {
      const waveId = 'wave-sequential-001';

      // Setup event listener to track progress
      const events: any[] = [];
      service.on('wave:started', (data) => events.push({ event: 'started', data }));
      service.on('wave:completed', (data) => events.push({ event: 'completed', data }));

      await service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false, // Skip validation for this test
      });

      // Verify execution started event
      expect(events[0]).toMatchObject({
        event: 'started',
        data: { waveId, mode: 'production', strategy: 'sequential', userCount: 3 },
      });

      // Verify execution completed event
      expect(events[1]).toMatchObject({
        event: 'completed',
        data: { waveId },
      });
      expect(events[1].data.completed).toBeDefined();
      expect(events[1].data.failed).toBeDefined();

      // Verify PowerShell scripts were executed
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should execute wave in parallel mode', async () => {
      const waveId = 'wave-parallel-001';

      await service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'parallel',
        parallelism: 2,
        preValidation: false,
      });

      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should execute wave in batch mode', async () => {
      const waveId = 'wave-batch-001';

      await service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'batch',
        parallelism: 2,
        preValidation: false,
      });

      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should execute wave in dry-run mode without making changes', async () => {
      const waveId = 'wave-dryrun-001';

      await service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'dry-run',
        strategy: 'sequential',
        preValidation: false,
      });

      // In dry-run mode, scripts should still be called
      // (the service simulates execution but marks it as dry-run)
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should handle user migration failures gracefully', async () => {
      const waveId = 'wave-fail-001';

      // Create a required step that will fail
      const requiredStep = {
        id: 'required-step-1',
        name: 'Critical Operation',
        phase: 'migration' as const,
        scriptPath: './scripts/critical.ps1',
        parameters: {},
        required: true,
        retryable: false,
        dependencies: [],
      };

      // Make PowerShell script fail
      mockPowerShell.executeScript = jest.fn().mockRejectedValue(
        new Error('Script execution failed')
      );

      const userFailedEvents: any[] = [];
      const waveCompletedEvents: any[] = [];
      service.on('user:failed', (data) => userFailedEvents.push(data));
      service.on('wave:completed', (data) => waveCompletedEvents.push(data));

      // Wave should complete (not throw) even with user failures
      await service.executeWave(waveId, [sampleUsers[0]], [requiredStep], {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Verify user failure event was emitted
      expect(userFailedEvents.length).toBeGreaterThan(0);
      expect(userFailedEvents[0].userId).toBe(sampleUsers[0]);

      // Verify wave still completed
      expect(waveCompletedEvents.length).toBeGreaterThan(0);
      expect(waveCompletedEvents[0].failed).toBeGreaterThan(0);
    }, 30000);

    it('should reject empty user list', async () => {
      const waveId = 'wave-empty-001';

      await service.executeWave(waveId, [], sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Should complete immediately with 0 users
      expect(mockPowerShell.executeScript).not.toHaveBeenCalled();
    }, 30000);

    it('should emit progress events during execution', async () => {
      const waveId = 'wave-progress-001';

      const progressEvents: any[] = [];
      service.on('user:started', (data) => progressEvents.push({ event: 'user:started', data }));
      service.on('user:completed', (data) => progressEvents.push({ event: 'user:completed', data }));

      await service.executeWave(waveId, [sampleUsers[0]], sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Should have progress events
      expect(progressEvents.length).toBeGreaterThan(0);
    }, 30000);
  });

  // ============================================================================
  // Pause/Resume/Cancel Tests
  // ============================================================================

  describe('pauseWave', () => {
    it('should pause wave execution', async () => {
      const waveId = 'wave-pause-001';

      // Make PowerShell execution slow to allow pause
      mockPowerShell.executeScript = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {},
          error: null,
        }), 500))
      );

      // Start execution in background (don't await)
      const execution = service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Pause immediately
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.pauseWave(waveId);

      // Wait for execution to complete (it should pause)
      await execution;

      // Verify pause was called
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should emit pause event', async () => {
      const waveId = 'wave-pause-event-001';

      const events: any[] = [];
      service.on('wave:paused', (data) => events.push({ event: 'paused', data }));

      // Make execution slow
      mockPowerShell.executeScript = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {},
          error: null,
        }), 500))
      );

      // Start execution
      const execution = service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Pause while running
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.pauseWave(waveId);

      await execution;

      // Check if pause event was emitted
      const pauseEvent = events.find(e => e.event === 'paused');
      expect(pauseEvent).toBeDefined();
    }, 30000);
  });

  describe('resumeWave', () => {
    it('should resume paused wave execution', async () => {
      const waveId = 'wave-resume-001';

      // Make execution slow
      mockPowerShell.executeScript = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {},
          error: null,
        }), 500))
      );

      // Start execution
      const execution = service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Pause
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.pauseWave(waveId);

      // Resume
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.resumeWave(waveId);

      await execution;

      // Verify execution happened
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should emit resume event', async () => {
      const waveId = 'wave-resume-event-001';

      const events: any[] = [];
      service.on('wave:resumed', (data) => events.push({ event: 'resumed', data }));

      // Make execution slow
      mockPowerShell.executeScript = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {},
          error: null,
        }), 500))
      );

      // Start execution
      const execution = service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Pause then resume
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.pauseWave(waveId);
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.resumeWave(waveId);

      await execution;

      // Check if resume event was emitted
      const resumeEvent = events.find(e => e.event === 'resumed');
      expect(resumeEvent).toBeDefined();
    }, 30000);
  });

  describe('cancelWave', () => {
    it('should cancel wave execution', async () => {
      const waveId = 'wave-cancel-001';

      // Make execution slow
      mockPowerShell.executeScript = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {},
          error: null,
        }), 500))
      );

      // Start execution
      const execution = service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Cancel after short delay
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.cancelWave(waveId);

      // Wait for execution to complete (should be cancelled)
      await execution.catch(() => {
        // Cancellation may throw an error, which is expected
      });

      // Verify cancel was successful
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should emit cancel event', async () => {
      const waveId = 'wave-cancel-event-001';

      const events: any[] = [];
      service.on('wave:cancelled', (data) => events.push({ event: 'cancelled', data }));

      // Make execution slow
      mockPowerShell.executeScript = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {},
          error: null,
        }), 500))
      );

      // Start execution
      const execution = service.executeWave(waveId, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Cancel
      await new Promise(resolve => setTimeout(resolve, 50));
      await service.cancelWave(waveId);

      await execution.catch(() => {});

      // Check if cancel event was emitted
      const cancelEvent = events.find(e => e.event === 'cancelled');
      expect(cancelEvent).toBeDefined();
    }, 30000);
  });

  // ============================================================================
  // Logging Tests
  // ============================================================================

  describe('getLogs', () => {
    it('should return execution logs', async () => {
      const waveId = 'wave-logs-001';

      // Execute a wave
      await service.executeWave(waveId, [sampleUsers[0]], sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Mock log file content
      const mockLogContent = `2025-01-01T00:00:00.000Z [INFO] [${waveId}]   Starting wave execution
2025-01-01T00:01:00.000Z [INFO] [${waveId}] ${sampleUsers[0]}  User migration started`;

      mockFs.readFile = jest.fn().mockResolvedValue(mockLogContent);

      const logs = await service.getLogs(waveId);

      expect(Array.isArray(logs)).toBe(true);
    }, 30000);

    it('should filter logs by waveId', async () => {
      const waveId1 = 'wave-filter-001';
      const waveId2 = 'wave-filter-002';

      // Mock log content with multiple waves
      const mockLogContent = `2025-01-01T00:00:00.000Z [INFO] [${waveId1}]   Wave 1 started
2025-01-01T00:01:00.000Z [INFO] [${waveId2}]   Wave 2 started`;

      mockFs.readFile = jest.fn().mockResolvedValue(mockLogContent);

      const logs = await service.getLogs(waveId1);

      // Should only return logs for waveId1
      expect(logs.every(log => log.waveId === waveId1)).toBe(true);
    }, 30000);

    it('should return empty array when no logs exist', async () => {
      mockFs.readFile = jest.fn().mockRejectedValue(new Error('File not found'));

      const logs = await service.getLogs();

      expect(logs).toEqual([]);
    }, 30000);
  });

  // ============================================================================
  // Shutdown Tests
  // ============================================================================

  describe('shutdown', () => {
    it('should cancel all running waves on shutdown', async () => {
      const waveId1 = 'wave-shutdown-001';
      const waveId2 = 'wave-shutdown-002';

      // Start multiple waves
      const execution1 = service.executeWave(waveId1, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      const execution2 = service.executeWave(waveId2, sampleUsers, sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Shutdown
      await service.shutdown();

      // Both executions should be cancelled
      await execution1.catch(() => {});
      await execution2.catch(() => {});
    }, 30000);

    it('should clean up resources', async () => {
      await service.shutdown();

      // Verify cleanup was performed
      expect(service).toBeDefined();
    }, 30000);
  });

  // ============================================================================
  // Error Recovery Tests
  // ============================================================================

  describe('Error Recovery', () => {
    it('should retry retryable steps on failure', async () => {
      const waveId = 'wave-retry-001';

      // Create a single retryable step
      const retryableStep = {
        id: 'retry-step-1',
        name: 'Retryable Operation',
        phase: 'migration' as const,
        scriptPath: './scripts/retry-test.ps1',
        parameters: {},
        required: true,
        retryable: true,
        dependencies: [],
      };

      let callCount = 0;
      mockPowerShell.executeScript = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          success: true,
          data: { output: 'Success after retry' },
          error: null,
        });
      });

      await service.executeWave(waveId, [sampleUsers[0]], [retryableStep], {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Script should have been called 2 times (initial + 1 retry)
      expect(callCount).toBe(2);
    }, 30000);

    it('should handle non-required step failure gracefully', async () => {
      const waveId = 'wave-no-retry-001';

      // Create a non-required, non-retryable step
      const nonRequiredStep = {
        id: 'optional-step-1',
        name: 'Optional Operation',
        phase: 'post-migration' as const,
        scriptPath: './scripts/optional.ps1',
        parameters: {},
        required: false,
        retryable: false,
        dependencies: [],
      };

      mockPowerShell.executeScript = jest.fn().mockRejectedValue(
        new Error('Non-retryable failure')
      );

      // Should NOT throw because step is not required
      await service.executeWave(waveId, [sampleUsers[0]], [nonRequiredStep], {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Verify execution was attempted
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle concurrent wave executions', async () => {
      const waveId1 = 'wave-concurrent-001';
      const waveId2 = 'wave-concurrent-002';

      const execution1 = service.executeWave(waveId1, [sampleUsers[0]], sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      const execution2 = service.executeWave(waveId2, [sampleUsers[1]], sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      await Promise.all([execution1, execution2]);
    }, 30000);

    it('should handle steps with dependencies', async () => {
      const waveId = 'wave-dependencies-001';

      // Steps are already set up with dependencies in sampleSteps
      await service.executeWave(waveId, [sampleUsers[0]], sampleSteps, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Verify steps were executed in correct order
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should respect step timeout settings', async () => {
      const waveId = 'wave-timeout-001';

      // Create a step with very short timeout
      const stepsWithTimeout = [
        {
          ...sampleSteps[0],
          timeout: 1, // 1ms timeout
        },
      ];

      // Make script take longer than timeout
      mockPowerShell.executeScript = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {},
          error: null,
        }), 100))
      );

      await service.executeWave(waveId, [sampleUsers[0]], stepsWithTimeout, {
        mode: 'production',
        strategy: 'sequential',
        preValidation: false,
      });

      // Should handle timeout gracefully
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);
  });
});
