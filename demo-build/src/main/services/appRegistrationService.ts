/**
 * Azure App Registration Service (Main Process)
 *
 * Handles launching the PowerShell app registration script and
 * monitoring for credential file creation with real-time progress tracking.
 *
 * Enhanced with:
 * - Real-time PowerShell output parsing
 * - Structured status file updates
 * - Robust credential summary handling
 * - IPC streaming for immediate GUI feedback
 *
 * Mirrors GUI/ RunAppRegistrationCommand pattern from MainViewModel.cs
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { app, BrowserWindow } from 'electron';

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

export interface RegistrationStatus {
  status: 'running' | 'success' | 'failed';
  message: string;
  error: string;
  step: string;
  timestamp: string;
  logFile: string;
  progress?: number;
}

// Registration step IDs matching the GUI
export type RegistrationStepId =
  | 'Initialization'
  | 'Prerequisites'
  | 'ModuleManagement'
  | 'GraphConnection'
  | 'AzureConnection'
  | 'AppRegistration'
  | 'PermissionGrant'
  | 'RoleAssignment'
  | 'SubscriptionAccess'
  | 'SecretCreation'
  | 'CredentialStorage'
  | 'Complete'
  | 'Error';

/**
 * Parsed PowerShell output for real-time status updates
 */
export interface ParsedPowerShellOutput {
  status: 'in_progress' | 'completed' | 'failed';
  step: RegistrationStepId;
  message: string;
  progress: number;
  timestamp: string;
  error?: string;
}

/**
 * Step order for progress calculation
 */
const STEP_ORDER: RegistrationStepId[] = [
  'Initialization',
  'Prerequisites',
  'ModuleManagement',
  'GraphConnection',
  'AzureConnection',
  'AppRegistration',
  'PermissionGrant',
  'RoleAssignment',
  'SubscriptionAccess',
  'SecretCreation',
  'CredentialStorage',
  'Complete',
];

/**
 * Maps PowerShell section names to GUI step IDs
 */
function mapSectionToStep(section: string): RegistrationStepId {
  const sectionMap: Record<string, RegistrationStepId> = {
    'Prerequisites': 'Prerequisites',
    'ModuleManagement': 'ModuleManagement',
    'Module Management': 'ModuleManagement',
    'GraphConnection': 'GraphConnection',
    'Graph Connection': 'GraphConnection',
    'Microsoft Graph': 'GraphConnection',
    'AzureConnection': 'AzureConnection',
    'Azure Connection': 'AzureConnection',
    'Azure Login': 'AzureConnection',
    'AppRegistration': 'AppRegistration',
    'App Registration': 'AppRegistration',
    'Application Registration': 'AppRegistration',
    'PermissionGrant': 'PermissionGrant',
    'Permission Grant': 'PermissionGrant',
    'Admin Consent': 'PermissionGrant',
    'RoleAssignment': 'RoleAssignment',
    'Role Assignment': 'RoleAssignment',
    'Directory Roles': 'RoleAssignment',
    'SubscriptionAccess': 'SubscriptionAccess',
    'Subscription Access': 'SubscriptionAccess',
    'Azure Subscriptions': 'SubscriptionAccess',
    'SecretCreation': 'SecretCreation',
    'Secret Creation': 'SecretCreation',
    'Client Secret': 'SecretCreation',
    'CredentialStorage': 'CredentialStorage',
    'Credential Storage': 'CredentialStorage',
    'Credential Encryption': 'CredentialStorage',
    'Complete': 'Complete',
    'Completed': 'Complete',
    'Success': 'Complete',
  };

  // Try exact match first
  if (sectionMap[section]) {
    return sectionMap[section];
  }

  // Try case-insensitive match
  const lowerSection = section.toLowerCase();
  for (const [key, value] of Object.entries(sectionMap)) {
    if (key.toLowerCase() === lowerSection) {
      return value;
    }
  }

  // Try partial match
  for (const [key, value] of Object.entries(sectionMap)) {
    if (lowerSection.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerSection)) {
      return value;
    }
  }

  return 'Initialization';
}

