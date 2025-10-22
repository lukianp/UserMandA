/**
 * Unit Tests for usePowerPlatformDiscoveryLogic Hook
 * Validates contract of Power Platform discovery logic
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { usePowerPlatformDiscoveryLogic } from './usePowerPlatformDiscoveryLogic';

type ProgressCallback = (data: any) => void;

const mockElectronAPI = {
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  onProgress: jest.fn(() => jest.fn()),
};

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('usePowerPlatformDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.executeModule.mockResolvedValue({ success: true, data: {} });
  });

  it('should initialize with expected defaults', () => {
    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.activeTab).toBe('overview');
  });

  it('should start discovery successfully', async () => {
    const discoveryPayload = { environments: [], apps: [], flows: [] };
    mockElectronAPI.executeModule.mockResolvedValueOnce({ success: true, data: discoveryPayload });

    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.result).toEqual(discoveryPayload);
  });

  it('should capture discovery errors', async () => {
    const errorMessage = 'Discovery failed';
    mockElectronAPI.executeModule.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle progress updates', async () => {
    let progressHandler: ProgressCallback | undefined;
    let capturedToken: string | undefined;
    mockElectronAPI.onProgress.mockImplementation((cb: ProgressCallback) => {
      progressHandler = cb;
      return jest.fn();
    });

    mockElectronAPI.executeModule.mockImplementationOnce(async (args: any) => {
      capturedToken = args?.parameters?.CancellationToken;
      return { success: true, data: {} };
    });

    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    if (progressHandler && capturedToken) {
      act(() => {
        progressHandler({
          type: 'powerplatform-discovery',
          token: capturedToken,
          current: 6,
          total: 10,
          percentage: 60,
          message: 'Processing...',
        });
      });

      expect(result.current.progress.percentage).toBe(60);
    }
  });

  it('should cancel discovery when requested', async () => {
    mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    await act(async () => {
      await result.current.cancelDiscovery();
    });

    expect(mockElectronAPI.cancelExecution).toHaveBeenCalled();
  });

  it('should update configuration', () => {
    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    act(() => {
      result.current.updateConfig({ tenantId: '0000-1111' });
    });

    expect(result.current.config.tenantId).toBe('0000-1111');
  });

  it('should update active tab', () => {
    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    act(() => {
      result.current.setActiveTab('apps');
    });

    expect(result.current.activeTab).toBe('apps');
  });

  it('should expose export helpers', () => {
    const { result } = renderHook(() => usePowerPlatformDiscoveryLogic());

    expect(typeof result.current.exportToCSV).toBe('function');
    expect(typeof result.current.exportToExcel).toBe('function');
  });
});
