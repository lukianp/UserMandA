/**
 * Credential Service
 * Manages secure storage and retrieval of credentials
 * Uses Windows Credential Manager on Windows, Keychain on macOS, libsecret on Linux
 *
 * Credential Precedence (highest to lowest):
 * 1. ENV variables (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET)
 * 2. safeStorage encrypted credentials (secure, modern)
 * 3. Legacy unencrypted discoverycredentials.config (C:\DiscoveryData\{profile}\Credentials)
 *
 * Security Note:
 * Legacy files are UNENCRYPTED - auto-migrates to safeStorage on first load
 */

import { safeStorage , app } from 'electron';
import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import path from 'path';


interface StoredCredential {
  profileId: string;
  username: string;
  encryptedPassword: string;
  domain?: string;
  connectionType: 'ActiveDirectory' | 'AzureAD' | 'Exchange' | 'SharePoint';
  createdAt: string;
  lastUsed?: string;
}

interface CredentialStore {
  credentials: StoredCredential[];
}

// Legacy credential format from C:\DiscoveryData\{profile}\Credentials\discoverycredentials.config
interface LegacyDiscoveryCredential {
  TenantId: string;
  ClientId: string;
  ClientSecret: string;
  ApplicationObjectId?: string;
  ApplicationName?: string;
  ExpiryDate?: string;
  PermissionCount?: number;
  SecretKeyId?: string;
  CreatedDate?: string;
  ScriptVersion?: string;
  ValidityYears?: number;
  AzureRoles?: string;
  AzureSubscriptionCount?: number;
  DaysUntilExpiry?: number;
  AzureADRoles?: string[];
  ComputerName?: string;
  Domain?: string;
  PowerShellVersion?: string;
  CreatedBy?: string;
  CreatedOnComputer?: string;
  RoleAssignmentSuccess?: boolean;
}