/**
 * Gets progress percentage for a step
 */
function getStepProgress(step: RegistrationStepId, inProgress = false): number {
  const index = STEP_ORDER.indexOf(step);
  if (index === -1) return 0;

  const baseProgress = Math.round(((index + 1) / STEP_ORDER.length) * 100);
  // Show slightly less progress for in-progress steps
  return inProgress ? Math.max(0, baseProgress - 5) : baseProgress;
}

/**
 * Infers step from a message when no explicit section is provided
 */
function inferStepFromMessage(message: string): RegistrationStepId {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('prerequisite') || lowerMessage.includes('validat')) {
    return 'Prerequisites';
  }
  if (lowerMessage.includes('module') || lowerMessage.includes('install')) {
    return 'ModuleManagement';
  }
  if (lowerMessage.includes('graph') || lowerMessage.includes('microsoft.graph')) {
    return 'GraphConnection';
  }
  if (lowerMessage.includes('azure') && (lowerMessage.includes('connect') || lowerMessage.includes('login'))) {
    return 'AzureConnection';
  }
  if (lowerMessage.includes('app') && lowerMessage.includes('regist')) {
    return 'AppRegistration';
  }
  if (lowerMessage.includes('permission') || lowerMessage.includes('consent')) {
    return 'PermissionGrant';
  }
  if (lowerMessage.includes('role') || lowerMessage.includes('directory')) {
    return 'RoleAssignment';
  }
  if (lowerMessage.includes('subscription')) {
    return 'SubscriptionAccess';
  }
  if (lowerMessage.includes('secret') || lowerMessage.includes('credential')) {
    return 'SecretCreation';
  }
  if (lowerMessage.includes('encrypt') || lowerMessage.includes('storage') || lowerMessage.includes('saving')) {
    return 'CredentialStorage';
  }
  if (lowerMessage.includes('complete') || lowerMessage.includes('success') || lowerMessage.includes('finished')) {
    return 'Complete';
  }

  return 'Initialization';
}

/**
 * Parses PowerShell output line for status updates
 *
 * Handles patterns like:
 * - [COMPLETED] [2025-12-05 16:19:31] [SUCCESS] [OK] ModuleName (?? 35.96s)
 * - [IN PROGRESS] [timestamp] [PROGRESS] message
 * - [FAILED] [timestamp] [ERROR] message
 */
