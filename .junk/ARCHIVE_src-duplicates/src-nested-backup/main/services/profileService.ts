import * as path from 'path';
import * as fs from 'fs/promises';

import { app, ipcMain } from 'electron';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { glob } from 'glob';

import { CompanyProfile, ProfileDatabase, ProfileStatistics, ProfileValidationResult, ConnectionConfig } from '@shared/types/profile';

export class ProfileService {
  private db!: Low<ProfileDatabase>;
  private isInitialized = false;
  private readonly profilesPath: string;
  private readonly dataRootPath: string;

  constructor() {
    this.profilesPath = path.join(app.getPath('appData'), 'MandADiscoverySuite', 'profiles.json');
    // Use MANDA_DISCOVERY_PATH env var if set, otherwise default
    this.dataRootPath = process.env.MANDA_DISCOVERY_PATH ||
      (process.platform === 'win32' ? path.join('C:', 'DiscoveryData') : path.join(app.getPath('userData'), 'DiscoveryData'));
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await fs.mkdir(path.dirname(this.profilesPath), { recursive: true });

    const adapter = new JSONFile<ProfileDatabase>(this.profilesPath);
    this.db = new Low(adapter, { profiles: [], version: 1 });

    await this.db.read();
    this.ensureData();
    // Ensure data is initialized after read (file might not exist yet)
    this.db.data = this.db.data || { profiles: [], version: 1 };

    if (!(this.db.data?.profiles?.length ?? 0)) {
      await this.autoDiscoverProfiles();
    }

    this.isInitialized = true;
    this.registerIPCHandlers();
  }

  private registerIPCHandlers(): void {
    ipcMain.handle('profile:getAll', () => this.getProfiles());
    ipcMain.handle('profile:getCurrent', () => this.getCurrentProfile());
    ipcMain.handle('profile:setCurrent', (_, profileId: string) => this.setCurrentProfile(profileId));
    ipcMain.handle('profile:create', (_, profile: Omit<CompanyProfile, 'id' | 'created' | 'lastModified'>) => this.createProfile(profile));
    ipcMain.handle('profile:update', (_, profile: CompanyProfile) => this.updateProfile(profile));
    ipcMain.handle('profile:delete', (_, profileId: string) => this.deleteProfile(profileId));
    ipcMain.handle('profile:import', (_, filePath: string) => this.importProfile(filePath));
    ipcMain.handle('profile:export', (_, profileId: string, filePath: string) => this.exportProfile(profileId, filePath));
    ipcMain.handle('profile:getStats', (_, profileId: string) => this.getProfileStatistics(profileId));
    ipcMain.handle('profile:validate', (_, profile: CompanyProfile) => this.validateProfile(profile));
    ipcMain.handle('profile:getConnectionConfig', (_, profileId: string) => this.getConnectionConfig(profileId));
    ipcMain.handle('profile:setConnectionConfig', (_, profileId: string, config: ConnectionConfig) => this.setConnectionConfig(profileId, config));
  }
  private ensureData(): void {
    // Ensure data is initialized (file might not exist or be corrupted)
    if (!this.db.data) {
      this.db.data = { profiles: [], version: 1 };
    }
    if (!this.db.data.profiles) {
      this.db.data.profiles = [];
    }
    if (!this.db.data.version) {
      this.db.data.version = 1;
    }
  }


  async getProfiles(): Promise<CompanyProfile[]> {
    await this.db.read();
    this.ensureData();
    return [...(this.db.data?.profiles ?? [])].sort((a, b) => a.companyName.localeCompare(b.companyName));
  }

