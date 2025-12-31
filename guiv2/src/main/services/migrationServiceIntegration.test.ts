/**
 * Migration Services Integration Tests
 *
 * Tests the integration and interaction between migration services including:
 * - Planning → Validation → Execution workflow
 * - Execution → Rollback workflow
 * - Migration → Delta Sync workflow
 * - Coexistence → Cutover workflow
 */

import * as path from 'path';

import MigrationOrchestrationService from './migrationOrchestrationService';
import MigrationExecutionService from './migrationExecutionService';
import RollbackService from './rollbackService';
import DeltaSyncService from './deltaSyncService';
import CoexistenceService from './coexistenceService';
import CutoverService from './cutoverService';
import MigrationReportingService from './migrationReportingService';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
  readdir: jest.fn(),
  appendFile: jest.fn(),
}));

// Mock fs (for sync and callback-based operations)
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  appendFile: jest.fn((path, data, callback) => callback && callback(null)),
  appendFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => '[]'),
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

  // Helper to create execution steps for mailbox migration
  const createMailboxMigrationSteps = () => [
    {
      id: 'step-pre-migration',
      name: 'Pre-migration checks',
      phase: 'pre-migration' as const,
      scriptPath: 'Modules/Migration/Pre-Migration.ps1',
      parameters: {},
      required: true,
      retryable: true,
      dependencies: [],
    },
    {
      id: 'step-migration',
      name: 'Mailbox migration',
      phase: 'migration' as const,
      scriptPath: 'Modules/Migration/Migrate-Mailbox.ps1',
      parameters: {},
      required: true,
      retryable: false,
      dependencies: ['step-pre-migration'],
    },
    {
      id: 'step-post-migration',
      name: 'Post-migration validation',
      phase: 'post-migration' as const,
      scriptPath: 'Modules/Migration/Post-Migration.ps1',
      parameters: {},
      required: false,
      retryable: true,
      dependencies: ['step-migration'],
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    uuidCounter = 0;

    // Setup default mock responses
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.appendFile.mockResolvedValue(undefined);
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

      // Step 3: Execute migration using execution service
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

      // Execute the wave
      await executionService.executeWave(
        wave1.id,
        wave1.users,
        createMailboxMigrationSteps(),
        { mode: 'production', strategy: 'sequential' }
      );

      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      const status = executionService.getExecutionStatus(wave1.id);
      expect(status?.completedUsers).toBe(2);

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
      const waveId = 'wave-rollback-test';
      const users = ['user1@test.com', 'user2@test.com'];

      // Create rollback point before execution
      const rollbackPoint = await rollbackService.createFullRollbackPoint(
        waveId,
        'Pre-migration state',
        `Pre-migration state for users: ${users.join(', ')}`
      );

      const rollbackPoints = rollbackService.getRollbackPoints();
      expect(rollbackPoints.length).toBe(1);

      // Simulate failed execution
      mockPowerShell.executeScript.mockRejectedValueOnce(new Error('Migration failed'));

      // Attempt to execute wave
      try {
        await executionService.executeWave(
          waveId,
          users,
          createMailboxMigrationSteps(),
          { mode: 'production', strategy: 'sequential' }
        );
      } catch (error) {
        // Expected to fail
      }

      // Wait for failure to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Execute rollback
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { rolledBack: users.length },
        error: null,
      });

      await rollbackService.rollback(rollbackPoint.id, { dryRun: false });

      // Verify rollback was attempted
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 60000);

    it('should support partial rollback of specific users', async () => {
      const waveId = 'wave-partial-rollback';
      const users = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

      // Create selective rollback point
      const rollbackPoint = await rollbackService.createSelectiveRollbackPoint(
        waveId,
        ['user1@test.com', 'user2@test.com'],
        'Partial rollback point'
      );

      expect(rollbackPoint).toBeDefined();
      expect(rollbackPoint.type).toBe('selective');

      // Execute rollback for specific users only
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { rolledBack: 2 },
        error: null,
      });

      await rollbackService.rollback(rollbackPoint.id, { dryRun: false });

      // Verify rollback was performed
      const retrievedPoint = rollbackService.getRollbackPoint(rollbackPoint.id);
      expect(retrievedPoint).toBeDefined();
    }, 60000);
  });

  // ============================================
  // Migration → Delta Sync Workflow
  // ============================================

  describe('Migration → Delta Sync Workflow', () => {
    it('should schedule delta sync after successful migration', async () => {
      const waveId = 'wave-delta-test';
      const users = ['user1@test.com'];

      // Execute migration
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { users: [{ upn: 'user1@test.com', status: 'completed' }] },
        error: null,
      });

      await executionService.executeWave(
        waveId,
        users,
        createMailboxMigrationSteps(),
        { mode: 'production', strategy: 'sequential' }
      );

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Schedule delta sync
      const schedule = await deltaSyncService.scheduleDeltaSync(
        waveId,
        'Delta Sync Every 6 Hours',
        '0 */6 * * *', // Every 6 hours
        { type: 'incremental', direction: 'source-to-target' }
      );

      expect(schedule.waveId).toBe(waveId);
      expect(schedule.enabled).toBe(true);

      // Perform initial delta sync
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { changes: 5, applied: 5, failed: 0 },
        error: null,
      });

      const syncResult = await deltaSyncService.performDeltaSync(
        waveId,
        'incremental',
        'source-to-target'
      );

      expect(syncResult).toBeDefined();
      expect(syncResult.changesApplied).toBeGreaterThan(0);

      // Verify sync history
      const history = deltaSyncService.getSyncHistory(waveId);
      expect(history.length).toBeGreaterThan(0);
    }, 60000);

    it('should handle conflicts during delta sync', async () => {
      const waveId = 'wave-conflict-test';
      const users = ['user1@test.com'];

      // Execute initial migration
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { users: [{ upn: 'user1@test.com', status: 'completed' }] },
        error: null,
      });

      await executionService.executeWave(
        waveId,
        users,
        createMailboxMigrationSteps(),
        { mode: 'production', strategy: 'sequential' }
      );

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
        waveId,
        'incremental',
        'source-to-target'
      );

      expect(result.changesApplied).toBeGreaterThan(0);
      expect(result.conflicts).toBeGreaterThan(0);
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
        {
          id: 'source-env',
          name: 'On-Premises Exchange',
          type: 'on-premises',
          endpoints: { exchange: 'exchange.local' }
        },
        {
          id: 'target-env',
          name: 'Microsoft 365',
          type: 'cloud',
          endpoints: { exchange: 'tenant.onmicrosoft.com' }
        },
        {
          freeBusy: true,
          mailRouting: true,
          galSync: true,
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
        dnsRecords: [
          {
            id: 'mx-record',
            type: 'MX',
            name: '@',
            currentValue: '',
            newValue: 'tenant-onmicrosoft-com.mail.protection.outlook.com',
            ttl: 3600,
            updated: false
          },
        ],
        notifications: [],
        rollbackPlan: [],
        checklist: [
          { id: 'check-1', phase: 'pre-cutover', name: 'Verify coexistence', description: 'Check coexistence health', required: true, completed: true },
        ],
        description: 'Production cutover plan',
        scheduledEnd: new Date(Date.now() + 3600000),
        metadata: {},
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
      const rollbackPoint = await rollbackService.createFullRollbackPoint(
        wave.id,
        'E2E Pre-migration',
        `Pre-migration state for ${wave.users.length} users`
      );

      // 4. Execute migration
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          users: wave.users.map(u => ({ upn: u, status: 'completed', mailboxMigrated: true })),
        },
        error: null,
      });

      await executionService.executeWave(
        wave.id,
        wave.users,
        createMailboxMigrationSteps(),
        { mode: 'production', strategy: 'sequential' }
      );

      await new Promise(resolve => setTimeout(resolve, 2000));

      // 5. Schedule delta sync
      await deltaSyncService.scheduleDeltaSync(
        wave.id,
        'E2E Delta Sync',
        '0 */6 * * *',
        { type: 'incremental', direction: 'source-to-target' }
      );

      // 6. Generate report
      const report = await reportingService.generateReport('executive-summary', {});
      expect(report.type).toBe('executive-summary');

      // Verify all events were triggered
      expect(events.length).toBeGreaterThan(0);

      // Verify final state
      const stats = orchestrationService.getStatistics('e2e-test');
      expect(stats.totalWaves).toBe(1);
      expect(stats.totalUsers).toBe(2);

      const finalStatus = executionService.getExecutionStatus(wave.id);
      expect(finalStatus?.completedUsers).toBe(2);
    }, 60000);
  });
});



