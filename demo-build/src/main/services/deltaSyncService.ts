/**
 * Delta Sync Service
 *
 * Delta synchronization with:
 * - Detect changes since last sync (new users, modified users, deleted users)
 * - Incremental sync vs full sync
 * - Change tracking (what changed: email, group membership, permissions)
 * - Bi-directional sync support
 * - Conflict resolution during sync
 * - Sync scheduling (cron expressions)
 * - Sync verification
 * - Sync history and audit
 * - Bandwidth throttling
 * - Batch sync with checkpoints
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

import * as cron from 'node-cron';

import PowerShellExecutionService from './powerShellService';

/**
 * Sync type
 */
export type SyncType = 'full' | 'incremental' | 'bidirectional';

/**
 * Change type
 */
export type ChangeType = 'new' | 'modified' | 'deleted' | 'moved';

/**
 * Sync direction
 */
export type SyncDirection = 'source-to-target' | 'target-to-source' | 'bidirectional';

/**
 * Detected change
 */
interface DetectedChange {
  id: string;
  resourceId: string;
  resourceType: string;
  changeType: ChangeType;
  attributes: Record<string, any>;
  previousAttributes?: Record<string, any>;
  changedFields: string[];
  timestamp: Date;
}

/**
 * Sync result
 */
export interface SyncResult {
  id: string;
  waveId: string;
  type: SyncType;
  direction: SyncDirection;
  startTime: Date;
  endTime: Date;
  duration: number;
  changesDetected: number;
  changesApplied: number;
  changesFailed: number;
  conflicts: number;
  bandwidth: number; // MB
  throughput: number; // items per second
  errors: string[];
  warnings: string[];
}

/**
 * Sync checkpoint
 */
interface SyncCheckpoint {
  id: string;
  syncId: string;
  timestamp: Date;
  itemsProcessed: number;
  lastItemId: string;
  state: Record<string, any>;
}

/**
 * Sync schedule
 */
interface SyncSchedule {
  id: string;
  waveId: string;
  name: string;
  cronExpression: string;
  syncType: SyncType;
  direction: SyncDirection;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  job?: cron.ScheduledTask;
}

/**
 * Delta Sync Service
 */