function parsePowerShellOutput(line: string): ParsedPowerShellOutput | null {
  if (!line || line.trim().length === 0) {
    return null;
  }

  // Pattern for completed operations: [COMPLETED] [timestamp] [SUCCESS] [OK] Section (duration)
  const completedPattern = /^\[COMPLETED\]\s+\[([^\]]+)\]\s*\[SUCCESS\]\s*\[OK\]\s*(.+?)\s*(?:\([^)]*?([\d.]+)s\))?$/i;

  // Pattern for in-progress operations: [IN PROGRESS] [timestamp] [PROGRESS] message
  const inProgressPattern = /^\[IN PROGRESS\]\s+\[([^\]]+)\]\s*\[PROGRESS\]\s*(.+)$/i;

  // Pattern for failed operations: [FAILED] [timestamp] [ERROR] message
  const failedPattern = /^\[FAILED\]\s+\[([^\]]+)\]\s*\[(?:ERROR|CRITICAL)\]\s*(.+)$/i;

  // Alternative patterns for simpler output
  const simpleSuccessPattern = /^\[OK\]\s+(.+?)\s*(?:\([^)]*?([\d.]+)s\))?$/i;
  const simpleProgressPattern = /^(?:\[PROGRESS\]|Starting:?)\s*(.+)$/i;
  const simpleErrorPattern = /^(?:\[ERROR\]|\[CRITICAL\]|Error:)\s*(.+)$/i;

  let match;
  const timestamp = new Date().toISOString();

  // Try completed pattern
  if ((match = completedPattern.exec(line))) {
    const [, ts, section, duration] = match;
    const step = mapSectionToStep(section.trim());
    return {
      status: 'completed',
      step,
      message: `${section.trim()} completed${duration ? ` in ${duration}s` : ''}`,
      progress: getStepProgress(step),
      timestamp: ts || timestamp,
    };
  }

  // Try in-progress pattern
  if ((match = inProgressPattern.exec(line))) {
    const [, ts, message] = match;
    const step = inferStepFromMessage(message);
    return {
      status: 'in_progress',
      step,
      message: message.trim(),
      progress: getStepProgress(step, true),
      timestamp: ts || timestamp,
    };
  }

  // Try failed pattern
  if ((match = failedPattern.exec(line))) {
    const [, ts, errorMsg] = match;
    return {
      status: 'failed',
      step: 'Error',
      message: 'Operation failed',
      progress: 0,
      timestamp: ts || timestamp,
      error: errorMsg.trim(),
    };
  }

  // Try simple success pattern
  if ((match = simpleSuccessPattern.exec(line))) {
    const [, section, duration] = match;
    const step = mapSectionToStep(section.trim());
    return {
      status: 'completed',
      step,
      message: `${section.trim()} completed${duration ? ` in ${duration}s` : ''}`,
      progress: getStepProgress(step),
      timestamp,
    };
  }

  // Try simple progress pattern
  if ((match = simpleProgressPattern.exec(line))) {
    const [, message] = match;
    const step = inferStepFromMessage(message);
    return {
      status: 'in_progress',
      step,
      message: message.trim(),
      progress: getStepProgress(step, true),
      timestamp,
    };
  }

  // Try simple error pattern
  if ((match = simpleErrorPattern.exec(line))) {
    const [, errorMsg] = match;
    return {
      status: 'failed',
      step: 'Error',
      message: 'Error occurred',
      progress: 0,
      timestamp,
      error: errorMsg.trim(),
    };
  }

  return null;
}

/**
 * Get the path to the registration status file
 */
function getStatusFilePath(companyName: string): string {
  return path.join('C:', 'DiscoveryData', companyName, 'Logs', 'MandADiscovery_Registration_Log_status.json');
}

/**
 * Writes status to JSON file for GUI polling
 */
async function writeStatusFile(companyName: string, status: ParsedPowerShellOutput): Promise<void> {
  try {
    const statusPath = getStatusFilePath(companyName);
    const dir = path.dirname(statusPath);

    await fs.promises.mkdir(dir, { recursive: true });

    const statusData: RegistrationStatus = {
      status: status.status === 'completed' && status.step === 'Complete' ? 'success' :
              status.status === 'failed' ? 'failed' : 'running',
      message: status.message,
      error: status.error || '',
      step: status.step,
      timestamp: status.timestamp,
      logFile: path.join('C:', 'DiscoveryData', companyName, 'Logs', 'MandADiscovery_Registration_Log.txt'),
      progress: status.progress,
    };

    await fs.promises.writeFile(statusPath, JSON.stringify(statusData, null, 2));
    console.log(`[AppRegistrationService] Status update written: ${status.step} - ${status.message}`);
  } catch (error) {
    console.error('[AppRegistrationService] Failed to write status file:', error);
  }
}

/**
 * Writes initial status file when launching script
 */
async function writeInitialStatus(companyName: string): Promise<void> {
  const initialStatus: ParsedPowerShellOutput = {
    status: 'in_progress',
    step: 'Initialization',
    message: 'Launching PowerShell app registration script...',
    progress: 0,
    timestamp: new Date().toISOString(),
  };
  await writeStatusFile(companyName, initialStatus);
}

/**
 * Broadcasts status update to all renderer windows via IPC
 */
function broadcastStatusUpdate(status: ParsedPowerShellOutput): void {
  try {
    const windows = BrowserWindow.getAllWindows();
    for (const window of windows) {
      if (!window.isDestroyed()) {
        window.webContents.send('app-registration:status-update', status);
      }
    }
  } catch (error) {
    console.error('[AppRegistrationService] Failed to broadcast status:', error);
  }
}

