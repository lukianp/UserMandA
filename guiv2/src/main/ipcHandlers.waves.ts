/**
 * Migration Wave IPC Handlers
 *
 * IPC handlers for migration wave CRUD operations including:
 * - Wave creation, update, deletion
 * - Entity wave assignments (single and batch)
 * - Wave summaries and statistics
 */

import { ipcMain } from 'electron';
import { getMigrationService } from './services/migrationService';
import { MigrationWaveExtended } from '../shared/types/inventory';

/**
 * Register migration wave IPC handlers
 */
export function registerMigrationWaveHandlers(): void {
  const service = getMigrationService();

  // Initialize service
  service.initialize().catch((error) => {
    console.error('[WaveHandlers] Failed to initialize migration service:', error);
  });

  // ============================================================================
  // WAVE CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new migration wave
   */
  ipcMain.handle('wave:create', async (event, waveData: Omit<MigrationWaveExtended, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log(`[WaveHandlers] Creating wave: ${waveData.name}`);
      const wave = await service.createWave(waveData);
      return { success: true, data: wave };
    } catch (error: any) {
      console.error('[WaveHandlers] Create wave failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Update an existing migration wave
   */
  ipcMain.handle('wave:update', async (event, waveId: string, updates: Partial<MigrationWaveExtended>) => {
    try {
      console.log(`[WaveHandlers] Updating wave: ${waveId}`);
      const wave = await service.updateWave(waveId, updates);
      if (!wave) {
        return { success: false, error: `Wave not found: ${waveId}` };
      }
      return { success: true, data: wave };
    } catch (error: any) {
      console.error('[WaveHandlers] Update wave failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Delete a migration wave
   */
  ipcMain.handle('wave:delete', async (event, waveId: string) => {
    try {
      console.log(`[WaveHandlers] Deleting wave: ${waveId}`);
      const success = await service.deleteWave(waveId);
      if (!success) {
        return { success: false, error: `Wave not found: ${waveId}` };
      }
      return { success: true };
    } catch (error: any) {
      console.error('[WaveHandlers] Delete wave failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get a specific wave by ID
   */
  ipcMain.handle('wave:get', async (event, waveId: string) => {
    try {
      const wave = await service.getWave(waveId);
      if (!wave) {
        return { success: false, error: `Wave not found: ${waveId}` };
      }
      return { success: true, data: wave };
    } catch (error: any) {
      console.error('[WaveHandlers] Get wave failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get all waves for a profile
   */
  ipcMain.handle('wave:get-by-profile', async (event, sourceProfileId: string) => {
    try {
      const waves = await service.getWavesByProfile(sourceProfileId);
      return { success: true, data: waves };
    } catch (error: any) {
      console.error('[WaveHandlers] Get waves by profile failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get all waves
   */
  ipcMain.handle('wave:get-all', async () => {
    try {
      const waves = await service.getAllWaves();
      return { success: true, data: waves };
    } catch (error: any) {
      console.error('[WaveHandlers] Get all waves failed:', error);
      return { success: false, error: error.message };
    }
  });

  // ============================================================================
  // WAVE ASSIGNMENT OPERATIONS
  // ============================================================================

  /**
   * Assign a single entity to a wave
   */
  ipcMain.handle('wave:assign-entity', async (
    event,
    waveId: string,
    inventoryEntityId: string,
    assignmentReason?: Record<string, any>
  ) => {
    try {
      console.log(`[WaveHandlers] Assigning entity ${inventoryEntityId} to wave ${waveId}`);
      const assignment = await service.assignEntityToWave(waveId, inventoryEntityId, assignmentReason);
      return { success: true, data: assignment };
    } catch (error: any) {
      console.error('[WaveHandlers] Assign entity failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Assign multiple entities to a wave (batch operation)
   */
  ipcMain.handle('wave:assign-entities', async (
    event,
    waveId: string,
    inventoryEntityIds: string[],
    assignmentReason?: Record<string, any>
  ) => {
    try {
      console.log(`[WaveHandlers] Batch assigning ${inventoryEntityIds.length} entities to wave ${waveId}`);
      const assignments = await service.assignEntitiesToWave(waveId, inventoryEntityIds, assignmentReason);
      return { success: true, data: assignments };
    } catch (error: any) {
      console.error('[WaveHandlers] Batch assign entities failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Remove an entity from a wave
   */
  ipcMain.handle('wave:remove-entity', async (event, waveId: string, inventoryEntityId: string) => {
    try {
      console.log(`[WaveHandlers] Removing entity ${inventoryEntityId} from wave ${waveId}`);
      const success = await service.removeEntityFromWave(waveId, inventoryEntityId);
      if (!success) {
        return { success: false, error: `Assignment not found` };
      }
      return { success: true };
    } catch (error: any) {
      console.error('[WaveHandlers] Remove entity failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get all assignments for a wave
   */
  ipcMain.handle('wave:get-assignments', async (event, waveId: string) => {
    try {
      const assignments = await service.getWaveAssignments(waveId);
      return { success: true, data: assignments };
    } catch (error: any) {
      console.error('[WaveHandlers] Get wave assignments failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get wave assignment for a specific entity
   */
  ipcMain.handle('wave:get-entity-assignment', async (event, inventoryEntityId: string) => {
    try {
      const assignment = await service.getEntityWaveAssignment(inventoryEntityId);
      return { success: true, data: assignment };
    } catch (error: any) {
      console.error('[WaveHandlers] Get entity assignment failed:', error);
      return { success: false, error: error.message };
    }
  });

  // ============================================================================
  // WAVE SUMMARY & STATISTICS
  // ============================================================================

  /**
   * Get comprehensive wave summary with statistics
   */
  ipcMain.handle('wave:get-summary', async (event, waveId: string) => {
    try {
      const summary = await service.getWaveSummary(waveId);
      if (!summary) {
        return { success: false, error: `Wave not found: ${waveId}` };
      }
      return { success: true, data: summary };
    } catch (error: any) {
      console.error('[WaveHandlers] Get wave summary failed:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('[WaveHandlers] Migration wave IPC handlers registered');
}
