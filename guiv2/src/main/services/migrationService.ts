/**
 * Migration Service
 *
 * Manages migration waves with full CRUD operations, wave assignments,
 * and statistics tracking for the consolidated inventory layer.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import {
  MigrationWaveExtended,
  WaveAssignment,
  WaveSummary,
  EntityType,
  WaveStatus,
} from '../../shared/types/inventory';
import { getInventoryService } from './inventoryService';

interface MigrationDatabase {
  waves: MigrationWaveExtended[];
  assignments: WaveAssignment[];
  version: number;
}

export class MigrationService {
  private db!: Low<MigrationDatabase>;
  private isInitialized = false;
  private readonly dbPath: string;

  constructor() {
    this.dbPath = path.join(app.getPath('appData'), 'MandADiscoverySuite', 'migration-waves.json');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    const adapter = new JSONFile<MigrationDatabase>(this.dbPath);
    this.db = new Low(adapter, { waves: [], assignments: [], version: 1 });

    await this.db.read();
    this.ensureData();

    this.isInitialized = true;
  }

  private ensureData(): void {
    if (!this.db.data) {
      this.db.data = { waves: [], assignments: [], version: 1 };
    }
    if (!this.db.data.waves) {
      this.db.data.waves = [];
    }
    if (!this.db.data.assignments) {
      this.db.data.assignments = [];
    }
    if (!this.db.data.version) {
      this.db.data.version = 1;
    }
  }

  // ============================================================================
  // WAVE CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new migration wave
   */
  async createWave(wave: Omit<MigrationWaveExtended, 'id' | 'createdAt' | 'updatedAt'>): Promise<MigrationWaveExtended> {
    await this.db.read();
    this.ensureData();

    const newWave: MigrationWaveExtended = {
      id: this.generateUUID(),
      ...wave,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.db.data.waves.push(newWave);
    await this.db.write();

    console.log(`[MigrationService] Created wave: ${newWave.name} (${newWave.id})`);
    return newWave;
  }

  /**
   * Update an existing migration wave
   */
  async updateWave(waveId: string, updates: Partial<MigrationWaveExtended>): Promise<MigrationWaveExtended | null> {
    await this.db.read();
    this.ensureData();

    const waveIndex = this.db.data.waves.findIndex((w) => w.id === waveId);

    if (waveIndex === -1) {
      console.warn(`[MigrationService] Wave not found: ${waveId}`);
      return null;
    }

    const updatedWave: MigrationWaveExtended = {
      ...this.db.data.waves[waveIndex],
      ...updates,
      id: waveId, // Prevent ID change
      updatedAt: new Date(),
    };

    this.db.data.waves[waveIndex] = updatedWave;
    await this.db.write();

    console.log(`[MigrationService] Updated wave: ${waveId}`);
    return updatedWave;
  }

  /**
   * Delete a migration wave and all its assignments
   */
  async deleteWave(waveId: string): Promise<boolean> {
    await this.db.read();
    this.ensureData();

    const initialLength = this.db.data.waves.length;
    this.db.data.waves = this.db.data.waves.filter((w) => w.id !== waveId);

    if (this.db.data.waves.length === initialLength) {
      console.warn(`[MigrationService] Wave not found: ${waveId}`);
      return false;
    }

    // Remove all assignments for this wave
    this.db.data.assignments = this.db.data.assignments.filter((a) => a.waveId !== waveId);

    await this.db.write();

    console.log(`[MigrationService] Deleted wave: ${waveId}`);
    return true;
  }

  /**
   * Get a specific wave by ID
   */
  async getWave(waveId: string): Promise<MigrationWaveExtended | null> {
    await this.db.read();
    this.ensureData();

    return this.db.data.waves.find((w) => w.id === waveId) || null;
  }

  /**
   * Get all waves for a profile
   */
  async getWavesByProfile(sourceProfileId: string): Promise<MigrationWaveExtended[]> {
    await this.db.read();
    this.ensureData();

    return this.db.data.waves.filter((w) => w.sourceProfileId === sourceProfileId);
  }

  /**
   * Get all waves
   */
  async getAllWaves(): Promise<MigrationWaveExtended[]> {
    await this.db.read();
    this.ensureData();

    return [...this.db.data.waves];
  }

  // ============================================================================
  // WAVE ASSIGNMENT OPERATIONS
  // ============================================================================

  /**
   * Assign a single entity to a wave
   */
  async assignEntityToWave(
    waveId: string,
    inventoryEntityId: string,
    assignmentReason?: Record<string, any>
  ): Promise<WaveAssignment> {
    await this.db.read();
    this.ensureData();

    // Check if wave exists
    const wave = this.db.data.waves.find((w) => w.id === waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    // Check if assignment already exists
    const existing = this.db.data.assignments.find(
      (a) => a.waveId === waveId && a.inventoryEntityId === inventoryEntityId
    );

    if (existing) {
      console.warn(`[MigrationService] Entity already assigned to wave: ${inventoryEntityId}`);
      return existing;
    }

    const assignment: WaveAssignment = {
      id: this.generateUUID(),
      waveId,
      inventoryEntityId,
      assignmentReason,
      createdAt: new Date(),
    };

    this.db.data.assignments.push(assignment);
    await this.db.write();

    console.log(`[MigrationService] Assigned entity ${inventoryEntityId} to wave ${waveId}`);
    return assignment;
  }

  /**
   * Assign multiple entities to a wave (batch operation)
   */
  async assignEntitiesToWave(
    waveId: string,
    inventoryEntityIds: string[],
    assignmentReason?: Record<string, any>
  ): Promise<WaveAssignment[]> {
    await this.db.read();
    this.ensureData();

    // Check if wave exists
    const wave = this.db.data.waves.find((w) => w.id === waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    const assignments: WaveAssignment[] = [];
    const existingEntityIds = new Set(
      this.db.data.assignments.filter((a) => a.waveId === waveId).map((a) => a.inventoryEntityId)
    );

    for (const entityId of inventoryEntityIds) {
      if (!existingEntityIds.has(entityId)) {
        const assignment: WaveAssignment = {
          id: this.generateUUID(),
          waveId,
          inventoryEntityId: entityId,
          assignmentReason,
          createdAt: new Date(),
        };
        assignments.push(assignment);
        this.db.data.assignments.push(assignment);
      } else {
        console.warn(`[MigrationService] Entity ${entityId} already assigned to wave`);
      }
    }

    await this.db.write();

    console.log(`[MigrationService] Assigned ${assignments.length} entities to wave ${waveId}`);
    return assignments;
  }

  /**
   * Remove an entity assignment from a wave
   */
  async removeEntityFromWave(waveId: string, inventoryEntityId: string): Promise<boolean> {
    await this.db.read();
    this.ensureData();

    const initialLength = this.db.data.assignments.length;
    this.db.data.assignments = this.db.data.assignments.filter(
      (a) => !(a.waveId === waveId && a.inventoryEntityId === inventoryEntityId)
    );

    if (this.db.data.assignments.length === initialLength) {
      console.warn(`[MigrationService] Assignment not found: ${inventoryEntityId} in wave ${waveId}`);
      return false;
    }

    await this.db.write();

    console.log(`[MigrationService] Removed entity ${inventoryEntityId} from wave ${waveId}`);
    return true;
  }

  /**
   * Get all assignments for a wave
   */
  async getWaveAssignments(waveId: string): Promise<WaveAssignment[]> {
    await this.db.read();
    this.ensureData();

    return this.db.data.assignments.filter((a) => a.waveId === waveId);
  }

  /**
   * Get wave assignment for a specific entity
   */
  async getEntityWaveAssignment(inventoryEntityId: string): Promise<WaveAssignment | null> {
    await this.db.read();
    this.ensureData();

    return this.db.data.assignments.find((a) => a.inventoryEntityId === inventoryEntityId) || null;
  }

  // ============================================================================
  // WAVE SUMMARY & STATISTICS
  // ============================================================================

  /**
   * Get comprehensive wave summary with statistics
   */
  async getWaveSummary(waveId: string): Promise<WaveSummary | null> {
    const wave = await this.getWave(waveId);
    if (!wave) {
      return null;
    }

    const assignments = await this.getWaveAssignments(waveId);
    const inventoryService = getInventoryService();
    await inventoryService.initialize();

    const entityCounts: Record<EntityType, number> = {
      USER: 0,
      GROUP: 0,
      APPLICATION: 0,
      INFRASTRUCTURE: 0,
    };

    let totalReadiness = 0;
    let entitiesWithReadiness = 0;
    const blockers: string[] = [];

    // This is a simplified version - in production, we'd fetch entities from inventoryService
    // For now, we're just counting assignments
    // TODO: Integrate with InventoryService to fetch actual entities

    return {
      waveId,
      entityCounts,
      readinessAverage: entitiesWithReadiness > 0 ? totalReadiness / entitiesWithReadiness : 0,
      blockers,
      totalEntities: assignments.length,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate a UUID
   */
  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
let migrationServiceInstance: MigrationService | null = null;

export function getMigrationService(): MigrationService {
  if (!migrationServiceInstance) {
    migrationServiceInstance = new MigrationService();
  }
  return migrationServiceInstance;
}
