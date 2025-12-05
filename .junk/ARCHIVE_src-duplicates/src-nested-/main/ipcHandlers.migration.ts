/**
 * Migration Plan Persistence IPC Handlers (Epic 2)
 *
 * Handles all IPC communication for migration wave planning and persistence.
 */

import { ipcMain } from 'electron';

/**
 * Register all migration-related IPC handlers
 */
export function registerMigrationHandlers(): void {
  // ========================================
  // Migration Plan Persistence Handlers
  // ========================================

  /**
   * IPC Handler: migration:initialize-db
   * Initializes the database for the active profile
   */
  ipcMain.handle('migration:initialize-db', async (_, args: { profilePath: string }) => {
    try {
      const { profilePath } = args;
      console.log(`[IPC] Initializing migration database for profile: ${profilePath}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.initialize(profilePath);

      return { success: true, message: 'Database initialized successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:initialize-db error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-waves
   * Retrieves all migration waves from the database
   */
  ipcMain.handle('migration:get-waves', async () => {
    try {
      console.log('[IPC] Getting migration waves');

      const { databaseService } = await import('./services/databaseService');
      const waves = await databaseService.getWaves();

      return { success: true, data: waves };
    } catch (error: any) {
      console.error('[IPC] migration:get-waves error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:get-wave
   * Retrieves a single wave by ID
   */
  ipcMain.handle('migration:get-wave', async (_, args: { waveId: string }) => {
    try {
      const { waveId } = args;
      console.log(`[IPC] Getting migration wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      const wave = await databaseService.getWave(waveId);

      if (!wave) {
        return { success: false, error: `Wave not found: ${waveId}`, data: null };
      }

      return { success: true, data: wave };
    } catch (error: any) {
      console.error('[IPC] migration:get-wave error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  /**
   * IPC Handler: migration:add-wave
   * Adds a new migration wave to the database
   */
  ipcMain.handle('migration:add-wave', async (_, args: { wave: any }) => {
    try {
      const { wave } = args;
      console.log(`[IPC] Adding migration wave: ${wave.name}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.addWave(wave);

      return { success: true, message: 'Wave added successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:add-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:update-wave
   * Updates an existing migration wave
   */
  ipcMain.handle('migration:update-wave', async (_, args: { waveId: string; updates: any }) => {
    try {
      const { waveId, updates } = args;
      console.log(`[IPC] Updating migration wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.updateWave(waveId, updates);

      return { success: true, message: 'Wave updated successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:update-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:delete-wave
   * Deletes a migration wave from the database
   */
  ipcMain.handle('migration:delete-wave', async (_, args: { waveId: string }) => {
    try {
      const { waveId } = args;
      console.log(`[IPC] Deleting migration wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.deleteWave(waveId);

      return { success: true, message: 'Wave deleted successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:delete-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:add-item-to-wave
   * Adds a migration item to a specific wave
   */
  ipcMain.handle('migration:add-item-to-wave', async (_, args: { waveId: string; item: any }) => {
    try {
      const { waveId, item } = args;
      console.log(`[IPC] Adding item to wave ${waveId}:`, item.sourceIdentity || item.id);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.addItemToWave(waveId, item);

      return { success: true, message: 'Item added to wave successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:add-item-to-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:remove-item-from-wave
   * Removes a migration item from a wave
   */
  ipcMain.handle('migration:remove-item-from-wave', async (_, args: { waveId: string; itemId: string }) => {
    try {
      const { waveId, itemId } = args;
      console.log(`[IPC] Removing item ${itemId} from wave ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.removeItemFromWave(waveId, itemId);

      return { success: true, message: 'Item removed from wave successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:remove-item-from-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-wave-items
   * Retrieves all items in a specific wave
   */
  ipcMain.handle('migration:get-wave-items', async (_, args: { waveId: string }) => {
    try {
      const { waveId } = args;
      console.log(`[IPC] Getting items for wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      const items = await databaseService.getWaveItems(waveId);

      return { success: true, data: items };
    } catch (error: any) {
      console.error('[IPC] migration:get-wave-items error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:save-plan
   * Saves the entire migration plan (bulk operation)
   */
  ipcMain.handle('migration:save-plan', async (_, args: { waves: any[] }) => {
    try {
      const { waves } = args;
      console.log(`[IPC] Saving migration plan with ${waves.length} waves`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.saveMigrationPlan(waves);

      return { success: true, message: 'Migration plan saved successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:save-plan error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-statistics
   * Retrieves database statistics
   */
  ipcMain.handle('migration:get-statistics', async () => {
    try {
      console.log('[IPC] Getting migration statistics');

      const { databaseService } = await import('./services/databaseService');
      const stats = await databaseService.getStatistics();

      return { success: true, data: stats };
    } catch (error: any) {
      console.error('[IPC] migration:get-statistics error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  /**
   * IPC Handler: migration:update-metadata
   * Updates migration plan metadata
   */
  ipcMain.handle('migration:update-metadata', async (_, args: { metadata: any }) => {
    try {
      const { metadata } = args;
      console.log('[IPC] Updating migration metadata');

      const { databaseService } = await import('./services/databaseService');
      await databaseService.updateMetadata(metadata);

      return { success: true, message: 'Metadata updated successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:update-metadata error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-metadata
   * Retrieves migration plan metadata
   */
  ipcMain.handle('migration:get-metadata', async () => {
    try {
      console.log('[IPC] Getting migration metadata');

      const { databaseService } = await import('./services/databaseService');
      const metadata = await databaseService.getMetadata();

      return { success: true, data: metadata };
    } catch (error: any) {
      console.error('[IPC] migration:get-metadata error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  console.log('[IPC] Migration persistence handlers registered');
}
