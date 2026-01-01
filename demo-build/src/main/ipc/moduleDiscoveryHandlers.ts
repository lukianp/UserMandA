/**
 * Module Discovery IPC Handlers
 *
 * IPC handlers for PowerShell module discovery service
 */

import path from 'path';

import { ipcMain } from 'electron';

import { getEnhancedModuleDiscoveryService } from '../services/enhancedModuleDiscovery';

/**
 * Register all module discovery IPC handlers
 */
export function registerModuleDiscoveryHandlers(): void {
  // Discover modules
  ipcMain.handle('module-discovery:discover', async (event) => {
    try {
      const service = getEnhancedModuleDiscoveryService();

      // Determine scripts root path
      const scriptsRoot = process.env.SCRIPTS_ROOT || path.join(__dirname, '../../Scripts');

      const modules = await service.discoverModules(scriptsRoot);

      return { success: true, modules };
    } catch (error: any) {
      return { success: false, error: error.message, modules: [] };
    }
  });

  // Get module by ID
  ipcMain.handle('module-discovery:get-by-id', async (event, moduleId: string) => {
    try {
      const service = getEnhancedModuleDiscoveryService();
      const module = service.getModuleById(moduleId);

      if (!module) {
        return { success: false, error: 'Module not found' };
      }

      return { success: true, module };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Search modules
  ipcMain.handle('module-discovery:search', async (event, query: string) => {
    try {
      const service = getEnhancedModuleDiscoveryService();
      const modules = service.searchModules(query);

      return { success: true, modules };
    } catch (error: any) {
      return { success: false, error: error.message, modules: [] };
    }
  });

  // Get modules by category
  ipcMain.handle('module-discovery:get-by-category', async (event, category: string) => {
    try {
      const service = getEnhancedModuleDiscoveryService();
      const modules = service.getModulesByCategory(category);

      return { success: true, modules };
    } catch (error: any) {
      return { success: false, error: error.message, modules: [] };
    }
  });

  // Get all categories
  ipcMain.handle('module-discovery:get-categories', async (event) => {
    try {
      const service = getEnhancedModuleDiscoveryService();
      const categories = service.getCategories();

      return { success: true, categories };
    } catch (error: any) {
      return { success: false, error: error.message, categories: [] };
    }
  });
}


