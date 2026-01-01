/**
 * Application Fact Sheet IPC Handlers
 *
 * IPC handlers for LeanIX-style application fact sheet operations:
 * - CRUD operations for fact sheets
 * - Observation/provenance tracking
 * - Relation management
 * - Statistics and filtering
 * - Discovery import
 */

import { ipcMain } from 'electron';
import { getApplicationFactsService } from '../services/applicationFactsService';

/**
 * Register all application fact sheet IPC handlers
 */
export function registerApplicationFactSheetHandlers(): void {
  const service = getApplicationFactsService();

  // ========================================
  // CRUD HANDLERS
  // ========================================

  /**
   * Create a new application fact sheet
   */
  ipcMain.handle(
    'factsheet:create',
    async (
      _event,
      { sourceProfileId, name, inventoryEntityId }: { sourceProfileId: string; name: string; inventoryEntityId?: string }
    ) => {
      try {
        console.log('[IPC] factsheet:create', name);
        const factSheet = await service.create(sourceProfileId, name, inventoryEntityId);
        return { success: true, data: factSheet };
      } catch (error: any) {
        console.error('[IPC] factsheet:create error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  /**
   * Get fact sheet by ID
   */
  ipcMain.handle('factsheet:getById', async (_event, id: string) => {
    try {
      console.log('[IPC] factsheet:getById', id);
      const factSheet = await service.getById(id);
      if (!factSheet) {
        return { success: false, error: 'Fact sheet not found' };
      }
      return { success: true, data: factSheet };
    } catch (error: any) {
      console.error('[IPC] factsheet:getById error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get fact sheet by inventory entity ID
   */
  ipcMain.handle('factsheet:getByInventoryEntity', async (_event, inventoryEntityId: string) => {
    try {
      console.log('[IPC] factsheet:getByInventoryEntity', inventoryEntityId);
      const factSheet = await service.getByInventoryEntityId(inventoryEntityId);
      return { success: true, data: factSheet };
    } catch (error: any) {
      console.error('[IPC] factsheet:getByInventoryEntity error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get all fact sheets with optional filters
   */
  ipcMain.handle('factsheet:getAll', async (_event, filters?: any) => {
    try {
      console.log('[IPC] factsheet:getAll', filters);
      const factSheets = await service.getAll(filters);
      return { success: true, data: factSheets };
    } catch (error: any) {
      console.error('[IPC] factsheet:getAll error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Update a section of a fact sheet
   */
  ipcMain.handle(
    'factsheet:updateSection',
    async (
      _event,
      {
        id,
        section,
        updates,
        updatedBy,
      }: {
        id: string;
        section: 'baseInfo' | 'lifecycle' | 'business' | 'technical' | 'security' | 'migration';
        updates: any;
        updatedBy?: string;
      }
    ) => {
      try {
        console.log('[IPC] factsheet:updateSection', id, section);
        const factSheet = await service.updateSection(id, section, updates, updatedBy);
        if (!factSheet) {
          return { success: false, error: 'Fact sheet not found' };
        }
        return { success: true, data: factSheet };
      } catch (error: any) {
        console.error('[IPC] factsheet:updateSection error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  /**
   * Delete a fact sheet
   */
  ipcMain.handle('factsheet:delete', async (_event, id: string) => {
    try {
      console.log('[IPC] factsheet:delete', id);
      const deleted = await service.delete(id);
      if (!deleted) {
        return { success: false, error: 'Fact sheet not found' };
      }
      return { success: true, data: { deleted: true } };
    } catch (error: any) {
      console.error('[IPC] factsheet:delete error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // OBSERVATION HANDLERS
  // ========================================

  /**
   * Add an observation (discovered value with provenance)
   */
  ipcMain.handle(
    'factsheet:addObservation',
    async (
      _event,
      {
        applicationId,
        field,
        value,
        source,
        sourceFile,
        confidence,
      }: {
        applicationId: string;
        field: string;
        value: any;
        source: string;
        sourceFile?: string;
        confidence?: 'high' | 'medium' | 'low';
      }
    ) => {
      try {
        console.log('[IPC] factsheet:addObservation', applicationId, field);
        const observation = await service.addObservation(
          applicationId,
          field,
          value,
          source,
          sourceFile,
          confidence
        );
        if (!observation) {
          return { success: false, error: 'Fact sheet not found' };
        }
        return { success: true, data: observation };
      } catch (error: any) {
        console.error('[IPC] factsheet:addObservation error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  /**
   * Verify an observation
   */
  ipcMain.handle(
    'factsheet:verifyObservation',
    async (
      _event,
      { applicationId, observationId, verifiedBy }: { applicationId: string; observationId: string; verifiedBy: string }
    ) => {
      try {
        console.log('[IPC] factsheet:verifyObservation', applicationId, observationId);
        const observation = await service.verifyObservation(applicationId, observationId, verifiedBy);
        if (!observation) {
          return { success: false, error: 'Observation not found' };
        }
        return { success: true, data: observation };
      } catch (error: any) {
        console.error('[IPC] factsheet:verifyObservation error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  /**
   * Get observation history for a fact sheet
   */
  ipcMain.handle(
    'factsheet:getObservations',
    async (_event, { applicationId, field }: { applicationId: string; field?: string }) => {
      try {
        console.log('[IPC] factsheet:getObservations', applicationId, field);
        const observations = await service.getObservationHistory(applicationId, field);
        return { success: true, data: observations };
      } catch (error: any) {
        console.error('[IPC] factsheet:getObservations error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  // ========================================
  // RELATION HANDLERS
  // ========================================

  /**
   * Add a relation to a fact sheet
   */
  ipcMain.handle(
    'factsheet:addRelation',
    async (
      _event,
      {
        sourceId,
        sourceType,
        targetId,
        targetType,
        targetName,
        relationType,
        source,
        description,
      }: {
        sourceId: string;
        sourceType: string;
        targetId: string;
        targetType: string;
        targetName: string;
        relationType: string;
        source: string;
        description?: string;
      }
    ) => {
      try {
        console.log('[IPC] factsheet:addRelation', sourceId, relationType, targetName);
        const relation = await service.addRelation(
          sourceId,
          sourceType,
          targetId,
          targetType,
          targetName,
          relationType as any,
          source,
          description
        );
        if (!relation) {
          return { success: false, error: 'Fact sheet not found' };
        }
        return { success: true, data: relation };
      } catch (error: any) {
        console.error('[IPC] factsheet:addRelation error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  /**
   * Remove a relation from a fact sheet
   */
  ipcMain.handle(
    'factsheet:removeRelation',
    async (_event, { applicationId, relationId }: { applicationId: string; relationId: string }) => {
      try {
        console.log('[IPC] factsheet:removeRelation', applicationId, relationId);
        const removed = await service.removeRelation(applicationId, relationId);
        if (!removed) {
          return { success: false, error: 'Relation not found' };
        }
        return { success: true, data: { removed: true } };
      } catch (error: any) {
        console.error('[IPC] factsheet:removeRelation error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  /**
   * Get relations for a fact sheet
   */
  ipcMain.handle('factsheet:getRelations', async (_event, applicationId: string) => {
    try {
      console.log('[IPC] factsheet:getRelations', applicationId);
      const relations = await service.getRelations(applicationId);
      return { success: true, data: relations };
    } catch (error: any) {
      console.error('[IPC] factsheet:getRelations error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // STATISTICS HANDLERS
  // ========================================

  /**
   * Get fact sheet statistics
   */
  ipcMain.handle('factsheet:getStatistics', async (_event, sourceProfileId?: string) => {
    try {
      console.log('[IPC] factsheet:getStatistics', sourceProfileId);
      const stats = await service.getStatistics(sourceProfileId);
      return { success: true, data: stats };
    } catch (error: any) {
      console.error('[IPC] factsheet:getStatistics error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // IMPORT HANDLERS
  // ========================================

  /**
   * Import applications from discovery data
   */
  ipcMain.handle(
    'factsheet:importFromDiscovery',
    async (
      _event,
      {
        sourceProfileId,
        applications,
        source,
        sourceFile,
      }: {
        sourceProfileId: string;
        applications: any[];
        source: string;
        sourceFile: string;
      }
    ) => {
      try {
        console.log('[IPC] factsheet:importFromDiscovery', applications.length, 'applications from', source);
        const result = await service.importFromDiscovery(sourceProfileId, applications, source, sourceFile);
        return { success: true, data: result };
      } catch (error: any) {
        console.error('[IPC] factsheet:importFromDiscovery error:', error);
        return { success: false, error: error.message };
      }
    }
  );

  console.log('[ApplicationFactSheetHandlers] Registered 14 IPC handlers');
}


