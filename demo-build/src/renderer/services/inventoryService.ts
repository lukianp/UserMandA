/**
 * Inventory Service
 *
 * Manages the consolidated inventory layer that unifies raw discovery outputs
 * into canonical entities with typed relationships and evidence tracking.
 */

import {
  InventoryEntity,
  InventoryEntityEvidence,
  InventoryRelation,
  InventoryMatch,
  EntityType,
  EntityStatus,
  RelationType,
  InventoryStats,
} from '../types/models/inventory';

/**
 * Inventory Service Class
 *
 * Provides CRUD operations for inventory entities, evidence, and relations,
 * plus consolidation pipeline to build inventory from raw discovery CSVs.
 */
export class InventoryService {
  private entities: Map<string, InventoryEntity> = new Map();
  private evidence: Map<string, InventoryEntityEvidence[]> = new Map();
  private relations: Map<string, InventoryRelation[]> = new Map();
  private matches: Map<string, InventoryMatch[]> = new Map();

  // ============================================================================
  // Entity CRUD Operations
  // ============================================================================

  /**
   * Create a new inventory entity
   */
  async createEntity(entity: Omit<InventoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryEntity> {
    const newEntity: InventoryEntity = {
      ...entity,
      id: this.generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.entities.set(newEntity.id, newEntity);
    return newEntity;
  }

  /**
   * Get entities with optional filtering
   */
  async getEntities(filters?: {
    sourceProfileId?: string;
    entityType?: EntityType;
    status?: EntityStatus;
    search?: string;
    waveId?: string;
  }): Promise<InventoryEntity[]> {
    let entities = Array.from(this.entities.values());

    if (filters?.sourceProfileId) {
      entities = entities.filter((e) => e.sourceProfileId === filters.sourceProfileId);
    }
    if (filters?.entityType) {
      entities = entities.filter((e) => e.entityType === filters.entityType);
    }
    if (filters?.status) {
      entities = entities.filter((e) => e.status === filters.status);
    }
    if (filters?.waveId) {
      entities = entities.filter((e) => e.waveId === filters.waveId);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      entities = entities.filter(
        (e) =>
          e.displayName.toLowerCase().includes(searchLower) ||
          Object.values(e.externalIds).some((id) => id.toLowerCase().includes(searchLower))
      );
    }

    return entities;
  }

  /**
   * Get a single entity by ID
   */
  async getEntity(id: string): Promise<InventoryEntity | null> {
    return this.entities.get(id) || null;
  }

  /**
   * Update an existing entity
   */
  async updateEntity(id: string, updates: Partial<InventoryEntity>): Promise<InventoryEntity | null> {
    const entity = this.entities.get(id);
    if (!entity) return null;

    const updatedEntity = { ...entity, ...updates, updatedAt: new Date() };
    this.entities.set(id, updatedEntity);
    return updatedEntity;
  }

  /**
   * Delete an entity
   */
  async deleteEntity(id: string): Promise<boolean> {
    const deleted = this.entities.delete(id);
    if (deleted) {
      // Clean up related evidence and relations
      this.evidence.delete(id);
      this.relations.delete(id);
    }
    return deleted;
  }

  // ============================================================================
  // Evidence Management
  // ============================================================================

  /**
   * Add evidence from a discovery module
   */
  async addEvidence(evidence: Omit<InventoryEntityEvidence, 'id'>): Promise<InventoryEntityEvidence> {
    const newEvidence: InventoryEntityEvidence = {
      ...evidence,
      id: this.generateUUID(),
    };

    if (!this.evidence.has(evidence.inventoryEntityId)) {
      this.evidence.set(evidence.inventoryEntityId, []);
    }
    this.evidence.get(evidence.inventoryEntityId)!.push(newEvidence);

    return newEvidence;
  }

  /**
   * Get all evidence for an entity
   */
  async getEvidenceForEntity(entityId: string): Promise<InventoryEntityEvidence[]> {
    return this.evidence.get(entityId) || [];
  }

  // ============================================================================
  // Relations Management
  // ============================================================================

  /**
   * Create a typed relation between entities
   */
  async createRelation(relation: Omit<InventoryRelation, 'id' | 'createdAt'>): Promise<InventoryRelation> {
    const newRelation: InventoryRelation = {
      ...relation,
      id: this.generateUUID(),
      createdAt: new Date(),
    };

    // Store bidirectional references for efficient lookups
    [relation.fromEntityId, relation.toEntityId].forEach((entityId) => {
      if (!this.relations.has(entityId)) {
        this.relations.set(entityId, []);
      }
      this.relations.get(entityId)!.push(newRelation);
    });

    return newRelation;
  }

  /**
   * Get all relations for an entity (both incoming and outgoing)
   */
  async getRelationsForEntity(entityId: string): Promise<InventoryRelation[]> {
    return this.relations.get(entityId) || [];
  }

  /**
   * Get outgoing relations (where entity is the source)
   */
  async getOutgoingRelations(entityId: string): Promise<InventoryRelation[]> {
    const allRelations = await this.getRelationsForEntity(entityId);
    return allRelations.filter((r) => r.fromEntityId === entityId);
  }

  /**
   * Get incoming relations (where entity is the target)
   */
  async getIncomingRelations(entityId: string): Promise<InventoryRelation[]> {
    const allRelations = await this.getRelationsForEntity(entityId);
    return allRelations.filter((r) => r.toEntityId === entityId);
  }

  // ============================================================================
  // Matching Management
  // ============================================================================

  /**
   * Create a cross-profile entity match
   */
  async createMatch(match: Omit<InventoryMatch, 'id' | 'createdAt'>): Promise<InventoryMatch> {
    const newMatch: InventoryMatch = {
      ...match,
      id: this.generateUUID(),
      createdAt: new Date(),
    };

    const key = `${match.sourceProfileId}:${match.targetProfileId}`;
    if (!this.matches.has(key)) {
      this.matches.set(key, []);
    }
    this.matches.get(key)!.push(newMatch);

    return newMatch;
  }

  /**
   * Get matches between two profiles
   */
  async getMatches(sourceProfileId: string, targetProfileId: string): Promise<InventoryMatch[]> {
    const key = `${sourceProfileId}:${targetProfileId}`;
    return this.matches.get(key) || [];
  }

  // ============================================================================
  // Consolidation Pipeline
  // ============================================================================

  /**
   * Main consolidation pipeline
   *
   * Reads raw discovery CSV files and builds consolidated inventory with:
   * - Canonical entities (USER, GROUP, APPLICATION, INFRASTRUCTURE)
   * - Evidence tracking (which modules discovered each entity)
   * - Typed relationships (MEMBER_OF_GROUP, OWNS_APPLICATION, etc.)
   * - Readiness and risk scoring
   */
  async consolidateFromDiscovery(sourceProfileId: string): Promise<void> {
    console.log(`[InventoryService] Starting consolidation for profile: ${sourceProfileId}`);

    try {
      // Get all discovery files for the profile (would call IPC handler)
      // For now, this is a placeholder - will be implemented with IPC integration
      console.log('[InventoryService] Getting discovery files...');

      // Phase 1: Process each discovery file and create entities
      console.log('[InventoryService] Phase 1: Creating entities from discovery...');
      // await this.processDiscoveryFiles(sourceProfileId);

      // Phase 2: Build relations after all entities are created
      console.log('[InventoryService] Phase 2: Building relationships...');
      await this.buildRelations(sourceProfileId);

      // Phase 3: Calculate readiness and risk scores
      console.log('[InventoryService] Phase 3: Calculating scores...');
      await this.calculateReadinessScores(sourceProfileId);

      console.log(`[InventoryService] Consolidation complete. Total entities: ${this.entities.size}`);
    } catch (error) {
      console.error('[InventoryService] Consolidation failed:', error);
      throw error;
    }
  }

  /**
   * Build typed relationships from evidence data
   */
  private async buildRelations(sourceProfileId: string): Promise<void> {
    const entities = await this.getEntities({ sourceProfileId });

    // Get entities by type for efficient lookups
    const users = entities.filter((e) => e.entityType === 'USER');
    const groups = entities.filter((e) => e.entityType === 'GROUP');
    const applications = entities.filter((e) => e.entityType === 'APPLICATION');
    const infrastructure = entities.filter((e) => e.entityType === 'INFRASTRUCTURE');

    console.log(`[InventoryService] Building relations for ${entities.length} entities...`);

    // Build USER → GROUP relations from group membership data
    for (const user of users) {
      const userEvidence = await this.getEvidenceForEntity(user.id);
      for (const evidence of userEvidence) {
        if (evidence.payloadSnapshot && evidence.payloadSnapshot.groupMemberships) {
          const groupNames = evidence.payloadSnapshot.groupMemberships.split(';');
          for (const groupName of groupNames) {
            const group = groups.find((g) => g.displayName === groupName.trim());
            if (group) {
              await this.createRelation({
                sourceProfileId,
                fromEntityId: user.id,
                toEntityId: group.id,
                relationType: 'MEMBER_OF_GROUP',
                metadata: {
                  source: evidence.module,
                  confidence: 1.0,
                },
              });
            }
          }
        }
      }
    }

    // Build USER/GROUP → APPLICATION relations from ownership/assignments
    for (const app of applications) {
      const appEvidence = await this.getEvidenceForEntity(app.id);
      for (const evidence of appEvidence) {
        // Check for owners
        if (evidence.payloadSnapshot?.owners) {
          const owners = evidence.payloadSnapshot.owners.split(';');
          for (const owner of owners) {
            const ownerEntity = entities.find(
              (e) =>
                e.externalIds.upn === owner ||
                e.externalIds.email === owner ||
                e.displayName === owner
            );
            if (ownerEntity) {
              await this.createRelation({
                sourceProfileId,
                fromEntityId: ownerEntity.id,
                toEntityId: app.id,
                relationType: 'OWNS_APPLICATION',
                metadata: {
                  source: evidence.module,
                  role: 'owner',
                },
              });
            }
          }
        }

        // Check for service accounts (APPLICATION → USER)
        if (evidence.payloadSnapshot?.serviceAccount) {
          const serviceUser = users.find(
            (u) =>
              u.externalIds.upn === evidence.payloadSnapshot.serviceAccount ||
              u.externalIds.email === evidence.payloadSnapshot.serviceAccount
          );
          if (serviceUser) {
            await this.createRelation({
              sourceProfileId,
              fromEntityId: app.id,
              toEntityId: serviceUser.id,
              relationType: 'APP_USES_IDENTITY',
              metadata: {
                source: evidence.module,
              },
            });
          }
        }
      }
    }

    // Build APPLICATION → INFRASTRUCTURE relations (hosted on)
    for (const app of applications) {
      const appEvidence = await this.getEvidenceForEntity(app.id);
      for (const evidence of appEvidence) {
        if (evidence.payloadSnapshot?.hostServer || evidence.payloadSnapshot?.computerName) {
          const hostName =
            evidence.payloadSnapshot.hostServer || evidence.payloadSnapshot.computerName;
          const host = infrastructure.find(
            (i) => i.displayName === hostName || i.externalIds.hostname === hostName
          );
          if (host) {
            await this.createRelation({
              sourceProfileId,
              fromEntityId: app.id,
              toEntityId: host.id,
              relationType: 'HOSTED_ON',
              metadata: {
                source: evidence.module,
              },
            });
          }
        }
      }
    }

    console.log(`[InventoryService] Relations built: ${Array.from(this.relations.values()).flat().length}`);
  }

  /**
   * Calculate readiness and risk scores for entities
   */
  private async calculateReadinessScores(sourceProfileId: string): Promise<void> {
    const entities = await this.getEntities({ sourceProfileId });

    for (const entity of entities) {
      let readinessScore = 0;
      let riskScore = 0;

      // Get relations and evidence
      const relations = await this.getRelationsForEntity(entity.id);
      const evidence = await this.getEvidenceForEntity(entity.id);

      // Readiness factors
      if (relations.length > 0) readinessScore += 0.3; // Has relationships
      if (evidence.length > 1) readinessScore += 0.2; // Multiple evidence sources
      if (Object.keys(entity.externalIds).length > 1) readinessScore += 0.2; // Complete IDs
      if (entity.status !== 'DISCOVERED') readinessScore += 0.3; // Enriched/verified

      // Risk factors
      if (entity.entityType === 'APPLICATION') {
        const owners = relations.filter((r) => r.relationType === 'OWNS_APPLICATION');
        if (owners.length === 0) riskScore += 0.3; // No owners = risky
      }

      if (entity.entityType === 'USER') {
        const groups = relations.filter((r) => r.relationType === 'MEMBER_OF_GROUP');
        if (groups.length === 0) riskScore += 0.2; // Orphaned user
      }

      if (evidence.length < 2) riskScore += 0.2; // Single source = less validated

      await this.updateEntity(entity.id, {
        readinessScore: Math.min(readinessScore, 1.0),
        riskScore: Math.min(riskScore, 1.0),
      });
    }

    console.log(`[InventoryService] Readiness scores calculated for ${entities.length} entities`);
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get inventory statistics
   */
  async getStats(sourceProfileId?: string): Promise<InventoryStats> {
    const entities = await this.getEntities(sourceProfileId ? { sourceProfileId } : {});

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
      if (this.evidence.has(entity.id)) entitiesWithEvidence++;
      if (this.relations.has(entity.id)) entitiesWithRelations++;
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
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Generate a UUID (simplified version)
   */
  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing)
   */
  async clear(): Promise<void> {
    this.entities.clear();
    this.evidence.clear();
    this.relations.clear();
    this.matches.clear();
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();


