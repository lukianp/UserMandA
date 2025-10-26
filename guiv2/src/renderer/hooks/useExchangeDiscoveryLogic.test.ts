/**
 * Unit Tests for useExchangeDiscoveryLogic Hook
 * Tests all business logic for Exchange discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';

import type { ExchangeDiscoveryResult, ExchangeMailbox, ExchangeDistributionGroup, ExchangeTransportRule } from '../types/models/exchange';

import { useExchangeDiscoveryLogic } from './useExchangeDiscoveryLogic';

// Mock electron API
const mockElectronAPI = {
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  onProgress: jest.fn(() => jest.fn()),
};

const mockElectron = {
  executeDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  onDiscoveryProgress: jest.fn(() => jest.fn()),
  onDiscoveryComplete: jest.fn(() => jest.fn()),
  onDiscoveryError: jest.fn(() => jest.fn()),
};

// Setup window.electronAPI and window.electron mocks
beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
  Object.defineProperty(window, 'electron', {
    writable: true,
    value: mockElectron,
  });
});

describe('useExchangeDiscoveryLogic', () => {
  let onProgressCallback: ((data: any) => void) | null = null;
  let onCompleteCallback: ((data: any) => void) | null = null;
  let onErrorCallback: ((data: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    onProgressCallback = null;
    onCompleteCallback = null;
    onErrorCallback = null;

    // Default mock for templates loading
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: { templates: [] },
    });

    // Setup event listener mocks to capture callbacks
    mockElectron.onDiscoveryProgress.mockImplementation((callback) => {
      onProgressCallback = callback;
      return jest.fn(); // unsubscribe function
    });
    mockElectron.onDiscoveryComplete.mockImplementation((callback) => {
      onCompleteCallback = callback;
      return jest.fn(); // unsubscribe function
    });
    mockElectron.onDiscoveryError.mockImplementation((callback) => {
      onErrorCallback = callback;
      return jest.fn(); // unsubscribe function
    });

    // Mock executeDiscovery to resolve immediately
    mockElectron.executeDiscovery.mockResolvedValue(undefined);
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('Initial State', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      expect(result.current.config).toBeDefined();
      expect(result.current.result).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load templates on mount', async () => {
      const mockTemplates = [
        { id: '1', name: 'Standard Discovery', config: {} },
        { id: '2', name: 'Quick Scan', config: {} },
      ];
      mockElectronAPI.executeModule.mockResolvedValueOnce({
        success: true,
        data: { templates: mockTemplates },
      });

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await waitFor(() => {
        expect(result.current.templates).toEqual(mockTemplates);
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
        functionName: 'Get-ExchangeDiscoveryTemplates',
        parameters: {},
      });
    });

    it('should initialize with empty filters', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      expect(result.current.mailboxFilter).toEqual({});
      expect(result.current.groupFilter).toEqual({});
      expect(result.current.ruleFilter).toEqual({});
    });

    it('should initialize with overview tab selected', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      expect(result.current.selectedTab).toBe('overview');
    });
  });

  // ============================================================================
  // Discovery Execution Tests
  // ============================================================================

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult: ExchangeDiscoveryResult = {
        mailboxes: [
          {
            id: 'mbx1',
            displayName: 'John Doe',
            userPrincipalName: 'john@contoso.com',
            primarySmtpAddress: 'john@contoso.com',
            mailboxType: 'UserMailbox',
            totalItemSize: 1024 * 1024 * 500,
            itemCount: 1000,
            archiveEnabled: true,
            litigationHoldEnabled: false,
            isInactive: false,
            lastLogonTime: new Date("2023-01-01T10:00:00Z"),
          },
        ],
        distributionGroups: [],
        transportRules: [],
        statistics: {
          totalMailboxes: 1,
          totalDistributionGroups: 0,
          totalTransportRules: 0,
          totalMailboxSize: 1024 * 1024 * 500,
          inactiveMailboxes: 1,
          ininactiveMailboxes: 0,
        },
      };

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      // Simulate discovery completion
      await act(async () => {
        if (onCompleteCallback) {
          onCompleteCallback({
            executionId: 'exchange-discovery',
            result: mockResult,
          });
        }
      });

      await waitFor(() => {
        expect(result.current.isDiscovering).toBe(false);
      });

      expect(result.current.result).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('should set progress during discovery', async () => {
      let progressCallback: any;
      mockElectronAPI.onProgress.mockImplementation((cb) => {
        progressCallback = cb;
        return jest.fn();
      });

      mockElectronAPI.executeModule.mockImplementation(() => {
        // Simulate progress updates
        if (progressCallback) {
          progressCallback({
            message: 'Discovering mailboxes...',
            percentage: 50,
            itemsProcessed: 50,
            totalItems: 100,
          });
        }
        return Promise.resolve({ success: true, data: { mailboxes: [], distributionGroups: [], transportRules: [], statistics: {} } });
      });

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(mockElectronAPI.onProgress).toHaveBeenCalled();
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'Exchange server not reachable';
      mockElectron.executeDiscovery.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await waitFor(() => {
        expect(result.current.isDiscovering).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
    });

    it('should clear error when starting new discovery', async () => {
      const mockResult: ExchangeDiscoveryResult = {
        mailboxes: [],
        distributionGroups: [],
        transportRules: [],
        statistics: {
          totalMailboxes: 0,
          totalDistributionGroups: 0,
          totalTransportRules: 0,
          totalMailboxSize: 0,
          inactiveMailboxes: 0,
          ininactiveMailboxes: 0,
        },
      };

      mockElectron.executeDiscovery
        .mockRejectedValueOnce(new Error('First error')) // First discovery fails
        .mockResolvedValueOnce(undefined); // Second discovery succeeds

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      // Wait for initial template load
      await waitFor(() => {
        expect(result.current.templates).toEqual([]);
      });

      // First discovery fails
      await act(async () => {
        await result.current.startDiscovery();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Second discovery succeeds
      await act(async () => {
        await result.current.startDiscovery();
      });

      // Trigger completion event
      await act(async () => {
        if (onCompleteCallback) {
          onCompleteCallback({
            executionId: 'exchange-discovery',
            result: mockResult,
          });
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  // ============================================================================
  // Cancellation Tests
  // ============================================================================

  describe('Discovery Cancellation', () => {
    it('should cancel discovery successfully', async () => {
      mockElectron.cancelDiscovery.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(mockElectron.cancelDiscovery).toHaveBeenCalledWith('exchange-discovery');
      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.progress).toBeNull();
    });

    it('should handle cancellation error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockElectron.cancelDiscovery.mockRejectedValueOnce(new Error('Cancel failed'));

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ============================================================================
  // Template Management Tests
  // ============================================================================

  describe('Template Management', () => {
    it('should load template and apply config', () => {
      const template = {
        id: 'tpl1',
        name: 'Custom Template',
        description: 'Test template',
        config: { discoveryScope: 'AllMailboxes' },
      };

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      act(() => {
        result.current.loadTemplate(template as any);
      });

      expect(result.current.selectedTemplate).toEqual(template);
      expect(result.current.config).toEqual(template.config);
    });

    it('should save template successfully', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Initial load
        .mockResolvedValueOnce({ success: true }) // Save
        .mockResolvedValueOnce({ success: true, data: { templates: [{ id: 'new', name: 'My Template' }] } }); // Reload

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.saveAsTemplate('My Template', 'Test description');
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
        functionName: 'Save-ExchangeDiscoveryTemplate',
        parameters: {
          Name: 'My Template',
          Description: 'Test description',
          Config: expect.any(Object),
        },
      });
    });

    it('should handle template save failure', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } })
        .mockRejectedValueOnce(new Error('Save failed'));

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await expect(async () => {
        await act(async () => {
          await result.current.saveAsTemplate('Failed', 'Description');
        });
      }).rejects.toThrow('Save failed');
    });
  });

  // ============================================================================
  // Mailbox Filtering Tests
  // ============================================================================

  describe('Mailbox Filtering', () => {
    const mockMailboxes: ExchangeMailbox[] = [
      {
        id: 'mbx1',
        displayName: 'John Doe',
        userPrincipalName: 'john@contoso.com',
        primarySmtpAddress: 'john@contoso.com',
        mailboxType: 'UserMailbox',
        totalItemSize: 500 * 1024 * 1024,
        itemCount: 1000,
        archiveEnabled: true,
        litigationHoldEnabled: false,
        isInactive: false,
        lastLogonTime: new Date("2023-01-01T10:00:00Z"),
      },
      {
        id: 'mbx2',
        displayName: 'Jane Smith',
        userPrincipalName: 'jane@contoso.com',
        primarySmtpAddress: 'jane@contoso.com',
        mailboxType: 'SharedMailbox',
        totalItemSize: 100 * 1024 * 1024,
        itemCount: 500,
        archiveEnabled: false,
        litigationHoldEnabled: true,
        isInactive: true,
        lastLogonTime: new Date("2023-01-01T10:00:00Z"),
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          mailboxes: mockMailboxes,
          distributionGroups: [],
          transportRules: [],
          statistics: {},
        },
      });
    });

    it('should filter mailboxes by search text', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMailboxFilter({ searchText: 'john' });
      });

      expect(result.current.mailboxes).toHaveLength(1);
      expect(result.current.mailboxes[0].displayName).toBe('John Doe');
    });

    it('should filter mailboxes by type', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMailboxFilter({ mailboxTypes: ['SharedMailbox'] });
      });

      expect(result.current.mailboxes).toHaveLength(1);
      expect(result.current.mailboxes[0].mailboxType).toBe('SharedMailbox');
    });

    it('should filter mailboxes by size range', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMailboxFilter({
          minSize: 200 * 1024 * 1024,
          maxSize: 600 * 1024 * 1024,
        });
      });

      expect(result.current.mailboxes).toHaveLength(1);
      expect(result.current.mailboxes[0].displayName).toBe('John Doe');
    });

    it('should filter by archive enabled', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMailboxFilter({ hasArchive: true });
      });

      expect(result.current.mailboxes).toHaveLength(1);
      expect(result.current.mailboxes[0].archiveEnabled).toBe(true);
    });

    it('should filter by litigation hold', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMailboxFilter({ hasLitigationHold: true });
      });

      expect(result.current.mailboxes).toHaveLength(1);
      expect(result.current.mailboxes[0].litigationHoldEnabled).toBe(true);
    });

    it('should filter by inactive status', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMailboxFilter({ isInactive: true });
      });

      expect(result.current.mailboxes).toHaveLength(1);
      expect(result.current.mailboxes[0].isInactive).toBe(true);
    });
  });

  // ============================================================================
  // Group Filtering Tests
  // ============================================================================

  describe('Group Filtering', () => {
    const mockGroups: ExchangeDistributionGroup[] = [
      {
        id: 'grp1',
        displayName: 'Sales Team',
        primarySmtpAddress: 'sales@contoso.com',
        alias: 'sales',
        groupType: 'Distribution',
        memberCount: 25,
        moderationEnabled: true,
        hiddenFromAddressListsEnabled: false,
        whenCreated: new Date("2023-01-01T10:00:00Z"),
      },
      {
        id: 'grp2',
        displayName: 'IT Team',
        primarySmtpAddress: 'it@contoso.com',
        alias: 'it',
        groupType: 'Security',
        memberCount: 10,
        moderationEnabled: false,
        hiddenFromAddressListsEnabled: true,
        whenCreated: new Date("2023-01-01T10:00:00Z"),
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          mailboxes: [],
          distributionGroups: mockGroups,
          transportRules: [],
          statistics: {},
        },
      });
    });

    it('should filter groups by search text', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setGroupFilter({ searchText: 'sales' });
      });

      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].displayName).toBe('Sales Team');
    });

    it('should filter groups by type', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setGroupFilter({ groupTypes: ['Security'] });
      });

      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].groupType).toBe('Security');
    });

    it('should filter groups by member count range', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setGroupFilter({ minMemberCount: 20 });
      });

      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].memberCount).toBeGreaterThanOrEqual(20);
    });

    it('should filter groups by moderation status', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setGroupFilter({ moderationEnabled: true });
      });

      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].moderationEnabled).toBe(true);
    });

    it('should filter groups by hidden from address list', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setGroupFilter({ hiddenFromAddressList: true });
      });

      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].hiddenFromAddressListsEnabled).toBe(true);
    });
  });

  // ============================================================================
  // Transport Rule Filtering Tests
  // ============================================================================

  describe('Transport Rule Filtering', () => {
    const mockRules: ExchangeTransportRule[] = [
      {
        id: 'rule1',
        name: 'Block External',
        description: 'Block emails from external domains',
        priority: 1,
        state: 'Enabled',
        createdBy: 'admin@contoso.com',
        createdDate: new Date("2023-01-01T10:00:00Z"),
        modifiedDate: new Date("2023-01-01T10:00:00Z"),
      },
      {
        id: 'rule2',
        name: 'Add Disclaimer',
        description: 'Add disclaimer to all outgoing emails',
        priority: 5,
        state: 'Disabled',
        createdBy: 'admin@contoso.com',
        createdDate: new Date("2023-01-01T10:00:00Z"),
        modifiedDate: new Date("2023-01-01T10:00:00Z"),
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          mailboxes: [],
          distributionGroups: [],
          transportRules: mockRules,
          statistics: {},
        },
      });
    });

    it('should filter rules by search text', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setRuleFilter({ searchText: 'disclaimer' });
      });

      expect(result.current.rules).toHaveLength(1);
      expect(result.current.rules[0].name).toBe('Add Disclaimer');
    });

    it('should filter rules by state', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setRuleFilter({ state: ['Enabled'] });
      });

      expect(result.current.rules).toHaveLength(1);
      expect(result.current.rules[0].state).toBe('Enabled');
    });

    it('should filter rules by priority range', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setRuleFilter({ priority: { min: 1, max: 3 } });
      });

      expect(result.current.rules).toHaveLength(1);
      expect(result.current.rules[0].priority).toBeLessThanOrEqual(3);
    });
  });

  // ============================================================================
  // Export Tests
  // ============================================================================

  describe('Export Functionality', () => {
    it('should export data successfully', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({ success: true, data: { mailboxes: [], distributionGroups: [], transportRules: [], statistics: {} } }) // Discovery
        .mockResolvedValueOnce({ success: true }); // Export

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await act(async () => {
        await result.current.exportData({ format: 'csv', includeMailboxes: true });
      });

      expect(mockElectronAPI.executeModule).toHaveBeenLastCalledWith({
        modulePath: 'Modules/Export/ExportService.psm1',
        functionName: 'Export-ExchangeDiscoveryData',
        parameters: {
          Result: expect.any(Object),
          Options: { format: 'csv', includeMailboxes: true },
        },
      });
    });

    it('should not export when no result available', async () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.exportData({ format: 'csv' });
      });

      // Should not call executeModule for export (only for initial template load)
      expect(mockElectronAPI.executeModule).toHaveBeenCalledTimes(1);
    });

    it('should handle export failure', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({ success: true, data: { mailboxes: [], distributionGroups: [], transportRules: [], statistics: {} } }) // Discovery
        .mockRejectedValueOnce(new Error('Export failed')); // Export fails

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.exportData({ format: 'csv' });
        });
      }).rejects.toThrow('Export failed');
    });
  });

  // ============================================================================
  // Column Definitions Tests
  // ============================================================================

  describe('Column Definitions', () => {
    it('should provide mailbox column definitions', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      expect(result.current.mailboxColumns).toBeDefined();
      expect(result.current.mailboxColumns.length).toBeGreaterThan(0);
      expect(result.current.mailboxColumns[0].field).toBe('displayName');
    });

    it('should provide group column definitions', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      expect(result.current.groupColumns).toBeDefined();
      expect(result.current.groupColumns.length).toBeGreaterThan(0);
      expect(result.current.groupColumns[0].field).toBe('displayName');
    });

    it('should provide rule column definitions', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      expect(result.current.ruleColumns).toBeDefined();
      expect(result.current.ruleColumns.length).toBeGreaterThan(0);
      expect(result.current.ruleColumns[0].field).toBe('name');
    });
  });

  // ============================================================================
  // UI State Tests
  // ============================================================================

  describe('UI State Management', () => {
    it('should update selected tab', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      act(() => {
        result.current.setSelectedTab('mailboxes');
      });

      expect(result.current.selectedTab).toBe('mailboxes');
    });

    it('should update config', () => {
      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      const newConfig = { ...result.current.config, discoveryScope: 'Custom' };

      act(() => {
        result.current.setConfig(newConfig as any);
      });

      expect(result.current.config).toEqual(newConfig);
    });
  });

  // ============================================================================
  // Statistics Tests
  // ============================================================================

  describe('Statistics', () => {
    it('should expose statistics from result', async () => {
      const mockStatistics = {
        totalMailboxes: 100,
        totalDistributionGroups: 25,
        totalTransportRules: 10,
        totalMailboxSize: 1024 * 1024 * 1024 * 50,
        inactiveMailboxes: 90,
        ininactiveMailboxes: 10,
      };

      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          mailboxes: [],
          distributionGroups: [],
          transportRules: [],
          statistics: mockStatistics,
        },
      });

      const { result } = renderHook(() => useExchangeDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.statistics).toEqual(mockStatistics);
    });
  });
});