/**
 * Monitors status file for detached PowerShell processes
 * Used when showWindow: true (interactive mode)
 */
function startFileBasedMonitoring(companyName: string): void {
  const statusFilePath = getStatusFilePath(companyName);
  const credentialSummaryPath = path.join('C:', 'DiscoveryData', companyName, 'Credentials', 'credential_summary.json');

  console.log(`[AppRegistrationService] ========================================`);
  console.log(`[AppRegistrationService] Starting file-based status monitoring`);
  console.log(`[AppRegistrationService] Status file: ${statusFilePath}`);
  console.log(`[AppRegistrationService] Credential file: ${credentialSummaryPath}`);
  console.log(`[AppRegistrationService] Poll interval: 1000ms`);
  console.log(`[AppRegistrationService] Max duration: 10 minutes`);
  console.log(`[AppRegistrationService] ========================================`);

  const startTime = Date.now();
  const maxDuration = 10 * 60 * 1000; // 10 minutes timeout
  let lastStatusContent = '';

  const pollInterval = setInterval(async () => {
    try {
      // Check timeout
      const elapsed = Date.now() - startTime;
      if (elapsed > maxDuration) {
        clearInterval(pollInterval);
        console.warn(`[AppRegistrationService] ⚠️ File monitoring timeout after ${Math.round(elapsed / 1000)}s`);

        const timeoutStatus: ParsedPowerShellOutput = {
          status: 'failed',
          step: 'Error',
          message: 'Operation timed out after 10 minutes',
          progress: 50,
          timestamp: new Date().toISOString(),
          error: 'Timeout exceeded'
        };

        await writeStatusFile(companyName, timeoutStatus);
        broadcastStatusUpdate(timeoutStatus);
        return;
      }

      // Check if credentials file exists (completion indicator)
      if (fs.existsSync(credentialSummaryPath)) {
        clearInterval(pollInterval);
        console.log(`[AppRegistrationService] ✅ Credential file detected - registration complete!`);

        const successStatus: ParsedPowerShellOutput = {
          status: 'completed',
          step: 'Complete',
          message: 'App registration completed successfully',
          progress: 100,
          timestamp: new Date().toISOString()
        };

        await writeStatusFile(companyName, successStatus);
        broadcastStatusUpdate(successStatus);
        return;
      }

      // Check status file
      if (fs.existsSync(statusFilePath)) {
        const content = fs.readFileSync(statusFilePath, 'utf-8');

        // Only process if content changed (avoid redundant broadcasts)
        if (content !== lastStatusContent) {
          lastStatusContent = content;

          try {
            const status: RegistrationStatus = JSON.parse(content);

            console.log(`[AppRegistrationService] 📄 Status file update:`, {
              status: status.status,
              step: status.step,
              progress: status.progress,
              message: status.message.substring(0, 50) + '...'
            });

            // Convert to ParsedPowerShellOutput format for broadcasting
            const parsedStatus: ParsedPowerShellOutput = {
              status: status.status === 'success' ? 'completed' :
                      status.status === 'failed' ? 'failed' : 'in_progress',
              step: status.step as RegistrationStepId,
              message: status.message,
              progress: status.progress || 0,
              timestamp: status.timestamp,
              error: status.error
            };

            broadcastStatusUpdate(parsedStatus);

            // Stop monitoring if completed or failed
            if (status.status === 'success' || status.status === 'failed') {
              clearInterval(pollInterval);
              console.log(`[AppRegistrationService] ${status.status === 'success' ? '✅ SUCCESS' : '❌ FAILED'} - monitoring stopped`);
            }
          } catch (parseError) {
            console.warn(`[AppRegistrationService] ⚠️ Failed to parse status file:`, parseError);
          }
        }
      } else {
        // Status file doesn't exist yet - script still initializing
        console.log(`[AppRegistrationService] ⏳ Waiting for status file... (${Math.round(elapsed / 1000)}s elapsed)`);
      }
    } catch (error) {
      console.error(`[AppRegistrationService] ❌ Error in file monitoring:`, error);
    }
  }, 1000); // Poll every 1 second

  console.log(`[AppRegistrationService] File monitoring started (interval: ${pollInterval})`);
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

    // Write initial status
    await writeInitialStatus(options.companyName);

    if (options.showWindow) {
      // Launch in new window (user-interactive mode) with -NoExit to keep window open
      // Use cmd.exe with 'start' to create a visible PowerShell window

      // Build PowerShell script arguments array
      const scriptArgs: string[] = ['-CompanyName', `"${options.companyName}"`];

      if (options.autoInstallModules) {
        scriptArgs.push('-AutoInstallModules');
      }

      if (options.secretValidityYears) {
        scriptArgs.push('-SecretValidityYears', options.secretValidityYears.toString());
      }

      if (options.skipAzureRoles) {
        scriptArgs.push('-SkipAzureRoles');
      }

      // Build cmd.exe arguments array
      // Using 'start' to open new window - first arg is empty title "", second is the program
      const cmdArgs = [
        '/c',  // Run command and terminate
        'start',  // Start a new window
        '""',  // Empty title (required by start command)
        'powershell.exe',
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-NoExit',  // Keep window open after script completes
        '-File',
        `"${scriptPath}"`,  // Quote the path
        ...scriptArgs  // Script arguments already quoted where needed
      ];

      console.log(`[AppRegistrationService] ========================================`);
      console.log(`[AppRegistrationService] LAUNCHING POWERSHELL WINDOW (FILE-BASED MONITORING)`);
      console.log(`[AppRegistrationService] Script path: ${scriptPath}`);
      console.log(`[AppRegistrationService] Cmd args: ${JSON.stringify(cmdArgs)}`);
      console.log(`[AppRegistrationService] ========================================`);

      const child = spawn('cmd.exe', cmdArgs, {
        detached: true,
        stdio: 'ignore',
        windowsHide: false,
        shell: true  // Use shell to properly handle 'start' command
      });

      child.unref(); // Allow parent to exit

      console.log(`[AppRegistrationService] PowerShell window launched, PID: ${child.pid}`);

      // Start file-based status monitoring for detached process
      // The PowerShell script writes to a status file which we poll
      startFileBasedMonitoring(options.companyName);

      return {
        success: true,
        message: 'App registration script launched in new window (file-based monitoring active)',
        processId: child.pid
      };
    } else {
      // Execute and capture output (automated mode) with real-time parsing
      return new Promise((resolve) => {
        const child = spawn('powershell.exe', args, {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });

        let lastStatus: ParsedPowerShellOutput | null = null;
        let outputBuffer = '';
        let errorBuffer = '';

        // Process stdout for real-time status updates
        child.stdout?.on('data', (data) => {
          const chunk = data.toString();
          outputBuffer += chunk;

          // Process line by line
          const lines = chunk.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              const parsed = parsePowerShellOutput(trimmedLine);
              if (parsed) {
                lastStatus = parsed;
                // Write status file and broadcast
                writeStatusFile(options.companyName, parsed);
                broadcastStatusUpdate(parsed);
              }
            }
          }
        });

        // Capture stderr
        child.stderr?.on('data', (data) => {
          const chunk = data.toString();
          errorBuffer += chunk;

          // Check for error patterns
          const lines = chunk.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && (trimmedLine.toLowerCase().includes('error') || trimmedLine.toLowerCase().includes('failed'))) {
              const errorStatus: ParsedPowerShellOutput = {
                status: 'failed',
                step: 'Error',
                message: 'Script error occurred',
                progress: lastStatus?.progress || 0,
                timestamp: new Date().toISOString(),
                error: trimmedLine,
              };
              writeStatusFile(options.companyName, errorStatus);
              broadcastStatusUpdate(errorStatus);
            }
          }
        });

        child.on('close', async (code) => {
          console.log(`[AppRegistrationService] Script exited with code: ${code}`);

          if (code === 0) {
            // Write final success status
            const successStatus: ParsedPowerShellOutput = {
              status: 'completed',
              step: 'Complete',
              message: 'App registration completed successfully',
              progress: 100,
              timestamp: new Date().toISOString(),
            };
            await writeStatusFile(options.companyName, successStatus);
            broadcastStatusUpdate(successStatus);

            resolve({
              success: true,
              message: 'App registration completed successfully'
            });
          } else {
            const errorStatus: ParsedPowerShellOutput = {
              status: 'failed',
              step: 'Error',
              message: `App registration script failed with exit code ${code}`,
              progress: lastStatus?.progress || 0,
              timestamp: new Date().toISOString(),
              error: errorBuffer || lastStatus?.error || `Exit code: ${code}`,
            };
            await writeStatusFile(options.companyName, errorStatus);
            broadcastStatusUpdate(errorStatus);

            resolve({
              success: false,
              error: `App registration script failed with exit code ${code}`,
              message: lastStatus?.message || errorBuffer || 'Unknown error'
            });
          }
        });

        child.on('error', async (error) => {
          const errorStatus: ParsedPowerShellOutput = {
            status: 'failed',
            step: 'Error',
            message: 'Failed to launch PowerShell script',
            progress: 0,
            timestamp: new Date().toISOString(),
            error: error.message,
          };
          await writeStatusFile(options.companyName, errorStatus);
          broadcastStatusUpdate(errorStatus);

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

    // C:\enterprisediscovery location
    path.join('C:', 'enterprisediscovery', 'Scripts', 'DiscoveryCreateAppRegistration.ps1'),

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
    path.join(credentialsDir, 'discoverycredentials.summary.json'),
    path.join(credentialsDir, 'credential-summary.json')
  ];

  return summaryPaths.some(p => fs.existsSync(p));
}

