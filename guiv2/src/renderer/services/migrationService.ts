/**
 * Migration Service
 *
 * Manages migration waves, entity assignments, and wave summaries
 * for the consolidated inventory migration planning.
 */

import {
  MigrationWaveExtended,
  WaveAssignment,
  WaveSummary,
  WaveStatus,
  EntityType,
} from '../types/models/inventory';
import { inventoryService } from './inventoryService';

/**
 * Migration Service Class
 *
 * Handles wave CRUD, entity assignment, and wave summary generation.
 */
export class MigrationService {
  private waves: Map<string, MigrationWaveExtended> = new Map();
  private assignments: Map<string, WaveAssignment[]> = new Map(); // waveId → assignments

  // ============================================================================
  // Wave CRUD Operations
  // ============================================================================

  /**
   * Create a new migration wave
   */
  async createWave(
    wave: Omit<MigrationWaveExtended, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MigrationWaveExtended> {
    const newWave: MigrationWaveExtended = {
      ...wave,
      id: this.generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.waves.set(newWave.id, newWave);
    return newWave;
  }

  /**
   * Get waves with optional filtering
   */
  async getWaves(filters?: {
    sourceProfileId?: string;
    targetProfileId?: string;
    status?: WaveStatus;
  }): Promise<MigrationWaveExtended[]> {
    let waves = Array.from(this.waves.values());

    if (filters?.sourceProfileId) {
      waves = waves.filter((w) => w.sourceProfileId === filters.sourceProfileId);
    }
    if (filters?.targetProfileId) {
      waves = waves.filter((w) => w.targetProfileId === filters.targetProfileId);
    }
    if (filters?.status) {
      waves = waves.filter((w) => w.status === filters.status);
    }

    // Sort by planned start date
    return waves.sort((a, b) => {
      const aDate = a.plannedStartDate?.getTime() || 0;
      const bDate = b.plannedStartDate?.getTime() || 0;
      return aDate - bDate;
    });
  }

  /**
   * Get a single wave by ID
   */
  async getWave(id: string): Promise<MigrationWaveExtended | null> {
    return this.waves.get(id) || null;
  }

  /**
   * Update an existing wave
   */
  async updateWave(
    id: string,
    updates: Partial<MigrationWaveExtended>
  ): Promise<MigrationWaveExtended | null> {
    const wave = this.waves.get(id);
    if (!wave) return null;

    const updatedWave = { ...wave, ...updates, updatedAt: new Date() };
    this.waves.set(id, updatedWave);
    return updatedWave;
  }

  /**
   * Delete a wave (and its assignments)
   */
  async deleteWave(id: string): Promise<boolean> {
    const deleted = this.waves.delete(id);
    if (deleted) {
      this.assignments.delete(id);
    }
    return deleted;
  }

  // ============================================================================
  // Assignment Management
  // ============================================================================

  /**
   * Assign entities to a wave
   */
  async assignEntitiesToWave(
    waveId: string,
    entityIds: string[],
    reason?: Record<string, any>
  ): Promise<WaveAssignment[]> {
    const wave = await this.getWave(waveId);
    if (!wave) {
      throw new Error(`Wave not found: ${waveId}`);
    }

    const assignments: WaveAssignment[] = entityIds.map((entityId) => ({
      id: this.generateUUID(),
      waveId,
      inventoryEntityId: entityId,
      assignmentReason: reason,
      createdAt: new Date(),
    }));

    if (!this.assignments.has(waveId)) {
      this.assignments.set(waveId, []);
    }

    // Add assignments and update entities
    this.assignments.get(waveId)!.push(...assignments);

    // Update entity waveId property
    for (const entityId of entityIds) {
      await inventoryService.updateEntity(entityId, { waveId });
    }

    console.log(`[MigrationService] Assigned ${entityIds.length} entities to wave ${waveId}`);
    return assignments;
  }

  /**
   * Unassign entities from a wave
   */
  async unassignEntitiesFromWave(waveId: string, entityIds: string[]): Promise<void> {
    const currentAssignments = this.assignments.get(waveId) || [];
    const filteredAssignments = currentAssignments.filter(
      (a) => !entityIds.includes(a.inventoryEntityId)
    );
    this.assignments.set(waveId, filteredAssignments);

    // Clear entity waveId property
    for (const entityId of entityIds) {
      await inventoryService.updateEntity(entityId, { waveId: undefined });
    }

    console.log(`[MigrationService] Unassigned ${entityIds.length} entities from wave ${waveId}`);
  }

  /**
   * Get all assignments for a wave
   */
  async getWaveAssignments(waveId: string): Promise<WaveAssignment[]> {
    return this.assignments.get(waveId) || [];
  }

  /**
   * Get assigned entities for a wave
   */
  async getWaveEntities(waveId: string): Promise<string[]> {
    const assignments = await this.getWaveAssignments(waveId);
    return assignments.map((a) => a.inventoryEntityId);
  }

  // ============================================================================
  // Wave Summaries
  // ============================================================================

  /**
   * Generate summary statistics for a wave
   */
  async getWaveSummary(waveId: string): Promise<WaveSummary | null> {
    const wave = await this.getWave(waveId);
    if (!wave) return null;

    const assignments = await this.getWaveAssignments(waveId);
    const entityIds = assignments.map((a) => a.inventoryEntityId);

    // Get entities
    const entities = await Promise.all(
      entityIds.map((id) => inventoryService.getEntity(id))
    );
    const validEntities = entities.filter((e) => e !== null) as any[];

    // Count by type
    const entityCounts: Record<EntityType, number> = {
      USER: 0,
      GROUP: 0,
      APPLICATION: 0,
      INFRASTRUCTURE: 0,
    };

    let totalReadiness = 0;
    const blockers: string[] = [];

    for (const entity of validEntities) {
      entityCounts[entity.entityType as EntityType]++;

      if (entity.readinessScore !== undefined) {
        totalReadiness += entity.readinessScore;
      }

      // Check for blockers
      if ((entity.readinessScore || 0) < 0.5) {
        blockers.push(`${entity.displayName} has low readiness score`);
      }

      if (entity.status === 'DISCOVERED') {
        blockers.push(`${entity.displayName} not yet triaged`);
      }
    }

    const readinessAverage =
      validEntities.length > 0 ? totalReadiness / validEntities.length : 0;

    return {
      waveId,
      entityCounts,
      readinessAverage,
      blockers: blockers.slice(0, 10), // Limit to top 10 blockers
      totalEntities: validEntities.length,
    };
  }

  /**
   * Get all wave summaries
   */
  async getAllWaveSummaries(
    sourceProfileId?: string,
    targetProfileId?: string
  ): Promise<WaveSummary[]> {
    const waves = await this.getWaves({ sourceProfileId, targetProfileId });
    const summaries = await Promise.all(
      waves.map((wave) => this.getWaveSummary(wave.id))
    );
    return summaries.filter((s) => s !== null) as WaveSummary[];
  }

  // ============================================================================
  // Wave Suggestions
  // ============================================================================

  /**
   * Suggest wave assignments based on readiness scores and dependencies
   *
   * Simple heuristic:
   * - Wave 1: Users and Groups with high readiness (foundation)
   * - Wave 2: Applications with high readiness
   * - Wave 3: Infrastructure and remaining entities
   */
  async suggestWaveAssignments(
    sourceProfileId: string,
    targetProfileId: string
  ): Promise<Record<string, string[]>> {
    const entities = await inventoryService.getEntities({ sourceProfileId });

    const suggestions: Record<string, string[]> = {
      'Wave 1 - Foundation (Users & Groups)': [],
      'Wave 2 - Core Applications': [],
      'Wave 3 - Infrastructure & Advanced': [],
    };

    // Sort entities by readiness score (descending)
    const sortedEntities = entities.sort(
      (a, b) => (b.readinessScore || 0) - (a.readinessScore || 0)
    );

    for (const entity of sortedEntities) {
      const readiness = entity.readinessScore || 0;

      if (entity.entityType === 'USER' || entity.entityType === 'GROUP') {
        // Users and groups go to Wave 1
        suggestions['Wave 1 - Foundation (Users & Groups)'].push(entity.id);
      } else if (entity.entityType === 'APPLICATION' && readiness > 0.7) {
        // High-readiness applications to Wave 2
        suggestions['Wave 2 - Core Applications'].push(entity.id);
      } else {
        // Everything else to Wave 3
        suggestions['Wave 3 - Infrastructure & Advanced'].push(entity.id);
      }
    }

    return suggestions;
  }

  /**
   * Auto-create waves from suggestions
   */
  async autoCreateWavesFromSuggestions(
    sourceProfileId: string,
    targetProfileId: string
  ): Promise<MigrationWaveExtended[]> {
    const suggestions = await this.suggestWaveAssignments(sourceProfileId, targetProfileId);
    const waves: MigrationWaveExtended[] = [];

    let order = 1;
    const baseDate = new Date();

    for (const [waveName, entityIds] of Object.entries(suggestions)) {
      if (entityIds.length === 0) continue;

      // Create wave
      const wave = await this.createWave({
        sourceProfileId,
        targetProfileId,
        name: waveName,
        status: 'PLANNED',
        plannedStartDate: new Date(baseDate.getTime() + (order - 1) * 7 * 24 * 60 * 60 * 1000), // 1 week apart
        notes: `Auto-generated wave based on entity readiness`,
      });

      // Assign entities
      await this.assignEntitiesToWave(wave.id, entityIds, {
        auto: true,
        reason: 'Suggested by readiness score',
      });

      waves.push(wave);
      order++;
    }

    console.log(`[MigrationService] Auto-created ${waves.length} waves`);
    return waves;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Generate a UUID (simplified)
   */
  private generateUUID(): string {
    return `wave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing)
   */
  async clear(): Promise<void> {
    this.waves.clear();
    this.assignments.clear();
  }
}

// Export singleton instance
export const migrationService = new MigrationService();
