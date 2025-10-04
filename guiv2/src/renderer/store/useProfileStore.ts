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

// Mirror C# CompanyProfile and TargetProfile types
export interface CompanyProfile extends Profile {
  companyName: string;
  domainController?: string;
  tenantId?: string;
  dataPath?: string;
  isActive?: boolean;
  configuration?: Record<string, any>;
}

export interface TargetProfile extends Profile {
  sourceProfileId: string;
  targetEnvironment: string;
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
  setSelectedSourceProfile: (profile: CompanyProfile | null) => void;
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
  subscribeWithSelector(
    devtools(
      persist(
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
           * Load source profiles from disk
           * Mirrors C# ProfileService.GetProfilesAsync
           */
          loadSourceProfiles: async () => {
            set({ isLoading: true, error: null });
            try {
              const profiles = await window.electronAPI.loadProfiles();
              set({
                sourceProfiles: profiles as CompanyProfile[],
                isLoading: false,
                // Mirror C# SelectedProfile restoration
                selectedSourceProfile: profiles.find((p: any) => p.isActive) || profiles[0] || null,
              });
            } catch (error: any) {
              console.error('Failed to load source profiles:', error);
              set({ error: error.message || 'Failed to load source profiles', isLoading: false });
            }
          },

          /**
           * Load target profiles for current source profile
           * Mirrors C# TargetProfileService.GetProfilesAsync
           */
          loadTargetProfiles: async () => {
            try {
              const currentSource = get().getCurrentSourceProfile();
              if (!currentSource) return;

              // In real implementation, this would call an IPC handler
              // For now, return empty array
              set({ targetProfiles: [] });
            } catch (error: any) {
              console.error('Failed to load target profiles:', error);
              set({ error: error.message });
            }
          },

        /**
         * Create a new source profile
         * Mirrors C# ProfileService.CreateProfileAsync
         */
        createSourceProfile: async (profileData) => {
          const newProfile: CompanyProfile = {
            ...profileData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            isActive: false,
            // Mirror C# default values
            domainController: profileData.domainController || `dc.${profileData.companyName.toLowerCase()}.com`,
            tenantId: profileData.tenantId || crypto.randomUUID(),
            configuration: profileData.configuration || {},
          } as CompanyProfile;

          await window.electronAPI.saveProfile(newProfile);

          const updatedProfiles = [...get().sourceProfiles, newProfile];
          set({ sourceProfiles: updatedProfiles });

          return newProfile.id;
        },

        /**
         * Update an existing source profile
         * Mirrors C# ProfileService.UpdateProfileAsync
         */
        updateSourceProfile: async (id, updates) => {
          await window.electronAPI.saveProfile({ id, ...updates } as any);

          const updatedProfiles = get().sourceProfiles.map((p) =>
            p.id === id ? { ...p, ...updates, lastModified: new Date().toISOString() } : p
          );

          set({ sourceProfiles: updatedProfiles });
        },

        /**
         * Delete a source profile
         * Mirrors C# ProfileService.DeleteProfileAsync
         */
        deleteSourceProfile: async (id) => {
          await window.electronAPI.deleteProfile(id);

          const updatedProfiles = get().sourceProfiles.filter((p) => p.id !== id);
          set({
            sourceProfiles: updatedProfiles,
            selectedSourceProfile: get().selectedSourceProfile?.id === id ? null : get().selectedSourceProfile,
          });
        },

        /**
         * Set selected source profile
         * Mirrors C# ProfileService.SetCurrentProfileAsync
         */
        setSelectedSourceProfile: (profile) => {
          set({ selectedSourceProfile: profile });

          // Mirror C# CurrentProfile property update
          if (profile) {
            const updatedProfiles = get().sourceProfiles.map((p) => ({
              ...p,
              isActive: p.id === profile.id,
            }));
            set({ sourceProfiles: updatedProfiles });
          }
        },

        /**
         * Set selected target profile
         */
        setSelectedTargetProfile: (profile) => {
          set({ selectedTargetProfile: profile });
        },

        /**
         * Test connection to a profile
         * Mirrors C# connection testing functionality
         */
        testConnection: async (profile) => {
          set({ connectionStatus: 'connecting' });
          try {
            // Execute PowerShell connection test
            const result = await window.electronAPI.executeModule({
              modulePath: 'Modules/Connection/Test-Connection.psm1',
              functionName: 'Test-ProfileConnection',
              parameters: { profileId: profile.id },
            });

            if (result.success) {
              set({ connectionStatus: 'connected' });
              return result.data;
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
          // Use Zustand's subscribe method with selector
          const unsubscribe = useProfileStore.subscribe(
            (state) => state.sourceProfiles,
            callback
          );
          return unsubscribe;
        },
      }),
      {
        name: 'profile-storage',
        // Only persist selected profiles, not the full list or transient state
        partialize: (state) => ({
          selectedSourceProfile: state.selectedSourceProfile,
          selectedTargetProfile: state.selectedTargetProfile,
        }),
      }
    ),
    {
      name: 'ProfileStore',
    }
  )
);
