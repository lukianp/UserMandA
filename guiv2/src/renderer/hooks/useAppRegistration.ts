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

export interface AppRegistrationState {
  isRunning: boolean;
  isMonitoring: boolean;
  progress: string;
  error: string | null;
  success: boolean;
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
    success: false
  });

  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addTargetProfile, updateTargetProfile } = useProfileStore();

  /**
   * Starts monitoring for credential files
   */
  const startMonitoring = useCallback(async (companyName: string) => {
    setState(prev => ({
      ...prev,
      isMonitoring: true,
      progress: 'Waiting for app registration to complete...'
    }));

    const startTime = Date.now();
    const maxDuration = 5 * 60 * 1000; // 5 minutes
    const pollInterval = 5000; // 5 seconds

    monitorIntervalRef.current = setInterval(async () => {
      try {
        // Check if credentials exist
        const hasCredentials = await window.electronAPI.appRegistration.hasCredentials(companyName);

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
                  success: true
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
                  success: true
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
              error: 'Timeout: App registration did not complete within 5 minutes',
              success: false
            });
          } else {
            // Update progress
            const remainingSeconds = Math.floor((maxDuration - elapsed) / 1000);
            setState(prev => ({
              ...prev,
              progress: `Waiting for app registration... (${remainingSeconds}s remaining)`
            }));
          }
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
          success: false
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
      setState({
        isRunning: true,
        isMonitoring: false,
        progress: 'Launching app registration script...',
        error: null,
        success: false
      });

      // Launch the PowerShell script
      const result = await window.electronAPI.appRegistration.launch(options);

      if (result.success) {
        // Start monitoring for credential files
        await startMonitoring(options.companyName);
      } else {
        setState({
          isRunning: false,
          isMonitoring: false,
          progress: '',
          error: result.error || 'Failed to launch app registration script',
          success: false
        });
      }
    } catch (error: any) {
      setState({
        isRunning: false,
        isMonitoring: false,
        progress: '',
        error: error.message || 'An unexpected error occurred',
        success: false
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
        success: false
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
        success: true
      });
    } catch (error: any) {
      setState({
        isRunning: false,
        isMonitoring: false,
        progress: '',
        error: error.message || 'Failed to import credentials',
        success: false
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
      success: false
    });
  }, [stopMonitoring]);

  return {
    state,
    launchAppRegistration,
    checkExistingCredentials,
    importExistingCredentials,
    stopMonitoring,
    reset
  };
}
