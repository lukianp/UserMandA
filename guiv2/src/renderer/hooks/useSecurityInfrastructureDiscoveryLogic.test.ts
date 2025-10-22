/**
 * Unit Tests for useSecurityInfrastructureDiscoveryLogic Hook
 * Verifies key state transitions and exposed API
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { useSecurityInfrastructureDiscoveryLogic } from './useSecurityInfrastructureDiscoveryLogic';

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

describe('useSecurityInfrastructureDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.executeModule.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'Get-SecurityDiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-SecurityDiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });
  });

  it('should initialize with expected defaults', () => {
    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.currentResult).toBeNull();
    expect(result.current.errors).toEqual([]);
    expect(result.current.selectedTab).toBe('overview');
  });

  it('should start discovery and capture results', async () => {
    const discoveryPayload = { assets: [], vulnerabilities: [] };
    mockElectronAPI.executeModule.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'Invoke-SecurityInfrastructureDiscovery') {
        return { success: true, data: discoveryPayload };
      }

      if (functionName === 'Get-SecurityDiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-SecurityDiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });

    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.currentResult).toEqual(discoveryPayload);
    expect(result.current.isDiscovering).toBe(false);
  });

  it('should record discovery errors', async () => {
    const errorMessage = 'Discovery failed';
    mockElectronAPI.executeModule.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'Invoke-SecurityInfrastructureDiscovery') {
        throw new Error(errorMessage);
      }

      if (functionName === 'Get-SecurityDiscoveryTemplates') {
        return { success: true, data: { templates: [] } };
      }

      if (functionName === 'Get-SecurityDiscoveryHistory') {
        return { success: true, data: { results: [] } };
      }

      return { success: true, data: {} };
    });

    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.errors).toContain(errorMessage);
    expect(result.current.isDiscovering).toBe(false);
  });

  it('should update progress when events arrive', () => {
    let progressHandler: ProgressCallback | undefined;
    mockElectronAPI.onProgress.mockImplementation((cb: ProgressCallback) => {
      progressHandler = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    if (progressHandler) {
      act(() => {
        progressHandler({
          type: 'security-discovery',
          timestamp: new Date().toISOString(),
          currentPhase: 'analyzing',
          phaseProgress: 85,
          overallProgress: 80,
          currentOperation: 'Almost done',
          currentItem: null,
          devicesProcessed: 10,
          policiesProcessed: 5,
          incidentsProcessed: 2,
          vulnerabilitiesProcessed: 1,
          errorsEncountered: 0,
          warningsEncountered: 0,
          itemsPerSecond: 4,
          estimatedTimeRemaining: 45,
          canCancel: true,
          isPaused: false,
        });
      });

      expect(result.current.progress?.overallProgress).toBe(80);
    }
  });

  it('should cancel discovery when requested', async () => {
    mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    await act(async () => {
      await result.current.cancelDiscovery();
    });

    expect(mockElectronAPI.cancelExecution).toHaveBeenCalled();
  });

  it('should update configuration', () => {
    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    act(() => {
      result.current.updateConfig({ includeOfflineDevices: false });
    });

    expect(result.current.config.includeOfflineDevices).toBe(false);
  });

  it('should switch selected tab', () => {
    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    act(() => {
      result.current.setSelectedTab('vulnerabilities');
    });

    expect(result.current.selectedTab).toBe('vulnerabilities');
  });

  it('should expose export helper', () => {
    const { result } = renderHook(() => useSecurityInfrastructureDiscoveryLogic());

    expect(typeof result.current.exportResults).toBe('function');
  });
});
