/**
 * Inventory Service (Backend)
 *
 * Manages consolidated inventory consolidation pipeline.
 * Reads raw discovery CSVs and builds canonical entities with evidence and relations.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as Papa from 'papaparse';

import {
  InventoryEntity,
  InventoryEntityEvidence,
  InventoryRelation,
  EntityType,
  EntityStatus,
  RelationType,
  InventoryStats,
  ConflictDetails,
  ConflictSeverity,
  MergeKey,
} from '../../shared/types/inventory';

interface InventoryDatabase {
  entities: InventoryEntity[];
  evidence: Record<string, InventoryEntityEvidence[]>; // Key: inventoryEntityId
  relations: Record<string, InventoryRelation[]>; // Key: entityId (bidirectional)
  version: number;
}

export class InventoryService {
  private db!: Low<InventoryDatabase>;
  private isInitialized = false;
  private readonly inventoryPath: string;
  private readonly dataRootPath: string;

  constructor() {
    this.inventoryPath = path.join(app.getPath('appData'), 'MandADiscoverySuite', 'inventory.json');
    this.dataRootPath =
      process.env.MANDA_DISCOVERY_PATH ||
      (process.platform === 'win32'
        ? path.join('C:', 'DiscoveryData')
        : path.join(app.getPath('userData'), 'DiscoveryData'));
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await fs.mkdir(path.dirname(this.inventoryPath), { recursive: true });

    const adapter = new JSONFile<InventoryDatabase>(this.inventoryPath);
    this.db = new Low(adapter, { entities: [], evidence: {}, relations: {}, version: 1 });

    await this.db.read();
    this.ensureData();

    this.isInitialized = true;
  }

  private ensureData(): void {
    if (!this.db.data) {
      this.db.data = { entities: [], evidence: {}, relations: {}, version: 1 };
    }
    if (!this.db.data.entities) {
      this.db.data.entities = [];
    }
    if (!this.db.data.evidence) {
      this.db.data.evidence = {};
    }
    if (!this.db.data.relations) {
      this.db.data.relations = {};
    }
    if (!this.db.data.version) {
      this.db.data.version = 1;
    }
  }

  // ============================================================================
  // DEDUPLICATION & CONFLICT DETECTION
  // ============================================================================

  /**
   * Determine which merge key to use for a user record
   * Priority: GUID > UPN > EMAIL > SAMACCOUNTNAME > DISPLAYNAME
   */
  private determineUserMergeKey(record: any): { key: MergeKey; value: string } | null {
    if (record.id || record.objectId) {
      return { key: 'GUID', value: record.id || record.objectId };
    }
    if (record.userPrincipalName) {
      return { key: 'UPN', value: record.userPrincipalName.toLowerCase() };
    }
    if (record.mail || record.email) {
      return { key: 'EMAIL', value: (record.mail || record.email).toLowerCase() };
    }
    if (record.samAccountName) {
      return { key: 'SAMACCOUNTNAME', value: record.samAccountName.toLowerCase() };
    }
    if (record.displayName) {
      return { key: 'DISPLAYNAME', value: record.displayName.toLowerCase() };
    }
    return null;
  }

  /**
   * Merge attributes from multiple sources with conflict detection
   */
  private mergeUserAttributes(
    existingEntity: InventoryEntity,
    newRecord: any,
    moduleName: string
  ): void {
    const attributesToCheck = ['displayName', 'mail', 'userPrincipalName', 'samAccountName'];

    for (const attr of attributesToCheck) {
      const existingValue = existingEntity.externalIds[attr] || (existingEntity as any)[attr];
      const newValue = newRecord[attr];

      if (newValue && existingValue && existingValue !== newValue) {
        // Conflict detected!
        this.recordConflict(existingEntity, attr, existingValue, newValue, moduleName);
      } else if (newValue && !existingValue) {
        // Enrich with new data
        if (attr === 'displayName') {
          existingEntity.displayName = newValue;
        } else {
          existingEntity.externalIds[attr] = newValue;
        }
      }
    }

    existingEntity.updatedAt = new Date();
  }

  /**
   * Record a conflict between sources
   */
  private recordConflict(
    entity: InventoryEntity,
    attributeName: string,
    existingValue: any,
    newValue: any,
    newSource: string
  ): void {
    if (!entity.conflicts) {
      entity.conflicts = {};
    }

    if (!entity.conflicts[attributeName]) {
      // First conflict for this attribute
      entity.conflicts[attributeName] = {
        sources: ['EXISTING', newSource],
        values: {
          EXISTING: existingValue,
          [newSource]: newValue,
        },
        resolvedValue: existingValue, // Default to existing value
        resolvedBy: 'SYSTEM',
        resolvedAt: new Date(),
        severity: this.determineConflictSeverity(attributeName),
      };
    } else {
      // Additional conflict
      const conflict = entity.conflicts[attributeName];
      if (!conflict.sources.includes(newSource)) {
        conflict.sources.push(newSource);
        conflict.values[newSource] = newValue;
      }
    }
  }

  /**
   * Determine conflict severity based on attribute importance
   */
  private determineConflictSeverity(attributeName: string): ConflictSeverity {
    const highSeverityAttrs = ['userPrincipalName', 'mail', 'objectId', 'id'];
    const mediumSeverityAttrs = ['displayName', 'samAccountName', 'department', 'manager'];

    if (highSeverityAttrs.includes(attributeName)) return 'HIGH';
    if (mediumSeverityAttrs.includes(attributeName)) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Apply fuzzy matching to find potential duplicates
   */
  private applyFuzzyMatching(
    entities: InventoryEntity[],
    threshold: number = 3
  ): InventoryEntity[] {
    const deduped: InventoryEntity[] = [];
    const processed = new Set<string>();

    for (const entity of entities) {
      if (processed.has(entity.id)) continue;

      let isDuplicate = false;

      for (const existing of deduped) {
        if (existing.entityType !== entity.entityType) continue;

        const distance = this.levenshteinDistance(
          existing.displayName.toLowerCase(),
          entity.displayName.toLowerCase()
        );

        if (distance <= threshold) {
          // Potential duplicate found - merge
          this.mergeUserAttributes(existing, entity.externalIds, 'FUZZY_MATCH');
          processed.add(entity.id);
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        deduped.push(entity);
        processed.add(entity.id);
      }
    }

    console.log(`[InventoryService] Fuzzy matching reduced ${entities.length} to ${deduped.length} entities`);
    return deduped;
  }

  // ============================================================================
  // CONSOLIDATION PIPELINE
  // ============================================================================

  /**
   * Main consolidation pipeline
   * Reads raw discovery CSV files and builds consolidated inventory
   */
  async rebuildInventory(sourceProfileId: string): Promise<{
    entities: InventoryEntity[];
    evidence: Record<string, InventoryEntityEvidence[]>;
    relations: Record<string, InventoryRelation[]>;
  }> {
    console.log(`[InventoryService] Starting consolidation for profile: ${sourceProfileId}`);

    try {
      // Clear existing inventory for this profile
      await this.clearInventoryForProfile(sourceProfileId);

      // Phase 1: Load discovery CSVs
      const discoveryData = await this.loadDiscoveryFiles(sourceProfileId);

      // Phase 2: Create canonical entities
      const entities = await this.consolidateEntities(sourceProfileId, discoveryData);

      // Phase 3: Create evidence links
      const evidence = await this.createEvidence(sourceProfileId, entities, discoveryData);

      // Phase 4: Build relations
      const relations = await this.buildRelations(sourceProfileId, entities, discoveryData);

      // Phase 5: Calculate readiness and risk scores
      await this.calculateScores(entities, evidence, relations);

      // Phase 6: Persist to database
      await this.saveInventory(sourceProfileId, entities, evidence, relations);

      console.log(`[InventoryService] Consolidation complete. Total entities: ${entities.length}`);

      return { entities, evidence, relations };
    } catch (error) {
      console.error('[InventoryService] Consolidation failed:', error);
      throw error;
    }
  }

  /**
   * Load all discovery CSV files for a profile
   */
  private async loadDiscoveryFiles(sourceProfileId: string): Promise<{
    entraUsers: any[];
    entraGroups: any[];
    azureResources: any[];
    applications: any[];
    infrastructure: any[];
  }> {
    const profilePath = path.join(this.dataRootPath, sourceProfileId, 'Raw');

    // Normalize record keys to camelCase for consistent access
    const normalizeRecord = (record: any): any => {
      const normalized: any = {};
      for (const key of Object.keys(record)) {
        // Convert PascalCase to camelCase (first letter lowercase)
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        normalized[camelKey] = record[key];
        // Also keep original key for backwards compatibility
        normalized[key] = record[key];
      }
      return normalized;
    };

    const loadCsv = async (filename: string): Promise<any[]> => {
      const filePath = path.join(profilePath, filename);
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const parsed = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        console.log(`[InventoryService] ✅ Loaded ${parsed.data.length} records from ${filename}`);
        // Normalize all records to have camelCase keys
        return (parsed.data as any[]).map(normalizeRecord);
      } catch (error) {
        console.warn(`[InventoryService] Could not load ${filename}:`, error);
        return [];
      }
    };

    const loadMultipleCsvs = async (filenames: string[]): Promise<any[]> => {
      const allRecords: any[] = [];
      for (const filename of filenames) {
        const records = await loadCsv(filename);
        allRecords.push(...records);
      }
      return allRecords;
    };

    return {
      entraUsers: await loadMultipleCsvs(['GraphUsers.csv', 'AzureDiscovery_Users.csv']),
      entraGroups: await loadMultipleCsvs(['GraphGroups.csv', 'AzureDiscovery_Groups.csv', 'ExchangeDistributionGroups.csv']),
      azureResources: await loadMultipleCsvs(['AzureResourceDiscovery_ResourceGroups.csv', 'AzureResourceDiscovery_NetworkSecurityGroups.csv']),
      applications: await loadMultipleCsvs(['EntraIDAppRegistrations.csv', 'EntraIDEnterpriseApps.csv', 'AzureDiscovery_Applications.csv']),
      infrastructure: await loadCsv('SecurityInfrastructureDiscovery.csv'),
    };
  }

  /**
   * Load discovery CSV files in chunks for large files
   * Uses streaming to process 1000 rows at a time
   */
  private async loadDiscoveryDataChunked(
    sourceProfileId: string,
    onChunk: (data: any[], filename: string) => Promise<void>
  ): Promise<void> {
    const profilePath = path.join(this.dataRootPath, sourceProfileId, 'Raw');
    const files = [
      'GraphUsers.csv',
      'AzureDiscovery_Users.csv',
      'GraphGroups.csv',
      'AzureDiscovery_Groups.csv',
      'ExchangeDistributionGroups.csv',
      'EntraIDAppRegistrations.csv',
      'EntraIDEnterpriseApps.csv',
      'AzureDiscovery_Applications.csv',
      'AzureResourceDiscovery_ResourceGroups.csv',
      'AzureResourceDiscovery_NetworkSecurityGroups.csv',
      'SecurityInfrastructureDiscovery.csv',
    ];

    for (const filename of files) {
      const filePath = path.join(profilePath, filename);
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        let chunk: any[] = [];
        const chunkSize = 1000;

        await new Promise<void>((resolve, reject) => {
          Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            chunk: async (results: any, parser: any) => {
              // Pause parsing while we process chunk
              parser.pause();

              chunk.push(...results.data);

              if (chunk.length >= chunkSize) {
                try {
                  await onChunk(chunk, filename);
                  chunk = [];
                } catch (error) {
                  reject(error);
                  return;
                }
              }

              parser.resume();
            },
            complete: async () => {
              // Process remaining chunk
              if (chunk.length > 0) {
                try {
                  await onChunk(chunk, filename);
                } catch (error) {
                  reject(error);
                  return;
                }
              }
              resolve();
            },
            error: (error: any) => {
              reject(error);
            },
          });
        });

        console.log(`[InventoryService] Completed chunked loading of ${filename}`);
      } catch (error) {
        console.warn(`[InventoryService] Could not load ${filename}:`, error);
      }
    }
  }

  /**
   * Consolidate raw discovery data into canonical entities
   */
  private async consolidateEntities(
    sourceProfileId: string,
    discoveryData: any
  ): Promise<InventoryEntity[]> {
    const entities: InventoryEntity[] = [];
    const mergeKeyIndex: Map<string, InventoryEntity> = new Map();

    // USER entities from Entra ID with sophisticated deduplication
    for (const record of discoveryData.entraUsers) {
      const mergeKeyData = this.determineUserMergeKey(record);

      if (!mergeKeyData) {
        console.warn('[InventoryService] Skipping user record with no valid merge key:', record);
        continue;
      }

      const mergeKeyValue = `${mergeKeyData.key}:${mergeKeyData.value}`;
      const existingEntity = mergeKeyIndex.get(mergeKeyValue);

      if (existingEntity) {
        // Merge with existing entity and detect conflicts
        this.mergeUserAttributes(existingEntity, record, 'ENTRA_USERS');
      } else {
        // Create new entity
        const newEntity: InventoryEntity = {
          id: this.generateUUID(),
          sourceProfileId,
          entityType: 'USER',
          displayName: record.displayName || record.userPrincipalName || 'Unknown User',
          externalIds: {
            objectId: record.id || record.objectId,
            upn: record.userPrincipalName,
            mail: record.mail || record.userPrincipalName,
            samAccountName: record.samAccountName,
          },
          status: 'DISCOVERED',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        entities.push(newEntity);
        mergeKeyIndex.set(mergeKeyValue, newEntity);
      }
    }

    // GROUP entities from Entra ID
    for (const record of discoveryData.entraGroups) {
      entities.push({
        id: this.generateUUID(),
        sourceProfileId,
        entityType: 'GROUP',
        displayName: record.displayName || 'Unknown Group',
        externalIds: {
          objectId: record.id || record.objectId,
        },
        status: 'DISCOVERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // APPLICATION entities from Azure and discovery
    for (const record of [...discoveryData.azureResources, ...discoveryData.applications]) {
      if (
        record.resourceType === 'Application' ||
        record.resourceType === 'ServicePrincipal' ||
        record.type === 'Application'
      ) {
        entities.push({
          id: this.generateUUID(),
          sourceProfileId,
          entityType: 'APPLICATION',
          displayName: record.displayName || record.name || 'Unknown Application',
          externalIds: {
            appId: record.appId,
            objectId: record.id || record.objectId,
          },
          status: 'DISCOVERED',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // INFRASTRUCTURE entities from Azure resources
    for (const record of [...discoveryData.azureResources, ...discoveryData.infrastructure]) {
      if (
        ['VirtualMachine', 'StorageAccount', 'ResourceGroup', 'NetworkInterface'].includes(
          record.resourceType || record.type
        )
      ) {
        entities.push({
          id: this.generateUUID(),
          sourceProfileId,
          entityType: 'INFRASTRUCTURE',
          displayName: record.name || record.displayName || 'Unknown Resource',
          externalIds: {
            resourceId: record.id,
            subscriptionId: record.subscriptionId,
            hostname: record.computerName || record.dnsName,
          },
          status: 'DISCOVERED',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log(
      `[InventoryService] Created ${entities.length} entities: ${entities.filter((e) => e.entityType === 'USER').length} users, ${entities.filter((e) => e.entityType === 'GROUP').length} groups, ${entities.filter((e) => e.entityType === 'APPLICATION').length} apps, ${entities.filter((e) => e.entityType === 'INFRASTRUCTURE').length} infra`
    );

    // Apply fuzzy matching for additional deduplication
    const dedupedEntities = this.applyFuzzyMatching(entities, 3);

    return dedupedEntities;
  }

  /**
   * Create evidence links from discovery modules
   */
  private async createEvidence(
    sourceProfileId: string,
    entities: InventoryEntity[],
    discoveryData: any
  ): Promise<Record<string, InventoryEntityEvidence[]>> {
    const evidence: Record<string, InventoryEntityEvidence[]> = {};

    // Link users to Entra evidence
    for (const entity of entities.filter((e) => e.entityType === 'USER')) {
      const sourceRecord = discoveryData.entraUsers.find(
        (r: any) => r.id === entity.externalIds.objectId || r.userPrincipalName === entity.externalIds.upn
      );

      if (sourceRecord) {
        if (!evidence[entity.id]) evidence[entity.id] = [];
        evidence[entity.id].push({
          id: this.generateUUID(),
          inventoryEntityId: entity.id,
          module: 'ENTRA_USERS',
          sourceRecordRef: sourceRecord.id || sourceRecord.objectId,
          observedAt: new Date(),
          payloadSnapshot: sourceRecord,
        });
      }
    }

    // Link groups to Entra evidence
    for (const entity of entities.filter((e) => e.entityType === 'GROUP')) {
      const sourceRecord = discoveryData.entraGroups.find(
        (r: any) => r.id === entity.externalIds.objectId
      );

      if (sourceRecord) {
        if (!evidence[entity.id]) evidence[entity.id] = [];
        evidence[entity.id].push({
          id: this.generateUUID(),
          inventoryEntityId: entity.id,
          module: 'ENTRA_GROUPS',
          sourceRecordRef: sourceRecord.id || sourceRecord.objectId,
          observedAt: new Date(),
          payloadSnapshot: sourceRecord,
        });
      }
    }

    // Link applications and infrastructure to Azure evidence
    for (const entity of entities.filter((e) => e.entityType === 'APPLICATION' || e.entityType === 'INFRASTRUCTURE')) {
      const sourceRecord = discoveryData.azureResources.find(
        (r: any) => r.id === entity.externalIds.resourceId || r.appId === entity.externalIds.appId
      );

      if (sourceRecord) {
        if (!evidence[entity.id]) evidence[entity.id] = [];
        evidence[entity.id].push({
          id: this.generateUUID(),
          inventoryEntityId: entity.id,
          module: 'AZURE_RESOURCES',
          sourceRecordRef: sourceRecord.id,
          observedAt: new Date(),
          payloadSnapshot: sourceRecord,
        });
      }
    }

    console.log(`[InventoryService] Created evidence for ${Object.keys(evidence).length} entities`);

    return evidence;
  }

  /**
   * Build typed relationships between entities
   */
  private async buildRelations(
    sourceProfileId: string,
    entities: InventoryEntity[],
    discoveryData: any
  ): Promise<Record<string, InventoryRelation[]>> {
    const relations: Record<string, InventoryRelation[]> = {};

    const addRelation = (fromEntityId: string, toEntityId: string, relationType: RelationType, metadata?: any) => {
      const relation: InventoryRelation = {
        id: this.generateUUID(),
        sourceProfileId,
        fromEntityId,
        toEntityId,
        relationType,
        metadata,
        createdAt: new Date(),
      };

      // Store bidirectionally for efficient lookups
      if (!relations[fromEntityId]) relations[fromEntityId] = [];
      if (!relations[toEntityId]) relations[toEntityId] = [];

      relations[fromEntityId].push(relation);
      relations[toEntityId].push(relation);
    };

    // Build USER → GROUP relations from group memberships
    for (const groupRecord of discoveryData.entraGroups) {
      const group = entities.find((e) => e.externalIds.objectId === groupRecord.id && e.entityType === 'GROUP');

      if (group && groupRecord.members) {
        const memberIds = Array.isArray(groupRecord.members)
          ? groupRecord.members
          : groupRecord.members.split(';');

        for (const memberId of memberIds) {
          const user = entities.find(
            (e) =>
              (e.externalIds.objectId === memberId || e.externalIds.upn === memberId) && e.entityType === 'USER'
          );

          if (user) {
            addRelation(user.id, group.id, 'MEMBER_OF_GROUP', { source: 'ENTRA_GROUPS' });
          }
        }
      }
    }

    // Build ownership relations for applications
    for (const appRecord of [...discoveryData.azureResources, ...discoveryData.applications]) {
      const app = entities.find(
        (e) =>
          (e.externalIds.appId === appRecord.appId || e.externalIds.objectId === appRecord.id) &&
          e.entityType === 'APPLICATION'
      );

      if (app && appRecord.owners) {
        const owners = Array.isArray(appRecord.owners) ? appRecord.owners : appRecord.owners.split(';');

        for (const ownerId of owners) {
          const owner = entities.find(
            (e) =>
              (e.externalIds.objectId === ownerId || e.externalIds.upn === ownerId) &&
              (e.entityType === 'USER' || e.entityType === 'GROUP')
          );

          if (owner) {
            addRelation(owner.id, app.id, 'OWNS_APPLICATION', { source: 'AZURE_RESOURCES', role: 'owner' });
          }
        }
      }
    }

    console.log(`[InventoryService] Built relations for ${Object.keys(relations).length} entities`);

    return relations;
  }

  /**
   * Calculate readiness and risk scores for entities
   */
  private async calculateScores(
    entities: InventoryEntity[],
    evidence: Record<string, InventoryEntityEvidence[]>,
    relations: Record<string, InventoryRelation[]>
  ): Promise<void> {
    for (const entity of entities) {
      let readinessScore = 0;
      let riskScore = 0;

      // Readiness factors
      if (relations[entity.id]?.length > 0) readinessScore += 0.3; // Has relationships
      if (evidence[entity.id]?.length > 1) readinessScore += 0.2; // Multiple evidence sources
      if (Object.keys(entity.externalIds).length > 1) readinessScore += 0.2; // Complete IDs
      if (entity.status !== 'DISCOVERED') readinessScore += 0.3; // Enriched/verified

      // Risk factors
      if (entity.entityType === 'APPLICATION') {
        const owners = relations[entity.id]?.filter((r) => r.relationType === 'OWNS_APPLICATION' && r.toEntityId === entity.id) || [];
        if (owners.length === 0) riskScore += 0.3; // No owners = risky
      }

      if (entity.entityType === 'USER') {
        const groups = relations[entity.id]?.filter((r) => r.relationType === 'MEMBER_OF_GROUP' && r.fromEntityId === entity.id) || [];
        if (groups.length === 0) riskScore += 0.2; // Orphaned user
      }

      if (!evidence[entity.id] || evidence[entity.id].length < 2) {
        riskScore += 0.2; // Single source = less validated
      }

      entity.readinessScore = Math.min(readinessScore, 1.0);
      entity.riskScore = Math.min(riskScore, 1.0);
    }

    console.log(`[InventoryService] Calculated scores for ${entities.length} entities`);
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  /**
   * Save consolidated inventory to database
   */
  private async saveInventory(
    sourceProfileId: string,
    entities: InventoryEntity[],
    evidence: Record<string, InventoryEntityEvidence[]>,
    relations: Record<string, InventoryRelation[]>
  ): Promise<void> {
    await this.db.read();
    this.ensureData();

    // Add new entities
    this.db.data.entities.push(...entities);

    // Merge evidence
    for (const [entityId, evidenceList] of Object.entries(evidence)) {
      if (!this.db.data.evidence[entityId]) {
        this.db.data.evidence[entityId] = [];
      }
      this.db.data.evidence[entityId].push(...evidenceList);
    }

    // Merge relations
    for (const [entityId, relationList] of Object.entries(relations)) {
      if (!this.db.data.relations[entityId]) {
        this.db.data.relations[entityId] = [];
      }
      this.db.data.relations[entityId].push(...relationList);
    }

    await this.db.write();

    console.log(`[InventoryService] Persisted inventory to database`);
  }

  /**
   * Clear inventory for a specific profile
   */
  private async clearInventoryForProfile(sourceProfileId: string): Promise<void> {
    await this.db.read();
    this.ensureData();

    // Remove entities
    this.db.data.entities = this.db.data.entities.filter((e) => e.sourceProfileId !== sourceProfileId);

    // Remove evidence
    const entityIds = this.db.data.entities.map((e) => e.id);
    const newEvidence: Record<string, InventoryEntityEvidence[]> = {};
    for (const [entityId, evidenceList] of Object.entries(this.db.data.evidence)) {
      if (entityIds.includes(entityId)) {
        newEvidence[entityId] = evidenceList;
      }
    }
    this.db.data.evidence = newEvidence;

    // Remove relations
    const newRelations: Record<string, InventoryRelation[]> = {};
    for (const [entityId, relationList] of Object.entries(this.db.data.relations)) {
      const filtered = relationList.filter((r) => r.sourceProfileId !== sourceProfileId);
      if (filtered.length > 0) {
        newRelations[entityId] = filtered;
      }
    }
    this.db.data.relations = newRelations;

    await this.db.write();

    console.log(`[InventoryService] Cleared inventory for profile: ${sourceProfileId}`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate a UUID
   */
  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get inventory statistics
   */
  async getStats(sourceProfileId?: string): Promise<InventoryStats> {
    await this.db.read();
    this.ensureData();

    const entities = sourceProfileId
      ? this.db.data.entities.filter((e) => e.sourceProfileId === sourceProfileId)
      : this.db.data.entities;

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
      if (this.db.data.evidence[entity.id]) entitiesWithEvidence++;
      if (this.db.data.relations[entity.id]) entitiesWithRelations++;
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
}

// Export singleton instance
let inventoryServiceInstance: InventoryService | null = null;

export function getInventoryService(): InventoryService {
  if (!inventoryServiceInstance) {
    inventoryServiceInstance = new InventoryService();
  }
  return inventoryServiceInstance;
}


