/**
 * Migration Planning IPC Handlers
 *
 * IPC handlers for migration planning operations including:
 * - Migration plan creation and management
 * - Wave assignment and status updates
 * - User assignment to migration waves
 */

import { ipcMain } from 'electron';
import { getMigrationPlanningService } from './services/migrationPlanningService';
import type { PowerShellExecutionService } from './services/powerShellService';

/**
 * Register migration planning IPC handlers
 * @param powerShellService - PowerShell execution service instance
 */
export function registerMigrationHandlers(powerShellService?: PowerShellExecutionService): void {
  const service = getMigrationPlanningService();

  // Store PowerShell service for use in handlers
  let psService: PowerShellExecutionService | null = null;
  if (powerShellService) {
    psService = powerShellService;
  }

  // ========================================
  // MIGRATION PLAN HANDLERS
  // ========================================

  /**
   * Get migration plans by profile
   */
  ipcMain.handle('migration-plan:get-by-profile', async (event, profileName: string) => {
    try {
      const plans = await service.getPlansByProfile(profileName);
      return { success: true, plans };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Create a new migration plan
   */
  ipcMain.handle('migration-plan:create', async (event, planData: any) => {
    try {
      const plan = await service.createPlan(planData);
      return { success: true, plan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Add a wave to a migration plan
   */
  ipcMain.handle('migration-plan:add-wave', async (event, data: any) => {
    try {
      const wave = await service.addWave(data.planId, data.waveData);
      return { success: true, wave };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Assign users to a wave
   */
  ipcMain.handle('migration-plan:assign-users', async (event, data: any) => {
    try {
      await service.assignUsersToWave(data.planId, data.waveId, data.userIds);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Update wave status
   */
  ipcMain.handle('migration-plan:update-wave-status', async (event, data: any) => {
    try {
      await service.updateWaveStatus(data.planId, data.waveId, data.status);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Delete migration plan
   */
  ipcMain.handle('migration-plan:delete', async (event, planId: string) => {
    try {
      await service.deletePlan(planId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get migration plan by ID
   */
  ipcMain.handle('migration-plan:get-by-id', async (event, planId: string) => {
    try {
      const plan = await service.getPlan(planId);
      return { success: true, plan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // CONSOLIDATED INVENTORY HANDLERS
  // ========================================

  /**
   * Get list of discovery CSV files for a profile
   */
  ipcMain.handle('inventory:get-discovery-files', async (event, profileId: string) => {
    try {
      // Implementation would scan the discovery data directory
      // For now, return placeholder
      return { success: true, files: [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Read discovery CSV file content
   */
  ipcMain.handle('inventory:read-discovery-file', async (event, filePath: string) => {
    try {
      // Implementation would read and parse CSV file
      // For now, return placeholder
      return { success: true, content: '' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Rebuild consolidated inventory from discovery files
   */
  ipcMain.handle('inventory:rebuild', async (event, sourceProfileId: string) => {
    try {
      // This would trigger the consolidation pipeline
      // The actual consolidation happens in the renderer's InventoryService
      console.log(`[IPC] Rebuild inventory requested for profile: ${sourceProfileId}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get inventory statistics
   */
  ipcMain.handle('inventory:get-stats', async (event, sourceProfileId?: string) => {
    try {
      // Stats are calculated client-side by InventoryService
      // This is a placeholder for future server-side stats if needed
      return { success: true, stats: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // MIGRATION WAVE HANDLERS (Enhanced)
  // ========================================

  /**
   * Create migration wave
   */
  ipcMain.handle('migration:create-wave', async (event, waveData: any) => {
    try {
      console.log(`[IPC] Create wave: ${waveData.name}`);
      // Wave creation handled by MigrationService in renderer
      return { success: true, wave: waveData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get migration waves
   */
  ipcMain.handle('migration:get-waves', async (event, filters?: any) => {
    try {
      console.log(`[IPC] Get waves with filters:`, filters);
      // Waves managed by MigrationService in renderer
      return { success: true, waves: [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Assign entities to wave
   */
  ipcMain.handle('migration:assign-entities-to-wave', async (event, waveId: string, entityIds: string[], reason?: any) => {
    try {
      console.log(`[IPC] Assign ${entityIds.length} entities to wave ${waveId}`);
      // Assignment handled by MigrationService in renderer
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Get wave summary
   */
  ipcMain.handle('migration:get-wave-summary', async (event, waveId: string) => {
    try {
      console.log(`[IPC] Get wave summary for: ${waveId}`);
      // Summary calculated by MigrationService in renderer
      return { success: true, summary: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  /**
   * Auto-suggest wave assignments
   */
  ipcMain.handle('migration:suggest-wave-assignments', async (event, sourceProfileId: string, targetProfileId: string) => {
    try {
      console.log(`[IPC] Suggest wave assignments: ${sourceProfileId} → ${targetProfileId}`);
      // Suggestions generated by MigrationService in renderer
      return { success: true, suggestions: {} };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  console.log('Migration planning and consolidated inventory IPC handlers registered');
}
