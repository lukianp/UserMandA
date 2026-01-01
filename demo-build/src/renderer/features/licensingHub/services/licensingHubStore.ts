import { LicensingHubState } from '../../../../shared/types/licensing';

export class LicensingHubStore {
  private static instance: LicensingHubStore;

  static getInstance(): LicensingHubStore {
    if (!LicensingHubStore.instance) {
      LicensingHubStore.instance = new LicensingHubStore();
    }
    return LicensingHubStore.instance;
  }

  /**
   * Resolves the licensing hub directory path from company profile
   */
  private async getLicensingHubPath(companyName: string): Promise<string> {
    // Construct path as C:\DiscoveryData\{companyName}\Consolidated\Licensing\
    const dataRoot = process.platform === 'win32' ? 'C:\\DiscoveryData' : `${require('os').homedir()}/DiscoveryData`;
    return `${dataRoot}\\${companyName}\\Consolidated\\Licensing\\`;
  }

  /**
   * Ensures the licensing hub directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await window.electronAPI.fs.mkdir(dirPath);
    } catch (error) {
      // Directory might already exist, ignore error
      console.warn('Directory creation warning:', error);
    }
  }

  /**
   * Reads the licensing hub state from disk
   */
  async loadLicensingHubState(companyName: string): Promise<LicensingHubState> {
    try {
      const hubPath = await this.getLicensingHubPath(companyName);
      const filePath = `${hubPath}LicensingHub.json`;

      // Check if file exists
      const exists = await window.electronAPI.fileExists(filePath);
      if (!exists) {
        // Return default state
        return this.createDefaultState(companyName);
      }

      // Read and parse JSON
      const jsonContent = await window.electronAPI.fs.readFile(filePath, 'utf8');
      const state = JSON.parse(jsonContent) as LicensingHubState;

      // Validate version
      if (state.version !== 1) {
        console.warn('LicensingHub state version mismatch, creating new state');
        return this.createDefaultState(companyName);
      }

      return state;
    } catch (error) {
      console.error('Failed to load licensing hub state:', error);
      return this.createDefaultState(companyName);
    }
  }

  /**
   * Saves the licensing hub state to disk
   */
  async saveLicensingHubState(companyName: string, state: LicensingHubState): Promise<void> {
    try {
      const hubPath = await this.getLicensingHubPath(companyName);
      await this.ensureDirectoryExists(hubPath);

      const filePath = `${hubPath}LicensingHub.json`;
      const backupPath = `${hubPath}LicensingHub.json.bak`;

      // Update last modified timestamp
      state.lastUpdatedAt = new Date().toISOString();

      // Create backup of existing file if it exists
      const exists = await window.electronAPI.fileExists(filePath);
      if (exists) {
        try {
          const existingContent = await window.electronAPI.fs.readFile(filePath, 'utf8');
          await window.electronAPI.fs.writeFile(backupPath, existingContent);
        } catch (backupError) {
          console.warn('Failed to create backup:', backupError);
        }
      }

      // Write the new state
      const jsonContent = JSON.stringify(state, null, 2);
      await window.electronAPI.fs.writeFile(filePath, jsonContent);

    } catch (error) {
      console.error('Failed to save licensing hub state:', error);
      throw new Error(`Failed to save licensing hub state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a default licensing hub state
   */
  private createDefaultState(companyProfileId: string): LicensingHubState {
    return {
      version: 1,
      companyProfileId,
      lastUpdatedAt: new Date().toISOString(),
      vendors: [],
      products: [],
      agreements: [],
      entitlements: [],
      assignments: [],
      consumptions: [],
      effectivePositions: [],
      alerts: [],
      canonicalUsers: [],
      canonicalDevices: [],
      normalizationRules: {
        productAliases: {},
        vendorAliases: {},
      },
    };
  }
}

export const licensingHubStore = LicensingHubStore.getInstance();