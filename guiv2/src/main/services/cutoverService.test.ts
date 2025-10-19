/**
 * Cutover Service Tests
 *
 * Tests the cutover automation service that handles final migration cutover.
 */

import CutoverService from './cutoverService';
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

describe('CutoverService', () => {
  let service: CutoverService;
  let mockPowerShell: any;
  const testDataDir = path.join(process.cwd(), 'test-data', 'cutover');
  const mockFs = require('fs/promises');

  const mockCutoverPlan = {
    waveId: 'wave-1',
    name: 'Production Cutover',
    description: 'Cutover for Wave 1',
    scheduledStart: new Date(Date.now() + 1000), // 1 second in future
    scheduledEnd: new Date(Date.now() + 60000), // 1 minute in future
    checklist: [],
    dnsRecords: [
      {
        id: 'dns-1',
        type: 'MX' as const,
        name: 'contoso.com',
        currentValue: '10 mail.contoso.local',
        newValue: '10 contoso-com.mail.protection.outlook.com',
        ttl: 3600,
        updated: false,
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        name: 'Pre-cutover notification',
        type: 'email' as const,
        recipients: ['admin@contoso.com'],
        subject: 'Cutover Starting',
        body: 'Cutover will begin shortly',
        sendAt: 'pre-cutover' as const,
        sent: false,
      },
    ],
    rollbackPlan: [],
    metadata: {},
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
      data: { passed: true, warnings: [] },
      error: null,
    });

    // Create service instance
    service = new CutoverService(mockPowerShell, testDataDir);

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    service.removeAllListeners();
  });

  // ============================================
  // Initialization Tests
  // ============================================

  describe('Initialization', () => {
    it('should create data directory on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
    });

    it('should load cutover plans on initialization', () => {
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'cutover-plans.json'),
        'utf-8'
      );
    });
  });

  // ============================================
  // Plan Creation Tests
  // ============================================

  describe('Cutover Plan Creation', () => {
    it('should create a cutover plan', async () => {
      const events: any[] = [];
      service.on('cutover:planned', data => events.push(data));

      const plan = await service.createCutoverPlan(mockCutoverPlan);

      expect(plan).toBeDefined();
      expect(plan.id).toBeDefined();
      expect(typeof plan.id).toBe('string');
      expect(plan.name).toBe('Production Cutover');
      expect(plan.status).toBe('planned');
      expect(plan.currentPhase).toBe('planning');
      expect(events.length).toBe(1);
    });

    it('should persist plan after creation', async () => {
      await service.createCutoverPlan(mockCutoverPlan);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'cutover-plans.json'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should handle plan with multiple DNS records', async () => {
      const planWithMultipleDNS = {
        ...mockCutoverPlan,
        dnsRecords: [
          mockCutoverPlan.dnsRecords[0],
          {
            id: 'dns-2',
            type: 'A' as const,
            name: 'mail.contoso.com',
            currentValue: '192.168.1.1',
            newValue: '20.20.20.20',
            ttl: 3600,
            updated: false,
          },
        ],
      };

      const plan = await service.createCutoverPlan(planWithMultipleDNS);

      expect(plan.dnsRecords.length).toBe(2);
    });
  });

  // ============================================
  // Cutover Execution Tests
  // ============================================

  describe('Cutover Execution', () => {
    it('should execute complete cutover successfully', async () => {
      const events: any[] = [];
      service.on('cutover:started', data => events.push({ event: 'started', data }));
      service.on('cutover:completed', data => events.push({ event: 'completed', data }));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000), // Already passed
      });

      const result = await service.executeCutover(plan.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.planId).toBe(plan.id);
      expect(result.phasesCompleted.length).toBeGreaterThan(0);
      expect(result.phasesFailed.length).toBe(0);
      expect(events.some(e => e.event === 'started')).toBe(true);
      expect(events.some(e => e.event === 'completed')).toBe(true);
    }, 30000);

    it('should emit phase events during execution', async () => {
      const events: any[] = [];
      service.on('cutover:phase-started', data => events.push({ event: 'phase-started', data }));
      service.on('cutover:phase-completed', data => events.push({ event: 'phase-completed', data }));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
      });

      await service.executeCutover(plan.id);

      expect(events.filter(e => e.event === 'phase-started').length).toBeGreaterThan(0);
      expect(events.filter(e => e.event === 'phase-completed').length).toBeGreaterThan(0);
    }, 30000);

    it('should update DNS records during cutover', async () => {
      const events: any[] = [];
      service.on('cutover:dns-updated', data => events.push(data));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
      });

      await service.executeCutover(plan.id);

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Update-DNSRecord.ps1',
        expect.arrayContaining(['-Type', 'MX']),
        expect.any(Object)
      );
    }, 30000);

    it('should configure mailbox redirection', async () => {
      const events: any[] = [];
      service.on('cutover:redirection-configured', data => events.push(data));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
      });

      await service.executeCutover(plan.id);

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Set-MailboxRedirection.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should activate target environment', async () => {
      const events: any[] = [];
      service.on('cutover:target-activated', data => events.push(data));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
      });

      await service.executeCutover(plan.id);

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Enable-TargetEnvironment.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should decommission source when configured', async () => {
      const events: any[] = [];
      service.on('cutover:source-decommissioned', data => events.push(data));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
        metadata: { decommissionSource: true },
      });

      await service.executeCutover(plan.id);

      expect(events.length).toBe(1);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Disable-SourceEnvironment.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should send notifications at appropriate stages', async () => {
      const events: any[] = [];
      service.on('cutover:notification-sent', data => events.push(data));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
        notifications: [
          {
            id: 'notif-1',
            name: 'Pre-cutover',
            type: 'email' as const,
            recipients: ['admin@test.com'],
            subject: 'Pre-cutover',
            body: 'Starting',
            sendAt: 'pre-cutover' as const,
            sent: false,
          },
          {
            id: 'notif-2',
            name: 'Post-validation',
            type: 'email' as const,
            recipients: ['admin@test.com'],
            subject: 'Completed',
            body: 'Done',
            sendAt: 'post-validation' as const,
            sent: false,
          },
        ],
      });

      await service.executeCutover(plan.id);

      expect(events.length).toBeGreaterThan(0);
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Send-Notification.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should handle post-cutover validation warnings', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { passed: false, warnings: ['Warning 1', 'Warning 2'] },
        error: null,
      });

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
      });

      const result = await service.executeCutover(plan.id);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('Warning 1');
      expect(result.warnings).toContain('Warning 2');
    }, 30000);

    it('should fail when plan not found', async () => {
      await expect(service.executeCutover('non-existent')).rejects.toThrow('not found');
    });
  });

  // ============================================
  // Rollback Tests
  // ============================================

  describe('Rollback', () => {
    it('should execute rollback when cutover fails', async () => {
      const events: any[] = [];
      service.on('cutover:rollback-started', data => events.push({ event: 'rollback-started', data }));
      service.on('cutover:rollback-completed', data => events.push({ event: 'rollback-completed', data }));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
        rollbackPlan: [
          {
            id: 'rollback-1',
            phase: 'dns-update',
            action: 'Restore DNS records',
            scriptPath: 'Modules/Migration/Restore-DNS.ps1',
            parameters: {},
            executed: false,
          },
        ],
      });

      // Make DNS update fail
      mockPowerShell.executeScript.mockImplementationOnce(() =>
        Promise.resolve({ success: true, data: { passed: true, warnings: [] }, error: null })
      ).mockImplementationOnce(() =>
        Promise.reject(new Error('DNS update failed'))
      );

      const result = await service.executeCutover(plan.id);

      expect(result.success).toBe(false);
      expect(events.some(e => e.event === 'rollback-started')).toBe(true);
      expect(events.some(e => e.event === 'rollback-completed')).toBe(true);
    }, 30000);

    it('should execute rollback steps in reverse order', async () => {
      const executionOrder: string[] = [];

      mockPowerShell.executeScript.mockImplementation((script: string) => {
        executionOrder.push(script);
        if (script.includes('Update-DNSRecord')) {
          return Promise.reject(new Error('Failed'));
        }
        return Promise.resolve({ success: true, data: {}, error: null });
      });

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
        rollbackPlan: [
          {
            id: 'rollback-1',
            phase: 'dns-update',
            action: 'Restore DNS 1',
            scriptPath: 'Scripts/Rollback-1.ps1',
            parameters: {},
            executed: false,
          },
          {
            id: 'rollback-2',
            phase: 'activation',
            action: 'Restore DNS 2',
            scriptPath: 'Scripts/Rollback-2.ps1',
            parameters: {},
            executed: false,
          },
        ],
      });

      await service.executeCutover(plan.id);

      // Rollback should execute in reverse order
      const rollbackScripts = executionOrder.filter(s => s.includes('Rollback'));
      expect(rollbackScripts[0]).toContain('Rollback-2');
      expect(rollbackScripts[1]).toContain('Rollback-1');
    }, 30000);
  });

  // ============================================
  // Checklist Management Tests
  // ============================================

  describe('Checklist Management', () => {
    it('should update checklist item', async () => {
      const events: any[] = [];
      service.on('cutover:checklist-updated', data => events.push(data));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        checklist: [
          {
            id: 'check-1',
            phase: 'pre-cutover',
            name: 'Backup complete',
            description: 'Verify backup is complete',
            required: true,
            completed: false,
          },
        ],
      });

      await service.updateChecklistItem(plan.id, 'check-1', {
        completed: true,
        notes: 'Backup verified at 10:00 AM',
        completedBy: 'admin@test.com',
      });

      expect(events.length).toBe(1);
      expect(events[0].item.completed).toBe(true);
      expect(events[0].item.notes).toBe('Backup verified at 10:00 AM');
    });

    it('should fail when required checklist items not completed', async () => {
      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
        checklist: [
          {
            id: 'check-1',
            phase: 'pre-cutover',
            name: 'Backup complete',
            description: 'Verify backup',
            required: true,
            completed: false,
          },
        ],
      });

      const result = await service.executeCutover(plan.id);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Required checklist item not completed'))).toBe(true);
    }, 30000);

    it('should handle non-existent checklist item', async () => {
      const plan = await service.createCutoverPlan(mockCutoverPlan);

      await expect(service.updateChecklistItem(plan.id, 'non-existent', { completed: true }))
        .rejects.toThrow('not found');
    });
  });

  // ============================================
  // Data Retrieval Tests
  // ============================================

  describe('Data Retrieval', () => {
    it('should get cutover plan by ID', async () => {
      const plan = await service.createCutoverPlan(mockCutoverPlan);

      const retrieved = service.getCutoverPlan(plan.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(plan.id);
    });

    it('should return null for non-existent plan', () => {
      const plan = service.getCutoverPlan('non-existent');

      expect(plan).toBeNull();
    });

    it('should get cutover plans for wave', async () => {
      await service.createCutoverPlan(mockCutoverPlan);
      await service.createCutoverPlan({
        ...mockCutoverPlan,
        waveId: 'wave-2',
      });

      const plans = service.getCutoverPlansForWave('wave-1');

      expect(plans.length).toBe(1);
      expect(plans[0].waveId).toBe('wave-1');
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should wait for cutover window', async () => {
      const futureTime = new Date(Date.now() + 2000); // 2 seconds in future
      const events: any[] = [];
      service.on('cutover:window-opened', data => events.push(data));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: futureTime,
      });

      const startTime = Date.now();
      await service.executeCutover(plan.id);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(1800); // At least 1.8 seconds
      expect(events.length).toBe(1);
    }, 30000);

    it('should handle very large notification list', async () => {
      const manyNotifications = Array(50).fill(null).map((_, i) => ({
        id: `notif-${i}`,
        name: `Notification ${i}`,
        type: 'email' as const,
        recipients: [`user${i}@test.com`],
        subject: `Subject ${i}`,
        body: `Body ${i}`,
        sendAt: 'cutover-start' as const,
        sent: false,
      }));

      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        scheduledStart: new Date(Date.now() - 1000),
        notifications: manyNotifications,
      });

      await service.executeCutover(plan.id);

      // Should handle all notifications
      expect(mockPowerShell.executeScript).toHaveBeenCalled();
    }, 30000);

    it('should handle special characters in plan name', async () => {
      const plan = await service.createCutoverPlan({
        ...mockCutoverPlan,
        name: 'Cutover with "quotes" and \'apostrophes\' & special chars!',
      });

      expect(plan.name).toBe('Cutover with "quotes" and \'apostrophes\' & special chars!');
    });

    it('should persist plans on save', async () => {
      mockFs.writeFile.mockClear();

      await service.createCutoverPlan(mockCutoverPlan);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'cutover-plans.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });
});
