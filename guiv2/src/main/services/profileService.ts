/**
 * Profile Service
 *
 * Manages company profiles with auto-discovery from C:\DiscoveryData
 * Mirrors C# ProfileService.cs functionality
 *
 * Features:
 * - Auto-discover profiles from C:\DiscoveryData directories
 * - Load/Save profile configurations
 * - Profile CRUD operations
 * - Connection status tracking
 * - Profile data path management
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { CompanyProfile, TargetProfile } from '../../renderer/types/profile';

/**
 * Profile Service configuration
 */
export interface ProfileServiceConfig {
  /** Profiles storage directory */
  profilesDir: string;
  /** Discovery data root directory */
  discoveryDataRoot: string;
  /** Auto-discovery enabled */
  enableAutoDiscovery: boolean;
}

/**
 * Profile Service
 * Manages source and target company profiles
 */
export class ProfileService {
  private config: ProfileServiceConfig;
  private sourceProfiles: CompanyProfile[] = [];
  private targetProfiles: TargetProfile[] = [];
  private profilesFile: string;

  constructor(config?: Partial<ProfileServiceConfig>) {
    this.config = {
      profilesDir: path.join(process.cwd(), 'config', 'profiles'),
      discoveryDataRoot: 'C:\\discoverydata', // lowercase to match actual directory
      enableAutoDiscovery: true,
      ...config,
    };

    this.profilesFile = path.join(this.config.profilesDir, 'profiles.json');
  }

  /**
   * Initialize the profile service
   * Loads existing profiles or creates defaults via auto-discovery
   */
  async initialize(): Promise<void> {
    console.log('[ProfileService] Initializing...');

    // Ensure profiles directory exists
    await fs.mkdir(this.config.profilesDir, { recursive: true });

    // Try to load existing profiles
    const loaded = await this.loadProfilesFromFile();

    if (!loaded && this.config.enableAutoDiscovery) {
      // No existing profiles - run auto-discovery
      console.log('[ProfileService] No existing profiles found, running auto-discovery...');
      await this.autoDiscoverProfiles();
      await this.saveProfilesToFile();
    }

    console.log(`[ProfileService] Initialized with ${this.sourceProfiles.length} source profiles and ${this.targetProfiles.length} target profiles`);
  }

  /**
   * Auto-discover profiles from C:\DiscoveryData directory
   * Mirrors C# ProfileService.CreateDefaultProfiles()
   */
  private async autoDiscoverProfiles(): Promise<void> {
    try {
      // Check if C:\DiscoveryData exists
      const discoveryDataExists = await this.directoryExists(this.config.discoveryDataRoot);
      if (!discoveryDataExists) {
        console.warn(`[ProfileService] Discovery data directory not found: ${this.config.discoveryDataRoot}`);
        return;
      }

      // Get all directories in C:\DiscoveryData
      const entries = await fs.readdir(this.config.discoveryDataRoot, { withFileTypes: true });
      const directories = entries.filter(e => e.isDirectory());

      console.log(`[ProfileService] Found ${directories.length} directories in ${this.config.discoveryDataRoot}`);

      let foundProfiles = false;

      for (const dir of directories) {
        const companyName = dir.name;
        const rawPath = path.join(this.config.discoveryDataRoot, companyName, 'Raw');

        // Check if Raw directory exists and has CSV files
        const hasRawData = await this.hasCSVFiles(rawPath);

        if (hasRawData) {
          console.log(`[ProfileService] Auto-discovered profile: ${companyName}`);

          // Try to load credentials config
          const credentials = await this.loadCredentialsConfig(companyName);

          // Create a source profile for this company
          const profile: CompanyProfile = {
            id: this.generateId(),
            companyName,
            description: `Auto-discovered profile for ${companyName}`,
            domainController: `dc.${companyName.toLowerCase()}.com`,
            domainName: `${companyName.toLowerCase()}.com`,
            tenantId: credentials?.tenantId || '',
            clientId: credentials?.clientId || '',
            clientSecret: credentials?.clientSecret || '',
            environment: 'Production',
            isActive: !foundProfiles, // First profile is active
            createdDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            dataPath: path.join(this.config.discoveryDataRoot, companyName),
          };

          this.sourceProfiles.push(profile);
          foundProfiles = true;
        }
      }

      if (!foundProfiles) {
        console.warn('[ProfileService] No profiles auto-discovered (no directories with Raw/*.csv files found)');
      }
    } catch (error: unknown) {
      console.error('[ProfileService] Auto-discovery failed:', error);
    }
  }

