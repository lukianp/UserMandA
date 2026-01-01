/**
 * IPC Handlers for Connection Testing
 *
 * Provides renderer process access to connection testing functionality
 */

import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron';

import { getConnectionTestingService } from '../services/connectionTestingService';

let mainWindow: BrowserWindow | null = null;

/**
 * Register all connection testing IPC handlers
 */
export function registerConnectionTestHandlers(window?: BrowserWindow): void {
  if (window) {
    mainWindow = window;
  }

  const service = getConnectionTestingService();

  // Forward events to renderer
  if (mainWindow) {
    service.on('test:started', (data) => {
      mainWindow?.webContents.send('connection-test:started', data);
    });

    service.on('test:progress', (data) => {
      mainWindow?.webContents.send('connection-test:progress', data);
    });

    service.on('test:completed', (data) => {
      mainWindow?.webContents.send('connection-test:completed', data);
    });

    service.on('test:failed', (data) => {
      mainWindow?.webContents.send('connection-test:failed', data);
    });

    service.on('test:cancelled', (data) => {
      mainWindow?.webContents.send('connection-test:cancelled', data);
    });
  }

  // Test Active Directory
  ipcMain.handle(
    'connection-test:active-directory',
    async (
      event: IpcMainInvokeEvent,
      domainController: string,
      credential?: { username: string; password: string }
    ) => {
      console.log('[IPC] connection-test:active-directory', domainController);
      return await service.testActiveDirectory(domainController, credential);
    }
  );

  // Test Exchange Server
  ipcMain.handle(
    'connection-test:exchange',
    async (
      event: IpcMainInvokeEvent,
      serverUrl: string,
      credential?: { username: string; password: string }
    ) => {
      console.log('[IPC] connection-test:exchange', serverUrl);
      return await service.testExchangeServer(serverUrl, credential);
    }
  );

  // Test Azure AD
  ipcMain.handle(
    'connection-test:azure-ad',
    async (
      event: IpcMainInvokeEvent,
      tenantId: string,
      clientId: string,
      clientSecret: string
    ) => {
      console.log('[IPC] connection-test:azure-ad', tenantId);
      return await service.testAzureAD(tenantId, clientId, clientSecret);
    }
  );

  // Test comprehensive environment (T-000)
  ipcMain.handle(
    'connection-test:environment',
    async (
      event: IpcMainInvokeEvent,
      config: {
        profileName: string;
        domainController?: string;
        exchangeServer?: string;
        tenantId?: string;
        clientId?: string;
        clientSecret?: string;
        credential?: { username: string; password: string };
      }
    ) => {
      console.log('[IPC] connection-test:environment', config.profileName);
      return await service.testEnvironment(config);
    }
  );

  // Cancel test
  ipcMain.handle('connection-test:cancel', async (event: IpcMainInvokeEvent, testId: string) => {
    console.log('[IPC] connection-test:cancel', testId);
    return await service.cancelTest(testId);
  });

  // Get statistics
  ipcMain.handle('connection-test:statistics', async (event: IpcMainInvokeEvent) => {
    console.log('[IPC] connection-test:statistics');
    return service.getStatistics();
  });

  console.log('[IPC] Connection test handlers registered');
}

export default registerConnectionTestHandlers;


