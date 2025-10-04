/**
 * Resource Mapping Service
 *
 * Resource mapping with:
 * - Map source groups → target groups
 * - Map distribution lists
 * - Map shared mailboxes
 * - Map public folders
 * - Map file shares/permissions
 * - Map application access
 * - Auto-mapping with fuzzy matching
 * - Manual override support
 * - Conflict detection (1:many, many:1 mappings)
 * - Import/export mappings (CSV, JSON)
 * - Mapping templates
 * - Mapping validation
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import PowerShellExecutionService from './powerShellService';
import { parse as parseCSV } from 'papaparse';

/**
 * Resource type
 */
export type ResourceType =
  | 'user'
  | 'group'
  | 'distribution-list'
  | 'shared-mailbox'
  | 'public-folder'
  | 'file-share'
  | 'application'
  | 'security-group'
  | 'room-mailbox'
  | 'equipment-mailbox';

/**
 * Mapping status
 */
export type MappingStatus = 'pending' | 'auto-mapped' | 'manual' | 'validated' | 'conflict' | 'error';

/**
 * Mapping strategy
 */
export type MappingStrategy = 'upn' | 'displayName' | 'email' | 'samAccountName' | 'custom';

/**
 * Resource mapping
 */
export interface ResourceMapping {
  id: string;
  waveId?: string;
  sourceId: string;
  sourceName: string;
  sourceType: ResourceType;
  sourceAttributes: Record<string, any>;
  targetId?: string;
  targetName?: string;
  targetType?: ResourceType;
  targetAttributes?: Record<string, any>;
  status: MappingStatus;
  strategy?: MappingStrategy;
  confidence?: number; // 0-100 for auto-mapping
  conflicts: MappingConflict[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Mapping conflict
 */
interface MappingConflict {
  type: 'duplicate-source' | 'duplicate-target' | 'one-to-many' | 'many-to-one' | 'type-mismatch';
  severity: 'warning' | 'error';
  message: string;
  relatedMappings: string[]; // Mapping IDs
}

/**
 * Mapping template
 */
interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  resourceType: ResourceType;
  strategy: MappingStrategy;
  rules: MappingRule[];
  createdAt: Date;
}

/**
 * Mapping rule
 */
interface MappingRule {
  id: string;
  condition: string; // JavaScript expression
  action: 'map' | 'skip' | 'transform';
  parameters: Record<string, any>;
}

/**
 * Auto-mapping result
 */
interface AutoMappingResult {
  totalResources: number;
  mappedCount: number;
  unmappedCount: number;
  conflictCount: number;
  highConfidenceCount: number;
  lowConfidenceCount: number;
  mappings: ResourceMapping[];
}

/**
 * Resource Mapping Service
 */
class ResourceMappingService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private mappings: Map<string, ResourceMapping>;
  private templates: Map<string, MappingTemplate>;
  private dataDir: string;

  constructor(powerShellService: PowerShellExecutionService, dataDir?: string) {
    super();
    this.powerShellService = powerShellService;
    this.mappings = new Map();
    this.templates = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'mappings');

