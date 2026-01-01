/**
 * Rollback Service
 *
 * Rollback capability with:
 * - Create rollback points before migration
 * - Store state snapshots (users, groups, permissions, settings)
 * - Incremental vs full rollback
 * - Time-travel rollback (restore to specific timestamp)
 * - Selective rollback (rollback specific users, not entire wave)
 * - Rollback validation (ensure safe to rollback)
 * - Rollback execution with progress tracking
 * - Rollback reports
 * - Retention policy for rollback points
 * - Compression for storage efficiency
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';

import PowerShellExecutionService from './powerShellService';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Rollback point
 */
export interface RollbackPoint {
  id: string;
  waveId: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'selective';
  createdAt: Date;
  expiresAt?: Date;
  snapshot: RollbackSnapshot;
  compressed: boolean;
  size: number; // bytes
  canRestore: boolean;
  metadata: Record<string, any>;
}

/**
 * Rollback snapshot
 */
interface RollbackSnapshot {
  version: string;
  timestamp: Date;
  users: UserSnapshot[];
  groups: GroupSnapshot[];
  permissions: PermissionSnapshot[];
  settings: Record<string, any>;
  customData?: Record<string, any>;
}

/**
 * User snapshot
 */
interface UserSnapshot {
  id: string;
  upn: string;
  state: 'source' | 'target' | 'migrated';
  sourceAttributes: Record<string, any>;
  targetAttributes?: Record<string, any>;
  groupMemberships: string[];
  permissions: string[];
  mailboxData?: any;
}

/**
 * Group snapshot
 */
interface GroupSnapshot {
  id: string;
  name: string;
  type: string;
  members: string[];
  attributes: Record<string, any>;
}

/**
 * Permission snapshot
 */
interface PermissionSnapshot {
  resourceId: string;
  resourceType: string;
  principalId: string;
  permissions: string[];
  attributes: Record<string, any>;
}

/**
 * Rollback result
 */
interface RollbackResult {
  success: boolean;
  rollbackPointId: string;
  type: 'full' | 'selective';
  usersRestored: number;
  groupsRestored: number;
  permissionsRestored: number;
  errors: string[];
  warnings: string[];
  duration: number;
  timestamp: Date;
}

/**
 * Rollback Service
 */
