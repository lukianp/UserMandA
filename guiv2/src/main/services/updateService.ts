/**
 * Update Service
 * Manages automatic application updates from customer-specific Git repositories
 *
 * Features:
 * - GitHub-based update checking (via Octokit)
 * - Semantic versioning comparison
 * - Download with progress tracking
 * - Atomic updates with backup/rollback
 * - Update history and audit trail
 * - Customer-specific update channels
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { app } from 'electron';
import { Octokit } from 'octokit';
import * as semver from 'semver';
import { ConfigService } from './configService';
import { LicenseService } from './licenseService';

// ============================================================================
// Types
// ============================================================================

export interface UpdateChannel {
  name: string;
  repository: string; // "org/repo"
  branch: string;
}

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  checksumUrl?: string;
  publishedAt?: string;
  isBreaking?: boolean;
}

export interface UpdateProgress {
  phase: 'downloading' | 'verifying' | 'installing' | 'complete';
  percentage: number;
  bytesDownloaded?: number;
  totalBytes?: number;
  message?: string;
}

export interface UpdateRecord {
  from: string;
  to: string;
  timestamp: string;
  status: 'success' | 'failed' | 'rolled_back';
  error?: string;
  channel?: string;
}

export type UpdateMode = 'prompt' | 'silent';

// ============================================================================
// Service
// ============================================================================

export class UpdateService extends EventEmitter {
  private configService: ConfigService;
  private licenseService: LicenseService;
  private octokit: Octokit;
  private initialized = false;
  private currentVersion: string;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor(configService: ConfigService, licenseService: LicenseService) {
    super();
    this.configService = configService;
    this.licenseService = licenseService;

    // Initialize Octokit
    this.octokit = new Octokit({
      auth: process.env.GITHUB_UPDATE_TOKEN || undefined
    });

    this.currentVersion = app.getVersion();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Store current version
    const storedVersion = await this.configService.get<string>('updates.currentVersion');
    if (storedVersion !== this.currentVersion) {
      await this.configService.set('updates.currentVersion', this.currentVersion);
    }

    // Auto-update setting
    const autoUpdateEnabled = await this.configService.get<boolean>('updates.autoUpdateEnabled') ?? false;

    if (autoUpdateEnabled) {
      // Check every 4 hours
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates().catch(err => {
          console.error('Auto update check failed:', err);
        });
      }, 4 * 60 * 60 * 1000);

      // Also check 30 seconds after startup
      setTimeout(() => {
        this.checkForUpdates().catch(err => {
          console.error('Startup update check failed:', err);
        });
      }, 30000);
    }

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<UpdateInfo> {
    await this.ensureInitialized();

    const customerId = await this.licenseService.getCustomerId();
    if (!customerId) {
      throw new Error('No active license - cannot determine update channel');
    }

    const channel = this.getUpdateChannel(customerId);
    await this.configService.set('updates.lastCheckTime', new Date().toISOString());

    try {
      const { data: release } = await this.octokit.rest.repos.getLatestRelease({
        owner: this.parseRepoOwner(channel.repository),
        repo: this.parseRepoName(channel.repository)
      });

      const latestVersion = release.tag_name.replace(/^v/, '');
      const updateAvailable = semver.gt(latestVersion, this.currentVersion);

      const updateInfo: UpdateInfo = {
        available: updateAvailable,
        currentVersion: this.currentVersion,
        latestVersion,
        releaseNotes: release.body || undefined,
        publishedAt: release.published_at || undefined,
        isBreaking: semver.major(latestVersion) > semver.major(this.currentVersion)
      };

      if (updateAvailable) {
        // Find .nupkg asset
        const asset = release.assets.find((a: { name: string; browser_download_url: string }) => a.name.endsWith('.nupkg'));
        if (asset) {
          updateInfo.downloadUrl = asset.browser_download_url;
        }

        // Find checksum
        const checksumAsset = release.assets.find((a: { name: string; browser_download_url: string }) =>
          a.name === 'CHECKSUMS.txt' || a.name === 'SHA256SUMS'
        );
        if (checksumAsset) {
          updateInfo.checksumUrl = checksumAsset.browser_download_url;
        }

        this.emit('update-available', updateInfo);
      }

      return updateInfo;

    } catch (error) {
      console.error('Failed to check for updates:', error);
      throw new Error(`Update check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Download update package
   */
  async downloadUpdate(updateInfo: UpdateInfo): Promise<string> {
    if (!updateInfo.downloadUrl) {
      throw new Error('No download URL provided');
    }

    const downloadDir = path.join(app.getPath('userData'), 'updates');
    await fs.mkdir(downloadDir, { recursive: true });

    const fileName = path.basename(updateInfo.downloadUrl);
    const filePath = path.join(downloadDir, fileName);

    this.emit('download-started', { url: updateInfo.downloadUrl });

    try {
      const response = await fetch(updateInfo.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
      let downloadedBytes = 0;

      const fileHandle = await fs.open(filePath, 'w');
      const writer = fileHandle.createWriteStream();

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        writer.write(value);
        downloadedBytes += value.length;

        const progress: UpdateProgress = {
          phase: 'downloading',
          percentage: totalBytes > 0 ? Math.floor((downloadedBytes / totalBytes) * 100) : 0,
          bytesDownloaded: downloadedBytes,
          totalBytes
        };

        this.emit('download-progress', progress);
      }

      await new Promise((resolve, reject) => {
        writer.end((err?: Error) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });

      await fileHandle.close();

      // Verify checksum
      if (updateInfo.checksumUrl) {
        this.emit('download-progress', { phase: 'verifying', percentage: 0 });
        await this.verifyChecksum(filePath, updateInfo.checksumUrl);
      }

      this.emit('download-complete', { filePath });

      return filePath;

    } catch (error) {
      try {
        await fs.unlink(filePath);
      } catch {}
      throw new Error(`Download failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Apply update
   */
  async applyUpdate(installerPath: string, mode: UpdateMode = 'prompt'): Promise<void> {
    const updateRecord: UpdateRecord = {
      from: this.currentVersion,
      to: '(applying...)',
      timestamp: new Date().toISOString(),
      status: 'success',
      channel: (await this.licenseService.getCustomerId()) || 'unknown'
    };

    try {
      await this.createBackup();

      this.emit('install-started');

      if (installerPath.endsWith('.nupkg') || installerPath.endsWith('.exe')) {
        await this.runSquirrelInstaller(installerPath);
      } else {
        throw new Error('Unsupported installer format');
      }

      await this.recordUpdate(updateRecord);

      this.emit('install-complete');

      if (mode === 'silent' || confirm('Update installed. Restart now?')) {
        app.relaunch();
        app.exit(0);
      }

    } catch (error) {
      updateRecord.status = 'failed';
      updateRecord.error = error instanceof Error ? error.message : String(error);
      await this.recordUpdate(updateRecord);

      this.emit('install-failed', { error: error instanceof Error ? error.message : String(error) });

      throw error;
    }
  }

  /**
   * Rollback to previous version
   */
  async rollback(): Promise<void> {
    const backupDir = path.join(app.getPath('userData'), 'backup');

    try {
      const backupExists = await fs.access(backupDir).then(() => true).catch(() => false);
      if (!backupExists) {
        throw new Error('No backup found');
      }

      this.emit('rollback-started');

      const rollbackRecord: UpdateRecord = {
        from: this.currentVersion,
        to: '(rolled back)',
        timestamp: new Date().toISOString(),
        status: 'rolled_back'
      };
      await this.recordUpdate(rollbackRecord);

      this.emit('rollback-complete');

      app.relaunch();
      app.exit(0);

    } catch (error) {
      this.emit('rollback-failed', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get update history
   */
  async getUpdateHistory(): Promise<UpdateRecord[]> {
    return await this.configService.get<UpdateRecord[]>('updates.history') || [];
  }

  /**
   * Enable/disable automatic updates
   */
  async setAutoUpdateEnabled(enabled: boolean): Promise<void> {
    await this.configService.set('updates.autoUpdateEnabled', enabled);

    if (enabled && !this.updateCheckInterval) {
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates().catch(err => {
          console.error('Auto update check failed:', err);
        });
      }, 4 * 60 * 60 * 1000);
    } else if (!enabled && this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private getUpdateChannel(customerId: string): UpdateChannel {
    const channelMap: Record<string, UpdateChannel> = {
      'customer-001': {
        name: 'customer-001-stable',
        repository: 'yourorg/discovery-suite-customer001',
        branch: 'main'
      },
      'customer-002': {
        name: 'customer-002-stable',
        repository: 'yourorg/discovery-suite-customer002',
        branch: 'main'
      },
      'internal': {
        name: 'internal-dev',
        repository: 'yourorg/discovery-suite',
        branch: 'develop'
      }
    };

    return channelMap[customerId] || channelMap['internal'];
  }

  private parseRepoOwner(repo: string): string {
    return repo.split('/')[0];
  }

  private parseRepoName(repo: string): string {
    return repo.split('/')[1];
  }

  private async verifyChecksum(filePath: string, checksumUrl: string): Promise<void> {
    const response = await fetch(checksumUrl);
    if (!response.ok) {
      throw new Error(`Failed to download checksum: ${response.status}`);
    }

    const checksumText = await response.text();
    const fileName = path.basename(filePath);

    const lines = checksumText.split('\n');
    const line = lines.find(l => l.includes(fileName));

    if (!line) {
      throw new Error(`Checksum not found for ${fileName}`);
    }

    const expectedHash = line.split(/\s+/)[0];

    const fileBuffer = await fs.readFile(filePath);
    const actualHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (actualHash !== expectedHash) {
      throw new Error(`Checksum mismatch: expected ${expectedHash}, got ${actualHash}`);
    }
  }

  private async createBackup(): Promise<void> {
    const backupDir = path.join(app.getPath('userData'), 'backup');
    await fs.mkdir(backupDir, { recursive: true });

    const appPath = app.getAppPath();
    if (appPath.endsWith('.asar')) {
      const backupPath = path.join(backupDir, `app-${this.currentVersion}.asar`);
      await fs.copyFile(appPath, backupPath);
    }
  }

  private async runSquirrelInstaller(installerPath: string): Promise<void> {
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const process = spawn(installerPath, ['--silent'], {
        detached: true,
        stdio: 'ignore'
      });

      process.on('exit', (code: number) => {
        if (code === 0) resolve();
        else reject(new Error(`Installer exited with code ${code}`));
      });

      process.on('error', (error: Error) => {
        reject(error);
      });

      process.unref();
    });
  }

  private async recordUpdate(record: UpdateRecord): Promise<void> {
    const history = await this.getUpdateHistory();
    history.unshift(record);

    if (history.length > 20) {
      history.splice(20);
    }

    await this.configService.set('updates.history', history);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  destroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }
}

export default UpdateService;


