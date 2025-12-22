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

  console.log('Migration planning IPC handlers registered');
}
