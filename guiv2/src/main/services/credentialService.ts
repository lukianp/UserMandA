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

import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import path from 'path';

import { safeStorage , app } from 'electron';


interface StoredCredential {
  profileId: string;
  username: string;
  encryptedPassword: string;
  domain?: string;
  connectionType: 'ActiveDirectory' | 'AzureAD' | 'Exchange' | 'SharePoint';
  createdAt: string;
  lastUsed?: string;
  // Azure-specific fields (for AzureAD connection type)
  tenantId?: string;
  clientId?: string;
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
    domain?: string,
    tenantId?: string,
    clientId?: string
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
      tenantId,
      clientId,
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

    console.log(`[CredentialService] ========================================`);
    console.log(`[CredentialService] getCredential called for profile: ${profileId}`);
    console.log(`[CredentialService] ========================================`);

    // 1. Check ENV variables (highest priority)
    const envCreds = this.getCredentialsFromEnv();
    if (envCreds) {
      console.log(`[CredentialService] ✅ Using ENV variables for profile: ${profileId}`);
      console.log(`[CredentialService] TenantId: ${envCreds.tenantId?.substring(0, 8)}...`);
      console.log(`[CredentialService] ClientId: ${envCreds.clientId?.substring(0, 8)}...`);
      return envCreds;
    }