  async getCurrentProfile(): Promise<CompanyProfile | null> {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.isActive) || null;
  }

  async setCurrentProfile(profileId: string): Promise<boolean> {
    await this.db.read();
    this.ensureData();

    const profiles = this.db.data.profiles;
    const targetProfile = profiles.find(p => p.id === profileId || p.companyName === profileId);

    if (!targetProfile) return false;

    // Deactivate all profiles
    profiles.forEach(p => p.isActive = false);

    // Activate target profile
    targetProfile.isActive = true;
    targetProfile.lastModified = new Date().toISOString();

    await this.db.write();

    // Broadcast profile change
    this.broadcastProfileChange();

    return true;
  }

  async createProfile(profileData: Omit<CompanyProfile, 'id' | 'created' | 'lastModified'>): Promise<CompanyProfile> {
    await this.db.read();
    this.ensureData();

    // Validate unique company name
    const existing = this.db.data.profiles.find(p =>
      p.companyName.toLowerCase() === profileData.companyName.toLowerCase()
    );
    if (existing) {
      throw new Error(`Profile with company name "${profileData.companyName}" already exists`);
    }

    const profile: CompanyProfile = {
      ...profileData,
      id: this.generateId(),
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isActive: this.db.data.profiles.length === 0 // First profile is active
    };

    // Create directory structure
    await this.createProfileDirectories(profile.companyName);

    this.db.data.profiles.push(profile);
    await this.db.write();

    if (profile.isActive) {
      this.broadcastProfileChange();
    }

    return profile;
  }

  async updateProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    await this.db.read();
    this.ensureData();

    const index = this.db.data.profiles.findIndex(p => p.id === profile.id);
    if (index === -1) {
      throw new Error(`Profile with ID "${profile.id}" not found`);
    }

    const existing = this.db.data.profiles[index];
    const oldCompanyName = existing.companyName;

    // Check for duplicate company name (excluding self)
    const duplicate = this.db.data.profiles.find(p =>
      p.id !== profile.id && p.companyName.toLowerCase() === profile.companyName.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Profile with company name "${profile.companyName}" already exists`);
    }

    // Update profile
    this.db.data.profiles[index] = {
      ...profile,
      created: existing.created,
      lastModified: new Date().toISOString()
    };

    // Handle company name change - rename directory
    if (oldCompanyName !== profile.companyName) {
      await this.renameProfileDirectory(oldCompanyName, profile.companyName);
    }

    await this.db.write();

    if (profile.isActive) {
      this.broadcastProfileChange();
    }

    return this.db.data.profiles[index];
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    await this.db.read();
    this.ensureData();

    const index = this.db.data.profiles.findIndex(p => p.id === profileId);
    if (index === -1) return false;

    const profile = this.db.data.profiles[index];
    const wasActive = profile.isActive;

    // Remove from database
    this.db.data.profiles.splice(index, 1);

    // Delete directory
    await this.deleteProfileDirectory(profile.companyName);

    // If deleted profile was active, activate first remaining profile
    if (wasActive && this.db.data.profiles.length > 0) {
      this.db.data.profiles[0].isActive = true;
    }

    await this.db.write();

    if (wasActive) {
      this.broadcastProfileChange();
    }

    return true;
  }

  async importProfile(filePath: string): Promise<CompanyProfile> {
    const content = await fs.readFile(filePath, 'utf-8');
    const importedProfile: Partial<CompanyProfile> = JSON.parse(content);

    if (!importedProfile.companyName) {
      throw new Error('Invalid profile file: missing company name');
    }

    // Handle duplicate names
    let companyName = importedProfile.companyName;
    let counter = 1;

    await this.db.read();
    this.ensureData();
    while (this.db.data.profiles.some(p => p.companyName.toLowerCase() === companyName.toLowerCase())) {
      companyName = `${importedProfile.companyName} (${counter})`;
      counter++;
    }

    const profile: Omit<CompanyProfile, 'id' | 'created' | 'lastModified'> = {
      companyName,
      description: importedProfile.description || '',
      domainController: importedProfile.domainController || '',
      tenantId: importedProfile.tenantId || '',
      isActive: false,
      configuration: importedProfile.configuration || {}
    };

    return this.createProfile(profile);
  }

  async exportProfile(profileId: string, filePath: string): Promise<void> {
    const profiles = await this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) {
      throw new Error(`Profile with ID "${profileId}" not found`);
    }

    const exportData = JSON.stringify(profile, null, 2);
    await fs.writeFile(filePath, exportData, 'utf-8');
  }

  async getProfileStatistics(profileId: string): Promise<ProfileStatistics | null> {
    const profiles = await this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) return null;

    const companyPath = this.getCompanyDataPath(profile.companyName);

    const stats: ProfileStatistics = {
      profileId: profile.id,
      companyName: profile.companyName,
      created: profile.created,
      lastModified: profile.lastModified,
      lastDiscoveryRun: await this.getLastDiscoveryRun(companyPath),
      totalDiscoveryRuns: await this.getTotalDiscoveryRuns(companyPath),
      dataSizeBytes: await this.getDirectorySize(companyPath)
    };

    return stats;
  }

  validateProfile(profile: CompanyProfile): ProfileValidationResult {
    const result: ProfileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    if (!profile.companyName?.trim()) {
      result.errors.push('Company name is required');
      result.isValid = false;
    }

    if (profile.companyName && profile.companyName.length > 100) {
      result.errors.push('Company name cannot exceed 100 characters');
      result.isValid = false;
    }

    if (!profile.domainController?.trim()) {
      result.warnings.push('Domain controller is not specified');
    }

    if (!profile.tenantId?.trim()) {
      result.warnings.push('Tenant ID is not specified');
    }

    if (profile.tenantId && !this.isValidGuid(profile.tenantId)) {
      result.warnings.push('Tenant ID should be a valid GUID');
    }

    result.recommendations.push('Consider adding a detailed description for better identification');

    return result;
  }

  getCompanyDataPath(companyName: string): string {
    return path.join(this.dataRootPath, companyName);
  }

  async getConnectionConfig(profileId: string): Promise<ConnectionConfig | null> {
    const profiles = await this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) return null;

    const configPath = path.join(this.getCompanyDataPath(profile.companyName), 'connection.json');

    try {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async setConnectionConfig(profileId: string, config: ConnectionConfig): Promise<void> {
    const profiles = await this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) {
      throw new Error(`Profile with ID "${profileId}" not found`);
    }

    const configPath = path.join(this.getCompanyDataPath(profile.companyName), 'connection.json');
    const content = JSON.stringify(config, null, 2);

    await fs.writeFile(configPath, content, 'utf-8');
  }

  private async autoDiscoverProfiles(): Promise<void> {
    const profiles: CompanyProfile[] = [];

    // Discover from C:\DiscoveryData\*
    try {
      const companyDirs = await fs.readdir(this.dataRootPath);

      for (const dirName of companyDirs) {
        const companyName = dirName;

        // Skip Profiles directory
        if (companyName.toLowerCase() === 'profiles') continue;

        const dir = path.join(this.dataRootPath, dirName);
        const stat = await fs.stat(dir);
        if (!stat.isDirectory()) continue;

        const rawPath = path.join(dir, 'Raw');
        if (await this.hasCSVFiles(rawPath)) {
          profiles.push(this.createDefaultProfile(companyName, profiles.length === 0));
        }
      }

      // Also check C:\DiscoveryData\Profiles\*
      const profilesDir = path.join(this.dataRootPath, 'Profiles');
      const profileDirs = await glob(path.join(profilesDir, '*'));

      for (const dir of profileDirs) {
        const companyName = path.basename(dir);

        if (!profiles.some(p => p.companyName.toLowerCase() === companyName.toLowerCase())) {
          const rawPath = path.join(dir, 'Raw');
          if (await this.hasCSVFiles(rawPath)) {
            profiles.push(this.createDefaultProfile(companyName, profiles.length === 0));
          }
        }
      }

    } catch (error) {
      console.warn('Auto-discovery failed:', error);
    }

    // Create default if none found
    if (!profiles.length) {
      profiles.push(this.createDefaultProfile('Sample Corporation', true));
    }

    this.db.data.profiles = profiles;
    await this.db.write();
  }

  private createDefaultProfile(companyName: string, isActive: boolean): CompanyProfile {
    return {
      id: this.generateId(),
      companyName,
      description: `Auto-discovered profile for ${companyName}`,
      domainController: `dc.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      tenantId: this.generateId(),
      isActive,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      configuration: {}
    };
  }

  private async hasCSVFiles(dirPath: string): Promise<boolean> {
    try {
      // Normalize path for glob (use forward slashes on Windows)
      const normalizedPath = path.join(dirPath, '*.csv').split(path.sep).join('/');
      console.log('[ProfileService] hasCSVFiles checking:', normalizedPath);
      const csvFiles = await glob(normalizedPath);
      console.log('[ProfileService]   Found:', csvFiles.length, 'files');
      return csvFiles.length > 0;
    } catch (error) {
      console.log('[ProfileService] hasCSVFiles error:', error);
      return false;
    }
  }

  private async createProfileDirectories(companyName: string): Promise<void> {
    const basePath = this.getCompanyDataPath(companyName);
    const directories = ['Raw', 'Output', 'Reports', 'Logs'];

    for (const dir of directories) {
      await fs.mkdir(path.join(basePath, dir), { recursive: true });
    }
  }

  private async renameProfileDirectory(oldName: string, newName: string): Promise<void> {
    const oldPath = this.getCompanyDataPath(oldName);
    const newPath = this.getCompanyDataPath(newName);

    try {
      await fs.rename(oldPath, newPath);
    } catch (error) {
      console.warn(`Failed to rename profile directory from ${oldName} to ${newName}:`, error);
    }
  }

  private async deleteProfileDirectory(companyName: string): Promise<void> {
    const dirPath = this.getCompanyDataPath(companyName);

    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to delete profile directory ${companyName}:`, error);
    }
  }

  private async getLastDiscoveryRun(companyPath: string): Promise<string | null> {
    try {
      const csvFiles = await glob(path.join(companyPath, '**', '*.csv'));
      if (!csvFiles.length) return null;

      const mtimes = await Promise.all(
        csvFiles.map(async file => (await fs.stat(file)).mtime)
      );

      return Math.max(...mtimes.map(d => d.getTime())).toString();
    } catch {
      return null;
    }
  }

  private async getTotalDiscoveryRuns(companyPath: string): Promise<number> {
    try {
      const csvFiles = await glob(path.join(companyPath, '**', '*.csv'));
      if (!csvFiles.length) return 0;

      const dates = new Set<string>();

      for (const file of csvFiles) {
        const stat = await fs.stat(file);
        dates.add(stat.mtime.toDateString());
      }

      return dates.size;
    } catch {
      return 0;
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const files = await glob(path.join(dirPath, '**', '*'), { nodir: true });
      let totalSize = 0;

      for (const file of files) {
        const stat = await fs.stat(file);
        totalSize += stat.size;
      }

      return totalSize;
    } catch {
      return 0;
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidGuid(str: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(str);
  }

  private broadcastProfileChange(): void {
    // Broadcast to all renderer processes
    const windows = require('electron').BrowserWindow.getAllWindows();
    windows.forEach(window => {
      window.webContents.send('profile:changed');
    });
  }
}