/**
 * Reads app registration credential summary with enhanced error handling
 *
 * Pattern from GUI/Services/TargetProfileService.cs:189-250
 */
export async function readCredentialSummary(
  companyName: string
): Promise<CredentialSummary | null> {
  const possiblePaths = [
    path.join('C:', 'DiscoveryData', companyName, 'Credentials', 'credential_summary.json'),
    path.join('C:', 'DiscoveryData', companyName, 'Credentials', 'discoverycredentials.summary.json'),
    path.join('C:', 'DiscoveryData', companyName, 'Credentials', 'credential-summary.json')
  ];

  let lastError = '';

  for (const summaryPath of possiblePaths) {
    try {
      if (!fs.existsSync(summaryPath)) {
        continue; // Try next path
      }

      console.log(`[AppRegistrationService] Attempting to read summary from: ${summaryPath}`);
      let content = await fs.promises.readFile(summaryPath, 'utf8');

      // Strip BOM (Byte Order Mark) if present - PowerShell often writes UTF-8 with BOM
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }

      if (!content || content.trim().length === 0) {
        lastError = `File exists but is empty: ${summaryPath}`;
        continue;
      }

      let rawSummary: any;
      try {
        rawSummary = JSON.parse(content);
      } catch (parseError: any) {
        lastError = `Invalid JSON in file ${summaryPath}: ${parseError.message}`;
        continue;
      }

      // Validate required fields
      if (!rawSummary.TenantId || !rawSummary.ClientId) {
        lastError = `Missing required fields (TenantId, ClientId) in ${summaryPath}`;
        continue;
      }

      const credentialsDir = path.dirname(summaryPath);

      const summary: CredentialSummary = {
        TenantId: rawSummary.TenantId,
        ClientId: rawSummary.ClientId,
        CredentialFile: rawSummary.CredentialFile,
        Created: rawSummary.Created || rawSummary.CreatedDate || new Date().toISOString(),
        Domain: rawSummary.Domain || ''
      };

      // Ensure credential file path is absolute
      if (summary.CredentialFile && !path.isAbsolute(summary.CredentialFile)) {
        summary.CredentialFile = path.join(credentialsDir, summary.CredentialFile);
      }

      // If no CredentialFile specified, try default locations
      if (!summary.CredentialFile) {
        const defaultCredPaths = [
          path.join(credentialsDir, 'discoverycredentials.config'),
          path.join(credentialsDir, 'credentials.config'),
          path.join(credentialsDir, 'app-credentials.config')
        ];

        for (const defaultPath of defaultCredPaths) {
          if (fs.existsSync(defaultPath)) {
            summary.CredentialFile = defaultPath;
            break;
          }
        }

        if (!summary.CredentialFile) {
          lastError = `No credential file specified and default not found in: ${credentialsDir}`;
          continue;
        }
      }

      // Validate credential file exists
      if (!fs.existsSync(summary.CredentialFile)) {
        lastError = `Credential file not found: ${summary.CredentialFile}`;
        continue;
      }

      console.log(`[AppRegistrationService] Successfully read credential summary from: ${summaryPath}`);
      return summary;

    } catch (error: any) {
      lastError = `Unexpected error reading ${summaryPath}: ${error.message}`;
      continue;
    }
  }

  // If we get here, none of the paths worked
  const errorMsg = lastError || `No credential summary file found in any expected location: ${possiblePaths.join(', ')}`;
  console.error(`[AppRegistrationService] ${errorMsg}`);
  throw new Error(`Failed to read credential summary: ${errorMsg}`);
}