    // 2. Check safeStorage (encrypted, preferred)
    const credential = this.store.credentials.find((c) => c.profileId === profileId);
    if (credential) {
      console.log(`[CredentialService] Found safeStorage credentials for profile: ${profileId}`);

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

        console.log(`[CredentialService] ✅ Successfully decrypted safeStorage credentials`);
        console.log(`[CredentialService] Username: ${credential.username}`);
        console.log(`[CredentialService] Connection type: ${credential.connectionType}`);
        console.log(`[CredentialService] TenantId: ${credential.tenantId?.substring(0, 8)}...`);
        console.log(`[CredentialService] ClientId: ${credential.clientId?.substring(0, 8)}...`);

        return {
          username: credential.username,
          password,
          domain: credential.domain,
          connectionType: credential.connectionType,
          tenantId: credential.tenantId,
          clientId: credential.clientId,
          clientSecret: password,
        };
      } catch (error) {
        console.error('[CredentialService] ❌ Error decrypting safeStorage credential:', error);
        throw new Error('Failed to decrypt credential');
      }
    }

    // 3. Check legacy file (C:\DiscoveryData\{profile}\Credentials\discoverycredentials.config)
    console.log(`[CredentialService] No safeStorage credentials found, checking legacy file...`);
    const legacyCreds = await this.loadLegacyCredentials(profileId);

    if (legacyCreds) {
      console.log(`[CredentialService] ✅ Successfully loaded legacy credentials for profile: ${profileId}`);
      console.log(`[CredentialService] TenantId: ${legacyCreds.TenantId?.substring(0, 8)}...`);
      console.log(`[CredentialService] ClientId: ${legacyCreds.ClientId?.substring(0, 8)}...`);
      console.log(`[CredentialService] ClientSecret length: ${legacyCreds.ClientSecret?.length || 0} characters`);
      console.log(`[CredentialService] Domain: ${legacyCreds.Domain || 'N/A'}`);
      console.warn(`[CredentialService] ⚠️ Migrating legacy credentials to safeStorage`);

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

    console.warn(`[CredentialService] ⚠️ No credentials found for profile: ${profileId}`);
    console.warn(`[CredentialService] Checked legacy path: C:\\DiscoveryData\\${profileId}\\Credentials\\discoverycredentials.config`);
    console.log(`[CredentialService] ========================================`);
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
   * Load legacy credentials from C:\DiscoveryData\{profile}\Credentials\discoverycredentials.config
   * Supports both DPAPI-encrypted (default) and unencrypted (legacy) formats
   */
  private async loadLegacyCredentials(profileId: string): Promise<LegacyDiscoveryCredential | null> {
    try {
      const legacyPath = path.join('C:', 'DiscoveryData', profileId, 'Credentials', 'discoverycredentials.config');
      console.log(`[CredentialService] Checking legacy credentials at: ${legacyPath}`);

      // Check if file exists
      try {
        await fs.access(legacyPath);
      } catch {
        return null;
      }

      let data = await fs.readFile(legacyPath, 'utf-8');

      // Strip BOM (Byte Order Mark) if present - PowerShell often adds UTF-8 BOM
      if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1);
      }

      data = data.trim();

      // Try to parse as JSON first (unencrypted legacy format)
      try {
        const creds = JSON.parse(data) as LegacyDiscoveryCredential;

        // Validate required fields
        if (!creds.TenantId || !creds.ClientId || !creds.ClientSecret) {
          console.warn(`[CredentialService] Legacy credentials missing required fields`);
          return null;
        }

        console.log(`[CredentialService] ✅ Loaded unencrypted legacy credentials`);
        return creds;
      } catch (jsonError) {
        // Not JSON - try DPAPI decryption
        console.log(`[CredentialService] File is not JSON, attempting DPAPI decryption...`);
        return await this.decryptLegacyCredentialsDPAPI(legacyPath);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`[CredentialService] Error loading legacy credentials:`, error);
      }
      return null;
    }
  }

  /**
   * Validate credential file format and integrity
   */
  private async validateCredentialFile(filePath: string): Promise<{
    isValid: boolean;
    format: 'plain' | 'dpapi' | 'corrupted';
    details: string;
  }> {
    try {
      const stats = await fs.stat(filePath);
      console.log(`[CredentialService] File size: ${stats.size} bytes, modified: ${stats.mtime}`);

      const content = await fs.readFile(filePath, 'utf-8');
      const trimmed = content.trim();

      // Check for BOM
      const hasBOM = content.charCodeAt(0) === 0xFEFF;
      console.log(`[CredentialService] Has BOM: ${hasBOM}`);

      // Try parsing as JSON first
      try {
        const parsed = JSON.parse(hasBOM ? content.slice(1) : content);
        console.log(`[CredentialService] File is valid JSON with keys: ${Object.keys(parsed).join(', ')}`);
        return { isValid: true, format: 'plain', details: 'Valid JSON format' };
      } catch {
        // Not JSON, assume DPAPI encrypted
        console.log(`[CredentialService] File is not JSON, likely DPAPI encrypted`);
        return { isValid: true, format: 'dpapi', details: 'Non-JSON content, likely DPAPI encrypted' };
      }
    } catch (error) {
      return {
        isValid: false,
        format: 'corrupted',
        details: `File read error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Execute PowerShell script to decrypt credentials
   */
  private async executePowerShellDecryption(script: string, filePath: string): Promise<LegacyDiscoveryCredential | null> {
    const { spawn } = await import('child_process');

    return new Promise((resolve) => {
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy', 'Bypass',
        '-Command',
        script
      ]);

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.error(`[CredentialService] PowerShell exit code: ${code}`);
          console.error(`[CredentialService] stderr: ${stderr}`);
          resolve(null);
          return;
        }

        try {
          const trimmedOutput = stdout.trim();
          console.log(`[CredentialService] PowerShell output length: ${trimmedOutput.length} characters`);

          const creds = JSON.parse(trimmedOutput) as LegacyDiscoveryCredential;

          // Validate required fields
          if (!creds.TenantId || !creds.ClientId || !creds.ClientSecret) {
            console.warn(`[CredentialService] Decrypted credentials missing required fields`);
            console.warn(`[CredentialService] Has TenantId: ${!!creds.TenantId}, Has ClientId: ${!!creds.ClientId}, Has ClientSecret: ${!!creds.ClientSecret}`);
            resolve(null);
            return;
          }

          console.log(`[CredentialService] ✅ Successfully parsed decrypted credentials`);
          console.log(`[CredentialService] ClientSecret length: ${creds.ClientSecret?.length || 0} characters`);
          resolve(creds);
        } catch (error) {
          console.error(`[CredentialService] Failed to parse PowerShell output as JSON:`, error);
          console.error(`[CredentialService] Output was: ${stdout.substring(0, 200)}...`);
          resolve(null);
        }
      });

      child.on('error', (error) => {
        console.error(`[CredentialService] PowerShell process error:`, error);
        resolve(null);
      });
    });
  }

  /**
   * Decrypt DPAPI-encrypted credential file using PowerShell
   * Tries multiple decryption approaches for maximum compatibility
   */
  private async decryptLegacyCredentialsDPAPI(filePath: string): Promise<LegacyDiscoveryCredential | null> {
    try {
      console.log(`[CredentialService] ========================================`);
      console.log(`[CredentialService] Starting DPAPI decryption for: ${filePath}`);
      console.log(`[CredentialService] ========================================`);

      // Validate file first
      const validation = await this.validateCredentialFile(filePath);
      console.log(`[CredentialService] File validation: ${validation.format} - ${validation.details}`);

      if (!validation.isValid) {
        console.error(`[CredentialService] ❌ File validation failed: ${validation.details}`);
        return null;
      }

      const escapedPath = filePath.replace(/\\/g, '\\\\');

      // Define multiple decryption strategies
      const decryptionScripts = [
        {
          name: 'Standard DPAPI SecureString (ConvertTo-SecureString)',
          script: `
            try {
              $enc = (Get-Content -Raw -Path '${escapedPath}').Trim()
              if ($enc[0] -eq [char]0xFEFF) { $enc = $enc.Substring(1) }
              $ss = $enc | ConvertTo-SecureString
              $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
              $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
              [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
              Write-Output $json
            } catch {
              Write-Error $_.Exception.Message
              exit 1
            }
          `
        },
        {
          name: 'DPAPI ProtectedData.Unprotect (Base64)',
          script: `
            try {
              Add-Type -AssemblyName System.Security
              $encContent = (Get-Content -Raw -Path '${escapedPath}').Trim()
              if ($encContent[0] -eq [char]0xFEFF) { $encContent = $encContent.Substring(1) }

              $encryptedBytes = [System.Convert]::FromBase64String($encContent)
              $decryptedBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
                $encryptedBytes,
                $null,
                [System.Security.Cryptography.DataProtectionScope]::CurrentUser
              )
              $json = [System.Text.Encoding]::UTF8.GetString($decryptedBytes)
              Write-Output $json
            } catch {
              Write-Error $_.Exception.Message
              exit 1
            }
          `
        },
        {
          name: 'Check if already plain JSON',
          script: `
            try {
              $content = (Get-Content -Raw -Path '${escapedPath}').Trim()
              if ($content[0] -eq [char]0xFEFF) { $content = $content.Substring(1) }

              if ($content -match '^\\s*[{\\[]') {
                Write-Output $content
              } else {
                Write-Error "Not plain JSON"
                exit 1
              }
            } catch {
              Write-Error $_.Exception.Message
              exit 1
            }
          `
        },
        {
          name: 'Hybrid approach (try DPAPI, fallback to plain)',
          script: `
            try {
              $content = (Get-Content -Raw -Path '${escapedPath}').Trim()
              if ($content[0] -eq [char]0xFEFF) { $content = $content.Substring(1) }

              # Check if it's plain JSON first
              if ($content -match '^\\s*[{\\[]') {
                Write-Output $content
              } else {
                # Try DPAPI decryption
                try {
                  $ss = $content | ConvertTo-SecureString -ErrorAction Stop
                  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
                  $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
                  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
                  Write-Output $json
                } catch {
                  # Try Base64 DPAPI
                  Add-Type -AssemblyName System.Security
                  $encryptedBytes = [System.Convert]::FromBase64String($content)
                  $decryptedBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
                    $encryptedBytes,
                    $null,
                    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
                  )
                  $json = [System.Text.Encoding]::UTF8.GetString($decryptedBytes)
                  Write-Output $json
                }
              }
            } catch {
              Write-Error $_.Exception.Message
              exit 1
            }
          `
        }
      ];

      // Try each decryption approach in order
      for (const [index, approach] of decryptionScripts.entries()) {
        console.log(`[CredentialService] ----------------------------------------`);
        console.log(`[CredentialService] Trying approach ${index + 1}/${decryptionScripts.length}: ${approach.name}`);
        console.log(`[CredentialService] ----------------------------------------`);

        try {
          const result = await this.executePowerShellDecryption(approach.script, filePath);
          if (result) {
            console.log(`[CredentialService] ✅ Decryption approach ${index + 1} succeeded: ${approach.name}`);
            console.log(`[CredentialService] ========================================`);
            return result;
          } else {
            console.warn(`[CredentialService] ⚠️ Approach ${index + 1} returned null: ${approach.name}`);
          }
        } catch (error) {
          console.warn(`[CredentialService] ⚠️ Approach ${index + 1} failed: ${approach.name}`, error);
        }
      }

      console.error(`[CredentialService] ❌ All ${decryptionScripts.length} DPAPI decryption approaches failed`);
      console.log(`[CredentialService] ========================================`);
      return null;
    } catch (error) {
      console.error(`[CredentialService] ❌ Error in DPAPI decryption:`, error);
      return null;
    }
  }

  /**
   * Migrate legacy credentials to safeStorage with backup
   */
  private async migrateLegacyCredentials(profileId: string, legacyCreds: LegacyDiscoveryCredential): Promise<void> {
    try {
      console.log(`[CredentialService] ========================================`);
      console.log(`[CredentialService] Starting credential migration for profile: ${profileId}`);
      console.log(`[CredentialService] ========================================`);

      // Validate credentials before migration
      if (!legacyCreds.TenantId || !legacyCreds.ClientId || !legacyCreds.ClientSecret) {
        const missing = [];
        if (!legacyCreds.TenantId) missing.push('TenantId');
        if (!legacyCreds.ClientId) missing.push('ClientId');
        if (!legacyCreds.ClientSecret) missing.push('ClientSecret');
        throw new Error(`Legacy credentials missing required fields: ${missing.join(', ')}`);
      }

      console.log(`[CredentialService] Validation passed - all required fields present`);
      console.log(`[CredentialService] TenantId: ${legacyCreds.TenantId.substring(0, 8)}...`);
      console.log(`[CredentialService] ClientId: ${legacyCreds.ClientId.substring(0, 8)}...`);
      console.log(`[CredentialService] ClientSecret length: ${legacyCreds.ClientSecret.length} characters`);

      // Store in safeStorage
      await this.storeCredential(
        profileId,
        legacyCreds.ClientId,
        legacyCreds.ClientSecret,
        'AzureAD',
        legacyCreds.Domain,
        legacyCreds.TenantId,
        legacyCreds.ClientId
      );

      console.log(`[CredentialService] ✅ Credentials stored in safeStorage`);

      // Backup original file
      try {
        const legacyPath = path.join('C:', 'DiscoveryData', profileId, 'Credentials', 'discoverycredentials.config');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${legacyPath}.migrated.${timestamp}`;

        await fs.copyFile(legacyPath, backupPath);
        console.log(`[CredentialService] ✅ Backed up original credentials to: ${backupPath}`);
      } catch (backupError) {
        console.warn(`[CredentialService] ⚠️ Failed to backup original file (non-fatal):`, backupError);
      }

      console.log(`[CredentialService] ✅ Successfully migrated credentials for profile: ${profileId}`);
      console.log(`[CredentialService] ========================================`);
    } catch (error) {
      console.error(`[CredentialService] ❌ Migration failed:`, error);
      console.error(`[CredentialService] Error details:`, error instanceof Error ? error.message : String(error));
      console.log(`[CredentialService] ========================================`);
      throw new Error(`Failed to migrate credentials: ${error instanceof Error ? error.message : String(error)}`);
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
   * Checks all sources: ENV, safeStorage, and legacy files
   */
  async hasCredential(profileId: string): Promise<boolean> {
    await this.ensureInitialized();

    // Check ENV variables
    if (this.getCredentialsFromEnv()) {
      return true;
    }

    // Check safeStorage
    if (this.store.credentials.some((c) => c.profileId === profileId)) {
      return true;
    }

    // Check legacy file
    const legacyCreds = await this.loadLegacyCredentials(profileId);
    return legacyCreds !== null;
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
   * Validate credential structure for Azure AD
   * Ensures all required fields are present and valid
   */
  validateCredentialStructure(creds: any): boolean {
    console.log('[CredentialService] Validating credential structure');

    if (!creds) {
      console.error('[CredentialService] ❌ Credentials object is null/undefined');
      return false;
    }

    // Check TenantId
    if (!creds.TenantId || typeof creds.TenantId !== 'string') {
      console.error('[CredentialService] ❌ TenantId missing or invalid');
      return false;
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creds.TenantId)) {
      console.error('[CredentialService] ❌ TenantId is not a valid GUID');
      return false;
    }

    // Check ClientId
    if (!creds.ClientId || typeof creds.ClientId !== 'string') {
      console.error('[CredentialService] ❌ ClientId missing or invalid');
      return false;
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creds.ClientId)) {
      console.error('[CredentialService] ❌ ClientId is not a valid GUID');
      return false;
    }

    // Check ClientSecret
    if (!creds.ClientSecret || typeof creds.ClientSecret !== 'string') {
      console.error('[CredentialService] ❌ ClientSecret missing or invalid');
      return false;
    }

    if (creds.ClientSecret.length < 8) {
      console.error('[CredentialService] ❌ ClientSecret too short (minimum 8 characters)');
      return false;
    }

    console.log('[CredentialService] ✅ Credential structure is valid');
    console.log(`[CredentialService]   TenantId: ${creds.TenantId.substring(0, 8)}...`);
    console.log(`[CredentialService]   ClientId: ${creds.ClientId.substring(0, 8)}...`);
    console.log(`[CredentialService]   ClientSecret length: ${creds.ClientSecret.length} chars`);

    return true;
  }

  /**
   * Test Azure AD connection with credentials
   * Returns detailed result including decryption status and Graph API connectivity
   */
  async testConnection(profileId: string): Promise<{
    success: boolean;
    decryptionSuccess: boolean;
    connectionSuccess: boolean;
    details?: string;
    error?: string;
  }> {
    console.log(`[CredentialService] ========================================`);
    console.log(`[CredentialService] Testing connection for profile: ${profileId}`);
    console.log(`[CredentialService] ========================================`);

    try {
      // Step 1: Try to get credentials
      console.log('[CredentialService] Step 1: Retrieving credentials');
      const creds = await this.getCredential(profileId);

      if (!creds) {
        console.error('[CredentialService] ❌ No credentials found');
        return {
          success: false,
          decryptionSuccess: false,
          connectionSuccess: false,
          error: 'No credentials found for this profile'
        };
      }

      console.log('[CredentialService] ✅ Credentials retrieved successfully');

      // Step 2: Validate credential structure
      console.log('[CredentialService] Step 2: Validating credential structure');
      const legacyCreds = await this.loadLegacyCredentials(profileId);
      if (legacyCreds && !this.validateCredentialStructure(legacyCreds)) {
        console.error('[CredentialService] ❌ Credential structure validation failed');
        return {
          success: false,
          decryptionSuccess: true,
          connectionSuccess: false,
          error: 'Invalid credential structure - missing required fields or invalid format'
        };
      }

      console.log('[CredentialService] ✅ Credential structure valid');

      // Step 3: Test Graph API connection
      console.log('[CredentialService] Step 3: Testing Microsoft Graph API connection');

      // Ensure all required Azure AD fields are available
      const { tenantId, clientId, clientSecret } = creds;
      if (!tenantId || !clientId || !clientSecret) {
        console.error('[CredentialService] ❌ Missing required Azure AD credentials');
        return {
          success: false,
          decryptionSuccess: true,
          connectionSuccess: false,
          error: 'Missing required Azure AD credentials (tenantId, clientId, or clientSecret)'
        };
      }

      const testResult = await this.testGraphAPIConnection(tenantId, clientId, clientSecret);

      if (testResult.success) {
        console.log('[CredentialService] ✅ Graph API connection successful');
        const expiresIn = testResult.expiresIn ?? 3600; // Default to 1 hour if not provided
        console.log(`[CredentialService] Token expires in: ${expiresIn} seconds`);
        console.log(`[CredentialService] ========================================`);
        return {
          success: true,
          decryptionSuccess: true,
          connectionSuccess: true,
          details: `Authentication successful. Token valid for ${Math.floor(expiresIn / 60)} minutes.`
        };
      } else {
        console.error('[CredentialService] ❌ Graph API connection failed');
        console.error(`[CredentialService] Error: ${testResult.error}`);
        console.log(`[CredentialService] ========================================`);
        return {
          success: false,
          decryptionSuccess: true,
          connectionSuccess: false,
          error: testResult.error
        };
      }
    } catch (error) {
      console.error('[CredentialService] ❌ Connection test failed with exception:', error);
      console.log(`[CredentialService] ========================================`);
      return {
        success: false,
        decryptionSuccess: false,
        connectionSuccess: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test Microsoft Graph API connection by requesting an OAuth2 token
   */
  private async testGraphAPIConnection(
    tenantId: string,
    clientId: string,
    clientSecret: string
  ): Promise<{ success: boolean; expiresIn?: number; error?: string }> {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default'
      });

      console.log(`[CredentialService] Requesting token from: ${tokenUrl}`);

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CredentialService] Token request failed: ${response.status} ${response.statusText}`);
        console.error(`[CredentialService] Response: ${errorText}`);

        // Parse Azure AD error if available
        try {
          const errorJson = JSON.parse(errorText);
          return {
            success: false,
            error: `Azure AD authentication failed: ${errorJson.error_description || errorJson.error || 'Unknown error'}`
          };
        } catch {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }
      }

      const tokenData = await response.json();
      console.log(`[CredentialService] Token acquired successfully`);

      return {
        success: true,
        expiresIn: tokenData.expires_in || 3600
      };
    } catch (error) {
      console.error('[CredentialService] Exception during Graph API test:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during authentication'
      };
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
