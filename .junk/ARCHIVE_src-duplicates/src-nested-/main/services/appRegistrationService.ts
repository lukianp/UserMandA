/**
 * Azure App Registration Service (Main Process)
 *
 * Handles launching the PowerShell app registration script and
 * monitoring for credential file creation.
 *
 * Mirrors GUI/ RunAppRegistrationCommand pattern from MainViewModel.cs
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import { app } from 'electron';

export interface AppRegistrationOptions {
  companyName: string;
  showWindow?: boolean;
  autoInstallModules?: boolean;
  secretValidityYears?: number;
  skipAzureRoles?: boolean;
}

export interface AppRegistrationResult {
  success: boolean;
  message?: string;
  error?: string;
  processId?: number;
}

export interface CredentialSummary {
  TenantId: string;
  ClientId: string;
  CredentialFile: string;
  Created: string;
  Domain?: string;
}

/**
 * Launches the Azure App Registration PowerShell script
 *
 * Pattern from GUI/MainViewModel.cs:2041-2087 (RunAppRegistrationAsync)
 */
export async function launchAppRegistration(
  options: AppRegistrationOptions
): Promise<AppRegistrationResult> {
  try {
    // Find the PowerShell script
    const scriptPath = findAppRegistrationScript();

    if (!scriptPath || !fs.existsSync(scriptPath)) {
      return {
        success: false,
        error: 'App registration script not found. Expected at Scripts/DiscoveryCreateAppRegistration.ps1'
      };
    }

    // Build PowerShell arguments
    const args = buildPowerShellArgs(scriptPath, options);

    console.log(`[AppRegistrationService] Launching script: ${scriptPath}`);
    console.log(`[AppRegistrationService] Company: ${options.companyName}`);

    if (options.showWindow) {
      // Launch in new window (user-interactive mode)
      const child = spawn('powershell.exe', args, {
        detached: true,
        shell: true,
        stdio: 'ignore',
        windowsHide: false
      });

      child.unref(); // Allow parent to exit

      return {
        success: true,
        message: 'App registration script launched in new window',
        processId: child.pid
      };
    } else {
      // Execute and capture output (automated mode)
      return new Promise((resolve) => {
        const child = spawn('powershell.exe', args, {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: 'App registration completed successfully'
            });
          } else {
            resolve({
              success: false,
              error: stderr || 'App registration script failed',
              message: stdout
            });
          }
        });

        child.on('error', (error) => {
          resolve({
            success: false,
            error: `Failed to launch PowerShell: ${error.message}`
          });
        });
      });
    }
  } catch (error: any) {
    console.error('[AppRegistrationService] Launch failed:', error);
    return {
      success: false,
      error: `Failed to launch app registration: ${error.message}`
    };
  }
}

/**
 * Finds the app registration PowerShell script
 */
function findAppRegistrationScript(): string | null {
  // Try multiple potential locations
  const possiblePaths = [
    // Development mode - from repo root
    path.join(app.getAppPath(), '..', '..', 'Scripts', 'DiscoveryCreateAppRegistration.ps1'),

    // Production mode - bundled in resources
    path.join(process.resourcesPath, 'Scripts', 'DiscoveryCreateAppRegistration.ps1'),

    // Fallback - user's scripts directory
    path.join('D:', 'Scripts', 'UserMandA', 'Scripts', 'DiscoveryCreateAppRegistration.ps1'),

    // Fallback - current working directory
    path.join(process.cwd(), 'Scripts', 'DiscoveryCreateAppRegistration.ps1')
  ];

  for (const scriptPath of possiblePaths) {
    if (fs.existsSync(scriptPath)) {
      console.log(`[AppRegistrationService] Found script at: ${scriptPath}`);
      return scriptPath;
    }
  }

  console.error('[AppRegistrationService] Script not found in any location');
  return null;
}

/**
 * Builds PowerShell command arguments
 */
function buildPowerShellArgs(
  scriptPath: string,
  options: AppRegistrationOptions
): string[] {
  const args = [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', `"${scriptPath}"`,
    '-CompanyName', `"${options.companyName}"`
  ];

  if (options.autoInstallModules) {
    args.push('-AutoInstallModules');
  }

  if (options.secretValidityYears) {
    args.push('-SecretValidityYears', options.secretValidityYears.toString());
  }

  if (options.skipAzureRoles) {
    args.push('-SkipAzureRoles');
  }

  return args;
}

/**
 * Checks if app registration credentials exist for a company
 *
 * Looks for credential_summary.json or discoverycredentials.summary.json
 */
