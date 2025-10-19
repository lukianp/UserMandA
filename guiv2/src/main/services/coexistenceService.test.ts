/**
 * Coexistence Service Tests
 *
 * Tests the coexistence service that manages hybrid environments during migration.
 */

import CoexistenceService from './coexistenceService';
import * as path from 'path';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

// Mock crypto.randomUUID
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

describe('CoexistenceService', () => {
  let service: CoexistenceService;
  let mockPowerShell: any;
  const testDataDir = path.join(process.cwd(), 'test-data', 'coexistence');
  const mockFs = require('fs/promises');

  const mockSourceEnv = {
    id: 'source-1',
    name: 'On-Premises',
    type: 'on-premises' as const,
    exchangeVersion: '2019',
    adDomain: 'contoso.local',
    endpoints: { exchange: 'https://exchange.contoso.local' },
  };

  const mockTargetEnv = {
    id: 'target-1',
    name: 'Microsoft 365',
    type: 'cloud' as const,
    endpoints: { exchange: 'https://outlook.office365.com' },
  };

  const mockFeatures = {
    freeBusy: true,
    mailRouting: true,
    galSync: true,
    crossForestAuth: false,
    proxyAddresses: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    uuidCounter = 0;

    // Setup default mock responses
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readFile.mockRejectedValue(new Error('File not found'));

    // Mock PowerShell service
    mockPowerShell = {
      executeScript: jest.fn(),
    };

    mockPowerShell.executeScript.mockResolvedValue({
      success: true,
      data: {},
      error: null,
    });

    // Create service instance
    service = new CoexistenceService(mockPowerShell, testDataDir);

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    service.removeAllListeners();
    await service.shutdown();
  });

  // ============================================
  // Initialization Tests
  // ============================================

  describe('Initialization', () => {
    it('should create data directory on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
    });

    it('should load persisted data on initialization', () => {
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'configurations.json'),
        'utf-8'
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'issues.json'),
        'utf-8'
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'health-history.json'),
        'utf-8'
      );
    });

    it('should start health monitoring', () => {
      // Monitoring should be started (uses setInterval internally)
      expect(service).toBeDefined();
    });
  });

  // ============================================
  // Configuration Tests
  // ============================================

  describe('Coexistence Configuration', () => {
    it('should configure coexistence with all features', async () => {
      const events: any[] = [];
      service.on('coexistence:configuring', data => events.push({ event: 'configuring', data }));
      service.on('coexistence:configured', data => events.push({ event: 'configured', data }));

      const config = await service.configureCoexistence(
        'wave-1',
        mockSourceEnv,
        mockTargetEnv,
        mockFeatures,
        'exchange-hybrid'
      );

      expect(config).toBeDefined();
      expect(config.id).toBeDefined();
      expect(typeof config.id).toBe('string');
      expect(config.waveId).toBe('wave-1');
      expect(config.type).toBe('exchange-hybrid');
      expect(config.status).toBe('active');
      expect(config.features).toEqual(mockFeatures);
      expect(events.some(e => e.event === 'configuring')).toBe(true);
      expect(events.some(e => e.event === 'configured')).toBe(true);
    }, 30000);

    it('should configure free/busy sharing', async () => {
      const events: any[] = [];
      service.on('coexistence:freebusy-configured', data => events.push(data));

      await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: true,
        mailRouting: false,
        galSync: false,
        crossForestAuth: false,
        proxyAddresses: false,
      });

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Set-FreeBusySharing.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should configure mail routing', async () => {
      const events: any[] = [];
      service.on('coexistence:routing-configured', data => events.push(data));

      await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: false,
        mailRouting: true,
        galSync: false,
        crossForestAuth: false,
        proxyAddresses: false,
      });

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Set-MailRouting.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should configure GAL sync and run initial sync', async () => {
      const events: any[] = [];
      service.on('coexistence:gal-configured', data => events.push(data));
      service.on('coexistence:gal-synced', data => events.push(data));

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {},
        error: null,
      }).mockResolvedValueOnce({
        success: true,
        data: { sourceEntries: 100, targetEntries: 100, synchronized: 100, failed: 0, errors: [] },
        error: null,
      });

      await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: false,
        mailRouting: false,
        galSync: true,
        crossForestAuth: false,
        proxyAddresses: false,
      });

      expect(events.length).toBe(2);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Set-GALSync.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should configure cross-forest authentication', async () => {
      const events: any[] = [];
      service.on('coexistence:auth-configured', data => events.push(data));

      await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: false,
        mailRouting: false,
        galSync: false,
        crossForestAuth: true,
        proxyAddresses: false,
      });

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Set-CrossForestAuth.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should configure proxy addresses', async () => {
      const events: any[] = [];
      service.on('coexistence:proxy-configured', data => events.push(data));

      await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: false,
        mailRouting: false,
        galSync: false,
        crossForestAuth: false,
        proxyAddresses: true,
      });

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Set-ProxyAddresses.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should handle configuration failure', async () => {
      const events: any[] = [];
      service.on('coexistence:failed', data => events.push(data));

      mockPowerShell.executeScript.mockRejectedValueOnce(new Error('Configuration failed'));

      await expect(service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: true,
        mailRouting: false,
        galSync: false,
        crossForestAuth: false,
        proxyAddresses: false,
      })).rejects.toThrow('Configuration failed');

      expect(events.length).toBe(1);
    }, 30000);
  });

  // ============================================
  // GAL Sync Tests
  // ============================================

  describe('GAL Synchronization', () => {
    it('should synchronize GAL', async () => {
      const events: any[] = [];
      service.on('coexistence:gal-synced', data => events.push(data));

      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: false,
        mailRouting: false,
        galSync: false,
        crossForestAuth: false,
        proxyAddresses: false,
      });

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: { sourceEntries: 150, targetEntries: 145, synchronized: 145, failed: 5, errors: ['Error 1'] },
        error: null,
      });

      const result = await service.syncGAL(config.id);

      expect(result).toBeDefined();
      expect(result.sourceEntries).toBe(150);
      expect(result.targetEntries).toBe(145);
      expect(result.synchronized).toBe(145);
      expect(result.failed).toBe(5);
      expect(events.length).toBe(1);
    }, 30000);

    it('should fail when configuration not found', async () => {
      await expect(service.syncGAL('non-existent')).rejects.toThrow('not found');
    });

    it('should fail when PowerShell script fails', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, {
        freeBusy: false,
        mailRouting: false,
        galSync: false,
        crossForestAuth: false,
        proxyAddresses: false,
      });

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: false,
        data: null,
        error: 'GAL sync failed',
      });

      await expect(service.syncGAL(config.id)).rejects.toThrow('GAL sync failed');
    }, 30000);
  });

  // ============================================
  // Health Check Tests
  // ============================================

  describe('Health Checks', () => {
    it('should perform health check', async () => {
      const events: any[] = [];
      service.on('coexistence:health-checked', data => events.push(data));

      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          checks: [
            { name: 'FreeBusy', status: 'passed', message: 'Working' },
            { name: 'MailRouting', status: 'passed', message: 'Working' },
          ],
          issues: [],
        },
        error: null,
      });

      const health = await service.checkHealth(config.id);

      expect(health).toBeDefined();
      expect(health.overallStatus).toBe('healthy');
      expect(health.checks.length).toBe(2);
      expect(health.issues.length).toBe(0);
      expect(events.length).toBe(1);
    }, 30000);

    it('should detect health issues', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          checks: [
            { name: 'FreeBusy', status: 'failed', message: 'Not working' },
            { name: 'MailRouting', status: 'passed', message: 'Working' },
          ],
          issues: [
            {
              id: 'issue-1',
              type: 'free-busy',
              severity: 'high',
              message: 'Free/busy not working',
              affectedUsers: ['user1@test.com'],
              detectedAt: new Date(),
            },
          ],
        },
        error: null,
      });

      const health = await service.checkHealth(config.id);

      expect(health.overallStatus).toBe('unhealthy');
      expect(health.checks.some(c => c.status === 'failed')).toBe(true);
      expect(health.issues.length).toBe(1);
    }, 30000);

    it('should return degraded status when warnings present', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          checks: [
            { name: 'FreeBusy', status: 'warning', message: 'Performance degraded' },
            { name: 'MailRouting', status: 'passed', message: 'Working' },
          ],
          issues: [],
        },
        error: null,
      });

      const health = await service.checkHealth(config.id);

      expect(health.overallStatus).toBe('degraded');
    }, 30000);

    it('should store health history', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { checks: [], issues: [] },
        error: null,
      });

      await service.checkHealth(config.id);
      await service.checkHealth(config.id);

      const history = service.getHealthHistory(config.id);

      expect(history.length).toBe(2);
    }, 30000);
  });

  // ============================================
  // Troubleshooting Tests
  // ============================================

  describe('Troubleshooting', () => {
    it('should troubleshoot issue', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          checks: [],
          issues: [
            {
              id: 'issue-1',
              type: 'free-busy',
              severity: 'high',
              message: 'Free/busy not working',
              affectedUsers: ['user1@test.com'],
              detectedAt: new Date(),
            },
          ],
        },
        error: null,
      });

      await service.checkHealth(config.id);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          diagnosis: 'Firewall blocking port 443',
          remediation: ['Open port 443 in firewall', 'Restart Exchange services'],
          autoFixAvailable: true,
        },
        error: null,
      });

      const result = await service.troubleshoot('issue-1');

      expect(result).toBeDefined();
      expect(result.diagnosis).toBe('Firewall blocking port 443');
      expect(result.remediation.length).toBe(2);
      expect(result.autoFixAvailable).toBe(true);
    }, 30000);

    it('should fail troubleshooting for non-existent issue', async () => {
      await expect(service.troubleshoot('non-existent')).rejects.toThrow('not found');
    });

    it('should auto-fix issue', async () => {
      const events: any[] = [];
      service.on('coexistence:issue-resolved', data => events.push(data));

      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          checks: [],
          issues: [
            {
              id: 'issue-1',
              type: 'free-busy',
              severity: 'high',
              message: 'Free/busy not working',
              affectedUsers: ['user1@test.com'],
              detectedAt: new Date(),
            },
          ],
        },
        error: null,
      });

      await service.checkHealth(config.id);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {},
        error: null,
      });

      await service.autoFix('issue-1');

      expect(events.length).toBe(1);
      expect(events[0].issue.resolution).toBe('auto-fixed');
    }, 30000);

    it('should fail auto-fix when PowerShell script fails', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          checks: [],
          issues: [
            {
              id: 'issue-1',
              type: 'free-busy',
              severity: 'high',
              message: 'Free/busy not working',
              affectedUsers: ['user1@test.com'],
              detectedAt: new Date(),
            },
          ],
        },
        error: null,
      });

      await service.checkHealth(config.id);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: false,
        data: null,
        error: 'Fix failed',
      });

      await expect(service.autoFix('issue-1')).rejects.toThrow('Auto-fix failed');
    }, 30000);
  });

  // ============================================
  // Decommission Tests
  // ============================================

  describe('Decommissioning', () => {
    it('should decommission coexistence', async () => {
      const events: any[] = [];
      service.on('coexistence:decommissioning', data => events.push({ event: 'decommissioning', data }));
      service.on('coexistence:decommissioned', data => events.push({ event: 'decommissioned', data }));

      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      await service.decommission(config.id);

      expect(events.some(e => e.event === 'decommissioning')).toBe(true);
      expect(events.some(e => e.event === 'decommissioned')).toBe(true);

      const updated = service.getConfiguration(config.id);
      expect(updated?.status).toBe('decommissioned');
    }, 30000);

    it('should handle decommission failure', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: false,
        data: null,
        error: 'Decommission failed',
      });

      await expect(service.decommission(config.id)).rejects.toThrow('Decommission failed');

      const updated = service.getConfiguration(config.id);
      expect(updated?.status).toBe('error');
    }, 30000);

    it('should fail for non-existent configuration', async () => {
      await expect(service.decommission('non-existent')).rejects.toThrow('not found');
    });
  });

  // ============================================
  // Data Retrieval Tests
  // ============================================

  describe('Data Retrieval', () => {
    it('should get configuration by ID', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      const retrieved = service.getConfiguration(config.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(config.id);
    }, 30000);

    it('should return null for non-existent configuration', () => {
      const config = service.getConfiguration('non-existent');

      expect(config).toBeNull();
    });

    it('should get configurations for wave', async () => {
      await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);
      await service.configureCoexistence('wave-2', mockSourceEnv, mockTargetEnv, mockFeatures);

      const configs = service.getConfigurationsForWave('wave-1');

      expect(configs.length).toBe(1);
      expect(configs[0].waveId).toBe('wave-1');
    }, 30000);

    it('should get active issues', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          checks: [],
          issues: [
            {
              id: 'issue-1',
              type: 'free-busy',
              severity: 'high',
              message: 'Issue 1',
              affectedUsers: [],
              detectedAt: new Date(),
            },
            {
              id: 'issue-2',
              type: 'mail-routing',
              severity: 'low',
              message: 'Issue 2',
              affectedUsers: [],
              detectedAt: new Date(),
              resolvedAt: new Date(),
            },
          ],
        },
        error: null,
      });

      await service.checkHealth(config.id);

      const activeIssues = service.getActiveIssues();

      expect(activeIssues.length).toBe(1);
      expect(activeIssues[0].id).toBe('issue-1');
    }, 30000);
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very long environment names', async () => {
      const longName = 'A'.repeat(200);
      const sourceEnv = { ...mockSourceEnv, name: longName };

      const config = await service.configureCoexistence('wave-1', sourceEnv, mockTargetEnv, {
        freeBusy: false,
        mailRouting: false,
        galSync: false,
        crossForestAuth: false,
        proxyAddresses: false,
      });

      expect(config.sourceEnvironment.name).toBe(longName);
    }, 30000);

    it('should limit health history to 100 entries', async () => {
      const config = await service.configureCoexistence('wave-1', mockSourceEnv, mockTargetEnv, mockFeatures);

      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { checks: [], issues: [] },
        error: null,
      });

      for (let i = 0; i < 150; i++) {
        await service.checkHealth(config.id);
      }

      const history = service.getHealthHistory(config.id);

      expect(history.length).toBe(100);
    }, 60000);

    it('should persist data on shutdown', async () => {
      mockFs.writeFile.mockClear();

      await service.shutdown();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'configurations.json'),
        expect.any(String),
        'utf-8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'issues.json'),
        expect.any(String),
        'utf-8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'health-history.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });
});