/**
 * Reads credential file - handles both plain JSON and DPAPI encrypted formats
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

    // First try to read as plain JSON
    let content = await fs.promises.readFile(credentialFilePath, 'utf8');

    // Strip BOM (Byte Order Mark) if present - PowerShell often writes UTF-8 with BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    try {
      // Try parsing as plain JSON first
      const credData = JSON.parse(content);
      if (credData.ClientSecret) {
        console.log(`[AppRegistrationService] Read client secret from plain JSON credential file`);
        return credData.ClientSecret;
      }
    } catch {
      // Not valid JSON, try DPAPI decryption
      console.log(`[AppRegistrationService] Credential file is not plain JSON, trying DPAPI decryption`);
    }

    // Fall back to DPAPI decryption for encrypted files
    // Escape single quotes in file path
    const escapedPath = credentialFilePath.replace(/'/g, "''");

    const script = `
      try {
        $enc = (Get-Content -Raw -Path '${escapedPath}').Trim()
        $ss = $enc | ConvertTo-SecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
        $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        $credData = $json | ConvertFrom-Json
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
    console.error(`[AppRegistrationService] Credential read error:`, error);
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

/**
 * Reads the registration status file written by the PowerShell script
 *
 * The script writes status updates to: {LogPath}_status.json
 * This allows the GUI to track progress in real-time
 */
