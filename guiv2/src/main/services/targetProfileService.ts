/**
 * Target Profile Service (Main Process)
 *
 * Manages target profiles for migration destinations (Azure, Google, AWS, etc.).
 * Handles profile persistence, credential encryption, and profile operations.
 *
 * Pattern from GUI/Services/TargetProfileService.cs
 */

import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

import { app } from 'electron';

export interface TargetProfile {
  id: string;
  name: string;
  companyName: string;
  profileType: 'Azure' | 'Google' | 'AWS' | 'OnPrem';
  sourceProfileId?: string;
  targetEnvironment?: string;
  // Azure-specific fields
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  domain?: string;
  // Connection state
  isConnected?: boolean;
  isActive?: boolean;
  created?: string;
  lastModified?: string;
  createdAt?: string;
}

export interface CreateTargetProfileRequest {
  name: string;
  companyName: string;
  profileType: 'Azure' | 'Google' | 'AWS' | 'OnPrem';
  id?: string;
  sourceProfileId?: string;
  targetEnvironment?: string;
  // Azure-specific fields
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  domain?: string;
}

export interface TargetProfileResult {
  success: boolean;
  profile?: TargetProfile;
  error?: string;
}

/**
 * Get the path to the target profiles storage file
 */
function getTargetProfilesPath(): string {
  const userDataPath = app.getPath('userData');
  const profilesDir = path.join(userDataPath, 'profiles');

  // Ensure directory exists
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }

  return path.join(profilesDir, 'target-profiles.json');
}

/**
 * Load all target profiles from disk
 * Pattern from GUI/Services/TargetProfileService.cs:GetProfilesAsync
 */
export async function loadTargetProfiles(): Promise<TargetProfile[]> {
  try {
    const profilesPath = getTargetProfilesPath();

    if (!fs.existsSync(profilesPath)) {
      console.log('[TargetProfileService] No target profiles file found, returning empty array');
      return [];
    }

    const content = await fs.promises.readFile(profilesPath, 'utf8');
    const profiles = JSON.parse(content) as TargetProfile[];

    console.log(`[TargetProfileService] Loaded ${profiles.length} target profiles`);
    return profiles;
  } catch (error: any) {
    console.error('[TargetProfileService] Failed to load target profiles:', error);
    return [];
  }
}

/**
 * Save all target profiles to disk
 * Pattern from GUI/Services/TargetProfileService.cs:SaveProfilesAsync
 */
async function saveTargetProfiles(profiles: TargetProfile[]): Promise<void> {
  try {
    const profilesPath = getTargetProfilesPath();
    const content = JSON.stringify(profiles, null, 2);

    await fs.promises.writeFile(profilesPath, content, 'utf8');
    console.log(`[TargetProfileService] Saved ${profiles.length} target profiles`);
  } catch (error: any) {
    console.error('[TargetProfileService] Failed to save target profiles:', error);
    throw error;
  }
}

/**
 * Create a new target profile
 * Pattern from GUI/Services/TargetProfileService.cs:CreateProfileAsync
 */
export async function createTargetProfile(
  profileData: CreateTargetProfileRequest
): Promise<TargetProfileResult> {
  try {
    const profiles = await loadTargetProfiles();

    // Check for duplicate names
    const duplicate = profiles.find((p) => p.name === profileData.name);
    if (duplicate) {
      return {
        success: false,
        error: `A target profile with the name "${profileData.name}" already exists`
      };
    }

    // Create new profile
    const newProfile: TargetProfile = {
      ...profileData,
      id: profileData.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isActive: false,
      isConnected: false
    };

    // Encrypt client secret if provided (Azure profiles)
    if (newProfile.clientSecret && newProfile.companyName) {
      const encrypted = await encryptCredential(
        newProfile.companyName,
        newProfile.clientSecret
      );
      if (encrypted) {
        // Store encrypted reference instead of plaintext
        newProfile.clientSecret = `[encrypted:${newProfile.companyName}]`;
      }
    }

    profiles.push(newProfile);
    await saveTargetProfiles(profiles);

    console.log(`[TargetProfileService] Created target profile: ${newProfile.name}`);
    return {
      success: true,
      profile: newProfile
    };
  } catch (error: any) {
    console.error('[TargetProfileService] Failed to create target profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to create target profile'
    };
  }
}

/**
 * Update an existing target profile
 * Pattern from GUI/Services/TargetProfileService.cs:UpdateProfileAsync
 */
export async function updateTargetProfile(
  id: string,
  updates: Partial<TargetProfile>
): Promise<TargetProfileResult> {
  try {
    const profiles = await loadTargetProfiles();
    const index = profiles.findIndex((p) => p.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `Target profile with ID "${id}" not found`
      };
    }

    // Encrypt client secret if being updated
    if (updates.clientSecret && profiles[index].companyName) {
      const encrypted = await encryptCredential(
        profiles[index].companyName,
        updates.clientSecret
      );
      if (encrypted) {
        updates.clientSecret = `[encrypted:${profiles[index].companyName}]`;
      }
    }

    // Update profile
    const updatedProfile: TargetProfile = {
      ...profiles[index],
      ...updates,
      lastModified: new Date().toISOString()
    };

    profiles[index] = updatedProfile;
    await saveTargetProfiles(profiles);

    console.log(`[TargetProfileService] Updated target profile: ${id}`);
    return {
      success: true,
      profile: updatedProfile
    };
  } catch (error: any) {
    console.error('[TargetProfileService] Failed to update target profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to update target profile'
    };
  }
}

