/**
 * Profile Store
 *
 * Manages source/target profiles, connection status, and profile operations.
 * Persists selected profiles to localStorage.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Profile, ConnectionStatus } from '../types/models/profile';

interface ProfileState {
  // State
  profiles: Profile[];
  selectedSourceProfile: Profile | null;
  selectedTargetProfile: Profile | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfiles: () => Promise<void>;
  setSelectedProfile: (profile: Profile, type: 'source' | 'target') => void;
  createProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  updateProfile: (profileId: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  testConnection: (profile: Profile) => Promise<any>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        profiles: [],
        selectedSourceProfile: null,
        selectedTargetProfile: null,
        connectionStatus: 'disconnected',
        isLoading: false,
        error: null,

        // Actions

        /**
         * Load all profiles from disk
         */
        loadProfiles: async () => {
          set({ isLoading: true, error: null });
          try {
            const profiles = await window.electronAPI.loadProfiles();
            set({ profiles, isLoading: false });
          } catch (error: any) {
            console.error('Failed to load profiles:', error);
            set({ error: error.message || 'Failed to load profiles', isLoading: false });
          }
        },

        /**
         * Set selected source or target profile
         */
        setSelectedProfile: (profile, type) => {
          if (type === 'source') {
            set({ selectedSourceProfile: profile });
          } else {
            set({ selectedTargetProfile: profile });
          }
        },

        /**
         * Create a new profile
         */
        createProfile: async (profileData) => {
          set({ isLoading: true, error: null });
          try {
            const newProfile: Profile = {
              ...profileData,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
            } as Profile;

            await window.electronAPI.saveProfile(newProfile);
            await get().loadProfiles(); // Reload profiles
          } catch (error: any) {
            console.error('Failed to create profile:', error);
            set({ error: error.message || 'Failed to create profile', isLoading: false });
            throw error;
          }
        },

        /**
         * Update an existing profile
         */
        updateProfile: async (profileId, updates) => {
          set({ isLoading: true, error: null });
          try {
            const existingProfile = get().profiles.find(p => p.id === profileId);
            if (!existingProfile) {
              throw new Error(`Profile ${profileId} not found`);
            }

            const updatedProfile: Profile = {
              ...existingProfile,
              ...updates,
              lastModified: new Date().toISOString(),
            };

            await window.electronAPI.saveProfile(updatedProfile);
            await get().loadProfiles(); // Reload profiles
          } catch (error: any) {
            console.error('Failed to update profile:', error);
            set({ error: error.message || 'Failed to update profile', isLoading: false });
            throw error;
          }
        },

        /**
         * Delete a profile
         */
        deleteProfile: async (profileId) => {
          set({ isLoading: true, error: null });
          try {
            await window.electronAPI.deleteProfile(profileId);

            // Clear selected profiles if they match deleted profile
            const state = get();
            if (state.selectedSourceProfile?.id === profileId) {
              set({ selectedSourceProfile: null });
            }
            if (state.selectedTargetProfile?.id === profileId) {
              set({ selectedTargetProfile: null });
            }

            await get().loadProfiles(); // Reload profiles
          } catch (error: any) {
            console.error('Failed to delete profile:', error);
            set({ error: error.message || 'Failed to delete profile', isLoading: false });
            throw error;
          }
        },

        /**
         * Test connection to a profile
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
