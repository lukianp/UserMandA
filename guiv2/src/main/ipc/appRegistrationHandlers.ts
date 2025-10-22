/**
 * IPC Handlers for Azure App Registration
 *
 * Provides renderer process access to app registration functionality
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';

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
      return await appRegistrationService.readCredentialSummary(companyName);
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

  console.log('[IPC] App registration handlers registered');
}

export default registerAppRegistrationHandlers;
