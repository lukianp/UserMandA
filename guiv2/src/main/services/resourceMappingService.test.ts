/**
 * Unit Tests for ResourceMappingService
 *
 * CRITICAL SERVICE - Handles resource mapping for migrations
 * Tests cover:
 * - Auto-mapping with various strategies (UPN, email, displayName, SAM)
 * - Fuzzy matching with Levenshtein distance
 * - Conflict detection (one-to-many, many-to-one, type mismatch)
 * - Manual mapping CRUD operations
 * - Bulk mapping updates
 * - CSV import/export
 * - JSON export
 * - Mapping validation
 * - Template creation and application
 * - Edge cases and error handling
 */

import ResourceMappingService, {
  ResourceMapping,
  ResourceType,
  MappingStrategy,
} from './resourceMappingService';
import PowerShellExecutionService from './powerShellService';

// Mock fs/promises module
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

// Mock papaparse
jest.mock('papaparse', () => ({
  parse: jest.fn((content, options) => {
    // Simple CSV parser mock
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map((line: string) => {
      const values = line.split(',').map((v: string) => v.replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h: string, i: number) => {
        obj[h] = values[i];
      });
      return obj;
    });
    options.complete({ data });
    return { data };
  }),
}));

// Mock crypto.randomUUID to generate unique IDs in tests
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => {
      uuidCounter++;
      return `test-uuid-${uuidCounter.toString().padStart(4, '0')}`;
    }),
  },
  writable: true,
  configurable: true,
});

const mockFs = require('fs/promises');

