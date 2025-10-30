import { renderHook, act, waitFor } from '@testing-library/react';

import { useDataLossPreventionDiscoveryLogic } from './useDataLossPreventionDiscoveryLogic';

type ProgressCallback = (data: any) => void;

describe('useDataLossPreventionDiscoveryLogic', () => {
  let onProgressCallback: ProgressCallback | undefined;
  let executeModuleMock: jest.Mock;
  let cancelExecutionMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onProgressCallback = undefined;

    executeModuleMock = jest.fn().mockResolvedValue({ success: true, data: {} });
    cancelExecutionMock = jest.fn().mockResolvedValue(undefined);

    const electronAPIMock: any = {
      executeModule: executeModuleMock,
      cancelExecution: cancelExecutionMock,
      onProgress: jest.fn((cb: ProgressCallback) => {
        onProgressCallback = cb;
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

  it('provides initial configuration defaults', () => {
    const { result } = renderHook(() => useDataLossPreventionDiscoveryLogic());

    expect(result.current.config).toMatchObject({
      includePolicies: true,
      includeRules: true,
      includeIncidents: true,
    });
    expect(result.current.isDiscovering).toBe(false);
  });

  it('starts discovery and updates progress', async () => {
    let resolveExecution: ((value: any) => void) | undefined;
    executeModuleMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveExecution = resolve;
        }),
    );

    const { result } = renderHook(() => useDataLossPreventionDiscoveryLogic());

    let startPromise: Promise<unknown> | undefined;
    await act(async () => {
      startPromise = result.current.startDiscovery();
    });

    await waitFor(() => expect(onProgressCallback).toBeDefined());

    const callArgs = executeModuleMock.mock.calls[0][0];

    await act(async () => {
      onProgressCallback?.({
        type: 'dlp-discovery',
        token: callArgs.parameters.cancellationToken,
        current: 50,
        total: 100,
        percentage: 50,
        message: 'Halfway there',
      });
    });

    expect(result.current.progress.percentage).toBe(50);

    await act(async () => {
      resolveExecution?.({ success: true, data: {} });
      await startPromise;
    });

    expect(executeModuleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        modulePath: 'Modules/Discovery/DLPDiscovery.psm1',
        functionName: 'Invoke-DLPDiscovery',
      }),
    );

    expect(result.current.progress.percentage).toBe(100);
    expect(result.current.isDiscovering).toBe(false);
  });

  it('cancels discovery and resets state', async () => {
    let resolveExecution: ((value: any) => void) | undefined;
    let rejectExecution: ((reason: any) => void) | undefined;
    executeModuleMock.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          resolveExecution = resolve;
          rejectExecution = reject;
        }),
    );

    const { result } = renderHook(() => useDataLossPreventionDiscoveryLogic());

    let startPromise: Promise<unknown> | undefined;
    await act(async () => {
      startPromise = result.current.startDiscovery();
    });

    await waitFor(() => expect(onProgressCallback).toBeDefined());

    await act(async () => {
      await result.current.cancelDiscovery();
    });

    expect(cancelExecutionMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      rejectExecution?.(new Error('cancelled'));
      try {
        await startPromise;
      } catch {
        // Expected rejection due to cancellation
      }
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.progress.message).toBe('Cancelled');
  });

  it('updates configuration through helper', () => {
    const { result } = renderHook(() => useDataLossPreventionDiscoveryLogic());

    act(() => {
      result.current.updateConfig({ includePolicies: false });
    });

    expect(result.current.config.includePolicies).toBe(false);
  });
});
