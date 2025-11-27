import { renderHook, act } from '@testing-library/react';

import { useAWSDiscoveryLogic } from './useAWSDiscoveryLogic';

type DiscoveryCallback = (data: any) => void;

describe('useAWSDiscoveryLogic', () => {
  let completeCallback: DiscoveryCallback | undefined;

  beforeEach(() => {
    completeCallback = undefined;

    const electronMock: any = {
      executeDiscovery: jest.fn().mockResolvedValue(undefined),
      cancelDiscovery: jest.fn(),
      onDiscoveryProgress: jest.fn(() => jest.fn()),
      onDiscoveryOutput: jest.fn(() => jest.fn()),
      onDiscoveryComplete: jest.fn((cb: DiscoveryCallback) => {
        completeCallback = cb;
        return jest.fn();
      }),
      onDiscoveryError: jest.fn(() => jest.fn()),
    };

    const electronAPIMock: any = {
      cancelExecution: jest.fn().mockResolvedValue(undefined),
      executeModule: jest.fn().mockResolvedValue({ success: true, data: {} }),
    };

    Object.defineProperty(window, 'electron', {
      configurable: true,
      value: electronMock,
    });

    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      value: electronAPIMock,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete (window as any).electron;
    delete (window as any).electronAPI;
  });

  it('starts discovery and handles completion events', async () => {
    const { result } = renderHook(() => useAWSDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    const executeCall = ((window as any).electron.executeDiscovery as jest.Mock).mock.calls[0][0];

    expect(((window as any).electron).executeDiscovery).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleName: 'AWSDiscovery',
        executionId: expect.stringMatching(/^aws-discovery-/),
      }),
    );
    expect(result.current.isDiscovering).toBe(true);

    act(() => {
      completeCallback?.({
        executionId: executeCall.executionId,
        result: { resources: [] },
      });
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.result).not.toBeNull();
  });

  it('cancels discovery when requested', async () => {
    const { result } = renderHook(() => useAWSDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    await act(async () => {
      await result.current.cancelDiscovery();
    });

    expect(((window as any).electronAPI).cancelExecution).toHaveBeenCalledTimes(1);
    expect(result.current.isDiscovering).toBe(false);
  });
});
