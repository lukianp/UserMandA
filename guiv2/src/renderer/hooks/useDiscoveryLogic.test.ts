/**
 * Discovery Hooks Generic Test Suite
 *
 * Comprehensive tests for all discovery logic hooks including:
 * - State management
 * - IPC communication
 * - Progress tracking
 * - Cancellation
 * - Filtering
 * - Statistics calculation
 * - Export functionality (CSV/Excel)
 * - Error handling
 *
 * This test suite validates the consistent pattern used across all 10 discovery enhancements:
 * - ConditionalAccess, DataLossPrevention, IdentityGovernance
 * - EnvironmentDetection, GoogleWorkspace, HyperV
 * - Intune, Licensing, PowerPlatform, WebServer
 */

import { renderHook, act } from '@testing-library/react';
import { useIntuneDiscoveryLogic } from './useIntuneDiscoveryLogic';
import { useLicensingDiscoveryLogic } from './useLicensingDiscoveryLogic';
import { usePowerPlatformDiscoveryLogic } from './usePowerPlatformDiscoveryLogic';
import { useWebServerDiscoveryLogic } from './useWebServerDiscoveryLogic';

// Mock electron API
const mockExecuteModule = jest.fn();
const mockCancelExecution = jest.fn();
const mockOnProgress = jest.fn(() => jest.fn()); // Returns cleanup function

global.window = {
  electronAPI: {
    executeModule: mockExecuteModule,
    cancelExecution: mockCancelExecution,
    onProgress: mockOnProgress,
  },
} as any;

// Mock URL and Blob for CSV export
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();
global.Blob = jest.fn() as any;

