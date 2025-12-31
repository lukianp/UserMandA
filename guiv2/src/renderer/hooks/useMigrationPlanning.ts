/**
 * Migration Planning Hook
 *
 * React hook for managing migration plans and waves
 */

import { useState, useCallback } from 'react';

export interface MigrationWave {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'inprogress' | 'completed' | 'failed';
  users: string[];
  priority: number;
  dependencies: string[];
  created: string;
  modified: string;
}

export interface MigrationPlan {
  id: string;
  profileName: string;
  name: string;
  description: string;
  waves: MigrationWave[];
  created: string;
  modified: string;
}

export interface MigrationPlanningState {
  plans: MigrationPlan[];
  activePlan: MigrationPlan | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing migration planning
 */
export function useMigrationPlanning(profileName?: string) {
  const [state, setState] = useState<MigrationPlanningState>({
    plans: [],
    activePlan: null,
    isLoading: false,
    error: null
  });

  /**
   * Load migration plans for a profile
   */
  const loadPlans = useCallback(async (profile: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await window.electron.invoke('migration-plan:get-by-profile', profile);

      if (result.success) {
        setState(prev => ({
          ...prev,
          plans: result.plans || [],
          isLoading: false
        }));
      } else {
        throw new Error(result.error || 'Failed to load migration plans');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, []);

  /**
   * Create a new migration plan
   */
  const createPlan = useCallback(
    async (planData: { profileName: string; name: string; description: string }) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await window.electron.invoke('migration-plan:create', planData);

        if (result.success) {
          setState(prev => ({
            ...prev,
            plans: [...prev.plans, result.plan],
            activePlan: result.plan,
            isLoading: false
          }));

          return result.plan;
        } else {
          throw new Error(result.error || 'Failed to create migration plan');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Add a wave to a migration plan
   */
  const addWave = useCallback(
    async (
      planId: string,
      waveData: {
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        priority?: number;
        dependencies?: string[];
      }
    ) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await window.electron.invoke('migration-plan:add-wave', {
          planId,
          waveData
        });

        if (result.success) {
          // Update plan with new wave
          setState(prev => ({
            ...prev,
            plans: prev.plans.map(p =>
              p.id === planId ? { ...p, waves: [...p.waves, result.wave] } : p
            ),
            activePlan:
              prev.activePlan?.id === planId
                ? { ...prev.activePlan, waves: [...prev.activePlan.waves, result.wave] }
                : prev.activePlan,
            isLoading: false
          }));

          return result.wave;
        } else {
          throw new Error(result.error || 'Failed to add wave');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Assign users to a wave
   */
  const assignUsersToWave = useCallback(
    async (planId: string, waveId: string, userIds: string[]) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await window.electron.invoke('migration-plan:assign-users', {
          planId,
          waveId,
          userIds
        });

        if (result.success) {
          // Update wave with assigned users
          setState(prev => ({
            ...prev,
            plans: prev.plans.map(p =>
              p.id === planId
                ? {
                    ...p,
                    waves: p.waves.map(w =>
                      w.id === waveId ? { ...w, users: [...new Set([...w.users, ...userIds])] } : w
                    )
                  }
                : p
            ),
            isLoading: false
          }));
        } else {
          throw new Error(result.error || 'Failed to assign users to wave');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Update wave status
   */
  const updateWaveStatus = useCallback(
    async (
      planId: string,
      waveId: string,
      status: 'planned' | 'inprogress' | 'completed' | 'failed'
    ) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await window.electron.invoke('migration-plan:update-wave-status', {
          planId,
          waveId,
          status
        });

        if (result.success) {
          // Update wave status
          setState(prev => ({
            ...prev,
            plans: prev.plans.map(p =>
              p.id === planId
                ? {
                    ...p,
                    waves: p.waves.map(w => (w.id === waveId ? { ...w, status } : w))
                  }
                : p
            ),
            isLoading: false
          }));
        } else {
          throw new Error(result.error || 'Failed to update wave status');
        }
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Delete a migration plan
   */
  const deletePlan = useCallback(async (planId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await window.electron.invoke('migration-plan:delete', planId);

      if (result.success) {
        setState(prev => ({
          ...prev,
          plans: prev.plans.filter(p => p.id !== planId),
          activePlan: prev.activePlan?.id === planId ? null : prev.activePlan,
          isLoading: false
        }));
      } else {
        throw new Error(result.error || 'Failed to delete migration plan');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  }, []);

  /**
   * Set active plan
   */
  const setActivePlan = useCallback((plan: MigrationPlan | null) => {
    setState(prev => ({ ...prev, activePlan: plan }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    loadPlans,
    createPlan,
    addWave,
    assignUsersToWave,
    updateWaveStatus,
    deletePlan,
    setActivePlan,
    clearError
  };
}


