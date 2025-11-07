/**
 * Unit Tests for useNetworkDiscoveryLogic Hook
 * Tests core business logic for network discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { useNetworkDiscoveryLogic } from './useNetworkDiscoveryLogic';

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

describe('useNetworkDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should initialize with expected default state', () => {
    const { result } = renderHook(() => useNetworkDiscoveryLogic());

    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.activeTab).toBe('overview');
  });

  it('should update configuration', () => {
    const { result } = renderHook(() => useNetworkDiscoveryLogic());

    act(() => {
      result.current.setConfig(prev => ({
        ...prev,
        subnets: ['10.0.0.0/24'],
      }));
    });

    expect(result.current.config.subnets).toEqual(['10.0.0.0/24']);
  });

  it('should start discovery successfully', async () => {
    jest.useFakeTimers();
    const discoveryData = { devices: [], subnets: [], ports: [] };
    mockExecuteModule.mockImplementation(async () => {
      jest.advanceTimersByTime(1000);
      return {
        success: true,
        data: discoveryData,
      };
    });

    const { result } = renderHook(() => useNetworkDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    expect(mockExecuteModule).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toEqual(discoveryData);

    jest.useRealTimers();
  });

  it('should surface errors when discovery fails', async () => {
    jest.useFakeTimers();
    mockExecuteModule.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useNetworkDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    jest.runOnlyPendingTimers();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed');

    jest.useRealTimers();
  });

  it('should apply template configuration', () => {
    const { result } = renderHook(() => useNetworkDiscoveryLogic());
    const template = result.current.templates[0];

    act(() => {
      result.current.handleApplyTemplate(template);
    });

    expect((result.current.config as any).name).toBe(template.name);
  });

  it('should switch active tab', () => {
    const { result } = renderHook(() => useNetworkDiscoveryLogic());

    act(() => {
      result.current.setActiveTab('devices');
    });

    expect(result.current.activeTab).toBe('devices');
  });

  it('should export results when available', async () => {
    jest.useFakeTimers();
    const discoveryData = {
      devices: [
        {
          hostname: 'router-1',
          ipAddress: '10.0.0.1',
          status: 'Online',
          type: 'Router',
          operatingSystem: 'IOS',
          manufacturer: 'Cisco',
          model: '2901',
          macAddress: 'AA:BB:CC:DD:EE:FF',
        },
      ],
      subnets: [],
      ports: [],
      vulnerabilities: [],
    };
    mockExecuteModule.mockResolvedValueOnce({
      success: true,
      data: discoveryData,
    });
    mockWriteFile.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useNetworkDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    await act(async () => {
      await result.current.handleExport();
    });

    expect(mockWriteFile).toHaveBeenCalled();

    jest.useRealTimers();
  });
});

