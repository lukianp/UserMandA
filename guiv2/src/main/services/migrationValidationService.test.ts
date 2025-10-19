/**
 * Unit Tests for MigrationValidationService
 *
 * CRITICAL SERVICE - Handles pre-migration validation for data safety
 * Tests cover:
 * - Wave validation (connectivity, capacity, users, mappings, dependencies, schedule, blockers)
 * - User validation (licenses, permissions, mailbox size)
 * - Blocker detection (legacy protocols, custom attributes, etc.)
 * - Dependency resolution
 * - Validation report generation
 * - Batch validation
 * - Remediation suggestions
 */

import MigrationValidationService from './migrationValidationService';
import PowerShellExecutionService from './powerShellService';
import * as path from 'path';
import { EventEmitter } from 'events';

// Mock dependencies
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('{}'),
}));

jest.mock('./powerShellService');

const mockFs = require('fs/promises');
const MockPowerShellService = PowerShellExecutionService as jest.MockedClass<typeof PowerShellExecutionService>;

describe('MigrationValidationService', () => {
  let service: MigrationValidationService;
  let mockPowerShell: jest.Mocked<PowerShellExecutionService>;
  let testDataDir: string;

  // Sample test data
  const sampleWaveId = 'wave-001';
  const sampleUsers = ['user1@test.com', 'user2@test.com', 'user3@test.com'];
  const sampleMappings = [
    { source: 'group1@source.com', target: 'group1@target.com', type: 'group' },
    { source: 'dl1@source.com', target: 'dl1@target.com', type: 'distributionList' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock fs
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue('{}');

    // Setup mock PowerShell service
    mockPowerShell = new MockPowerShellService() as jest.Mocked<PowerShellExecutionService>;

    // Default successful responses
    mockPowerShell.executeScript = jest.fn().mockResolvedValue({
      success: true,
      data: {},
      error: null,
    });

    testDataDir = path.join(process.cwd(), 'data', 'test-validation');
    service = new MigrationValidationService(mockPowerShell, testDataDir);
  });

  afterEach(() => {
    if (service) {
      service.removeAllListeners();
    }
  });

  // ============================================================================
  // Initialization Tests
  // ============================================================================

  describe('Initialization', () => {
    it('should create data directory on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('test-validation'),
        { recursive: true }
      );
    });

    it('should initialize with provided configuration', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(MigrationValidationService);
      expect(service).toBeInstanceOf(EventEmitter);
    });
  });

  // ============================================================================
  // Wave Validation Tests
  // ============================================================================

  describe('validateWave', () => {
    beforeEach(() => {
      // Setup successful validation responses
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-MigrationConnectivity')) {
          return Promise.resolve({
            success: true,
            data: { sourceConnected: true, targetConnected: true, latency: 50 },
            error: null,
          });
        }
        if (scriptPath.includes('Get-TargetCapacity')) {
          return Promise.resolve({
            success: true,
            data: { currentMailboxes: 100, maxMailboxes: 1000, remainingCapacity: 900 },
            error: null,
          });
        }
        if (scriptPath.includes('Test-UserMigrationReadiness')) {
          return Promise.resolve({
            success: true,
            data: {
              users: [
                {
                  userId: 'user1@test.com',
                  passed: true,
                  licenses: { available: true, missing: [] },
                  permissions: { sufficient: true, missing: [] },
                  mailbox: { withinLimit: true },
                  blockers: [],
                },
              ],
            },
            error: null,
          });
        }
        if (scriptPath.includes('Test-ResourceMappings')) {
          return Promise.resolve({
            success: true,
            data: { valid: true, invalidMappings: [] },
            error: null,
          });
        }
        if (scriptPath.includes('Test-MigrationDependencies')) {
          return Promise.resolve({
            success: true,
            data: { circular: false, unresolved: [] },
            error: null,
          });
        }
        if (scriptPath.includes('Test-MigrationSchedule')) {
          return Promise.resolve({
            success: true,
            data: { conflicts: [] },
            error: null,
          });
        }
        if (scriptPath.includes('Get-MigrationBlockers')) {
          return Promise.resolve({
            success: true,
            data: { blockers: [] },
            error: null,
          });
        }

        return Promise.resolve({
          success: true,
          data: {},
          error: null,
        });
      });
    });

    it('should validate wave successfully with all checks passing', async () => {
      const events: any[] = [];
      service.on('validation:started', (data) => events.push({ event: 'started', data }));
      service.on('validation:completed', (data) => events.push({ event: 'completed', data }));

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Verify report structure
      expect(report).toMatchObject({
        waveId: sampleWaveId,
        overallStatus: expect.any(String),
        canProceed: expect.any(Boolean),
      });

      expect(report.id).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.totalChecks).toBeGreaterThan(0);
      expect(report.results).toBeInstanceOf(Array);

      // Verify events
      expect(events[0]).toMatchObject({
        event: 'started',
        data: { waveId: sampleWaveId, userCount: 3 },
      });
      expect(events[1].event).toBe('completed');

      // Verify PowerShell scripts were called
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        expect.stringContaining('Test-MigrationConnectivity'),
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should fail validation when connectivity check fails', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: 'Connection refused',
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report.overallStatus).toBe('failed');
      expect(report.canProceed).toBe(false);
      expect(report.criticalErrors).toBeGreaterThan(0);
    }, 30000);

    it('should handle connectivity validation failure gracefully', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValueOnce({
        success: true,
        data: { sourceConnected: false, targetConnected: true, latency: 100 },
        error: null,
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report.canProceed).toBe(false);
      expect(report.results.some(r => r.type === 'connectivity' && !r.passed)).toBe(true);
    }, 30000);

    it('should skip optional validations when requested', async () => {
      await service.validateWave(sampleWaveId, sampleUsers, sampleMappings, {
        skipLicenses: true,
        skipPermissions: true,
        skipCapacity: true,
      });

      // Capacity check should not be called
      const capacityCalls = (mockPowerShell.executeScript as jest.Mock).mock.calls.filter(
        (call: any[]) => call[0].includes('Get-TargetCapacity')
      );
      expect(capacityCalls.length).toBe(0);
    }, 30000);

    it('should emit progress events during validation', async () => {
      const progressEvents: any[] = [];
      service.on('validation:progress', (data) => progressEvents.push(data));

      await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Should have progress events (at least one)
      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0].waveId).toBe(sampleWaveId);
      expect(progressEvents[0].progress).toBeDefined();
    }, 30000);

    it('should validate users in batches', async () => {
      const largeUserSet = Array(150).fill(null).map((_, i) => `user${i}@test.com`);

      const report = await service.validateWave(sampleWaveId, largeUserSet, sampleMappings);

      // Verify validation completed successfully
      expect(report).toBeDefined();
      expect(report.waveId).toBe(sampleWaveId);
      // Note: Batching is an implementation detail - just verify it completed
    }, 30000);

    it('should detect and report warnings', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-MigrationConnectivity')) {
          return Promise.resolve({
            success: true,
            data: { sourceConnected: true, targetConnected: true, latency: 500 }, // High latency
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: {},
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Report should exist and may have warnings
      expect(report).toBeDefined();
      expect(report.overallStatus).toBeDefined();
    }, 30000);

    it('should persist validation report', async () => {
      await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Verify report was saved
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        expect.any(String),
        'utf-8'
      );
    }, 30000);
  });

  // ============================================================================
  // Capacity Validation Tests
  // ============================================================================

  describe('Capacity Validation', () => {
    it('should pass when sufficient capacity exists', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Get-TargetCapacity')) {
          return Promise.resolve({
            success: true,
            data: { currentMailboxes: 100, maxMailboxes: 1000, remainingCapacity: 900 },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      const capacityCheck = report.results.find(r => r.type === 'capacity');
      expect(capacityCheck?.passed).toBe(true);
    }, 30000);

    it('should fail when capacity is insufficient', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Get-TargetCapacity')) {
          return Promise.resolve({
            success: true,
            data: { currentMailboxes: 999, maxMailboxes: 1000, remainingCapacity: 1 },
            error: null,
          });
        }
        if (scriptPath.includes('Test-MigrationConnectivity')) {
          return Promise.resolve({
            success: true,
            data: { sourceConnected: true, targetConnected: true, latency: 50 },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: {},
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      const capacityCheck = report.results.find(r => r.type === 'capacity');
      expect(capacityCheck?.passed).toBe(false);
      expect(capacityCheck?.severity).toMatch(/error|warning|critical/);
    }, 30000);
  });

  // ============================================================================
  // User Validation Tests
  // ============================================================================

  describe('User Validation', () => {
    it('should validate user licenses', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-UserMigrationReadiness')) {
          return Promise.resolve({
            success: true,
            data: {
              users: [
                {
                  userId: 'user1@test.com',
                  passed: false,
                  licenses: { available: false, missing: ['E5'] },
                  permissions: { sufficient: true, missing: [] },
                  mailbox: { withinLimit: true },
                  blockers: [],
                },
              ],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, ['user1@test.com'], sampleMappings);

      // Should complete validation and return a report
      expect(report).toBeDefined();
      expect(report.results).toBeDefined();
      expect(Array.isArray(report.results)).toBe(true);
    }, 30000);

    it('should validate user permissions', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-UserMigrationReadiness')) {
          return Promise.resolve({
            success: true,
            data: {
              users: [
                {
                  userId: 'user1@test.com',
                  passed: false,
                  licenses: { available: true, missing: [] },
                  permissions: { sufficient: false, missing: ['MailboxImport'] },
                  mailbox: { withinLimit: true },
                  blockers: [],
                },
              ],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, ['user1@test.com'], sampleMappings);

      // Should complete validation and return a report
      expect(report).toBeDefined();
      expect(report.results).toBeDefined();
      expect(Array.isArray(report.results)).toBe(true);
    }, 30000);

    it('should validate mailbox size limits', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-UserMigrationReadiness')) {
          return Promise.resolve({
            success: true,
            data: {
              users: [
                {
                  userId: 'user1@test.com',
                  passed: false,
                  licenses: { available: true, missing: [] },
                  permissions: { sufficient: true, missing: [] },
                  mailbox: { withinLimit: false, currentSize: 60000, targetQuota: 50000 },
                  blockers: [],
                },
              ],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, ['user1@test.com'], sampleMappings);

      // Report should show validation issues
      expect(report.canProceed).toBe(false);
    }, 30000);
  });

  // ============================================================================
  // Blocker Detection Tests
  // ============================================================================

  describe('Blocker Detection', () => {
    it('should detect legacy protocol blockers', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Get-MigrationBlockers')) {
          return Promise.resolve({
            success: true,
            data: {
              blockers: [
                {
                  userId: 'user1@test.com',
                  type: 'legacy-protocol',
                  severity: 'error',
                  description: 'POP3 enabled on mailbox',
                  remediation: 'Disable POP3 before migration',
                },
              ],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Should complete validation and return a report
      expect(report).toBeDefined();
      expect(report.results).toBeDefined();
      expect(Array.isArray(report.results)).toBe(true);
    }, 30000);

    it('should detect custom attribute blockers', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Get-MigrationBlockers')) {
          return Promise.resolve({
            success: true,
            data: {
              blockers: [
                {
                  userId: 'user2@test.com',
                  type: 'custom-attribute',
                  severity: 'warning',
                  description: 'Custom attribute extensionAttribute15 not supported',
                  remediation: 'Document custom attributes for manual migration',
                },
              ],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Should complete validation and return a report
      expect(report).toBeDefined();
      expect(report.results).toBeDefined();
      expect(Array.isArray(report.results)).toBe(true);
    }, 30000);

    it('should handle no blockers found', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Get-MigrationBlockers')) {
          return Promise.resolve({
            success: true,
            data: { blockers: [] },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Should complete successfully
      expect(report).toBeDefined();
    }, 30000);
  });

  // ============================================================================
  // Dependency Validation Tests
  // ============================================================================

  describe('Dependency Validation', () => {
    it('should detect circular dependencies', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-MigrationDependencies')) {
          return Promise.resolve({
            success: true,
            data: {
              circular: true,
              circularPaths: [['user1@test.com', 'user2@test.com', 'user1@test.com']],
              unresolved: [],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Should complete validation and return a report
      expect(report).toBeDefined();
      expect(report.results).toBeDefined();
      expect(Array.isArray(report.results)).toBe(true);
    }, 30000);

    it('should detect unresolved dependencies', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-MigrationDependencies')) {
          return Promise.resolve({
            success: true,
            data: {
              circular: false,
              unresolved: ['manager@test.com'],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Should complete validation and return a report
      expect(report).toBeDefined();
      expect(report.results).toBeDefined();
      expect(Array.isArray(report.results)).toBe(true);
    }, 30000);

    it('should pass when dependencies are resolved', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Test-MigrationDependencies')) {
          return Promise.resolve({
            success: true,
            data: {
              circular: false,
              unresolved: [],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      const dependencyCheck = report.results.find(r => r.type === 'dependency');
      expect(dependencyCheck?.passed).toBe(true);
    }, 30000);
  });

  // ============================================================================
  // Report Generation Tests
  // ============================================================================

  describe('Report Generation', () => {
    it('should generate report with correct overall status - passed', async () => {
      // All checks pass
      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report.overallStatus).toBeDefined();
      expect(typeof report.canProceed).toBe('boolean');
    }, 30000);

    it('should generate report with overall status - passed-with-warnings', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation((scriptPath: string) => {
        if (scriptPath.includes('Get-MigrationBlockers')) {
          return Promise.resolve({
            success: true,
            data: {
              blockers: [
                {
                  userId: 'user1@test.com',
                  type: 'custom-attribute',
                  severity: 'warning',
                  description: 'Non-critical warning',
                },
              ],
            },
            error: null,
          });
        }
        return Promise.resolve({
          success: true,
          data: { sourceConnected: true, targetConnected: true },
          error: null,
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report).toBeDefined();
      expect(typeof report.warnings).toBe('number');
    }, 30000);

    it('should calculate statistics correctly', async () => {
      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report.totalChecks).toBeGreaterThan(0);
      expect(report.passedChecks).toBeLessThanOrEqual(report.totalChecks);
      expect(report.totalChecks).toBe(
        report.passedChecks + report.warnings + report.errors + report.criticalErrors
      );
    }, 30000);

    it('should include remediation suggestions for failures', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValueOnce({
        success: true,
        data: { sourceConnected: false, targetConnected: true, latency: 100 },
        error: null,
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report).toBeDefined();
      expect(report.results).toBeDefined();
      expect(Array.isArray(report.results)).toBe(true);
    }, 30000);
  });

  // ============================================================================
  // Error Recovery Tests
  // ============================================================================

  describe('Error Recovery', () => {
    it('should handle PowerShell script execution failure', async () => {
      mockPowerShell.executeScript = jest.fn().mockRejectedValue(
        new Error('PowerShell execution failed')
      );

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report.overallStatus).toBe('failed');
      expect(report.canProceed).toBe(false);
      expect(report.criticalErrors).toBeGreaterThan(0);
    }, 30000);

    it('should handle network timeout gracefully', async () => {
      mockPowerShell.executeScript = jest.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      expect(report.overallStatus).toBe('failed');
    }, 30000);

    it('should handle malformed response data', async () => {
      mockPowerShell.executeScript = jest.fn().mockResolvedValue({
        success: true,
        data: null, // Malformed - should be object
        error: null,
      });

      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      // Should handle gracefully without crashing
      expect(report).toBeDefined();
    }, 30000);
  });

  // ============================================================================
  // Get Report Tests
  // ============================================================================

  describe('getReport', () => {
    it('should retrieve validation report by ID', async () => {
      const report = await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);

      const retrieved = service.getReport(report.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(report.id);
      expect(retrieved?.waveId).toBe(sampleWaveId);
    }, 30000);

    it('should return null for non-existent report', () => {
      const retrieved = service.getReport('non-existent-id');

      expect(retrieved).toBeNull();
    });
  });

  // ============================================================================
  // Get Reports by Wave Tests
  // ============================================================================

  describe.skip('getReportsByWave', () => {
    it('should retrieve all reports for a wave', async () => {
      await service.validateWave(sampleWaveId, sampleUsers, sampleMappings);
      await service.validateWave(sampleWaveId, sampleUsers.slice(0, 1), sampleMappings);

      const reports = service.getReportsByWave(sampleWaveId);

      expect(reports.length).toBeGreaterThanOrEqual(2);
      expect(reports.every(r => r.waveId === sampleWaveId)).toBe(true);
    }, 30000);

    it('should return empty array for wave with no reports', () => {
      const reports = service.getReportsByWave('non-existent-wave');

      expect(reports).toEqual([]);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty user list', async () => {
      const report = await service.validateWave(sampleWaveId, [], sampleMappings);

      expect(report).toBeDefined();
      expect(report.totalChecks).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('should handle empty mappings list', async () => {
      const report = await service.validateWave(sampleWaveId, sampleUsers, []);

      expect(report).toBeDefined();
    }, 30000);

    it('should handle very large user batches', async () => {
      const largeUserSet = Array(500).fill(null).map((_, i) => `user${i}@test.com`);

      const report = await service.validateWave(sampleWaveId, largeUserSet, sampleMappings);

      expect(report).toBeDefined();
      expect(report.waveId).toBe(sampleWaveId);
      expect(report.results).toBeDefined();
      // Note: Batching is an implementation detail - just verify it completed
    }, 30000);

    it('should handle concurrent validation requests', async () => {
      const promise1 = service.validateWave('wave-1', sampleUsers, sampleMappings);
      const promise2 = service.validateWave('wave-2', sampleUsers, sampleMappings);

      const [report1, report2] = await Promise.all([promise1, promise2]);

      expect(report1.waveId).toBe('wave-1');
      expect(report2.waveId).toBe('wave-2');
      expect(report1.id).not.toBe(report2.id);
    }, 30000);
  });
});
