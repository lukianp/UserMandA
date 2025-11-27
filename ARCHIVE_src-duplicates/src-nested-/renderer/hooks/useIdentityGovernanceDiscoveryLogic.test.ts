import { renderHook, act, waitFor } from '@testing-library/react';

import { useIdentityGovernanceDiscoveryLogic } from './useIdentityGovernanceDiscoveryLogic';

type ProgressCallback = (data: any) => void;

describe('useIdentityGovernanceDiscoveryLogic', () => {
  let progressCallback: ProgressCallback | undefined;
  let executeModuleMock: jest.Mock;
  let cancelExecutionMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    progressCallback = undefined;

    executeModuleMock = jest.fn().mockResolvedValue({ success: true, data: { accessReviews: [] } });
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

  it('exposes baseline configuration and state', () => {
    const { result } = renderHook(() => useIdentityGovernanceDiscoveryLogic());

    expect(result.current.config).toMatchObject({
      includeAccessReviews: true,
      includeEntitlements: true,
      includePIM: true,
    });
    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.activeTab).toBe('overview');
  });

  it('starts discovery and handles progress updates', async () => {
    let resolveExecution: ((value: any) => void) | undefined;
    executeModuleMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveExecution = resolve;
        }),
    );

    const { result } = renderHook(() => useIdentityGovernanceDiscoveryLogic());

    let startPromise: Promise<unknown> | undefined;
    await act(async () => {
      startPromise = result.current.startDiscovery();
    });

    await waitFor(() => expect(progressCallback).toBeDefined());

    const callArgs = executeModuleMock.mock.calls[0][0];

    await act(async () => {
      progressCallback?.({
        type: 'ig-discovery',
        token: callArgs.parameters.cancellationToken,
        current: 20,
        total: 100,
        percentage: 20,
        message: 'Gathering access reviews',
      });
    });

    expect(result.current.progress.percentage).toBe(20);

    await act(async () => {
      resolveExecution?.({ success: true, data: { accessReviews: [] } });
      await startPromise;
    });

    expect(executeModuleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        modulePath: 'Modules/Discovery/IdentityGovernanceDiscovery.psm1',
        functionName: 'Invoke-IGDiscovery',
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

    const { result } = renderHook(() => useIdentityGovernanceDiscoveryLogic());

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
        // Expected rejection after cancellation
      }
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.progress.message).toBe('Cancelled by user');
  });

  it('updates configuration and active tab helpers', () => {
    const { result } = renderHook(() => useIdentityGovernanceDiscoveryLogic());

    act(() => {
      result.current.updateConfig({ includeAccessReviews: false });
      result.current.setActiveTab('access-reviews');
    });

    expect(result.current.config.includeAccessReviews).toBe(false);
    expect(result.current.activeTab).toBe('access-reviews');
  });
});