export class CredentialService {
  private credentialsPath: string;
  private store: CredentialStore = { credentials: [] };
  private initialized = false;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.credentialsPath = path.join(userDataPath, 'credentials.enc');
  }

  /**
   * Initialize the credential service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Verify encryption is available
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Encryption not available - credentials will not be stored');
      this.initialized = true;
      return;
    }

    try {
      const encryptedData = await fs.readFile(this.credentialsPath);
      const decryptedData = safeStorage.decryptString(encryptedData);
      this.store = JSON.parse(decryptedData);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading credentials:', error);
      }
      this.store = { credentials: [] };
    }

    this.initialized = true;
  }

  /**
   * Store credentials for a profile
   */
  async storeCredential(
    profileId: string,
    username: string,
    password: string,
    connectionType: 'ActiveDirectory' | 'AzureAD' | 'Exchange' | 'SharePoint',
    domain?: string
  ): Promise<void> {
    await this.ensureInitialized();

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Encryption not available - cannot store credentials');
    }

    // Encrypt password
    const encryptedPassword = safeStorage.encryptString(password).toString('base64');

    // Remove existing credential for this profile
    this.store.credentials = this.store.credentials.filter(
      (c) => c.profileId !== profileId
    );

    // Add new credential
    this.store.credentials.push({
      profileId,
      username,
      encryptedPassword,
      domain,
      connectionType,
      createdAt: new Date().toISOString(),
    });

    await this.save();
  }

  /**
   * Retrieve credentials for a profile
   * Follows precedence: ENV > safeStorage > Legacy File
   */
  async getCredential(profileId: string): Promise<{
    username: string;
    password: string;
    domain?: string;
    connectionType: string;
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
  } | null> {
    await this.ensureInitialized();

    // 1. Check ENV variables (highest priority)
    const envCreds = this.getCredentialsFromEnv();
    if (envCreds) {
      console.log(`[CredentialService] Using ENV variables for profile: ${profileId}`);
      return envCreds;
    }

    // 2. Check safeStorage (encrypted, preferred)
    const credential = this.store.credentials.find((c) => c.profileId === profileId);
    if (credential) {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption not available - cannot decrypt credentials');
      }

      try {
        // Decrypt password
        const encryptedBuffer = Buffer.from(credential.encryptedPassword, 'base64');
        const password = safeStorage.decryptString(encryptedBuffer);

        // Update last used
        credential.lastUsed = new Date().toISOString();
        await this.save();

        console.log(`[CredentialService] Using safeStorage credentials for profile: ${profileId}`);
        return {
          username: credential.username,
          password,
          domain: credential.domain,
          connectionType: credential.connectionType,
        };
      } catch (error) {
        console.error('Error decrypting credential:', error);
        throw new Error('Failed to decrypt credential');
      }
    }

    // 3. Check legacy unencrypted file (C:\DiscoveryData\{profile}\Credentials\discoverycredentials.config)
    const legacyCreds = await this.loadLegacyCredentials(profileId);
    if (legacyCreds) {
      console.log(`[CredentialService] Found legacy credentials for profile: ${profileId}`);
      console.warn(`[CredentialService] ⚠️ Legacy credentials are UNENCRYPTED - migrating to safeStorage`);

      // Auto-migrate to safeStorage
      await this.migrateLegacyCredentials(profileId, legacyCreds);

      return {
        username: legacyCreds.ClientId,
        password: legacyCreds.ClientSecret,
        connectionType: 'AzureAD',
        tenantId: legacyCreds.TenantId,
        clientId: legacyCreds.ClientId,
        clientSecret: legacyCreds.ClientSecret,
      };
    }

    console.log(`[CredentialService] No credentials found for profile: ${profileId}`);
    return null;
  }

  /**
   * Load credentials from ENV variables
   */
  private getCredentialsFromEnv(): {
    username: string;
    password: string;
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    connectionType: string;
  } | null {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (tenantId && clientId && clientSecret) {
      return {
        username: clientId,
        password: clientSecret,
        tenantId,
        clientId,
        clientSecret,
        connectionType: 'AzureAD',
      };
    }

    return null;
  }

  /**
   * Load legacy unencrypted credentials from C:\DiscoveryData\{profile}\Credentials\discoverycredentials.config
   */
  private async loadLegacyCredentials(profileId: string): Promise<LegacyDiscoveryCredential | null> {
    try {
      const legacyPath = path.join('C:', 'DiscoveryData', profileId, 'Credentials', 'discoverycredentials.config');
      console.log(`[CredentialService] Checking legacy credentials at: ${legacyPath}`);

      const data = await fs.readFile(legacyPath, 'utf-8');
      const creds = JSON.parse(data) as LegacyDiscoveryCredential;

      // Validate required fields
      if (!creds.TenantId || !creds.ClientId || !creds.ClientSecret) {
        console.warn(`[CredentialService] Legacy credentials missing required fields`);
        return null;
      }

      return creds;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`[CredentialService] Error loading legacy credentials:`, error);
      }
      return null;
    }
  }

  /**
   * Migrate legacy credentials to safeStorage
   */
  private async migrateLegacyCredentials(profileId: string, legacyCreds: LegacyDiscoveryCredential): Promise<void> {
    try {
      console.log(`[CredentialService] Migrating legacy credentials for profile: ${profileId}`);

      await this.storeCredential(
        profileId,
        legacyCreds.ClientId,
        legacyCreds.ClientSecret,
        'AzureAD',
        legacyCreds.Domain
      );

      console.log(`[CredentialService] ✅ Successfully migrated credentials for profile: ${profileId}`);
    } catch (error) {
      console.error(`[CredentialService] Failed to migrate credentials:`, error);
    }
  }

  /**
   * Delete credentials for a profile
   */
  async deleteCredential(profileId: string): Promise<void> {
    await this.ensureInitialized();

    this.store.credentials = this.store.credentials.filter(
      (c) => c.profileId !== profileId
    );

    await this.save();
  }

  /**
   * Check if credentials exist for a profile
   */
  async hasCredential(profileId: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.store.credentials.some((c) => c.profileId === profileId);
  }

  /**
   * List all profiles with stored credentials
   */
  async listProfiles(): Promise<Array<{
    profileId: string;
    username: string;
    connectionType: string;
    createdAt: string;
    lastUsed?: string;
  }>> {
    await this.ensureInitialized();

    return this.store.credentials.map((c) => ({
      profileId: c.profileId,
      username: c.username,
      connectionType: c.connectionType,
      createdAt: c.createdAt,
      lastUsed: c.lastUsed,
    }));
  }

  /**
   * Clear all stored credentials (use with caution)
   */
  async clearAll(): Promise<void> {
    this.store = { credentials: [] };
    await this.save();
  }

  /**
   * Save credentials to disk (encrypted)
   */
  private async save(): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.credentialsPath), { recursive: true });

      // Encrypt entire store
      const data = JSON.stringify(this.store);
      const encryptedData = safeStorage.encryptString(data);

      // Write to disk
      await fs.writeFile(this.credentialsPath, encryptedData);
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw new Error(`Failed to save credentials: ${error}`);
    }
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

export default CredentialService;
