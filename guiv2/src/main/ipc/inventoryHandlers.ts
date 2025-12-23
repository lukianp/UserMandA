/**
 * Inventory IPC Handlers
 *
 * Handles IPC communication for inventory and migration wave operations.
 */

import { ipcMain } from 'electron';
import { inventoryService } from '../services/inventoryService';
import { migrationWaveService } from '../services/migrationWaveService';
import * as path from 'path';

/**
 * Register all inventory-related IPC handlers
 */
export function registerInventoryHandlers(): void {
  console.log('[IPC] Registering inventory handlers...');

  // ========================================
  // Inventory Entity Handlers
  // ========================================

  /**
   * Consolidate inventory from discovery data
   */
  ipcMain.handle('inventory:consolidate', async (_event, params: {
    sourceProfileId: string;
    companyName: string;
    options?: { forceFullRebuild?: boolean };
  }) => {
    try {
      console.log('[IPC] inventory:consolidate called', params);

      const dataPath = path.join('C:\\DiscoveryData', params.companyName);
      const result = await inventoryService.consolidateFromDiscovery(
        params.sourceProfileId,
        dataPath,
        params.options
      );

      return { success: true, data: result };
    } catch (error) {
      console.error('[IPC] inventory:consolidate error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get inventory entities with filtering
   */
  ipcMain.handle('inventory:getEntities', async (_event, filters?: any) => {
    try {
      console.log('[IPC] inventory:getEntities called', filters);

      const entities = await inventoryService.getEntities(filters);
      return { success: true, data: entities };
    } catch (error) {
      console.error('[IPC] inventory:getEntities error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get single inventory entity
   */
  ipcMain.handle('inventory:getEntity', async (_event, entityId: string) => {
    try {
      console.log('[IPC] inventory:getEntity called', entityId);

      const entity = await inventoryService.getEntity(entityId);
      return { success: true, data: entity };
    } catch (error) {
      console.error('[IPC] inventory:getEntity error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get entity with full details (evidence, relations)
   */
  ipcMain.handle('inventory:getEntityDetail', async (_event, entityId: string) => {
    try {
      console.log('[IPC] inventory:getEntityDetail called', entityId);

      const detail = await inventoryService.getEntityDetail(entityId);
      return { success: true, data: detail };
    } catch (error) {
      console.error('[IPC] inventory:getEntityDetail error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Update inventory entity
   */
  ipcMain.handle('inventory:updateEntity', async (_event, params: {
    entityId: string;
    updates: any;
  }) => {
    try {
      console.log('[IPC] inventory:updateEntity called', params.entityId);

      const updated = await inventoryService.updateEntity(params.entityId, params.updates);
      return { success: true, data: updated };
    } catch (error) {
      console.error('[IPC] inventory:updateEntity error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Delete inventory entity
   */
  ipcMain.handle('inventory:deleteEntity', async (_event, entityId: string) => {
    try {
      console.log('[IPC] inventory:deleteEntity called', entityId);

      const deleted = await inventoryService.deleteEntity(entityId);
      return { success: true, data: deleted };
    } catch (error) {
      console.error('[IPC] inventory:deleteEntity error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get inventory statistics
   */
  ipcMain.handle('inventory:getStatistics', async (_event, sourceProfileId?: string) => {
    try {
      console.log('[IPC] inventory:getStatistics called', sourceProfileId);

      const stats = await inventoryService.getStatistics(sourceProfileId);
      return { success: true, data: stats };
    } catch (error) {
      console.error('[IPC] inventory:getStatistics error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get relations for an entity
   */
  ipcMain.handle('inventory:getRelations', async (_event, entityId: string) => {
    try {
      console.log('[IPC] inventory:getRelations called', entityId);

      const relations = await inventoryService.getRelationsForEntity(entityId);
      return { success: true, data: relations };
    } catch (error) {
      console.error('[IPC] inventory:getRelations error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get all relations
   */
  ipcMain.handle('inventory:getAllRelations', async (_event, filter?: {
    sourceProfileId?: string;
    relationTypes?: string[];
  }) => {
    try {
      console.log('[IPC] inventory:getAllRelations called', filter);

      const relations = await inventoryService.getAllRelations(filter as any);
      return { success: true, data: relations };
    } catch (error) {
      console.error('[IPC] inventory:getAllRelations error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get evidence for an entity
   */
  ipcMain.handle('inventory:getEvidence', async (_event, entityId: string) => {
    try {
      console.log('[IPC] inventory:getEvidence called', entityId);

      const evidence = await inventoryService.getEvidenceForEntity(entityId);
      return { success: true, data: evidence };
    } catch (error) {
      console.error('[IPC] inventory:getEvidence error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // ========================================
  // Migration Wave Handlers
  // ========================================

  /**
   * Create migration wave
   */
  ipcMain.handle('waves:create', async (_event, waveData: any) => {
    try {
      console.log('[IPC] waves:create called', waveData.name);

      const wave = await migrationWaveService.createWave(waveData);
      return { success: true, data: wave };
    } catch (error) {
      console.error('[IPC] waves:create error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get migration waves
   */
  ipcMain.handle('waves:getAll', async (_event, filter?: {
    sourceProfileId?: string;
    targetProfileId?: string;
    statuses?: string[];
  }) => {
    try {
      console.log('[IPC] waves:getAll called', filter);

      const waves = await migrationWaveService.getWaves(filter as any);
      return { success: true, data: waves };
    } catch (error) {
      console.error('[IPC] waves:getAll error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get single wave
   */
  ipcMain.handle('waves:get', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:get called', waveId);

      const wave = await migrationWaveService.getWave(waveId);
      return { success: true, data: wave };
    } catch (error) {
      console.error('[IPC] waves:get error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Update wave
   */
  ipcMain.handle('waves:update', async (_event, params: {
    waveId: string;
    updates: any;
  }) => {
    try {
      console.log('[IPC] waves:update called', params.waveId);

      const updated = await migrationWaveService.updateWave(params.waveId, params.updates);
      return { success: true, data: updated };
    } catch (error) {
      console.error('[IPC] waves:update error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Delete wave
   */
  ipcMain.handle('waves:delete', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:delete called', waveId);

      const deleted = await migrationWaveService.deleteWave(waveId);
      return { success: true, data: deleted };
    } catch (error) {
      console.error('[IPC] waves:delete error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get wave summary
   */
  ipcMain.handle('waves:getSummary', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:getSummary called', waveId);

      const summary = await migrationWaveService.getWaveSummary(waveId);
      return { success: true, data: summary };
    } catch (error) {
      console.error('[IPC] waves:getSummary error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Assign entities to wave
   */
  ipcMain.handle('waves:assignEntities', async (_event, params: {
    waveId: string;
    entityIds: string[];
    reason?: string;
    reasonDetails?: string;
  }) => {
    try {
      console.log('[IPC] waves:assignEntities called', params.waveId, params.entityIds.length);

      const result = await migrationWaveService.assignEntitiesToWave(
        params.waveId,
        params.entityIds,
        (params.reason as any) || 'MANUAL',
        params.reasonDetails
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('[IPC] waves:assignEntities error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Unassign entities from wave
   */
  ipcMain.handle('waves:unassignEntities', async (_event, params: {
    waveId: string;
    entityIds: string[];
  }) => {
    try {
      console.log('[IPC] waves:unassignEntities called', params.waveId, params.entityIds.length);

      const result = await migrationWaveService.unassignEntitiesFromWave(
        params.waveId,
        params.entityIds
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('[IPC] waves:unassignEntities error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Get wave assignments
   */
  ipcMain.handle('waves:getAssignments', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:getAssignments called', waveId);

      const assignments = await migrationWaveService.getWaveAssignments(waveId);
      return { success: true, data: assignments };
    } catch (error) {
      console.error('[IPC] waves:getAssignments error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Suggest wave assignments
   */
  ipcMain.handle('waves:suggestAssignments', async (_event, params: {
    sourceProfileId: string;
    targetProfileId: string;
    options?: {
      maxEntitiesPerWave?: number;
      minReadinessScore?: number;
      prioritizeTypes?: string[];
    };
  }) => {
    try {
      console.log('[IPC] waves:suggestAssignments called');

      const suggestions = await migrationWaveService.suggestWaveAssignments(
        params.sourceProfileId,
        params.targetProfileId,
        params.options as any
      );
      return { success: true, data: suggestions };
    } catch (error) {
      console.error('[IPC] waves:suggestAssignments error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Apply wave suggestions
   */
  ipcMain.handle('waves:applySuggestions', async (_event, params: {
    sourceProfileId: string;
    targetProfileId: string;
    suggestions: any[];
  }) => {
    try {
      console.log('[IPC] waves:applySuggestions called');

      const result = await migrationWaveService.applySuggestions(
        params.sourceProfileId,
        params.targetProfileId,
        params.suggestions
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('[IPC] waves:applySuggestions error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Validate wave
   */
  ipcMain.handle('waves:validate', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:validate called', waveId);

      const validation = await migrationWaveService.validateWave(waveId);
      return { success: true, data: validation };
    } catch (error) {
      console.error('[IPC] waves:validate error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Start wave execution
   */
  ipcMain.handle('waves:start', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:start called', waveId);

      const result = await migrationWaveService.startWave(waveId);
      return result;
    } catch (error) {
      console.error('[IPC] waves:start error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Pause wave
   */
  ipcMain.handle('waves:pause', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:pause called', waveId);

      const result = await migrationWaveService.pauseWave(waveId);
      return result;
    } catch (error) {
      console.error('[IPC] waves:pause error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Resume wave
   */
  ipcMain.handle('waves:resume', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:resume called', waveId);

      const result = await migrationWaveService.resumeWave(waveId);
      return result;
    } catch (error) {
      console.error('[IPC] waves:resume error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Complete wave
   */
  ipcMain.handle('waves:complete', async (_event, waveId: string) => {
    try {
      console.log('[IPC] waves:complete called', waveId);

      const result = await migrationWaveService.completeWave(waveId);
      return result;
    } catch (error) {
      console.error('[IPC] waves:complete error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  console.log('[IPC] Inventory handlers registered successfully');
}