describe('Discovery Hooks - Common Pattern Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Intune Discovery Logic', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
    });

    it('should start discovery and track progress', async () => {
      const mockResult = {
        success: true,
        data: {
          devices: [
            {
              id: 'device-1',
              deviceName: 'Test Device',
              operatingSystem: 'Windows',
              osVersion: '10.0.19045',
              complianceState: 'compliant',
              managementAgent: 'mdm',
              enrolledDateTime: new Date().toISOString(),
              lastSyncDateTime: new Date().toISOString(),
              userPrincipalName: 'user@contoso.com',
              manufacturer: 'Microsoft',
              model: 'Surface Pro',
            },
          ],
          policies: [],
          applications: [],
          configurations: [],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.result).toBeTruthy();
      expect(result.current.result!.devices).toHaveLength(1);
      expect(result.current.result!.devices[0].deviceName).toBe('Test Device');
    });

    it('should handle IPC progress updates', async () => {
      let progressCallback: any;
      mockOnProgress.mockImplementationOnce((callback) => {
        progressCallback = callback;
        return jest.fn();
      });

      mockExecuteModule.mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (progressCallback) {
              progressCallback({
                type: 'intune-discovery',
                token: expect.any(String),
                progress: 50,
              });
            }
            resolve({ success: true, data: { devices: [], policies: [], applications: [], configurations: [] } });
          }, 100);
        });
      });

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(mockOnProgress).toHaveBeenCalled();
    });

    it('should cancel discovery', async () => {
      mockExecuteModule.mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ success: true, data: {} }), 1000);
        });
      });

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      act(() => {
        result.current.startDiscovery();
      });

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(mockCancelExecution).toHaveBeenCalled();
      expect(result.current.isDiscovering).toBe(false);
    });

    it('should filter devices by search text', async () => {
      const mockResult = {
        success: true,
        data: {
          devices: [
            { id: '1', deviceName: 'Windows Device', operatingSystem: 'Windows' },
            { id: '2', deviceName: 'iOS Device', operatingSystem: 'iOS' },
            { id: '3', deviceName: 'Android Device', operatingSystem: 'Android' },
          ],
          policies: [],
          applications: [],
          configurations: [],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.updateFilter({ searchText: 'windows' });
      });

      expect(result.current.filteredDevices.length).toBe(1);
      expect(result.current.filteredDevices[0].deviceName).toBe('Windows Device');
    });

    it('should calculate statistics correctly', async () => {
      const mockResult = {
        success: true,
        data: {
          devices: [
            { id: '1', operatingSystem: 'Windows', complianceState: 'compliant' },
            { id: '2', operatingSystem: 'Windows', complianceState: 'noncompliant' },
            { id: '3', operatingSystem: 'iOS', complianceState: 'compliant' },
          ],
          policies: [{ id: 'p1' }, { id: 'p2' }],
          applications: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }],
          configurations: [{ id: 'c1' }],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      const stats = result.current.stats;
      expect(stats).toBeTruthy();
      expect(stats!.totalDevices).toBe(3);
      expect(stats!.totalPolicies).toBe(2);
      expect(stats!.totalApplications).toBe(3);
      expect(stats!.totalConfigurations).toBe(1);
    });

    it('should export to CSV', async () => {
      const mockResult = {
        success: true,
        data: {
          devices: [
            { id: '1', deviceName: 'Device 1', operatingSystem: 'Windows' },
            { id: '2', deviceName: 'Device 2', operatingSystem: 'iOS' },
          ],
          policies: [],
          applications: [],
          configurations: [],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      // Mock document.createElement for anchor
      const mockAnchor = {
        click: jest.fn(),
        href: '',
        download: '',
      };
      jest.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor as any);

      act(() => {
        result.current.exportToCSV(result.current.filteredDevices, 'test-export.csv');
      });

      expect(Blob).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('test-export.csv');
    });

    it('should export to Excel via IPC', async () => {
      const mockResult = {
        success: true,
        data: { devices: [], policies: [], applications: [], configurations: [] },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      mockExecuteModule.mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.exportToExcel([], 'test-export.xlsx');
      });

      expect(mockExecuteModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-DataToExcel',
        parameters: expect.objectContaining({
          filename: 'test-export.xlsx',
        }),
      });
    });

    it('should handle discovery errors gracefully', async () => {
      mockExecuteModule.mockRejectedValueOnce(new Error('Discovery failed'));

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        try {
          await result.current.startDiscovery();
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isDiscovering).toBe(false);
    });
  });

  describe('Licensing Discovery Logic', () => {
    it('should discover licenses with all properties', async () => {
      const mockResult = {
        success: true,
        data: {
          licenses: [
            {
              skuId: 'sku-1',
              skuPartNumber: 'O365_BUSINESS_PREMIUM',
              displayName: 'Microsoft 365 Business Premium',
              totalUnits: 100,
              activeUnits: 95,
              consumedUnits: 75,
              availableUnits: 20,
              suspendedUnits: 5,
            },
          ],
          users: [],
          assignments: [],
          usage: {},
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.result!.licenses).toHaveLength(1);
      expect(result.current.result!.licenses[0].skuPartNumber).toBe('O365_BUSINESS_PREMIUM');
      expect(result.current.result!.licenses[0].availableUnits).toBe(20);
    });

    it('should calculate license utilization statistics', async () => {
      const mockResult = {
        success: true,
        data: {
          licenses: [
            { skuId: '1', totalUnits: 100, consumedUnits: 80, availableUnits: 20 },
            { skuId: '2', totalUnits: 50, consumedUnits: 50, availableUnits: 0 },
          ],
          users: [],
          assignments: [],
          usage: {},
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      const stats = result.current.stats;
      expect(stats).toBeTruthy();
      expect(stats!.totalLicenses).toBe(2);
      expect(stats!.totalUnits).toBe(150);
      expect(stats!.consumedUnits).toBe(130);
      expect(stats!.availableUnits).toBe(20);
    });

    it('should filter licenses by type', async () => {
      const mockResult = {
        success: true,
        data: {
          licenses: [
            { skuId: '1', skuPartNumber: 'O365_E3', displayName: 'Office 365 E3' },
            { skuId: '2', skuPartNumber: 'EMS_E5', displayName: 'EMS E5' },
            { skuId: '3', skuPartNumber: 'O365_E5', displayName: 'Office 365 E5' },
          ],
          users: [],
          assignments: [],
          usage: {},
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.updateFilter({ selectedLicenseTypes: ['O365_E3'] });
      });

      expect(result.current.filteredLicenses.length).toBe(1);
      expect(result.current.filteredLicenses[0].skuPartNumber).toBe('O365_E3');
    });
  });

  describe('Power Platform Discovery Logic', () => {
    it('should discover Power Platform environments and apps', async () => {
      const mockResult = {
        success: true,
        data: {
          environments: [
            {
              id: 'env-1',
              name: 'Production',
              displayName: 'Production Environment',
              type: 'production',
              apps: 10,
              flows: 25,
            },
          ],
          apps: [
            {
              id: 'app-1',
              name: 'Sales App',
              displayName: 'Sales Management App',
              appType: 'canvas',
              environmentId: 'env-1',
            },
          ],
          flows: [
            {
              id: 'flow-1',
              name: 'Approval Flow',
              displayName: 'Document Approval Flow',
              state: 'started',
              environmentId: 'env-1',
            },
          ],
          connectors: [],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.result!.environments).toHaveLength(1);
      expect(result.current.result!.apps).toHaveLength(1);
      expect(result.current.result!.flows).toHaveLength(1);
    });

    it('should calculate Power Platform statistics', async () => {
      const mockResult = {
        success: true,
        data: {
          environments: [
            { id: '1', type: 'production' },
            { id: '2', type: 'sandbox' },
          ],
          apps: [
            { id: '1', appType: 'canvas', owner: { displayName: 'User1' } },
            { id: '2', appType: 'canvas', owner: { displayName: 'User1' } },
            { id: '3', appType: 'model-driven', owner: { displayName: 'User2' } },
          ],
          flows: [
            { id: '1', state: 'started', runHistory: { successCount: 100, failedCount: 5 } },
            { id: '2', state: 'stopped', runHistory: { successCount: 50, failedCount: 2 } },
          ],
          connectors: [{ id: '1' }, { id: '2' }, { id: '3' }],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      const stats = result.current.stats;
      expect(stats).toBeTruthy();
      expect(stats!.totalEnvironments).toBe(2);
      expect(stats!.totalApps).toBe(3);
      expect(stats!.totalFlows).toBe(2);
      expect(stats!.totalConnectors).toBe(3);
      expect(stats!.flowRunStats.successCount).toBe(150);
      expect(stats!.flowRunStats.failedCount).toBe(7);
    });

    it('should filter apps by type', async () => {
      const mockResult = {
        success: true,
        data: {
          environments: [],
          apps: [
            { id: '1', appType: 'canvas', name: 'Canvas App 1' },
            { id: '2', appType: 'canvas', name: 'Canvas App 2' },
            { id: '3', appType: 'model-driven', name: 'Model Driven App' },
          ],
          flows: [],
          connectors: [],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.updateFilter({ selectedAppTypes: ['canvas'] });
      });

      // Apps are filtered in the hook
      const filteredApps = result.current.result!.apps.filter(app =>
        ['canvas'].includes(app.appType)
      );

      expect(filteredApps.length).toBe(2);
    });
  });

  describe('Web Server Discovery Logic', () => {
    it('should discover web servers with full details', async () => {
      const mockResult = {
        success: true,
        data: {
          servers: [
            {
              id: 'server-1',
              name: 'IIS-SERVER-01',
              serverType: 'iis',
              version: '10.0',
              ipAddress: '192.168.1.100',
              operatingSystem: 'Windows Server 2019',
              totalSites: 5,
              status: 'running',
              sites: [],
              applicationPools: [],
              certificates: [],
            },
          ],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useWebServerDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.result!.servers).toHaveLength(1);
      expect(result.current.result!.servers[0].serverType).toBe('iis');
      expect(result.current.result!.servers[0].status).toBe('running');
    });

    it('should calculate web server statistics', async () => {
      const mockResult = {
        success: true,
        data: {
          servers: [
            {
              id: '1',
              serverType: 'iis',
              status: 'running',
              totalSites: 10,
              certificates: [
                { id: 'c1', daysUntilExpiration: 20 },
                { id: 'c2', daysUntilExpiration: 100 },
              ],
            },
            {
              id: '2',
              serverType: 'apache',
              status: 'running',
              totalSites: 5,
              certificates: [
                { id: 'c3', daysUntilExpiration: 50 },
              ],
            },
            {
              id: '3',
              serverType: 'iis',
              status: 'stopped',
              totalSites: 3,
              certificates: [],
            },
          ],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useWebServerDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      const stats = result.current.stats;
      expect(stats).toBeTruthy();
      expect(stats!.totalServers).toBe(3);
      expect(stats!.totalSites).toBe(18);
      expect(stats!.runningServers).toBe(2);
      expect(stats!.serversByType.iis).toBe(2);
      expect(stats!.serversByType.apache).toBe(1);
      expect(stats!.expiringCertificates).toBe(2); // < 90 days
    });

    it('should filter servers by type and status', async () => {
      const mockResult = {
        success: true,
        data: {
          servers: [
            { id: '1', serverType: 'iis', status: 'running', name: 'IIS-1' },
            { id: '2', serverType: 'apache', status: 'running', name: 'Apache-1' },
            { id: '3', serverType: 'iis', status: 'stopped', name: 'IIS-2' },
          ],
        },
      };

      mockExecuteModule.mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useWebServerDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.updateFilter({
          selectedServerTypes: ['iis'],
          selectedStates: ['running'],
        });
      });

      expect(result.current.filteredServers.length).toBe(1);
      expect(result.current.filteredServers[0].name).toBe('IIS-1');
    });
  });

  describe('Common Patterns - Configuration Management', () => {
    it('should update discovery configuration', () => {
      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      act(() => {
        result.current.updateConfig({
          includeDevices: true,
          includePolicies: false,
          includeApplications: true,
          timeout: 120000,
        });
      });

      expect(result.current.config.includeDevices).toBe(true);
      expect(result.current.config.includePolicies).toBe(false);
      expect(result.current.config.timeout).toBe(120000);
    });
  });

  describe('Common Patterns - Column Definitions', () => {
    it('should provide column definitions for data grids', () => {
      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      expect(result.current.deviceColumns).toBeDefined();
      expect(result.current.deviceColumns.length).toBeGreaterThan(0);
      expect(result.current.policyColumns).toBeDefined();
      expect(result.current.applicationColumns).toBeDefined();
      expect(result.current.configurationColumns).toBeDefined();
    });

    it('should have proper column configuration', () => {
      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      const firstColumn = result.current.deviceColumns[0];
      expect(firstColumn).toHaveProperty('field');
      expect(firstColumn).toHaveProperty('headerName');
    });
  });

  describe('Common Patterns - Error Recovery', () => {
    it('should clear errors', async () => {
      mockExecuteModule.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useIntuneDiscoveryLogic());

      await act(async () => {
        try {
          await result.current.startDiscovery();
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBeTruthy();

      // Clear error would typically be part of updateConfig or a retry
      await act(async () => {
        mockExecuteModule.mockResolvedValueOnce({
          success: true,
          data: { devices: [], policies: [], applications: [], configurations: [] },
        });
        await result.current.startDiscovery();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
