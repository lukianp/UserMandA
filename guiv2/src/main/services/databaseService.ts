/**
 * Database Service for Migration Plan Persistence
 *
 * Uses lowdb for JSON-based persistence of migration waves and planning data.
 * All migration plan data is stored in profile-specific directories.
 */

// eslint-disable-next-line import/no-unresolved
import path from 'path';
import fs from 'fs/promises';

import { Low } from 'lowdb';
// eslint-disable-next-line import/no-unresolved
import { JSONFile } from 'lowdb/node';

import type { MigrationWave, MigrationItem } from '../../renderer/types/models/migration';

/**
 * Database schema for migration plan
 */
interface MigrationPlanDatabase {
  waves: MigrationWave[];
  version: string;
  lastModified: string;
  metadata: {
    projectName?: string;
    sourceProfile?: string;
    targetProfile?: string;
  };
}

/**
 * Default database structure
 */
const defaultData: MigrationPlanDatabase = {
  waves: [],
  version: '1.0.0',
  lastModified: new Date().toISOString(),
  metadata: {},
};

/**
 * Database Service for managing migration plans
 */
class DatabaseService {
  private db: Low<MigrationPlanDatabase> | null = null;
  private dbPath = '';
  private backupDir = '';

  /**
   * Initialize the database for a specific profile
   * @param profilePath - Path to the active profile directory
   */
  async initialize(profilePath: string): Promise<void> {
    try {
      // Ensure the profile directory exists
      await fs.mkdir(profilePath, { recursive: true });

      // Set database file path
      this.dbPath = path.join(profilePath, 'migration-plan.json');
      this.backupDir = path.join(profilePath, 'backups');

      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      // Initialize lowdb with JSONFile adapter
      const adapter = new JSONFile<MigrationPlanDatabase>(this.dbPath);
      this.db = new Low(adapter, defaultData);

      // Read from file (creates if doesn't exist)
      await this.db.read();

      // Initialize with default data if empty
      if (!this.db.data || !this.db.data.waves) {
        this.db.data = { ...defaultData };
        await this.db.write();
      }

      console.log(`[DatabaseService] Initialized at: ${this.dbPath}`);
    } catch (error) {
      console.error('[DatabaseService] Initialization failed:', error);
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  /**
   * Ensure database is initialized
   */
  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  /**
   * Create a backup of the current database
   */
  private async createBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `migration-plan-backup-${timestamp}.json`);

      await fs.copyFile(this.dbPath, backupPath);

      // Keep only last 10 backups
      const backups = await fs.readdir(this.backupDir);
      if (backups.length > 10) {
        const sortedBackups = backups.sort().slice(0, -10);
        for (const backup of sortedBackups) {
          await fs.unlink(path.join(this.backupDir, backup));
        }
      }
    } catch (error) {
      console.error('[DatabaseService] Backup failed:', error);
      // Don't throw - backup failure shouldn't stop operations
    }
  }

  /**
   * Get all migration waves
   */
  async getWaves(): Promise<MigrationWave[]> {
    this.ensureInitialized();
    await this.db!.read();
    return this.db!.data.waves || [];
  }

  /**
   * Get a single wave by ID
   */
  async getWave(waveId: string): Promise<MigrationWave | null> {
    this.ensureInitialized();
    await this.db!.read();
    return this.db!.data.waves.find(w => w.id === waveId) || null;
  }

  /**
   * Add a new migration wave
   */
  async addWave(wave: MigrationWave): Promise<void> {
    this.ensureInitialized();
    await this.db!.read();

    // Create backup before major change
    await this.createBackup();

    // Add wave with timestamp
    this.db!.data.waves.push({
      ...wave,
      createdAt: wave.createdAt || new Date().toISOString(),
    });

    // Update metadata
    this.db!.data.lastModified = new Date().toISOString();

    await this.db!.write();
    console.log(`[DatabaseService] Added wave: ${wave.id}`);
  }

  /**
   * Update an existing wave
   */
  async updateWave(waveId: string, updates: Partial<MigrationWave>): Promise<void> {
    this.ensureInitialized();
    await this.db!.read();

    const index = this.db!.data.waves.findIndex(w => w.id === waveId);
    if (index === -1) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    // Merge updates
    this.db!.data.waves[index] = {
      ...this.db!.data.waves[index],
      ...updates,
      id: waveId, // Preserve ID
    };

    // Update metadata
    this.db!.data.lastModified = new Date().toISOString();

    await this.db!.write();
    console.log(`[DatabaseService] Updated wave: ${waveId}`);
  }

  /**
   * Delete a wave
   */
  async deleteWave(waveId: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.read();

    // Create backup before deletion
    await this.createBackup();

    const initialLength = this.db!.data.waves.length;
    this.db!.data.waves = this.db!.data.waves.filter(w => w.id !== waveId);

    if (this.db!.data.waves.length === initialLength) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    // Update metadata
    this.db!.data.lastModified = new Date().toISOString();

    await this.db!.write();
    console.log(`[DatabaseService] Deleted wave: ${waveId}`);
  }

  /**
   * Add an item to a wave
   */
  async addItemToWave(waveId: string, item: MigrationItem): Promise<void> {
    this.ensureInitialized();
    await this.db!.read();

    const wave = this.db!.data.waves.find(w => w.id === waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    // Find or create the appropriate batch based on item type
    let batch = wave.batches.find(b => b.type === item.type);

    if (!batch) {
      // Create a new batch for this type
      batch = {
        id: `batch-${item.type}-${Date.now()}`,
        name: `${item.type} Batch`,
        description: `Batch for ${item.type} migrations`,
        type: item.type,
        priority: item.priority || 'Normal',
        complexity: item.complexity || 'Moderate',
        items: [],
        status: 'NotStarted',
        statusMessage: '',
        startTime: null,
        endTime: null,
        plannedStartDate: null,
        plannedEndDate: null,
        estimatedDuration: null,
        actualDuration: null,
        assignedTechnician: '',
        businessOwner: '',
        maxConcurrentItems: 5,
        enableAutoRetry: true,
        maxRetryAttempts: 3,
        retryDelay: 5000,
        totalItems: 0,
        completedItems: 0,
        failedItems: 0,
        itemsWithWarnings: 0,
        inProgressItems: 0,
        pendingItems: 0,
        progressPercentage: 0,
        successRate: 0,
        totalSizeBytes: 0,
        transferredBytes: 0,
        averageTransferRateMBps: 0,
        formattedTotalSize: '0 MB',
        prerequisites: [],
        postMigrationTasks: [],
        dependentBatches: [],
        configuration: {},
        environmentSettings: {},
        enableThrottling: false,
        throttlingLimitMBps: 100,
        preMigrationChecklist: [],
        postMigrationValidation: [],
        qualityGates: [],
        requiresApproval: false,
        approvedBy: '',
        approvalDate: null,
        errors: [],
        warnings: [],
        logFilePath: '',
        detailedLogs: [],
        businessJustification: '',
        estimatedCost: null,
        actualCost: null,
        tags: [],
        customProperties: {},
        supportsRollback: true,
        rollbackPlan: '',
        rollbackInstructions: [],
        isCompleted: false,
        hasErrors: false,
        hasWarnings: false,
        isHighRisk: false,
        canStart: true,
        canPause: false,
        canResume: false,
        isRunning: false,
        createdAt: new Date().toISOString(),
      };

      wave.batches.push(batch);
    }

    // Add item to batch
    batch.items.push(item);
    batch.totalItems = batch.items.length;
    batch.pendingItems = batch.items.filter(i => i.status === 'NotStarted' || i.status === 'Planning').length;

    // Update wave totals
    wave.totalItems = wave.batches.reduce((sum, b) => sum + b.totalItems, 0);

    // Update metadata
    this.db!.data.lastModified = new Date().toISOString();

    await this.db!.write();
    console.log(`[DatabaseService] Added item to wave ${waveId}, batch ${batch.id}`);
  }

  /**
   * Remove an item from a wave
   */
  async removeItemFromWave(waveId: string, itemId: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.read();

    const wave = this.db!.data.waves.find(w => w.id === waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    let found = false;
    for (const batch of wave.batches) {
      const initialLength = batch.items.length;
      batch.items = batch.items.filter(i => i.id !== itemId);

      if (batch.items.length < initialLength) {
        found = true;
        batch.totalItems = batch.items.length;
        batch.pendingItems = batch.items.filter(i => i.status === 'NotStarted' || i.status === 'Planning').length;
      }
    }

    if (!found) {
      throw new Error(`Item not found: ${itemId}`);
    }

    // Update wave totals
    wave.totalItems = wave.batches.reduce((sum, b) => sum + b.totalItems, 0);

    // Update metadata
    this.db!.data.lastModified = new Date().toISOString();

    await this.db!.write();
    console.log(`[DatabaseService] Removed item ${itemId} from wave ${waveId}`);
  }

  /**
   * Get all items in a wave
   */
  async getWaveItems(waveId: string): Promise<MigrationItem[]> {
    this.ensureInitialized();
    await this.db!.read();

    const wave = this.db!.data.waves.find(w => w.id === waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    return wave.batches.flatMap(b => b.items);
  }

  /**
   * Save the entire migration plan (for bulk operations)
   */
  async saveMigrationPlan(waves: MigrationWave[]): Promise<void> {
    this.ensureInitialized();

    // Create backup before bulk save
    await this.createBackup();

    this.db!.data.waves = waves;
    this.db!.data.lastModified = new Date().toISOString();

    await this.db!.write();
    console.log(`[DatabaseService] Saved complete migration plan with ${waves.length} waves`);
  }

  /**
   * Update metadata
   */
  async updateMetadata(metadata: Partial<MigrationPlanDatabase['metadata']>): Promise<void> {
    this.ensureInitialized();
    await this.db!.read();

    this.db!.data.metadata = {
      ...this.db!.data.metadata,
      ...metadata,
    };
    this.db!.data.lastModified = new Date().toISOString();

    await this.db!.write();
  }

  /**
   * Get database metadata
   */
  async getMetadata(): Promise<MigrationPlanDatabase['metadata']> {
    this.ensureInitialized();
    await this.db!.read();
    return this.db!.data.metadata;
  }

  /**
   * Clear all data (destructive - creates backup first)
   */
  async clearAll(): Promise<void> {
    this.ensureInitialized();

    // Create backup before clearing
    await this.createBackup();

    this.db!.data = { ...defaultData };
    await this.db!.write();
    console.log('[DatabaseService] Cleared all migration data');
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<{
    totalWaves: number;
    totalBatches: number;
    totalItems: number;
    lastModified: string;
  }> {
    this.ensureInitialized();
    await this.db!.read();

    const totalWaves = this.db!.data.waves.length;
    const totalBatches = this.db!.data.waves.reduce((sum, w) => sum + w.batches.length, 0);
    const totalItems = this.db!.data.waves.reduce((sum, w) => sum + (w.totalItems || 0), 0);

    return {
      totalWaves,
      totalBatches,
      totalItems,
      lastModified: this.db!.data.lastModified,
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
