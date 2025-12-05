/**
 * App Registration Hook
 *
 * Provides functionality for Azure App Registration setup including:
 * - Launching the PowerShell app registration script
 * - Monitoring for credential file creation
 * - Auto-importing credentials into profiles
 *
 * Pattern from GUI/MainViewModel.cs:2041-2087 (RunAppRegistrationAsync)
 */

import { useState, useCallback, useRef } from 'react';

import { useProfileStore } from '../store/useProfileStore';
import type { TargetProfile } from '../types/models/profile';

export interface AppRegistrationOptions {
  companyName: string;
  showWindow?: boolean;
  autoInstallModules?: boolean;
  secretValidityYears?: number;
  skipAzureRoles?: boolean;
}

// Registration steps in order
export const REGISTRATION_STEPS = [
  { id: 'Initialization', label: 'Initializing', description: 'Setting up script environment' },
  { id: 'Prerequisites', label: 'Prerequisites', description: 'Validating system requirements' },
  { id: 'ModuleManagement', label: 'Modules', description: 'Loading PowerShell modules' },
  { id: 'GraphConnection', label: 'Graph Connection', description: 'Connecting to Microsoft Graph' },
  { id: 'AzureConnection', label: 'Azure Connection', description: 'Connecting to Azure' },
  { id: 'AppRegistration', label: 'App Registration', description: 'Creating Azure AD application' },
  { id: 'PermissionGrant', label: 'Permissions', description: 'Granting admin consent' },
  { id: 'RoleAssignment', label: 'Role Assignment', description: 'Assigning directory roles' },
  { id: 'SubscriptionAccess', label: 'Subscriptions', description: 'Configuring subscription access' },
  { id: 'SecretCreation', label: 'Secret', description: 'Creating client secret' },
  { id: 'CredentialStorage', label: 'Storage', description: 'Saving encrypted credentials' },
  { id: 'Complete', label: 'Complete', description: 'Registration complete' },
] as const;

export type RegistrationStepId = typeof REGISTRATION_STEPS[number]['id'];

export interface RegistrationStatus {
  status: 'running' | 'success' | 'failed';
  message: string;
  error: string;
  step: string;
  timestamp: string;
  logFile: string;
}

export interface AppRegistrationState {
  isRunning: boolean;
  isMonitoring: boolean;
  progress: string;
  error: string | null;
  success: boolean;
  currentStep: RegistrationStepId | null;
  registrationStatus: RegistrationStatus | null;
}

/**
 * Hook for managing Azure App Registration workflow
 */
