/**
 * useInventoryLogic Hook
 *
 * Manages state and operations for the consolidated inventory system.
 * Provides API methods for entities, waves, and wave suggestions.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Entity filter types
interface EntityFilters {
  sourceProfileId?: string;
  entityTypes?: string[];
  statuses?: string[];
  search?: string;
  minReadinessScore?: number;
  maxRiskScore?: number;
  unassignedOnly?: boolean;
  waveId?: string;
}

// Wave filter types
interface WaveFilters {
  sourceProfileId?: string;
  targetProfileId?: string;
  statuses?: string[];
}

// Consolidation options
interface ConsolidateOptions {
  forceFullRebuild?: boolean;
}

// Wave creation data
interface CreateWaveData {
  name: string;
  description?: string;
  sourceProfileId: string;
  targetProfileId: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  priority?: number;
}

// Suggestion options
interface SuggestionOptions {
  sourceProfileId: string;
  targetProfileId: string;
  maxEntitiesPerWave?: number;
  minReadinessScore?: number;
  prioritizeTypes?: string[];
}

// Wave suggestion type
interface WaveSuggestion {
  suggestedWaveName: string;
  suggestedOrder: number;
  entityIds: string[];
  rationale: string;
  estimatedDuration: string;
  risks: string[];
}

// Statistics type
interface InventoryStatistics {
  totalEntities: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  avgReadinessScore: number;
  avgRiskScore: number;
  totalRelations: number;
  relationsByType: Record<string, number>;
}

// Wave summary type
interface WaveSummary {
  wave: any;
  totalEntities: number;
  entitiesByType: Record<string, number>;
  entitiesByStatus: Record<string, number>;
  avgReadinessScore: number;
  avgRiskScore: number;
  blockers: Array<{ entityId: string; reason: string }>;
  goNoGoStatus: 'GO' | 'NO_GO' | 'PENDING';
  criteriaMet: number;
  criteriaTotal: number;
}

/**
 * useInventoryLogic Hook
 *
 * @returns Inventory state and operations
 */
