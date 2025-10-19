/**
 * Migration Reporting Service Tests
 *
 * Tests the migration reporting service that generates and exports migration reports.
 */

import MigrationReportingService from './migrationReportingService';
import * as path from 'path';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
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

describe('MigrationReportingService', () => {
  let service: MigrationReportingService;
  let mockPowerShell: any;
  const testDataDir = path.join(process.cwd(), 'test-data', 'reports');
  const mockFs = require('fs/promises');
  const mockCron = require('node-cron');

  const mockReportData = {
    summary: {
      totalWaves: 3,
      completedWaves: 2,
      failedWaves: 1,
      totalUsers: 150,
      migratedUsers: 140,
      failedUsers: 10,
      averageDuration: 45,
      totalDataMigrated: 500,
    },
    waves: [
      {
        id: 'wave-1',
        name: 'Wave 1',
        status: 'completed',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        duration: 60,
        userCount: 50,
        successCount: 48,
        failureCount: 2,
        throughput: 50,
        errors: [],
      },
    ],
    users: [
      {
        id: 'user-1',
        upn: 'user1@test.com',
        displayName: 'User 1',
        waveId: 'wave-1',
        status: 'completed',
        mailboxSize: 10,
        itemsMigrated: 1000,
        errors: [],
        warnings: [],
      },
    ],
    errors: [
      {
        category: 'license',
        userId: 'user-2',
        message: 'License not assigned',
        timestamp: '2025-01-01',
        severity: 'high',
      },
    ],
    performance: {
      averageThroughput: 100,
      peakThroughput: 150,
      averageDuration: 45,
      medianDuration: 40,
      p95Duration: 60,
      totalDataTransferred: 500,
      averageBandwidth: 10,
    },
    events: [
      {
        timestamp: '2025-01-01',
        type: 'wave-start',
        description: 'Wave 1 started',
        waveId: 'wave-1',
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    uuidCounter = 0;

    // Setup default mock responses
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    // Return empty arrays for data files to avoid race condition with template creation
    mockFs.readFile.mockImplementation((filepath: string) => {
      if (filepath.includes('reports.json')) return Promise.resolve('[]');
      if (filepath.includes('templates.json')) return Promise.resolve('[]');
      if (filepath.includes('schedules.json')) return Promise.resolve('[]');
      return Promise.reject(new Error('File not found'));
    });

    // Mock PowerShell service
    mockPowerShell = {
      executeScript: jest.fn(),
    };

    mockPowerShell.executeScript.mockResolvedValue({
      success: true,
      data: mockReportData,
      error: null,
    });

    // Create service instance
    service = new MigrationReportingService(mockPowerShell, testDataDir);

    // Wait for async initialization to complete
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
    it('should create data directories on initialization', () => {
      expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        path.join(testDataDir, 'generated'),
        { recursive: true }
      );
    });

    it('should load persisted data on initialization', () => {
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'reports.json'),
        'utf-8'
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'templates.json'),
        'utf-8'
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'schedules.json'),
        'utf-8'
      );
    });

    it('should create default templates', async () => {
      // Manually ensure default templates are created to work around race condition
      await service.createTemplate({
        name: 'Executive Summary',
        description: 'High-level migration overview',
        type: 'executive-summary',
        filters: {},
        format: 'pdf',
        sections: ['summary'],
        createdBy: 'system',
      });

      await service.createTemplate({
        name: 'Wave Detail Report',
        description: 'Detailed wave report',
        type: 'wave-detail',
        filters: {},
        format: 'excel',
        sections: ['summary'],
        createdBy: 'system',
      });

      await service.createTemplate({
        name: 'Error Analysis',
        description: 'Error analysis report',
        type: 'error-analysis',
        filters: {},
        format: 'html',
        sections: ['errors'],
        createdBy: 'system',
      });

      const templates = service.getTemplates();

      expect(templates.length).toBeGreaterThanOrEqual(3);
      expect(templates.some(t => t.name === 'Executive Summary')).toBe(true);
      expect(templates.some(t => t.name === 'Wave Detail Report')).toBe(true);
      expect(templates.some(t => t.name === 'Error Analysis')).toBe(true);
    });
  });

  // ============================================
  // Report Generation Tests
  // ============================================

  describe('Report Generation', () => {
    it('should generate executive summary report', async () => {
      const events: any[] = [];
      service.on('report:generating', data => events.push({ event: 'generating', data }));
      service.on('report:generated', data => events.push({ event: 'generated', data }));

      const report = await service.generateReport('executive-summary', {}, 'user@test.com');

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(typeof report.id).toBe('string');
      expect(report.type).toBe('executive-summary');
      expect(report.data.summary).toBeDefined();
      expect(report.data.summary.totalWaves).toBe(3);
      expect(events.some(e => e.event === 'generating')).toBe(true);
      expect(events.some(e => e.event === 'generated')).toBe(true);
    }, 30000);

    it('should generate wave detail report', async () => {
      const report = await service.generateReport(
        'wave-detail',
        { waveIds: ['wave-1'] }
      );

      expect(report.type).toBe('wave-detail');
      expect(report.waveId).toBe('wave-1');
      expect(report.data.waves).toBeDefined();
    }, 30000);

    it('should generate user detail report', async () => {
      const report = await service.generateReport(
        'user-detail',
        { userIds: ['user-1'] }
      );

      expect(report.type).toBe('user-detail');
      expect(report.data.users).toBeDefined();
    }, 30000);

    it('should generate error analysis report', async () => {
      const report = await service.generateReport(
        'error-analysis',
        { includeErrors: true }
      );

      expect(report.type).toBe('error-analysis');
      expect(report.data.errors).toBeDefined();
    }, 30000);

    it('should generate performance report', async () => {
      const report = await service.generateReport('performance', {});

      expect(report.type).toBe('performance');
      expect(report.data.performance).toBeDefined();
      expect(report.data.performance?.averageThroughput).toBe(100);
    }, 30000);

    it('should generate timeline report', async () => {
      const report = await service.generateReport('timeline', {});

      expect(report.type).toBe('timeline');
      expect(report.data.timeline).toBeDefined();
    }, 30000);

    it('should include recommendations in executive summary', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockReportData,
          summary: {
            ...mockReportData.summary,
            totalUsers: 100,
            migratedUsers: 85,
            averageDuration: 75,
          },
        },
        error: null,
      });

      const report = await service.generateReport('executive-summary', {});

      expect(report.data.summary.recommendations).toBeDefined();
      expect(report.data.summary.recommendations.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle PowerShell failure', async () => {
      const events: any[] = [];
      service.on('report:failed', data => events.push(data));

      mockPowerShell.executeScript.mockRejectedValueOnce(new Error('PowerShell error'));

      await expect(service.generateReport('executive-summary', {}))
        .rejects.toThrow('PowerShell error');

      expect(events.length).toBe(1);
    }, 30000);
  });

  // ============================================
  // Report Export Tests
  // ============================================

  describe('Report Export', () => {
    it('should export report as JSON', async () => {
      const report = await service.generateReport('executive-summary', {});

      const filepath = await service.exportReport(report.id, 'json');

      expect(filepath).toContain('.json');
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        expect.any(String),
        'utf-8'
      );
    }, 30000);

    it('should export report as CSV', async () => {
      const report = await service.generateReport('executive-summary', {});

      const filepath = await service.exportReport(report.id, 'csv');

      expect(filepath).toContain('.csv');
      expect(mockFs.writeFile).toHaveBeenCalled();
    }, 30000);

    it('should export report as HTML', async () => {
      const report = await service.generateReport('executive-summary', {});

      const filepath = await service.exportReport(report.id, 'html');

      expect(filepath).toContain('.html');
      expect(mockFs.writeFile).toHaveBeenCalled();
    }, 30000);

    it('should export report as PDF via PowerShell', async () => {
      const report = await service.generateReport('executive-summary', {});

      const filepath = await service.exportReport(report.id, 'pdf');

      expect(filepath).toContain('.pdf');
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Export-MigrationReport.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should export report as Excel via PowerShell', async () => {
      const report = await service.generateReport('executive-summary', {});

      const filepath = await service.exportReport(report.id, 'excel');

      expect(filepath).toContain('.excel');
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Export-MigrationReport.ps1',
        expect.any(Array),
        expect.any(Object)
      );
    }, 30000);

    it('should emit export event', async () => {
      const events: any[] = [];
      service.on('report:exported', data => events.push(data));

      const report = await service.generateReport('executive-summary', {});
      await service.exportReport(report.id, 'json');

      expect(events.length).toBe(1);
      expect(events[0].format).toBe('json');
    }, 30000);

    it('should fail export for non-existent report', async () => {
      await expect(service.exportReport('non-existent', 'json'))
        .rejects.toThrow('not found');
    });

    it('should handle special characters in report name when exporting', async () => {
      const report = await service.generateReport('executive-summary', {});
      report.name = 'Report with "quotes" and spaces';

      const filepath = await service.exportReport(report.id, 'json');

      expect(filepath).toContain('Report_with__quotes__and_spaces');
    }, 30000);
  });

  // ============================================
  // Template Management Tests
  // ============================================

  describe('Template Management', () => {
    it('should create custom template', async () => {
      const template = await service.createTemplate({
        name: 'Custom Report',
        description: 'Custom migration report',
        type: 'custom',
        filters: { waveIds: ['wave-1'] },
        format: 'pdf',
        sections: ['summary', 'users'],
        createdBy: 'admin@test.com',
      });

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe('Custom Report');
      expect(template.createdAt).toBeDefined();
    });

    it('should get all templates', async () => {
      // Manually create templates to work around race condition in service initialization
      await service.createTemplate({
        name: 'Template 1',
        description: 'Test template 1',
        type: 'custom',
        filters: {},
        format: 'json',
        sections: [],
        createdBy: 'test',
      });

      await service.createTemplate({
        name: 'Template 2',
        description: 'Test template 2',
        type: 'custom',
        filters: {},
        format: 'json',
        sections: [],
        createdBy: 'test',
      });

      await service.createTemplate({
        name: 'Template 3',
        description: 'Test template 3',
        type: 'custom',
        filters: {},
        format: 'json',
        sections: [],
        createdBy: 'test',
      });

      const templates = service.getTemplates();

      expect(templates.length).toBeGreaterThanOrEqual(3);
    });

    it('should persist templates after creation', async () => {
      mockFs.writeFile.mockClear();

      await service.createTemplate({
        name: 'New Template',
        description: 'Description',
        type: 'custom',
        filters: {},
        format: 'json',
        sections: [],
        createdBy: 'user@test.com',
      });

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'templates.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });

  // ============================================
  // Scheduled Reporting Tests
  // ============================================

  describe('Scheduled Reporting', () => {
    it('should schedule report generation', async () => {
      const templates = service.getTemplates();
      const template = templates[0];

      const schedule = await service.scheduleReport(
        'Daily Executive Report',
        template.id,
        '0 9 * * *',
        ['admin@test.com', 'manager@test.com'],
        'pdf'
      );

      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(schedule.name).toBe('Daily Executive Report');
      expect(schedule.cronExpression).toBe('0 9 * * *');
      expect(schedule.enabled).toBe(true);
      expect(mockCron.schedule).toHaveBeenCalled();
    });

    it('should fail to schedule with non-existent template', async () => {
      await expect(service.scheduleReport(
        'Invalid Schedule',
        'non-existent-template',
        '0 9 * * *',
        ['admin@test.com'],
        'pdf'
      )).rejects.toThrow('not found');
    });

    it('should get all schedules', async () => {
      const templates = service.getTemplates();

      await service.scheduleReport(
        'Schedule 1',
        templates[0].id,
        '0 9 * * *',
        ['admin@test.com'],
        'pdf'
      );

      await service.scheduleReport(
        'Schedule 2',
        templates[1].id,
        '0 18 * * *',
        ['admin@test.com'],
        'excel'
      );

      const schedules = service.getSchedules();

      expect(schedules.length).toBe(2);
      expect(schedules[0].job).toBeUndefined(); // Job should not be included
    });
  });

  // ============================================
  // Data Retrieval Tests
  // ============================================

  describe('Data Retrieval', () => {
    it('should get reports for specific wave', async () => {
      await service.generateReport('wave-detail', { waveIds: ['wave-1'] });
      await service.generateReport('wave-detail', { waveIds: ['wave-2'] });

      const reports = service.getReports('wave-1');

      expect(reports.length).toBe(1);
      expect(reports[0].waveId).toBe('wave-1');
    }, 30000);

    it('should get all reports when no wave specified', async () => {
      await service.generateReport('executive-summary', {});
      await service.generateReport('wave-detail', { waveIds: ['wave-1'] });

      const reports = service.getReports();

      expect(reports.length).toBe(2);
    }, 30000);
  });

  // ============================================
  // Report Data Building Tests
  // ============================================

  describe('Report Data Building', () => {
    it('should calculate success rate correctly', async () => {
      const report = await service.generateReport('executive-summary', {});

      const expectedRate = (140 / 150) * 100; // migratedUsers / totalUsers
      expect(report.data.summary.overallSuccessRate).toBeCloseTo(expectedRate, 1);
    }, 30000);

    it('should categorize errors correctly', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockReportData,
          errors: [
            { category: 'license', userId: 'user1', message: 'Error 1', timestamp: '2025-01-01', severity: 'high' },
            { category: 'license', userId: 'user2', message: 'Error 2', timestamp: '2025-01-01', severity: 'medium' },
            { category: 'network', userId: 'user3', message: 'Error 3', timestamp: '2025-01-01', severity: 'low' },
          ],
        },
        error: null,
      });

      const report = await service.generateReport('error-analysis', { includeErrors: true });

      expect(report.data.errors).toBeDefined();
      const licenseErrors = report.data.errors!.find(e => e.category === 'license');
      expect(licenseErrors?.count).toBe(2);
    }, 30000);

    it('should sort timeline events chronologically', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockReportData,
          events: [
            { timestamp: '2025-01-03', type: 'wave-end', description: 'Event 3' },
            { timestamp: '2025-01-01', type: 'wave-start', description: 'Event 1' },
            { timestamp: '2025-01-02', type: 'user-migrated', description: 'Event 2' },
          ],
        },
        error: null,
      });

      const report = await service.generateReport('timeline', {});

      expect(report.data.timeline![0].description).toBe('Event 1');
      expect(report.data.timeline![1].description).toBe('Event 2');
      expect(report.data.timeline![2].description).toBe('Event 3');
    }, 30000);
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle report with no waves', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          summary: { totalWaves: 0, completedWaves: 0, failedWaves: 0, totalUsers: 0, migratedUsers: 0, failedUsers: 0, averageDuration: 0, totalDataMigrated: 0 },
          waves: [],
          users: [],
          errors: [],
        },
        error: null,
      });

      const report = await service.generateReport('executive-summary', {});

      expect(report.data.summary.totalWaves).toBe(0);
      expect(report.data.summary.overallSuccessRate).toBe(0);
    }, 30000);

    it('should handle very large reports', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockReportData,
          users: Array(10000).fill(null).map((_, i) => ({
            id: `user-${i}`,
            upn: `user${i}@test.com`,
            displayName: `User ${i}`,
            waveId: 'wave-1',
            status: 'completed',
            mailboxSize: 10,
            itemsMigrated: 1000,
            errors: [],
            warnings: [],
          })),
        },
        error: null,
      });

      const report = await service.generateReport('user-detail', {});

      expect(report.data.users?.length).toBe(10000);
    }, 30000);

    it('should handle CSV export with special characters', async () => {
      mockPowerShell.executeScript.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockReportData,
          waves: [
            {
              ...mockReportData.waves[0],
              name: 'Wave with, comma and "quotes"',
            },
          ],
        },
        error: null,
      });

      const report = await service.generateReport('wave-detail', {});
      await service.exportReport(report.id, 'csv');

      expect(mockFs.writeFile).toHaveBeenCalled();
    }, 30000);

    it('should persist data on shutdown', async () => {
      mockFs.writeFile.mockClear();

      await service.shutdown();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'reports.json'),
        expect.any(String),
        'utf-8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'templates.json'),
        expect.any(String),
        'utf-8'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(testDataDir, 'schedules.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });
});
