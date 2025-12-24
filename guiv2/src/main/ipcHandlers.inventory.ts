/**
 * Inventory IPC Handlers
 *
 * IPC handlers for consolidated inventory operations including:
 * - Inventory consolidation and rebuilding
 * - Entity, evidence, and relation management
 * - Statistics and reporting
 */

import { ipcMain } from 'electron';
import { getInventoryService } from './services/inventoryService';

/**
 * Register inventory IPC handlers
 */
export function registerInventoryHandlers(): void {
  const service = getInventoryService();

  // Initialize service
  service.initialize().catch((error) => {
    console.error('[InventoryHandlers] Failed to initialize inventory service:', error);
  });

  /**
   * Consolidate inventory from discovery outputs
   */
  ipcMain.handle('inventory:consolidate', async (event, sourceProfileId: string) => {
    try {
      console.log(`[InventoryHandlers] Consolidating inventory for profile: ${sourceProfileId}`);
      const result = await service.rebuildInventory(sourceProfileId);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[InventoryHandlers] Consolidation failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Rebuild inventory (clear and reconsolidate)
   */
  ipcMain.handle('inventory:rebuild', async (event, sourceProfileId: string) => {
    try {
      console.log(`[InventoryHandlers] Rebuilding inventory for profile: ${sourceProfileId}`);
      const result = await service.rebuildInventory(sourceProfileId);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[InventoryHandlers] Rebuild failed:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get inventory statistics
   */
  ipcMain.handle('inventory:get-stats', async (event, sourceProfileId?: string) => {
    try {
      const stats = await service.getStats(sourceProfileId);
      return { success: true, data: stats };
    } catch (error: any) {
      console.error('[InventoryHandlers] Get stats failed:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('[InventoryHandlers] Inventory IPC handlers registered');
}
