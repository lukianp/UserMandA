/**
 * Unit Tests for useOneDriveDiscoveryLogic Hook
 * Ensures core API and state transitions behave as expected
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { useOneDriveDiscoveryLogic } from './useOneDriveDiscoveryLogic';

type ProgressCallback = (data: any) => void;

const mockExecuteModule = jest.fn<(args?: any) => Promise<any>>();
const mockCancelExecution = jest.fn<(token?: string) => Promise<void>>();
const mockOnProgress = jest.fn<(cb: ProgressCallback) => () => void>();

const mockElectronAPI = {
  executeModule: mockExecuteModule,
  cancelExecution: mockCancelExecution,
  onProgress: mockOnProgress,
};

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useOneDriveDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteModule.mockImplementation(async (args: any) => {
      const functionName = args?.functionName;
      if (functionName === 'Get-OneDriveDiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-OneDriveDiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });
  });

  it('should initialize with expected defaults', () => {
    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.currentResult).toBeNull();
    expect(result.current.errors).toEqual([]);
    expect(result.current.selectedTab).toBe('overview');
  });

  it('should start discovery and capture results', async () => {
    const discoveryPayload = { drives: [], summary: { totalFiles: 0 } };
    mockElectronAPI.executeModule.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'Invoke-OneDriveDiscovery') {
        return { success: true, data: discoveryPayload };
      }

      if (functionName === 'Get-OneDriveDiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-OneDriveDiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });

    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.currentResult).toEqual(discoveryPayload);
  });

  it('should record discovery errors', async () => {
    const errorMessage = 'Discovery failed';
    mockElectronAPI.executeModule.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'Invoke-OneDriveDiscovery') {
        throw new Error(errorMessage);
      }

      if (functionName === 'Get-OneDriveDiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-OneDriveDiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });

    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.errors).toContain(errorMessage);
    expect(result.current.isDiscovering).toBe(false);
  });

  it('should apply progress updates', () => {
    let progressHandler: ProgressCallback | undefined;
    mockElectronAPI.onProgress.mockImplementation((cb: ProgressCallback) => {
      progressHandler = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    if (progressHandler) {
      const handler = progressHandler;

      act(() => {
        handler({
          type: 'onedrive-discovery',
          timestamp: new Date().toISOString(),
          currentPhase: 'discovering-files',
          phaseProgress: 40,
          overallProgress: 25,
          currentOperation: 'Fetching data...',
          currentItem: null,
          accountsProcessed: 5,
          filesProcessed: 10,
          sharesProcessed: 2,
          errorsEncountered: 0,
          warningsEncountered: 0,
          itemsPerSecond: 3,
          estimatedTimeRemaining: 120,
          canCancel: true,
          isPaused: false,
        });
      });

      expect(result.current.progress?.overallProgress).toBe(25);
    }
  });

  it('should cancel discovery', async () => {
    mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    await act(async () => {
      await result.current.cancelDiscovery();
    });

    expect(mockElectronAPI.cancelExecution).toHaveBeenCalled();
  });

  it('should update configuration', () => {
    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    act(() => {
      result.current.updateConfig({ includePersonalOneDrive: false });
    });

    expect(result.current.config.includePersonalOneDrive).toBe(false);
  });

  it('should switch selected tab', () => {
    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    act(() => {
      result.current.setSelectedTab('files');
    });

    expect(result.current.selectedTab).toBe('files');
  });

  it('should expose export helper', () => {
    const { result } = renderHook(() => useOneDriveDiscoveryLogic());

    expect(typeof result.current.exportResults).toBe('function');
  });
});

