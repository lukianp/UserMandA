import * as path from 'path';
import * as fs from 'fs/promises';

import { app, ipcMain } from 'electron';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { glob } from 'glob';

import { CompanyProfile, ProfileDatabase, ProfileStatistics, ProfileValidationResult, ConnectionConfig, DomainCredentialValidationStatus } from '@shared/types/profile';
import { safeStorage } from 'electron';

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

    // Domain credential handlers
    ipcMain.handle('profile:saveDomainCredentials', (_, profileId: string, username: string, password: string) =>
      this.saveDomainCredentials(profileId, username, password));
    ipcMain.handle('profile:clearDomainCredentials', (_, profileId: string) =>
      this.clearDomainCredentials(profileId));
    ipcMain.handle('profile:testDomainCredentials', (_, profileId: string) =>
      this.testDomainCredentials(profileId));
    ipcMain.handle('profile:testDomainCredentialsWithValues', (_, username: string, password: string) =>
      this.testDomainCredentialsWithValues(username, password));
    ipcMain.handle('profile:getDomainCredentialStatus', (_, profileId: string) =>
      this.getDomainCredentialStatus(profileId));

    // Discovery data handlers
    ipcMain.handle('profile:getADDomainFromDiscovery', (_, profileId: string) =>
      this.getADDomainFromDiscovery(profileId));
    ipcMain.handle('profile:getAzureTenantDomain', (_, profileId: string) =>
      this.getAzureTenantDomain(profileId));
    ipcMain.handle('profile:getAzureDataFromDiscovery', (_, profileId: string) =>
      this.getAzureDataFromDiscovery(profileId));
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

  async getProfileById(profileId: string): Promise<CompanyProfile | null> {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === profileId || p.companyName === profileId) || null;
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

  async refreshProfiles(): Promise<void> {
    await this.autoDiscoverProfiles();
  }

  async getSourceProfiles(): Promise<CompanyProfile[]> {
    return this.getProfiles();
  }

  // ========================================
  // Domain Credentials Management
  // ========================================

  /**
   * Save domain credentials for a profile (encrypted)
   * @param profileId - Profile ID
   * @param username - Domain username (DOMAIN\user format)
   * @param passwordPlain - Plaintext password (will be encrypted)
   */
  async saveDomainCredentials(profileId: string, username: string, passwordPlain: string): Promise<void> {
    // Validate encryption availability
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error(
        'Secure credential encryption is not available on this system. ' +
        'Please ensure your system keystore is properly configured.'
      );
    }

    // Validate username format
    const domainUserRegex = /^([^\\]+)\\([^\\]+)$/;
    if (!domainUserRegex.test(username)) {
      throw new Error('Username must be in DOMAIN\\username format (e.g., CONTOSO\\jdoe)');
    }

    // Validate password
    if (!passwordPlain || passwordPlain.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    await this.db.read();
    this.ensureData();

    const profile = this.db.data.profiles.find(p => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile with ID "${profileId}" not found`);
    }

    // Encrypt password
    const encrypted = safeStorage.encryptString(passwordPlain);
    const encryptedBase64 = encrypted.toString('base64');

    // Initialize configuration if needed
    if (!profile.configuration) {
      profile.configuration = {};
    }

    // Store encrypted credentials
    profile.configuration.domainCredentials = {
      username,
      password: encryptedBase64,
      encrypted: true,
      validationStatus: 'unknown',
      lastValidated: new Date().toISOString()
    };

    profile.lastModified = new Date().toISOString();
    await this.db.write();

    console.log(`[ProfileService] Domain credentials saved for profile: ${profileId}, user: ${this.maskUsername(username)}`);
  }

  /**
   * Clear domain credentials for a profile
   * @param profileId - Profile ID
   */
  async clearDomainCredentials(profileId: string): Promise<void> {
    await this.db.read();
    this.ensureData();

    const profile = this.db.data.profiles.find(p => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile with ID "${profileId}" not found`);
    }

    if (profile.configuration?.domainCredentials) {
      delete profile.configuration.domainCredentials;
      profile.lastModified = new Date().toISOString();
      await this.db.write();
      console.log(`[ProfileService] Domain credentials cleared for profile: ${profileId}`);
    }
  }

  /**
   * Get decrypted domain credentials (MAIN PROCESS ONLY - never send to renderer)
   * @param profileId - Profile ID
   * @returns Decrypted credentials or null
   */
  async getDomainCredentialsDecrypted(profileId: string): Promise<{ username: string; password: string } | null> {
    await this.db.read();
    this.ensureData();

    const profile = this.db.data.profiles.find(p => p.id === profileId);
    if (!profile) {
      return null;
    }

    const stored = profile.configuration?.domainCredentials;
    if (!stored?.password || !stored?.username) {
      return null;
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Encryption not available - cannot decrypt credentials');
    }

    try {
      const encryptedBuffer = Buffer.from(stored.password, 'base64');
      const decryptedPassword = safeStorage.decryptString(encryptedBuffer);

      return {
        username: stored.username,
        password: decryptedPassword
      };
    } catch (error) {
      console.error('[ProfileService] Failed to decrypt domain credentials:', error);
      throw new Error('Failed to decrypt credentials - they may be corrupted');
    }
  }

  /**
   * Set domain credential validation status
   * @param profileId - Profile ID
   * @param status - Validation status
   * @param validationError - Optional error message
   */
  async setDomainCredentialValidation(
    profileId: string,
    status: DomainCredentialValidationStatus,
    validationError?: string
  ): Promise<void> {
    await this.db.read();
    this.ensureData();

    const profile = this.db.data.profiles.find(p => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile with ID "${profileId}" not found`);
    }

    const stored = profile.configuration?.domainCredentials;
    if (!stored) {
      throw new Error('No domain credentials found for this profile');
    }

    stored.validationStatus = status;
    stored.validationError = validationError?.slice(0, 500); // Limit error message length
    stored.lastValidated = new Date().toISOString();

    profile.lastModified = new Date().toISOString();
    await this.db.write();

    console.log(`[ProfileService] Domain credential validation updated: ${profileId} -> ${status}`);
  }

  /**
   * Get domain credential status (safe for renderer - no passwords)
   * @param profileId - Profile ID
   * @returns Status information
   */
  async getDomainCredentialStatus(profileId: string): Promise<{
    hasCredentials: boolean;
    username?: string;
    validationStatus?: DomainCredentialValidationStatus;
    lastValidated?: string;
    validationError?: string;
  }> {
    await this.db.read();
    this.ensureData();

    const profile = this.db.data.profiles.find(p => p.id === profileId);
    if (!profile) {
      return { hasCredentials: false };
    }

    const stored = profile.configuration?.domainCredentials;
    if (!stored) {
      return { hasCredentials: false };
    }

    return {
      hasCredentials: true,
      username: stored.username,
      validationStatus: stored.validationStatus || 'unknown',
      lastValidated: stored.lastValidated,
      validationError: stored.validationError
    };
  }

  /**
   * Test domain credentials by attempting AD authentication
   * @param profileId - Profile ID
   * @returns Test result
   */
  async testDomainCredentials(profileId: string): Promise<{
    valid: boolean;
    domain?: string;
    error?: string;
  }> {
    const creds = await this.getDomainCredentialsDecrypted(profileId);

    if (!creds) {
      return { valid: false, error: 'No credentials found' };
    }

    try {
      const result = await this.executePowerShellCredentialTest(creds.username, creds.password);

      // Update validation status
      if (result.valid) {
        await this.setDomainCredentialValidation(profileId, 'valid');
      } else {
        await this.setDomainCredentialValidation(profileId, 'invalid', result.error);
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await this.setDomainCredentialValidation(profileId, 'invalid', errorMsg);
      return { valid: false, error: errorMsg };
    }
  }

  /**
   * Test domain credentials with provided values (without saving first)
   * @param username - Domain username
   * @param password - Plaintext password
   * @returns Test result
   */
  async testDomainCredentialsWithValues(username: string, password: string): Promise<{
    valid: boolean;
    domain?: string;
    error?: string;
  }> {
    console.log('='.repeat(80));
    console.log('[ProfileService] ⚡ testDomainCredentialsWithValues CALLED');
    console.log(`[ProfileService] Testing domain credentials for ${this.maskUsername(username)}`);
    console.log(`[ProfileService] Username length: ${username.length}, Password length: ${password.length}`);
    console.log('='.repeat(80));

    if (!username || !password) {
      console.error('[ProfileService] ❌ Username or password missing');
      return { valid: false, error: 'Username and password are required' };
    }

    // Validate username format
    const domainUserRegex = /^([^\\]+)\\([^\\]+)$/;
    if (!domainUserRegex.test(username)) {
      return { valid: false, error: 'Username must be in DOMAIN\\username format' };
    }

    try {
      const result = await this.executePowerShellCredentialTest(username, password);
      console.log(`[ProfileService] Credential test result: ${result.valid ? 'valid' : 'invalid'}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[ProfileService] Credential test failed:`, errorMsg);
      return { valid: false, error: errorMsg };
    }
  }

  /**
   * Execute PowerShell script to test domain credentials
   * @param username - Domain username
   * @param password - Plaintext password (never logged)
   * @returns Test result
   */
  private async executePowerShellCredentialTest(
    username: string,
    password: string,
    server?: string
  ): Promise<{ valid: boolean; domain?: string; error?: string }> {
    const { spawn } = await import('child_process');

    // Escape single quotes in username/password/server for PowerShell
    const escapedUsername = username.replace(/'/g, "''");
    const escapedPassword = password.replace(/'/g, "''");
    const escapedServer = server?.replace(/'/g, "''") || '';

    // PowerShell script to test credentials (username/password embedded directly)
    const script = `
$ErrorActionPreference = "Stop"
try {
  $Username = '${escapedUsername}'
  $Password = '${escapedPassword}'

  $sec = ConvertTo-SecureString $Password -AsPlainText -Force
  $cred = New-Object System.Management.Automation.PSCredential($Username, $sec)

  # Auto-detect domain from domain-joined machine
  $computerSystem = Get-WmiObject Win32_ComputerSystem
  $domainName = $computerSystem.Domain

  # Try AD module first
  if (Get-Module -ListAvailable -Name ActiveDirectory) {
    Import-Module ActiveDirectory -ErrorAction Stop
    # Only pass -Server if we have a valid domain name
    if ($domainName -and $domainName -ne 'WORKGROUP') {
      $d = Get-ADDomain -Credential $cred -Server $domainName -ErrorAction Stop
      $result = @{ valid = $true; domain = $d.DNSRoot }
    } else {
      # No domain detected, try without server parameter
      $d = Get-ADDomain -Credential $cred -ErrorAction Stop
      $result = @{ valid = $true; domain = $d.DNSRoot }
    }
  }
  else {
    # LDAP bind fallback
    $ldapPath = if ($domainName -and $domainName -ne 'WORKGROUP') { "LDAP://$domainName/RootDSE" } else { "LDAP://RootDSE" }
    $root = New-Object System.DirectoryServices.DirectoryEntry($ldapPath, $Username, $Password)
    $null = $root.Properties["defaultNamingContext"].Value
    $result = @{ valid = $true; domain = $domainName }
  }

  $result | ConvertTo-Json -Depth 6 -Compress
} catch {
  @{ valid = $false; error = $_.Exception.Message } | ConvertTo-Json -Depth 6 -Compress
}
`;

    return new Promise((resolve) => {
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
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
        console.log(`[ProfileService] PowerShell test completed with exit code: ${code}`);
        console.log(`[ProfileService] stdout length: ${stdout.length}`);
        console.log(`[ProfileService] stderr length: ${stderr.length}`);

        if (code !== 0) {
          console.error(`[ProfileService] Credential test failed with exit code: ${code}`);
          console.error(`[ProfileService] stdout: ${stdout}`);
          console.error(`[ProfileService] stderr: ${stderr}`);
          resolve({ valid: false, error: stderr || 'PowerShell execution failed' });
          return;
        }

        console.log(`[ProfileService] Raw PowerShell stdout: ${stdout}`);

        try {
          // Extract JSON from output (may have warnings before it)
          // Look for the last occurrence of {..."} pattern in the output
          const jsonMatch = stdout.match(/\{[^}]*"valid"\s*:\s*(true|false)[^}]*\}/);

          if (!jsonMatch) {
            throw new Error('No JSON result found in output');
          }

          const jsonStr = jsonMatch[0];
          console.log(`[ProfileService] Extracted JSON: ${jsonStr}`);
          const result = JSON.parse(jsonStr);
          console.log(`[ProfileService] Parsed result:`, result);
          resolve(result);
        } catch (error) {
          console.error('[ProfileService] Failed to parse PowerShell output:', error);
          console.error('[ProfileService] Raw stdout was:', stdout);
          console.error('[ProfileService] Raw stderr was:', stderr);
          resolve({ valid: false, error: `Failed to parse test result. Output: ${stdout.substring(0, 200)}` });
        }
      });

      child.on('error', (error) => {
        console.error('[ProfileService] PowerShell process error:', error);
        resolve({ valid: false, error: error.message });
      });
    });
  }

  /**
   * Mask username for safe logging
   * @param username - Domain username to mask
   * @returns Masked username
   */
  private maskUsername(username: string): string {
    if (!username) return '***';
    const parts = username.split('\\');
    if (parts.length === 2) {
      return `${parts[0]}\\***`;
    }
    return '***';
  }

  /**
   * Get AD domain from discovery data
   * @param profileId - Profile ID
   * @returns AD domain if AD discovery has been run, null otherwise
   */
  async getADDomainFromDiscovery(profileId: string): Promise<{ domain: string | null }> {
    try {
      const profile = await this.getProfileById(profileId);
      if (!profile) {
        return { domain: null };
      }

      const companyName = profile.companyName;
      const companyPath = this.getCompanyDataPath(companyName);
      const rawPath = path.join(companyPath, 'Raw');

      // Check if AD discovery CSV files exist
      const adFiles = await glob(path.join(rawPath, '*{ActiveDirectory,AD}*.csv'));

      if (adFiles.length === 0) {
        return { domain: null };
      }

      // Try to extract domain from AD User or AD Domain CSV
      const domainFile = adFiles.find(f => f.includes('User') || f.includes('Domain')) || adFiles[0];

      if (domainFile) {
        try {
          const csvContent = await fs.readFile(domainFile, 'utf-8');
          const lines = csvContent.split('\n').filter(l => l.trim());

          if (lines.length > 1) {
            // Parse header to find domain-related column
            const header = lines[0].toLowerCase();
            const dataRow = lines[1];
            const values = dataRow.split(',');

            // Look for domain in various columns
            const domainIndex = header.split(',').findIndex(h =>
              h.includes('domain') || h.includes('dns')
            );

            if (domainIndex >= 0 && values[domainIndex]) {
              return { domain: values[domainIndex].trim().replace(/"/g, '') };
            }

            // Fallback: extract domain from UserPrincipalName or DN
            const upnIndex = header.split(',').findIndex(h => h.includes('userprincipalname'));
            if (upnIndex >= 0 && values[upnIndex]) {
              const upn = values[upnIndex].trim().replace(/"/g, '');
              const match = upn.match(/@(.+)$/);
              if (match) {
                return { domain: match[1] };
              }
            }
          }
        } catch (error) {
          console.error('[ProfileService] Failed to parse AD domain file:', error);
        }
      }

      return { domain: null };
    } catch (error) {
      console.error('[ProfileService] getADDomainFromDiscovery error:', error);
      return { domain: null };
    }
  }

  /**
   * Get Azure tenant domain from discovery data
   * @param profileId - Profile ID
   * @returns Tenant domain if Azure discovery has been run, null otherwise
   */
  async getAzureTenantDomain(profileId: string): Promise<{ domain: string | null }> {
    try {
      const profile = await this.getProfileById(profileId);
      if (!profile) {
        return { domain: null };
      }

      const companyName = profile.companyName;
      const companyPath = this.getCompanyDataPath(companyName);
      const rawPath = path.join(companyPath, 'Raw');

      // Check if Azure/Entra discovery CSV files exist
      const azureFiles = await glob(path.join(rawPath, '*{EntraID,Azure,AzureAD}*.csv'));

      if (azureFiles.length === 0) {
        return { domain: null };
      }

      // Try to extract tenant domain from EntraID domain CSV
      const domainFile = azureFiles.find(f => f.includes('EntraIDDomain') || f.includes('Domain'));

      if (domainFile) {
        try {
          const csvContent = await fs.readFile(domainFile, 'utf-8');
          const lines = csvContent.split('\n').filter(l => l.trim());

          if (lines.length > 1) {
            // Parse first data row (skip header)
            const dataRow = lines[1];
            const values = dataRow.split(',');

            // Look for domain name (usually first column or contains .onmicrosoft.com)
            const domain = values.find(v => v.includes('.') && !v.includes('@')) || values[0];

            if (domain) {
              return { domain: domain.trim().replace(/"/g, '') };
            }
          }
        } catch (error) {
          console.error('[ProfileService] Failed to parse domain file:', error);
        }
      }

      return { domain: null };
    } catch (error) {
      console.error('[ProfileService] getAzureTenantDomain error:', error);
      return { domain: null };
    }
  }

  /**
   * Get Azure data (domain and tenant ID) from discovery data
   * @param profileId - Profile ID
   * @returns Azure domain and tenant ID if Azure discovery has been run, null otherwise
   */
  async getAzureDataFromDiscovery(profileId: string): Promise<{ domain: string | null; tenantId: string | null }> {
    try {
      const profile = await this.getProfileById(profileId);
      if (!profile) {
        return { domain: null, tenantId: null };
      }

      const companyName = profile.companyName;
      const companyPath = this.getCompanyDataPath(companyName);
      const rawPath = path.join(companyPath, 'Raw');

      // Check if Azure/Entra discovery CSV files exist
      const azureFiles = await glob(path.join(rawPath, '*{EntraID,Azure,AzureAD}*.csv'));

      if (azureFiles.length === 0) {
        return { domain: null, tenantId: null };
      }

      let domain: string | null = null;
      let tenantId: string | null = null;

      // Try to extract tenant domain from EntraID domain CSV
      const domainFile = azureFiles.find(f => f.includes('EntraIDDomain') || f.includes('Domain'));

      if (domainFile) {
        try {
          const csvContent = await fs.readFile(domainFile, 'utf-8');
          const lines = csvContent.split('\n').filter(l => l.trim());

          if (lines.length > 1) {
            // Parse first data row (skip header)
            const dataRow = lines[1];
            const values = dataRow.split(',');

            // Look for domain name (usually first column or contains .onmicrosoft.com)
            const domainValue = values.find(v => v.includes('.') && !v.includes('@')) || values[0];

            if (domainValue) {
              domain = domainValue.trim().replace(/"/g, '');
            }
          }
        } catch (error) {
          console.error('[ProfileService] Failed to parse domain file:', error);
        }
      }

      // Try to extract tenant ID from any Azure CSV file
      const anyAzureFile = azureFiles[0];
      try {
        const csvContent = await fs.readFile(anyAzureFile, 'utf-8');
        const lines = csvContent.split('\n').filter(l => l.trim());

        if (lines.length > 1) {
          // Parse header to find TenantId column
          const header = lines[0].toLowerCase();
          const dataRow = lines[1];
          const values = dataRow.split(',');

          const tenantIdIndex = header.split(',').findIndex(h =>
            h.includes('tenantid') || h.includes('tenant_id')
          );

          if (tenantIdIndex >= 0 && values[tenantIdIndex]) {
            tenantId = values[tenantIdIndex].trim().replace(/"/g, '');
          }
        }
      } catch (error) {
        console.error('[ProfileService] Failed to parse Azure file for tenant ID:', error);
      }

      return { domain, tenantId };
    } catch (error) {
      console.error('[ProfileService] getAzureDataFromDiscovery error:', error);
      return { domain: null, tenantId: null };
    }
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
    windows.forEach((window: any) => {
      window.webContents.send('profile:changed');
    });
  }
}

// Module-level singleton for utility access
let _profileServiceInstance: ProfileService | null = null;

async function getProfileServiceInstance(): Promise<ProfileService> {
  if (!_profileServiceInstance) {
    _profileServiceInstance = new ProfileService();
    await _profileServiceInstance.initialize();
  }
  return _profileServiceInstance;
}

/**
 * Module-level utility function to get a profile by ID
 * Can be used in dynamic imports without needing the class instance
 */
export async function getProfileById(profileId: string): Promise<CompanyProfile | null> {
  const service = await getProfileServiceInstance();
  return service.getProfileById(profileId);
}
