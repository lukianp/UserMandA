/**
 * Inventory Store
 *
 * Manages consolidated inventory entities, evidence, relations, and matches.
 * Provides CRUD operations and consolidation pipeline integration.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import {
  InventoryEntity,
  InventoryEntityEvidence,
  InventoryRelation,
  InventoryMatch,
  EntityType,
  EntityStatus,
  RelationType,
  InventoryStats,
  WaveAssignment,
} from '../types/models/inventory';

interface InventoryState {
  // State
  entities: Map<string, InventoryEntity>;
  evidence: Map<string, InventoryEntityEvidence[]>; // Key: inventoryEntityId
  relations: Map<string, InventoryRelation[]>; // Key: entityId (bidirectional)
  matches: Map<string, InventoryMatch[]>; // Key: sourceProfileId:targetProfileId
  waveAssignments: Map<string, WaveAssignment[]>; // Key: waveId
  isLoading: boolean;
  error: string | null;

  // Entity Actions
  addEntity: (entity: InventoryEntity) => void;
  updateEntity: (id: string, updates: Partial<InventoryEntity>) => void;
  deleteEntity: (id: string) => void;
  getEntity: (id: string) => InventoryEntity | undefined;
  getEntities: (filters?: {
    sourceProfileId?: string;
    entityType?: EntityType;
    status?: EntityStatus;
    waveId?: string;
    search?: string;
  }) => InventoryEntity[];
  clearEntities: (sourceProfileId?: string) => void;

  // Evidence Actions
  addEvidence: (evidence: InventoryEntityEvidence) => void;
  getEvidenceForEntity: (entityId: string) => InventoryEntityEvidence[];
  clearEvidence: (entityId?: string) => void;

  // Relation Actions
  addRelation: (relation: InventoryRelation) => void;
  getRelationsForEntity: (entityId: string) => InventoryRelation[];
  getOutgoingRelations: (entityId: string) => InventoryRelation[];
  getIncomingRelations: (entityId: string) => InventoryRelation[];
  deleteRelation: (id: string) => void;
  clearRelations: (sourceProfileId?: string) => void;

  // Match Actions
  addMatch: (match: InventoryMatch) => void;
  getMatches: (sourceProfileId: string, targetProfileId: string) => InventoryMatch[];
  clearMatches: (sourceProfileId?: string, targetProfileId?: string) => void;

  // Wave Assignment Actions
  assignEntityToWave: (waveId: string, assignment: WaveAssignment) => void;
  getWaveAssignments: (waveId: string) => WaveAssignment[];
  removeWaveAssignment: (waveId: string, assignmentId: string) => void;
  clearWaveAssignments: (waveId?: string) => void;

  // Consolidation Actions
  consolidateFromDiscovery: (sourceProfileId: string) => Promise<void>;
  rebuildInventory: (sourceProfileId: string) => Promise<void>;

  // Statistics
  getStats: (sourceProfileId?: string) => InventoryStats;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      entities: new Map<string, InventoryEntity>(),
      evidence: new Map<string, InventoryEntityEvidence[]>(),
      relations: new Map<string, InventoryRelation[]>(),
      matches: new Map<string, InventoryMatch[]>(),
      waveAssignments: new Map<string, WaveAssignment[]>(),
      isLoading: false,
      error: null,

      // ========================================
      // ENTITY ACTIONS
      // ========================================

      addEntity: (entity) => {
        set((state) => {
          const newEntities = new Map(state.entities);
          newEntities.set(entity.id, entity);
          return { entities: newEntities };
        });
      },

      updateEntity: (id, updates) => {
        set((state) => {
          const newEntities = new Map(state.entities);
          const entity = newEntities.get(id);
          if (entity) {
            newEntities.set(id, { ...entity, ...updates, updatedAt: new Date() });
          }
          return { entities: newEntities };
        });
      },

      deleteEntity: (id) => {
        set((state) => {
          const newEntities = new Map(state.entities);
          newEntities.delete(id);

          // Clean up related data
          const newEvidence = new Map(state.evidence);
          newEvidence.delete(id);

          const newRelations = new Map(state.relations);
          newRelations.delete(id);

          return { entities: newEntities, evidence: newEvidence, relations: newRelations };
        });
      },

      getEntity: (id) => {
        return get().entities.get(id);
      },

      getEntities: (filters) => {
        let entities = Array.from(get().entities.values());

        if (!filters) return entities;

        if (filters.sourceProfileId) {
          entities = entities.filter((e) => e.sourceProfileId === filters.sourceProfileId);
        }
        if (filters.entityType) {
          entities = entities.filter((e) => e.entityType === filters.entityType);
        }
        if (filters.status) {
          entities = entities.filter((e) => e.status === filters.status);
        }
        if (filters.waveId) {
          entities = entities.filter((e) => e.waveId === filters.waveId);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          entities = entities.filter(
            (e) =>
              e.displayName.toLowerCase().includes(searchLower) ||
              Object.values(e.externalIds).some((id) => id.toLowerCase().includes(searchLower))
          );
        }

        return entities;
      },

      clearEntities: (sourceProfileId) => {
        if (sourceProfileId) {
          set((state) => {
            const newEntities = new Map(state.entities);
            const entitiesToDelete = Array.from(newEntities.values()).filter(
              (e) => e.sourceProfileId === sourceProfileId
            );
            entitiesToDelete.forEach((e) => newEntities.delete(e.id));
            return { entities: newEntities };
          });
        } else {
          set({ entities: new Map() });
        }
      },

      // ========================================
      // EVIDENCE ACTIONS
      // ========================================

      addEvidence: (evidence) => {
        set((state) => {
          const newEvidence = new Map(state.evidence);
          const entityEvidence = newEvidence.get(evidence.inventoryEntityId) || [];
          newEvidence.set(evidence.inventoryEntityId, [...entityEvidence, evidence]);
          return { evidence: newEvidence };
        });
      },

      getEvidenceForEntity: (entityId) => {
        return get().evidence.get(entityId) || [];
      },

      clearEvidence: (entityId) => {
        if (entityId) {
          set((state) => {
            const newEvidence = new Map(state.evidence);
            newEvidence.delete(entityId);
            return { evidence: newEvidence };
          });
        } else {
          set({ evidence: new Map() });
        }
      },

      // ========================================
      // RELATION ACTIONS
      // ========================================

      addRelation: (relation) => {
        set((state) => {
          const newRelations = new Map(state.relations);

          // Store bidirectional references for efficient lookups
          [relation.fromEntityId, relation.toEntityId].forEach((entityId) => {
            const entityRelations = newRelations.get(entityId) || [];
            newRelations.set(entityId, [...entityRelations, relation]);
          });

          return { relations: newRelations };
        });
      },

      getRelationsForEntity: (entityId) => {
        return get().relations.get(entityId) || [];
      },

      getOutgoingRelations: (entityId) => {
        const allRelations = get().relations.get(entityId) || [];
        return allRelations.filter((r) => r.fromEntityId === entityId);
      },

      getIncomingRelations: (entityId) => {
        const allRelations = get().relations.get(entityId) || [];
        return allRelations.filter((r) => r.toEntityId === entityId);
      },

      deleteRelation: (id) => {
        set((state) => {
          const newRelations = new Map(state.relations);

          // Find and remove the relation from all entity maps
          for (const [entityId, relations] of newRelations.entries()) {
            const filtered = relations.filter((r) => r.id !== id);
            if (filtered.length !== relations.length) {
              newRelations.set(entityId, filtered);
            }
          }

          return { relations: newRelations };
        });
      },

      clearRelations: (sourceProfileId) => {
        if (sourceProfileId) {
          set((state) => {
            const newRelations = new Map(state.relations);

            for (const [entityId, relations] of newRelations.entries()) {
              const filtered = relations.filter((r) => r.sourceProfileId !== sourceProfileId);
              if (filtered.length > 0) {
                newRelations.set(entityId, filtered);
              } else {
                newRelations.delete(entityId);
              }
            }

            return { relations: newRelations };
          });
        } else {
          set({ relations: new Map() });
        }
      },

      // ========================================
      // MATCH ACTIONS
      // ========================================

      addMatch: (match) => {
        set((state) => {
          const newMatches = new Map(state.matches);
          const key = `${match.sourceProfileId}:${match.targetProfileId}`;
          const matches = newMatches.get(key) || [];
          newMatches.set(key, [...matches, match]);
          return { matches: newMatches };
        });
      },

      getMatches: (sourceProfileId, targetProfileId) => {
        const key = `${sourceProfileId}:${targetProfileId}`;
        return get().matches.get(key) || [];
      },

      clearMatches: (sourceProfileId, targetProfileId) => {
        if (sourceProfileId && targetProfileId) {
          set((state) => {
            const newMatches = new Map(state.matches);
            const key = `${sourceProfileId}:${targetProfileId}`;
            newMatches.delete(key);
            return { matches: newMatches };
          });
        } else if (sourceProfileId) {
          set((state) => {
            const newMatches = new Map(state.matches);
            const keysToDelete = Array.from(newMatches.keys()).filter((k) =>
              k.startsWith(`${sourceProfileId}:`)
            );
            keysToDelete.forEach((k) => newMatches.delete(k));
            return { matches: newMatches };
          });
        } else {
          set({ matches: new Map() });
        }
      },

      // ========================================
      // WAVE ASSIGNMENT ACTIONS
      // ========================================

      assignEntityToWave: (waveId, assignment) => {
        set((state) => {
          const newAssignments = new Map(state.waveAssignments);
          const waveAssignments = newAssignments.get(waveId) || [];
          newAssignments.set(waveId, [...waveAssignments, assignment]);

          // Update entity's waveId
          const newEntities = new Map(state.entities);
          const entity = newEntities.get(assignment.inventoryEntityId);
          if (entity) {
            newEntities.set(assignment.inventoryEntityId, { ...entity, waveId, updatedAt: new Date() });
          }

          return { waveAssignments: newAssignments, entities: newEntities };
        });
      },

      getWaveAssignments: (waveId) => {
        return get().waveAssignments.get(waveId) || [];
      },

      removeWaveAssignment: (waveId, assignmentId) => {
        set((state) => {
          const newAssignments = new Map(state.waveAssignments);
          const waveAssignments = newAssignments.get(waveId) || [];
          const filtered = waveAssignments.filter((a) => a.id !== assignmentId);

          // Find the entity and clear its waveId
          const removedAssignment = waveAssignments.find((a) => a.id === assignmentId);
          const newEntities = new Map(state.entities);
          if (removedAssignment) {
            const entity = newEntities.get(removedAssignment.inventoryEntityId);
            if (entity && entity.waveId === waveId) {
              newEntities.set(removedAssignment.inventoryEntityId, {
                ...entity,
                waveId: undefined,
                updatedAt: new Date(),
              });
            }
          }

          if (filtered.length > 0) {
            newAssignments.set(waveId, filtered);
          } else {
            newAssignments.delete(waveId);
          }

          return { waveAssignments: newAssignments, entities: newEntities };
        });
      },

      clearWaveAssignments: (waveId) => {
        if (waveId) {
          set((state) => {
            const newAssignments = new Map(state.waveAssignments);
            newAssignments.delete(waveId);
            return { waveAssignments: newAssignments };
          });
        } else {
          set({ waveAssignments: new Map() });
        }
      },

      // ========================================
      // CONSOLIDATION ACTIONS
      // ========================================

      consolidateFromDiscovery: async (sourceProfileId) => {
        console.log('[InventoryStore] 🔄 Starting consolidation for profile:', sourceProfileId);
        set({ isLoading: true, error: null });

        try {
          // Call backend service to consolidate
          console.log('[InventoryStore] 📞 Calling inventory:consolidate IPC handler...');
          const result = await window.electronAPI.invoke('inventory:consolidate', sourceProfileId);

          console.log('[InventoryStore] ✅ IPC result received:', {
            success: result.success,
            hasData: !!result.data,
            error: result.error
          });

          if (result.success) {
            // Load consolidated data into store
            const { entities, evidence, relations } = result.data;

            console.log('[InventoryStore] 📊 Loading consolidated data into store:', {
              entitiesCount: entities?.length || 0,
              evidenceKeys: Object.keys(evidence || {}).length,
              relationsKeys: Object.keys(relations || {}).length
            });

            set({
              entities: new Map(entities.map((e: InventoryEntity) => [e.id, e])),
              evidence: new Map(
                Object.entries(evidence).map(([entityId, evidenceList]: [string, any]) => [
                  entityId,
                  evidenceList,
                ])
              ),
              relations: new Map(
                Object.entries(relations).map(([entityId, relationList]: [string, any]) => [
                  entityId,
                  relationList,
                ])
              ),
              isLoading: false,
            });

            console.log('[InventoryStore] ✅ Consolidation complete! Entities loaded:', entities.length);
            console.log('[InventoryStore] 📋 Entity types:', {
              users: entities.filter((e: InventoryEntity) => e.entityType === 'USER').length,
              groups: entities.filter((e: InventoryEntity) => e.entityType === 'GROUP').length,
              applications: entities.filter((e: InventoryEntity) => e.entityType === 'APPLICATION').length,
              infrastructure: entities.filter((e: InventoryEntity) => e.entityType === 'INFRASTRUCTURE').length,
            });
          } else {
            console.error('[InventoryStore] ❌ Consolidation failed:', result.error);
            set({ error: result.error || 'Consolidation failed', isLoading: false });
          }
        } catch (error: any) {
          console.error('[InventoryStore] ❌ Consolidation error:', error);
          set({ error: error.message || 'Consolidation failed', isLoading: false });
        }
      },

      rebuildInventory: async (sourceProfileId) => {
        set({ isLoading: true, error: null });

        try {
          // Clear existing inventory for this profile
          get().clearEntities(sourceProfileId);
          get().clearRelations(sourceProfileId);

          // Rebuild from discovery
          await get().consolidateFromDiscovery(sourceProfileId);
        } catch (error: any) {
          console.error('[InventoryStore] Rebuild failed:', error);
          set({ error: error.message || 'Rebuild failed', isLoading: false });
        }
      },

      // ========================================
      // STATISTICS
      // ========================================

      getStats: (sourceProfileId) => {
        const entities = get().getEntities(sourceProfileId ? { sourceProfileId } : {});
        const { evidence, relations, waveAssignments } = get();

        const byType: Record<EntityType, number> = {
          USER: 0,
          GROUP: 0,
          APPLICATION: 0,
          INFRASTRUCTURE: 0,
        };

        const byStatus: Record<EntityStatus, number> = {
          DISCOVERED: 0,
          TRIAGED: 0,
          VERIFIED: 0,
          ENRICHED: 0,
          MIGRATION_READY: 0,
          MIGRATED: 0,
        };

        let totalReadiness = 0;
        let totalRisk = 0;
        let entitiesWithEvidence = 0;
        let entitiesWithRelations = 0;
        let entitiesAssignedToWaves = 0;

        for (const entity of entities) {
          byType[entity.entityType]++;
          byStatus[entity.status]++;
          if (entity.readinessScore) totalReadiness += entity.readinessScore;
          if (entity.riskScore) totalRisk += entity.riskScore;
          if (evidence.has(entity.id)) entitiesWithEvidence++;
          if (relations.has(entity.id)) entitiesWithRelations++;
          if (entity.waveId) entitiesAssignedToWaves++;
        }

        return {
          totalEntities: entities.length,
          byType,
          byStatus,
          averageReadiness: entities.length > 0 ? totalReadiness / entities.length : 0,
          averageRisk: entities.length > 0 ? totalRisk / entities.length : 0,
          entitiesWithEvidence,
          entitiesWithRelations,
          entitiesAssignedToWaves,
        };
      },

      // ========================================
      // UTILITY ACTIONS
      // ========================================

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearAll: () => {
        set({
          entities: new Map(),
          evidence: new Map(),
          relations: new Map(),
          matches: new Map(),
          waveAssignments: new Map(),
          isLoading: false,
          error: null,
        });
      },
    })),
    { name: 'InventoryStore' }
  )
);

export default useInventoryStore;
