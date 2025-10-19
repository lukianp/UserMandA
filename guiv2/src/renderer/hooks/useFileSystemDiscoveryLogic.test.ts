/**
 * Unit Tests for useFileSystemDiscoveryLogic Hook
 * Tests all business logic for File System discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useFileSystemDiscoveryLogic } from './useFileSystemDiscoveryLogic';
import type { FileSystemDiscoveryResult, FileShare, FilePermission, LargeFile } from '../types/models/filesystem';

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

describe('useFileSystemDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for history loading
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: { history: [] },
    });
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('Initial State', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      expect(result.current.config).toBeDefined();
      expect(result.current.result).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.isRunning).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with overview tab selected', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      expect(result.current.activeTab).toBe('overview');
    });

    it('should load discovery history on mount', async () => {
      const mockHistory = [
        { id: '1', timestamp: '2024-01-01', shares: [], permissions: [], largeFiles: [] },
        { id: '2', timestamp: '2024-01-02', shares: [], permissions: [], largeFiles: [] },
      ];
      mockElectronAPI.executeModule.mockResolvedValueOnce({
        success: true,
        data: { history: mockHistory },
      });

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await waitFor(() => {
        expect(result.current.discoveryHistory).toEqual(mockHistory);
      });
    });

    it('should initialize with empty arrays for data', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      expect(result.current.shares).toEqual([]);
      expect(result.current.permissions).toEqual([]);
      expect(result.current.largeFiles).toEqual([]);
    });
  });

  // ============================================================================
  // Discovery Execution Tests
  // ============================================================================

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult: FileSystemDiscoveryResult = {
        id: 'disc-1',
        timestamp: '2024-01-15T10:00:00Z',
        servers: ['server1', 'server2'],
        shares: [
          {
            name: 'SharedDocs',
            path: '\\\\server1\\SharedDocs',
            type: 'SMB',
            server: 'server1',
            size: { totalBytes: 1024 * 1024 * 1024 * 100, usedBytes: 1024 * 1024 * 1024 * 75, percentUsed: 75 },
            statistics: { totalFiles: 1000, totalFolders: 50},
            quotaEnabled: true,
            encryptionEnabled: true,
            deduplicationEnabled: false,
            description: 'Shared documents',
          },
        ],
        permissions: [],
        largeFiles: [],
        statistics: {
          totalServers: 2,
          totalShares: 1,
          totalPermissions: 0,
          totalLargeFiles: 0,
          totalSize: 1024 * 1024 * 1024 * 100,
          averageShareSize: 1024 * 1024 * 1024 * 50,
        },
        securityRisks: [],
      };

      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } }) // History load
        .mockResolvedValueOnce({ success: true, data: mockResult }); // Discovery

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.result).toEqual(mockResult);
      expect(result.current.error).toBeNull();
      expect(result.current.shares).toEqual(mockResult.shares);
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'Access denied to file server';
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
    });

    it('should handle discovery with error in result', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockResolvedValueOnce({ success: false, error: 'Server timeout' });

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.error).toBe('Server timeout');
    });

    it('should set progress during discovery', async () => {
      let progressCallback: any;
      mockElectronAPI.onProgress.mockImplementation((cb) => {
        progressCallback = cb;
        return jest.fn();
      });

      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockImplementation(() => {
          if (progressCallback) {
            progressCallback({
              message: 'Scanning shares...',
              percentage: 50,
              itemsProcessed: 5,
              totalItems: 10,
            });
          }
          return Promise.resolve({ success: true, data: { shares: [], permissions: [], largeFiles: [], statistics: {} } });
        });

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

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
    it('should not cancel when discovery is not running', async () => {
      mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      // cancelDiscovery should not call API when not running
      await act(async () => {
        await result.current.cancelDiscovery();
      });

      // Should not call cancelExecution since discovery is not running
      expect(mockElectronAPI.cancelExecution).not.toHaveBeenCalled();
    });

    it('should handle cancellation when not running', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      // Should not error when calling cancel when not running
      await act(async () => {
        await result.current.cancelDiscovery();
      });

      // Cancel should not be called when not running
      expect(mockElectronAPI.cancelExecution).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Share Filtering Tests
  // ============================================================================

  describe('Share Filtering', () => {
    const mockShares: FileShare[] = [
      {
        name: 'Marketing',
        path: '\\\\server1\\Marketing',
        type: 'SMB',
        server: 'server1',
        size: { totalBytes: 1024 * 1024 * 1024 * 200, usedBytes: 1024 * 1024 * 1024 * 150, percentUsed: 75 },
        statistics: { totalFiles: 5000, totalFolders: 100},
        quotaEnabled: true,
        encryptionEnabled: true,
        deduplicationEnabled: false,
        description: 'Marketing files',
      },
      {
        name: 'IT',
        path: '\\\\server2\\IT',
        type: 'NFS',
        server: 'server2',
        size: { totalBytes: 1024 * 1024 * 1024 * 50, usedBytes: 1024 * 1024 * 1024 * 25, percentUsed: 50 },
        statistics: { totalFiles: 1000, totalFolders: 20},
        quotaEnabled: false,
        encryptionEnabled: false,
        deduplicationEnabled: true,
        description: 'IT department',
      },
    ];

    beforeEach(async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockResolvedValueOnce({
          success: true,
          data: { shares: mockShares, permissions: [], largeFiles: [], statistics: {} },
        });
    });

    it('should filter shares by search text', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setShareFilter({ searchText: 'marketing' });
      });

      expect(result.current.filteredShares).toHaveLength(1);
      expect(result.current.filteredShares[0].name).toBe('Marketing');
    });

    it('should filter shares by type', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setShareFilter({ type: ['NFS'] });
      });

      expect(result.current.filteredShares).toHaveLength(1);
      expect(result.current.filteredShares[0].type).toBe('NFS');
    });

    it('should filter shares by size range', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setShareFilter({ minSize: 100, maxSize: 250 }); // GB
      });

      expect(result.current.filteredShares).toHaveLength(1);
      expect(result.current.filteredShares[0].name).toBe('Marketing');
    });

    it('should filter shares by server', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setShareFilter({ server: 'server1' });
      });

      expect(result.current.filteredShares).toHaveLength(1);
      expect(result.current.filteredShares[0].server).toBe('server1');
    });

    it('should filter shares by encryption status', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setShareFilter({ hasEncryption: true });
      });

      expect(result.current.filteredShares).toHaveLength(1);
      expect(result.current.filteredShares[0].encryptionEnabled).toBe(true);
    });

    it('should filter shares by quota status', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setShareFilter({ hasQuota: true });
      });

      expect(result.current.filteredShares).toHaveLength(1);
      expect(result.current.filteredShares[0].quotaEnabled).toBe(true);
    });
  });

  // ============================================================================
  // Permission Filtering Tests
  // ============================================================================

  describe('Permission Filtering', () => {
    const mockPermissions: FilePermission[] = [
      {
        shareName: 'Marketing',
        principal: { name: 'DOMAIN\\Admins', type: 'Group', sid: 'S-1-5-21-1' },
        accessType: 'Allow',
        rights: ['FullControl'],
        inheritance: 'Inherited',
        isInherited: true,
      },
      {
        shareName: 'IT',
        principal: { name: 'john.doe', type: 'User', sid: 'S-1-5-21-2' },
        accessType: 'Deny',
        rights: ['Read', 'Write'],
        inheritance: 'None',
        isInherited: false,
      },
    ];

    beforeEach(async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockResolvedValueOnce({
          success: true,
          data: { shares: [], permissions: mockPermissions, largeFiles: [], statistics: {} },
        });
    });

    it('should filter permissions by search text', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ searchText: 'john' });
      });

      expect(result.current.filteredPermissions).toHaveLength(1);
      expect(result.current.filteredPermissions[0].principal.name).toBe('john.doe');
    });

    it('should filter permissions by access type', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ accessType: ['Deny'] });
      });

      expect(result.current.filteredPermissions).toHaveLength(1);
      expect(result.current.filteredPermissions[0].accessType).toBe('Deny');
    });

    it('should filter permissions by principal type', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ principalType: ['Group'] });
      });

      expect(result.current.filteredPermissions).toHaveLength(1);
      expect(result.current.filteredPermissions[0].principal.type).toBe('Group');
    });

    it('should filter permissions by share', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setPermissionFilter({ share: 'Marketing' });
      });

      expect(result.current.filteredPermissions).toHaveLength(1);
      expect(result.current.filteredPermissions[0].shareName).toBe('Marketing');
    });
  });

  // ============================================================================
  // Large File Filtering Tests
  // ============================================================================

  describe('Large File Filtering', () => {
    const mockLargeFiles: LargeFile[] = [
      {
        name: 'database.bak',
        path: '\\\\server1\\Marketing\\database.bak',
        extension: '.bak',
        sizeBytes: 1024 * 1024 * 1024 * 10,
        owner: 'admin',
        share: 'Marketing',
        modifiedDate: new Date("2023-01-01T10:00:00Z"),
        isEncrypted: true,
        isCompressed: false,
      },
      {
        name: 'video.mp4',
        path: '\\\\server2\\IT\\video.mp4',
        extension: '.mp4',
        sizeBytes: 1024 * 1024 * 500,
        owner: 'john.doe',
        share: 'IT',
        modifiedDate: new Date("2023-01-01T10:00:00Z"),
        isEncrypted: false,
        isCompressed: true,
      },
    ];

    beforeEach(async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockResolvedValueOnce({
          success: true,
          data: { shares: [], permissions: [], largeFiles: mockLargeFiles, statistics: {} },
        });
    });

    it('should filter large files by search text', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setLargeFileFilter({ searchText: 'video' });
      });

      expect(result.current.filteredLargeFiles).toHaveLength(1);
      expect(result.current.filteredLargeFiles[0].name).toBe('video.mp4');
    });

    it('should filter large files by minimum size', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setLargeFileFilter({ minSize: 1000 }); // MB
      });

      expect(result.current.filteredLargeFiles).toHaveLength(1);
      expect(result.current.filteredLargeFiles[0].name).toBe('database.bak');
    });

    it('should filter large files by extension', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setLargeFileFilter({ extension: ['.mp4'] });
      });

      expect(result.current.filteredLargeFiles).toHaveLength(1);
      expect(result.current.filteredLargeFiles[0].extension).toBe('.mp4');
    });

    it('should filter large files by encryption status', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setLargeFileFilter({ isEncrypted: true });
      });

      expect(result.current.filteredLargeFiles).toHaveLength(1);
      expect(result.current.filteredLargeFiles[0].isEncrypted).toBe(true);
    });

    it('should filter large files by share', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setLargeFileFilter({ share: 'IT' });
      });

      expect(result.current.filteredLargeFiles).toHaveLength(1);
      expect(result.current.filteredLargeFiles[0].share).toBe('IT');
    });
  });

  // ============================================================================
  // Export Tests
  // ============================================================================

  describe('Export Functionality', () => {
    it('should export data successfully', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockResolvedValueOnce({ success: true, data: { shares: [], permissions: [], largeFiles: [], statistics: {} } })
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await act(async () => {
        await result.current.exportResults('CSV');
      });

      expect(mockElectronAPI.executeModule).toHaveBeenLastCalledWith({
        modulePath: 'Modules/Export/FileSystemExport.psm1',
        functionName: 'Export-FileSystemDiscovery',
        parameters: {
          Result: expect.any(Object),
          Format: 'CSV',
          IncludeShares: true,
          IncludePermissions: true,
          IncludeLargeFiles: true,
          IncludeStatistics: true,
          IncludeSecurityRisks: true,
        },
      });
    });

    it('should not export when no result available', async () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.exportResults('JSON');
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledTimes(1); // Only history load
    });
  });

  // ============================================================================
  // Column Definitions Tests
  // ============================================================================

  describe('Column Definitions', () => {
    it('should provide share column definitions', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      expect(result.current.shareColumnDefs).toBeDefined();
      expect(result.current.shareColumnDefs.length).toBeGreaterThan(0);
      expect(result.current.shareColumnDefs[0].field).toBe('name');
    });

    it('should provide permission column definitions', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      expect(result.current.permissionColumnDefs).toBeDefined();
      expect(result.current.permissionColumnDefs.length).toBeGreaterThan(0);
      expect(result.current.permissionColumnDefs[0].field).toBe('shareName');
    });

    it('should provide large file column definitions', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      expect(result.current.largeFileColumnDefs).toBeDefined();
      expect(result.current.largeFileColumnDefs.length).toBeGreaterThan(0);
      expect(result.current.largeFileColumnDefs[0].field).toBe('name');
    });
  });

  // ============================================================================
  // UI State Tests
  // ============================================================================

  describe('UI State Management', () => {
    it('should update active tab', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      act(() => {
        result.current.setActiveTab('shares');
      });

      expect(result.current.activeTab).toBe('shares');
    });

    it('should update config', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      const newConfig = {
        ...result.current.config,
        servers: ['newserver'],
      };

      act(() => {
        result.current.setConfig(newConfig);
      });

      expect(result.current.config.servers).toEqual(['newserver']);
    });

    it('should update search text', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      act(() => {
        result.current.setSearchText('test search');
      });

      expect(result.current.searchText).toBe('test search');
    });
  });

  // ============================================================================
  // Template Management Tests
  // ============================================================================

  describe('Template Management', () => {
    it('should select template and apply config', () => {
      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      const template = {
        id: 'tpl1',
        name: 'Quick Scan',
        description: 'Fast scan template',
        config: {
          servers: ['testserver'],
          includeHiddenShares: false,
          includeAdministrativeShares: false,
          scanPermissions: false,
          scanLargeFiles: true,
          largeFileThresholdMB: 1000,
          analyzeStorage: true,
          detectSecurityRisks: false,
          maxDepth: 3,
          timeout: 300,
          parallelScans: 2,
          excludePaths: [],
        },
      };

      act(() => {
        result.current.selectTemplate(template as any);
      });

      expect(result.current.selectedTemplate).toEqual(template);
      expect(result.current.config).toEqual(template.config);
    });
  });

  // ============================================================================
  // History Management Tests
  // ============================================================================

  describe('History Management', () => {
    it('should load history item', async () => {
      const mockHistoryItem = {
        id: 'hist-1',
        shares: [{ name: 'TestShare' }],
        permissions: [],
        largeFiles: [],
        statistics: {},
      };

      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { history: [] } })
        .mockResolvedValueOnce({ success: true, data: mockHistoryItem });

      const { result } = renderHook(() => useFileSystemDiscoveryLogic());

      await act(async () => {
        await result.current.loadHistoryItem('hist-1');
      });

      expect(result.current.result).toBeDefined();
      expect(result.current.shares).toHaveLength(1);
    });
  });
});
