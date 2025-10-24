/**
 * Unit Tests for useOffice365DiscoveryLogic Hook
 * Validates exposed API and core state transitions
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { useOffice365DiscoveryLogic } from './useOffice365DiscoveryLogic';

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

describe('useOffice365DiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteModule.mockImplementation(async (args: any) => {
      const fn = args?.functionName;
      if (fn === 'Get-Office365DiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (fn === 'Get-Office365DiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });
  });

  it('should initialize with expected defaults', () => {
    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.currentResult).toBeNull();
    expect(result.current.errors).toEqual([]);
    expect(result.current.selectedTab).toBe('overview');
  });

  it('should start discovery and store result', async () => {
    const discoveryPayload = { summary: { totalUsers: 10 } };
    mockExecuteModule.mockImplementation(async (args: any) => {
      const functionName = args?.functionName;
      if (functionName === 'Invoke-Office365Discovery') {
        return { success: true, data: discoveryPayload };
      }

      if (functionName === 'Get-Office365DiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-Office365DiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });

    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.currentResult).toEqual(discoveryPayload);
  });

  it('should capture errors when discovery fails', async () => {
    const errorMessage = 'Discovery failed';
    mockExecuteModule.mockImplementation(async (args: any) => {
      const functionName = args?.functionName;
      if (functionName === 'Invoke-Office365Discovery') {
        throw new Error(errorMessage);
      }

      if (functionName === 'Get-Office365DiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-Office365DiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });

    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.errors).toContain(errorMessage);
  });

  it('should react to progress updates', async () => {
    let progressHandler: ProgressCallback | undefined;
    mockOnProgress.mockImplementation((cb: ProgressCallback) => {
      progressHandler = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    if (progressHandler) {
      const handler = progressHandler;

      act(() => {
        handler({
          type: 'office365-discovery',
          resultId: 'result-1',
          phase: 'users',
          currentOperation: 'Fetching users',
          progress: 50,
          objectsProcessed: 100,
          estimatedTimeRemaining: 120,
          message: 'Halfway there',
        });
      });

      expect(result.current.progress?.progress).toBe(50);
    }
  });

  it('should cancel discovery when requested', async () => {
    mockCancelExecution.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    await act(async () => {
      await result.current.cancelDiscovery();
    });

    expect(mockCancelExecution).toHaveBeenCalled();
  });

  it('should update configuration', () => {
    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    act(() => {
      result.current.updateConfig({ tenantDomain: 'contoso.com' });
    });

    expect(result.current.config.tenantDomain).toBe('contoso.com');
  });

  it('should switch selected tab', () => {
    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    act(() => {
      result.current.setSelectedTab('users');
    });

    expect(result.current.selectedTab).toBe('users');
  });

  it('should expose export helper', () => {
    const { result } = renderHook(() => useOffice365DiscoveryLogic());

    expect(typeof result.current.exportResults).toBe('function');
  });
});

