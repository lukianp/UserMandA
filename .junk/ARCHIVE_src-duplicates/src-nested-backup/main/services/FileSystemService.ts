import * as fs from 'fs/promises';
import * as path from 'path';

import { ipcMain } from 'electron';
import { watch } from 'chokidar';
import { glob } from 'glob';

export class FileSystemService {
  private watchers = new Map<string, any>();

  constructor() {
    this.registerIPCHandlers();
  }

  private registerIPCHandlers(): void {
    ipcMain.handle('fs:getCSVPath', (_, companyName: string, fileName: string) =>
      this.getCSVPath(companyName, fileName)
    );
    ipcMain.handle('fs:getRawDataPath', (_, companyName: string) =>
      this.getRawDataPath(companyName)
    );
    ipcMain.handle('fs:readFile', (_, filePath: string) =>
      this.readFile(filePath)
    );
    ipcMain.handle('fs:listCSVFiles', (_, companyName: string) =>
      this.listCSVFiles(companyName)
    );
    ipcMain.handle('fs:watchDirectory', (_, dirPath: string, pattern: string, watchId: string) =>
      this.watchDirectory(dirPath, pattern, watchId)
    );
    ipcMain.handle('fs:unwatchDirectory', (_, watchId: string) =>
      this.unwatchDirectory(watchId)
    );
  }

  private getDataRootPath(): string {
    return process.platform === 'win32' ? 'C:\\DiscoveryData' : path.join(require('os').homedir(), 'DiscoveryData');
  }

  private getCSVPath(companyName: string, fileName: string): string {
    return path.join(this.getDataRootPath(), companyName, 'Raw', fileName);
  }

  private getRawDataPath(companyName: string): string {
    return path.join(this.getDataRootPath(), companyName, 'Raw');
  }

  private async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async listCSVFiles(companyName: string): Promise<string[]> {
    const rawPath = this.getRawDataPath(companyName);
    try {
      const files = await glob(path.join(rawPath, '*.csv'));
      return files.map(f => path.basename(f));
    } catch (error) {
      console.warn(`Failed to list CSV files for ${companyName}:`, error);
      return [];
    }
  }

  private watchDirectory(dirPath: string, pattern: string, watchId: string): boolean {
    try {
      const watcher = watch(path.join(dirPath, pattern), {
        ignoreInitial: true,
        persistent: true
      });

      watcher.on('add', () => {
        this.broadcastFileChange(watchId, 'add');
      });

      watcher.on('change', () => {
        this.broadcastFileChange(watchId, 'change');
      });

      watcher.on('unlink', () => {
        this.broadcastFileChange(watchId, 'unlink');
      });

      this.watchers.set(watchId, watcher);
      return true;
    } catch (error) {
      console.error(`Failed to watch directory ${dirPath}:`, error);
      return false;
    }
  }

  private unwatchDirectory(watchId: string): boolean {
    const watcher = this.watchers.get(watchId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(watchId);
      return true;
    }
    return false;
  }

  private broadcastFileChange(watchId: string, event: string): void {
    const windows = require('electron').BrowserWindow.getAllWindows();
    windows.forEach((window: any) => {
      window.webContents.send('fs:fileChanged', { watchId, event });
    });
  }
}