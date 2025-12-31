/**
 * Consolidation Engine
 *
 * Core service that transforms raw discovery CSV data into canonical entities
 * with full decision trace provenance.
 *
 * Responsibilities:
 * - Load and parse discovery CSV files
 * - Create canonical entities with provenance
 * - Identity matching across source systems
 * - Entity deduplication and merging
 * - Relationship inference with evidence
 * - Decision trace emission for all operations
 *
 * Based on Decision Traces architecture in CLAUDE.local.md
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import type {
  CanonicalEntity,
  CanonicalUser,
  CanonicalGroup,
  CanonicalApplication,
  CanonicalInfrastructure,
  CanonicalRelation,
  EntityType,
  SourceSystem,
  ExternalId,
  Provenance,
  SourceRecordRef,
  RelationType,
  DecisionEvidence,
} from '../../renderer/types/models/canonical';

import {
  createDecisionTrace,
  traceConsolidationRun,
  traceIdentityMatch,
  traceEntityMerge,
  traceRelationshipInferred,
  createFieldMatchEvidence,
  createMembershipEvidence,
  createOwnershipEvidence,
  createAccessEvidence,
} from './decisionTraceHelpers';

/**
 * CSV file metadata
 */
interface CSVFileMetadata {
  path: string;
  hash: string;
  recordCount: number;
  sourceSystem: SourceSystem;
  entityType: EntityType;
}

/**
 * Parsed CSV record with metadata
 */
interface ParsedRecord {
  data: Record<string, any>;
  sourceRef: SourceRecordRef;
  sourceSystem: SourceSystem;
}

/**
 * Identity match result
 */
interface IdentityMatch {
  confidence: number;
  evidence: DecisionEvidence[];
  matchedRecords: ParsedRecord[];
}

/**
 * Consolidation result
 */
export interface ConsolidationResult {
  entities: CanonicalEntity[];
  relationships: CanonicalRelation[];
  statistics: {
    inputFiles: number;
    recordsProcessed: number;
    entitiesCreated: number;
    entitiesMerged: number;
    relationshipsInferred: number;
    conflictsDetected: number;
    processingTimeMs: number;
  };
}

/**
 * Consolidation Engine Service
 */
export class ConsolidationEngine {
  private static instance: ConsolidationEngine;
  private profileId: string = 'default';

  private constructor() {}

  public static getInstance(): ConsolidationEngine {
    if (!ConsolidationEngine.instance) {
      ConsolidationEngine.instance = new ConsolidationEngine();
    }
    return ConsolidationEngine.instance;
  }

  /**
   * Set current profile context
   */
  public setProfileId(profileId: string): void {
    this.profileId = profileId;
    console.log('[ConsolidationEngine] Profile context set:', profileId);
  }

  /**
   * Main consolidation entry point
   */
  public async consolidate(discoveryDataPath: string): Promise<ConsolidationResult> {
    const startTime = performance.now();
    console.log('[ConsolidationEngine] Starting consolidation:', discoveryDataPath);

    // Phase 1: Discover and load CSV files
    const csvFiles = await this.discoverCSVFiles(discoveryDataPath);
    console.log(`[ConsolidationEngine] Discovered ${csvFiles.length} CSV files`);

    // Phase 2: Parse CSV files into records
    const recordsByType = await this.parseCSVFiles(csvFiles);
    const totalRecords = Object.values(recordsByType).reduce((sum, records) => sum + records.length, 0);
    console.log(`[ConsolidationEngine] Parsed ${totalRecords} records across ${Object.keys(recordsByType).length} types`);

    // Phase 3: Create canonical entities with provenance
    const entities = await this.createCanonicalEntities(recordsByType);
    console.log(`[ConsolidationEngine] Created ${entities.length} canonical entities`);

    // Phase 4: Identity matching and merging
    const { mergedEntities, mergeCount } = await this.performIdentityMatching(entities);
    console.log(`[ConsolidationEngine] Merged ${mergeCount} duplicate entities, ${mergedEntities.length} final entities`);

    // Phase 5: Infer relationships
    const relationships = await this.inferRelationships(mergedEntities, recordsByType);
    console.log(`[ConsolidationEngine] Inferred ${relationships.length} relationships`);

    // Phase 6: Detect conflicts
    const conflictCount = this.detectConflicts(mergedEntities);
    console.log(`[ConsolidationEngine] Detected ${conflictCount} field conflicts`);

    const processingTimeMs = performance.now() - startTime;

    // Phase 7: Emit consolidation run trace
    await traceConsolidationRun(
      this.profileId,
      csvFiles.map((f) => ({ file: f.path, hash: f.hash, recordCount: f.recordCount })),
      {
        entitiesCreated: entities.length,
        entitiesMerged: mergeCount,
        relationshipsInferred: relationships.length,
        conflictsDetected: conflictCount,
        processingTimeMs,
      }
    );

    console.log(`[ConsolidationEngine] Consolidation complete in ${processingTimeMs.toFixed(2)}ms`);

    return {
      entities: mergedEntities,
      relationships,
      statistics: {
        inputFiles: csvFiles.length,
        recordsProcessed: totalRecords,
        entitiesCreated: entities.length,
        entitiesMerged: mergeCount,
        relationshipsInferred: relationships.length,
        conflictsDetected: conflictCount,
        processingTimeMs,
      },
    };
  }

