/**
 * Migration Orchestration Service Tests
 *
 * Tests the migration orchestration service that coordinates multi-wave migrations.
 */

import * as path from 'path';

import MigrationOrchestrationService from './migrationOrchestrationService';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
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

describe('MigrationOrchestrationService', () => {
  let service: MigrationOrchestrationService;
  const testDataDir = path.join(process.cwd(), 'test-data', 'orchestration');
  const mockFs = require('fs/promises');

  beforeEach(async () => {
    jest.clearAllMocks();
    uuidCounter = 0;

    // Setup default mock responses
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockRejectedValue(new Error('File not found'));

    // Create service instance
    service = new MigrationOrchestrationService(testDataDir);

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    service.removeAllListeners();
  });

  // ============================================
  // Initialization Tests
  // ============================================

  describe('Initialization', () => {
    it('should create data directory on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
    });

    it('should attempt to load persisted state on initialization', () => {
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'waves.json'),
        'utf-8'
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'rollback.json'),
        'utf-8'
      );
    });

    it('should handle missing persisted state gracefully', () => {
      // Service should initialize successfully even when no persisted data exists
      expect(service).toBeDefined();
    });
  });

  // ============================================
  // Wave Planning Tests
  // ============================================

  describe('Wave Planning', () => {
    it('should plan a new wave', async () => {
      const events: any[] = [];
      service.on('wave:planned', data => events.push({ event: 'planned', data }));

      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com', 'user2@test.com'],
        resources: [],
        dependencies: [],
      });

      expect(wave).toBeDefined();
      expect(wave.id).toBeDefined();
      expect(typeof wave.id).toBe('string');
      expect(wave.name).toBe('Wave 1');
      expect(wave.status).toBe('planned');
      expect(wave.progress).toBe(0);
      expect(wave.errors).toEqual([]);
      expect(events.length).toBe(1);
      expect(events[0].data.name).toBe('Wave 1');
    });

    it('should persist wave after planning', async () => {
      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'waves.json'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should handle waves with dependencies', async () => {
      const wave1 = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      const wave2 = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 2',
        sequence: 2,
        users: ['user2@test.com'],
        resources: [],
        dependencies: [wave1.id],
      });

      expect(wave2.dependencies).toContain(wave1.id);
    });
  });

  // ============================================
  // Wave Update Tests
  // ============================================

  describe('Wave Updates', () => {
    it('should update an existing wave', async () => {
      const events: any[] = [];
      service.on('wave:updated', data => events.push({ event: 'updated', data }));

      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      const updated = await service.updateWave(wave.id, { name: 'Wave 1 - Updated' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Wave 1 - Updated');
      expect(events.length).toBe(1);
      expect(events[0].data.name).toBe('Wave 1 - Updated');
    });

    it('should return null for non-existent wave', async () => {
      const result = await service.updateWave('non-existent-id', { name: 'Updated' });

      expect(result).toBeNull();
    });

    it('should persist state after update', async () => {
      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      mockFs.writeFile.mockClear();

      await service.updateWave(wave.id, { name: 'Updated' });

      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  // ============================================
  // Wave Deletion Tests
  // ============================================

  describe('Wave Deletion', () => {
    it('should delete a wave', async () => {
      const events: any[] = [];
      service.on('wave:deleted', data => events.push({ event: 'deleted', data }));

      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      const result = await service.deleteWave(wave.id);

      expect(result).toBe(true);
      expect(events.length).toBe(1);
      expect(events[0].data.id).toBe(wave.id);
    });

    it('should not delete executing wave', async () => {
      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      await service.updateWave(wave.id, { status: 'executing' as any });

      await expect(service.deleteWave(wave.id)).rejects.toThrow(
        'Cannot delete wave that is currently executing'
      );
    });

    it('should return false for non-existent wave', async () => {
      const result = await service.deleteWave('non-existent-id');

      expect(result).toBe(false);
    });
  });

  // ============================================
  // Wave Validation Tests
  // ============================================

  describe('Wave Validation', () => {
    it('should validate waves successfully when no issues', async () => {
      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      const validation = await service.validateWaves('project-1');

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect circular dependencies', async () => {
      const wave1 = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      const wave2 = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 2',
        sequence: 2,
        users: ['user2@test.com'],
        resources: [],
        dependencies: [wave1.id],
      });

      // Manually create circular dependency
      await service.updateWave(wave1.id, { dependencies: [wave2.id] });

      const validation = await service.validateWaves('project-1');

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      // Check for dependency-related error (may use 'circular', 'cycle', or 'dependency' in message)
      expect(validation.errors.some(e =>
        e.toLowerCase().includes('circular') ||
        e.toLowerCase().includes('cycle') ||
        e.toLowerCase().includes('dependency')
      )).toBe(true);
    });

    it('should detect non-existent dependencies', async () => {
      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: ['non-existent-wave-id'],
      });

      const validation = await service.validateWaves('project-1');

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('non-existent'))).toBe(true);
    });
  });

  // ============================================
  // Migration Execution Tests
  // ============================================

  describe('Migration Execution', () => {
    it('should execute migration for project', async () => {
      const events: any[] = [];
      service.on('migration:started', data => events.push({ event: 'started', data }));
      service.on('wave:started', data => events.push({ event: 'wave-started', data }));
      service.on('wave:completed', data => events.push({ event: 'wave-completed', data }));
      service.on('migration:completed', data => events.push({ event: 'completed', data }));

      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      await service.executeMigration('project-1');

      expect(events.some(e => e.event === 'started')).toBe(true);
      expect(events.some(e => e.event === 'wave-started')).toBe(true);
      expect(events.some(e => e.event === 'wave-completed')).toBe(true);
      expect(events.some(e => e.event === 'completed')).toBe(true);
    }, 30000);

    it('should fail when validation fails', async () => {
      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: ['non-existent'],
      });

      await expect(service.executeMigration('project-1')).rejects.toThrow('validation failed');
    });

    it('should execute waves in correct order based on dependencies', async () => {
      const wave1 = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 2',
        sequence: 2,
        users: ['user2@test.com'],
        resources: [],
        dependencies: [wave1.id],
      });

      const events: any[] = [];
      service.on('wave:started', data => events.push({ wave: data.name }));

      await service.executeMigration('project-1');

      expect(events.length).toBe(2);
      expect(events[0].wave).toBe('Wave 1');
      expect(events[1].wave).toBe('Wave 2');
    }, 30000);
  });

  // ============================================
  // Pause/Resume Tests
  // ============================================

  describe('Pause and Resume', () => {
    it('should pause migration', async () => {
      const events: any[] = [];
      service.on('migration:paused', () => events.push({ event: 'paused' }));

      await service.pauseMigration();

      expect(events.length).toBe(1);
    });

    it('should resume migration', async () => {
      const events: any[] = [];
      service.on('migration:resumed', () => events.push({ event: 'resumed' }));

      await service.resumeMigration();

      expect(events.length).toBe(1);
    });
  });

  // ============================================
  // Rollback Tests
  // ============================================

  describe('Rollback', () => {
    it('should create rollback point', async () => {
      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      const rollbackPoint = await service.createRollbackPoint(wave.id);

      expect(rollbackPoint).toBeDefined();
      expect(rollbackPoint.waveId).toBe(wave.id);
      expect(rollbackPoint.state).toBeDefined();
    });

    it('should fail to create rollback point for non-existent wave', async () => {
      await expect(service.createRollbackPoint('non-existent')).rejects.toThrow('not found');
    });

    it('should rollback migration', async () => {
      const events: any[] = [];
      service.on('rollback:started', data => events.push({ event: 'started', data }));
      service.on('rollback:completed', data => events.push({ event: 'completed', data }));

      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      const rollbackPoint = await service.createRollbackPoint(wave.id);

      await service.rollbackMigration(rollbackPoint.id);

      expect(events.some(e => e.event === 'started')).toBe(true);
      expect(events.some(e => e.event === 'completed')).toBe(true);
    });

    it('should fail rollback for non-existent rollback point', async () => {
      await expect(service.rollbackMigration('non-existent')).rejects.toThrow('not found');
    });
  });

  // ============================================
  // Statistics Tests
  // ============================================

  describe('Statistics', () => {
    it('should return statistics for project', async () => {
      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com', 'user2@test.com'],
        resources: [],
        dependencies: [],
      });

      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 2',
        sequence: 2,
        users: ['user3@test.com'],
        resources: [],
        dependencies: [],
      });

      const stats = service.getStatistics('project-1');

      expect(stats.totalWaves).toBe(2);
      expect(stats.totalUsers).toBe(3);
      expect(stats.planned).toBe(2);
      expect(stats.completed).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.inProgress).toBe(0);
    });

    it('should return all statistics when no project specified', async () => {
      await service.planWave({
        projectId: 'project-1',
        name: 'Wave 1',
        sequence: 1,
        users: ['user1@test.com'],
        resources: [],
        dependencies: [],
      });

      await service.planWave({
        projectId: 'project-2',
        name: 'Wave 2',
        sequence: 1,
        users: ['user2@test.com'],
        resources: [],
        dependencies: [],
      });

      const stats = service.getStatistics();

      expect(stats.totalWaves).toBe(2);
      expect(stats.totalUsers).toBe(2);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle large number of waves', async () => {
      for (let i = 0; i < 100; i++) {
        await service.planWave({
          projectId: 'project-1',
          name: `Wave ${i + 1}`,
          sequence: i + 1,
          users: [`user${i + 1}@test.com`],
          resources: [],
          dependencies: [],
        });
      }

      const stats = service.getStatistics('project-1');

      expect(stats.totalWaves).toBe(100);
      expect(stats.totalUsers).toBe(100);
    });

    it('should handle wave with special characters in name', async () => {
      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Wave with "quotes" and \'apostrophes\' & special chars!',
        sequence: 1,
        users: ['user@test.com'],
        resources: [],
        dependencies: [],
      });

      expect(wave.name).toBe('Wave with "quotes" and \'apostrophes\' & special chars!');
    });

    it('should handle empty user list', async () => {
      const wave = await service.planWave({
        projectId: 'project-1',
        name: 'Empty Wave',
        sequence: 1,
        users: [],
        resources: [],
        dependencies: [],
      });

      expect(wave.users).toEqual([]);
    });
  });
});

