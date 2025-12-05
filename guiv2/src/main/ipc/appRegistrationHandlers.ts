/**
 * IPC Handlers for Azure App Registration
 *
 * Provides renderer process access to app registration functionality
 * with real-time status updates via IPC streaming.
 */

import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron';

import * as appRegistrationService from '../services/appRegistrationService';

/**
 * Register all app registration IPC handlers
 */
export function registerAppRegistrationHandlers(): void {
  // Launch app registration script
  ipcMain.handle(
    'app-registration:launch',
    async (event: IpcMainInvokeEvent, options: appRegistrationService.AppRegistrationOptions) => {
      console.log('[IPC] app-registration:launch', options);
      return await appRegistrationService.launchAppRegistration(options);
    }
  );

  // Check if credentials exist
  ipcMain.handle(
    'app-registration:has-credentials',
    async (event: IpcMainInvokeEvent, companyName: string) => {
      console.log('[IPC] app-registration:has-credentials', companyName);
      return appRegistrationService.hasAppRegistrationCredentials(companyName);
    }
  );

  // Read credential summary
  ipcMain.handle(
    'app-registration:read-summary',
    async (event: IpcMainInvokeEvent, companyName: string) => {
      console.log('[IPC] app-registration:read-summary', companyName);
      try {
        return await appRegistrationService.readCredentialSummary(companyName);
      } catch (error: any) {
        console.error('[IPC] app-registration:read-summary error:', error.message);
        // Return null instead of throwing to let the renderer handle it gracefully
        return null;
      }
    }
  );

  // Decrypt credential file
  ipcMain.handle(
    'app-registration:decrypt-credential',
    async (event: IpcMainInvokeEvent, credentialFilePath: string) => {
      console.log('[IPC] app-registration:decrypt-credential', credentialFilePath);
      return await appRegistrationService.decryptCredentialFile(credentialFilePath);
    }
  );

  // Read registration status (for progress tracking)
  ipcMain.handle(
    'app-registration:read-status',
    async (event: IpcMainInvokeEvent, companyName: string) => {
      const status = await appRegistrationService.readRegistrationStatus(companyName);
      if (status) {
        console.log('[IPC] app-registration:read-status', companyName, '=> status:', status.status, 'step:', status.step, 'progress:', status.progress, '%');
      }
      return status;
    }
  );

  // Clear registration status (before starting new registration)
  ipcMain.handle(
    'app-registration:clear-status',
    async (event: IpcMainInvokeEvent, companyName: string) => {
      console.log('[IPC] app-registration:clear-status', companyName);
      return await appRegistrationService.clearRegistrationStatus(companyName);
    }
  );

  // Manual status broadcast (can be called from main process)
  ipcMain.on('app-registration:broadcast-status', (event, status: appRegistrationService.ParsedPowerShellOutput) => {
    console.log('[IPC] app-registration:broadcast-status', status.step, status.message);
    // Broadcast to all renderer windows
    const windows = BrowserWindow.getAllWindows();
    for (const window of windows) {
      if (!window.isDestroyed()) {
        window.webContents.send('app-registration:status-update', status);
      }
    }
  });

  console.log('[IPC] App registration handlers registered with streaming support');
}

export default registerAppRegistrationHandlers;
