/**
 * Migration Orchestration Service
 *
 * Coordinates multi-wave migration execution with:
 * - Wave sequencing and dependency management
 * - Real-time progress tracking
 * - Conflict detection and resolution
 * - Rollback capabilities
 * - State persistence
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

interface MigrationWave {
  id: string;
  projectId: string;
  name: string;
  sequence: number;
  users: string[];
  resources: ResourceMapping[];
  dependencies: string[]; // IDs of waves that must complete first
  status: 'planned' | 'ready' | 'executing' | 'paused' | 'completed' | 'failed' | 'rolledback';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  errors: MigrationError[];
}

interface ResourceMapping {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId?: string;
  targetType?: string;
  status: 'pending' | 'mapped' | 'validated' | 'migrated' | 'error';
  conflicts: Conflict[];
}

interface Conflict {
  type: string;
  severity: 'warning' | 'error';
  message: string;
  resolution?: string;
}

interface MigrationError {
  timestamp: Date;
  resourceId: string;
  message: string;
  stack?: string;
}

interface RollbackPoint {
  id: string;
  waveId: string;
  timestamp: Date;
  state: any;
}

class MigrationOrchestrationService extends EventEmitter {
  private waves: Map<string, MigrationWave>;
  private rollbackPoints: Map<string, RollbackPoint>;
  private executionQueue: string[];
  private activeWave: string | null;
  private isPaused: boolean;
  private dataDir: string;

  constructor(dataDir?: string) {
    super();
    this.waves = new Map();
    this.rollbackPoints = new Map();
    this.executionQueue = [];
    this.activeWave = null;
    this.isPaused = false;
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'migrations');

    this.ensureDataDirectory();
    this.loadPersistedState();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const wavesPath = path.join(this.dataDir, 'waves.json');
      const rollbackPath = path.join(this.dataDir, 'rollback.json');

      const [wavesData, rollbackData] = await Promise.all([
        fs.readFile(wavesPath, 'utf-8').catch(() => '{}'),
        fs.readFile(rollbackPath, 'utf-8').catch(() => '{}'),
      ]);

      const waves = JSON.parse(wavesData);
      const rollbacks = JSON.parse(rollbackData);

      this.waves = new Map(Object.entries(waves));
      this.rollbackPoints = new Map(Object.entries(rollbacks));
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
  }

  private async persistState(): Promise<void> {
    try {
      const wavesPath = path.join(this.dataDir, 'waves.json');
      const rollbackPath = path.join(this.dataDir, 'rollback.json');

      await Promise.all([
        fs.writeFile(wavesPath, JSON.stringify(Object.fromEntries(this.waves)), 'utf-8'),
        fs.writeFile(rollbackPath, JSON.stringify(Object.fromEntries(this.rollbackPoints)), 'utf-8'),
      ]);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  /**
   * Plan a new migration wave
   */
  async planWave(wave: Omit<MigrationWave, 'id' | 'status' | 'progress' | 'errors'>): Promise<MigrationWave> {
    const id = crypto.randomUUID();

    const newWave: MigrationWave = {
      ...wave,
      id,
      status: 'planned',
      progress: 0,
      errors: [],
    };

    this.waves.set(id, newWave);
    await this.persistState();

    this.emit('wave:planned', newWave);
    return newWave;
  }

  /**
   * Update an existing wave
   */
  async updateWave(id: string, updates: Partial<MigrationWave>): Promise<MigrationWave | null> {
    const wave = this.waves.get(id);
    if (!wave) return null;

    const updated = { ...wave, ...updates };
    this.waves.set(id, updated);
    await this.persistState();

    this.emit('wave:updated', updated);
    return updated;
  }

  /**
   * Delete a wave
   */
  async deleteWave(id: string): Promise<boolean> {
    const wave = this.waves.get(id);
    if (!wave) return false;

    if (wave.status === 'executing') {
      throw new Error('Cannot delete wave that is currently executing');
    }

    this.waves.delete(id);
    await this.persistState();

    this.emit('wave:deleted', { id });
    return true;
  }

  /**
   * Validate all waves and check dependencies
   */
  async validateWaves(projectId: string): Promise<{ valid: boolean; errors: string[] }> {
    const projectWaves = Array.from(this.waves.values()).filter(w => w.projectId === projectId);
    const errors: string[] = [];

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (waveId: string): boolean => {
      visited.add(waveId);
      recursionStack.add(waveId);

      const wave = this.waves.get(waveId);
      if (!wave) return false;

      for (const depId of wave.dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) return true;
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }

      recursionStack.delete(waveId);
      return false;
    };

    for (const wave of projectWaves) {
      if (hasCycle(wave.id)) {
        errors.push(`Circular dependency detected in wave: ${wave.name}`);
      }

      // Check that all dependencies exist
      for (const depId of wave.dependencies) {
        if (!this.waves.has(depId)) {
          errors.push(`Wave "${wave.name}" depends on non-existent wave: ${depId}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Execute migration waves in sequence
   */
  async executeMigration(projectId: string): Promise<void> {
    const validation = await this.validateWaves(projectId);
    if (!validation.valid) {
      throw new Error(`Migration validation failed: ${validation.errors.join(', ')}`);
    }

    // Get waves sorted by sequence and dependencies
    const sortedWaves = this.topologicalSort(projectId);
    this.executionQueue = sortedWaves.map(w => w.id);

    this.emit('migration:started', { projectId, waveCount: sortedWaves.length });

    for (const wave of sortedWaves) {
      if (this.isPaused) {
        this.emit('migration:paused', { projectId });
        break;
      }

      await this.executeWave(wave.id);
    }

    this.emit('migration:completed', { projectId });
  }

  /**
   * Topological sort of waves based on dependencies
   */
  private topologicalSort(projectId: string): MigrationWave[] {
    const waves = Array.from(this.waves.values()).filter(w => w.projectId === projectId);
    const sorted: MigrationWave[] = [];
    const visited = new Set<string>();

    const visit = (wave: MigrationWave) => {
      if (visited.has(wave.id)) return;
      visited.add(wave.id);

      for (const depId of wave.dependencies) {
        const dep = this.waves.get(depId);
        if (dep) visit(dep);
      }

      sorted.push(wave);
    };

    waves.sort((a, b) => a.sequence - b.sequence);
    for (const wave of waves) {
      visit(wave);
    }

    return sorted;
  }

  /**
   * Execute a single wave
   */
  private async executeWave(waveId: string): Promise<void> {
    const wave = this.waves.get(waveId);
    if (!wave) throw new Error(`Wave not found: ${waveId}`);

    // Create rollback point
    await this.createRollbackPoint(waveId);

    this.activeWave = waveId;
    wave.status = 'executing';
    wave.startTime = new Date();
    wave.progress = 0;

    this.emit('wave:started', wave);

    try {
      // Process each user in the wave
      for (let i = 0; i < wave.users.length; i++) {
        if (this.isPaused) break;

        const userId = wave.users[i];
        await this.migrateUser(waveId, userId);

        wave.progress = Math.round(((i + 1) / wave.users.length) * 100);
        this.emit('wave:progress', { waveId, progress: wave.progress });
      }

      wave.status = 'completed';
      wave.endTime = new Date();
      wave.progress = 100;

      this.emit('wave:completed', wave);
    } catch (error: any) {
      wave.status = 'failed';
      wave.errors.push({
        timestamp: new Date(),
        resourceId: waveId,
        message: error.message,
        stack: error.stack,
      });

      this.emit('wave:failed', { wave, error });
      throw error;
    } finally {
      this.activeWave = null;
      await this.persistState();
    }
  }

  /**
   * Migrate a single user
   */
  private async migrateUser(waveId: string, userId: string): Promise<void> {
    // This would call PowerShell migration scripts
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
    this.emit('user:migrated', { waveId, userId });
  }

  /**
   * Pause migration execution
   */
  async pauseMigration(): Promise<void> {
    this.isPaused = true;
    this.emit('migration:paused');
  }

  /**
   * Resume migration execution
   */
  async resumeMigration(): Promise<void> {
    this.isPaused = false;
    this.emit('migration:resumed');

    // Continue with remaining waves
    if (this.executionQueue.length > 0) {
      const remainingWaves = this.executionQueue
        .map(id => this.waves.get(id))
        .filter((w): w is MigrationWave => w !== undefined && w.status !== 'completed');

      for (const wave of remainingWaves) {
        if (this.isPaused) break;
        await this.executeWave(wave.id);
      }
    }
  }

  /**
   * Create a rollback point before wave execution
   */
  async createRollbackPoint(waveId: string): Promise<RollbackPoint> {
    const wave = this.waves.get(waveId);
    if (!wave) throw new Error(`Wave not found: ${waveId}`);

    const rollbackPoint: RollbackPoint = {
      id: crypto.randomUUID(),
      waveId,
      timestamp: new Date(),
      state: {
        wave: JSON.parse(JSON.stringify(wave)),
        // Would include snapshots of all resources
      },
    };

    this.rollbackPoints.set(rollbackPoint.id, rollbackPoint);
    await this.persistState();

    return rollbackPoint;
  }

  /**
   * Rollback to a specific point
   */
  async rollbackMigration(rollbackPointId: string): Promise<void> {
    const rollbackPoint = this.rollbackPoints.get(rollbackPointId);
    if (!rollbackPoint) throw new Error(`Rollback point not found: ${rollbackPointId}`);

    const wave = this.waves.get(rollbackPoint.waveId);
    if (!wave) throw new Error(`Wave not found: ${rollbackPoint.waveId}`);

    this.emit('rollback:started', { rollbackPointId, waveId: wave.id });

    try {
      // Restore wave state
      this.waves.set(wave.id, rollbackPoint.state.wave);
      wave.status = 'rolledback';

      // Would call PowerShell rollback scripts here

      await this.persistState();
      this.emit('rollback:completed', { rollbackPointId, waveId: wave.id });
    } catch (error: any) {
      this.emit('rollback:failed', { rollbackPointId, error });
      throw error;
    }
  }

  /**
   * Get migration statistics
   */
  getStatistics(projectId?: string) {
    const waves = projectId
      ? Array.from(this.waves.values()).filter(w => w.projectId === projectId)
      : Array.from(this.waves.values());

    return {
      totalWaves: waves.length,
      completed: waves.filter(w => w.status === 'completed').length,
      failed: waves.filter(w => w.status === 'failed').length,
      inProgress: waves.filter(w => w.status === 'executing').length,
      planned: waves.filter(w => w.status === 'planned').length,
      totalUsers: waves.reduce((sum, w) => sum + w.users.length, 0),
      activeWave: this.activeWave,
      isPaused: this.isPaused,
    };
  }
}

export default MigrationOrchestrationService;