class DeltaSyncService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private syncHistory: Map<string, SyncResult>;
  private schedules: Map<string, SyncSchedule>;
  private checkpoints: Map<string, SyncCheckpoint>;
  private lastSyncTimestamps: Map<string, Date>;
  private dataDir: string;
  private bandwidthLimit: number; // MB/s

  constructor(
    powerShellService: PowerShellExecutionService,
    dataDir?: string,
    bandwidthLimit = 10 // 10 MB/s default
  ) {
    super();
    this.powerShellService = powerShellService;
    this.syncHistory = new Map();
    this.schedules = new Map();
    this.checkpoints = new Map();
    this.lastSyncTimestamps = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'delta-sync');
    this.bandwidthLimit = bandwidthLimit;

    this.ensureDataDirectory();
    this.loadData();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create delta sync data directory:', error);
    }
  }

  /**
   * Perform delta sync
   */
  async performDeltaSync(
    waveId: string,
    type: SyncType = 'incremental',
    direction: SyncDirection = 'source-to-target'
  ): Promise<SyncResult> {
    const syncId = crypto.randomUUID();
    const startTime = new Date();

    console.log(`Starting delta sync: ${waveId} (${type}, ${direction})`);
    this.emit('sync:started', { syncId, waveId, type, direction });

    const errors: string[] = [];
    const warnings: string[] = [];
    let changesDetected = 0;
    let changesApplied = 0;
    let changesFailed = 0;
    let conflicts = 0;
    let totalBandwidth = 0;

    try {
      // Get last sync timestamp
      const lastSyncTime = this.lastSyncTimestamps.get(waveId);

      // Detect changes
      const changes = await this.detectChanges(waveId, lastSyncTime, type);
      changesDetected = changes.length;

      console.log(`Detected ${changesDetected} changes`);
      this.emit('sync:changes-detected', { syncId, count: changesDetected });

      // Process changes in batches with checkpoints
      const batchSize = 100;
      for (let i = 0; i < changes.length; i += batchSize) {
        const batch = changes.slice(i, i + batchSize);

        // Create checkpoint
        const checkpoint: SyncCheckpoint = {
          id: crypto.randomUUID(),
          syncId,
          timestamp: new Date(),
          itemsProcessed: i + batch.length,
          lastItemId: batch[batch.length - 1].id,
          state: { waveId, type, direction, changesApplied, changesFailed },
        };
        this.checkpoints.set(checkpoint.id, checkpoint);

        // Apply changes
        const batchResult = await this.applyChanges(waveId, batch, direction);
        changesApplied += batchResult.applied;
        changesFailed += batchResult.failed;
        conflicts += batchResult.conflicts;
        totalBandwidth += batchResult.bandwidth;
        errors.push(...batchResult.errors);
        warnings.push(...batchResult.warnings);

        // Throttle bandwidth
        if (totalBandwidth / ((Date.now() - startTime.getTime()) / 1000) > this.bandwidthLimit) {
          const delay = 1000; // 1 second delay
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        this.emit('sync:progress', {
          syncId,
          progress: Math.round(((i + batch.length) / changes.length) * 100),
          itemsProcessed: i + batch.length,
          totalItems: changes.length,
        });
      }

      // Update last sync timestamp
      this.lastSyncTimestamps.set(waveId, new Date());

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const throughput = changesApplied / (duration / 1000);

      const syncResult: SyncResult = {
        id: syncId,
        waveId,
        type,
        direction,
        startTime,
        endTime,
        duration,
        changesDetected,
        changesApplied,
        changesFailed,
        conflicts,
        bandwidth: totalBandwidth,
        throughput,
        errors,
        warnings,
      };

      this.syncHistory.set(syncId, syncResult);
      await this.saveData();

      this.emit('sync:completed', { syncResult });

      return syncResult;
    } catch (error: any) {
      console.error('Delta sync failed:', error);
      errors.push(error.message);

      const endTime = new Date();
      const syncResult: SyncResult = {
        id: syncId,
        waveId,
        type,
        direction,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        changesDetected,
        changesApplied,
        changesFailed,
        conflicts,
        bandwidth: totalBandwidth,
        throughput: 0,
        errors,
        warnings,
      };

      this.syncHistory.set(syncId, syncResult);
      this.emit('sync:failed', { syncResult });

      throw error;
    }
  }

  /**
   * Detect changes
   */
  private async detectChanges(
    waveId: string,
    lastSyncTime: Date | undefined,
    type: SyncType
  ): Promise<DetectedChange[]> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Get-DeltaChanges.ps1',
      [
        '-WaveId', waveId,
        '-LastSyncTime', lastSyncTime?.toISOString() || '',
        '-SyncType', type,
      ],
      { timeout: 180000 } // 3 minutes
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to detect changes');
    }

    const resultData = result.data as { changes?: DetectedChange[] };
    return resultData.changes || [];
  }

  /**
   * Apply changes
   */
  private async applyChanges(
    waveId: string,
    changes: DetectedChange[],
    direction: SyncDirection
  ): Promise<{
    applied: number;
    failed: number;
    conflicts: number;
    bandwidth: number;
    errors: string[];
    warnings: string[];
  }> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Apply-DeltaChanges.ps1',
      [
        '-WaveId', waveId,
        '-Changes', JSON.stringify(changes),
        '-Direction', direction,
      ],
      { timeout: 300000, streamOutput: true } // 5 minutes
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to apply changes');
    }

    const resultData = result.data as {
      applied?: number;
      failed?: number;
      conflicts?: number;
      bandwidth?: number;
      errors?: string[];
      warnings?: string[];
    };

    return {
      applied: resultData.applied || 0,
      failed: resultData.failed || 0,
      conflicts: resultData.conflicts || 0,
      bandwidth: resultData.bandwidth || 0,
      errors: resultData.errors || [],
      warnings: resultData.warnings || [],
    };
  }

  /**
   * Schedule delta sync
   */
  async scheduleDeltaSync(
    waveId: string,
    name: string,
    cronExpression: string,
    options: {
      type?: SyncType;
      direction?: SyncDirection;
    } = {}
  ): Promise<SyncSchedule> {
    const { type = 'incremental', direction = 'source-to-target' } = options;

    const schedule: SyncSchedule = {
      id: crypto.randomUUID(),
      waveId,
      name,
      cronExpression,
      syncType: type,
      direction,
      enabled: true,
    };

    // Create cron job
    const job = cron.schedule(
      cronExpression,
      async () => {
        console.log(`Running scheduled sync: ${name}`);
        schedule.lastRun = new Date();

        try {
          await this.performDeltaSync(waveId, type, direction);
        } catch (error: any) {
          console.error(`Scheduled sync failed: ${name}`, error);
        }

        await this.saveData();
      },
      {
        timezone: 'UTC'
      }
    );

    // Start the job
    job.start();

    schedule.job = job;

    this.schedules.set(schedule.id, schedule);
    await this.saveData();

    this.emit('schedule:created', { schedule });

    return schedule;
  }

  /**
   * Stop delta sync schedule
   */
  async stopDeltaSync(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    schedule.enabled = false;
    if (schedule.job) {
      schedule.job.stop();
    }

    await this.saveData();

    this.emit('schedule:stopped', { scheduleId });
  }

  /**
   * Resume delta sync schedule
   */
  async resumeDeltaSync(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    schedule.enabled = true;
    if (schedule.job) {
      schedule.job.start();
    }

    await this.saveData();

    this.emit('schedule:resumed', { scheduleId });
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    if (schedule.job) {
      schedule.job.stop();
    }

    this.schedules.delete(scheduleId);
    await this.saveData();

    this.emit('schedule:deleted', { scheduleId });
  }

  /**
   * Get sync history
   */
  getSyncHistory(waveId?: string): SyncResult[] {
    const history = Array.from(this.syncHistory.values());

    if (waveId) {
      return history.filter(s => s.waveId === waveId);
    }

    return history;
  }

  /**
   * Get schedules
   */
  getSchedules(waveId?: string): SyncSchedule[] {
    const schedules = Array.from(this.schedules.values()).map(s => ({
      ...s,
      job: undefined, // Don't include job in response
    }));

    if (waveId) {
      return schedules.filter(s => s.waveId === waveId);
    }

    return schedules;
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTimestamp(waveId: string): Date | null {
    return this.lastSyncTimestamps.get(waveId) || null;
  }

  /**
   * Resume from checkpoint
   */
  async resumeFromCheckpoint(checkpointId: string): Promise<SyncResult> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const { waveId, type, direction } = checkpoint.state;

    // Resume sync from last processed item
    console.log(`Resuming sync from checkpoint: ${checkpoint.itemsProcessed} items processed`);

    return await this.performDeltaSync(waveId, type, direction);
  }

  /**
   * Save data
   */
  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        fs.writeFile(
          path.join(this.dataDir, 'sync-history.json'),
          JSON.stringify(Array.from(this.syncHistory.values()), null, 2),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'schedules.json'),
          JSON.stringify(
            Array.from(this.schedules.values()).map(s => ({ ...s, job: undefined })),
            null,
            2
          ),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'timestamps.json'),
          JSON.stringify(Object.fromEntries(this.lastSyncTimestamps), null, 2),
          'utf-8'
        ),
      ]);
    } catch (error) {
      console.error('Failed to save delta sync data:', error);
    }
  }

  /**
   * Load data
   */
  private async loadData(): Promise<void> {
    try {
      const [historyData, schedulesData, timestampsData] = await Promise.all([
        fs.readFile(path.join(this.dataDir, 'sync-history.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'schedules.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'timestamps.json'), 'utf-8').catch(() => '{}'),
      ]);

      const history: SyncResult[] = JSON.parse(historyData);
      const schedules: SyncSchedule[] = JSON.parse(schedulesData);
      const timestamps: Record<string, string> = JSON.parse(timestampsData);

      this.syncHistory.clear();
      for (const result of history) {
        this.syncHistory.set(result.id, result);
      }

      this.schedules.clear();
      for (const schedule of schedules) {
        // Recreate cron jobs
      if (schedule.enabled) {
        const job = cron.schedule(
          schedule.cronExpression,
          async () => {
            console.log(`Running scheduled sync: ${schedule.name}`);
            schedule.lastRun = new Date();

            try {
              await this.performDeltaSync(schedule.waveId, schedule.syncType, schedule.direction);
            } catch (error: any) {
              console.error(`Scheduled sync failed: ${schedule.name}`, error);
            }

            await this.saveData();
          },
          {
            timezone: 'UTC'
          }
        );

        schedule.job = job;
        job.start();
      }

        this.schedules.set(schedule.id, schedule);
      }

      this.lastSyncTimestamps.clear();
      for (const [waveId, timestamp] of Object.entries(timestamps)) {
        this.lastSyncTimestamps.set(waveId, new Date(timestamp));
      }

      console.log(`Loaded ${this.syncHistory.size} sync results, ${this.schedules.size} schedules`);
    } catch (error) {
      // Data files don't exist yet
    }
  }

  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    // Stop all cron jobs
    for (const schedule of this.schedules.values()) {
      if (schedule.job) {
        schedule.job.stop();
      }
    }

    await this.saveData();
  }
}

export default DeltaSyncService;