  /**
   * Load credentials config from profile directory
   * Reads discoverycredentials.config for Azure AD connection details
   */
  private async loadCredentialsConfig(companyName: string): Promise<{
    tenantId: string;
    clientId: string;
    clientSecret: string;
  } | null> {
    try {
      const credentialsPath = path.join(
        this.config.discoveryDataRoot,
        companyName,
        'Credentials',
        'discoverycredentials.config'
      );

      const fileExists = await this.fileExists(credentialsPath);
      if (!fileExists) {
        console.log(`[ProfileService] No credentials config found for ${companyName}`);
        return null;
      }

      const data = await fs.readFile(credentialsPath, 'utf-8');
      const config = JSON.parse(data);

      console.log(`[ProfileService] Loaded credentials for ${companyName} (TenantId: ${config.TenantId})`);

      return {
        tenantId: config.TenantId || '',
        clientId: config.ClientId || '',
        clientSecret: config.ClientSecret || '',
      };
    } catch (error: unknown) {
      console.error(`[ProfileService] Failed to load credentials for ${companyName}:`, error);
      return null;
    }
  }

  /**
   * Load profiles from profiles.json file
   */
  private async loadProfilesFromFile(): Promise<boolean> {
    try {
      const fileExists = await this.fileExists(this.profilesFile);
      if (!fileExists) {
        console.log('[ProfileService] No profiles file found');
        return false;
      }

      const data = await fs.readFile(this.profilesFile, 'utf-8');
      const json = JSON.parse(data);

      this.sourceProfiles = json.sourceProfiles || [];
      this.targetProfiles = json.targetProfiles || [];

      console.log(`[ProfileService] Loaded ${this.sourceProfiles.length} source profiles and ${this.targetProfiles.length} target profiles from file`);
      return true;
    } catch (error: unknown) {
      console.error('[ProfileService] Failed to load profiles from file:', error);
      return false;
    }
  }

  /**
   * Save profiles to profiles.json file
   */
  private async saveProfilesToFile(): Promise<void> {
    try {
      const data = {
        sourceProfiles: this.sourceProfiles,
        targetProfiles: this.targetProfiles,
        lastModified: new Date().toISOString(),
      };

      await fs.writeFile(this.profilesFile, JSON.stringify(data, null, 2), 'utf-8');
      console.log('[ProfileService] Profiles saved to file');
    } catch (error: unknown) {
      console.error('[ProfileService] Failed to save profiles to file:', error);
      throw error;
    }
  }

  /**
   * Get all source profiles
   */
  getSourceProfiles(): CompanyProfile[] {
    return [...this.sourceProfiles];
  }

  /**
   * Get all target profiles
   */
  getTargetProfiles(): TargetProfile[] {
    return [...this.targetProfiles];
  }

  /**
   * Get active source profile
   */
  getActiveSourceProfile(): CompanyProfile | null {
    return this.sourceProfiles.find(p => p.isActive) || null;
  }

  /**
   * Get active target profile
   */
  getActiveTargetProfile(): TargetProfile | null {
    return this.targetProfiles.find(p => p.isActive) || null;
  }

  /**
   * Get source profile by ID
   */
  getSourceProfileById(id: string): CompanyProfile | null {
    return this.sourceProfiles.find(p => p.id === id) || null;
  }

  /**
   * Get target profile by ID
   */
  getTargetProfileById(id: string): TargetProfile | null {
    return this.targetProfiles.find(p => p.id === id) || null;
  }

  /**
   * Create a new source profile
   */
  async createSourceProfile(profile: Omit<CompanyProfile, 'id' | 'createdDate' | 'lastModifiedDate'>): Promise<CompanyProfile> {
    const newProfile: CompanyProfile = {
      ...profile,
      id: this.generateId(),
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    this.sourceProfiles.push(newProfile);
    await this.saveProfilesToFile();

    console.log(`[ProfileService] Created source profile: ${newProfile.companyName}`);
    return newProfile;
  }

  /**
   * Create a new target profile
   */
  async createTargetProfile(profile: Omit<TargetProfile, 'id' | 'createdDate' | 'lastModifiedDate'>): Promise<TargetProfile> {
    const newProfile: TargetProfile = {
      ...profile,
      id: this.generateId(),
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };

    this.targetProfiles.push(newProfile);
    await this.saveProfilesToFile();

    console.log(`[ProfileService] Created target profile: ${newProfile.name}`);
    return newProfile;
  }

  /**
   * Update a source profile
   */
  async updateSourceProfile(id: string, updates: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const index = this.sourceProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Source profile not found: ${id}`);
    }

    this.sourceProfiles[index] = {
      ...this.sourceProfiles[index],
      ...updates,
      lastModifiedDate: new Date().toISOString(),
    };

    await this.saveProfilesToFile();

    console.log(`[ProfileService] Updated source profile: ${id}`);
    return this.sourceProfiles[index];
  }

  /**
   * Update a target profile
   */
  async updateTargetProfile(id: string, updates: Partial<TargetProfile>): Promise<TargetProfile> {
    const index = this.targetProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Target profile not found: ${id}`);
    }

