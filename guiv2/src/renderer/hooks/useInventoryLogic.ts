/**
 * Inventory Logic Hook
 *
 * Provides logic for consolidated inventory operations
 */

import { useCallback, useEffect } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import type { EntityType, EntityStatus } from '../types/models/inventory';

export const useInventoryLogic = (sourceProfileId: string) => {
  const {
    entities,
    evidence,
    relations,
    isLoading,
    error,
    getEntities,
    getEvidenceForEntity,
    getRelationsForEntity,
    consolidateFromDiscovery,
    rebuildInventory,
    getStats,
  } = useInventoryStore();

  /**
   * Load consolidated inventory on mount
   */
  useEffect(() => {
    console.log('[useInventoryLogic] Mounting with profile:', sourceProfileId);
    // Auto-load if empty
    if (entities.size === 0) {
      handleConsolidate();
    }
  }, [sourceProfileId]);

  /**
   * Consolidate inventory from discovery
   */
  const handleConsolidate = useCallback(async () => {
    console.log('[useInventoryLogic] Consolidating inventory...');
    await consolidateFromDiscovery(sourceProfileId);
  }, [sourceProfileId, consolidateFromDiscovery]);

  /**
   * Rebuild inventory (clear and reconsolidate)
   */
  const handleRebuild = useCallback(async () => {
    console.log('[useInventoryLogic] Rebuilding inventory...');
    await rebuildInventory(sourceProfileId);
  }, [sourceProfileId, rebuildInventory]);

  /**
   * Get entities with filters
   */
  const handleGetEntities = useCallback(
    (filters?: {
      entityType?: EntityType;
      status?: EntityStatus;
      waveId?: string;
      search?: string;
    }) => {
      return getEntities({ sourceProfileId, ...filters });
    },
    [sourceProfileId, getEntities]
  );

  /**
   * Get statistics
   */
  const handleGetStats = useCallback(() => {
    return getStats(sourceProfileId);
  }, [sourceProfileId, getStats]);

  return {
    // State
    entities: Array.from(entities.values()).filter((e) => e.sourceProfileId === sourceProfileId),
    isLoading,
    error,

    // Actions
    consolidate: handleConsolidate,
    rebuild: handleRebuild,
    getEntities: handleGetEntities,
    getEvidence: getEvidenceForEntity,
    getRelations: getRelationsForEntity,
    getStats: handleGetStats,
  };
};


