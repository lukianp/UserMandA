/**
 * Inventory Service
 *
 * Consolidates raw discovery outputs into canonical entities with typed relationships.
 * Provides CRUD operations for inventory management and migration planning support.
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Type imports (these would normally come from shared types)
type InventoryEntityType = 'USER' | 'GROUP' | 'APPLICATION' | 'INFRASTRUCTURE' | 'MAILBOX' | 'SHAREPOINT_SITE' | 'TEAMS_TEAM' | 'DEVICE' | 'SERVER' | 'DATABASE' | 'VIRTUAL_MACHINE' | 'STORAGE' | 'NETWORK_RESOURCE';
type InventoryEntityStatus = 'DISCOVERED' | 'TRIAGED' | 'VERIFIED' | 'ENRICHED' | 'MAPPED' | 'MIGRATION_READY' | 'MIGRATION_PLANNED' | 'MIGRATING' | 'MIGRATED' | 'MIGRATION_FAILED' | 'ARCHIVED';
type InventoryRelationType = 'MEMBER_OF_GROUP' | 'OWNER_OF_GROUP' | 'OWNS_APPLICATION' | 'ASSIGNED_TO_APP' | 'CONSENTS_TO_APP' | 'ADMIN_OF_APP' | 'APP_USES_IDENTITY' | 'APP_DEPENDS_ON' | 'APP_PROVIDES_API' | 'APP_CONSUMES_API' | 'HOSTED_ON' | 'CONNECTS_TO' | 'STORES_DATA_IN' | 'BACKED_UP_BY' | 'MONITORED_BY' | 'HAS_MAILBOX' | 'MEMBER_OF_TEAM' | 'OWNER_OF_SITE' | 'HAS_ONEDRIVE' | 'OWNS_DEVICE' | 'REGISTERED_DEVICE' | 'MANAGED_DEVICE';
type DiscoveryModule = 'ENTRA_USERS' | 'ENTRA_GROUPS' | 'ENTRA_APPLICATIONS' | 'ENTRA_SERVICE_PRINCIPALS' | 'ACTIVE_DIRECTORY_USERS' | 'ACTIVE_DIRECTORY_GROUPS' | 'ACTIVE_DIRECTORY_COMPUTERS' | 'AZURE_RESOURCES' | 'AZURE_SUBSCRIPTIONS' | 'AZURE_VIRTUAL_MACHINES' | 'EXCHANGE_MAILBOXES' | 'EXCHANGE_DISTRIBUTION_LISTS' | 'SHAREPOINT_SITES' | 'TEAMS_TEAMS' | 'ONEDRIVE_ACCOUNTS' | 'INTUNE_DEVICES' | 'SQL_SERVERS' | 'FILE_SERVERS' | 'NETWORK_INFRASTRUCTURE' | 'VMWARE_VMS' | 'HYPERV_VMS' | 'CONDITIONAL_ACCESS' | 'LICENSES' | 'UNKNOWN';

interface ExternalIdentifiers {
  objectId?: string;
  upn?: string;
  email?: string;
  onPremisesSid?: string;
  immutableId?: string;
  appId?: string;
  servicePrincipalId?: string;
  azureResourceId?: string;
  samAccountName?: string;
  distinguishedName?: string;
  hostname?: string;
  ipAddress?: string;
  macAddress?: string;
  custom?: Record<string, string>;
}

interface InventoryEntity {
  id: string;
  sourceProfileId: string;
  targetProfileId?: string;
  entityType: InventoryEntityType;
  displayName: string;
  description?: string;
  externalIds: ExternalIdentifiers;
  status: InventoryEntityStatus;
  readinessScore?: number;
  riskScore?: number;
  complexityScore?: number;
  waveId?: string;
  wavePriority?: number;
  tags: string[];
  metadata: Record<string, any>;
  discoveredBy: DiscoveryModule[];
  evidenceCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastDiscoveredAt?: Date | string;
}

interface InventoryEntityEvidence {
  id: string;
  inventoryEntityId: string;
  module: DiscoveryModule;
  sourceRecordRef: string;
  sourceFilePath?: string;
  sourceLineNumber?: number;
  observedAt: Date | string;
  confidence: number;
  payloadSnapshot?: Record<string, any>;
  isActive: boolean;
}

interface InventoryRelation {
  id: string;
  sourceProfileId: string;
  fromEntityId: string;
  toEntityId: string;
  relationType: InventoryRelationType;
  direction: 'OUTBOUND' | 'INBOUND' | 'BIDIRECTIONAL';
  confidence: number;
  metadata?: Record<string, any>;
  derivedFrom?: DiscoveryModule;
  createdAt: Date | string;
  isActive: boolean;
}

interface InventoryMatch {
  id: string;
  sourceProfileId: string;
  targetProfileId: string;
  sourceEntityId: string;
  targetEntityId: string;
  matchType: 'EXACT_ID' | 'EMAIL_UPN' | 'DISPLAYNAME_HEURISTIC' | 'SID_MATCH' | 'IMMUTABLE_ID' | 'ANCHOR_ATTRIBUTE' | 'MANUAL';
  confidence: number;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date | string;
  createdAt: Date | string;
}

interface InventoryEntityFilter {
  sourceProfileId?: string;
  targetProfileId?: string;
  entityTypes?: InventoryEntityType[];
  statuses?: InventoryEntityStatus[];
  waveId?: string;
  hasWaveAssignment?: boolean;
  search?: string;
  tags?: string[];
  minReadinessScore?: number;
  maxRiskScore?: number;
  discoveredBy?: DiscoveryModule[];
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface InventoryStatistics {
  entityCountByType: Record<InventoryEntityType, number>;
  entityCountByStatus: Record<InventoryEntityStatus, number>;
  relationCountByType: Record<InventoryRelationType, number>;
  totalEntities: number;
  totalRelations: number;
  totalEvidence: number;
  assignedToWaves: number;
  migrationReady: number;
  averageReadinessScore: number;
  averageRiskScore: number;
  multiSourceEntities: number;
  lastConsolidatedAt?: Date | string;
  lastConsolidationDuration?: number;
}

interface ConsolidationResult {
  success: boolean;
  error?: string;
  entitiesCreated: number;
  entitiesUpdated: number;
  relationsCreated: number;
  evidenceAdded: number;
  duration: number;
  filesProcessed: string[];
  completedAt: Date | string;
}

// File pattern to module mapping
const FILE_MODULE_MAPPING: Record<string, DiscoveryModule> = {
  'users': 'ENTRA_USERS',
  'entrauser': 'ENTRA_USERS',
  'adusers': 'ACTIVE_DIRECTORY_USERS',
  'groups': 'ENTRA_GROUPS',
  'entragroup': 'ENTRA_GROUPS',
  'adgroups': 'ACTIVE_DIRECTORY_GROUPS',
  'applications': 'ENTRA_APPLICATIONS',
  'apps': 'ENTRA_APPLICATIONS',
  'entraapp': 'ENTRA_APPLICATIONS',
  'entraidapp': 'ENTRA_APPLICATIONS',
  'serviceprincipal': 'ENTRA_SERVICE_PRINCIPALS',
  'computers': 'ACTIVE_DIRECTORY_COMPUTERS',
  'azure': 'AZURE_RESOURCES',
  'azureresource': 'AZURE_RESOURCES',
  'virtualmachine': 'AZURE_VIRTUAL_MACHINES',
  'vm': 'AZURE_VIRTUAL_MACHINES',
  'mailbox': 'EXCHANGE_MAILBOXES',
  'exchange': 'EXCHANGE_MAILBOXES',
  'distributionlist': 'EXCHANGE_DISTRIBUTION_LISTS',
  'sharepoint': 'SHAREPOINT_SITES',
  'spsite': 'SHAREPOINT_SITES',
  'teams': 'TEAMS_TEAMS',
  'onedrive': 'ONEDRIVE_ACCOUNTS',
  'intune': 'INTUNE_DEVICES',
  'device': 'INTUNE_DEVICES',
  'sqlserver': 'SQL_SERVERS',
  'sql': 'SQL_SERVERS',
  'fileserver': 'FILE_SERVERS',
  'network': 'NETWORK_INFRASTRUCTURE',
  'vmware': 'VMWARE_VMS',
  'hyperv': 'HYPERV_VMS',
  'conditionalaccess': 'CONDITIONAL_ACCESS',
  'license': 'LICENSES',
};

/**
 * InventoryService - Manages consolidated inventory entities
 */