export function useInventoryLogic() {
  // State
  const [entities, setEntities] = useState<any[]>([]);
  const [waves, setWaves] = useState<any[]>([]);
  const [waveSummaries, setWaveSummaries] = useState<WaveSummary[]>([]);
  const [statistics, setStatistics] = useState<InventoryStatistics | null>(null);
  const [suggestions, setSuggestions] = useState<WaveSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for abort handling
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Load inventory entities with optional filtering
   */
  const loadEntities = useCallback(async (filters?: EntityFilters) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.inventory.getEntities(filters);

      if (result.success && result.data) {
        setEntities(result.data);
      } else {
        setError(result.error || 'Failed to load entities');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load a single entity by ID
   */
  const loadEntity = useCallback(async (entityId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.inventory.getEntity(entityId);

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to load entity');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load entity detail (with evidence and relations)
   */
  const loadEntityDetail = useCallback(async (entityId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.inventory.getEntityDetail(entityId);

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to load entity detail');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load inventory statistics
   */
  const loadStatistics = useCallback(async (sourceProfileId?: string) => {
    try {
      const result = await window.electronAPI.inventory.getStatistics(sourceProfileId);

      if (result.success && result.data) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, []);

  /**
   * Consolidate inventory from discovery data
   */
  const consolidateInventory = useCallback(async (options?: ConsolidateOptions) => {
    setLoading(true);
    setError(null);

    try {
      // Get current profile info (would come from context in real implementation)
      const profileResult = await window.electronAPI.profile.getActiveProfile();
      if (!profileResult.success || !profileResult.data) {
        throw new Error('No active profile');
      }

      const result = await window.electronAPI.inventory.consolidate({
        sourceProfileId: profileResult.data.id,
        companyName: profileResult.data.companyName,
        options,
      });

      if (result.success && result.data) {
        // Reload entities after consolidation
        await loadEntities();
        await loadStatistics();
        return result.data;
      } else {
        throw new Error(result.error || 'Consolidation failed');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEntities, loadStatistics]);

  /**
   * Update an entity
   */
  const updateEntity = useCallback(async (entityId: string, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.inventory.updateEntity({
        entityId,
        updates,
      });

      if (result.success && result.data) {
        // Update local state
        setEntities(prev => prev.map(e =>
          e.id === entityId ? { ...e, ...result.data } : e
        ));
        return result.data;
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an entity
   */
  const deleteEntity = useCallback(async (entityId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.inventory.deleteEntity(entityId);

      if (result.success) {
        // Remove from local state
        setEntities(prev => prev.filter(e => e.id !== entityId));
        return true;
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load migration waves
   */
  const loadWaves = useCallback(async (filters?: WaveFilters) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.getAll(filters);

      if (result.success && result.data) {
        setWaves(result.data);

        // Load summaries for each wave
        const summaries = await Promise.all(
          result.data.map(async (wave: any) => {
            try {
              const summaryResult = await window.electronAPI.waves.getSummary(wave.id);
              if (summaryResult.success && summaryResult.data) {
                return summaryResult.data;
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        setWaveSummaries(summaries.filter(Boolean) as WaveSummary[]);
      } else {
        setError(result.error || 'Failed to load waves');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new wave
   */
  const createWave = useCallback(async (waveData: CreateWaveData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.create(waveData);

      if (result.success && result.data) {
        // Reload waves
        await loadWaves();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create wave');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWaves]);

  /**
   * Update a wave
   */
  const updateWave = useCallback(async (waveId: string, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.update({
        waveId,
        updates,
      });

      if (result.success && result.data) {
        await loadWaves();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update wave');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWaves]);

  /**
   * Delete a wave
   */
  const deleteWave = useCallback(async (waveId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.delete(waveId);

      if (result.success) {
        await loadWaves();
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete wave');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWaves]);

  /**
   * Assign entities to a wave
   */
  const assignToWave = useCallback(async (
    waveId: string,
    entityIds: string[],
    reason?: string,
    reasonDetails?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.assignEntities({
        waveId,
        entityIds,
        reason,
        reasonDetails,
      });

      if (result.success && result.data) {
        // Reload entities and waves
        await Promise.all([loadEntities(), loadWaves()]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to assign entities');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEntities, loadWaves]);

  /**
   * Unassign entities from a wave
   */
  const unassignFromWave = useCallback(async (waveId: string, entityIds: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.unassignEntities({
        waveId,
        entityIds,
      });

      if (result.success) {
        await Promise.all([loadEntities(), loadWaves()]);
        return true;
      } else {
        throw new Error(result.error || 'Failed to unassign entities');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEntities, loadWaves]);

  /**
   * Generate wave suggestions
   */
  const generateSuggestions = useCallback(async (options: SuggestionOptions) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.suggestAssignments({
        sourceProfileId: options.sourceProfileId,
        targetProfileId: options.targetProfileId,
        options: {
          maxEntitiesPerWave: options.maxEntitiesPerWave,
          minReadinessScore: options.minReadinessScore,
          prioritizeTypes: options.prioritizeTypes,
        },
      });

      if (result.success && result.data) {
        setSuggestions(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to generate suggestions');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Apply a wave suggestion
   */
  const applySuggestion = useCallback(async (suggestion: WaveSuggestion) => {
    setLoading(true);
    setError(null);

    try {
      // Get current profile info
      const profileResult = await window.electronAPI.profile.getActiveProfile();
      if (!profileResult.success || !profileResult.data) {
        throw new Error('No active profile');
      }

      const result = await window.electronAPI.waves.applySuggestions({
        sourceProfileId: profileResult.data.id,
        targetProfileId: 'target', // Would come from context
        suggestions: [suggestion],
      });

      if (result.success && result.data) {
        // Remove applied suggestion
        setSuggestions(prev => prev.filter(s =>
          s.suggestedWaveName !== suggestion.suggestedWaveName
        ));

        // Reload waves
        await loadWaves();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to apply suggestion');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWaves]);

  /**
   * Start a wave
   */
  const startWave = useCallback(async (waveId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.start(waveId);

      if (result.success) {
        await loadWaves();
        return true;
      } else {
        throw new Error(result.error || 'Failed to start wave');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWaves]);

  /**
   * Pause a wave
   */
  const pauseWave = useCallback(async (waveId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.pause(waveId);

      if (result.success) {
        await loadWaves();
        return true;
      } else {
        throw new Error(result.error || 'Failed to pause wave');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWaves]);

  /**
   * Complete a wave
   */
  const completeWave = useCallback(async (waveId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.complete(waveId);

      if (result.success) {
        await loadWaves();
        return true;
      } else {
        throw new Error(result.error || 'Failed to complete wave');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadWaves]);

  /**
   * Validate a wave
   */
  const validateWave = useCallback(async (waveId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.waves.validate(waveId);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to validate wave');
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    entities,
    waves,
    waveSummaries,
    statistics,
    suggestions,
    loading,
    error,

    // Entity operations
    loadEntities,
    loadEntity,
    loadEntityDetail,
    loadStatistics,
    consolidateInventory,
    updateEntity,
    deleteEntity,

    // Wave operations
    loadWaves,
    createWave,
    updateWave,
    deleteWave,
    assignToWave,
    unassignFromWave,
    generateSuggestions,
    applySuggestion,
    startWave,
    pauseWave,
    completeWave,
    validateWave,

    // Utilities
    clearError,
  };
}

export default useInventoryLogic;