    this.ensureDataDirectory();
    this.loadMappings();
    this.loadTemplates();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create mapping data directory:', error);
    }
  }

  /**
   * Auto-map resources using strategy
   */
  async autoMapResources(
    waveId: string,
    sourceResources: any[],
    targetResources: any[],
    strategy: MappingStrategy,
    options: {
      resourceType?: ResourceType;
      minConfidence?: number;
      fuzzyMatch?: boolean;
    } = {}
  ): Promise<AutoMappingResult> {
    const { resourceType, minConfidence = 70, fuzzyMatch = true } = options;

    console.log(`Auto-mapping ${sourceResources.length} resources using strategy: ${strategy}`);
    this.emit('automapping:started', { waveId, strategy, count: sourceResources.length });

    const mappings: ResourceMapping[] = [];
    let mappedCount = 0;
    let unmappedCount = 0;
    let conflictCount = 0;
    let highConfidenceCount = 0;
    let lowConfidenceCount = 0;

    try {
      // Build target lookup map
      const targetMap = new Map<string, any>();
      for (const target of targetResources) {
        const key = this.buildMappingKey(target, strategy);
        if (key) {
          targetMap.set(key, target);
        }
      }

      // Map each source resource
      for (const source of sourceResources) {
        const sourceKey = this.buildMappingKey(source, strategy);
        if (!sourceKey) {
          unmappedCount++;
          continue;
        }

        let target = targetMap.get(sourceKey);
        let confidence = target ? 100 : 0;

        // Try fuzzy matching if exact match fails
        if (!target && fuzzyMatch) {
          const fuzzyResult = this.fuzzyMatch(sourceKey, Array.from(targetMap.keys()));
          if (fuzzyResult.score >= minConfidence) {
            target = targetMap.get(fuzzyResult.match);
            confidence = fuzzyResult.score;
          }
        }

        const mapping: ResourceMapping = {
          id: crypto.randomUUID(),
          waveId,
          sourceId: source.id || source.objectId || source.distinguishedName,
          sourceName: source.name || source.displayName,
          sourceType: resourceType || this.detectResourceType(source),
          sourceAttributes: source,
          targetId: target?.id || target?.objectId,
          targetName: target?.name || target?.displayName,
          targetType: target ? (resourceType || this.detectResourceType(target)) : undefined,
          targetAttributes: target,
          status: target ? 'auto-mapped' : 'pending',
          strategy,
          confidence,
          conflicts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'auto-mapping',
        };

        if (target) {
          mappedCount++;
          if (confidence >= 90) {
            highConfidenceCount++;
          } else {
            lowConfidenceCount++;
          }
        } else {
          unmappedCount++;
        }

        mappings.push(mapping);
        this.mappings.set(mapping.id, mapping);
      }

      // Detect conflicts
      await this.detectConflicts(mappings);
      conflictCount = mappings.filter(m => m.conflicts.length > 0).length;

      // Save mappings
      await this.saveMappings();

      const result: AutoMappingResult = {
        totalResources: sourceResources.length,
        mappedCount,
        unmappedCount,
        conflictCount,
        highConfidenceCount,
        lowConfidenceCount,
        mappings,
      };

      this.emit('automapping:completed', { waveId, result });

      return result;
    } catch (error: any) {
      console.error('Auto-mapping failed:', error);
      this.emit('automapping:failed', { waveId, error: error.message });
      throw error;
    }
  }

  /**
   * Build mapping key based on strategy
   */
  private buildMappingKey(resource: any, strategy: MappingStrategy): string | null {
    switch (strategy) {
      case 'upn':
        return resource.userPrincipalName?.toLowerCase();
      case 'email':
        return resource.mail?.toLowerCase() || resource.emailAddress?.toLowerCase();
      case 'displayName':
        return resource.displayName?.toLowerCase();
      case 'samAccountName':
        return resource.samAccountName?.toLowerCase();
      default:
        return null;
    }
  }

  /**
   * Fuzzy match string against candidates
   */
  private fuzzyMatch(query: string, candidates: string[]): { match: string; score: number } {
    let bestMatch = '';
    let bestScore = 0;

    const queryLower = query.toLowerCase();

    for (const candidate of candidates) {
      const candidateLower = candidate.toLowerCase();

      // Exact match
      if (queryLower === candidateLower) {
        return { match: candidate, score: 100 };
      }

      // Calculate Levenshtein distance
      const distance = this.levenshteinDistance(queryLower, candidateLower);
      const maxLength = Math.max(queryLower.length, candidateLower.length);
      const similarity = ((maxLength - distance) / maxLength) * 100;

      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = candidate;
      }
    }

    return { match: bestMatch, score: Math.round(bestScore) };
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
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

    return matrix[b.length][a.length];
  }

  /**
   * Detect resource type
   */
  private detectResourceType(resource: any): ResourceType {
    if (resource.recipientType === 'UserMailbox') return 'user';
    if (resource.recipientType === 'MailUniversalDistributionGroup') return 'distribution-list';
    if (resource.recipientType === 'MailUniversalSecurityGroup') return 'security-group';
    if (resource.recipientType === 'SharedMailbox') return 'shared-mailbox';
    if (resource.recipientType === 'RoomMailbox') return 'room-mailbox';
    if (resource.recipientType === 'EquipmentMailbox') return 'equipment-mailbox';
    if (resource.objectClass?.includes('group')) return 'group';
    return 'user';
  }

  /**
   * Detect mapping conflicts
   */
  private async detectConflicts(mappings: ResourceMapping[]): Promise<void> {
    const sourceMap = new Map<string, string[]>();
    const targetMap = new Map<string, string[]>();

    // Build conflict detection maps
    for (const mapping of mappings) {
      // Track source duplicates
      if (!sourceMap.has(mapping.sourceId)) {
        sourceMap.set(mapping.sourceId, []);
      }
      sourceMap.get(mapping.sourceId)!.push(mapping.id);

      // Track target duplicates
      if (mapping.targetId) {
        if (!targetMap.has(mapping.targetId)) {
          targetMap.set(mapping.targetId, []);
        }
        targetMap.get(mapping.targetId)!.push(mapping.id);
      }
    }

    // Detect conflicts
    for (const mapping of mappings) {
      mapping.conflicts = [];

      // Check for duplicate source (many-to-one)
      const sourceMappings = sourceMap.get(mapping.sourceId) || [];
      if (sourceMappings.length > 1) {
        mapping.conflicts.push({
          type: 'duplicate-source',
          severity: 'error',
          message: `Source ${mapping.sourceName} is mapped multiple times`,
          relatedMappings: sourceMappings.filter(id => id !== mapping.id),
        });
      }

      // Check for duplicate target (one-to-many)
      if (mapping.targetId) {
        const targetMappings = targetMap.get(mapping.targetId) || [];
        if (targetMappings.length > 1) {
          mapping.conflicts.push({
            type: 'one-to-many',
            severity: 'error',
            message: `Target ${mapping.targetName} is mapped from multiple sources`,
            relatedMappings: targetMappings.filter(id => id !== mapping.id),
          });
        }
      }

      // Check for type mismatch
      if (mapping.targetType && mapping.sourceType !== mapping.targetType) {
        mapping.conflicts.push({
          type: 'type-mismatch',
          severity: 'warning',
          message: `Type mismatch: ${mapping.sourceType} → ${mapping.targetType}`,
          relatedMappings: [],
        });
      }

      if (mapping.conflicts.length > 0) {
        mapping.status = 'conflict';
      }
    }
  }

  /**
   * Create manual mapping
   */
  async createMapping(mapping: Omit<ResourceMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResourceMapping> {
    const newMapping: ResourceMapping = {
      ...mapping,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mappings.set(newMapping.id, newMapping);
    await this.saveMappings();

    this.emit('mapping:created', newMapping);

    return newMapping;
  }

  /**
   * Update mapping
   */
  async updateMapping(mappingId: string, updates: Partial<ResourceMapping>): Promise<ResourceMapping> {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) {
      throw new Error(`Mapping ${mappingId} not found`);
    }

    const updated: ResourceMapping = {
      ...mapping,
      ...updates,
      updatedAt: new Date(),
    };

    this.mappings.set(mappingId, updated);
    await this.saveMappings();

    this.emit('mapping:updated', updated);

    return updated;
  }

  /**
   * Delete mapping
   */
  async deleteMapping(mappingId: string): Promise<void> {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) {
      throw new Error(`Mapping ${mappingId} not found`);
    }

    this.mappings.delete(mappingId);
    await this.saveMappings();

    this.emit('mapping:deleted', { id: mappingId });
  }

  /**
   * Bulk update mappings
   */
  async bulkUpdateMappings(updates: Map<string, Partial<ResourceMapping>>): Promise<void> {
    for (const [id, update] of updates.entries()) {
      const mapping = this.mappings.get(id);
      if (mapping) {
        this.mappings.set(id, { ...mapping, ...update, updatedAt: new Date() });
      }
    }

    await this.saveMappings();
    this.emit('mappings:bulk-updated', { count: updates.size });
  }

  /**
   * Import mappings from CSV
   */
  async importFromCSV(filePath: string, waveId?: string): Promise<ResourceMapping[]> {
    const content = await fs.readFile(filePath, 'utf-8');

    return new Promise((resolve, reject) => {
      parseCSV(content, {
        header: true,
        complete: async (results) => {
          const mappings: ResourceMapping[] = [];

          for (const row of results.data as any[]) {
            const mapping: ResourceMapping = {
              id: crypto.randomUUID(),
              waveId: waveId || row.waveId,
              sourceId: row.sourceId,
              sourceName: row.sourceName,
              sourceType: row.sourceType as ResourceType,
              sourceAttributes: {},
              targetId: row.targetId,
              targetName: row.targetName,
              targetType: row.targetType as ResourceType,
              targetAttributes: {},
              status: 'manual',
              conflicts: [],
              notes: row.notes,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'csv-import',
            };

            mappings.push(mapping);
            this.mappings.set(mapping.id, mapping);
          }

          await this.saveMappings();
          this.emit('mappings:imported', { count: mappings.length });

          resolve(mappings);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Export mappings to CSV
   */
  async exportToCSV(filePath: string, waveId?: string): Promise<void> {
    const mappings = waveId
      ? Array.from(this.mappings.values()).filter(m => m.waveId === waveId)
      : Array.from(this.mappings.values());

    const csvRows = [
      'sourceId,sourceName,sourceType,targetId,targetName,targetType,status,confidence,notes',
      ...mappings.map(m =>
        `"${m.sourceId}","${m.sourceName}","${m.sourceType}","${m.targetId || ''}","${m.targetName || ''}","${m.targetType || ''}","${m.status}","${m.confidence || ''}","${m.notes || ''}"`
      ),
    ];

    await fs.writeFile(filePath, csvRows.join('\n'), 'utf-8');
    console.log(`Exported ${mappings.length} mappings to ${filePath}`);
  }

  /**
   * Export mappings to JSON
   */
  async exportToJSON(filePath: string, waveId?: string): Promise<void> {
    const mappings = waveId
      ? Array.from(this.mappings.values()).filter(m => m.waveId === waveId)
      : Array.from(this.mappings.values());

    await fs.writeFile(filePath, JSON.stringify(mappings, null, 2), 'utf-8');
    console.log(`Exported ${mappings.length} mappings to ${filePath}`);
  }

  /**
   * Validate mappings
   */
  async validateMappings(waveId?: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const mappings = waveId
      ? Array.from(this.mappings.values()).filter(m => m.waveId === waveId)
      : Array.from(this.mappings.values());

    const errors: string[] = [];
    const warnings: string[] = [];

    // Re-detect conflicts
    await this.detectConflicts(mappings);

    for (const mapping of mappings) {
      // Check for unmapped resources
      if (!mapping.targetId) {
        warnings.push(`${mapping.sourceName} is not mapped to any target`);
      }

      // Check for conflicts
      for (const conflict of mapping.conflicts) {
        if (conflict.severity === 'error') {
          errors.push(`${mapping.sourceName}: ${conflict.message}`);
        } else {
          warnings.push(`${mapping.sourceName}: ${conflict.message}`);
        }
      }

      // Check for low confidence mappings
      if (mapping.confidence && mapping.confidence < 80) {
        warnings.push(`${mapping.sourceName} has low confidence mapping (${mapping.confidence}%)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get mappings
   */
  getMappings(waveId?: string, resourceType?: ResourceType): ResourceMapping[] {
    let mappings = Array.from(this.mappings.values());

    if (waveId) {
      mappings = mappings.filter(m => m.waveId === waveId);
    }

    if (resourceType) {
      mappings = mappings.filter(m => m.sourceType === resourceType);
    }

    return mappings;
  }

  /**
   * Get mapping by ID
   */
  getMapping(mappingId: string): ResourceMapping | null {
    return this.mappings.get(mappingId) || null;
  }

  /**
   * Create mapping template
   */
  async createTemplate(template: Omit<MappingTemplate, 'id' | 'createdAt'>): Promise<MappingTemplate> {
    const newTemplate: MappingTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    await this.saveTemplates();

    return newTemplate;
  }

  /**
   * Apply template to mappings
   */
  async applyTemplate(templateId: string, waveId: string, resources: any[]): Promise<ResourceMapping[]> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Use template strategy for auto-mapping
    // This is a simplified implementation
    const targetResources = await this.fetchTargetResources(template.resourceType);
    const result = await this.autoMapResources(waveId, resources, targetResources, template.strategy, {
      resourceType: template.resourceType,
    });

    return result.mappings;
  }

  /**
   * Fetch target resources (placeholder)
   */
  private async fetchTargetResources(resourceType: ResourceType): Promise<any[]> {
    // Would call PowerShell to fetch target resources
    // Placeholder for now
    return [];
  }

  /**
   * Save mappings to file
   */
  private async saveMappings(): Promise<void> {
    try {
      const mappingsArray = Array.from(this.mappings.values());
      const filepath = path.join(this.dataDir, 'mappings.json');
      await fs.writeFile(filepath, JSON.stringify(mappingsArray, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save mappings:', error);
    }
  }

  /**
   * Load mappings from file
   */
  private async loadMappings(): Promise<void> {
    try {
      const filepath = path.join(this.dataDir, 'mappings.json');
      const content = await fs.readFile(filepath, 'utf-8');
      const mappingsArray: ResourceMapping[] = JSON.parse(content);

      this.mappings.clear();
      for (const mapping of mappingsArray) {
        this.mappings.set(mapping.id, mapping);
      }

      console.log(`Loaded ${this.mappings.size} mappings`);
    } catch (error) {
      // File doesn't exist yet
    }
  }

  /**
   * Save templates to file
   */
  private async saveTemplates(): Promise<void> {
    try {
      const templatesArray = Array.from(this.templates.values());
      const filepath = path.join(this.dataDir, 'templates.json');
      await fs.writeFile(filepath, JSON.stringify(templatesArray, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  /**
   * Load templates from file
   */
  private async loadTemplates(): Promise<void> {
    try {
      const filepath = path.join(this.dataDir, 'templates.json');
      const content = await fs.readFile(filepath, 'utf-8');
      const templatesArray: MappingTemplate[] = JSON.parse(content);

      this.templates.clear();
      for (const template of templatesArray) {
        this.templates.set(template.id, template);
      }

      console.log(`Loaded ${this.templates.size} templates`);
    } catch (error) {
      // File doesn't exist yet
    }
  }
}

export default ResourceMappingService;
export { ResourceType, MappingStatus, MappingStrategy, ResourceMapping, MappingConflict, MappingTemplate };
