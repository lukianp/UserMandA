/**
 * Application Facts Service
 *
 * Backend service for managing Application Fact Sheets with:
 * - CRUD operations with LowDB persistence
 * - Provenance tracking for data lineage
 * - Relationship management
 * - Discovery data synchronization
 * - Migration plan integration
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { app, ipcMain } from 'electron';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

import {
  ApplicationFact,
  ApplicationObservation,
  FieldProvenance,
  FactRelation,
  ApplicationMigrationPlan,
  FactSheetFilter,
  FactSheetStatistics,
  FactSheetSyncResult,
  DiscoverySource,
  createEmptyApplicationFact,
  DEFAULT_LIFECYCLE_INFO,
  DEFAULT_BUSINESS_CONTEXT,
  DEFAULT_TECHNICAL_DETAILS,
  DEFAULT_SECURITY_ASSESSMENT,
} from '../../shared/types/applicationFacts';

// ============================================================
// Database Schema
// ============================================================

interface FactsDatabase {
  facts: ApplicationFact[];
  lastSync: string | null;
  version: number;
}

const DEFAULT_DATABASE: FactsDatabase = {
  facts: [],
  lastSync: null,
  version: 1,
};

// ============================================================
// Service Class
// ============================================================

export class ApplicationFactsService {
  private db!: Low<FactsDatabase>;
  private isInitialized = false;
  private readonly dbPath: string;
  private readonly dataRootPath: string;

  constructor() {
    this.dbPath = path.join(
      app.getPath('appData'),
      'MandADiscoverySuite',
      'application-facts.json'
    );
    this.dataRootPath =
      process.env.MANDA_DISCOVERY_PATH ||
      (process.platform === 'win32'
        ? path.join('C:', 'DiscoveryData')
        : path.join(app.getPath('userData'), 'DiscoveryData'));
  }

  // ============================================================
  // Initialization
  // ============================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Initialize LowDB
      const adapter = new JSONFile<FactsDatabase>(this.dbPath);
      this.db = new Low<FactsDatabase>(adapter, DEFAULT_DATABASE);

      await this.db.read();

      // Ensure data structure
      if (!this.db.data) {
        this.db.data = { ...DEFAULT_DATABASE };
        await this.db.write();
      }

      this.isInitialized = true;
      console.log('[ApplicationFactsService] Initialized with', this.db.data.facts.length, 'facts');
    } catch (error) {
      console.error('[ApplicationFactsService] Initialization failed:', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('ApplicationFactsService not initialized. Call initialize() first.');
    }
  }

  // ============================================================
  // CRUD Operations
  // ============================================================

  /**
   * Get all application facts
   */
  async getAll(filter?: FactSheetFilter): Promise<ApplicationFact[]> {
    this.ensureInitialized();
    await this.db.read();

    let facts = [...(this.db.data?.facts || [])];

    if (filter) {
      facts = this.applyFilter(facts, filter);
    }

    return facts;
  }

  /**
   * Get a single fact by ID
   */
  async getById(id: string): Promise<ApplicationFact | null> {
    this.ensureInitialized();
    await this.db.read();

    return this.db.data?.facts.find((f) => f.id === id) || null;
  }

  /**
   * Get a fact by App ID (Azure AD application ID)
   */
  async getByAppId(appId: string): Promise<ApplicationFact | null> {
    this.ensureInitialized();
    await this.db.read();

    return this.db.data?.facts.find((f) => f.appId === appId) || null;
  }

  /**
   * Create a new application fact
   */
  async create(data: Partial<ApplicationFact>): Promise<ApplicationFact> {
    this.ensureInitialized();
    await this.db.read();

    const id = data.id || uuidv4();
    const now = new Date().toISOString();

    const fact: ApplicationFact = {
      ...createEmptyApplicationFact(id, data.displayName || 'Unnamed Application'),
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.db.data!.facts.push(fact);
    await this.db.write();

    console.log('[ApplicationFactsService] Created fact:', fact.id, fact.displayName);
    return fact;
  }

  /**
   * Update an existing application fact
   */
  async update(
    id: string,
    updates: Partial<ApplicationFact>,
    source: DiscoverySource = 'Manual',
    notes?: string
  ): Promise<ApplicationFact | null> {
    this.ensureInitialized();
    await this.db.read();

    const index = this.db.data!.facts.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const existing = this.db.data!.facts[index];
    const now = new Date().toISOString();

    // Track which fields are being updated
    const fieldsUpdated = Object.keys(updates).filter(
      (key) => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt'
    );

    // Create provenance records for updated fields
    const newProvenance: FieldProvenance[] = fieldsUpdated.map((field) => ({
      field,
      source,
      discoveredAt: now,
      confidence: source === 'Manual' ? 1 : 0.8,
      verified: source === 'Manual',
      previousValue: JSON.stringify((existing as any)[field]),
    }));

    // Create observation record
    const observation: ApplicationObservation = {
      id: uuidv4(),
      timestamp: now,
      source,
      fieldsUpdated,
      provenance: newProvenance,
      notes,
    };

    // Merge updates
    const updated: ApplicationFact = {
      ...existing,
      ...updates,
      updatedAt: now,
      provenance: [...existing.provenance, ...newProvenance],
      observations: [...existing.observations, observation],
    };

    this.db.data!.facts[index] = updated;
    await this.db.write();

    console.log('[ApplicationFactsService] Updated fact:', id, fieldsUpdated);
    return updated;
  }

  /**
   * Delete an application fact
   */
  async delete(id: string): Promise<boolean> {
    this.ensureInitialized();
    await this.db.read();

    const index = this.db.data!.facts.findIndex((f) => f.id === id);
    if (index === -1) return false;

    this.db.data!.facts.splice(index, 1);
    await this.db.write();

    console.log('[ApplicationFactsService] Deleted fact:', id);
    return true;
  }

  // ============================================================
  // Relationship Management
  // ============================================================

  /**
   * Add a relationship to an application fact
   */
  async addRelation(factId: string, relation: Omit<FactRelation, 'id'>): Promise<FactRelation | null> {
    this.ensureInitialized();
    await this.db.read();

    const index = this.db.data!.facts.findIndex((f) => f.id === factId);
    if (index === -1) return null;

    const newRelation: FactRelation = {
      ...relation,
      id: uuidv4(),
    };

    this.db.data!.facts[index].relations.push(newRelation);
    this.db.data!.facts[index].updatedAt = new Date().toISOString();
    await this.db.write();

    console.log('[ApplicationFactsService] Added relation:', factId, '->', relation.targetId);
    return newRelation;
  }

  /**
   * Remove a relationship from an application fact
   */
  async removeRelation(factId: string, relationId: string): Promise<boolean> {
    this.ensureInitialized();
    await this.db.read();

    const factIndex = this.db.data!.facts.findIndex((f) => f.id === factId);
    if (factIndex === -1) return false;

    const fact = this.db.data!.facts[factIndex];
    const relationIndex = fact.relations.findIndex((r) => r.id === relationId);
    if (relationIndex === -1) return false;

    fact.relations.splice(relationIndex, 1);
    fact.updatedAt = new Date().toISOString();
    await this.db.write();

    console.log('[ApplicationFactsService] Removed relation:', relationId);
    return true;
  }

  /**
   * Get all relations for an application (both directions)
   */
  async getRelationsForApp(appId: string): Promise<{ inbound: FactRelation[]; outbound: FactRelation[] }> {
    this.ensureInitialized();
    await this.db.read();

    const outbound: FactRelation[] = [];
    const inbound: FactRelation[] = [];

    const fact = this.db.data!.facts.find((f) => f.id === appId || f.appId === appId);
    if (fact) {
      outbound.push(...fact.relations);
    }

    // Find inbound relations (other apps pointing to this one)
    for (const f of this.db.data!.facts) {
      for (const rel of f.relations) {
        if (rel.targetId === appId || rel.targetId === fact?.appId) {
          inbound.push({
            ...rel,
            targetId: f.id,
            targetName: f.displayName,
            direction: 'inbound',
          });
        }
      }
    }

    return { inbound, outbound };
  }

  // ============================================================
  // Migration Planning
  // ============================================================

  /**
   * Set or update migration plan for an application
   */
  async setMigrationPlan(
    factId: string,
    plan: ApplicationMigrationPlan
  ): Promise<ApplicationFact | null> {
    return this.update(factId, { migration: plan }, 'Manual', 'Migration plan updated');
  }

  /**
   * Get applications by migration status
   */
  async getByMigrationStatus(
    status: ApplicationMigrationPlan['status']
  ): Promise<ApplicationFact[]> {
    this.ensureInitialized();
    await this.db.read();

    return this.db.data!.facts.filter((f) => f.migration?.status === status);
  }

  // ============================================================
  // Statistics
  // ============================================================

  /**
   * Get statistics about all fact sheets
   */
  async getStatistics(): Promise<FactSheetStatistics> {
    this.ensureInitialized();
    await this.db.read();

    const facts = this.db.data!.facts;
    const stats: FactSheetStatistics = {
      total: facts.length,
      byClassification: {},
      byLifecycleState: {
        plan: 0,
        'phase-in': 0,
        active: 0,
        'phase-out': 0,
        'end-of-life': 0,
        retired: 0,
        unknown: 0,
      },
      byCriticality: {
        'mission-critical': 0,
        'business-critical': 0,
        'business-operational': 0,
        administrative: 0,
        unknown: 0,
      },
      byHostingType: {
        saas: 0,
        paas: 0,
        iaas: 0,
        'on-premises': 0,
        hybrid: 0,
        unknown: 0,
      },
      withMigrationPlan: 0,
      byMigrationStatus: {},
      lastUpdated: new Date().toISOString(),
    };

    for (const fact of facts) {
      // Classification
      stats.byClassification[fact.classification] =
        (stats.byClassification[fact.classification] || 0) + 1;

      // Lifecycle
      const lifecycleState = fact.lifecycle.state || 'unknown';
      stats.byLifecycleState[lifecycleState] =
        (stats.byLifecycleState[lifecycleState] || 0) + 1;

      // Criticality
      const criticality = fact.business.criticality || 'unknown';
      stats.byCriticality[criticality] = (stats.byCriticality[criticality] || 0) + 1;

      // Hosting
      const hosting = fact.technical.hostingType || 'unknown';
      stats.byHostingType[hosting] = (stats.byHostingType[hosting] || 0) + 1;

      // Migration
      if (fact.migration) {
        stats.withMigrationPlan++;
        const migStatus = fact.migration.status;
        stats.byMigrationStatus[migStatus] = (stats.byMigrationStatus[migStatus] || 0) + 1;
      }
    }

    return stats;
  }

  // ============================================================
  // Discovery Sync
  // ============================================================

  /**
   * Sync facts from discovery CSV data
   */
  async syncFromDiscoveryData(
    companyName: string,
    classificationResults?: Map<string, any>
  ): Promise<FactSheetSyncResult> {
    this.ensureInitialized();

    const result: FactSheetSyncResult = {
      created: 0,
      updated: 0,
      unchanged: 0,
      errors: 0,
      errorDetails: [],
      syncedAt: new Date().toISOString(),
    };

    try {
      // Read CSV files from discovery data
      const rawDataPath = path.join(this.dataRootPath, companyName, 'Raw');

      // Try to load App Registrations
      const appRegPath = path.join(rawDataPath, 'EntraIDAppRegistrations.csv');
      if (await this.fileExists(appRegPath)) {
        const appRegData = await this.parseCSV(appRegPath);
        for (const row of appRegData) {
          try {
            const syncResult = await this.syncApplicationFromRow(
              row,
              'EntraIDAppRegistrations',
              classificationResults
            );
            result[syncResult]++;
          } catch (error: any) {
            result.errors++;
            result.errorDetails.push({
              appId: row.AppId || row.Id || 'unknown',
              error: error.message,
            });
          }
        }
      }

      // Try to load Enterprise Apps
      const entAppPath = path.join(rawDataPath, 'EntraIDEnterpriseApps.csv');
      if (await this.fileExists(entAppPath)) {
        const entAppData = await this.parseCSV(entAppPath);
        for (const row of entAppData) {
          try {
            const syncResult = await this.syncApplicationFromRow(
              row,
              'EntraIDEnterpriseApps',
              classificationResults
            );
            result[syncResult]++;
          } catch (error: any) {
            result.errors++;
            result.errorDetails.push({
              appId: row.AppId || row.Id || 'unknown',
              error: error.message,
            });
          }
        }
      }

      // Update last sync time
      this.db.data!.lastSync = result.syncedAt;
      await this.db.write();

      console.log('[ApplicationFactsService] Sync complete:', result);
    } catch (error) {
      console.error('[ApplicationFactsService] Sync failed:', error);
      throw error;
    }

    return result;
  }

  private async syncApplicationFromRow(
    row: Record<string, any>,
    source: DiscoverySource,
    classificationResults?: Map<string, any>
  ): Promise<'created' | 'updated' | 'unchanged'> {
    const appId = row.AppId || row.ApplicationId || row.Id;
    if (!appId) throw new Error('No AppId found in row');

    const existing = await this.getByAppId(appId);
    const classification = classificationResults?.get(appId);

    const now = new Date().toISOString();
    const data: Partial<ApplicationFact> = {
      appId,
      displayName: row.DisplayName || row.Name || appId,
      objectId: row.ObjectId,
      publisherDomain: row.PublisherDomain,
      publisherName: row.PublisherName,
      appOwnerOrganizationId: row.AppOwnerOrganizationId,
      signInAudience: row.SignInAudience,
      servicePrincipalType: row.ServicePrincipalType,
      lastSyncAt: now,
    };

    // Add classification if available
    if (classification) {
      data.classification = classification.category;
      data.classificationConfidence = classification.confidence;
      data.classificationReasons = classification.reasons;
    }

    // Add tags from row
    if (row.Tags) {
      data.tags = Array.isArray(row.Tags) ? row.Tags : row.Tags.split(',').map((t: string) => t.trim());
    }

    if (existing) {
      // Check if anything changed
      const hasChanges = Object.keys(data).some((key) => {
        if (key === 'lastSyncAt') return false;
        return JSON.stringify((existing as any)[key]) !== JSON.stringify((data as any)[key]);
      });

      if (hasChanges) {
        await this.update(existing.id, data, source, 'Synced from discovery data');
        return 'updated';
      } else {
        // Just update lastSyncAt
        await this.update(existing.id, { lastSyncAt: now }, source);
        return 'unchanged';
      }
    } else {
      await this.create({
        id: uuidv4(),
        ...data,
      });
      return 'created';
    }
  }

  // ============================================================
  // Filter Helper
  // ============================================================

  private applyFilter(facts: ApplicationFact[], filter: FactSheetFilter): ApplicationFact[] {
    return facts.filter((fact) => {
      if (filter.classification && !filter.classification.includes(fact.classification)) {
        return false;
      }
      if (filter.lifecycleState && !filter.lifecycleState.includes(fact.lifecycle.state)) {
        return false;
      }
      if (filter.criticality && !filter.criticality.includes(fact.business.criticality)) {
        return false;
      }
      if (filter.hostingType && !filter.hostingType.includes(fact.technical.hostingType)) {
        return false;
      }
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some((t) => fact.tags.includes(t))) {
          return false;
        }
      }
      if (filter.searchText) {
        const search = filter.searchText.toLowerCase();
        if (
          !fact.displayName.toLowerCase().includes(search) &&
          !fact.description?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filter.hasMigrationPlan !== undefined) {
        if (filter.hasMigrationPlan && !fact.migration) return false;
        if (!filter.hasMigrationPlan && fact.migration) return false;
      }
      if (filter.migrationStatus && filter.migrationStatus.length > 0) {
        if (!fact.migration || !filter.migrationStatus.includes(fact.migration.status)) {
          return false;
        }
      }
      return true;
    });
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async parseCSV(filePath: string): Promise<Record<string, any>[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const records: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const record: Record<string, any> = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      records.push(record);
    }

    return records;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // ============================================================
  // IPC Handler Registration
  // ============================================================

  registerIpcHandlers(): void {
    // CRUD
    ipcMain.handle('facts:getAll', async (_, filter?: FactSheetFilter) => {
      return this.getAll(filter);
    });

    ipcMain.handle('facts:getById', async (_, id: string) => {
      return this.getById(id);
    });

    ipcMain.handle('facts:getByAppId', async (_, appId: string) => {
      return this.getByAppId(appId);
    });

    ipcMain.handle('facts:create', async (_, data: Partial<ApplicationFact>) => {
      return this.create(data);
    });

    ipcMain.handle(
      'facts:update',
      async (_, id: string, updates: Partial<ApplicationFact>, source?: DiscoverySource, notes?: string) => {
        return this.update(id, updates, source, notes);
      }
    );

    ipcMain.handle('facts:delete', async (_, id: string) => {
      return this.delete(id);
    });

    // Relations
    ipcMain.handle('facts:addRelation', async (_, factId: string, relation: Omit<FactRelation, 'id'>) => {
      return this.addRelation(factId, relation);
    });

    ipcMain.handle('facts:removeRelation', async (_, factId: string, relationId: string) => {
      return this.removeRelation(factId, relationId);
    });

    ipcMain.handle('facts:getRelations', async (_, appId: string) => {
      return this.getRelationsForApp(appId);
    });

    // Migration
    ipcMain.handle('facts:setMigrationPlan', async (_, factId: string, plan: ApplicationMigrationPlan) => {
      return this.setMigrationPlan(factId, plan);
    });

    ipcMain.handle('facts:getByMigrationStatus', async (_, status: ApplicationMigrationPlan['status']) => {
      return this.getByMigrationStatus(status);
    });

    // Statistics
    ipcMain.handle('facts:getStatistics', async () => {
      return this.getStatistics();
    });

    // Sync
    ipcMain.handle(
      'facts:syncFromDiscovery',
      async (_, companyName: string, classificationResults?: Map<string, any>) => {
        return this.syncFromDiscoveryData(companyName, classificationResults);
      }
    );

    console.log('[ApplicationFactsService] IPC handlers registered');
  }
}

// Export singleton instance
export const applicationFactsService = new ApplicationFactsService();
