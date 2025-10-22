/**
 * Unit Tests for useSQLServerDiscoveryLogic Hook
 * Validates core discovery workflow and exposed helpers
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { useSQLServerDiscoveryLogic } from './useSQLServerDiscoveryLogic';

const mockElectronAPI = {
  executeModule: jest.fn(),
  writeFile: jest.fn(),
};

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useSQLServerDiscoveryLogic', () => {
  const discoveryResult = {
    instances: [
      { name: 'SQL01', version: '2019', edition: 'Enterprise', status: 'Online', isSysAdmin: true, cluster: null },
    ],
    databases: [
      {
        name: 'AppDB',
        status: 'Online',
        size: { totalMB: 512 },
        lastBackup: { date: new Date().toISOString(), type: 'Full' },
      },
    ],
    backups: [],
    jobs: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSQLServerDiscoveryLogic());

    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update configuration values', () => {
    const { result } = renderHook(() => useSQLServerDiscoveryLogic());

    act(() => {
      result.current.setConfig(prev => ({
        ...prev,
        servers: ['localhost'],
      }));
    });

    expect(result.current.config.servers).toEqual(['localhost']);
  });

  it('should start discovery successfully', async () => {
    jest.useFakeTimers();
    mockElectronAPI.executeModule.mockResolvedValueOnce({ success: true, data: discoveryResult });

    const { result } = renderHook(() => useSQLServerDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    expect(mockElectronAPI.executeModule).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toEqual(discoveryResult);

    jest.useRealTimers();
  });

  it('should surface errors when discovery fails', async () => {
    jest.useFakeTimers();
    mockElectronAPI.executeModule.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useSQLServerDiscoveryLogic());

    await act(async () => {
      await result.current.handleStartDiscovery();
    });

    jest.runOnlyPendingTimers();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed');

    jest.useRealTimers();
  });

  it('should apply templates to configuration', () => {
    const { result } = renderHook(() => useSQLServerDiscoveryLogic());
    const template = result.current.templates[0];

    act(() => {
      result.current.handleApplyTemplate(template);
    });

    expect(result.current.config.parallelScans).toBe(template.config.parallelScans);
  });

  it('should export results when available', async () => {
    jest.useFakeTimers();
    mockElectronAPI.executeModule.mockResolvedValueOnce({ success: true, data: discoveryResult });
    mockElectronAPI.writeFile.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSQLServerDiscoveryLogic());

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
    const { result } = renderHook(() => useSQLServerDiscoveryLogic());

    act(() => {
      result.current.setActiveTab('databases');
    });

    expect(result.current.activeTab).toBe('databases');
  });
});