    this.targetProfiles[index] = {
      ...this.targetProfiles[index],
      ...updates,
      lastModifiedDate: new Date().toISOString(),
    };

    await this.saveProfilesToFile();

    console.log(`[ProfileService] Updated target profile: ${id}`);
    return this.targetProfiles[index];
  }

  /**
   * Delete a source profile
   */
  async deleteSourceProfile(id: string): Promise<void> {
    const index = this.sourceProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Source profile not found: ${id}`);
    }

    this.sourceProfiles.splice(index, 1);
    await this.saveProfilesToFile();

    console.log(`[ProfileService] Deleted source profile: ${id}`);
  }

  /**
   * Delete a target profile
   */
  async deleteTargetProfile(id: string): Promise<void> {
    const index = this.targetProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Target profile not found: ${id}`);
    }

    this.targetProfiles.splice(index, 1);
    await this.saveProfilesToFile();

    console.log(`[ProfileService] Deleted target profile: ${id}`);
  }

  /**
   * Set active source profile
   */
  async setActiveSourceProfile(id: string): Promise<void> {
    // Deactivate all source profiles
    this.sourceProfiles.forEach(p => p.isActive = false);

    // Activate the selected profile
    const profile = this.sourceProfiles.find(p => p.id === id);
    if (!profile) {
      throw new Error(`Source profile not found: ${id}`);
    }

    profile.isActive = true;
    await this.saveProfilesToFile();

    console.log(`[ProfileService] Set active source profile: ${profile.companyName}`);
  }

  /**
   * Set active target profile
   */
  async setActiveTargetProfile(id: string): Promise<void> {
    // Deactivate all target profiles
    this.targetProfiles.forEach(p => p.isActive = false);

    // Activate the selected profile
    const profile = this.targetProfiles.find(p => p.id === id);
    if (!profile) {
      throw new Error(`Target profile not found: ${id}`);
    }

    profile.isActive = true;
    await this.saveProfilesToFile();

    console.log(`[ProfileService] Set active target profile: ${profile.name}`);
  }

  /**
   * Get profile data path for a source profile
   * Mirrors C# ProfileService.GetProfileDataPath()
   */
  getProfileDataPath(profileId: string): string {
    const profile = this.getSourceProfileById(profileId);
    if (!profile) {
      throw new Error(`Source profile not found: ${profileId}`);
    }

    return profile.dataPath || path.join(this.config.discoveryDataRoot, profile.companyName);
  }

  /**
   * Refresh profiles - re-run auto-discovery
   */
  async refreshProfiles(): Promise<void> {
    console.log('[ProfileService] Refreshing profiles...');

    // Clear existing auto-discovered profiles (keep manually created ones)
    // For now, just re-run auto-discovery without clearing
    await this.autoDiscoverProfiles();
    await this.saveProfilesToFile();

    console.log('[ProfileService] Profiles refreshed');
  }

  /**
   * Helper: Generate a unique ID
   */
  private generateId(): string {
    return `profile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Helper: Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper: Check if directory exists
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Helper: Check if directory has CSV files
   */
  private async hasCSVFiles(dirPath: string): Promise<boolean> {
    try {
      const dirExists = await this.directoryExists(dirPath);
      if (!dirExists) {
        return false;
      }

      const files = await fs.readdir(dirPath);
      return files.some(f => f.toLowerCase().endsWith('.csv'));
    } catch {
      return false;
    }
  }
}

// Singleton instance
let profileServiceInstance: ProfileService | null = null;

/**
 * Get the singleton ProfileService instance
 */
export function getProfileService(): ProfileService {
  if (!profileServiceInstance) {
    profileServiceInstance = new ProfileService();
  }
  return profileServiceInstance;
}

/**
 * Initialize the ProfileService singleton
 */
export async function initializeProfileService(config?: Partial<ProfileServiceConfig>): Promise<ProfileService> {
  if (profileServiceInstance) {
    console.warn('[ProfileService] Already initialized, returning existing instance');
    return profileServiceInstance;
  }

  profileServiceInstance = new ProfileService(config);
  await profileServiceInstance.initialize();
  return profileServiceInstance;
}
