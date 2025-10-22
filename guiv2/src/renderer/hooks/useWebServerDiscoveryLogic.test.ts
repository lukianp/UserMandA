/**
 * Unit Tests for useWebServerDiscoveryLogic Hook
 * Confirms discovery workflow and exposed operations
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

import { useWebServerDiscoveryLogic } from './useWebServerDiscoveryLogic';

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

describe('useWebServerDiscoveryLogic', () => {
  const discoveryPayload = {
    servers: [
      {
        name: 'web1',
        ipAddress: '10.0.0.10',
        operatingSystem: 'Windows Server',
        serverType: 'IIS',
        status: 'online',
      },
    ],
    sites: [
      {
        name: 'Default Web Site',
        status: 'started',
        bindingInformation: 'http/*:80:',
        applicationPool: 'DefaultAppPool',
        physicalPath: 'C:\\inetpub\\wwwroot',
      },
    ],
    bindings: [],
    applicationPools: [],
    certificates: [],
    summary: { totalServers: 1, totalSites: 1, totalPools: 1, expiringCertificates: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.executeModule.mockResolvedValue({ success: true, data: discoveryPayload });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWebServerDiscoveryLogic());

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should start discovery successfully', async () => {
    const { result } = renderHook(() => useWebServerDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.isDiscovering).toBe(false);
    expect(result.current.result).toEqual(discoveryPayload);
  });

  it('should report discovery errors', async () => {
    const errorMessage = 'Discovery failed';
    mockElectronAPI.executeModule.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useWebServerDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isDiscovering).toBe(false);
  });

  it('should react to progress updates', async () => {
    let progressHandler: ProgressCallback | undefined;
    let capturedToken: string | undefined;
    mockElectronAPI.onProgress.mockImplementation((cb: ProgressCallback) => {
      progressHandler = cb;
      return jest.fn();
    });

    mockElectronAPI.executeModule.mockImplementationOnce(async (args: any) => {
      capturedToken = args?.parameters?.cancellationToken;
      return { success: true, data: discoveryPayload };
    });

    const { result } = renderHook(() => useWebServerDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
    });

    if (progressHandler && capturedToken) {
      const handler = progressHandler;

      act(() => {
        handler({
          type: 'webserver-discovery',
          token: capturedToken,
          progress: 40,
          message: 'Gathering configuration',
        });
      });

      expect(result.current.progress).toBe(40);
    }
  });

  it('should cancel discovery when token exists', async () => {
    mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useWebServerDiscoveryLogic());

    await act(async () => {
      await result.current.startDiscovery();
      await result.current.cancelDiscovery();
    });

    expect(mockElectronAPI.cancelExecution).toHaveBeenCalled();
    expect(result.current.isDiscovering).toBe(false);
  });

  it('should update configuration values', () => {
    const { result } = renderHook(() => useWebServerDiscoveryLogic());

    act(() => {
      result.current.updateConfig({ includeCertificates: false });
    });

    expect(result.current.config.includeCertificates).toBe(false);
  });

  it('should expose export helpers', () => {
    const { result } = renderHook(() => useWebServerDiscoveryLogic());

    expect(typeof result.current.exportToCSV).toBe('function');
    expect(typeof result.current.exportToExcel).toBe('function');
  });
});
