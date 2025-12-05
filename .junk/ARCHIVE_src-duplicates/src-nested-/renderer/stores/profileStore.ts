import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { CompanyProfile, ProfileStatistics, ConnectionConfig } from '@shared/types/profile';

interface ProfileState {
  profiles: CompanyProfile[];
  currentProfile: CompanyProfile | null;
  statistics: Record<string, ProfileStatistics>;
  connectionConfigs: Record<string, ConnectionConfig>;
  isLoading: boolean;
  error: string | null;
}

interface ProfileActions {
  // Profile management
  loadProfiles: () => Promise<void>;
  setCurrentProfile: (profileId: string) => Promise<boolean>;
  createProfile: (profile: Omit<CompanyProfile, 'id' | 'created' | 'lastModified'>) => Promise<CompanyProfile>;
  updateProfile: (profile: CompanyProfile) => Promise<CompanyProfile>;
  deleteProfile: (profileId: string) => Promise<boolean>;
  importProfile: (filePath: string) => Promise<CompanyProfile>;
  exportProfile: (profileId: string, filePath: string) => Promise<void>;

  // Statistics
  loadProfileStatistics: (profileId: string) => Promise<void>;

  // Connection configuration
  loadConnectionConfig: (profileId: string) => Promise<void>;
  saveConnectionConfig: (profileId: string, config: ConnectionConfig) => Promise<void>;

  // Internal actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handleProfileChange: () => Promise<void>;
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
  immer((set, get) => ({
    // State
    profiles: [],
    currentProfile: null,
    statistics: {},
    connectionConfigs: {},
    isLoading: false,
    error: null,

    // Actions
    loadProfiles: async () => {
      set(state => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const profiles = await window.electron.profile.getAll();
        const currentProfile = await window.electron.profile.getCurrent();

        set(state => {
          state.profiles = profiles;
          state.currentProfile = currentProfile;
          state.isLoading = false;
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to load profiles';
          state.isLoading = false;
        });
      }
    },

    setCurrentProfile: async (profileId: string) => {
      try {
        const success = await window.electron.profile.setCurrent(profileId);
        if (success) {
          await get().loadProfiles();
        }
        return success;
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to set current profile';
        });
        return false;
      }
    },

    createProfile: async (profileData) => {
      set(state => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const profile = await window.electron.profile.create(profileData);
        await get().loadProfiles();

        set(state => {
          state.isLoading = false;
        });

        return profile;
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to create profile';
          state.isLoading = false;
        });
        throw error;
      }
    },

    updateProfile: async (profile) => {
      try {
        const updated = await window.electron.profile.update(profile);
        await get().loadProfiles();
        return updated;
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to update profile';
        });
        throw error;
      }
    },

    deleteProfile: async (profileId: string) => {
      try {
        const success = await window.electron.profile.delete(profileId);
        if (success) {
          await get().loadProfiles();
        }
        return success;
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to delete profile';
        });
        return false;
      }
    },

    importProfile: async (filePath: string) => {
      try {
        const profile = await window.electron.profile.import(filePath);
        await get().loadProfiles();
        return profile;
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to import profile';
        });
        throw error;
      }
    },

    exportProfile: async (profileId: string, filePath: string) => {
      try {
        await window.electron.profile.export(profileId, filePath);
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to export profile';
        });
        throw error;
      }
    },

    loadProfileStatistics: async (profileId: string) => {
      try {
        const stats = await window.electron.profile.getStats(profileId);
        if (stats) {
          set(state => {
            state.statistics[profileId] = stats;
          });
        }
      } catch (error) {
        console.warn('Failed to load profile statistics:', error);
      }
    },

    loadConnectionConfig: async (profileId: string) => {
      try {
        const config = await window.electron.profile.getConnectionConfig(profileId);
        if (config) {
          set(state => {
            state.connectionConfigs[profileId] = config;
          });
        }
      } catch (error) {
        console.warn('Failed to load connection config:', error);
      }
    },

    saveConnectionConfig: async (profileId: string, config: ConnectionConfig) => {
      try {
        await window.electron.profile.setConnectionConfig(profileId, config);
        set(state => {
          state.connectionConfigs[profileId] = config;
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to save connection config';
        });
        throw error;
      }
    },

    setLoading: (loading: boolean) => {
      set(state => {
        state.isLoading = loading;
      });
    },

    setError: (error: string | null) => {
      set(state => {
        state.error = error;
      });
    },

    handleProfileChange: async () => {
      await get().loadProfiles();
    }
  }))
);