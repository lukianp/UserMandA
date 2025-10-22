/**
 * Unit Tests for MigrationPlanningService
 *
 * CRITICAL SERVICE - Handles migration wave planning and scheduling
 * Tests cover:
 * - Plan creation and retrieval
 * - Wave creation and management
 * - User assignment to waves
 * - Wave status updates
 * - Plan deletion
 * - Statistics generation
 * - File persistence
 * - Error handling
 */

import * as path from 'path';

import MigrationPlanningService, { MigrationPlan, MigrationWave } from './migrationPlanningService';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn(),
  },
}));

// Mock crypto.randomUUID to generate unique IDs in tests
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

const mockFs = require('fs');

describe('MigrationPlanningService', () => {
  let service: MigrationPlanningService;
  let testDataRoot: string;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset UUID counter for predictable test IDs
    uuidCounter = 0;

    // Setup mock fs
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.promises.writeFile.mockResolvedValue(undefined);
    mockFs.promises.readFile.mockResolvedValue('{}');
    mockFs.promises.unlink.mockResolvedValue(undefined);
    mockFs.promises.readdir.mockResolvedValue([]);

    testDataRoot = 'C:\\TestData';
    service = new MigrationPlanningService(testDataRoot);
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    it('should create plans directory on initialization', () => {
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('MigrationPlans'),
        { recursive: true }
      );
    });

    it('should initialize with provided data root', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(MigrationPlanningService);
    });

    it('should use default data root when not provided', () => {
      const defaultService = new MigrationPlanningService();
      expect(defaultService).toBeDefined();
    });
  });

  // ============================================================================
  // Plan Creation Tests
  // ============================================================================

  describe('createPlan', () => {
    it('should create a new migration plan successfully', async () => {
      const planData = {
        profileName: 'TestProfile',
        name: 'Q1 2025 Migration',
        description: 'First quarter migration wave',
      };

      const plan = await service.createPlan(planData);

      expect(plan).toMatchObject({
        profileName: 'TestProfile',
        name: 'Q1 2025 Migration',
        description: 'First quarter migration wave',
        waves: [],
      });

      expect(plan.id).toBeDefined();
      expect(plan.created).toBeDefined();
      expect(plan.modified).toBeDefined();

      // Verify plan was saved
      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`${plan.id}.json`),
        expect.any(String),
        'utf8'
      );
    });

    it('should generate unique IDs for each plan', async () => {
      const plan1 = await service.createPlan({
        profileName: 'Profile1',
        name: 'Plan 1',
        description: 'First plan',
      });

      const plan2 = await service.createPlan({
        profileName: 'Profile1',
        name: 'Plan 2',
        description: 'Second plan',
      });

      expect(plan1.id).not.toBe(plan2.id);
    });

    it('should set created and modified timestamps', async () => {
      const beforeCreate = new Date();

      const plan = await service.createPlan({
        profileName: 'Profile1',
        name: 'Test Plan',
        description: 'Test',
      });

      const afterCreate = new Date();

      expect(new Date(plan.created).getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(new Date(plan.created).getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(plan.created).toBe(plan.modified);
    });

    it('should initialize plan with empty waves array', async () => {
      const plan = await service.createPlan({
        profileName: 'Profile1',
        name: 'Test Plan',
        description: 'Test',
      });

      expect(plan.waves).toEqual([]);
    });
  });

  // ============================================================================
  // Wave Management Tests
  // ============================================================================

  describe('addWave', () => {
    let plan: MigrationPlan;

    beforeEach(async () => {
      plan = await service.createPlan({
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
      });
    });

    it('should add wave to plan successfully', async () => {
      const waveData = {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
        priority: 1,
      };

      const wave = await service.addWave(plan.id, waveData);

      expect(wave).toMatchObject({
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
        priority: 1,
        status: 'planned',
        users: [],
        dependencies: [],
      });

      expect(wave.id).toBeDefined();
      expect(wave.created).toBeDefined();
      expect(wave.modified).toBeDefined();
    });

    it('should add wave with default priority when not provided', async () => {
      const wave = await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      expect(wave.priority).toBe(1);
    });

    it('should add wave with dependencies', async () => {
      const wave1 = await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      const wave2 = await service.addWave(plan.id, {
        name: 'Wave 2',
        description: 'Second wave',
        startDate: '2025-01-16',
        endDate: '2025-01-31',
        dependencies: [wave1.id],
      });

      expect(wave2.dependencies).toEqual([wave1.id]);
    });

    it('should reject adding wave to non-existent plan', async () => {
      await expect(
        service.addWave('non-existent-id', {
          name: 'Wave 1',
          description: 'Test',
          startDate: '2025-01-01',
          endDate: '2025-01-15',
        })
      ).rejects.toThrow('Migration plan not found');
    });

    it('should update plan modified timestamp when adding wave', async () => {
      const originalModified = plan.modified;

      // Wait a tiny bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      const updatedPlan = await service.getPlan(plan.id);
      expect(updatedPlan?.modified).not.toBe(originalModified);
    });
  });

  // ============================================================================
  // User Assignment Tests
  // ============================================================================

  describe('assignUsersToWave', () => {
    let plan: MigrationPlan;
    let wave: MigrationWave;

    beforeEach(async () => {
      plan = await service.createPlan({
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
      });

      wave = await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });
    });

    it('should assign users to wave successfully', async () => {
      const userIds = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

      await service.assignUsersToWave(plan.id, wave.id, userIds);

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.users).toEqual(userIds);
    });

    it('should add users to existing user list', async () => {
      await service.assignUsersToWave(plan.id, wave.id, ['user1@test.com']);
      await service.assignUsersToWave(plan.id, wave.id, ['user2@test.com']);

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.users).toContain('user1@test.com');
      expect(updatedWave?.users).toContain('user2@test.com');
    });

    it('should prevent duplicate user assignments', async () => {
      await service.assignUsersToWave(plan.id, wave.id, ['user1@test.com', 'user2@test.com']);
      await service.assignUsersToWave(plan.id, wave.id, ['user2@test.com', 'user3@test.com']);

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      // user2@test.com should appear only once
      expect(updatedWave?.users.filter(u => u === 'user2@test.com').length).toBe(1);
      expect(updatedWave?.users.length).toBe(3); // user1, user2, user3
    });

    it('should reject assignment to non-existent plan', async () => {
      await expect(
        service.assignUsersToWave('non-existent-plan', wave.id, ['user1@test.com'])
      ).rejects.toThrow('Migration plan not found');
    });

    it('should reject assignment to non-existent wave', async () => {
      await expect(
        service.assignUsersToWave(plan.id, 'non-existent-wave', ['user1@test.com'])
      ).rejects.toThrow('Wave not found');
    });

    it('should handle empty user list', async () => {
      await service.assignUsersToWave(plan.id, wave.id, []);

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.users).toEqual([]);
    });
  });

  // ============================================================================
  // Wave Status Update Tests
  // ============================================================================

  describe('updateWaveStatus', () => {
    let plan: MigrationPlan;
    let wave: MigrationWave;

    beforeEach(async () => {
      plan = await service.createPlan({
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
      });

      wave = await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });
    });

    it('should update wave status to in-progress', async () => {
      await service.updateWaveStatus(plan.id, wave.id, 'inprogress');

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.status).toBe('inprogress');
    });

    it('should update wave status to completed', async () => {
      await service.updateWaveStatus(plan.id, wave.id, 'completed');

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.status).toBe('completed');
    });

    it('should update wave status to failed', async () => {
      await service.updateWaveStatus(plan.id, wave.id, 'failed');

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.status).toBe('failed');
    });

    it('should update wave modified timestamp', async () => {
      const originalModified = wave.modified;

      await new Promise(resolve => setTimeout(resolve, 10));

      await service.updateWaveStatus(plan.id, wave.id, 'inprogress');

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.modified).not.toBe(originalModified);
    });

    it('should reject status update for non-existent plan', async () => {
      await expect(
        service.updateWaveStatus('non-existent-plan', wave.id, 'completed')
      ).rejects.toThrow('Migration plan not found');
    });

    it('should reject status update for non-existent wave', async () => {
      await expect(
        service.updateWaveStatus(plan.id, 'non-existent-wave', 'completed')
      ).rejects.toThrow('Wave not found');
    });
  });

  // ============================================================================
  // Plan Retrieval Tests
  // ============================================================================

  describe('getPlan', () => {
    it('should retrieve plan from memory', async () => {
      const plan = await service.createPlan({
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
      });

      const retrieved = await service.getPlan(plan.id);

      expect(retrieved).toEqual(plan);
    });

    it('should load plan from disk if not in memory', async () => {
      const planId = 'test-plan-id';
      const mockPlan = {
        id: planId,
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
        waves: [],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPlan));

      const retrieved = await service.getPlan(planId);

      expect(retrieved).toMatchObject(mockPlan);
      expect(mockFs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining(`${planId}.json`),
        'utf8'
      );
    });

    it('should return null for non-existent plan', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const retrieved = await service.getPlan('non-existent-id');

      expect(retrieved).toBeNull();
    });

    it('should cache loaded plan in memory', async () => {
      const planId = 'test-plan-id';
      const mockPlan = {
        id: planId,
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
        waves: [],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPlan));

      // First call loads from disk
      await service.getPlan(planId);

      // Second call should use cache
      mockFs.promises.readFile.mockClear();
      await service.getPlan(planId);

      expect(mockFs.promises.readFile).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Get Plans by Profile Tests
  // ============================================================================

  describe('getPlansByProfile', () => {
    it('should return all plans for a profile', async () => {
      await service.createPlan({
        profileName: 'Profile1',
        name: 'Plan 1',
        description: 'Test 1',
      });

      await service.createPlan({
        profileName: 'Profile1',
        name: 'Plan 2',
        description: 'Test 2',
      });

      await service.createPlan({
        profileName: 'Profile2',
        name: 'Plan 3',
        description: 'Test 3',
      });

      const profile1Plans = await service.getPlansByProfile('Profile1');
      const profile2Plans = await service.getPlansByProfile('Profile2');

      expect(profile1Plans.length).toBe(2);
      expect(profile2Plans.length).toBe(1);
      expect(profile1Plans.every(p => p.profileName === 'Profile1')).toBe(true);
      expect(profile2Plans.every(p => p.profileName === 'Profile2')).toBe(true);
    });

    it('should return empty array for profile with no plans', async () => {
      const plans = await service.getPlansByProfile('NonExistentProfile');

      expect(plans).toEqual([]);
    });

    it('should load all plans from disk', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          profileName: 'Profile1',
          name: 'Plan 1',
          description: 'Test 1',
          waves: [],
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
        {
          id: 'plan2',
          profileName: 'Profile1',
          name: 'Plan 2',
          description: 'Test 2',
          waves: [],
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readdir.mockResolvedValue(['plan1.json', 'plan2.json']);
      mockFs.promises.readFile
        .mockResolvedValueOnce(JSON.stringify(mockPlans[0]))
        .mockResolvedValueOnce(JSON.stringify(mockPlans[1]));

      const plans = await service.getPlansByProfile('Profile1');

      expect(plans.length).toBe(2);
      expect(mockFs.promises.readdir).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Plan Deletion Tests
  // ============================================================================

  describe('deletePlan', () => {
    it('should delete plan from memory and disk', async () => {
      const plan = await service.createPlan({
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
      });

      // Mock existsSync to return true during deletion, then false after
      let deleteCallCount = 0;
      mockFs.existsSync.mockImplementation(() => {
        deleteCallCount++;
        // Return true for the delete operation, false for subsequent getPlan
        return deleteCallCount === 1;
      });

      await service.deletePlan(plan.id);

      const retrieved = await service.getPlan(plan.id);
      expect(retrieved).toBeNull();

      expect(mockFs.promises.unlink).toHaveBeenCalledWith(
        expect.stringContaining(`${plan.id}.json`)
      );
    });

    it('should handle deletion when file does not exist', async () => {
      const plan = await service.createPlan({
        profileName: 'TestProfile',
        name: 'Test Plan',
        description: 'Test',
      });

      mockFs.existsSync.mockReturnValue(false);

      await service.deletePlan(plan.id);

      expect(mockFs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should not throw error when deleting non-existent plan', async () => {
      await expect(service.deletePlan('non-existent-id')).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // Statistics Tests
  // ============================================================================

  describe('getStatistics', () => {
    it('should return statistics with no plans', () => {
      const stats = service.getStatistics();

      expect(stats).toEqual({
        totalPlans: 0,
        totalWaves: 0,
        wavesByStatus: {
          planned: 0,
          inprogress: 0,
          completed: 0,
          failed: 0,
        },
        totalUsersAssigned: 0,
      });
    });

    it('should calculate statistics correctly', async () => {
      const plan1 = await service.createPlan({
        profileName: 'Profile1',
        name: 'Plan 1',
        description: 'Test 1',
      });

      const wave1 = await service.addWave(plan1.id, {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      const wave2 = await service.addWave(plan1.id, {
        name: 'Wave 2',
        description: 'Second wave',
        startDate: '2025-01-16',
        endDate: '2025-01-31',
      });

      await service.assignUsersToWave(plan1.id, wave1.id, ['user1@test.com', 'user2@test.com']);
      await service.assignUsersToWave(plan1.id, wave2.id, ['user3@test.com']);
      await service.updateWaveStatus(plan1.id, wave1.id, 'completed');

      const stats = service.getStatistics();

      expect(stats).toEqual({
        totalPlans: 1,
        totalWaves: 2,
        wavesByStatus: {
          planned: 1,
          inprogress: 0,
          completed: 1,
          failed: 0,
        },
        totalUsersAssigned: 3,
      });
    });

    it('should count unique users across all waves', async () => {
      const plan = await service.createPlan({
        profileName: 'Profile1',
        name: 'Plan 1',
        description: 'Test',
      });

      const wave1 = await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'First wave',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      const wave2 = await service.addWave(plan.id, {
        name: 'Wave 2',
        description: 'Second wave',
        startDate: '2025-01-16',
        endDate: '2025-01-31',
      });

      // Same user in both waves
      await service.assignUsersToWave(plan.id, wave1.id, ['user1@test.com', 'user2@test.com']);
      await service.assignUsersToWave(plan.id, wave2.id, ['user2@test.com', 'user3@test.com']);

      const stats = service.getStatistics();

      // Should count unique users only
      expect(stats.totalUsersAssigned).toBe(3); // user1, user2, user3
    });

    it('should track waves by status correctly', async () => {
      const plan = await service.createPlan({
        profileName: 'Profile1',
        name: 'Plan 1',
        description: 'Test',
      });

      const wave1 = await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'Wave 1',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      const wave2 = await service.addWave(plan.id, {
        name: 'Wave 2',
        description: 'Wave 2',
        startDate: '2025-01-16',
        endDate: '2025-01-31',
      });

      const wave3 = await service.addWave(plan.id, {
        name: 'Wave 3',
        description: 'Wave 3',
        startDate: '2025-02-01',
        endDate: '2025-02-15',
      });

      await service.updateWaveStatus(plan.id, wave1.id, 'completed');
      await service.updateWaveStatus(plan.id, wave2.id, 'inprogress');
      // wave3 remains 'planned'

      const stats = service.getStatistics();

      expect(stats.wavesByStatus).toEqual({
        planned: 1,
        inprogress: 1,
        completed: 1,
        failed: 0,
      });
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle very long plan names', async () => {
      const longName = 'A'.repeat(500);

      const plan = await service.createPlan({
        profileName: 'Profile1',
        name: longName,
        description: 'Test',
      });

      expect(plan.name).toBe(longName);
    });

    it('should handle special characters in names', async () => {
      const plan = await service.createPlan({
        profileName: 'Profile!@#$%^&*()',
        name: 'Plan with <special> chars',
        description: 'Test with "quotes" and \'apostrophes\'',
      });

      expect(plan.profileName).toBe('Profile!@#$%^&*()');
      expect(plan.name).toBe('Plan with <special> chars');
    });

    it('should handle multiple plans with same name', async () => {
      const plan1 = await service.createPlan({
        profileName: 'Profile1',
        name: 'Test Plan',
        description: 'First',
      });

      const plan2 = await service.createPlan({
        profileName: 'Profile1',
        name: 'Test Plan',
        description: 'Second',
      });

      expect(plan1.id).not.toBe(plan2.id);
      expect(plan1.name).toBe(plan2.name);
    });

    it('should handle large number of waves in a plan', async () => {
      const plan = await service.createPlan({
        profileName: 'Profile1',
        name: 'Large Plan',
        description: 'Test',
      });

      const wavePromises = [];
      for (let i = 0; i < 100; i++) {
        wavePromises.push(
          service.addWave(plan.id, {
            name: `Wave ${i}`,
            description: `Wave ${i}`,
            startDate: '2025-01-01',
            endDate: '2025-01-15',
          })
        );
      }

      await Promise.all(wavePromises);

      const updatedPlan = await service.getPlan(plan.id);
      expect(updatedPlan?.waves.length).toBe(100);
    });

    it('should handle large number of users in a wave', async () => {
      const plan = await service.createPlan({
        profileName: 'Profile1',
        name: 'Test Plan',
        description: 'Test',
      });

      const wave = await service.addWave(plan.id, {
        name: 'Wave 1',
        description: 'Wave 1',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      const userIds = Array(1000).fill(null).map((_, i) => `user${i}@test.com`);
      await service.assignUsersToWave(plan.id, wave.id, userIds);

      const updatedPlan = await service.getPlan(plan.id);
      const updatedWave = updatedPlan?.waves.find(w => w.id === wave.id);

      expect(updatedWave?.users.length).toBe(1000);
    });
  });
});