  /**
   * Phase 1: Discover CSV files in discovery data directory
   */
  private async discoverCSVFiles(discoveryDataPath: string): Promise<CSVFileMetadata[]> {
    const csvFiles: CSVFileMetadata[] = [];

    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.csv')) {
            const content = await fs.readFile(fullPath, 'utf8');
            const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
            const recordCount = content.split('\n').length - 1; // -1 for header

            // Infer source system and entity type from filename/path
            const { sourceSystem, entityType } = this.inferFileType(fullPath);

            csvFiles.push({
              path: fullPath,
              hash,
              recordCount,
              sourceSystem,
              entityType,
            });
          }
        }
      } catch (err) {
        console.warn('[ConsolidationEngine] Error scanning directory:', dirPath, err);
      }
    };

    await scanDirectory(discoveryDataPath);
    return csvFiles;
  }

  /**
   * Infer source system and entity type from file path
   */
  private inferFileType(filePath: string): { sourceSystem: SourceSystem; entityType: EntityType } {
    const fileName = path.basename(filePath).toLowerCase();
    const dirName = path.dirname(filePath).toLowerCase();

    // Determine source system
    let sourceSystem: SourceSystem = 'LOCAL';
    if (fileName.includes('azure') || fileName.includes('entra')) sourceSystem = 'ENTRA';
    else if (fileName.includes('intune')) sourceSystem = 'INTUNE';
    else if (fileName.includes('exchange')) sourceSystem = 'EXCHANGE';
    else if (fileName.includes('sharepoint')) sourceSystem = 'SHAREPOINT';
    else if (dirName.includes('ad') || fileName.includes('activedirectory')) sourceSystem = 'AD';

    // Determine entity type
    let entityType: EntityType = 'INFRASTRUCTURE';
    if (fileName.includes('user')) entityType = 'USER';
    else if (fileName.includes('group')) entityType = 'GROUP';
    else if (fileName.includes('app') || fileName.includes('application')) entityType = 'APPLICATION';
    else if (fileName.includes('computer') || fileName.includes('device') || fileName.includes('server'))
      entityType = 'INFRASTRUCTURE';

    return { sourceSystem, entityType };
  }

  /**
   * Phase 2: Parse CSV files into structured records
   */
  private async parseCSVFiles(
    csvFiles: CSVFileMetadata[]
  ): Promise<Record<EntityType, ParsedRecord[]>> {
    const recordsByType: Record<EntityType, ParsedRecord[]> = {
      USER: [],
      GROUP: [],
      APPLICATION: [],
      INFRASTRUCTURE: [],
    };

    for (const csvFile of csvFiles) {
      try {
        const content = await fs.readFile(csvFile.path, 'utf8');
        const lines = content.split('\n').filter((line) => line.trim());

        if (lines.length < 2) continue; // Skip empty files

        // Parse CSV with quoted field support
        const parseCSVLine = (line: string): string[] => {
          const values: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/^"|"$/g, ''));
          return values;
        };

        const headers = parseCSVLine(lines[0]);

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length < headers.length / 2) continue; // Skip malformed rows

          const data: Record<string, any> = {};
          headers.forEach((header, idx) => {
            data[header] = values[idx] || '';
          });

          const record: ParsedRecord = {
            data,
            sourceRef: {
              file: csvFile.path,
              rowId: String(i),
              hash: csvFile.hash,
              observedAt: new Date().toISOString(),
            },
            sourceSystem: csvFile.sourceSystem,
          };

          recordsByType[csvFile.entityType].push(record);
        }
      } catch (err) {
        console.error('[ConsolidationEngine] Error parsing CSV:', csvFile.path, err);
      }
    }

    return recordsByType;
  }

  /**
   * Phase 3: Create canonical entities from parsed records
   */
  private async createCanonicalEntities(
    recordsByType: Record<EntityType, ParsedRecord[]>
  ): Promise<CanonicalEntity[]> {
    const entities: CanonicalEntity[] = [];

    // Process each entity type
    for (const [entityType, records] of Object.entries(recordsByType)) {
      for (const record of records) {
        const entity = await this.createCanonicalEntity(entityType as EntityType, [record]);
        if (entity) {
          entities.push(entity);
        }
      }
    }

    return entities;
  }

  /**
   * Create a canonical entity from one or more source records
   */
  private async createCanonicalEntity(
    entityType: EntityType,
    records: ParsedRecord[]
  ): Promise<CanonicalEntity | null> {
    if (records.length === 0) return null;

    const primaryRecord = records[0];
    const data = primaryRecord.data;

    // Extract display name (try multiple fields)
    const displayName =
      data.DisplayName ||
      data.Name ||
      data.UserPrincipalName ||
      data.ComputerName ||
      data.ApplicationName ||
      data.GroupName ||
      '';

    if (!displayName || displayName.trim() === '') return null;

    // Extract external IDs
    const externalIds: ExternalId[] = records.map((rec) => ({
      system: rec.sourceSystem,
      id: rec.data.ObjectId || rec.data.Id || rec.data.SID || rec.data.GUID || displayName,
      tenantOrDomain: rec.data.Domain || rec.data.TenantId,
    }));

    // Build provenance
    const provenance: Provenance = {
      sources: [...new Set(records.map((r) => r.sourceSystem))],
      sourceRecordRefs: records.map((r) => r.sourceRef),
      confidence: records.length === 1 ? 1.0 : 0.85, // Lower confidence if merged from multiple sources
      lastObservedAt: new Date().toISOString(),
    };

    // Create entity-specific attributes
    let attributes: Record<string, any> = {};
    switch (entityType) {
      case 'USER':
        attributes = this.extractUserAttributes(data);
        break;
      case 'GROUP':
        attributes = this.extractGroupAttributes(data);
        break;
      case 'APPLICATION':
        attributes = this.extractApplicationAttributes(data);
        break;
      case 'INFRASTRUCTURE':
        attributes = this.extractInfrastructureAttributes(data);
        break;
    }

    const entity: CanonicalEntity = {
      id: uuidv4(),
      entityType,
      displayName: displayName.trim(),
      externalIds,
      attributes,
      provenance,
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    return entity;
  }

  private extractUserAttributes(data: Record<string, any>): CanonicalUser['attributes'] {
    return {
      userPrincipalName: data.UserPrincipalName || data.UPN,
      email: data.Mail || data.Email || data.PrimarySmtpAddress,
      displayName: data.DisplayName || data.Name,
      firstName: data.GivenName || data.FirstName,
      lastName: data.Surname || data.LastName,
      department: data.Department,
      jobTitle: data.JobTitle || data.Title,
      manager: data.Manager || data.ManagerDisplayName,
      accountEnabled: data.AccountEnabled === 'True' || data.Enabled === 'True',
    };
  }

  private extractGroupAttributes(data: Record<string, any>): CanonicalGroup['attributes'] {
    return {
      groupType: data.GroupType || data.Type,
      scope: data.Scope || data.GroupScope,
      description: data.Description,
      email: data.Mail || data.Email,
      memberCount: parseInt(data.MemberCount || '0', 10),
      isSecurityEnabled: data.IsSecurityEnabled === 'True' || data.SecurityEnabled === 'True',
      isMailEnabled: data.IsMailEnabled === 'True' || data.MailEnabled === 'True',
    };
  }

  private extractApplicationAttributes(data: Record<string, any>): CanonicalApplication['attributes'] {
    return {
      publisher: data.Publisher || data.Vendor,
      version: data.Version,
      category: data.Category || data.Type,
      criticality: data.Criticality as any,
      complexity: data.Complexity as any,
    };
  }

  private extractInfrastructureAttributes(data: Record<string, any>): CanonicalInfrastructure['attributes'] {
    return {
      computerName: data.ComputerName || data.Name || data.DeviceName,
      os: data.OperatingSystem || data.OS,
      osVersion: data.OSVersion || data.Version,
      manufacturer: data.Manufacturer,
      model: data.Model,
      serialNumber: data.SerialNumber,
      ipAddress: data.IPAddress || data.IP,
    };
  }

  /**
   * Phase 4: Identity matching and merging
   */
  private async performIdentityMatching(
    entities: CanonicalEntity[]
  ): Promise<{ mergedEntities: CanonicalEntity[]; mergeCount: number }> {
    const mergedEntities: CanonicalEntity[] = [];
    const processedIds = new Set<string>();
    let mergeCount = 0;

    for (const entity of entities) {
      if (processedIds.has(entity.id)) continue;

      // Find potential matches
      const matches = entities.filter(
        (other) =>
          other.id !== entity.id &&
          !processedIds.has(other.id) &&
          other.entityType === entity.entityType &&
          this.arePotentialMatches(entity, other)
      );

      if (matches.length === 0) {
        mergedEntities.push(entity);
        processedIds.add(entity.id);
        continue;
      }

      // Perform identity matching
      const matchResult = this.calculateIdentityMatch(entity, matches);

      if (matchResult.confidence >= 0.7) {
        // High confidence match - merge entities
        const mergedEntity = await this.mergeEntities(entity, matches, matchResult);
        mergedEntities.push(mergedEntity);

        processedIds.add(entity.id);
        matches.forEach((m) => processedIds.add(m.id));
        mergeCount += matches.length;

        // Emit IDENTITY_MATCH trace
        await traceIdentityMatch(
          this.profileId,
          mergedEntity.id,
          mergedEntity.entityType,
          [entity, ...matches].map((e) => ({
            system: e.provenance.sources[0] || 'LOCAL',
            externalId: e.externalIds[0]?.id || e.id,
            recordRef: e.provenance.sourceRecordRefs[0] || { file: 'unknown' },
          })),
          matchResult.evidence,
          matchResult.confidence
        );

        // Emit ENTITY_MERGE trace
        await traceEntityMerge(
          this.profileId,
          mergedEntity.id,
          [entity.id, ...matches.map((m) => m.id)],
          mergedEntity.entityType,
          { type: 'SYSTEM', id: 'consolidation-engine', displayName: 'Consolidation Engine' },
          `Merged ${matches.length + 1} entities based on identity matching`,
          matchResult.confidence
        );
      } else {
        // Low confidence - keep separate
        mergedEntities.push(entity);
        processedIds.add(entity.id);
      }
    }

    return { mergedEntities, mergeCount };
  }

  /**
   * Quick check if two entities are potential matches
   */
  private arePotentialMatches(entity1: CanonicalEntity, entity2: CanonicalEntity): boolean {
    // Check display name similarity
    const name1 = entity1.displayName.toLowerCase();
    const name2 = entity2.displayName.toLowerCase();

    // Exact match
    if (name1 === name2) return true;

    // Check for common identifiers in external IDs
    for (const id1 of entity1.externalIds) {
      for (const id2 of entity2.externalIds) {
        if (id1.id === id2.id && id1.system !== id2.system) {
          return true; // Same ID in different systems
        }
      }
    }

    // For users, check email/UPN
    if (entity1.entityType === 'USER' && entity2.entityType === 'USER') {
      const upn1 = (entity1.attributes as any).userPrincipalName?.toLowerCase();
      const upn2 = (entity2.attributes as any).userPrincipalName?.toLowerCase();
      const email1 = (entity1.attributes as any).email?.toLowerCase();
      const email2 = (entity2.attributes as any).email?.toLowerCase();

      if ((upn1 && upn1 === upn2) || (email1 && email1 === email2)) return true;
    }

    return false;
  }

  /**
   * Calculate identity match confidence and evidence
   */
  private calculateIdentityMatch(entity: CanonicalEntity, potentialMatches: CanonicalEntity[]): IdentityMatch {
    const evidence: DecisionEvidence[] = [];
    let totalConfidence = 0;
    let evidenceCount = 0;

    for (const match of potentialMatches) {
      // Display name match
      if (entity.displayName.toLowerCase() === match.displayName.toLowerCase()) {
        evidence.push(
          createFieldMatchEvidence('DisplayName', entity.displayName, match.displayName, 'Source1', 'Source2', 1.0)
        );
        totalConfidence += 1.0;
        evidenceCount++;
      }

      // External ID match across systems
      for (const id1 of entity.externalIds) {
        for (const id2 of match.externalIds) {
          if (id1.id === id2.id && id1.system !== id2.system) {
            evidence.push(
              createFieldMatchEvidence('ExternalId', id1.id, id2.id, id1.system, id2.system, 0.9)
            );
            totalConfidence += 0.9;
            evidenceCount++;
          }
        }
      }

      // Entity-specific matching
      if (entity.entityType === 'USER' && match.entityType === 'USER') {
        const upn1 = (entity.attributes as any).userPrincipalName?.toLowerCase();
        const upn2 = (match.attributes as any).userPrincipalName?.toLowerCase();

        if (upn1 && upn1 === upn2) {
          evidence.push(createFieldMatchEvidence('UserPrincipalName', upn1, upn2, 'AD', 'Entra', 0.95));
          totalConfidence += 0.95;
          evidenceCount++;
        }
      }
    }

    const confidence = evidenceCount > 0 ? totalConfidence / evidenceCount : 0;

    return {
      confidence,
      evidence,
      matchedRecords: [], // We're working with entities, not raw records here
    };
  }

  /**
   * Merge multiple entities into one canonical entity
   */
  private async mergeEntities(
    primaryEntity: CanonicalEntity,
    otherEntities: CanonicalEntity[],
    matchResult: IdentityMatch
  ): Promise<CanonicalEntity> {
    const allEntities = [primaryEntity, ...otherEntities];

    // Merge external IDs
    const externalIds: ExternalId[] = [];
    for (const entity of allEntities) {
      for (const extId of entity.externalIds) {
        if (!externalIds.some((e) => e.id === extId.id && e.system === extId.system)) {
          externalIds.push(extId);
        }
      }
    }

    // Merge provenance
    const sources = [...new Set(allEntities.flatMap((e) => e.provenance.sources))];
    const sourceRecordRefs = allEntities.flatMap((e) => e.provenance.sourceRecordRefs);

    // Merge attributes (prefer non-empty values)
    const mergedAttributes: Record<string, any> = {};
    for (const entity of allEntities) {
      for (const [key, value] of Object.entries(entity.attributes)) {
        if (!mergedAttributes[key] || (value && String(value).trim() !== '')) {
          mergedAttributes[key] = value;
        }
      }
    }

    const mergedEntity: CanonicalEntity = {
      id: uuidv4(), // New ID for merged entity
      entityType: primaryEntity.entityType,
      displayName: primaryEntity.displayName,
      externalIds,
      attributes: mergedAttributes,
      provenance: {
        sources,
        sourceRecordRefs,
        confidence: matchResult.confidence,
        lastObservedAt: new Date().toISOString(),
      },
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    return mergedEntity;
  }

  /**
   * Phase 5: Infer relationships between entities
   */
  private async inferRelationships(
    entities: CanonicalEntity[],
    recordsByType: Record<EntityType, ParsedRecord[]>
  ): Promise<CanonicalRelation[]> {
    const relationships: CanonicalRelation[] = [];

    // Build entity lookup indices
    const entityByUPN = new Map<string, CanonicalEntity>();
    const entityByName = new Map<string, CanonicalEntity>();
    const entityByExtId = new Map<string, CanonicalEntity>();

    for (const entity of entities) {
      entityByName.set(entity.displayName.toLowerCase(), entity);

      if (entity.entityType === 'USER') {
        const upn = (entity.attributes as any).userPrincipalName;
        if (upn) entityByUPN.set(upn.toLowerCase(), entity);
      }

      for (const extId of entity.externalIds) {
        entityByExtId.set(`${extId.system}:${extId.id}`, entity);
      }
    }

    // Infer relationships from CSV data
    for (const [entityType, records] of Object.entries(recordsByType)) {
      for (const record of records) {
        const data = record.data;

        // Find the entity corresponding to this record
        const displayName = data.DisplayName || data.Name || data.UserPrincipalName || data.ComputerName || '';
        const sourceEntity = entityByName.get(displayName.toLowerCase());
        if (!sourceEntity) continue;

        // USER → GROUP (MEMBER_OF)
        if (entityType === 'USER' && data.GroupMemberships) {
          const groups = String(data.GroupMemberships).split(';').map(g => g.trim()).filter(Boolean);
          for (const groupName of groups) {
            const groupEntity = entityByName.get(groupName.toLowerCase());
            if (groupEntity && groupEntity.entityType === 'GROUP') {
              const rel = await this.createRelationship(
                sourceEntity,
                groupEntity,
                'MEMBER_OF',
                [createMembershipEvidence(groupName, [sourceEntity.displayName])],
                0.9,
                [record.sourceRef]
              );
              relationships.push(rel);
            }
          }
        }

        // USER → DEVICE (HAS_DEVICE)
        if (entityType === 'USER' && data.AssignedDevices) {
          const devices = String(data.AssignedDevices).split(';').map(d => d.trim()).filter(Boolean);
          for (const deviceName of devices) {
            const deviceEntity = entityByName.get(deviceName.toLowerCase());
            if (deviceEntity && deviceEntity.entityType === 'INFRASTRUCTURE') {
              const rel = await this.createRelationship(
                sourceEntity,
                deviceEntity,
                'HAS_DEVICE',
                [createOwnershipEvidence('AssignedDevices', deviceName)],
                0.85,
                [record.sourceRef]
              );
              relationships.push(rel);
            }
          }
        }

        // INFRASTRUCTURE → APPLICATION (HOSTS_APPLICATION)
        if (entityType === 'INFRASTRUCTURE' && data.InstalledApplications) {
          const apps = String(data.InstalledApplications).split(';').map(a => a.trim()).filter(Boolean);
          for (const appName of apps) {
            const appEntity = entityByName.get(appName.toLowerCase());
            if (appEntity && appEntity.entityType === 'APPLICATION') {
              const rel = await this.createRelationship(
                sourceEntity,
                appEntity,
                'HOSTS_APPLICATION',
                [createAccessEvidence('Installed', appName)],
                0.8,
                [record.sourceRef]
              );
              relationships.push(rel);
            }
          }
        }
      }
    }

    console.log(`[ConsolidationEngine] Inferred ${relationships.length} relationships`);
    return relationships;
  }

  /**
   * Create a canonical relationship with trace
   */
  private async createRelationship(
    fromEntity: CanonicalEntity,
    toEntity: CanonicalEntity,
    relationType: RelationType,
    evidence: DecisionEvidence[],
    confidence: number,
    sourceRefs: SourceRecordRef[]
  ): Promise<CanonicalRelation> {
    const relationId = uuidv4();

    const relation: CanonicalRelation = {
      id: relationId,
      type: relationType,
      fromEntityId: fromEntity.id,
      toEntityId: toEntity.id,
      attributes: {},
      provenance: {
        inferred: true,
        sources: [...new Set(sourceRefs.map((r) => r.file))],
        sourceRecordRefs: sourceRefs,
        confidence,
        rationale: `Inferred ${relationType} relationship based on ${evidence.length} pieces of evidence`,
      },
      version: 1,
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    // Emit RELATIONSHIP_INFERRED trace
    await traceRelationshipInferred(
      this.profileId,
      relationId,
      fromEntity.id,
      toEntity.id,
      relationType,
      evidence,
      confidence,
      sourceRefs
    );

    return relation;
  }

  /**
   * Phase 6: Detect conflicts in merged entities
   */
  private detectConflicts(entities: CanonicalEntity[]): number {
    let conflictCount = 0;

    for (const entity of entities) {
      if (entity.provenance.sources.length > 1) {
        // Check for conflicting values across sources
        // This is a simplified implementation
        const conflicts = [];

        // In a real implementation, we'd compare field values across source records
        // and detect when sources disagree

        if (conflicts.length > 0) {
          entity.provenance.conflicts = conflicts;
          conflictCount++;
        }
      }
    }

    return conflictCount;
  }
}

// Export singleton
export const consolidationEngine = ConsolidationEngine.getInstance();