export class InventoryService {
  private entities: Map<string, InventoryEntity> = new Map();
  private evidence: Map<string, InventoryEntityEvidence[]> = new Map();
  private relations: Map<string, InventoryRelation> = new Map();
  private matches: Map<string, InventoryMatch> = new Map();
  private entityRelationIndex: Map<string, string[]> = new Map(); // entityId -> relationIds

  // ========================================
  // Entity CRUD Operations
  // ========================================

  /**
   * Create a new inventory entity
   */
  async createEntity(
    entityData: Omit<InventoryEntity, 'id' | 'createdAt' | 'updatedAt' | 'evidenceCount'>
  ): Promise<InventoryEntity> {
    const entity: InventoryEntity = {
      ...entityData,
      id: uuidv4(),
      evidenceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.entities.set(entity.id, entity);
    console.log(`[InventoryService] Created entity: ${entity.displayName} (${entity.entityType})`);
    return entity;
  }

  /**
   * Get entities with filtering
   */
  async getEntities(filters?: InventoryEntityFilter): Promise<InventoryEntity[]> {
    let entities = Array.from(this.entities.values());

    if (filters) {
      // Apply filters
      if (filters.sourceProfileId) {
        entities = entities.filter(e => e.sourceProfileId === filters.sourceProfileId);
      }
      if (filters.targetProfileId) {
        entities = entities.filter(e => e.targetProfileId === filters.targetProfileId);
      }
      if (filters.entityTypes && filters.entityTypes.length > 0) {
        entities = entities.filter(e => filters.entityTypes!.includes(e.entityType));
      }
      if (filters.statuses && filters.statuses.length > 0) {
        entities = entities.filter(e => filters.statuses!.includes(e.status));
      }
      if (filters.waveId) {
        entities = entities.filter(e => e.waveId === filters.waveId);
      }
      if (typeof filters.hasWaveAssignment === 'boolean') {
        entities = entities.filter(e =>
          filters.hasWaveAssignment ? !!e.waveId : !e.waveId
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        entities = entities.filter(e =>
          e.displayName.toLowerCase().includes(searchLower) ||
          e.externalIds.upn?.toLowerCase().includes(searchLower) ||
          e.externalIds.email?.toLowerCase().includes(searchLower) ||
          e.externalIds.objectId?.toLowerCase().includes(searchLower) ||
          Object.values(e.externalIds.custom || {}).some(v => v.toLowerCase().includes(searchLower))
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        entities = entities.filter(e =>
          filters.tags!.some(tag => e.tags.includes(tag))
        );
      }
      if (typeof filters.minReadinessScore === 'number') {
        entities = entities.filter(e =>
          (e.readinessScore ?? 0) >= filters.minReadinessScore!
        );
      }
      if (typeof filters.maxRiskScore === 'number') {
        entities = entities.filter(e =>
          (e.riskScore ?? 0) <= filters.maxRiskScore!
        );
      }
      if (filters.discoveredBy && filters.discoveredBy.length > 0) {
        entities = entities.filter(e =>
          filters.discoveredBy!.some(mod => e.discoveredBy.includes(mod))
        );
      }

      // Sorting
      if (filters.sortBy) {
        const sortDir = filters.sortDirection === 'desc' ? -1 : 1;
        entities.sort((a, b) => {
          let aVal: any = a[filters.sortBy as keyof InventoryEntity];
          let bVal: any = b[filters.sortBy as keyof InventoryEntity];
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          if (aVal < bVal) return -1 * sortDir;
          if (aVal > bVal) return 1 * sortDir;
          return 0;
        });
      }

      // Pagination
      if (typeof filters.offset === 'number') {
        entities = entities.slice(filters.offset);
      }
      if (typeof filters.limit === 'number') {
        entities = entities.slice(0, filters.limit);
      }
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
   * Get entity with full details including evidence and relations
   */
  async getEntityDetail(id: string): Promise<{
    entity: InventoryEntity | null;
    evidence: InventoryEntityEvidence[];
    relations: InventoryRelation[];
  }> {
    const entity = this.entities.get(id) || null;
    const entityEvidence = this.evidence.get(id) || [];
    const relationIds = this.entityRelationIndex.get(id) || [];
    const entityRelations = relationIds
      .map(rid => this.relations.get(rid))
      .filter((r): r is InventoryRelation => r !== undefined);

    return {
      entity,
      evidence: entityEvidence,
      relations: entityRelations,
    };
  }

  /**
   * Update an inventory entity
   */
  async updateEntity(
    id: string,
    updates: Partial<InventoryEntity>
  ): Promise<InventoryEntity | null> {
    const entity = this.entities.get(id);
    if (!entity) return null;

    const updatedEntity: InventoryEntity = {
      ...entity,
      ...updates,
      id: entity.id, // Preserve ID
      createdAt: entity.createdAt, // Preserve creation time
      updatedAt: new Date().toISOString(),
    };

    this.entities.set(id, updatedEntity);
    return updatedEntity;
  }

  /**
   * Delete an inventory entity
   */
  async deleteEntity(id: string): Promise<boolean> {
    const deleted = this.entities.delete(id);
    if (deleted) {
      // Clean up evidence
      this.evidence.delete(id);
      // Clean up relations
      const relationIds = this.entityRelationIndex.get(id) || [];
      relationIds.forEach(rid => this.relations.delete(rid));
      this.entityRelationIndex.delete(id);
    }
    return deleted;
  }

  // ========================================
  // Evidence Management
  // ========================================

  /**
   * Add evidence for an entity
   */
  async addEvidence(
    evidenceData: Omit<InventoryEntityEvidence, 'id'>
  ): Promise<InventoryEntityEvidence> {
    const evidence: InventoryEntityEvidence = {
      ...evidenceData,
      id: uuidv4(),
    };

    if (!this.evidence.has(evidence.inventoryEntityId)) {
      this.evidence.set(evidence.inventoryEntityId, []);
    }
    this.evidence.get(evidence.inventoryEntityId)!.push(evidence);

    // Update entity evidence count
    const entity = this.entities.get(evidence.inventoryEntityId);
    if (entity) {
      entity.evidenceCount = (this.evidence.get(evidence.inventoryEntityId) || []).length;
    }

    return evidence;
  }

  /**
   * Get evidence for an entity
   */
  async getEvidenceForEntity(entityId: string): Promise<InventoryEntityEvidence[]> {
    return this.evidence.get(entityId) || [];
  }

  // ========================================
  // Relation Management
  // ========================================

  /**
   * Create a relation between entities
   */
  async createRelation(
    relationData: Omit<InventoryRelation, 'id' | 'createdAt'>
  ): Promise<InventoryRelation> {
    const relation: InventoryRelation = {
      ...relationData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    this.relations.set(relation.id, relation);

    // Update index for both entities
    [relation.fromEntityId, relation.toEntityId].forEach(entityId => {
      if (!this.entityRelationIndex.has(entityId)) {
        this.entityRelationIndex.set(entityId, []);
      }
      this.entityRelationIndex.get(entityId)!.push(relation.id);
    });

    return relation;
  }

  /**
   * Get relations for an entity
   */
  async getRelationsForEntity(entityId: string): Promise<InventoryRelation[]> {
    const relationIds = this.entityRelationIndex.get(entityId) || [];
    return relationIds
      .map(rid => this.relations.get(rid))
      .filter((r): r is InventoryRelation => r !== undefined && r.isActive);
  }

  /**
   * Get all relations
   */
  async getAllRelations(filter?: { sourceProfileId?: string; relationTypes?: InventoryRelationType[] }): Promise<InventoryRelation[]> {
    let relations = Array.from(this.relations.values()).filter(r => r.isActive);

    if (filter?.sourceProfileId) {
      relations = relations.filter(r => r.sourceProfileId === filter.sourceProfileId);
    }
    if (filter?.relationTypes && filter.relationTypes.length > 0) {
      relations = relations.filter(r => filter.relationTypes!.includes(r.relationType));
    }

    return relations;
  }

  // ========================================
  // Consolidation Pipeline
  // ========================================

  /**
   * Consolidate all discovery data for a profile
   */
  async consolidateFromDiscovery(
    sourceProfileId: string,
    dataPath: string,
    options?: { forceFullRebuild?: boolean }
  ): Promise<ConsolidationResult> {
    const startTime = Date.now();
    const filesProcessed: string[] = [];
    let entitiesCreated = 0;
    let entitiesUpdated = 0;
    let relationsCreated = 0;
    let evidenceAdded = 0;

    try {
      console.log(`[InventoryService] Starting consolidation for profile: ${sourceProfileId}`);
      console.log(`[InventoryService] Data path: ${dataPath}`);

      // Clear existing data if force rebuild
      if (options?.forceFullRebuild) {
        await this.clearProfileData(sourceProfileId);
      }

      // Find all CSV files in the Raw directory
      const rawPath = path.join(dataPath, 'Raw');
      if (!fs.existsSync(rawPath)) {
        console.log(`[InventoryService] Raw path does not exist: ${rawPath}`);
        return {
          success: true,
          entitiesCreated: 0,
          entitiesUpdated: 0,
          relationsCreated: 0,
          evidenceAdded: 0,
          duration: Date.now() - startTime,
          filesProcessed: [],
          completedAt: new Date().toISOString(),
        };
      }

      const csvFiles = fs.readdirSync(rawPath)
        .filter(f => f.toLowerCase().endsWith('.csv'))
        .map(f => path.join(rawPath, f));

      console.log(`[InventoryService] Found ${csvFiles.length} CSV files to process`);

      // Process each file
      for (const filePath of csvFiles) {
        try {
          const result = await this.processDiscoveryFile(filePath, sourceProfileId);
          filesProcessed.push(filePath);
          entitiesCreated += result.created;
          entitiesUpdated += result.updated;
          evidenceAdded += result.evidence;
        } catch (err) {
          console.error(`[InventoryService] Error processing file ${filePath}:`, err);
        }
      }

      // Build relations after all entities are created
      const relationResult = await this.buildRelations(sourceProfileId);
      relationsCreated = relationResult.created;

      // Calculate scores
      await this.calculateScores(sourceProfileId);

      const duration = Date.now() - startTime;
      console.log(`[InventoryService] Consolidation complete in ${duration}ms`);
      console.log(`[InventoryService] Entities: ${entitiesCreated} created, ${entitiesUpdated} updated`);
      console.log(`[InventoryService] Relations: ${relationsCreated} created`);
      console.log(`[InventoryService] Evidence: ${evidenceAdded} added`);

      return {
        success: true,
        entitiesCreated,
        entitiesUpdated,
        relationsCreated,
        evidenceAdded,
        duration,
        filesProcessed,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      const err = error as Error;
      console.error('[InventoryService] Consolidation failed:', err);
      return {
        success: false,
        error: err.message,
        entitiesCreated,
        entitiesUpdated,
        relationsCreated,
        evidenceAdded,
        duration: Date.now() - startTime,
        filesProcessed,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Process a single discovery CSV file
   */
  private async processDiscoveryFile(
    filePath: string,
    sourceProfileId: string
  ): Promise<{ created: number; updated: number; evidence: number }> {
    const fileName = path.basename(filePath).toLowerCase();
    const module = this.getModuleFromFileName(fileName);

    console.log(`[InventoryService] Processing: ${fileName} (module: ${module})`);

    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.trim()) {
      return { created: 0, updated: 0, evidence: 0 };
    }

    let records: any[];
    try {
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
      });
    } catch (parseError) {
      console.error(`[InventoryService] CSV parse error for ${fileName}:`, parseError);
      return { created: 0, updated: 0, evidence: 0 };
    }

    let created = 0;
    let updated = 0;
    let evidenceCount = 0;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const result = await this.processRecord(record, module, sourceProfileId, filePath, i + 2);

      if (result.isNew) created++;
      else updated++;
      evidenceCount++;
    }

    return { created, updated, evidence: evidenceCount };
  }

  /**
   * Process a single record from discovery
   */
  private async processRecord(
    record: any,
    module: DiscoveryModule,
    sourceProfileId: string,
    filePath: string,
    lineNumber: number
  ): Promise<{ entity: InventoryEntity; isNew: boolean }> {
    // Determine entity type and extract identifiers
    const { entityType, displayName, externalIds, description } = this.extractEntityData(record, module);

    // Check for existing entity
    const existingEntity = this.findExistingEntity(sourceProfileId, entityType, externalIds);

    let entity: InventoryEntity;
    let isNew = false;

    if (existingEntity) {
      // Update existing entity
      entity = await this.updateEntity(existingEntity.id, {
        displayName: displayName || existingEntity.displayName,
        externalIds: { ...existingEntity.externalIds, ...externalIds },
        discoveredBy: [...new Set([...existingEntity.discoveredBy, module])],
        lastDiscoveredAt: new Date().toISOString(),
      }) as InventoryEntity;
    } else {
      // Create new entity
      entity = await this.createEntity({
        sourceProfileId,
        entityType,
        displayName: displayName || 'Unknown',
        description,
        externalIds,
        status: 'DISCOVERED',
        tags: [],
        metadata: {},
        discoveredBy: [module],
        lastDiscoveredAt: new Date().toISOString(),
      });
      isNew = true;
    }

    // Add evidence
    await this.addEvidence({
      inventoryEntityId: entity.id,
      module,
      sourceRecordRef: this.getRecordRef(record),
      sourceFilePath: filePath,
      sourceLineNumber: lineNumber,
      observedAt: new Date().toISOString(),
      confidence: 1.0,
      payloadSnapshot: this.sanitizePayload(record),
      isActive: true,
    });

    return { entity, isNew };
  }

  /**
   * Extract entity data from a record based on module type
   */
  private extractEntityData(
    record: any,
    module: DiscoveryModule
  ): {
    entityType: InventoryEntityType;
    displayName: string;
    externalIds: ExternalIdentifiers;
    description?: string;
  } {
    const normalize = (val: any) => (val && String(val).trim()) || undefined;

    switch (module) {
      case 'ENTRA_USERS':
      case 'ACTIVE_DIRECTORY_USERS':
        return {
          entityType: 'USER',
          displayName: normalize(record.displayName) || normalize(record.DisplayName) || normalize(record.userPrincipalName) || normalize(record.UserPrincipalName) || 'Unknown User',
          externalIds: {
            objectId: normalize(record.id) || normalize(record.objectId) || normalize(record.ObjectId),
            upn: normalize(record.userPrincipalName) || normalize(record.UserPrincipalName),
            email: normalize(record.mail) || normalize(record.Mail) || normalize(record.email) || normalize(record.Email),
            onPremisesSid: normalize(record.onPremisesSecurityIdentifier) || normalize(record.SID),
            samAccountName: normalize(record.onPremisesSamAccountName) || normalize(record.SamAccountName),
            distinguishedName: normalize(record.onPremisesDistinguishedName) || normalize(record.DistinguishedName),
            immutableId: normalize(record.onPremisesImmutableId) || normalize(record.ImmutableId),
          },
          description: normalize(record.jobTitle) || normalize(record.JobTitle),
        };

      case 'ENTRA_GROUPS':
      case 'ACTIVE_DIRECTORY_GROUPS':
        return {
          entityType: 'GROUP',
          displayName: normalize(record.displayName) || normalize(record.DisplayName) || normalize(record.Name) || 'Unknown Group',
          externalIds: {
            objectId: normalize(record.id) || normalize(record.objectId) || normalize(record.ObjectId),
            email: normalize(record.mail) || normalize(record.Mail),
            onPremisesSid: normalize(record.onPremisesSecurityIdentifier) || normalize(record.SID),
            samAccountName: normalize(record.onPremisesSamAccountName) || normalize(record.SamAccountName),
            distinguishedName: normalize(record.onPremisesDistinguishedName) || normalize(record.DistinguishedName),
          },
          description: normalize(record.description) || normalize(record.Description),
        };

      case 'ENTRA_APPLICATIONS':
      case 'ENTRA_SERVICE_PRINCIPALS':
        return {
          entityType: 'APPLICATION',
          displayName: normalize(record.displayName) || normalize(record.DisplayName) || normalize(record.appDisplayName) || 'Unknown Application',
          externalIds: {
            objectId: normalize(record.id) || normalize(record.objectId) || normalize(record.ObjectId),
            appId: normalize(record.appId) || normalize(record.AppId) || normalize(record.applicationId),
            servicePrincipalId: normalize(record.servicePrincipalId),
          },
          description: normalize(record.description) || normalize(record.Description) || normalize(record.notes),
        };

      case 'AZURE_RESOURCES':
      case 'AZURE_SUBSCRIPTIONS':
        return {
          entityType: 'INFRASTRUCTURE',
          displayName: normalize(record.name) || normalize(record.Name) || normalize(record.displayName) || 'Unknown Resource',
          externalIds: {
            azureResourceId: normalize(record.id) || normalize(record.resourceId) || normalize(record.ResourceId),
          },
          description: normalize(record.type) || normalize(record.resourceType),
        };

      case 'AZURE_VIRTUAL_MACHINES':
      case 'VMWARE_VMS':
      case 'HYPERV_VMS':
        return {
          entityType: 'VIRTUAL_MACHINE',
          displayName: normalize(record.name) || normalize(record.Name) || normalize(record.vmName) || 'Unknown VM',
          externalIds: {
            azureResourceId: normalize(record.id) || normalize(record.vmId),
            hostname: normalize(record.computerName) || normalize(record.hostname),
          },
          description: normalize(record.osType) || normalize(record.operatingSystem),
        };

      case 'EXCHANGE_MAILBOXES':
        return {
          entityType: 'MAILBOX',
          displayName: normalize(record.displayName) || normalize(record.DisplayName) || normalize(record.alias) || 'Unknown Mailbox',
          externalIds: {
            objectId: normalize(record.externalDirectoryObjectId) || normalize(record.objectId),
            email: normalize(record.primarySmtpAddress) || normalize(record.PrimarySmtpAddress) || normalize(record.mail),
          },
          description: normalize(record.recipientTypeDetails) || normalize(record.RecipientTypeDetails),
        };

      case 'SHAREPOINT_SITES':
        return {
          entityType: 'SHAREPOINT_SITE',
          displayName: normalize(record.title) || normalize(record.Title) || normalize(record.displayName) || 'Unknown Site',
          externalIds: {
            custom: {
              siteUrl: normalize(record.url) || normalize(record.Url) || normalize(record.webUrl),
              siteId: normalize(record.id) || normalize(record.siteId),
            },
          },
          description: normalize(record.description) || normalize(record.Description),
        };

      case 'TEAMS_TEAMS':
        return {
          entityType: 'TEAMS_TEAM',
          displayName: normalize(record.displayName) || normalize(record.DisplayName) || 'Unknown Team',
          externalIds: {
            objectId: normalize(record.id) || normalize(record.teamId),
            email: normalize(record.mail),
          },
          description: normalize(record.description) || normalize(record.Description),
        };

      case 'INTUNE_DEVICES':
        return {
          entityType: 'DEVICE',
          displayName: normalize(record.deviceName) || normalize(record.DeviceName) || normalize(record.displayName) || 'Unknown Device',
          externalIds: {
            objectId: normalize(record.id) || normalize(record.deviceId),
            hostname: normalize(record.deviceName) || normalize(record.DeviceName),
          },
          description: normalize(record.operatingSystem) || normalize(record.osVersion),
        };

      case 'SQL_SERVERS':
        return {
          entityType: 'DATABASE',
          displayName: normalize(record.serverName) || normalize(record.name) || normalize(record.instanceName) || 'Unknown SQL Server',
          externalIds: {
            hostname: normalize(record.serverName) || normalize(record.hostname),
            azureResourceId: normalize(record.resourceId),
          },
          description: normalize(record.version) || normalize(record.edition),
        };

      case 'FILE_SERVERS':
        return {
          entityType: 'SERVER',
          displayName: normalize(record.serverName) || normalize(record.name) || normalize(record.hostname) || 'Unknown File Server',
          externalIds: {
            hostname: normalize(record.serverName) || normalize(record.hostname),
            ipAddress: normalize(record.ipAddress) || normalize(record.IP),
          },
          description: normalize(record.shares) || 'File Server',
        };

      case 'NETWORK_INFRASTRUCTURE':
        return {
          entityType: 'NETWORK_RESOURCE',
          displayName: normalize(record.name) || normalize(record.hostname) || normalize(record.deviceName) || 'Unknown Network Device',
          externalIds: {
            hostname: normalize(record.hostname) || normalize(record.name),
            ipAddress: normalize(record.ipAddress) || normalize(record.managementIP),
            macAddress: normalize(record.macAddress),
          },
          description: normalize(record.deviceType) || normalize(record.model),
        };

      default:
        return {
          entityType: 'INFRASTRUCTURE',
          displayName: normalize(record.displayName) || normalize(record.name) || normalize(record.Name) || 'Unknown Entity',
          externalIds: {
            custom: { id: normalize(record.id) || normalize(record.Id) || uuidv4() },
          },
        };
    }
  }

  /**
   * Find existing entity by matching identifiers
   */
  private findExistingEntity(
    sourceProfileId: string,
    entityType: InventoryEntityType,
    externalIds: ExternalIdentifiers
  ): InventoryEntity | null {
    for (const entity of this.entities.values()) {
      if (entity.sourceProfileId !== sourceProfileId) continue;
      if (entity.entityType !== entityType) continue;

      // Match by any common identifier
      if (externalIds.objectId && entity.externalIds.objectId === externalIds.objectId) return entity;
      if (externalIds.upn && entity.externalIds.upn === externalIds.upn) return entity;
      if (externalIds.email && entity.externalIds.email === externalIds.email) return entity;
      if (externalIds.appId && entity.externalIds.appId === externalIds.appId) return entity;
      if (externalIds.onPremisesSid && entity.externalIds.onPremisesSid === externalIds.onPremisesSid) return entity;
      if (externalIds.samAccountName && entity.externalIds.samAccountName === externalIds.samAccountName) return entity;
      if (externalIds.azureResourceId && entity.externalIds.azureResourceId === externalIds.azureResourceId) return entity;
      if (externalIds.hostname && entity.externalIds.hostname === externalIds.hostname) return entity;
    }
    return null;
  }

  /**
   * Build relations from evidence data
   */
  private async buildRelations(sourceProfileId: string): Promise<{ created: number }> {
    let created = 0;
    const entities = await this.getEntities({ sourceProfileId });

    // Build USER -> GROUP relations from group membership data
    const users = entities.filter(e => e.entityType === 'USER');
    const groups = entities.filter(e => e.entityType === 'GROUP');

    for (const user of users) {
      const userEvidence = await this.getEvidenceForEntity(user.id);
      for (const ev of userEvidence) {
        const payload = ev.payloadSnapshot || {};

        // Check for group memberships
        const memberOf = payload.memberOf || payload.MemberOf || payload.groupMemberships || payload.GroupMemberships;
        if (memberOf) {
          const groupNames = String(memberOf).split(/[;,]/);
          for (const gn of groupNames) {
            const groupName = gn.trim();
            if (!groupName) continue;

            const matchingGroup = groups.find(g =>
              g.displayName.toLowerCase() === groupName.toLowerCase() ||
              g.externalIds.samAccountName?.toLowerCase() === groupName.toLowerCase()
            );

            if (matchingGroup) {
              await this.createRelation({
                sourceProfileId,
                fromEntityId: user.id,
                toEntityId: matchingGroup.id,
                relationType: 'MEMBER_OF_GROUP',
                direction: 'OUTBOUND',
                confidence: 0.9,
                derivedFrom: ev.module,
                isActive: true,
              });
              created++;
            }
          }
        }
      }
    }

    // Build APPLICATION -> USER/GROUP ownership relations
    const applications = entities.filter(e => e.entityType === 'APPLICATION');

    for (const app of applications) {
      const appEvidence = await this.getEvidenceForEntity(app.id);
      for (const ev of appEvidence) {
        const payload = ev.payloadSnapshot || {};

        // Check for owners
        const owners = payload.owners || payload.Owners || payload.ownerDisplayNames;
        if (owners) {
          const ownerNames = String(owners).split(/[;,]/);
          for (const on of ownerNames) {
            const ownerName = on.trim();
            if (!ownerName) continue;

            const owner = [...users, ...groups].find(e =>
              e.displayName.toLowerCase() === ownerName.toLowerCase() ||
              e.externalIds.upn?.toLowerCase() === ownerName.toLowerCase() ||
              e.externalIds.email?.toLowerCase() === ownerName.toLowerCase()
            );

            if (owner) {
              await this.createRelation({
                sourceProfileId,
                fromEntityId: owner.id,
                toEntityId: app.id,
                relationType: 'OWNS_APPLICATION',
                direction: 'OUTBOUND',
                confidence: 0.95,
                derivedFrom: ev.module,
                isActive: true,
              });
              created++;
            }
          }
        }
      }
    }

    console.log(`[InventoryService] Built ${created} relations`);
    return { created };
  }

  /**
   * Calculate readiness and risk scores
   */
  private async calculateScores(sourceProfileId: string): Promise<void> {
    const entities = await this.getEntities({ sourceProfileId });

    for (const entity of entities) {
      let readinessScore = 0;
      let riskScore = 0;
      let complexityScore = 0;

      const relations = await this.getRelationsForEntity(entity.id);
      const evidence = await this.getEvidenceForEntity(entity.id);

      // Readiness factors
      if (relations.length > 0) readinessScore += 0.25; // Has relations mapped
      if (evidence.length > 1) readinessScore += 0.20; // Multiple evidence sources
      if (Object.keys(entity.externalIds).length > 2) readinessScore += 0.20; // Complete IDs
      if (entity.externalIds.objectId && entity.externalIds.upn) readinessScore += 0.15; // Key identifiers present
      if (entity.status !== 'DISCOVERED') readinessScore += 0.20; // Been enriched

      // Risk factors
      const isApp = entity.entityType === 'APPLICATION';
      const ownerRelations = relations.filter(r => r.relationType === 'OWNS_APPLICATION');
      if (isApp && ownerRelations.length === 0) riskScore += 0.30; // No owners

      const hasComplexDependencies = relations.length > 5;
      if (hasComplexDependencies) riskScore += 0.20;

      // Check for stale data (no recent discovery)
      const lastDiscovered = entity.lastDiscoveredAt ? new Date(entity.lastDiscoveredAt) : null;
      const daysSinceDiscovery = lastDiscovered
        ? (Date.now() - lastDiscovered.getTime()) / (1000 * 60 * 60 * 24)
        : 30;
      if (daysSinceDiscovery > 14) riskScore += 0.15;

      // Complexity factors
      complexityScore = Math.min(relations.length / 10, 1.0) * 0.5; // More relations = more complex
      complexityScore += evidence.length > 3 ? 0.25 : 0; // Multiple sources = more verification needed

      await this.updateEntity(entity.id, {
        readinessScore: Math.min(readinessScore, 1.0),
        riskScore: Math.min(riskScore, 1.0),
        complexityScore: Math.min(complexityScore, 1.0),
      });
    }
  }

  /**
   * Get module type from filename
   */
  private getModuleFromFileName(fileName: string): DiscoveryModule {
    const baseName = fileName.replace('.csv', '').toLowerCase();

    for (const [pattern, module] of Object.entries(FILE_MODULE_MAPPING)) {
      if (baseName.includes(pattern)) {
        return module;
      }
    }

    return 'UNKNOWN';
  }

  /**
   * Get a unique reference for a record
   */
  private getRecordRef(record: any): string {
    return record.id || record.Id || record.objectId || record.ObjectId ||
      record.userPrincipalName || record.mail || record.name || uuidv4();
  }

  /**
   * Sanitize payload for storage
   */
  private sanitizePayload(record: any): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(record)) {
      if (value !== null && value !== undefined && value !== '') {
        sanitized[key] = String(value).substring(0, 500); // Limit string length
      }
    }
    return sanitized;
  }

  /**
   * Clear all data for a profile
   */
  private async clearProfileData(sourceProfileId: string): Promise<void> {
    const entitiesToDelete: string[] = [];

    for (const [id, entity] of this.entities.entries()) {
      if (entity.sourceProfileId === sourceProfileId) {
        entitiesToDelete.push(id);
      }
    }

    for (const id of entitiesToDelete) {
      await this.deleteEntity(id);
    }

    console.log(`[InventoryService] Cleared ${entitiesToDelete.length} entities for profile ${sourceProfileId}`);
  }

  // ========================================
  // Statistics
  // ========================================

  /**
   * Get inventory statistics
   */
  async getStatistics(sourceProfileId?: string): Promise<InventoryStatistics> {
    let entities = Array.from(this.entities.values());
    let relations = Array.from(this.relations.values());

    if (sourceProfileId) {
      entities = entities.filter(e => e.sourceProfileId === sourceProfileId);
      relations = relations.filter(r => r.sourceProfileId === sourceProfileId);
    }

    const entityCountByType: Record<InventoryEntityType, number> = {} as any;
    const entityCountByStatus: Record<InventoryEntityStatus, number> = {} as any;
    const relationCountByType: Record<InventoryRelationType, number> = {} as any;

    let totalReadiness = 0;
    let totalRisk = 0;
    let readinessCount = 0;
    let riskCount = 0;
    let assignedToWaves = 0;
    let migrationReady = 0;
    let multiSourceEntities = 0;
    let totalEvidence = 0;

    for (const entity of entities) {
      // Count by type
      entityCountByType[entity.entityType] = (entityCountByType[entity.entityType] || 0) + 1;

      // Count by status
      entityCountByStatus[entity.status] = (entityCountByStatus[entity.status] || 0) + 1;

      // Readiness and risk
      if (typeof entity.readinessScore === 'number') {
        totalReadiness += entity.readinessScore;
        readinessCount++;
      }
      if (typeof entity.riskScore === 'number') {
        totalRisk += entity.riskScore;
        riskCount++;
      }

      // Wave assignment
      if (entity.waveId) assignedToWaves++;

      // Migration ready
      if (entity.status === 'MIGRATION_READY') migrationReady++;

      // Multi-source
      if (entity.discoveredBy.length > 1) multiSourceEntities++;

      // Evidence count
      totalEvidence += entity.evidenceCount;
    }

    for (const relation of relations) {
      relationCountByType[relation.relationType] = (relationCountByType[relation.relationType] || 0) + 1;
    }

    return {
      entityCountByType,
      entityCountByStatus,
      relationCountByType,
      totalEntities: entities.length,
      totalRelations: relations.length,
      totalEvidence,
      assignedToWaves,
      migrationReady,
      averageReadinessScore: readinessCount > 0 ? totalReadiness / readinessCount : 0,
      averageRiskScore: riskCount > 0 ? totalRisk / riskCount : 0,
      multiSourceEntities,
    };
  }

  // ========================================
  // Wave Assignment
  // ========================================

  /**
   * Assign entities to a wave
   */
  async assignToWave(entityIds: string[], waveId: string): Promise<{ assigned: number; failed: string[] }> {
    let assigned = 0;
    const failed: string[] = [];

    for (const id of entityIds) {
      const updated = await this.updateEntity(id, {
        waveId,
        status: 'MIGRATION_PLANNED',
      });

      if (updated) {
        assigned++;
      } else {
        failed.push(id);
      }
    }

    return { assigned, failed };
  }

  /**
   * Unassign entities from wave
   */
  async unassignFromWave(entityIds: string[]): Promise<{ unassigned: number }> {
    let unassigned = 0;

    for (const id of entityIds) {
      const entity = await this.getEntity(id);
      if (entity && entity.waveId) {
        await this.updateEntity(id, {
          waveId: undefined,
          status: 'MIGRATION_READY',
        });
        unassigned++;
      }
    }

    return { unassigned };
  }

  /**
   * Get entities for a wave
   */
  async getWaveEntities(waveId: string): Promise<InventoryEntity[]> {
    return this.getEntities({ waveId });
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
