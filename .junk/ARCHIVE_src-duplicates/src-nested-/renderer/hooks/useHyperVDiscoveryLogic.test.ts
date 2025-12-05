import { renderHook, act, waitFor } from '@testing-library/react';

import { useHyperVDiscoveryLogic } from './useHyperVDiscoveryLogic';

type ProgressCallback = (data: any) => void;

describe('useHyperVDiscoveryLogic', () => {
  let progressCallback: ProgressCallback | undefined;
  let executeModuleMock: jest.Mock;
  let cancelExecutionMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    progressCallback = undefined;

    executeModuleMock = jest.fn().mockResolvedValue({ success: true, data: { hosts: [] } });
    cancelExecutionMock = jest.fn().mockResolvedValue(undefined);

    const electronAPIMock: any = {
      executeModule: executeModuleMock,
      cancelExecution: cancelExecutionMock,
      onProgress: jest.fn((cb: ProgressCallback) => {
        progressCallback = cb;
        return jest.fn();
      }),
    };

    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      value: electronAPIMock,
    });
  });

  afterEach(() => {
    delete (window as any).electronAPI;
  });

  it('exposes default configuration and state', () => {
    const { result } = renderHook(() => useHyperVDiscoveryLogic());

    expect(result.current.config).toMatchObject({
      includeVMs: true,
      includeVirtualSwitches: true,
      includeVHDs: true,
    });
    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.activeTab).toBe('overview');
  });

  it('invokes discovery and consumes progress updates', async () => {
    let resolveExecution: ((value: any) => void) | undefined;
    executeModuleMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveExecution = resolve;
        }),
    );

    const { result } = renderHook(() => useHyperVDiscoveryLogic());

    let startPromise: Promise<unknown> | undefined;
    await act(async () => {
      startPromise = result.current.startDiscovery();
    });

    await waitFor(() => expect(progressCallback).toBeDefined());

    const callArgs = executeModuleMock.mock.calls[0][0];

    await act(async () => {
      progressCallback?.({
        type: 'hyperv-discovery',
        token: callArgs.parameters.cancellationToken,
        current: 40,
        total: 100,
        percentage: 40,
        message: 'Scanning hosts',
      });
    });

    expect(result.current.progress.percentage).toBe(40);

    await act(async () => {
      resolveExecution?.({ success: true, data: { hosts: [] } });
      await startPromise;
    });

    expect(executeModuleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        modulePath: 'Modules/Discovery/HyperVDiscovery.psm1',
        functionName: 'Invoke-HyperVDiscovery',
      }),
    );

    expect(result.current.progress.percentage).toBe(100);
    expect(result.current.isDiscovering).toBe(false);
  });

  it('cancels discovery when requested', async () => {
    let resolveExecution: ((value: any) => void) | undefined;
    let rejectExecution: ((reason: any) => void) | undefined;
    executeModuleMock.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          resolveExecution = resolve;
          rejectExecution = reject;
        }),
    );

    const { result } = renderHook(() => useHyperVDiscoveryLogic());

    let startPromise: Promise<unknown> | undefined;
    await act(async () => {
      startPromise = result.current.startDiscovery();
    });

    await waitFor(() => expect(progressCallback).toBeDefined());

    await act(async () => {
      await result.current.cancelDiscovery();
    });

    expect(cancelExecutionMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      rejectExecution?.(new Error('cancelled'));
      try {
        await startPromise;
      } catch {
        // Expected due to cancellation
      }
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.progress.message).toBe('Cancelled');
  });

  it('updates configuration and active tab helpers', () => {
    const { result } = renderHook(() => useHyperVDiscoveryLogic());

    act(() => {
      result.current.updateConfig({ includeVMs: false });
      result.current.setActiveTab('vms');
    });

    expect(result.current.config.includeVMs).toBe(false);
    expect(result.current.activeTab).toBe('vms');
  });
});