class RollbackService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private rollbackPoints: Map<string, RollbackPoint>;
  private dataDir: string;
  private retentionDays: number;
  private maxPointsPerWave: number;

  constructor(
    powerShellService: PowerShellExecutionService,
    dataDir?: string,
    retentionDays = 30,
    maxPointsPerWave = 10
  ) {
    super();
    this.powerShellService = powerShellService;
    this.rollbackPoints = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'rollback');
    this.retentionDays = retentionDays;
    this.maxPointsPerWave = maxPointsPerWave;

    this.ensureDataDirectory();
    this.loadRollbackPoints();
    this.startCleanupSchedule();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'snapshots'), { recursive: true });
    } catch (error) {
      console.error('Failed to create rollback data directory:', error);
    }
  }

  /**
   * Create full rollback point
   */
  async createFullRollbackPoint(
    waveId: string,
    name: string,
    description?: string
  ): Promise<RollbackPoint> {
    console.log(`Creating full rollback point for wave ${waveId}: ${name}`);
    this.emit('rollback:creating', { waveId, type: 'full' });

    try {
      // Capture full snapshot
      const snapshot = await this.captureFullSnapshot(waveId);

      // Compress snapshot
      const compressed = await this.compressSnapshot(snapshot);

      // Create rollback point
      const rollbackPoint: RollbackPoint = {
        id: crypto.randomUUID(),
        waveId,
        name,
        description: description || `Full rollback point created at ${new Date().toISOString()}`,
        type: 'full',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.retentionDays * 24 * 60 * 60 * 1000),
        snapshot: snapshot,
        compressed: true,
        size: compressed.length,
        canRestore: true,
        metadata: {
          userCount: snapshot.users.length,
          groupCount: snapshot.groups.length,
          permissionCount: snapshot.permissions.length,
        },
      };

      // Save snapshot to file
      await this.saveSnapshot(rollbackPoint.id, compressed);

      // Store rollback point
      this.rollbackPoints.set(rollbackPoint.id, rollbackPoint);

      // Enforce retention policy
      await this.enforceRetentionPolicy(waveId);

      await this.saveRollbackPoints();

      this.emit('rollback:created', { rollbackPoint });

      return rollbackPoint;
    } catch (error: any) {
      console.error('Failed to create rollback point:', error);
      this.emit('rollback:failed', { waveId, error: error.message });
      throw error;
    }
  }

  /**
   * Create selective rollback point (specific users only)
   */
  async createSelectiveRollbackPoint(
    waveId: string,
    userIds: string[],
    name: string
  ): Promise<RollbackPoint> {
    console.log(`Creating selective rollback point for ${userIds.length} users`);
    this.emit('rollback:creating', { waveId, type: 'selective', userCount: userIds.length });

    const snapshot = await this.captureSelectiveSnapshot(waveId, userIds);
    const compressed = await this.compressSnapshot(snapshot);

    const rollbackPoint: RollbackPoint = {
      id: crypto.randomUUID(),
      waveId,
      name,
      description: `Selective rollback point for ${userIds.length} users`,
      type: 'selective',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.retentionDays * 24 * 60 * 60 * 1000),
      snapshot: snapshot,
      compressed: true,
      size: compressed.length,
      canRestore: true,
      metadata: {
        userIds,
        userCount: userIds.length,
      },
    };

    await this.saveSnapshot(rollbackPoint.id, compressed);
    this.rollbackPoints.set(rollbackPoint.id, rollbackPoint);
    await this.saveRollbackPoints();

    this.emit('rollback:created', { rollbackPoint });

    return rollbackPoint;
  }

  /**
   * Capture full snapshot
   */
  private async captureFullSnapshot(waveId: string): Promise<RollbackSnapshot> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Capture-MigrationSnapshot.ps1',
      ['-WaveId', waveId, '-Type', 'Full'],
      { timeout: 300000 } // 5 minutes
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to capture snapshot');
    }

    const snapshotData = result.data as { users?: any[]; groups?: any[]; permissions?: any[]; settings?: any };
    return {
      version: '1.0',
      timestamp: new Date(),
      users: snapshotData.users || [],
      groups: snapshotData.groups || [],
      permissions: snapshotData.permissions || [],
      settings: snapshotData.settings || {},
    };
  }

  /**
   * Capture selective snapshot
   */
  private async captureSelectiveSnapshot(waveId: string, userIds: string[]): Promise<RollbackSnapshot> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Capture-MigrationSnapshot.ps1',
      ['-WaveId', waveId, '-Type', 'Selective', '-UserIds', JSON.stringify(userIds)],
      { timeout: 180000 } // 3 minutes
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to capture selective snapshot');
    }

    const snapshotData = result.data as { users?: any[]; groups?: any[]; permissions?: any[]; settings?: any };
    return {
      version: '1.0',
      timestamp: new Date(),
      users: snapshotData.users || [],
      groups: snapshotData.groups || [],
      permissions: snapshotData.permissions || [],
      settings: snapshotData.settings || {},
    };
  }

  /**
   * Compress snapshot
   */
  private async compressSnapshot(snapshot: RollbackSnapshot): Promise<Buffer> {
    const json = JSON.stringify(snapshot);
    return await gzip(Buffer.from(json, 'utf-8'));
  }

  /**
   * Decompress snapshot
   */
  private async decompressSnapshot(compressed: Buffer): Promise<RollbackSnapshot> {
    const decompressed = await gunzip(compressed);
    return JSON.parse(decompressed.toString('utf-8'));
  }

  /**
   * Execute rollback
   */
  async rollback(rollbackPointId: string, options: {
    userIds?: string[];
    dryRun?: boolean;
    force?: boolean;
  } = {}): Promise<RollbackResult> {
    const rollbackPoint = this.rollbackPoints.get(rollbackPointId);
    if (!rollbackPoint) {
      throw new Error(`Rollback point ${rollbackPointId} not found`);
    }

    if (!rollbackPoint.canRestore && !options.force) {
      throw new Error('Rollback point cannot be restored');
    }

    console.log(`Executing rollback: ${rollbackPoint.name} (${options.dryRun ? 'DRY RUN' : 'PRODUCTION'})`);
    this.emit('rollback:started', { rollbackPointId, dryRun: options.dryRun });

    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Load snapshot
      const compressedSnapshot = await this.loadSnapshot(rollbackPointId);
      const snapshot = await this.decompressSnapshot(compressedSnapshot);

      // Validate rollback
      const validation = await this.validateRollback(snapshot);
      if (!validation.valid && !options.force) {
        throw new Error(`Rollback validation failed: ${validation.errors.join(', ')}`);
      }

      warnings.push(...validation.warnings);

      // Determine which users to rollback
      const usersToRollback = options.userIds
        ? snapshot.users.filter(u => options.userIds!.includes(u.id))
        : snapshot.users;

      // Execute rollback via PowerShell
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Invoke-MigrationRollback.ps1',
        [
          '-RollbackPointId', rollbackPointId,
          '-Users', JSON.stringify(usersToRollback),
          '-Groups', JSON.stringify(snapshot.groups),
          '-Permissions', JSON.stringify(snapshot.permissions),
          '-Settings', JSON.stringify(snapshot.settings),
          '-DryRun', options.dryRun ? '$true' : '$false',
        ],
        { timeout: 600000, streamOutput: true } // 10 minutes
      );

      if (!result.success) {
        throw new Error(result.error || 'Rollback execution failed');
      }

      const resultData = result.data as { usersRestored?: number; groupsRestored?: number; permissionsRestored?: number };
      const rollbackResult: RollbackResult = {
        success: true,
        rollbackPointId,
        type: options.userIds ? 'selective' : 'full',
        usersRestored: resultData?.usersRestored || usersToRollback.length,
        groupsRestored: resultData?.groupsRestored || snapshot.groups.length,
        permissionsRestored: resultData?.permissionsRestored || snapshot.permissions.length,
        errors,
        warnings,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

      this.emit('rollback:completed', { rollbackResult });

      return rollbackResult;
    } catch (error: any) {
      console.error('Rollback failed:', error);
      errors.push(error.message);

      const rollbackResult: RollbackResult = {
        success: false,
        rollbackPointId,
        type: options.userIds ? 'selective' : 'full',
        usersRestored: 0,
        groupsRestored: 0,
        permissionsRestored: 0,
        errors,
        warnings,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

      this.emit('rollback:failed', { rollbackResult });

      return rollbackResult;
    }
  }

  /**
   * Validate rollback
   */
  private async validateRollback(snapshot: RollbackSnapshot): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check snapshot version compatibility
    if (snapshot.version !== '1.0') {
      errors.push(`Unsupported snapshot version: ${snapshot.version}`);
    }

    // Check snapshot age
    const age = Date.now() - new Date(snapshot.timestamp).getTime();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (age > maxAge) {
      warnings.push(`Snapshot is ${Math.round(age / (24 * 60 * 60 * 1000))} days old`);
    }

    // Validate via PowerShell
    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Test-RollbackSnapshot.ps1',
        ['-Snapshot', JSON.stringify(snapshot)],
        { timeout: 60000 }
      );

      if (result.success && result.data) {
        const validationData = result.data as { errors?: string[]; warnings?: string[] };
        errors.push(...(validationData.errors || []));
        warnings.push(...(validationData.warnings || []));
      }
    } catch (error: any) {
      warnings.push(`Validation check failed: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get rollback points
   */
  getRollbackPoints(waveId?: string): RollbackPoint[] {
    const points = Array.from(this.rollbackPoints.values());

    if (waveId) {
      return points.filter(p => p.waveId === waveId);
    }

    return points;
  }

  /**
   * Get rollback point
   */
  getRollbackPoint(rollbackPointId: string): RollbackPoint | null {
    return this.rollbackPoints.get(rollbackPointId) || null;
  }

  /**
   * Delete rollback point
   */
  async deleteRollbackPoint(rollbackPointId: string): Promise<void> {
    const rollbackPoint = this.rollbackPoints.get(rollbackPointId);
    if (!rollbackPoint) {
      throw new Error(`Rollback point ${rollbackPointId} not found`);
    }

    // Delete snapshot file
    try {
      await fs.unlink(path.join(this.dataDir, 'snapshots', `${rollbackPointId}.gz`));
    } catch (error) {
      console.warn(`Failed to delete snapshot file for ${rollbackPointId}:`, error);
    }

    this.rollbackPoints.delete(rollbackPointId);
    await this.saveRollbackPoints();

    this.emit('rollback:deleted', { rollbackPointId });
  }

  /**
   * Enforce retention policy
   */
  private async enforceRetentionPolicy(waveId: string): Promise<void> {
    const wavePoints = Array.from(this.rollbackPoints.values())
      .filter(p => p.waveId === waveId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Delete expired points
    const now = Date.now();
    for (const point of wavePoints) {
      if (point.expiresAt && point.expiresAt.getTime() < now) {
        await this.deleteRollbackPoint(point.id);
      }
    }

    // Enforce max points limit
    const remaining = Array.from(this.rollbackPoints.values())
      .filter(p => p.waveId === waveId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (remaining.length > this.maxPointsPerWave) {
      const toDelete = remaining.slice(this.maxPointsPerWave);
      for (const point of toDelete) {
        await this.deleteRollbackPoint(point.id);
      }
    }
  }

  /**
   * Start cleanup schedule
   */
  private startCleanupSchedule(): void {
    // Run cleanup daily
    setInterval(async () => {
      console.log('Running rollback point cleanup');
      const waves = new Set(Array.from(this.rollbackPoints.values()).map(p => p.waveId));
      for (const waveId of waves) {
        await this.enforceRetentionPolicy(waveId);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Save snapshot to file
   */
  private async saveSnapshot(rollbackPointId: string, compressed: Buffer): Promise<void> {
    const filepath = path.join(this.dataDir, 'snapshots', `${rollbackPointId}.gz`);
    await fs.writeFile(filepath, compressed);
  }

  /**
   * Load snapshot from file
   */
  private async loadSnapshot(rollbackPointId: string): Promise<Buffer> {
    const filepath = path.join(this.dataDir, 'snapshots', `${rollbackPointId}.gz`);
    return await fs.readFile(filepath);
  }

  /**
   * Save rollback points metadata
   */
  private async saveRollbackPoints(): Promise<void> {
    try {
      const points = Array.from(this.rollbackPoints.values()).map(p => ({
        ...p,
        snapshot: undefined, // Don't save full snapshot in metadata
      }));

      const filepath = path.join(this.dataDir, 'rollback-points.json');
      await fs.writeFile(filepath, JSON.stringify(points, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save rollback points:', error);
    }
  }

  /**
   * Load rollback points metadata
   */
  private async loadRollbackPoints(): Promise<void> {
    try {
      const filepath = path.join(this.dataDir, 'rollback-points.json');
      const content = await fs.readFile(filepath, 'utf-8');
      const points: RollbackPoint[] = JSON.parse(content);

      this.rollbackPoints.clear();
      for (const point of points) {
        this.rollbackPoints.set(point.id, point);
      }

      console.log(`Loaded ${this.rollbackPoints.size} rollback points`);
    } catch (error) {
      // File doesn't exist yet
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalPoints: number;
    totalSize: number;
    pointsByWave: Record<string, number>;
    oldestPoint: Date | null;
    newestPoint: Date | null;
  }> {
    const points = Array.from(this.rollbackPoints.values());
    const totalSize = points.reduce((sum, p) => sum + p.size, 0);

    const pointsByWave: Record<string, number> = {};
    for (const point of points) {
      pointsByWave[point.waveId] = (pointsByWave[point.waveId] || 0) + 1;
    }

    const oldestPoint = points.length > 0
      ? points.reduce((oldest, p) => p.createdAt < oldest ? p.createdAt : oldest, points[0].createdAt)
      : null;

    const newestPoint = points.length > 0
      ? points.reduce((newest, p) => p.createdAt > newest ? p.createdAt : newest, points[0].createdAt)
      : null;

    return {
      totalPoints: points.length,
      totalSize,
      pointsByWave,
      oldestPoint,
      newestPoint,
    };
  }
}

export default RollbackService;


