/**
 * Credential Service
 * Manages secure storage and retrieval of credentials
 * Uses Windows Credential Manager on Windows, Keychain on macOS, libsecret on Linux
 */

import { safeStorage } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import { app } from 'electron';

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
   */
  async getCredential(profileId: string): Promise<{
    username: string;
    password: string;
    domain?: string;
    connectionType: string;
  } | null> {
    await this.ensureInitialized();

    const credential = this.store.credentials.find((c) => c.profileId === profileId);
    if (!credential) {
      return null;
    }

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