/**
 * Delete a target profile
 * Pattern from GUI/Services/TargetProfileService.cs:DeleteProfileAsync
 */
export async function deleteTargetProfile(id: string): Promise<TargetProfileResult> {
  try {
    const profiles = await loadTargetProfiles();
    const index = profiles.findIndex((p) => p.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `Target profile with ID "${id}" not found`
      };
    }

    const deletedProfile = profiles[index];
    profiles.splice(index, 1);
    await saveTargetProfiles(profiles);

    console.log(`[TargetProfileService] Deleted target profile: ${id}`);
    return {
      success: true,
      profile: deletedProfile
    };
  } catch (error: any) {
    console.error('[TargetProfileService] Failed to delete target profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete target profile'
    };
  }
}

/**
 * Set active target profile
 * Pattern from GUI/Services/TargetProfileService.cs:SetCurrentProfileAsync
 */
export async function setActiveTargetProfile(id: string): Promise<TargetProfileResult> {
  try {
    const profiles = await loadTargetProfiles();

    // Deactivate all profiles
    profiles.forEach((p) => {
      p.isActive = false;
    });

    // Activate selected profile
    const profile = profiles.find((p) => p.id === id);
    if (!profile) {
      return {
        success: false,
        error: `Target profile with ID "${id}" not found`
      };
    }

    profile.isActive = true;
    await saveTargetProfiles(profiles);

    console.log(`[TargetProfileService] Set active target profile: ${profile.name}`);
    return {
      success: true,
      profile
    };
  } catch (error: any) {
    console.error('[TargetProfileService] Failed to set active target profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to set active target profile'
    };
  }
}

/**
 * Encrypt credential using Windows DPAPI
 * Pattern from GUI/Models/TargetProfile.cs:EncryptCredentialAsync
 */
async function encryptCredential(
  companyName: string,
  plaintext: string
): Promise<string | null> {
  try {
    const credentialsDir = path.join('C:', 'DiscoveryData', companyName, 'Credentials');

    // Ensure directory exists
    if (!fs.existsSync(credentialsDir)) {
      fs.mkdirSync(credentialsDir, { recursive: true });
    }

    const credentialPath = path.join(credentialsDir, 'target-credential.enc');

    // Escape single quotes in plaintext
    const escapedPlaintext = plaintext.replace(/'/g, "''");

    const script = `
      try {
        $plaintext = '${escapedPlaintext}'
        $ss = ConvertTo-SecureString -String $plaintext -AsPlainText -Force
        $encrypted = ConvertFrom-SecureString -SecureString $ss
        Set-Content -Path '${credentialPath.replace(/'/g, "''")}' -Value $encrypted
        Write-Output "SUCCESS"
      } catch {
        Write-Error $_.Exception.Message
        exit 1
      }
    `;

    return new Promise((resolve) => {
      const child = spawn('powershell.exe', [
        '-NoProfile',
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
        if (code === 0 && stdout.trim() === 'SUCCESS') {
          resolve(credentialPath);
        } else {
          console.error(`[TargetProfileService] Encryption failed:`, stderr);
          resolve(null);
        }
      });

      child.on('error', (error) => {
        console.error(`[TargetProfileService] PowerShell execution failed:`, error);
        resolve(null);
      });
    });
  } catch (error: any) {
    console.error(`[TargetProfileService] Encryption error:`, error);
    return null;
  }
}

/**
 * Decrypt credential using Windows DPAPI
 * Pattern from GUI/Models/TargetProfile.cs:DecryptCredentialAsync
 */
export async function decryptTargetCredential(
  companyName: string
): Promise<string | null> {
  try {
    const credentialPath = path.join(
      'C:',
      'DiscoveryData',
      companyName,
      'Credentials',
      'target-credential.enc'
    );

    if (!fs.existsSync(credentialPath)) {
      console.error(`[TargetProfileService] Credential file not found: ${credentialPath}`);
      return null;
    }

    const escapedPath = credentialPath.replace(/'/g, "''");

    const script = `
      try {
        $encrypted = Get-Content -Path '${escapedPath}' -Raw
        $ss = ConvertTo-SecureString -String $encrypted
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
        $plaintext = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        Write-Output $plaintext
      } catch {
        Write-Error $_.Exception.Message
        exit 1
      }
    `;

    return new Promise((resolve) => {
      const child = spawn('powershell.exe', [
        '-NoProfile',
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
        if (code === 0 && stdout.trim()) {
          resolve(stdout.trim());
        } else {
          console.error(`[TargetProfileService] Decryption failed:`, stderr);
          resolve(null);
        }
      });

      child.on('error', (error) => {
        console.error(`[TargetProfileService] PowerShell execution failed:`, error);
        resolve(null);
      });
    });
  } catch (error: any) {
    console.error(`[TargetProfileService] Decryption error:`, error);
    return null;
  }
}

export default {
  loadTargetProfiles,
  createTargetProfile,
  updateTargetProfile,
  deleteTargetProfile,
  setActiveTargetProfile,
  decryptTargetCredential
};


