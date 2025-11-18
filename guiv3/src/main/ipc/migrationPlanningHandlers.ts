/**
 * Migration Planning IPC Handlers
 *
 * IPC handlers for migration planning service
 */

import { ipcMain } from 'electron';

import { getMigrationPlanningService } from '../services/migrationPlanningService';

/**
 * Register all migration planning IPC handlers
 */
export function registerMigrationPlanningHandlers(): void {
  const service = getMigrationPlanningService();

  // Get plans by profile
  ipcMain.handle('migration-plan:get-by-profile', async (event, profileName: string) => {
    try {
      const plans = await service.getPlansByProfile(profileName);
      return { success: true, plans };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Create new plan
  ipcMain.handle(
    'migration-plan:create',
    async (
      event,
      planData: { profileName: string; name: string; description: string }
    ) => {
      try {
        const plan = await service.createPlan(planData);
        return { success: true, plan };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  // Add wave to plan
  ipcMain.handle(
    'migration-plan:add-wave',
    async (
      event,
      data: {
        planId: string;
        waveData: {
          name: string;
          description: string;
          startDate: string;
          endDate: string;
          priority?: number;
          dependencies?: string[];
        };
      }
    ) => {
      try {
        const wave = await service.addWave(data.planId, data.waveData);
        return { success: true, wave };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  // Assign users to wave
  ipcMain.handle(
    'migration-plan:assign-users',
    async (event, data: { planId: string; waveId: string; userIds: string[] }) => {
      try {
        await service.assignUsersToWave(data.planId, data.waveId, data.userIds);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  // Update wave status
  ipcMain.handle(
    'migration-plan:update-wave-status',
    async (
      event,
      data: {
        planId: string;
        waveId: string;
        status: 'planned' | 'inprogress' | 'completed' | 'failed';
      }
    ) => {
      try {
        await service.updateWaveStatus(data.planId, data.waveId, data.status);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  // Delete plan
  ipcMain.handle('migration-plan:delete', async (event, planId: string) => {
    try {
      await service.deletePlan(planId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Get plan by ID
  ipcMain.handle('migration-plan:get-by-id', async (event, planId: string) => {
    try {
      const plan = await service.getPlanById(planId);
      return { success: true, plan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