export async function readRegistrationStatus(
  companyName: string
): Promise<RegistrationStatus | null> {
  try {
    const statusPath = path.join(
      'C:',
      'DiscoveryData',
      companyName,
      'Logs',
      'MandADiscovery_Registration_Log_status.json'
    );

    if (!fs.existsSync(statusPath)) {
      return null;
    }

    let content = await fs.promises.readFile(statusPath, 'utf8');

    // Strip BOM (Byte Order Mark) if present - PowerShell often writes UTF-8 with BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    const status = JSON.parse(content) as RegistrationStatus;

    return status;
  } catch (error: any) {
    console.error(`[AppRegistrationService] Failed to read status file:`, error);
    return null;
  }
}

/**
 * Clears the registration status file to prepare for a new run
 */
export async function clearRegistrationStatus(companyName: string): Promise<void> {
  try {
    const statusPath = path.join(
      'C:',
      'DiscoveryData',
      companyName,
      'Logs',
      'MandADiscovery_Registration_Log_status.json'
    );

    if (fs.existsSync(statusPath)) {
      await fs.promises.unlink(statusPath);
      console.log(`[AppRegistrationService] Cleared status file for ${companyName}`);
    }
  } catch (error: any) {
    console.error(`[AppRegistrationService] Failed to clear status file:`, error);
  }
}

export default {
  launchAppRegistration,
  hasAppRegistrationCredentials,
  readCredentialSummary,
  decryptCredentialFile,
  watchForCredentials,
  readRegistrationStatus,
  clearRegistrationStatus
};


