/**
 * IPC Handlers for Target Profile Management
 *
 * Provides renderer process access to target profile functionality
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';

import * as targetProfileService from '../services/targetProfileService';

/**
 * Register all target profile IPC handlers
 * Matches existing channel names in preload.ts
 */
export function registerTargetProfileHandlers(): void {
  // Load target profiles
  ipcMain.handle('profile:loadTargetProfiles', async (event: IpcMainInvokeEvent) => {
    console.log('[IPC] profile:loadTargetProfiles');
    return await targetProfileService.loadTargetProfiles();
  });

  // Create target profile
  ipcMain.handle(
    'profile:createTarget',
    async (
      event: IpcMainInvokeEvent,
      profileData: Omit<targetProfileService.TargetProfile, 'id' | 'createdAt'>
    ) => {
      console.log('[IPC] profile:createTarget', profileData.name);
      return await targetProfileService.createTargetProfile(profileData);
    }
  );

  // Update target profile
  ipcMain.handle(
    'profile:updateTarget',
    async (
      event: IpcMainInvokeEvent,
      id: string,
      updates: Partial<targetProfileService.TargetProfile>
    ) => {
      console.log('[IPC] profile:updateTarget', id);
      return await targetProfileService.updateTargetProfile(id, updates);
    }
  );

  // Delete target profile
  ipcMain.handle('profile:deleteTarget', async (event: IpcMainInvokeEvent, id: string) => {
    console.log('[IPC] profile:deleteTarget', id);
    return await targetProfileService.deleteTargetProfile(id);
  });

  // Set active target profile
  ipcMain.handle(
    'profile:setActiveTarget',
    async (event: IpcMainInvokeEvent, id: string) => {
      console.log('[IPC] profile:setActiveTarget', id);
      return await targetProfileService.setActiveTargetProfile(id);
    }
  );

  // Decrypt target credential
  ipcMain.handle(
    'profile:decryptTargetCredential',
    async (event: IpcMainInvokeEvent, companyName: string) => {
      console.log('[IPC] profile:decryptTargetCredential', companyName);
      return await targetProfileService.decryptTargetCredential(companyName);
    }
  );

  console.log('[IPC] Target profile handlers registered');
}

export default registerTargetProfileHandlers;