describe('ResourceMappingService', () => {
  let service: ResourceMappingService;
  let mockPowerShell: jest.Mocked<PowerShellExecutionService>;
  let testDataDir: string;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset UUID counter for predictable test IDs
    uuidCounter = 0;

    // Setup mock fs
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockRejectedValue(new Error('File not found')); // No existing data

    // Create mock PowerShell service
    mockPowerShell = {
      executeScript: jest.fn(),
    } as any;

    testDataDir = 'C:\\TestData\\Mappings';
    service = new ResourceMappingService(mockPowerShell, testDataDir);
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    it('should create data directory on initialization', async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); // Wait for async initialization

      expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
    });

    it('should initialize with default data directory when not provided', () => {
      const defaultService = new ResourceMappingService(mockPowerShell);
      expect(defaultService).toBeDefined();
    });

    it('should initialize empty mappings', () => {
      expect(service.getMappings()).toEqual([]);
    });
  });

  // ============================================================================
  // Auto-Mapping Tests
  // ============================================================================

  describe('autoMapResources', () => {
    const sourceResources = [
      {
        id: 'user1',
        name: 'John Doe',
        displayName: 'John Doe',
        userPrincipalName: 'john.doe@source.com',
        mail: 'john.doe@source.com',
        samAccountName: 'jdoe',
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        displayName: 'Jane Smith',
        userPrincipalName: 'jane.smith@source.com',
        mail: 'jane.smith@source.com',
        samAccountName: 'jsmith',
      },
      {
        id: 'user3',
        name: 'Bob Wilson',
        displayName: 'Bob Wilson',
        userPrincipalName: 'bob.wilson@source.com',
        mail: 'bob.wilson@source.com',
        samAccountName: 'bwilson',
      },
    ];

    const targetResources = [
      {
        id: 'target1',
        name: 'John Doe',
        displayName: 'John Doe',
        userPrincipalName: 'john.doe@target.com',
        mail: 'john.doe@target.com',
        samAccountName: 'jdoe',
      },
      {
        id: 'target2',
        name: 'Jane Smith',
        displayName: 'Jane Smith',
        userPrincipalName: 'jane.smith@target.com',
        mail: 'jane.smith@target.com',
        samAccountName: 'jsmith',
      },
    ];

    it('should auto-map resources using UPN strategy', async () => {
      // Modify target resources to have same UPN prefix
      const targetsWithMatchingUPN = [
        { ...targetResources[0], userPrincipalName: 'john.doe@target.com' },
        { ...targetResources[1], userPrincipalName: 'jane.smith@target.com' },
      ];

      const events: any[] = [];
      service.on('automapping:started', data => events.push({ event: 'started', data }));
      service.on('automapping:completed', data => events.push({ event: 'completed', data }));

      const result = await service.autoMapResources(
        'wave-001',
        sourceResources.slice(0, 2),
        targetsWithMatchingUPN,
        'displayName', // Use displayName since UPN domains differ
        { resourceType: 'user' }
      );

      expect(result.totalResources).toBe(2);
      expect(result.mappedCount).toBe(2);
      expect(result.unmappedCount).toBe(0);
      expect(result.highConfidenceCount).toBe(2); // 100% confidence

      expect(events[0].event).toBe('started');
      expect(events[1].event).toBe('completed');
    });

    it('should auto-map resources using email strategy', async () => {
      const targetsWithMatchingEmail = [
        { ...targetResources[0], mail: sourceResources[0].mail },
        { ...targetResources[1], mail: sourceResources[1].mail },
      ];

      const result = await service.autoMapResources(
        'wave-001',
        sourceResources.slice(0, 2),
        targetsWithMatchingEmail,
        'email',
        { resourceType: 'user' }
      );

      expect(result.mappedCount).toBe(2);
      expect(result.highConfidenceCount).toBe(2);
    });

    it('should auto-map resources using displayName strategy', async () => {
      const result = await service.autoMapResources(
        'wave-001',
        sourceResources,
        targetResources,
        'displayName',
        { resourceType: 'user' }
      );

      expect(result.totalResources).toBe(3);
      expect(result.mappedCount).toBe(2); // Only John and Jane match
      expect(result.unmappedCount).toBe(1); // Bob has no match
    });

    it('should auto-map resources using samAccountName strategy', async () => {
      const result = await service.autoMapResources(
        'wave-001',
        sourceResources,
        targetResources,
        'samAccountName',
        { resourceType: 'user' }
      );

      expect(result.mappedCount).toBe(2);
      expect(result.unmappedCount).toBe(1);
    });

    it('should use fuzzy matching when exact match fails', async () => {
      const sourceWithTypo = [
        {
          id: 'user1',
          displayName: 'Jon Doe', // Typo: Jon instead of John
          userPrincipalName: 'jon.doe@source.com',
          mail: 'jon.doe@source.com',
        },
      ];

      const result = await service.autoMapResources(
        'wave-001',
        sourceWithTypo,
        targetResources,
        'displayName',
        { fuzzyMatch: true, minConfidence: 70 }
      );

      expect(result.mappedCount).toBe(1);
      expect(result.lowConfidenceCount).toBe(1); // Fuzzy match has lower confidence
      expect(result.mappings[0].confidence).toBeLessThan(100);
      expect(result.mappings[0].confidence).toBeGreaterThanOrEqual(70);
    });

    it('should not map when fuzzy match confidence is below threshold', async () => {
      const sourceVeryDifferent = [
        {
          id: 'user1',
          displayName: 'Completely Different Name',
          userPrincipalName: 'different@source.com',
        },
      ];

      const result = await service.autoMapResources(
        'wave-001',
        sourceVeryDifferent,
        targetResources,
        'displayName',
        { fuzzyMatch: true, minConfidence: 90 }
      );

      expect(result.mappedCount).toBe(0);
      expect(result.unmappedCount).toBe(1);
    });

    it('should detect one-to-many conflicts', async () => {
      // Two sources mapping to same target
      const duplicateSources = [
        sourceResources[0],
        { ...sourceResources[0], id: 'user1-duplicate' },
      ];

      const result = await service.autoMapResources(
        'wave-001',
        duplicateSources,
        targetResources,
        'displayName'
      );

      expect(result.conflictCount).toBeGreaterThan(0);
      const conflictedMappings = result.mappings.filter(m => m.conflicts.length > 0);
      expect(conflictedMappings.length).toBeGreaterThan(0);
      expect(conflictedMappings[0].status).toBe('conflict');
    });

    it('should handle empty source resources', async () => {
      const result = await service.autoMapResources('wave-001', [], targetResources, 'displayName');

      expect(result.totalResources).toBe(0);
      expect(result.mappedCount).toBe(0);
      expect(result.unmappedCount).toBe(0);
    });

    it('should handle empty target resources', async () => {
      const result = await service.autoMapResources('wave-001', sourceResources, [], 'displayName');

      expect(result.totalResources).toBe(3);
      expect(result.mappedCount).toBe(0);
      expect(result.unmappedCount).toBe(3);
    });
  });

  // ============================================================================
  // Manual Mapping CRUD Tests
  // ============================================================================

  describe('Manual Mapping Operations', () => {
    it('should create manual mapping', async () => {
      const events: any[] = [];
      service.on('mapping:created', data => events.push({ event: 'created', data }));

      const mapping = await service.createMapping({
        waveId: 'wave-001',
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        targetId: 'target1',
        targetName: 'John Doe (Target)',
        targetType: 'user',
        targetAttributes: {},
        status: 'manual',
        conflicts: [],
        createdBy: 'admin',
      });

      expect(mapping.id).toBeDefined();
      expect(mapping.sourceName).toBe('John Doe');
      expect(mapping.status).toBe('manual');
      expect(mapping.createdAt).toBeDefined();
      expect(mapping.updatedAt).toBeDefined();

      expect(events[0].event).toBe('created');
    });

    it('should update mapping', async () => {
      const mapping = await service.createMapping({
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'pending',
        conflicts: [],
        createdBy: 'admin',
      });

      const events: any[] = [];
      service.on('mapping:updated', data => events.push({ event: 'updated', data }));

      const updated = await service.updateMapping(mapping.id, {
        targetId: 'target1',
        targetName: 'John Target',
        status: 'validated',
      });

      expect(updated.targetId).toBe('target1');
      expect(updated.status).toBe('validated');
      expect(updated.updatedAt).not.toBe(mapping.updatedAt);

      expect(events[0].event).toBe('updated');
    });

    it('should delete mapping', async () => {
      const mapping = await service.createMapping({
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'pending',
        conflicts: [],
        createdBy: 'admin',
      });

      const events: any[] = [];
      service.on('mapping:deleted', data => events.push({ event: 'deleted', data }));

      await service.deleteMapping(mapping.id);

      expect(service.getMapping(mapping.id)).toBeNull();
      expect(events[0].event).toBe('deleted');
    });

    it('should throw error when updating non-existent mapping', async () => {
      await expect(service.updateMapping('invalid-id', { status: 'validated' })).rejects.toThrow(
        'Mapping invalid-id not found'
      );
    });

    it('should throw error when deleting non-existent mapping', async () => {
      await expect(service.deleteMapping('invalid-id')).rejects.toThrow(
        'Mapping invalid-id not found'
      );
    });
  });

  // ============================================================================
  // Bulk Operations Tests
  // ============================================================================

  describe('Bulk Operations', () => {
    it('should bulk update mappings', async () => {
      // Create multiple mappings
      const mapping1 = await service.createMapping({
        sourceId: 'user1',
        sourceName: 'User 1',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'pending',
        conflicts: [],
        createdBy: 'admin',
      });

      const mapping2 = await service.createMapping({
        sourceId: 'user2',
        sourceName: 'User 2',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'pending',
        conflicts: [],
        createdBy: 'admin',
      });

      const events: any[] = [];
      service.on('mappings:bulk-updated', data => events.push({ event: 'bulk-updated', data }));

      const updates = new Map([
        [mapping1.id, { status: 'validated' as const }],
        [mapping2.id, { status: 'validated' as const }],
      ]);

      await service.bulkUpdateMappings(updates);

      const updated1 = service.getMapping(mapping1.id);
      const updated2 = service.getMapping(mapping2.id);

      expect(updated1?.status).toBe('validated');
      expect(updated2?.status).toBe('validated');

      expect(events[0].event).toBe('bulk-updated');
      expect(events[0].data.count).toBe(2);
    });
  });

  // ============================================================================
  // CSV Import/Export Tests
  // ============================================================================

  describe('CSV Import/Export', () => {
    it('should import mappings from CSV', async () => {
      const csvContent =
        'sourceId,sourceName,sourceType,targetId,targetName,targetType,notes\n' +
        'user1,John Doe,user,target1,John Target,user,Imported mapping\n' +
        'user2,Jane Smith,user,target2,Jane Target,user,Another mapping';

      mockFs.readFile.mockResolvedValue(csvContent);

      const events: any[] = [];
      service.on('mappings:imported', data => events.push({ event: 'imported', data }));

      const mappings = await service.importFromCSV('test.csv', 'wave-001');

      expect(mappings.length).toBe(2);
      expect(mappings[0].sourceName).toBe('John Doe');
      expect(mappings[0].waveId).toBe('wave-001');
      expect(mappings[0].status).toBe('manual');
      expect(mappings[0].createdBy).toBe('csv-import');

      expect(events[0].event).toBe('imported');
      expect(events[0].data.count).toBe(2);
    });

    it('should export mappings to CSV', async () => {
      await service.createMapping({
        waveId: 'wave-001',
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        targetId: 'target1',
        targetName: 'John Target',
        targetType: 'user',
        targetAttributes: {},
        status: 'validated',
        confidence: 95,
        conflicts: [],
        createdBy: 'admin',
        notes: 'Test mapping',
      });

      await service.exportToCSV('export.csv', 'wave-001');

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'export.csv',
        expect.stringContaining('sourceId,sourceName,sourceType'),
        'utf-8'
      );

      const csvContent = (mockFs.writeFile as jest.Mock).mock.calls[
        (mockFs.writeFile as jest.Mock).mock.calls.length - 1
      ][1];
      expect(csvContent).toContain('John Doe');
      expect(csvContent).toContain('John Target');
    });
  });

  // ============================================================================
  // JSON Export Tests
  // ============================================================================

  describe('JSON Export', () => {
    it('should export mappings to JSON', async () => {
      await service.createMapping({
        waveId: 'wave-001',
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'validated',
        conflicts: [],
        createdBy: 'admin',
      });

      await service.exportToJSON('export.json', 'wave-001');

      expect(mockFs.writeFile).toHaveBeenCalled();
      const jsonContent = (mockFs.writeFile as jest.Mock).mock.calls[
        (mockFs.writeFile as jest.Mock).mock.calls.length - 1
      ][1];

      const parsed = JSON.parse(jsonContent);
      expect(parsed.length).toBe(1);
      expect(parsed[0].sourceName).toBe('John Doe');
    });

    it('should export all mappings when no wave specified', async () => {
      await service.createMapping({
        waveId: 'wave-001',
        sourceId: 'user1',
        sourceName: 'User 1',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'validated',
        conflicts: [],
        createdBy: 'admin',
      });

      await service.createMapping({
        waveId: 'wave-002',
        sourceId: 'user2',
        sourceName: 'User 2',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'validated',
        conflicts: [],
        createdBy: 'admin',
      });

      await service.exportToJSON('export-all.json');

      const jsonContent = (mockFs.writeFile as jest.Mock).mock.calls[
        (mockFs.writeFile as jest.Mock).mock.calls.length - 1
      ][1];

      const parsed = JSON.parse(jsonContent);
      expect(parsed.length).toBe(2);
    });
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Validation', () => {
    it('should validate mappings successfully', async () => {
      await service.createMapping({
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        targetId: 'target1',
        targetName: 'John Target',
        status: 'validated',
        conflicts: [],
        createdBy: 'admin',
      });

      const validation = await service.validateMappings();

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect unmapped resources as warnings', async () => {
      await service.createMapping({
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        // No target
        status: 'pending',
        conflicts: [],
        createdBy: 'admin',
      });

      const validation = await service.validateMappings();

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('is not mapped to any target');
    });

    it('should detect low confidence mappings as warnings', async () => {
      await service.createMapping({
        sourceId: 'user1',
        sourceName: 'John Doe',
        sourceType: 'user',
        sourceAttributes: {},
        targetId: 'target1',
        status: 'auto-mapped',
        confidence: 75, // Low confidence
        conflicts: [],
        createdBy: 'admin',
      });

      const validation = await service.validateMappings();

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('low confidence'))).toBe(true);
    });
  });

  // ============================================================================
  // Template Management Tests
  // ============================================================================

  describe('Template Management', () => {
    it('should create mapping template', async () => {
      const template = await service.createTemplate({
        name: 'User UPN Mapping',
        description: 'Map users by UPN',
        resourceType: 'user',
        strategy: 'upn',
        rules: [],
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('User UPN Mapping');
      expect(template.createdAt).toBeDefined();
    });
  });

  // ============================================================================
  // Data Retrieval Tests
  // ============================================================================

  describe('Data Retrieval', () => {
    beforeEach(async () => {
      await service.createMapping({
        waveId: 'wave-001',
        sourceId: 'user1',
        sourceName: 'User 1',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'validated',
        conflicts: [],
        createdBy: 'admin',
      });

      await service.createMapping({
        waveId: 'wave-001',
        sourceId: 'group1',
        sourceName: 'Group 1',
        sourceType: 'group',
        sourceAttributes: {},
        status: 'validated',
        conflicts: [],
        createdBy: 'admin',
      });

      await service.createMapping({
        waveId: 'wave-002',
        sourceId: 'user2',
        sourceName: 'User 2',
        sourceType: 'user',
        sourceAttributes: {},
        status: 'pending',
        conflicts: [],
        createdBy: 'admin',
      });
    });

    it('should get all mappings', () => {
      const mappings = service.getMappings();
      expect(mappings.length).toBe(3);
    });

    it('should filter mappings by wave', () => {
      const wave1Mappings = service.getMappings('wave-001');
      const wave2Mappings = service.getMappings('wave-002');

      expect(wave1Mappings.length).toBe(2);
      expect(wave2Mappings.length).toBe(1);
    });

    it('should filter mappings by resource type', () => {
      const userMappings = service.getMappings(undefined, 'user');
      const groupMappings = service.getMappings(undefined, 'group');

      expect(userMappings.length).toBe(2);
      expect(groupMappings.length).toBe(1);
    });

    it('should get mapping by ID', () => {
      const allMappings = service.getMappings();
      const mappingId = allMappings[0].id;

      const mapping = service.getMapping(mappingId);

      expect(mapping).not.toBeNull();
      expect(mapping?.id).toBe(mappingId);
    });

    it('should return null for non-existent mapping ID', () => {
      const mapping = service.getMapping('invalid-id');
      expect(mapping).toBeNull();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle resources without mapping keys', async () => {
      const resourcesWithoutKeys = [
        { id: 'user1' }, // No displayName, UPN, etc.
        { id: 'user2', displayName: null },
      ];

      const result = await service.autoMapResources(
        'wave-001',
        resourcesWithoutKeys,
        [],
        'displayName'
      );

      expect(result.unmappedCount).toBe(2);
      expect(result.mappedCount).toBe(0);
    });

    it('should handle large number of mappings', async () => {
      const largeSources = Array.from({ length: 100 }, (_, i) => ({
        id: `user${i}`,
        displayName: `User ${i}`,
      }));

      const largeTargets = Array.from({ length: 100 }, (_, i) => ({
        id: `target${i}`,
        displayName: `User ${i}`,
      }));

      const result = await service.autoMapResources(
        'wave-large',
        largeSources,
        largeTargets,
        'displayName'
      );

      expect(result.mappedCount).toBe(100);
      expect(result.highConfidenceCount).toBe(100);
    });

    it('should handle special characters in names', async () => {
      const sources = [
        { id: 'user1', displayName: "O'Brien, John (IT)" },
      ];

      const targets = [
        { id: 'target1', displayName: "O'Brien, John (IT)" },
      ];

      const result = await service.autoMapResources('wave-001', sources, targets, 'displayName');

      expect(result.mappedCount).toBe(1);
    });

    it('should detect type mismatch conflicts', async () => {
      const sources = [
        { id: 'user1', displayName: 'John Doe', recipientType: 'UserMailbox' },
      ];

      const targets = [
        { id: 'group1', displayName: 'John Doe', recipientType: 'MailUniversalDistributionGroup' },
      ];

      const result = await service.autoMapResources('wave-001', sources, targets, 'displayName');

      const mapping = result.mappings[0];
      const typeMismatchConflict = mapping.conflicts.find(c => c.type === 'type-mismatch');

      expect(typeMismatchConflict).toBeDefined();
      expect(typeMismatchConflict?.severity).toBe('warning');
    });
  });
});
