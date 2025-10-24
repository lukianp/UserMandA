/**
 * Unit Tests for useVMwareDiscoveryLogic Hook
 * Ensures VMware discovery logic exposes expected API
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { useVMwareDiscoveryLogic } from './useVMwareDiscoveryLogic';

const mockExecuteModule = jest.fn<(args?: any) => Promise<any>>();
const mockWriteFile = jest.fn<(fileName: string, content: string) => Promise<void>>();

const mockElectronAPI = {
  executeModule: mockExecuteModule,
  writeFile: mockWriteFile,
};

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useVMwareDiscoveryLogic', () => {
  const discoveryResult = {
    hosts: [
      {
        name: 'esxi-01',
        cluster: 'ClusterA',
        status: 'Connected',
        cpu: { totalGHz: 40 },
        memory: { totalGB: 256 },
      },
    ],
    virtualMachines: [
      {
        name: 'vm-app-01',
        status: 'Running',
        cpu: { vcpu: 4 },
        memory: { gb: 16 },
        guestOS: 'Windows Server',
        hostName: 'esxi-01',
        cluster: 'ClusterA',
      },
    ],
    clusters: [{ name: 'ClusterA', status: 'Healthy', hostCount: 1, vmCount: 1 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should initialize with neutral state', () => {
    const { result } = renderHook(() => useVMwareDiscoveryLogic());

    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update configuration', () => {
    const { result } = renderHook(() => useVMwareDiscoveryLogic());

    act(() => {
      result.current.setConfig(prev => ({
        ...prev,
        parallelScans: 10,
      }));
    });

    expect(result.current.config.parallelScans).toBe(10);
  });

  it('should start discovery and populate results', async () => {
    jest.useFakeTimers();
    mockElectronAPI.executeModule.mockResolvedValueOnce({ success: true, data: discoveryResult });

    const { result } = renderHook(() => useVMwareDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    expect(mockElectronAPI.executeModule).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toEqual(discoveryResult);

    jest.useRealTimers();
  });

  it('should surface discovery errors', async () => {
    jest.useFakeTimers();
    mockElectronAPI.executeModule.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useVMwareDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    jest.runOnlyPendingTimers();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed');

    jest.useRealTimers();
  });

  it('should apply templates to config', () => {
    const { result } = renderHook(() => useVMwareDiscoveryLogic());
    const template = result.current.templates[0];

    act(() => {
      result.current.handleApplyTemplate(template);
    });

    expect(result.current.config.includeHosts).toBe(template.config.includeHosts);
  });

  it('should export discovery results', async () => {
    jest.useFakeTimers();
    mockElectronAPI.executeModule.mockResolvedValueOnce({ success: true, data: discoveryResult });
    mockElectronAPI.writeFile.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useVMwareDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    await act(async () => {
      await result.current.handleExport();
    });

    expect(mockElectronAPI.writeFile).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should switch active tab', () => {
    const { result } = renderHook(() => useVMwareDiscoveryLogic());

    act(() => {
      result.current.setActiveTab('vms');
    });

    expect(result.current.activeTab).toBe('vms');
  });
});

