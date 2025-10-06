/**
 * Project Logic Hook
 * Manages project configuration, timeline calculations, and wave management
 */

import { useState, useEffect, useCallback } from 'react';
import { differenceInDays, addDays } from 'date-fns';
import type { ProjectConfig, WaveConfig, ProjectStatus, WaveStatus } from '../types/project';
import { useProfileStore } from '../store/useProfileStore';

export const useProjectLogic = () => {
  const { selectedSourceProfile } = useProfileStore();
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [daysToCutover, setDaysToCutover] = useState<number>(0);
  const [daysToNextWave, setDaysToNextWave] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load project configuration from backend
   */
  const loadProject = useCallback(async () => {
    if (!selectedSourceProfile) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.project.getConfiguration(
        selectedSourceProfile.companyName
      );

      if (result.success && result.data) {
        setProject(result.data);

        // Calculate days to cutover
        const cutover = new Date(result.data.targetCutover);
        const today = new Date();
        setDaysToCutover(differenceInDays(cutover, today));

        // Calculate days to next wave
        if (result.data.waves && result.data.waves.length > 0) {
          const upcomingWaves = result.data.waves
            .filter((w: WaveConfig) => w.status === 'Scheduled')
            .sort((a: WaveConfig, b: WaveConfig) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

          if (upcomingWaves.length > 0) {
            const nextWaveDate = new Date(upcomingWaves[0].scheduledDate);
            setDaysToNextWave(differenceInDays(nextWaveDate, today));
          } else {
            setDaysToNextWave(0);
          }
        } else {
          setDaysToNextWave(0);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load project configuration');
      console.error('Project load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  /**
   * Save project configuration
   */
  const saveProject = useCallback(async (updatedProject: ProjectConfig) => {
    if (!selectedSourceProfile) {
      throw new Error('No profile selected');
    }

    try {
      await window.electronAPI.project.saveConfiguration(
        selectedSourceProfile.companyName,
        updatedProject
      );
      await loadProject(); // Reload after save
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to save project configuration');
    }
  }, [selectedSourceProfile, loadProject]);

  /**
   * Update project status
   */
  const updateStatus = useCallback(async (status: ProjectStatus) => {
    if (!selectedSourceProfile) {
      throw new Error('No profile selected');
    }

    try {
      await window.electronAPI.project.updateStatus(
        selectedSourceProfile.companyName,
        status
      );
      await loadProject(); // Reload after update
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update project status');
    }
  }, [selectedSourceProfile, loadProject]);

  /**
   * Add a new migration wave
   */
  const addWave = useCallback(async (wave: WaveConfig) => {
    if (!selectedSourceProfile) {
      throw new Error('No profile selected');
    }

    try {
      await window.electronAPI.project.addWave(
        selectedSourceProfile.companyName,
        wave
      );
      await loadProject(); // Reload after adding wave
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to add wave');
    }
  }, [selectedSourceProfile, loadProject]);

  /**
   * Update wave status
   */
  const updateWaveStatus = useCallback(async (waveId: string, status: WaveStatus) => {
    if (!selectedSourceProfile) {
      throw new Error('No profile selected');
    }

    try {
      await window.electronAPI.project.updateWaveStatus(
        selectedSourceProfile.companyName,
        waveId,
        status
      );
      await loadProject(); // Reload after update
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update wave status');
    }
  }, [selectedSourceProfile, loadProject]);

  /**
   * Delete a wave (by updating project config)
   */
  const deleteWave = useCallback(async (waveId: string) => {
    if (!project) {
      throw new Error('No project loaded');
    }

    const updatedProject = {
      ...project,
      waves: project.waves.filter(w => w.id !== waveId)
    };

    await saveProject(updatedProject);
  }, [project, saveProject]);

  // Load project on mount or when profile changes
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return {
    project,
    daysToCutover,
    daysToNextWave,
    isLoading,
    error,
    reload: loadProject,
    saveProject,
    updateStatus,
    addWave,
    updateWaveStatus,
    deleteWave
  };
};
