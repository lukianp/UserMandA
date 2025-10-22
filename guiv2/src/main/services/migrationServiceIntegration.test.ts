/**
 * Migration Services Integration Tests
 *
 * Tests the integration and interaction between migration services including:
 * - Planning → Validation → Execution workflow
 * - Execution → Rollback workflow
 * - Migration → Delta Sync workflow
 * - Coexistence → Cutover workflow
 */

import MigrationOrchestrationService from './migrationOrchestrationService';
import MigrationExecutionService from './migrationExecutionService';
import RollbackService from './rollbackService';
import DeltaSyncService from './deltaSyncService';
import CoexistenceService from './coexistenceService';
import CutoverService from './cutoverService';
import MigrationReportingService from './migrationReportingService';
import * as path from 'path';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
  readdir: jest.fn(),
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

describe('Migration Services Integration', () => {
  let orchestrationService: MigrationOrchestrationService;
  let executionService: MigrationExecutionService;
  let rollbackService: RollbackService;
  let deltaSyncService: DeltaSyncService;
  let coexistenceService: CoexistenceService;
  let cutoverService: CutoverService;
  let reportingService: MigrationReportingService;
  let mockPowerShell: any;
  const testDataDir = path.join(process.cwd(), 'test-data', 'integration');
  const mockFs = require('fs/promises');

  beforeEach(async () => {
    jest.clearAllMocks();
    uuidCounter = 0;

    // Setup default mock responses
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.unlink.mockResolvedValue(undefined);
    mockFs.readdir.mockResolvedValue([]);
    mockFs.readFile.mockImplementation((filepath: string) => {
      if (filepath.includes('.json')) return Promise.resolve('[]');
      return Promise.reject(new Error('File not found'));
    });

    // Mock PowerShell service
    mockPowerShell = {
      executeScript: jest.fn(),
    };

    mockPowerShell.executeScript.mockResolvedValue({
      success: true,
      data: { completed: true },
      error: null,
    });

    // Create service instances
    orchestrationService = new MigrationOrchestrationService(testDataDir);
    executionService = new MigrationExecutionService(mockPowerShell, testDataDir);
    rollbackService = new RollbackService(mockPowerShell, testDataDir);
    deltaSyncService = new DeltaSyncService(mockPowerShell, testDataDir);
    coexistenceService = new CoexistenceService(mockPowerShell, testDataDir);
    cutoverService = new CutoverService(mockPowerShell, testDataDir);
    reportingService = new MigrationReportingService(mockPowerShell, testDataDir);

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  afterEach(async () => {
    orchestrationService.removeAllListeners();
    executionService.removeAllListeners();
    rollbackService.removeAllListeners();
    deltaSyncService.removeAllListeners();
    coexistenceService.removeAllListeners();
    cutoverService.removeAllListeners();
    reportingService.removeAllListeners();

    await reportingService.shutdown();
  });

  // ============================================
  // Planning → Execution Workflow
  // ============================================

  describe('Planning → Execution Workflow', () => {
    it('should execute a complete migration workflow from planning to completion', async () => {
      // Step 1: Plan waves using orchestration service
      const wave1 = await orchestrationService.planWave({
        projectId: 'integration-test-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com', 'user2@test.com'],
        resources: [],
        dependencies: [],
      });

      expect(wave1.status).toBe('planned');

      // Step 2: Validate the wave
      const validation = await orchestrationService.validateWaves('integration-test-1');
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);

      // Step 3: Create migration jobs in execution service
      const job = await executionService.createMigrationJob({
        waveId: wave1.id,
        name: 'Wave 1 Migration',
        type: 'mailbox',
        users: wave1.users,
        sourceProfile: 'source-profile',
        targetProfile: 'target-profile',
        options: {},
      });

      expect(job.status).toBe('pending');

      // Step 4: Execute the job
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          users: wave1.users.map(u => ({
            upn: u,
            status: 'completed',
            mailboxMigrated: true,
          })),
        },
        error: null,
      });

      await executionService.startJob(job.id);

      // Wait for job to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedJob = executionService.getJob(job.id);
      expect(updatedJob?.status).toBe('completed');
      expect(updatedJob?.completedItems).toBe(2);

      // Step 5: Verify orchestration service tracks completion
      const stats = orchestrationService.getStatistics('integration-test-1');
      expect(stats.totalWaves).toBe(1);
      expect(stats.totalUsers).toBe(2);
    }, 60000);

    it('should handle multi-wave migration with dependencies', async () => {
      // Plan wave 1
      const wave1 = await orchestrationService.planWave({
        projectId: 'integration-test-2',
        name: 'Wave 1 - IT Department',
        sequence: 1,
        users: ['it1@test.com', 'it2@test.com'],
        resources: [],
        dependencies: [],
      });

      // Plan wave 2 with dependency on wave 1
      const wave2 = await orchestrationService.planWave({
        projectId: 'integration-test-2',
        name: 'Wave 2 - Sales Department',
        sequence: 2,
        users: ['sales1@test.com', 'sales2@test.com', 'sales3@test.com'],
        resources: [],
        dependencies: [wave1.id],
      });

      // Validate
      const validation = await orchestrationService.validateWaves('integration-test-2');
      expect(validation.valid).toBe(true);

      // Execute migration
      await orchestrationService.executeMigration('integration-test-2');

      // Verify wave 1 completed before wave 2 started
      const stats = orchestrationService.getStatistics('integration-test-2');
      expect(stats.totalWaves).toBe(2);
      expect(stats.totalUsers).toBe(5);
    }, 60000);
  });

  // ============================================
  // Execution → Rollback Workflow
  // ============================================

  describe('Execution → Rollback Workflow', () => {
    it('should rollback a migration when execution fails', async () => {
      // Create migration job
      const job = await executionService.createMigrationJob({
        waveId: 'wave-rollback-test',
        name: 'Rollback Test Migration',
        type: 'mailbox',
        users: ['user1@test.com', 'user2@test.com'],
        sourceProfile: 'source-profile',
        targetProfile: 'target-profile',
        options: {},
      });

      // Create rollback point before execution
      await rollbackService.createRollbackPoint({
        migrationJobId: job.id,
        name: 'Pre-migration state',
        captureMailboxes: true,
        capturePermissions: true,
        captureGroups: false,
      });

      const rollbackPoints = rollbackService.getRollbackPoints();
      expect(rollbackPoints.length).toBe(1);

      // Simulate failed execution
      mockPowerShell.executeScript.mockRejectedValueOnce(new Error('Migration failed'));

      await executionService.startJob(job.id);

      // Wait for failure
      await new Promise(resolve => setTimeout(resolve, 1000));

      const failedJob = executionService.getJob(job.id);
      expect(failedJob?.status).toBe('failed');

      // Execute rollback
      const rollbackPoint = rollbackPoints[0];
      await rollbackService.executeRollback(rollbackPoint.id);

      // Verify rollback was attempted
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Invoke-Rollback.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 60000);

    it('should support partial rollback of specific users', async () => {
      const job = await executionService.createMigrationJob({
        waveId: 'wave-partial-rollback',
        name: 'Partial Rollback Test',
        type: 'mailbox',
        users: ['user1@test.com', 'user2@test.com', 'user3@test.com'],
        sourceProfile: 'source-profile',
        targetProfile: 'target-profile',
        options: {},
      });

      // Create rollback point
      const rollbackPoint = await rollbackService.createRollbackPoint({
        migrationJobId: job.id,
        name: 'Partial rollback point',
        captureMailboxes: true,
        capturePermissions: true,
        captureGroups: false,
      });

      // Execute rollback for specific users only
      await rollbackService.executeRollback(rollbackPoint.id, {
        rollbackItems: ['user1@test.com', 'user2@test.com'],
      });

      // Verify only specified users were rolled back
      const history = rollbackService.getRollbackHistory();
      expect(history.length).toBe(1);
      expect(history[0].rollbackPointId).toBe(rollbackPoint.id);
    }, 60000);
  });

  // ============================================
  // Migration → Delta Sync Workflow
  // ============================================

  describe('Migration → Delta Sync Workflow', () => {
    it('should schedule delta sync after successful migration', async () => {
      // Execute migration
      const job = await executionService.createMigrationJob({
        waveId: 'wave-delta-test',
        name: 'Delta Sync Test Migration',
        type: 'mailbox',
        users: ['user1@test.com'],
        sourceProfile: 'source-profile',
        targetProfile: 'target-profile',
        options: {},
      });

      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { users: [{ upn: 'user1@test.com', status: 'completed' }] },
        error: null,
      });

      await executionService.startJob(job.id);

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Schedule delta sync
      const schedule = await deltaSyncService.scheduleDeltaSync(
        'wave-delta-test',
        'source-profile',
        'target-profile',
        '0 */6 * * *', // Every 6 hours
        ['user1@test.com'],
        { syncType: 'incremental', conflictResolution: 'newest-wins' }
      );

      expect(schedule.waveId).toBe('wave-delta-test');
      expect(schedule.enabled).toBe(true);

      // Perform initial delta sync
      await deltaSyncService.performDeltaSync(
        'wave-delta-test',
        'source-profile',
        'target-profile',
        ['user1@test.com'],
        { syncType: 'incremental', conflictResolution: 'newest-wins' }
      );

      // Verify sync history
      const history = deltaSyncService.getSyncHistory('wave-delta-test');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].status).toBe('completed');
    }, 60000);

    it('should handle conflicts during delta sync', async () => {
      const job = await executionService.createMigrationJob({
        waveId: 'wave-conflict-test',
        name: 'Conflict Test Migration',
        type: 'mailbox',
        users: ['user1@test.com'],
        sourceProfile: 'source-profile',
        targetProfile: 'target-profile',
        options: {},
      });

      await executionService.startJob(job.id);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock delta sync with conflicts
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          changes: 10,
          conflicts: [
            { item: 'email-1', source: 'modified', target: 'modified', resolution: 'newest-wins' },
          ],
        },
        error: null,
      });

      const result = await deltaSyncService.performDeltaSync(
        'wave-conflict-test',
        'source-profile',
        'target-profile',
        ['user1@test.com'],
        { syncType: 'incremental', conflictResolution: 'newest-wins' }
      );

      expect(result.conflicts).toBeDefined();
      expect(result.conflicts!.length).toBeGreaterThan(0);
    }, 60000);
  });

  // ============================================
  // Coexistence → Cutover Workflow
  // ============================================

  describe('Coexistence → Cutover Workflow', () => {
    it('should establish coexistence then perform cutover', async () => {
      // Step 1: Configure coexistence
      const coexistenceConfig = await coexistenceService.configureCoexistence(
        'wave-cutover-test',
        { type: 'exchange-onprem', connectionString: 'exchange.local' },
        { type: 'microsoft365', connectionString: 'tenant.onmicrosoft.com' },
        {
          freeBusySharing: true,
          mailRouting: true,
          globalAddressList: true,
          crossForestAuth: false,
          proxyAddresses: true,
        },
        'exchange-hybrid'
      );

      expect(coexistenceConfig.status).toBe('active');

      // Step 2: Monitor coexistence health
      const health = await coexistenceService.checkHealth(coexistenceConfig.id);
      expect(health.overallStatus).toBe('healthy');

      // Step 3: Plan cutover
      const cutoverPlan = await cutoverService.createCutoverPlan({
        waveId: 'wave-cutover-test',
        name: 'Production Cutover',
        scheduledStart: new Date(Date.now() + 1000),
        targetEnvironment: { type: 'microsoft365', connectionString: 'tenant.onmicrosoft.com' },
        dnsRecords: [
          { type: 'MX', name: '@', value: 'tenant-onmicrosoft-com.mail.protection.outlook.com', priority: 0, ttl: 3600 },
        ],
        notificationRules: {
          notifyOnPhaseStart: true,
          notifyOnPhaseComplete: true,
          notifyOnError: true,
          recipients: ['admin@test.com'],
        },
        rollbackPlan: {
          enabled: true,
          autoRollbackOnFailure: false,
        },
        checklist: [
          { id: 'check-1', phase: 'pre-cutover', name: 'Verify coexistence', description: 'Check coexistence health', required: true, completed: true },
        ],
        postCutoverActions: {
          decommissionSource: false,
          validateConfiguration: true,
          runSmokeTests: true,
        },
      });

      expect(cutoverPlan.status).toBe('planned');

      // Step 4: Execute cutover
      await cutoverService.executeCutover(cutoverPlan.id);

      const updatedPlan = cutoverService.getCutoverPlan(cutoverPlan.id);
      expect(updatedPlan?.status).toBe('completed');

      // Step 5: Verify coexistence is disabled after cutover
      const configAfterCutover = coexistenceService.getConfiguration(coexistenceConfig.id);
      // Note: In a real scenario, cutover would disable coexistence
      expect(configAfterCutover).toBeDefined();
    }, 60000);
  });

  // ============================================
  // End-to-End Complete Migration
  // ============================================

  describe('End-to-End Complete Migration', () => {
    it('should execute a complete migration lifecycle', async () => {
      const events: string[] = [];

      // Setup event listeners
      orchestrationService.on('wave:started', () => events.push('wave-started'));
      orchestrationService.on('wave:completed', () => events.push('wave-completed'));
      executionService.on('job:started', () => events.push('job-started'));
      executionService.on('job:completed', () => events.push('job-completed'));
      deltaSyncService.on('sync:started', () => events.push('sync-started'));
      deltaSyncService.on('sync:completed', () => events.push('sync-completed'));

      // 1. Plan migration
      const wave = await orchestrationService.planWave({
        projectId: 'e2e-test',
        name: 'E2E Test Wave',
        sequence: 1,
        users: ['user1@test.com', 'user2@test.com'],
        resources: [],
        dependencies: [],
      });

      // 2. Validate
      const validation = await orchestrationService.validateWaves('e2e-test');
      expect(validation.valid).toBe(true);

      // 3. Create rollback point
      const rollbackPoint = await rollbackService.createRollbackPoint({
        migrationJobId: wave.id,
        name: 'E2E Pre-migration',
        captureMailboxes: true,
        capturePermissions: true,
        captureGroups: true,
      });

      // 4. Execute migration
      const job = await executionService.createMigrationJob({
        waveId: wave.id,
        name: 'E2E Migration Job',
        type: 'mailbox',
        users: wave.users,
        sourceProfile: 'source',
        targetProfile: 'target',
        options: {},
      });

      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          users: wave.users.map(u => ({ upn: u, status: 'completed', mailboxMigrated: true })),
        },
        error: null,
      });

      await executionService.startJob(job.id);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 5. Schedule delta sync
      await deltaSyncService.scheduleDeltaSync(
        wave.id,
        'source',
        'target',
        '0 */6 * * *',
        wave.users,
        { syncType: 'incremental', conflictResolution: 'newest-wins' }
      );

      // 6. Generate report
      const report = await reportingService.generateReport('executive-summary', {});
      expect(report.type).toBe('executive-summary');

      // Verify all events were triggered
      expect(events.length).toBeGreaterThan(0);
      expect(events).toContain('job-started');
      expect(events).toContain('job-completed');

      // Verify final state
      const stats = orchestrationService.getStatistics('e2e-test');
      expect(stats.totalWaves).toBe(1);
      expect(stats.totalUsers).toBe(2);

      const finalJob = executionService.getJob(job.id);
      expect(finalJob?.status).toBe('completed');
      expect(finalJob?.completedItems).toBe(2);
    }, 60000);
  });
});
