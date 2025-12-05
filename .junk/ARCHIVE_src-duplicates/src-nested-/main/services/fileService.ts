/**
 * File Service
 * Handles secure file operations with path validation and sandboxing
 */

import { promises as fs } from 'fs';
import path from 'path';

import { app, dialog } from 'electron';

export class FileService {
  private allowedBasePaths: string[];

  constructor() {
    // Define allowed base paths for file operations
    this.allowedBasePaths = [
      app.getPath('userData'),
      app.getPath('documents'),
      app.getPath('desktop'),
      app.getPath('downloads'),
      app.getPath('temp'),
    ];
  }

  /**
   * Validate and sanitize file path to prevent directory traversal attacks
   */
  private validatePath(filePath: string): string {
    // Resolve to absolute path
    const resolved = path.resolve(filePath);

    // Check if path is within allowed directories
    const isAllowed = this.allowedBasePaths.some((basePath) =>
      resolved.startsWith(path.resolve(basePath))
    );

    if (!isAllowed) {
      throw new Error(`Access denied: Path outside allowed directories: ${resolved}`);
    }

    return resolved;
  }

  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<string> {
    const validPath = this.validatePath(filePath);

    try {
      return await fs.readFile(validPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Write file content
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const validPath = this.validatePath(filePath);

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(validPath), { recursive: true });

      // Write file
      await fs.writeFile(validPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Read file as binary buffer
   */
  async readFileBuffer(filePath: string): Promise<Buffer> {
    const validPath = this.validatePath(filePath);

    try {
      return await fs.readFile(validPath);
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Write binary buffer to file
   */
  async writeFileBuffer(filePath: string, buffer: Buffer): Promise<void> {
    const validPath = this.validatePath(filePath);

    try {
      await fs.mkdir(path.dirname(validPath), { recursive: true });
      await fs.writeFile(validPath, buffer);
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    const validPath = this.validatePath(filePath);

    try {
      await fs.unlink(validPath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const validPath = this.validatePath(filePath);
      await fs.access(validPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    isDirectory: boolean;
    isFile: boolean;
  }> {
    const validPath = this.validatePath(filePath);

    try {
      const stats = await fs.stat(validPath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error}`);
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(dirPath: string): Promise<Array<{
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    modified: Date;
  }>> {
    const validPath = this.validatePath(dirPath);

    try {
      const entries = await fs.readdir(validPath, { withFileTypes: true });

      const results = await Promise.all(
        entries.map(async (entry) => {
          const entryPath = path.join(validPath, entry.name);
          const stats = await fs.stat(entryPath);

          return {
            name: entry.name,
            path: entryPath,
            isDirectory: entry.isDirectory(),
            size: stats.size,
            modified: stats.mtime,
          };
        })
      );

      return results;
    } catch (error) {
      throw new Error(`Failed to list directory: ${error}`);
    }
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath: string): Promise<void> {
    const validPath = this.validatePath(dirPath);

    try {
      await fs.mkdir(validPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error}`);
    }
  }

  /**
   * Delete directory
   */
  async deleteDirectory(dirPath: string): Promise<void> {
    const validPath = this.validatePath(dirPath);

    try {
      await fs.rm(validPath, { recursive: true, force: true });
    } catch (error) {
      throw new Error(`Failed to delete directory: ${error}`);
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    const validSource = this.validatePath(sourcePath);
    const validDest = this.validatePath(destPath);

    try {
      await fs.mkdir(path.dirname(validDest), { recursive: true });
      await fs.copyFile(validSource, validDest);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  /**
   * Move/rename file
   */
  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    const validSource = this.validatePath(sourcePath);
    const validDest = this.validatePath(destPath);

    try {
      await fs.mkdir(path.dirname(validDest), { recursive: true });
      await fs.rename(validSource, validDest);
    } catch (error) {
      throw new Error(`Failed to move file: ${error}`);
    }
  }

  /**
   * Show open file dialog
   */
  async showOpenDialog(options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  }): Promise<string[]> {
    const result = await dialog.showOpenDialog({
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
      properties: options?.properties || ['openFile'],
    });

    if (result.canceled) {
      return [];
    }

    return result.filePaths;
  }

  /**
   * Show save file dialog
   */
  async showSaveDialog(options?: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  }

  /**
   * Get user data path
   */
  getUserDataPath(): string {
    return app.getPath('userData');
  }

  /**
   * Get documents path
   */
  getDocumentsPath(): string {
    return app.getPath('documents');
  }

  /**
   * Get desktop path
   */
  getDesktopPath(): string {
    return app.getPath('desktop');
  }

  /**
   * Get downloads path
   */
  getDownloadsPath(): string {
    return app.getPath('downloads');
  }

  /**
   * Get temp path
   */
  getTempPath(): string {
    return app.getPath('temp');
  }
}

export default FileService;
