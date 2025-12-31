/**
 * Application Facts Service (Backend)
 *
 * Manages LeanIX-style application fact sheets with:
 * - CRUD operations for fact sheets
 * - Provenance tracking (which discovery module found what)
 * - Multi-source evidence aggregation
 * - Relation management
 * - Score calculations
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Type Definitions (Backend-local, mirrors renderer types)
// ============================================================================

type ApplicationLifecyclePhase = 'plan' | 'phase_in' | 'active' | 'phase_out' | 'end_of_life';
type ApplicationCriticality = 'mission_critical' | 'business_critical' | 'business_operational' | 'administrative';
type ApplicationComplexity = 'simple' | 'standard' | 'complex' | 'highly_complex';
type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';
type MigrationDisposition = 'retain' | 'retire' | 'replace' | 'rehost' | 'refactor' | 'replatform' | 'repurchase';
type ObservationConfidence = 'high' | 'medium' | 'low';
type RelationType = 'uses' | 'used_by' | 'depends_on' | 'depended_by' | 'integrates_with' | 'owns' | 'owned_by' | 'authenticates_via' | 'hosts' | 'hosted_by' | 'accesses_data_from' | 'provides_data_to';

interface FieldProvenance {
  source: string;
  discoveredAt: string;
  confidence: ObservationConfidence;
  sourceFile?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface ApplicationObservation {
  id: string;
  applicationId: string;
  field: string;
  value: any;
  provenance: FieldProvenance;
  isActive: boolean;
  notes?: string;
}

interface FactRelation {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  targetName: string;
  relationType: RelationType;
  description?: string;
  provenance: FieldProvenance;
  metadata?: Record<string, any>;
}

interface ApplicationMigrationPlan {
  disposition: MigrationDisposition;
  targetEnvironment?: string;
  waveId?: string;
  waveName?: string;
  plannedDate?: string;
  completedDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  blockers: string[];
  prerequisites: string[];
  validationSteps: string[];
  notes?: string;
  estimatedEffort?: number;
  actualEffort?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
}

interface BaseInfoSection {
  name: string;
  technicalName?: string;
  externalId?: string;
  description?: string;
  vendor?: string;
  version?: string;
  applicationType?: 'custom' | 'cots' | 'saas' | 'paas' | 'open_source';
  tags: string[];
  aliases: string[];
}

interface LifecycleSection {
  phase: ApplicationLifecyclePhase;
  phaseStartDate?: string;
  endOfLifeDate?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  notes?: string;
}

interface BusinessSection {
  criticality: ApplicationCriticality;
  businessCapabilities: string[];
  businessProcesses: string[];
  costCenter?: string;
  annualCost?: number;
  currency?: string;
  businessOwner?: string;
  businessOwnerEmail?: string;
  departments: string[];
  userCount?: number;
  businessValueScore?: number;
}

interface TechnicalSection {
  complexity: ApplicationComplexity;
  technicalOwner?: string;
  technicalOwnerEmail?: string;
  languages: string[];
  frameworks: string[];
  hostingType?: 'on_premises' | 'iaas' | 'paas' | 'saas' | 'hybrid';
  infrastructure: string[];
  databases: string[];
  integrations: string[];
  apisExposed: string[];
  apisConsumed: string[];
  documentationUrls: string[];
  repositoryUrl?: string;
  healthScore?: number;
}

interface SecuritySection {
  dataClassification: DataClassification;
  containsPII: boolean;
  containsPHI: boolean;
  containsFinancialData: boolean;
  complianceRequirements: string[];
  authenticationMethod?: string;
  ssoEnabled: boolean;
  ssoProvider?: string;
  lastSecurityReview?: string;
  securityNotes?: string;
  vulnerabilities: string[];
  riskScore?: number;
}

interface ApplicationFactSheet {
  id: string;
  sourceProfileId: string;
  inventoryEntityId?: string;
  baseInfo: BaseInfoSection;
  lifecycle: LifecycleSection;
  business: BusinessSection;
  technical: TechnicalSection;
  security: SecuritySection;
  migration: ApplicationMigrationPlan;
  relations: FactRelation[];
  observations: ApplicationObservation[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  readinessScore: number;
  overallRiskScore: number;
  completenessScore: number;
}

interface FactSheetDatabase {
  factSheets: ApplicationFactSheet[];
  version: number;
}

interface FactSheetFilters {
  sourceProfileId?: string;
  lifecyclePhase?: ApplicationLifecyclePhase[];
  criticality?: ApplicationCriticality[];
  disposition?: MigrationDisposition[];
  waveId?: string;
  search?: string;
  tags?: string[];
  minReadinessScore?: number;
  maxRiskScore?: number;
}

interface FactSheetSummary {
  id: string;
  name: string;
  vendor?: string;
  lifecyclePhase: ApplicationLifecyclePhase;
  criticality: ApplicationCriticality;
  disposition: MigrationDisposition;
  readinessScore: number;
  riskScore: number;
  relationCount: number;
  completenessScore: number;
}

interface FactSheetStatistics {
  total: number;
  byLifecycle: Record<ApplicationLifecyclePhase, number>;
  byCriticality: Record<ApplicationCriticality, number>;
  byDisposition: Record<MigrationDisposition, number>;
  byWave: Record<string, number>;
  averageReadiness: number;
  averageRisk: number;
  averageCompleteness: number;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class ApplicationFactsService {
  private db!: Low<FactSheetDatabase>;
  private isInitialized = false;
  private readonly dbPath: string;

  constructor() {
    this.dbPath = path.join(
      app.getPath('appData'),
      'MandADiscoverySuite',
      'application-facts.json'
    );
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    const adapter = new JSONFile<FactSheetDatabase>(this.dbPath);
    this.db = new Low(adapter, { factSheets: [], version: 1 });

    await this.db.read();
    this.ensureData();

    this.isInitialized = true;
    console.log('[ApplicationFactsService] Initialized with', this.db.data?.factSheets.length, 'fact sheets');
  }

  private ensureData(): void {
    if (!this.db.data) {
      this.db.data = { factSheets: [], version: 1 };
    }
    if (!this.db.data.factSheets) {
      this.db.data.factSheets = [];
    }
    if (!this.db.data.version) {
      this.db.data.version = 1;
    }
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  async create(
    sourceProfileId: string,
    name: string,
    inventoryEntityId?: string
  ): Promise<ApplicationFactSheet> {
    await this.initialize();

    const now = new Date().toISOString();
    const factSheet: ApplicationFactSheet = {
      id: uuidv4(),
      sourceProfileId,
      inventoryEntityId,
      baseInfo: { name, tags: [], aliases: [] },
      lifecycle: { phase: 'active' },
      business: {
        criticality: 'business_operational',
        businessCapabilities: [],
        businessProcesses: [],
        departments: [],
      },
      technical: {
        complexity: 'standard',
        languages: [],
        frameworks: [],
        infrastructure: [],
        databases: [],
        integrations: [],
        apisExposed: [],
        apisConsumed: [],
        documentationUrls: [],
      },
      security: {
        dataClassification: 'internal',
        containsPII: false,
        containsPHI: false,
        containsFinancialData: false,
        complianceRequirements: [],
        ssoEnabled: false,
        vulnerabilities: [],
      },
      migration: {
        disposition: 'retain',
        status: 'not_started',
        blockers: [],
        prerequisites: [],
        validationSteps: [],
        riskLevel: 'medium',
        riskFactors: [],
      },
      relations: [],
      observations: [],
      createdAt: now,
      updatedAt: now,
      readinessScore: 0,
      overallRiskScore: 50,
      completenessScore: 0,
    };

    this.db.data!.factSheets.push(factSheet);
    await this.db.write();

    console.log('[ApplicationFactsService] Created fact sheet:', factSheet.id, name);
    return factSheet;
  }

  async getById(id: string): Promise<ApplicationFactSheet | null> {
    await this.initialize();
    return this.db.data!.factSheets.find((fs) => fs.id === id) || null;
  }

  async getByInventoryEntityId(inventoryEntityId: string): Promise<ApplicationFactSheet | null> {
    await this.initialize();
    return this.db.data!.factSheets.find((fs) => fs.inventoryEntityId === inventoryEntityId) || null;
  }

  async getAll(filters?: FactSheetFilters): Promise<FactSheetSummary[]> {
    await this.initialize();

    let results = this.db.data!.factSheets;

    if (filters) {
      if (filters.sourceProfileId) {
        results = results.filter((fs) => fs.sourceProfileId === filters.sourceProfileId);
      }
      if (filters.lifecyclePhase?.length) {
        results = results.filter((fs) => filters.lifecyclePhase!.includes(fs.lifecycle.phase));
      }
      if (filters.criticality?.length) {
        results = results.filter((fs) => filters.criticality!.includes(fs.business.criticality));
      }
      if (filters.disposition?.length) {
        results = results.filter((fs) => filters.disposition!.includes(fs.migration.disposition));
      }
      if (filters.waveId) {
        results = results.filter((fs) => fs.migration.waveId === filters.waveId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(
          (fs) =>
            fs.baseInfo.name.toLowerCase().includes(searchLower) ||
            fs.baseInfo.vendor?.toLowerCase().includes(searchLower) ||
            fs.baseInfo.description?.toLowerCase().includes(searchLower)
        );
      }
      if (filters.tags?.length) {
        results = results.filter((fs) =>
          filters.tags!.some((tag) => fs.baseInfo.tags.includes(tag))
        );
      }
      if (filters.minReadinessScore !== undefined) {
        results = results.filter((fs) => fs.readinessScore >= filters.minReadinessScore!);
      }
      if (filters.maxRiskScore !== undefined) {
        results = results.filter((fs) => fs.overallRiskScore <= filters.maxRiskScore!);
      }
    }

    return results.map((fs) => ({
      id: fs.id,
      name: fs.baseInfo.name,
      vendor: fs.baseInfo.vendor,
      lifecyclePhase: fs.lifecycle.phase,
      criticality: fs.business.criticality,
      disposition: fs.migration.disposition,
      readinessScore: fs.readinessScore,
      riskScore: fs.overallRiskScore,
      relationCount: fs.relations.length,
      completenessScore: fs.completenessScore,
    }));
  }

  async updateSection(
    id: string,
    section: 'baseInfo' | 'lifecycle' | 'business' | 'technical' | 'security' | 'migration',
    updates: any,
    updatedBy?: string
  ): Promise<ApplicationFactSheet | null> {
    await this.initialize();

    const factSheet = this.db.data!.factSheets.find((fs) => fs.id === id);
    if (!factSheet) return null;

    // Merge updates into the section
    (factSheet as any)[section] = { ...(factSheet as any)[section], ...updates };
    factSheet.updatedAt = new Date().toISOString();
    if (updatedBy) factSheet.updatedBy = updatedBy;

    // Recalculate scores
    this.calculateScores(factSheet);

    await this.db.write();
    console.log('[ApplicationFactsService] Updated section:', section, 'for', id);
    return factSheet;
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize();

    const index = this.db.data!.factSheets.findIndex((fs) => fs.id === id);
    if (index === -1) return false;

    this.db.data!.factSheets.splice(index, 1);
    await this.db.write();

    console.log('[ApplicationFactsService] Deleted fact sheet:', id);
    return true;
  }

  // ============================================================================
  // Observations (Provenance Tracking)
  // ============================================================================

  async addObservation(
    applicationId: string,
    field: string,
    value: any,
    source: string,
    sourceFile?: string,
    confidence: ObservationConfidence = 'medium'
  ): Promise<ApplicationObservation | null> {
    await this.initialize();

    const factSheet = this.db.data!.factSheets.find((fs) => fs.id === applicationId);
    if (!factSheet) return null;

    // Deactivate previous observations for this field
    factSheet.observations
      .filter((o) => o.field === field && o.isActive)
      .forEach((o) => (o.isActive = false));

    const observation: ApplicationObservation = {
      id: uuidv4(),
      applicationId,
      field,
      value,
      provenance: {
        source,
        discoveredAt: new Date().toISOString(),
        confidence,
        sourceFile,
        verified: false,
      },
      isActive: true,
    };

    factSheet.observations.push(observation);
    factSheet.updatedAt = new Date().toISOString();

    // Apply the value to the fact sheet if it's a known field
    this.applyObservationValue(factSheet, field, value);
    this.calculateScores(factSheet);

    await this.db.write();
    console.log('[ApplicationFactsService] Added observation for', field, 'from', source);
    return observation;
  }

  async verifyObservation(
    applicationId: string,
    observationId: string,
    verifiedBy: string
  ): Promise<ApplicationObservation | null> {
    await this.initialize();

    const factSheet = this.db.data!.factSheets.find((fs) => fs.id === applicationId);
    if (!factSheet) return null;

    const observation = factSheet.observations.find((o) => o.id === observationId);
    if (!observation) return null;

    observation.provenance.verified = true;
    observation.provenance.verifiedBy = verifiedBy;
    observation.provenance.verifiedAt = new Date().toISOString();
    observation.provenance.confidence = 'high';

    factSheet.updatedAt = new Date().toISOString();
    this.calculateScores(factSheet);

    await this.db.write();
    return observation;
  }

  async getObservationHistory(applicationId: string, field?: string): Promise<ApplicationObservation[]> {
    await this.initialize();

    const factSheet = this.db.data!.factSheets.find((fs) => fs.id === applicationId);
    if (!factSheet) return [];

    if (field) {
      return factSheet.observations.filter((o) => o.field === field);
    }
    return factSheet.observations;
  }

  // ============================================================================
  // Relations
  // ============================================================================

  async addRelation(
    sourceId: string,
    sourceType: string,
    targetId: string,
    targetType: string,
    targetName: string,
    relationType: RelationType,
    source: string,
    description?: string
  ): Promise<FactRelation | null> {
    await this.initialize();

    const factSheet = this.db.data!.factSheets.find((fs) => fs.id === sourceId);
    if (!factSheet) return null;

    // Check for duplicate
    const existing = factSheet.relations.find(
      (r) => r.targetId === targetId && r.relationType === relationType
    );
    if (existing) {
      console.log('[ApplicationFactsService] Relation already exists, skipping');
      return existing;
    }

    const relation: FactRelation = {
      id: uuidv4(),
      sourceId,
      sourceType,
      targetId,
      targetType,
      targetName,
      relationType,
      description,
      provenance: {
        source,
        discoveredAt: new Date().toISOString(),
        confidence: 'medium',
        verified: false,
      },
    };

    factSheet.relations.push(relation);
    factSheet.updatedAt = new Date().toISOString();

    await this.db.write();
    console.log('[ApplicationFactsService] Added relation:', relationType, 'to', targetName);
    return relation;
  }

  async removeRelation(applicationId: string, relationId: string): Promise<boolean> {
    await this.initialize();

    const factSheet = this.db.data!.factSheets.find((fs) => fs.id === applicationId);
    if (!factSheet) return false;

    const index = factSheet.relations.findIndex((r) => r.id === relationId);
    if (index === -1) return false;

    factSheet.relations.splice(index, 1);
    factSheet.updatedAt = new Date().toISOString();

    await this.db.write();
    return true;
  }

  async getRelations(applicationId: string): Promise<FactRelation[]> {
    await this.initialize();

    const factSheet = this.db.data!.factSheets.find((fs) => fs.id === applicationId);
    return factSheet?.relations || [];
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  async getStatistics(sourceProfileId?: string): Promise<FactSheetStatistics> {
    await this.initialize();

    let factSheets = this.db.data!.factSheets;
    if (sourceProfileId) {
      factSheets = factSheets.filter((fs) => fs.sourceProfileId === sourceProfileId);
    }

    const stats: FactSheetStatistics = {
      total: factSheets.length,
      byLifecycle: { plan: 0, phase_in: 0, active: 0, phase_out: 0, end_of_life: 0 },
      byCriticality: {
        mission_critical: 0,
        business_critical: 0,
        business_operational: 0,
        administrative: 0,
      },
      byDisposition: {
        retain: 0,
        retire: 0,
        replace: 0,
        rehost: 0,
        refactor: 0,
        replatform: 0,
        repurchase: 0,
      },
      byWave: {},
      averageReadiness: 0,
      averageRisk: 0,
      averageCompleteness: 0,
    };

    if (factSheets.length === 0) return stats;

    let totalReadiness = 0;
    let totalRisk = 0;
    let totalCompleteness = 0;

    for (const fs of factSheets) {
      stats.byLifecycle[fs.lifecycle.phase]++;
      stats.byCriticality[fs.business.criticality]++;
      stats.byDisposition[fs.migration.disposition]++;

      if (fs.migration.waveId) {
        stats.byWave[fs.migration.waveId] = (stats.byWave[fs.migration.waveId] || 0) + 1;
      }

      totalReadiness += fs.readinessScore;
      totalRisk += fs.overallRiskScore;
      totalCompleteness += fs.completenessScore;
    }

    stats.averageReadiness = Math.round(totalReadiness / factSheets.length);
    stats.averageRisk = Math.round(totalRisk / factSheets.length);
    stats.averageCompleteness = Math.round(totalCompleteness / factSheets.length);

    return stats;
  }

  // ============================================================================
  // Import from Discovery
  // ============================================================================

  async importFromDiscovery(
    sourceProfileId: string,
    applications: any[],
    source: string,
    sourceFile: string
  ): Promise<{ created: number; updated: number; errors: number }> {
    await this.initialize();

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const app of applications) {
      try {
        const name = app.DisplayName || app.Name || app.displayName || app.name;
        if (!name) {
          errors++;
          continue;
        }

        // Check if fact sheet already exists by name
        let factSheet = this.db.data!.factSheets.find(
          (fs) =>
            fs.sourceProfileId === sourceProfileId &&
            fs.baseInfo.name.toLowerCase() === name.toLowerCase()
        );

        if (!factSheet) {
          factSheet = await this.create(sourceProfileId, name);
          created++;
        } else {
          updated++;
        }

        // Add observations for discovered fields
        const fieldMappings: Record<string, string> = {
          Publisher: 'baseInfo.vendor',
          Vendor: 'baseInfo.vendor',
          Version: 'baseInfo.version',
          Description: 'baseInfo.description',
          AppId: 'baseInfo.externalId',
          ApplicationId: 'baseInfo.externalId',
        };

        for (const [sourceField, targetField] of Object.entries(fieldMappings)) {
          if (app[sourceField]) {
            await this.addObservation(
              factSheet.id,
              targetField,
              app[sourceField],
              source,
              sourceFile,
              'medium'
            );
          }
        }
      } catch (error) {
        console.error('[ApplicationFactsService] Import error:', error);
        errors++;
      }
    }

    console.log(
      '[ApplicationFactsService] Import complete:',
      created,
      'created,',
      updated,
      'updated,',
      errors,
      'errors'
    );
    return { created, updated, errors };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private applyObservationValue(factSheet: ApplicationFactSheet, field: string, value: any): void {
    const parts = field.split('.');
    if (parts.length !== 2) return;

    const [section, prop] = parts;
    if (section in factSheet && typeof (factSheet as any)[section] === 'object') {
      (factSheet as any)[section][prop] = value;
    }
  }

  private calculateScores(factSheet: ApplicationFactSheet): void {
    // Completeness score based on filled fields
    let filledFields = 0;
    let totalFields = 0;

    const checkSection = (section: any, fields: string[]) => {
      for (const field of fields) {
        totalFields++;
        const value = section[field];
        if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
          filledFields++;
        }
      }
    };

    checkSection(factSheet.baseInfo, ['name', 'description', 'vendor', 'version', 'applicationType']);
    checkSection(factSheet.lifecycle, ['phase', 'phaseStartDate']);
    checkSection(factSheet.business, ['criticality', 'businessOwner', 'departments', 'userCount']);
    checkSection(factSheet.technical, ['complexity', 'technicalOwner', 'hostingType', 'languages']);
    checkSection(factSheet.security, ['dataClassification', 'authenticationMethod', 'ssoEnabled']);
    checkSection(factSheet.migration, ['disposition', 'status']);

    factSheet.completenessScore = Math.round((filledFields / totalFields) * 100);

    // Readiness score based on migration status and completeness
    let readiness = factSheet.completenessScore * 0.4; // 40% from completeness

    // Add points for migration readiness
    if (factSheet.migration.disposition !== 'retain') readiness += 10;
    if (factSheet.migration.status === 'completed') readiness += 30;
    else if (factSheet.migration.status === 'in_progress') readiness += 20;
    else if (factSheet.migration.waveId) readiness += 10;

    // Add points for verified data
    const verifiedCount = factSheet.observations.filter((o) => o.provenance.verified).length;
    readiness += Math.min(verifiedCount * 2, 20);

    factSheet.readinessScore = Math.min(Math.round(readiness), 100);

    // Risk score based on various factors
    let risk = 50; // Start at medium

    // Criticality affects risk
    if (factSheet.business.criticality === 'mission_critical') risk += 20;
    else if (factSheet.business.criticality === 'business_critical') risk += 10;
    else if (factSheet.business.criticality === 'administrative') risk -= 10;

    // Complexity affects risk
    if (factSheet.technical.complexity === 'highly_complex') risk += 15;
    else if (factSheet.technical.complexity === 'complex') risk += 10;
    else if (factSheet.technical.complexity === 'simple') risk -= 10;

    // Security factors
    if (factSheet.security.containsPII) risk += 10;
    if (factSheet.security.containsPHI) risk += 15;
    if (factSheet.security.containsFinancialData) risk += 10;
    if (!factSheet.security.ssoEnabled) risk += 5;

    // Blockers increase risk
    risk += factSheet.migration.blockers.length * 5;

    factSheet.overallRiskScore = Math.max(0, Math.min(Math.round(risk), 100));
  }
}

// Singleton instance
let serviceInstance: ApplicationFactsService | null = null;

export function getApplicationFactsService(): ApplicationFactsService {
  if (!serviceInstance) {
    serviceInstance = new ApplicationFactsService();
  }
  return serviceInstance;
}


