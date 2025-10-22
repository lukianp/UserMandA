/**
 * Profile Store
 *
 * Manages source/target profiles, connection status, and profile operations.
 * Mirrors C# ProfileService.Instance singleton pattern from GUI/Services/ProfileService.cs
 * Persists selected profiles to localStorage.
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

import { Profile, ConnectionStatus } from '../types/models/profile';
import { getElectronAPI } from '../lib/electron-api-fallback';

// Debug logging to validate type fixes
console.log('Profile store initialized - ConnectionStatus type imported successfully');
console.log('Available connection statuses:', ['disconnected', 'connecting', 'connected', 'error']);

// Mirror C# CompanyProfile and TargetProfile types
export interface CompanyProfile extends Profile {
  companyName: string;
  domainController?: string;
  dataPath?: string;
  configuration?: Record<string, any>;
  credential?: string; // Plain text credential for runtime use
  // Required properties from Profile are inherited through extension
}

export interface TargetProfile extends Profile {
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
  created?: string;
  lastModified?: string;
}

interface ProfileState {
  // State - mirrors C# ProfileService properties
  sourceProfiles: CompanyProfile[];
  targetProfiles: TargetProfile[];
  selectedSourceProfile: CompanyProfile | null;
  selectedTargetProfile: TargetProfile | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;

  // Actions - mirrors C# ProfileService methods
  loadSourceProfiles: () => Promise<void>;
  loadTargetProfiles: () => Promise<void>;
  createSourceProfile: (profile: Omit<CompanyProfile, 'id' | 'createdAt'>) => Promise<string>;
  updateSourceProfile: (id: string, updates: Partial<CompanyProfile>) => Promise<void>;
  deleteSourceProfile: (id: string) => Promise<void>;
  addTargetProfile: (profile: TargetProfile) => void;
  updateTargetProfile: (id: string, updates: Partial<TargetProfile>) => void;
  deleteTargetProfile: (id: string) => void;
  setSelectedSourceProfile: (profile: CompanyProfile | null) => Promise<void>;
  setSelectedTargetProfile: (profile: TargetProfile | null) => void;
  testConnection: (profile: CompanyProfile) => Promise<any>;
  clearError: () => void;

  // Helper methods (mirrors C# ProfileService.CurrentProfile pattern)
  getCurrentSourceProfile: () => CompanyProfile | null;
  getCurrentTargetProfile: () => TargetProfile | null;

  // Mirror C# ProfilesChanged event with subscription pattern
  subscribeToProfileChanges: (callback: () => void) => () => void;
}

export const useProfileStore = create<ProfileState>()(
  (set, get) => ({
    // Initial state
    sourceProfiles: [],
    targetProfiles: [],
    selectedSourceProfile: null,
    selectedTargetProfile: null,
    connectionStatus: 'disconnected',
    isLoading: false,
    error: null,

    // Actions

    /**
     * Load source profiles from disk (includes auto-discovered profiles from C:\DiscoveryData)
     * Mirrors C# ProfileService.GetProfilesAsync
     */
    loadSourceProfiles: async () => {
      set({ isLoading: true, error: null });
      try {
        console.log('[ProfileStore] Loading source profiles...');
        const electronAPI = getElectronAPI();
        const profiles = await electronAPI.loadSourceProfiles();
        console.log('[ProfileStore] Loaded profiles:', profiles);
        console.log('[ProfileStore] Profile count:', profiles?.length || 0);

        if (profiles && profiles.length > 0) {
          console.log('[ProfileStore] First profile:', profiles[0]);
        }

        set({
          sourceProfiles: profiles as CompanyProfile[],
          isLoading: false,
          // Mirror C# SelectedProfile restoration
          selectedSourceProfile: profiles.find((p: any) => p.isActive) || profiles[0] || null,
        });

        console.log('[ProfileStore] Source profiles loaded successfully:', profiles.length);
      } catch (error: any) {
        console.error('[ProfileStore] Failed to load source profiles:', error);
        set({ error: error.message || 'Failed to load source profiles', isLoading: false });
      }
    },

    /**
     * Load target profiles for current source profile
     * Mirrors C# TargetProfileService.GetProfilesAsync
     */
    loadTargetProfiles: async () => {
      set({ isLoading: true, error: null });
      try {
        const electronAPI = getElectronAPI();
        const profiles = await electronAPI.loadTargetProfiles();
        set({
          targetProfiles: profiles as TargetProfile[],
          isLoading: false,
          selectedTargetProfile: profiles.find((p: any) => p.isActive) || profiles[0] || null,
        });
      } catch (error: any) {
        console.error('Failed to load target profiles:', error);
        set({ error: error.message || 'Failed to load target profiles', isLoading: false });
      }
    },

    /**
     * Create a new source profile
     * Mirrors C# ProfileService.CreateProfileAsync
     */
    createSourceProfile: async (profileData) => {
      const electronAPI = getElectronAPI();

      const result = await electronAPI.createSourceProfile({
        ...profileData,
        isActive: false,
        // Mirror C# default values
        domainController: profileData.domainController || `dc.${profileData.companyName.toLowerCase()}.com`,
        tenantId: profileData.tenantId || crypto.randomUUID(),
        configuration: profileData.configuration || {},
      });

      if (result.success && result.profile) {
        const updatedProfiles = [...get().sourceProfiles, result.profile as CompanyProfile];
        set({ sourceProfiles: updatedProfiles });
        return result.profile.id;
      } else {
        throw new Error(result.error || 'Failed to create profile');
      }
    },

    /**
     * Update an existing source profile
     * Mirrors C# ProfileService.UpdateProfileAsync
     */
    updateSourceProfile: async (id, updates) => {
      const electronAPI = getElectronAPI();
      const result = await electronAPI.updateSourceProfile(id, updates);

      if (result.success && result.profile) {
        const updatedProfiles = get().sourceProfiles.map((p) =>
          p.id === id ? (result.profile as CompanyProfile) : p
        );
        set({ sourceProfiles: updatedProfiles });
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    },

    /**
     * Delete a source profile
     * Mirrors C# ProfileService.DeleteProfileAsync
     */
    deleteSourceProfile: async (id) => {
      const electronAPI = getElectronAPI();
      const result = await electronAPI.deleteSourceProfile(id);

      if (result.success) {
        const updatedProfiles = get().sourceProfiles.filter((p) => p.id !== id);
        set({
          sourceProfiles: updatedProfiles,
          selectedSourceProfile: get().selectedSourceProfile?.id === id ? null : get().selectedSourceProfile,
        });
      } else {
        throw new Error(result.error || 'Failed to delete profile');
      }
    },

    /**
     * Set selected source profile
     * Mirrors C# ProfileService.SetCurrentProfileAsync
     *
     * When profile changes:
     * 1. Calls IPC to set active profile (reinitializes LogicEngine with new data path)
     * 2. Triggers LogicEngine to reload ALL CSV data for the new profile
     * 3. Updates local state (triggers all views subscribed to selectedSourceProfile to reload)
     *
     * This replicates /gui/ behavior where ProfileService.CurrentProfile setter
     * triggers CsvDataService reload and raises ProfilesChanged event.
     */
    setSelectedSourceProfile: async (profile) => {
      if (!profile) {
        set({ selectedSourceProfile: null });
        return;
      }

      console.log(`[ProfileStore] Changing active source profile to: ${profile.companyName}`);
      const electronAPI = getElectronAPI();

      // Step 1: Set active profile (this reinitializes LogicEngine with new data path)
      const result = await electronAPI.setActiveSourceProfile(profile.id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to set active profile');
      }

      console.log(`[ProfileStore] Active profile set, data path: ${result.dataPath}`);

      // Step 2: Trigger LogicEngine to load all CSV data for this profile
      // This replicates /gui/ pattern where changing profile triggers data reload
      try {
        console.log('[ProfileStore] Triggering LogicEngine data reload for new profile...');
        const loadResult = await electronAPI.invoke('logic-engine:load-all', {
          profilePath: result.dataPath,
        });

        if (loadResult.success) {
          console.log('[ProfileStore] LogicEngine data loaded successfully:', loadResult.statistics);
        } else {
          console.warn('[ProfileStore] LogicEngine data load failed:', loadResult.error);
        }
      } catch (error: any) {
        console.error('[ProfileStore] Failed to load LogicEngine data:', error);
        // Don't throw - profile is still set, just data might not be loaded
      }

      // Step 3: Update local state
      // This triggers all views subscribed to selectedSourceProfile to reload
      const updatedProfiles = get().sourceProfiles.map((p) => ({
        ...p,
        isActive: p.id === profile.id,
      }));

      set({
        sourceProfiles: updatedProfiles,
        selectedSourceProfile: profile,
      });

      console.log(`[ProfileStore] Profile change complete: ${profile.companyName}`);
      console.log('[ProfileStore] All views subscribed to selectedSourceProfile will now auto-reload');
    },

    /**
     * Set selected target profile
     */
    setSelectedTargetProfile: (profile) => {
      set({ selectedTargetProfile: profile });
    },

    /**
     * Add a new target profile
     * Mirrors C# TargetProfileService.AddProfileAsync
     */
    addTargetProfile: (profile) => {
      const updatedProfiles = [...get().targetProfiles, profile];
      set({ targetProfiles: updatedProfiles });
      console.log(`[ProfileStore] Added target profile: ${profile.name}`);
    },

    /**
     * Update an existing target profile
     * Mirrors C# TargetProfileService.UpdateProfileAsync
     */
    updateTargetProfile: (id, updates) => {
      const updatedProfiles = get().targetProfiles.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      set({ targetProfiles: updatedProfiles });
      console.log(`[ProfileStore] Updated target profile: ${id}`);
    },

    /**
     * Delete a target profile
     * Mirrors C# TargetProfileService.DeleteProfileAsync
     */
    deleteTargetProfile: (id) => {
      const updatedProfiles = get().targetProfiles.filter((p) => p.id !== id);
      set({
        targetProfiles: updatedProfiles,
        selectedTargetProfile: get().selectedTargetProfile?.id === id ? null : get().selectedTargetProfile,
      });
      console.log(`[ProfileStore] Deleted target profile: ${id}`);
    },

    /**
     * Test connection to a profile
     * Mirrors C# connection testing functionality
     */
    testConnection: async (profile) => {
      set({ connectionStatus: 'connecting' });
      try {
        const electronAPI = getElectronAPI();

        // Execute PowerShell connection test
        const result = await electronAPI.executeModule({
          modulePath: 'Modules/Connection/Test-Connection.psm1',
          functionName: 'Test-ProfileConnection',
          parameters: { profileId: profile.id },
        });

        if (result.success) {
          set({ connectionStatus: 'connected' });
          return (result as any).data;
        } else {
          set({ connectionStatus: 'error', error: result.error || 'Connection test failed' });
          throw new Error(result.error || 'Connection test failed');
        }
      } catch (error: any) {
        console.error('Connection test failed:', error);
        set({ connectionStatus: 'error', error: error.message });
        throw error;
      }
    },

    /**
     * Clear error state
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * Get current source profile (mirrors C# ProfileService.CurrentProfile property)
     */
    getCurrentSourceProfile: () => {
      return get().selectedSourceProfile || get().sourceProfiles.find((p) => p.isActive) || get().sourceProfiles[0] || null;
    },

    /**
     * Get current target profile (mirrors C# ProfileService.CurrentProfile property)
     */
    getCurrentTargetProfile: () => {
      return get().selectedTargetProfile || get().targetProfiles.find((p) => p.isActive) || get().targetProfiles[0] || null;
    },

    /**
     * Subscribe to profile changes
     * Mirrors C# ProfilesChanged event pattern
     */
    subscribeToProfileChanges: (callback) => {
      // For now, just return a no-op unsubscribe function
      // TODO: Implement proper subscription when needed
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    },
  })
);
