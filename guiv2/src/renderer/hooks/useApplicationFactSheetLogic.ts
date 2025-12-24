/**
 * Application Fact Sheet Logic Hook
 *
 * Provides state management and operations for application fact sheets:
 * - CRUD operations via IPC
 * - Section updates with optimistic UI
 * - Observation/provenance tracking
 * - Relation management
 * - Statistics aggregation
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  ApplicationFactSheet,
  FactSheetSummary,
  FactSheetStatistics,
  FactSheetFilters,
  ApplicationObservation,
  FactRelation,
} from '../types/models/applicationFactSheet';

interface UseApplicationFactSheetLogicOptions {
  sourceProfileId: string;
  autoLoad?: boolean;
}

interface UseApplicationFactSheetLogicReturn {
  // State
  factSheets: FactSheetSummary[];
  selectedFactSheet: ApplicationFactSheet | null;
  statistics: FactSheetStatistics | null;
  isLoading: boolean;
  error: string | null;

  // CRUD Actions
  loadFactSheets: (filters?: FactSheetFilters) => Promise<void>;
  loadFactSheet: (id: string) => Promise<ApplicationFactSheet | null>;
  loadByInventoryEntity: (inventoryEntityId: string) => Promise<ApplicationFactSheet | null>;
  createFactSheet: (name: string, inventoryEntityId?: string) => Promise<ApplicationFactSheet | null>;
  updateSection: (
    id: string,
    section: 'baseInfo' | 'lifecycle' | 'business' | 'technical' | 'security' | 'migration',
    updates: any
  ) => Promise<ApplicationFactSheet | null>;
  deleteFactSheet: (id: string) => Promise<boolean>;

  // Selection
  selectFactSheet: (factSheet: ApplicationFactSheet | null) => void;

  // Observations
  addObservation: (
    applicationId: string,
    field: string,
    value: any,
    source: string,
    sourceFile?: string,
    confidence?: 'high' | 'medium' | 'low'
  ) => Promise<ApplicationObservation | null>;
  verifyObservation: (
    applicationId: string,
    observationId: string,
    verifiedBy: string
  ) => Promise<ApplicationObservation | null>;
  getObservations: (applicationId: string, field?: string) => Promise<ApplicationObservation[]>;

  // Relations
  addRelation: (params: {
    sourceId: string;
    sourceType: string;
    targetId: string;
    targetType: string;
    targetName: string;
    relationType: string;
    source: string;
    description?: string;
  }) => Promise<FactRelation | null>;
  removeRelation: (applicationId: string, relationId: string) => Promise<boolean>;

  // Statistics
  loadStatistics: () => Promise<void>;

  // Import
  importFromDiscovery: (
    applications: any[],
    source: string,
    sourceFile: string
  ) => Promise<{ created: number; updated: number; errors: number }>;

  // Utilities
  clearError: () => void;
  refresh: () => Promise<void>;
}

export const useApplicationFactSheetLogic = (
  options: UseApplicationFactSheetLogicOptions
): UseApplicationFactSheetLogicReturn => {
  const { sourceProfileId, autoLoad = true } = options;

  // State
  const [factSheets, setFactSheets] = useState<FactSheetSummary[]>([]);
  const [selectedFactSheet, setSelectedFactSheet] = useState<ApplicationFactSheet | null>(null);
  const [statistics, setStatistics] = useState<FactSheetStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  const loadFactSheets = useCallback(async (filters?: FactSheetFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.factsheet.getAll({
        sourceProfileId,
        ...filters,
      });

      if (result.success && result.data) {
        setFactSheets(result.data);
      } else {
        setError(result.error || 'Failed to load fact sheets');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [sourceProfileId]);

  const loadFactSheet = useCallback(async (id: string): Promise<ApplicationFactSheet | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.factsheet.getById(id);

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to load fact sheet');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByInventoryEntity = useCallback(async (inventoryEntityId: string): Promise<ApplicationFactSheet | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.factsheet.getByInventoryEntity(inventoryEntityId);

      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFactSheet = useCallback(async (
    name: string,
    inventoryEntityId?: string
  ): Promise<ApplicationFactSheet | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.factsheet.create({
        sourceProfileId,
        name,
        inventoryEntityId,
      });

      if (result.success && result.data) {
        // Refresh the list
        await loadFactSheets();
        return result.data;
      } else {
        setError(result.error || 'Failed to create fact sheet');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sourceProfileId, loadFactSheets]);

  const updateSection = useCallback(async (
    id: string,
    section: 'baseInfo' | 'lifecycle' | 'business' | 'technical' | 'security' | 'migration',
    updates: any
  ): Promise<ApplicationFactSheet | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.factsheet.updateSection({
        id,
        section,
        updates,
      });

      if (result.success && result.data) {
        // Update selected if it's the same
        if (selectedFactSheet?.id === id) {
          setSelectedFactSheet(result.data);
        }
        // Refresh the list
        await loadFactSheets();
        return result.data;
      } else {
        setError(result.error || 'Failed to update fact sheet');
        return null;
      }
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedFactSheet, loadFactSheets]);

  const deleteFactSheet = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.factsheet.delete(id);

      if (result.success) {
        // Clear selection if deleted
        if (selectedFactSheet?.id === id) {
          setSelectedFactSheet(null);
        }
        // Refresh the list
        await loadFactSheets();
        return true;
      } else {
        setError(result.error || 'Failed to delete fact sheet');
        return false;
      }
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedFactSheet, loadFactSheets]);

  // ============================================================================
  // Selection
  // ============================================================================

  const selectFactSheet = useCallback((factSheet: ApplicationFactSheet | null) => {
    setSelectedFactSheet(factSheet);
  }, []);

  // ============================================================================
  // Observations
  // ============================================================================

  const addObservation = useCallback(async (
    applicationId: string,
    field: string,
    value: any,
    source: string,
    sourceFile?: string,
    confidence?: 'high' | 'medium' | 'low'
  ): Promise<ApplicationObservation | null> => {
    try {
      const result = await window.electronAPI.factsheet.addObservation({
        applicationId,
        field,
        value,
        source,
        sourceFile,
        confidence,
      });

      if (result.success && result.data) {
        // Refresh the fact sheet if it's selected
        if (selectedFactSheet?.id === applicationId) {
          const updated = await loadFactSheet(applicationId);
          if (updated) setSelectedFactSheet(updated);
        }
        return result.data;
      }
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [selectedFactSheet, loadFactSheet]);

  const verifyObservation = useCallback(async (
    applicationId: string,
    observationId: string,
    verifiedBy: string
  ): Promise<ApplicationObservation | null> => {
    try {
      const result = await window.electronAPI.factsheet.verifyObservation({
        applicationId,
        observationId,
        verifiedBy,
      });

      if (result.success && result.data) {
        // Refresh the fact sheet if it's selected
        if (selectedFactSheet?.id === applicationId) {
          const updated = await loadFactSheet(applicationId);
          if (updated) setSelectedFactSheet(updated);
        }
        return result.data;
      }
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [selectedFactSheet, loadFactSheet]);

  const getObservations = useCallback(async (
    applicationId: string,
    field?: string
  ): Promise<ApplicationObservation[]> => {
    try {
      const result = await window.electronAPI.factsheet.getObservations({
        applicationId,
        field,
      });

      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  }, []);

  // ============================================================================
  // Relations
  // ============================================================================

  const addRelation = useCallback(async (params: {
    sourceId: string;
    sourceType: string;
    targetId: string;
    targetType: string;
    targetName: string;
    relationType: string;
    source: string;
    description?: string;
  }): Promise<FactRelation | null> => {
    try {
      const result = await window.electronAPI.factsheet.addRelation(params);

      if (result.success && result.data) {
        // Refresh the fact sheet if it's selected
        if (selectedFactSheet?.id === params.sourceId) {
          const updated = await loadFactSheet(params.sourceId);
          if (updated) setSelectedFactSheet(updated);
        }
        return result.data;
      }
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [selectedFactSheet, loadFactSheet]);

  const removeRelation = useCallback(async (
    applicationId: string,
    relationId: string
  ): Promise<boolean> => {
    try {
      const result = await window.electronAPI.factsheet.removeRelation({
        applicationId,
        relationId,
      });

      if (result.success) {
        // Refresh the fact sheet if it's selected
        if (selectedFactSheet?.id === applicationId) {
          const updated = await loadFactSheet(applicationId);
          if (updated) setSelectedFactSheet(updated);
        }
        return true;
      }
      return false;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [selectedFactSheet, loadFactSheet]);

  // ============================================================================
  // Statistics
  // ============================================================================

  const loadStatistics = useCallback(async () => {
    try {
      const result = await window.electronAPI.factsheet.getStatistics(sourceProfileId);

      if (result.success && result.data) {
        setStatistics(result.data);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [sourceProfileId]);

  // ============================================================================
  // Import
  // ============================================================================

  const importFromDiscovery = useCallback(async (
    applications: any[],
    source: string,
    sourceFile: string
  ): Promise<{ created: number; updated: number; errors: number }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.factsheet.importFromDiscovery({
        sourceProfileId,
        applications,
        source,
        sourceFile,
      });

      if (result.success && result.data) {
        // Refresh the list and statistics
        await Promise.all([loadFactSheets(), loadStatistics()]);
        return result.data;
      } else {
        setError(result.error || 'Import failed');
        return { created: 0, updated: 0, errors: applications.length };
      }
    } catch (err) {
      setError((err as Error).message);
      return { created: 0, updated: 0, errors: applications.length };
    } finally {
      setIsLoading(false);
    }
  }, [sourceProfileId, loadFactSheets, loadStatistics]);

  // ============================================================================
  // Utilities
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadFactSheets(), loadStatistics()]);
  }, [loadFactSheets, loadStatistics]);

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    if (autoLoad && sourceProfileId) {
      loadFactSheets();
      loadStatistics();
    }
  }, [autoLoad, sourceProfileId, loadFactSheets, loadStatistics]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    factSheets,
    selectedFactSheet,
    statistics,
    isLoading,
    error,

    // CRUD Actions
    loadFactSheets,
    loadFactSheet,
    loadByInventoryEntity,
    createFactSheet,
    updateSection,
    deleteFactSheet,

    // Selection
    selectFactSheet,

    // Observations
    addObservation,
    verifyObservation,
    getObservations,

    // Relations
    addRelation,
    removeRelation,

    // Statistics
    loadStatistics,

    // Import
    importFromDiscovery,

    // Utilities
    clearError,
    refresh,
  };
};

export default useApplicationFactSheetLogic;
