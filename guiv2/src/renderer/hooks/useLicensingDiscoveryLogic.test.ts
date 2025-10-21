/**
 * Unit Tests for useLicensingDiscoveryLogic Hook
 * Tests core business logic for licensing discovery functionality
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';
import { useLicensingDiscoveryLogic } from './useLicensingDiscoveryLogic';

type ProgressCallback = (data: any) => void;

const mockExecuteModule = jest.fn<(args?: any) => Promise<any>>();
const mockCancelExecution = jest.fn<(token?: string) => Promise<void>>();
const mockOnProgress = jest.fn<(cb: ProgressCallback) => () => void>();

// Mock electron API
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

describe('useLicensingDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: {},
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      expect(result.current).toBeDefined();
      expect(result.current.isDiscovering).toBe(false);
    });

    it('should initialize with null result', () => {
      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      expect(result.current.result).toBeNull();
    });

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      expect(result.current.error).toBeNull();
    });
  });

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'Discovery failed';
      mockExecuteModule.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should consume progress updates', async () => {
      let progressHandler: ProgressCallback | undefined;
      let capturedToken: string | undefined;
      mockOnProgress.mockImplementation((cb: ProgressCallback) => {
        progressHandler = cb;
        return jest.fn();
      });

      mockExecuteModule.mockImplementationOnce(async (args: any) => {
        capturedToken = args?.parameters?.CancellationToken;
        return { success: true, data: {} };
      });

      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(mockOnProgress).toHaveBeenCalled();
      if (progressHandler && capturedToken) {
        const handler = progressHandler;

        act(() => {
          handler({
            type: 'licensing-discovery',
            token: capturedToken,
            current: 20,
            total: 100,
            message: 'Processing...',
            percentage: 20,
          });
        });

        expect(result.current.progress.current).toBe(20);
        expect(result.current.progress.percentage).toBe(20);
      }
    });
  });

  describe('Cancellation', () => {
    it('should cancel discovery when token exists', async () => {
      mockCancelExecution.mockResolvedValueOnce(undefined);

      // Make discovery take longer so we can cancel it
      mockExecuteModule.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ success: true, data: {} }), 100);
        });
      });

      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      // Start discovery (don't await completion)
      act(() => {
        result.current.startDiscovery();
      });

      // Cancel while it's running
      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(mockCancelExecution).toHaveBeenCalled();
      expect(result.current.isDiscovering).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should allow config updates', () => {
      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      act(() => {
        result.current.updateConfig({ tenantId: 'tenant-456' });
      });

      expect(result.current.config.tenantId).toBe('tenant-456');
    });
  });

  describe('Export', () => {
    it('should expose export utilities', () => {
      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      expect(typeof result.current.exportToCSV).toBe('function');
      expect(typeof result.current.exportToExcel).toBe('function');
    });
  });

  describe('UI State', () => {
    it('should update tab selection', () => {
      const { result } = renderHook(() => useLicensingDiscoveryLogic());

      act(() => {
        result.current.setActiveTab('licenses');
      });

      expect(result.current.activeTab).toBe('licenses');
    });
  });
});
