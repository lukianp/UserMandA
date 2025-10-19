/**
 * Unit Tests for useSharePointDiscoveryLogic Hook
 * Tests all business logic for SharePoint discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSharePointDiscoveryLogic } from './useSharePointDiscoveryLogic';
import type { SharePointDiscoveryResult, SharePointSite, SharePointList, SharePointPermission } from '../types/models/sharepoint';

// Mock electron API
const mockElectronAPI = {
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  onProgress: jest.fn(() => jest.fn()),
};

// Setup window.electronAPI mock
beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useSharePointDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for templates loading
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: { templates: [] },
    });
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('Initial State', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      expect(result.current.config).toBeDefined();
      expect(result.current.result).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load templates on mount', async () => {
      const mockTemplates = [
        { id: '1', name: 'Full Site Scan', config: {} },
        { id: '2', name: 'Permission Audit', config: {} },
      ];
      mockElectronAPI.executeModule.mockResolvedValueOnce({
        success: true,
        data: { templates: mockTemplates },
      });

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await waitFor(() => {
        expect(result.current.templates).toEqual(mockTemplates);
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Discovery/SharePointDiscovery.psm1',
        functionName: 'Get-SharePointDiscoveryTemplates',
        parameters: {},
      });
    });

    it('should initialize with empty filters', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      expect(result.current.siteFilter).toEqual({});
      expect(result.current.listFilter).toEqual({});
      expect(result.current.permissionFilter).toEqual({});
    });

    it('should initialize with overview tab selected', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      expect(result.current.selectedTab).toBe('overview');
    });
  });

  // ============================================================================
  // Discovery Execution Tests
  // ============================================================================

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult: SharePointDiscoveryResult = {
        sites: [
          {
            id: 'site1',
            title: 'Team Site',
            url: 'https://contoso.sharepoint.com/sites/team',
            templateName: 'STS#3',
            owner: 'admin@contoso.com',
            storageUsage: 5000.5,
            storageQuota: 10000.0,
            isHubSite: true,
            groupId: 'grp123',
            subsiteCount: 3,
            listCount: 15,
            externalSharingEnabled: false,
            lastItemModifiedDate: '2024-01-15T10:00:00Z',
            description: 'Main team site',
          },
        ],
        lists: [],
        permissions: [],
        statistics: {
          totalSites: 1,
          totalLists: 0,
          totalPermissions: 0,
          totalStorage: 5000.5,
          hubSites: 1,
          sitesWithExternalSharing: 0,
        },
      };

      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({
          success: true,
          data: mockResult,
        }); // Discovery

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.result).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'SharePoint site not accessible';
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockRejectedValueOnce(new Error(errorMessage)); // Discovery fails

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
    });

    it('should handle discovery with error in result', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({
          success: false,
          error: 'Authentication failed',
        }); // Discovery fails

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.error).toBe('Authentication failed');
    });

    it('should set progress during discovery', async () => {
      let progressCallback: any;
      mockElectronAPI.onProgress.mockImplementation((cb) => {
        progressCallback = cb;
        return jest.fn();
      });

      mockElectronAPI.executeModule.mockImplementation(() => {
        if (progressCallback) {
          progressCallback({
            message: 'Scanning sites...',
            percentage: 40,
            itemsProcessed: 40,
            totalItems: 100,
          });
        }
        return Promise.resolve({ success: true, data: { sites: [], lists: [], permissions: [], statistics: {} } });
      });

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(mockElectronAPI.onProgress).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Cancellation Tests
  // ============================================================================

  describe('Discovery Cancellation', () => {
    it('should cancel discovery successfully', async () => {
      mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(mockElectronAPI.cancelExecution).toHaveBeenCalledWith('sharepoint-discovery');
      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.progress).toBeNull();
    });

    it('should handle cancellation error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockElectronAPI.cancelExecution.mockRejectedValueOnce(new Error('Cancel failed'));

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

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
        config: { siteUrl: 'https://contoso.sharepoint.com' },
      };

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      act(() => {
        result.current.loadTemplate(template as any);
      });

      expect(result.current.selectedTemplate).toEqual(template);
      expect(result.current.config).toEqual(template.config);
    });

    it('should save template successfully', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: true, data: { templates: [{ id: 'new', name: 'My Template' }] } });

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.saveAsTemplate('My Template', 'Test description');
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Discovery/SharePointDiscovery.psm1',
        functionName: 'Save-SharePointDiscoveryTemplate',
        parameters: {
          Name: 'My Template',
          Description: 'Test description',
          Config: expect.any(Object),
        },
      });
    });
  });

  // ============================================================================
  // Site Filtering Tests
  // ============================================================================

  describe('Site Filtering', () => {
    const mockSites: SharePointSite[] = [
      {
        id: 'site1',
        title: 'Marketing Site',
        url: 'https://contoso.sharepoint.com/sites/marketing',
        templateName: 'STS#3',
        owner: 'marketing@contoso.com',
        storageUsage: 8000,
        storageQuota: 10000,
        isHubSite: true,
        groupId: 'grp1',
        subsiteCount: 5,
        listCount: 20,
        externalSharingEnabled: true,
        lastItemModifiedDate: '2024-01-15T10:00:00Z',
        description: 'Marketing team site',
      },
      {
        id: 'site2',
        title: 'HR Site',
        url: 'https://contoso.sharepoint.com/sites/hr',
        templateName: 'STS#0',
        owner: 'hr@contoso.com',
        storageUsage: 2000,
        storageQuota: 5000,
        isHubSite: false,
        groupId: undefined,
        subsiteCount: 2,
        listCount: 10,
        externalSharingEnabled: false,
        lastItemModifiedDate: '2024-01-10T10:00:00Z',
        description: 'HR department site',
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          sites: mockSites,
          lists: [],
          permissions: [],
          statistics: {},
        },
      });
    });

    it('should filter sites by search text', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setSiteFilter({ searchText: 'marketing' });
      });

      expect(result.current.sites).toHaveLength(1);
      expect(result.current.sites[0].title).toBe('Marketing Site');
    });

    it('should filter sites by template', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setSiteFilter({ templates: ['STS#0'] });
      });

      expect(result.current.sites).toHaveLength(1);
      expect(result.current.sites[0].templateName).toBe('STS#0');
    });

    it('should filter sites by storage range', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setSiteFilter({ minStorage: 5000, maxStorage: 9000 });
      });

      expect(result.current.sites).toHaveLength(1);
      expect(result.current.sites[0].storageUsage).toBeGreaterThanOrEqual(5000);
    });

    it('should filter sites by hub site status', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setSiteFilter({ isHubSite: true });
      });

      expect(result.current.sites).toHaveLength(1);
      expect(result.current.sites[0].isHubSite).toBe(true);
    });

    it('should filter sites by group connection', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setSiteFilter({ hasGroupConnection: true });
      });

      expect(result.current.sites).toHaveLength(1);
      expect(result.current.sites[0].groupId).toBeTruthy();
    });

    it('should filter sites by external sharing', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setSiteFilter({ externalSharingEnabled: true });
      });

      expect(result.current.sites).toHaveLength(1);
      expect(result.current.sites[0].externalSharingEnabled).toBe(true);
    });
  });

  // ============================================================================
  // List Filtering Tests
  // ============================================================================

  describe('List Filtering', () => {
    const mockLists: SharePointList[] = [
      {
        id: 'list1',
        title: 'Documents',
        listUrl: 'https://contoso.sharepoint.com/sites/team/Documents',
        siteUrl: 'https://contoso.sharepoint.com/sites/team',
        baseType: 'DocumentLibrary',
        itemCount: 500,
        documentCount: 450,
        totalFileSize: 1024 * 1024 * 500,
        enableVersioning: true,
        enableModeration: false,
        hasUniquePermissions: true,
        lastItemModifiedDate: '2024-01-15T10:00:00Z',
        description: 'Team documents',
      },
      {
        id: 'list2',
        title: 'Tasks',
        listUrl: 'https://contoso.sharepoint.com/sites/team/Tasks',
        siteUrl: 'https://contoso.sharepoint.com/sites/team',
        baseType: 'GenericList',
        itemCount: 50,
        documentCount: 0,
        totalFileSize: 0,
        enableVersioning: false,
        enableModeration: true,
        hasUniquePermissions: false,
        lastItemModifiedDate: '2024-01-10T10:00:00Z',
        description: 'Team tasks',
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          sites: [],
          lists: mockLists,
          permissions: [],
          statistics: {},
        },
      });
    });

    it('should filter lists by search text', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setListFilter({ searchText: 'documents' });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].title).toBe('Documents');
    });

    it('should filter lists by base type', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setListFilter({ baseTypes: ['GenericList'] });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].baseType).toBe('GenericList');
    });

    it('should filter lists by item count range', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setListFilter({ minItemCount: 100, maxItemCount: 600 });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].itemCount).toBeGreaterThanOrEqual(100);
    });

    it('should filter lists by unique permissions', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setListFilter({ hasUniquePermissions: true });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].hasUniquePermissions).toBe(true);
    });

    it('should filter lists by versioning enabled', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setListFilter({ versioningEnabled: true });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].enableVersioning).toBe(true);
    });

    it('should filter lists by moderation enabled', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setListFilter({ moderationEnabled: true });
      });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].enableModeration).toBe(true);
    });
  });

  // ============================================================================
  // Permission Filtering Tests
  // ============================================================================

  describe('Permission Filtering', () => {
    const mockPermissions: SharePointPermission[] = [
      {
        id: 'perm1',
        principalName: 'John Doe',
        principalEmail: 'john@contoso.com',
        principalType: 'User',
        permissionLevel: 'Full Control',
        scope: 'Site',
        scopeUrl: 'https://contoso.sharepoint.com/sites/team',
        directPermission: true,
      },
      {
        id: 'perm2',
        principalName: 'Marketing Group',
        principalEmail: 'marketing@contoso.com',
        principalType: 'Group',
        permissionLevel: 'Contribute',
        scope: 'List',
        scopeUrl: 'https://contoso.sharepoint.com/sites/team/Documents',
        directPermission: false,
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          sites: [],
          lists: [],
          permissions: mockPermissions,
          statistics: {},
        },
      });
    });

    it('should filter permissions by search text', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ searchText: 'john' });
      });

      expect(result.current.permissions).toHaveLength(1);
      expect(result.current.permissions[0].principalName).toBe('John Doe');
    });

    it('should filter permissions by principal type', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ principalTypes: ['Group'] });
      });

      expect(result.current.permissions).toHaveLength(1);
      expect(result.current.permissions[0].principalType).toBe('Group');
    });

    it('should filter permissions by permission level', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ permissionLevels: ['Full Control'] });
      });

      expect(result.current.permissions).toHaveLength(1);
      expect(result.current.permissions[0].permissionLevel).toBe('Full Control');
    });

    it('should filter permissions by scope', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ scopes: ['Site'] });
      });

      expect(result.current.permissions).toHaveLength(1);
      expect(result.current.permissions[0].scope).toBe('Site');
    });

    it('should filter permissions by direct only', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ directOnly: true });
      });

      expect(result.current.permissions).toHaveLength(1);
      expect(result.current.permissions[0].directPermission).toBe(true);
    });
  });

  // ============================================================================
  // Export Tests
  // ============================================================================

  describe('Export Functionality', () => {
    it('should export data successfully', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({ success: true, data: { sites: [], lists: [], permissions: [], statistics: {} } }) // Discovery
        .mockResolvedValueOnce({ success: true }); // Export

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await act(async () => {
        await result.current.exportData({ format: 'excel', includeSites: true });
      });

      expect(mockElectronAPI.executeModule).toHaveBeenLastCalledWith({
        modulePath: 'Modules/Export/ExportService.psm1',
        functionName: 'Export-SharePointDiscoveryData',
        parameters: {
          Result: expect.any(Object),
          Options: { format: 'excel', includeSites: true },
        },
      });
    });

    it('should not export when no result available', async () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.exportData({ format: 'csv' });
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Column Definitions Tests
  // ============================================================================

  describe('Column Definitions', () => {
    it('should provide site column definitions', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      expect(result.current.siteColumns).toBeDefined();
      expect(result.current.siteColumns.length).toBeGreaterThan(0);
      expect(result.current.siteColumns[0].field).toBe('title');
    });

    it('should provide list column definitions', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      expect(result.current.listColumns).toBeDefined();
      expect(result.current.listColumns.length).toBeGreaterThan(0);
      expect(result.current.listColumns[0].field).toBe('title');
    });

    it('should provide permission column definitions', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      expect(result.current.permissionColumns).toBeDefined();
      expect(result.current.permissionColumns.length).toBeGreaterThan(0);
      expect(result.current.permissionColumns[0].field).toBe('principalName');
    });
  });

  // ============================================================================
  // UI State Tests
  // ============================================================================

  describe('UI State Management', () => {
    it('should update selected tab', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      act(() => {
        result.current.setSelectedTab('sites');
      });

      expect(result.current.selectedTab).toBe('sites');
    });

    it('should update config', () => {
      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      const newConfig = { ...result.current.config, siteUrl: 'https://custom.sharepoint.com' };

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
        totalSites: 50,
        totalLists: 250,
        totalPermissions: 1500,
        totalStorage: 50000.75,
        hubSites: 5,
        sitesWithExternalSharing: 10,
      };

      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          sites: [],
          lists: [],
          permissions: [],
          statistics: mockStatistics,
        },
      });

      const { result } = renderHook(() => useSharePointDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.statistics).toEqual(mockStatistics);
    });
  });
});