export function useAppRegistration() {
  const [state, setState] = useState<AppRegistrationState>({
    isRunning: false,
    isMonitoring: false,
    progress: '',
    error: null,
    success: false,
    currentStep: null,
    registrationStatus: null,
  });

  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addTargetProfile, updateTargetProfile } = useProfileStore();

  /**
   * Starts monitoring for credential files and status updates
   */
  const startMonitoring = useCallback(async (companyName: string) => {
    setState(prev => ({
      ...prev,
      isMonitoring: true,
      progress: 'Waiting for app registration to complete...',
      currentStep: 'Initialization',
    }));

    const startTime = Date.now();
    const maxDuration = 10 * 60 * 1000; // 10 minutes (increased for module loading)
    const pollInterval = 500; // 500ms for snappy UI updates through each step

    monitorIntervalRef.current = setInterval(async () => {
      try {
        // Check status file and credentials in parallel for faster updates
        const [status, hasCredentials] = await Promise.all([
          window.electronAPI.appRegistration.readStatus(companyName),
          window.electronAPI.appRegistration.hasCredentials(companyName)
        ]);

        if (status) {
          // Update state with current step and status
          setState(prev => ({
            ...prev,
            currentStep: status.step as RegistrationStepId,
            registrationStatus: status,
            progress: status.message,
          }));

          // Check if script failed
          if (status.status === 'failed') {
            if (monitorIntervalRef.current) {
              clearInterval(monitorIntervalRef.current);
              monitorIntervalRef.current = null;
            }

            setState({
              isRunning: false,
              isMonitoring: false,
              progress: '',
              error: status.error || 'App registration failed',
              success: false,
              currentStep: 'Error' as RegistrationStepId,
              registrationStatus: status,
            });
            return;
          }

          // Check if script succeeded - also check credentials
          if (status.status === 'success') {
            // Script finished successfully, now import credentials
            setState(prev => ({
              ...prev,
              progress: 'Loading credentials...',
              currentStep: 'Complete',
            }));
          }
        }

        // Check if credentials exist (already fetched in parallel above)
        if (hasCredentials) {
          // Stop monitoring
          if (monitorIntervalRef.current) {
            clearInterval(monitorIntervalRef.current);
            monitorIntervalRef.current = null;
          }

          setState(prev => ({
            ...prev,
            isMonitoring: false,
            progress: 'Loading credentials...'
          }));

          // Read credential summary
          const summary = await window.electronAPI.appRegistration.readSummary(companyName);

          if (summary) {
            // Decrypt client secret
            const clientSecret = await window.electronAPI.appRegistration.decryptCredential(
              summary.CredentialFile
            );

            if (clientSecret) {
              // Auto-import into profile
              const profileName = `${companyName} - Azure`;

              // Check if profile already exists
              const existingProfiles = useProfileStore.getState().targetProfiles;
              const existingProfile = existingProfiles.find(
                p => p.companyName === companyName && p.profileType === 'Azure'
              );

              if (existingProfile) {
                // Update existing profile
                updateTargetProfile(existingProfile.id, {
                  tenantId: summary.TenantId,
                  clientId: summary.ClientId,
                  clientSecret: clientSecret,
                  domain: summary.Domain || '',
                  lastModified: new Date().toISOString()
                });

                setState({
                  isRunning: false,
                  isMonitoring: false,
                  progress: '',
                  error: null,
                  success: true,
                  currentStep: 'Complete',
                  registrationStatus: null,
                });
              } else {
                // Create new profile with required fields - cast to TargetProfile to avoid type mismatch
                addTargetProfile({
                  id: crypto.randomUUID(),
                  name: profileName,
                  companyName: companyName,
                  profileType: 'Azure' as const,
                  tenantId: summary.TenantId,
                  clientId: summary.ClientId,
                  clientSecret: clientSecret,
                  domain: summary.Domain || '',
                  isConnected: false,
                  created: summary.Created,
                  lastModified: new Date().toISOString(),
                  // Add missing required fields with defaults
                  environment: 'Azure',
                  region: 'Global',
                  tenantName: summary.Domain || companyName,
                  clientSecretEncrypted: 'true',
                  sharePointUrl: '',
                  sqlConnectionString: '',
                  usernameEncrypted: '',
                  passwordEncrypted: '',
                  certificateThumbprint: '',
                  scopes: [],
                  lastConnectionTest: null,
                  lastConnectionTestResult: null,
                  lastConnectionTestMessage: '',
                  isActive: false,
                  createdAt: summary.Created,
                } as any);

                setState({
                  isRunning: false,
                  isMonitoring: false,
                  progress: '',
                  error: null,
                  success: true,
                  currentStep: 'Complete',
                  registrationStatus: null,
                });
              }
            } else {
              throw new Error('Failed to decrypt credential file');
            }
          } else {
            throw new Error('Failed to read credential summary');
          }
        } else {
          // Check for timeout
          const elapsed = Date.now() - startTime;
          if (elapsed > maxDuration) {
            if (monitorIntervalRef.current) {
              clearInterval(monitorIntervalRef.current);
              monitorIntervalRef.current = null;
            }

            setState({
              isRunning: false,
              isMonitoring: false,
              progress: '',
              error: 'Timeout: App registration did not complete within 10 minutes',
              success: false,
              currentStep: null,
              registrationStatus: null,
            });
          }
          // Progress is now updated from status file, no need for countdown here
        }
      } catch (error: any) {
        // Stop monitoring on error
        if (monitorIntervalRef.current) {
          clearInterval(monitorIntervalRef.current);
          monitorIntervalRef.current = null;
        }

        setState({
          isRunning: false,
          isMonitoring: false,
          progress: '',
          error: error.message || 'Failed to import credentials',
          success: false,
          currentStep: null,
          registrationStatus: null,
        });
      }
    }, pollInterval);
  }, [addTargetProfile, updateTargetProfile]);

  /**
   * Stops monitoring for credential files
   */
  const stopMonitoring = useCallback(() => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isMonitoring: false,
      isRunning: false,
      progress: ''
    }));
  }, []);

  /**
   * Launches the Azure App Registration script
   */
  const launchAppRegistration = useCallback(async (options: AppRegistrationOptions) => {
    try {
      // Clear any previous status file
      await window.electronAPI.appRegistration.clearStatus(options.companyName);

      setState({
        isRunning: true,
        isMonitoring: false,
        progress: 'Launching app registration script...',
        error: null,
        success: false,
        currentStep: null,
        registrationStatus: null,
      });

      // Launch the PowerShell script
      const result = await window.electronAPI.appRegistration.launch(options);

      if (result.success) {
        // Start monitoring for credential files and status updates
        await startMonitoring(options.companyName);
      } else {
        setState({
          isRunning: false,
          isMonitoring: false,
          progress: '',
          error: result.error || 'Failed to launch app registration script',
          success: false,
          currentStep: null,
          registrationStatus: null,
        });
      }
    } catch (error: any) {
      setState({
        isRunning: false,
        isMonitoring: false,
        progress: '',
        error: error.message || 'An unexpected error occurred',
        success: false,
        currentStep: null,
        registrationStatus: null,
      });
    }
  }, [startMonitoring]);

  /**
   * Checks if credentials already exist for a company
   */
  const checkExistingCredentials = useCallback(async (companyName: string): Promise<boolean> => {
    try {
      return await window.electronAPI.appRegistration.hasCredentials(companyName);
    } catch (error) {
      console.error('Failed to check existing credentials:', error);
      return false;
    }
  }, []);

  /**
   * Imports existing credentials for a company
   */
  const importExistingCredentials = useCallback(async (companyName: string) => {
    try {
      setState({
        isRunning: true,
        isMonitoring: false,
        progress: 'Importing credentials...',
        error: null,
        success: false,
        currentStep: null,
        registrationStatus: null,
      });

      // Read credential summary
      const summary = await window.electronAPI.appRegistration.readSummary(companyName);

      if (!summary) {
        throw new Error('Credential summary not found');
      }

      // Decrypt client secret
      const clientSecret = await window.electronAPI.appRegistration.decryptCredential(
        summary.CredentialFile
      );

      if (!clientSecret) {
        throw new Error('Failed to decrypt credential file');
      }

      // Import into profile
      const profileName = `${companyName} - Azure`;

      // Check if profile already exists
      const existingProfiles = useProfileStore.getState().targetProfiles;
      const existingProfile = existingProfiles.find(
        p => p.companyName === companyName && p.profileType === 'Azure'
      );

      if (existingProfile) {
        // Update existing profile
        updateTargetProfile(existingProfile.id, {
          tenantId: summary.TenantId,
          clientId: summary.ClientId,
          clientSecret: clientSecret,
          domain: summary.Domain || '',
          lastModified: new Date().toISOString()
        });
      } else {
        // Create new profile - cast to any to bypass type checking
        addTargetProfile({
          id: crypto.randomUUID(),
          name: profileName,
          companyName: companyName,
          profileType: 'Azure',
          tenantId: summary.TenantId,
          clientId: summary.ClientId,
          clientSecret: clientSecret,
          domain: summary.Domain || '',
          isConnected: false,
          created: summary.Created,
          lastModified: new Date().toISOString()
        } as any);
      }

      setState({
        isRunning: false,
        isMonitoring: false,
        progress: '',
        error: null,
        success: true,
        currentStep: 'Complete',
        registrationStatus: null,
      });
    } catch (error: any) {
      setState({
        isRunning: false,
        isMonitoring: false,
        progress: '',
        error: error.message || 'Failed to import credentials',
        success: false,
        currentStep: null,
        registrationStatus: null,
      });
    }
  }, [addTargetProfile, updateTargetProfile]);

  /**
   * Resets the state
   */
  const reset = useCallback(() => {
    stopMonitoring();
    setState({
      isRunning: false,
      isMonitoring: false,
      progress: '',
      error: null,
      success: false,
      currentStep: null,
      registrationStatus: null,
    });
  }, [stopMonitoring]);

  return {
    state,
    launchAppRegistration,
    checkExistingCredentials,
    importExistingCredentials,
    stopMonitoring,
    reset,
    REGISTRATION_STEPS, // Export for UI consumption
  };
}