export function hasAppRegistrationCredentials(companyName: string): boolean {
  const credentialsDir = path.join('C:', 'DiscoveryData', companyName, 'Credentials');

  if (!fs.existsSync(credentialsDir)) {
    return false;
  }

  const summaryPaths = [
    path.join(credentialsDir, 'credential_summary.json'),
    path.join(credentialsDir, 'discoverycredentials.summary.json')
  ];

  return summaryPaths.some(p => fs.existsSync(p));
}

/**
 * Reads app registration credential summary
 *
 * Pattern from GUI/Services/TargetProfileService.cs:189-250
 */
export async function readCredentialSummary(
  companyName: string
): Promise<CredentialSummary | null> {
  try {
    const credentialsDir = path.join('C:', 'DiscoveryData', companyName, 'Credentials');

    if (!fs.existsSync(credentialsDir)) {
      return null;
    }

    // Try both possible file names
    let summaryPath = path.join(credentialsDir, 'credential_summary.json');
    if (!fs.existsSync(summaryPath)) {
      summaryPath = path.join(credentialsDir, 'discoverycredentials.summary.json');
      if (!fs.existsSync(summaryPath)) {
        return null;
      }
    }

    const content = await fs.promises.readFile(summaryPath, 'utf8');
    const summary = JSON.parse(content) as CredentialSummary;

    // Ensure credential file path is absolute
    if (summary.CredentialFile && !path.isAbsolute(summary.CredentialFile)) {
      summary.CredentialFile = path.join(credentialsDir, summary.CredentialFile);
    }

    return summary;
  } catch (error: any) {
    console.error(`[AppRegistrationService] Failed to read credential summary:`, error);
    return null;
  }
}

/**
 * Decrypts credential file using PowerShell DPAPI
 *
 * Pattern from GUI/Models/TargetProfile.cs:226-251
 */
export async function decryptCredentialFile(
  credentialFilePath: string
): Promise<string | null> {
  try {
    if (!fs.existsSync(credentialFilePath)) {
      console.error(`[AppRegistrationService] Credential file not found: ${credentialFilePath}`);
      return null;
    }

    // Escape single quotes in file path
    const escapedPath = credentialFilePath.replace(/'/g, "''");

    const script = `
      try {
        $enc = Get-Content -Raw -Path '${escapedPath}'
        $ss = ConvertTo-SecureString -String $enc
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
        $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        $credData = ConvertFrom-Json $json
        Write-Output $credData.ClientSecret
      } catch {
        Write-Error $_.Exception.Message
        exit 1
      }
    `;

    return new Promise((resolve) => {
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-Command', script
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
          console.error(`[AppRegistrationService] Decryption failed:`, stderr);
          resolve(null);
        }
      });

      child.on('error', (error) => {
        console.error(`[AppRegistrationService] PowerShell execution failed:`, error);
        resolve(null);
      });
    });
  } catch (error: any) {
    console.error(`[AppRegistrationService] Decryption error:`, error);
    return null;
  }
}

/**
 * Monitors for app registration credential files
 *
 * Returns a cleanup function to stop monitoring
 */
export function watchForCredentials(
  companyName: string,
  callback: (summary: CredentialSummary) => void,
  options?: {
    pollInterval?: number; // milliseconds
    maxDuration?: number; // milliseconds
  }
): () => void {
  const pollInterval = options?.pollInterval || 5000; // Default: 5 seconds
  const maxDuration = options?.maxDuration || 300000; // Default: 5 minutes

  let intervalHandle: NodeJS.Timeout | null = null;
  let timeoutHandle: NodeJS.Timeout | null = null;
  let stopped = false;

  const checkForCredentials = async () => {
    if (stopped) return;

    const summary = await readCredentialSummary(companyName);
    if (summary) {
      console.log(`[AppRegistrationService] Credentials detected for ${companyName}`);
      cleanup();
      callback(summary);
    }
  };

  const cleanup = () => {
    stopped = true;
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
  };

  // Start polling
  intervalHandle = setInterval(checkForCredentials, pollInterval);

  // Set maximum duration
  if (maxDuration > 0) {
    timeoutHandle = setTimeout(() => {
      console.log(`[AppRegistrationService] Credential watch timeout for ${companyName}`);
      cleanup();
    }, maxDuration);
  }

  // Initial check
  checkForCredentials();

  // Return cleanup function
  return cleanup;
}

export default {
  launchAppRegistration,
  hasAppRegistrationCredentials,
  readCredentialSummary,
  decryptCredentialFile,
  watchForCredentials
};
