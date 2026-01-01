/**
 * Unit Tests for ConflictResolutionService
 *
 * CRITICAL SERVICE - Handles conflict detection and resolution during migrations
 * Tests cover:
 * - Conflict detection via PowerShell
 * - Various resolution strategies (source-wins, target-wins, merge, rename, skip, manual)
 * - Approval workflow (queue, approve, reject)
 * - Auto-resolution using templates
 * - Template creation and management
 * - Audit logging
 * - Data persistence and retrieval
 * - Error handling
 */

import ConflictResolutionService, {
  Conflict,
  ConflictType,
  ResolutionStrategy,
  ConflictResolution,
} from './conflictResolutionService';
import PowerShellExecutionService from './powerShellService';

// Mock fs/promises module
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
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

describe('ConflictResolutionService', () => {
  let service: ConflictResolutionService;
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

    // Default successful PowerShell responses
    mockPowerShell.executeScript.mockResolvedValue({
      success: true,
      data: { conflicts: [] },
      error: undefined, duration: 0, warnings: [],
    });

    testDataDir = 'C:\\TestData\\Conflicts';
    service = new ConflictResolutionService(mockPowerShell, testDataDir);
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
      const defaultService = new ConflictResolutionService(mockPowerShell);
      expect(defaultService).toBeDefined();
    });

    it('should initialize empty conflict and template maps', () => {
      expect(service.getConflicts()).toEqual([]);
    });
  });

  // ============================================================================
  // Conflict Detection Tests
  // ============================================================================

  describe('detectConflicts', () => {
    it('should detect conflicts successfully', async () => {
      const mockConflictData = {
        conflicts: [
          {
            type: 'duplicate-email',
            severity: 'high',
            source: { id: 'user1', name: 'John Doe', type: 'user', attributes: {} },
            target: { id: 'user2', name: 'John Doe (existing)', type: 'user', attributes: {} },
            description: 'Email already exists in target',
            details: { email: 'john.doe@example.com' },
          },
          {
            type: 'mailbox-exists',
            severity: 'medium',
            source: { id: 'user3', name: 'Jane Smith', type: 'user', attributes: {} },
            target: { id: 'user4', name: 'Jane Smith (existing)', type: 'user', attributes: {} },
            description: 'Mailbox already exists',
            details: { mailbox: 'jane.smith@example.com' },
          },
        ],
      };

      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: mockConflictData,
        error: undefined, duration: 0, warnings: [],
      });

      const events: any[] = [];
      service.on('detection:started', data => events.push({ event: 'started', data }));
      service.on('detection:completed', data => events.push({ event: 'completed', data }));

      const conflicts = await service.detectConflicts('wave-001', ['user1', 'user2', 'user3']);

      expect(conflicts.length).toBe(2);
      expect(conflicts[0].type).toBe('duplicate-email');
      expect(conflicts[0].severity).toBe('high');
      expect(conflicts[0].status).toBe('detected');
      expect(conflicts[0].suggestedStrategy).toBe('rename-source');

      expect(conflicts[1].type).toBe('mailbox-exists');
      expect(conflicts[1].suggestedStrategy).toBe('merge');

      // Verify PowerShell was called
      expect(mockPowerShell.executeScript).toHaveBeenCalledWith(
        'Modules/Migration/Find-MigrationConflicts.ps1',
        expect.arrayContaining(['-WaveId', 'wave-001']),
        expect.objectContaining({ timeout: 120000 })
      );

      // Verify events
      expect(events[0].event).toBe('started');
      expect(events[0].data.waveId).toBe('wave-001');
      expect(events[1].event).toBe('completed');
      expect(events[1].data.count).toBe(2);

      // Verify conflicts are stored
      expect(service.getConflicts('wave-001').length).toBe(2);
    });

    it('should handle detection with no conflicts', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { conflicts: [] },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = await service.detectConflicts('wave-002', ['user1']);

      expect(conflicts).toEqual([]);
      expect(service.getConflicts('wave-002').length).toBe(0);
    });

    it('should throw error on PowerShell failure', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: false,
        data: null,
        error: 'PowerShell script execution failed',
        duration: 0,
        warnings: [],
      });

      const events: any[] = [];
      service.on('detection:failed', data => events.push({ event: 'failed', data }));

      await expect(service.detectConflicts('wave-003', ['user1'])).rejects.toThrow(
        'PowerShell script execution failed'
      );

      expect(events[0].event).toBe('failed');
      expect(events[0].data.waveId).toBe('wave-003');
    });

    it('should assign default severity when not provided', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          conflicts: [
            {
              type: 'naming-conflict',
              // severity not provided
              source: { id: 'group1', name: 'Sales', type: 'group', attributes: {} },
              description: 'Group name already exists',
            },
          ],
        },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = await service.detectConflicts('wave-004', ['group1']);

      expect(conflicts[0].severity).toBe('medium'); // Default severity
    });
  });

  // ============================================================================
  // Resolution Strategy Tests
  // ============================================================================

  describe('resolveConflict', () => {
    let conflictId: string;

    beforeEach(async () => {
      // Detect a conflict first
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          conflicts: [
            {
              type: 'duplicate-email',
              severity: 'high',
              source: { id: 'user1', name: 'John Doe', type: 'user', attributes: {} },
              target: { id: 'user2', name: 'John Existing', type: 'user', attributes: {} },
              description: 'Email conflict',
            },
          ],
        },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = await service.detectConflicts('wave-001', ['user1']);
      conflictId = conflicts[0].id;
    });

    it('should resolve conflict with source-wins strategy', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Source resource applied' },
        error: undefined, duration: 0, warnings: [],
      });

      const events: any[] = [];
      service.on('resolution:started', data => events.push({ event: 'started', data }));
      service.on('resolution:completed', data => events.push({ event: 'completed', data }));

      await service.resolveConflict(conflictId, 'source-wins', {}, 'admin');

      const conflicts = service.getConflicts();
      const resolved = conflicts.find(c => c.id === conflictId);

      expect(resolved?.status).toBe('resolved');
      expect(resolved?.resolution?.strategy).toBe('source-wins');
      expect(resolved?.resolution?.appliedBy).toBe('admin');
      expect(resolved?.resolvedAt).toBeDefined();

      // Verify events
      expect(events[0].event).toBe('started');
      expect(events[1].event).toBe('completed');

      // Verify audit log
      const auditLog = service.getAuditLog(conflictId);
      expect(auditLog.length).toBe(1);
      expect(auditLog[0].strategy).toBe('source-wins');
    });

    it('should resolve conflict with target-wins strategy', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Target resource preserved' },
        error: undefined, duration: 0, warnings: [],
      });

      await service.resolveConflict(conflictId, 'target-wins', {}, 'admin');

      const conflicts = service.getConflicts();
      const resolved = conflicts.find(c => c.id === conflictId);

      expect(resolved?.status).toBe('resolved');
      expect(resolved?.resolution?.strategy).toBe('target-wins');
    });

    it('should resolve conflict with merge strategy', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Resources merged successfully' },
        error: undefined, duration: 0, warnings: [],
      });

      await service.resolveConflict(conflictId, 'merge', { mergeStrategy: 'smart' }, 'admin');

      const conflicts = service.getConflicts();
      const resolved = conflicts.find(c => c.id === conflictId);

      expect(resolved?.status).toBe('resolved');
      expect(resolved?.resolution?.strategy).toBe('merge');
      expect(resolved?.resolution?.parameters.mergeStrategy).toBe('smart');
    });

    it('should resolve conflict with rename-source strategy', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Source renamed' },
        error: undefined, duration: 0, warnings: [],
      });

      await service.resolveConflict(
        conflictId,
        'rename-source',
        { suffix: '_migrated', prefix: 'NEW_' },
        'admin'
      );

      const conflicts = service.getConflicts();
      const resolved = conflicts.find(c => c.id === conflictId);

      expect(resolved?.status).toBe('resolved');
      expect(resolved?.resolution?.strategy).toBe('rename-source');
      expect(resolved?.resolution?.result.newName).toContain('NEW_');
      expect(resolved?.resolution?.result.newName).toContain('_migrated');
    });

    it('should resolve conflict with rename-target strategy', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Target renamed' },
        error: undefined, duration: 0, warnings: [],
      });

      await service.resolveConflict(conflictId, 'rename-target', { suffix: '_existing' }, 'admin');

      const conflicts = service.getConflicts();
      const resolved = conflicts.find(c => c.id === conflictId);

      expect(resolved?.status).toBe('resolved');
      expect(resolved?.resolution?.strategy).toBe('rename-target');
    });

    it('should skip conflict when using skip strategy', async () => {
      await service.resolveConflict(conflictId, 'skip', {}, 'admin');

      const conflicts = service.getConflicts();
      const skipped = conflicts.find(c => c.id === conflictId);

      // Note: Service sets status to 'resolved' after skip, but action is 'skipped'
      expect(skipped?.status).toBe('resolved');
      expect(skipped?.resolution?.action).toBe('skipped');
      expect(skipped?.resolution?.strategy).toBe('skip');
    });

    it('should queue conflict for approval when using manual strategy', async () => {
      await service.resolveConflict(conflictId, 'manual', {}, 'admin');

      const conflicts = service.getConflicts();
      const queued = conflicts.find(c => c.id === conflictId);

      expect(queued?.status).toBe('pending-approval');

      const approvalQueue = service.getApprovalQueue('pending');
      expect(approvalQueue.length).toBe(1);
      expect(approvalQueue[0].conflictId).toBe(conflictId);
      expect(approvalQueue[0].requestedBy).toBe('admin');
    });

    it('should throw error for non-existent conflict', async () => {
      await expect(service.resolveConflict('invalid-id', 'source-wins')).rejects.toThrow(
        'Conflict invalid-id not found'
      );
    });

    it('should throw error when resolving already resolved conflict', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Success' },
        error: undefined, duration: 0, warnings: [],
      });

      await service.resolveConflict(conflictId, 'source-wins');

      await expect(service.resolveConflict(conflictId, 'target-wins')).rejects.toThrow(
        'Conflict already resolved'
      );
    });

    it('should handle PowerShell failure during resolution', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: false,
        data: null,
        error: 'Failed to apply resolution',
        duration: 0,
        warnings: [],
      });

      const events: any[] = [];
      service.on('resolution:failed', data => events.push({ event: 'failed', data }));

      await expect(service.resolveConflict(conflictId, 'source-wins')).rejects.toThrow(
        'Failed to apply resolution'
      );

      const conflicts = service.getConflicts();
      const failed = conflicts.find(c => c.id === conflictId);

      expect(failed?.status).toBe('failed');
      expect(events[0].event).toBe('failed');
    });
  });

  // ============================================================================
  // Approval Workflow Tests
  // ============================================================================

  describe('Approval Workflow', () => {
    let conflictId: string;
    let requestId: string;

    beforeEach(async () => {
      // Detect a conflict and queue for approval
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          conflicts: [
            {
              type: 'permission-conflict',
              severity: 'critical',
              source: { id: 'perm1', name: 'Admin Permissions', type: 'permission', attributes: {} },
              description: 'Critical permission conflict',
            },
          ],
        },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = await service.detectConflicts('wave-001', ['perm1']);
      conflictId = conflicts[0].id;

      // Queue for manual approval
      await service.resolveConflict(conflictId, 'manual', {}, 'user1');

      const queue = service.getApprovalQueue('pending');
      requestId = queue[0].id;
    });

    it('should approve and resolve conflict', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Approved and resolved' },
        error: undefined, duration: 0, warnings: [],
      });

      const events: any[] = [];
      service.on('approval:granted', data => events.push({ event: 'granted', data }));

      await service.approveResolution(requestId, 'manager1', 'target-wins', {}, 'Approved by manager');

      const request = service.getApprovalQueue().find(r => r.id === requestId);
      expect(request?.status).toBe('approved');
      expect(request?.approvedBy).toBe('manager1');
      expect(request?.comments).toBe('Approved by manager');

      const conflict = service.getConflicts().find(c => c.id === conflictId);
      expect(conflict?.status).toBe('resolved');

      expect(events[0].event).toBe('granted');
    });

    it('should reject approval request', async () => {
      const events: any[] = [];
      service.on('approval:rejected', data => events.push({ event: 'rejected', data }));

      await service.rejectResolution(requestId, 'manager1', 'Does not meet criteria');

      const request = service.getApprovalQueue().find(r => r.id === requestId);
      expect(request?.status).toBe('rejected');
      expect(request?.approvedBy).toBe('manager1');
      expect(request?.comments).toBe('Does not meet criteria');

      const conflict = service.getConflicts().find(c => c.id === conflictId);
      expect(conflict?.status).toBe('detected'); // Back to detected

      expect(events[0].event).toBe('rejected');
    });

    it('should throw error for non-existent approval request', async () => {
      await expect(
        service.approveResolution('invalid-id', 'manager1', 'source-wins')
      ).rejects.toThrow('Approval request invalid-id not found');
    });
  });

  // ============================================================================
  // Auto-Resolution Tests
  // ============================================================================

  describe('autoResolveConflicts', () => {
    beforeEach(async () => {
      // Detect multiple conflicts
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          conflicts: [
            {
              type: 'duplicate-email',
              severity: 'high',
              source: { id: 'user1', name: 'User 1', type: 'user', attributes: {} },
              description: 'Email conflict 1',
            },
            {
              type: 'mailbox-exists',
              severity: 'medium',
              source: { id: 'user2', name: 'User 2', type: 'user', attributes: {} },
              description: 'Mailbox conflict',
            },
            {
              type: 'naming-conflict',
              severity: 'low',
              source: { id: 'group1', name: 'Group 1', type: 'group', attributes: {} },
              description: 'Naming conflict',
            },
          ],
        },
        error: undefined, duration: 0, warnings: [],
      });

      await service.detectConflicts('wave-001', ['user1', 'user2', 'group1']);

      // Create templates for auto-resolution
      await service.createTemplate({
        name: 'Auto-rename duplicates',
        description: 'Automatically rename duplicate emails',
        conflictType: 'duplicate-email',
        strategy: 'rename-source',
        autoApply: true,
        conditions: [],
        parameters: { suffix: '_migrated' },
      });

      await service.createTemplate({
        name: 'Merge mailboxes',
        description: 'Automatically merge existing mailboxes',
        conflictType: 'mailbox-exists',
        strategy: 'merge',
        autoApply: true,
        conditions: [],
        parameters: { mergeStrategy: 'smart' },
      });
    });

    it('should auto-resolve conflicts using templates', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Resolved' },
        error: undefined, duration: 0, warnings: [],
      });

      const events: any[] = [];
      service.on('autoresolve:started', data => events.push({ event: 'started', data }));
      service.on('autoresolve:completed', data => events.push({ event: 'completed', data }));

      await service.autoResolveConflicts('wave-001');

      const conflicts = service.getConflicts('wave-001');
      const resolved = conflicts.filter(c => c.status === 'resolved');

      expect(resolved.length).toBe(2); // duplicate-email and mailbox-exists
      expect(events[0].event).toBe('started');
      expect(events[1].event).toBe('completed');
      expect(events[1].data.resolved).toBe(2);
    });

    it('should not auto-resolve conflicts without matching templates', async () => {
      await service.autoResolveConflicts('wave-001');

      const conflicts = service.getConflicts('wave-001', 'naming-conflict');
      expect(conflicts[0].status).toBe('detected'); // Not resolved (no template)
    });

    it('should handle failures during auto-resolution', async () => {
      // First conflict succeeds, second fails
      let callCount = 0;
      mockPowerShell.executeScript.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return { success: true, data: { result: 'Success' }, error: undefined, duration: 0, warnings: [] };
        } else {
          return { success: false, data: null, error: 'Resolution failed', duration: 0, warnings: [] };
        }
      });

      await service.autoResolveConflicts('wave-001');

      const conflicts = service.getConflicts('wave-001');
      const resolved = conflicts.filter(c => c.status === 'resolved');
      const failed = conflicts.filter(c => c.status === 'failed');

      expect(resolved.length).toBeGreaterThan(0);
      expect(failed.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Template Management Tests
  // ============================================================================

  describe('Template Management', () => {
    it('should create resolution template', async () => {
      const template = await service.createTemplate({
        name: 'Rename duplicates',
        description: 'Rename duplicate users with suffix',
        conflictType: 'duplicate-user',
        strategy: 'rename-source',
        autoApply: true,
        conditions: [],
        parameters: { suffix: '_new' },
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Rename duplicates');
      expect(template.autoApply).toBe(true);
    });
  });

  // ============================================================================
  // Data Retrieval Tests
  // ============================================================================

  describe('Data Retrieval', () => {
    beforeEach(async () => {
      // Detect conflicts for multiple waves
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          conflicts: [
            {
              type: 'duplicate-email',
              severity: 'high',
              source: { id: 'user1', name: 'User 1', type: 'user', attributes: {} },
              description: 'Conflict 1',
            },
            {
              type: 'mailbox-exists',
              severity: 'medium',
              source: { id: 'user2', name: 'User 2', type: 'user', attributes: {} },
              description: 'Conflict 2',
            },
          ],
        },
        error: undefined, duration: 0, warnings: [],
      });

      await service.detectConflicts('wave-001', ['user1', 'user2']);

      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          conflicts: [
            {
              type: 'naming-conflict',
              severity: 'low',
              source: { id: 'group1', name: 'Group 1', type: 'group', attributes: {} },
              description: 'Conflict 3',
            },
          ],
        },
        error: undefined, duration: 0, warnings: [],
      });

      await service.detectConflicts('wave-002', ['group1']);
    });

    it('should get all conflicts', () => {
      const conflicts = service.getConflicts();
      expect(conflicts.length).toBe(3);
    });

    it('should filter conflicts by wave', () => {
      const wave1Conflicts = service.getConflicts('wave-001');
      const wave2Conflicts = service.getConflicts('wave-002');

      expect(wave1Conflicts.length).toBe(2);
      expect(wave2Conflicts.length).toBe(1);
    });

    it('should filter conflicts by type', () => {
      const emailConflicts = service.getConflicts(undefined, 'duplicate-email');
      expect(emailConflicts.length).toBe(1);
      expect(emailConflicts[0].type).toBe('duplicate-email');
    });

    it('should filter conflicts by status', () => {
      const detectedConflicts = service.getConflicts(undefined, undefined, 'detected');
      expect(detectedConflicts.length).toBe(3);
    });

    it('should get approval queue by status', async () => {
      // Queue one conflict for approval
      const conflicts = service.getConflicts('wave-001');
      await service.resolveConflict(conflicts[0].id, 'manual', {}, 'user1');

      const pendingApprovals = service.getApprovalQueue('pending');
      expect(pendingApprovals.length).toBe(1);
      expect(pendingApprovals[0].status).toBe('pending');
    });

    it('should get audit log for specific conflict', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { result: 'Success' },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = service.getConflicts('wave-001');
      const conflictId = conflicts[0].id;

      await service.resolveConflict(conflictId, 'source-wins', {}, 'admin');

      const auditLog = service.getAuditLog(conflictId);
      expect(auditLog.length).toBe(1);
      expect(auditLog[0].conflictId).toBe(conflictId);
      expect(auditLog[0].strategy).toBe('source-wins');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty user list in detection', async () => {
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { conflicts: [] },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = await service.detectConflicts('wave-empty', []);
      expect(conflicts).toEqual([]);
    });

    it('should handle large number of conflicts', async () => {
      const largeConflictSet = Array.from({ length: 100 }, (_, i) => ({
        type: 'duplicate-email',
        severity: 'medium',
        source: { id: `user${i}`, name: `User ${i}`, type: 'user', attributes: {} },
        description: `Conflict ${i}`,
      }));

      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: { conflicts: largeConflictSet },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = await service.detectConflicts('wave-large', Array.from({ length: 100 }, (_, i) => `user${i}`));
      expect(conflicts.length).toBe(100);
    });

    it('should handle rename without target resource', async () => {
      // Detect conflict without target
      mockPowerShell.executeScript.mockResolvedValue({
        success: true,
        data: {
          conflicts: [
            {
              type: 'naming-conflict',
              severity: 'low',
              source: { id: 'user1', name: 'John', type: 'user', attributes: {} },
              // No target resource
              description: 'Naming conflict without target',
            },
          ],
        },
        error: undefined, duration: 0, warnings: [],
      });

      const conflicts = await service.detectConflicts('wave-001', ['user1']);
      const conflictId = conflicts[0].id;

      // Should throw error when trying rename-target without target
      await expect(service.resolveConflict(conflictId, 'rename-target')).rejects.toThrow(
        'No target resource to rename'
      );
    });
  });
});



